import axios, { AxiosInstance } from "axios";
import type {
  ParasutConfig,
  ParasutCustomerInput,
  ParasutCreateInvoiceInput,
  ParasutTokenResponse,
} from "./types";

/**
 * Slide-window rate limiter to guarantee <= 10 requests per 10 seconds.
 */
class ParasutRateLimiter {
  private timestamps: number[] = [];
  private maxRequests = 9; // leave 1 buffer under the 10 limit
  private windowMs = 10_000;

  async throttle(): Promise<void> {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    if (this.timestamps.length >= this.maxRequests) {
      const oldest = this.timestamps[0];
      const waitTime = this.windowMs - (now - oldest) + 100;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.throttle();
    }

    this.timestamps.push(Date.now());
  }
}

const rateLimiter = new ParasutRateLimiter();

export class ParasutClient {
  private config: ParasutConfig;
  private token: string | null = null;
  private tokenExpiresAt = 0;
  private baseUrl: string;

  constructor(config: ParasutConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === "sandbox"
        ? "https://api.parasut.com" // Parasut uses same OAuth/API host with sandbox credentials or test company
        : "https://api.parasut.com";
  }

  /**
   * 1. OAuth2 Authentication & Token Cache
   */
  private async getValidToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (this.token && this.tokenExpiresAt > now + 300) {
      return this.token;
    }

    if (!this.config.clientId || !this.config.clientSecret || !this.config.username || !this.config.password) {
      throw new Error("بيانات مصادقة باراشوت غير مكتملة (ClientId, ClientSecret, Username, Password).");
    }

    await rateLimiter.throttle();

    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("client_id", this.config.clientId.trim());
    params.append("client_secret", this.config.clientSecret.trim());
    params.append("username", this.config.username.trim());
    params.append("password", this.config.password.trim());
    params.append("redirect_uri", "urn:ietf:wg:oauth:2.0:oob");

    try {
      const res = await axios.post<ParasutTokenResponse>(`${this.baseUrl}/oauth/token`, params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        timeout: 15000,
      });

      this.token = res.data.access_token;
      this.tokenExpiresAt = now + (res.data.expires_in || 7200);
      return this.token;
    } catch (err: any) {
      const detail = err.response?.data?.error_description || err.response?.data?.error || err.message;
      throw new Error(`فشل الحصول على توكن الوصول من باراشوت: ${detail}`);
    }
  }

  /**
   * Headers helper
   */
  private async authHeaders(): Promise<Record<string, string>> {
    const token = await this.getValidToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private apiBase(): string {
    const cid = (this.config.companyId || "").trim();
    if (!cid) {
      throw new Error("معرف الشركة (Company ID) لباراشوت غير محدد.");
    }
    return `${this.baseUrl}/v4/${cid}`;
  }

  /**
   * 2. Check existing contact or create new customer
   */
  async getOrCreateCustomer(customer: ParasutCustomerInput): Promise<string> {
    const headers = await this.authHeaders();
    await rateLimiter.throttle();

    const email = (customer.email || "").trim().toLowerCase();

    // 2.1 Search by email
    if (email) {
      try {
        const searchRes = await axios.get(`${this.apiBase()}/contacts`, {
          headers,
          params: { "filter[email]": email },
          timeout: 15000,
        });

        const contacts = searchRes.data?.data;
        if (Array.isArray(contacts) && contacts.length > 0) {
          return contacts[0].id;
        }
      } catch (err: any) {
        console.warn("[ParasutClient.getOrCreateCustomer search warning]:", err.message);
      }
    }

    // 2.2 Create new contact
    await rateLimiter.throttle();
    const isAbroad =
      customer.isAbroad ??
      (customer.country ? customer.country.toLowerCase() !== "turkey" && customer.country.toLowerCase() !== "tr" : true);

    const postBody = {
      data: {
        type: "contacts",
        attributes: {
          name: customer.name || "Foreign Tourist / Guest",
          email: customer.email || "guest@lonaliza.com",
          contact_type: "person",
          tax_number: customer.taxNumber || (isAbroad ? "11111111111" : "11111111111"),
          tax_office: isAbroad ? "Yurtdisi" : customer.taxOffice || "VergiDairesi",
          district: customer.district || "Istanbul",
          city: customer.city || "Istanbul",
          country: customer.country || "France",
          address: customer.address || "International Client",
          phone: customer.phone || "+905000000000",
          is_abroad: isAbroad,
          account_type: "customer",
        },
      },
    };

    try {
      const createRes = await axios.post(`${this.apiBase()}/contacts`, postBody, {
        headers,
        timeout: 15000,
      });
      return createRes.data?.data?.id;
    } catch (err: any) {
      const detail = JSON.stringify(err.response?.data || err.message);
      throw new Error(`فشل إنشاء عميل في باراشوت: ${detail}`);
    }
  }

  /**
   * 3. Create Draft Sales Invoice
   */
  async createSalesInvoice(input: ParasutCreateInvoiceInput): Promise<string> {
    const headers = await this.authHeaders();
    await rateLimiter.throttle();

    const today = new Date().toISOString().split("T")[0];
    const defaultProductId = this.config.defaultProductId || undefined;

    const detailsData = input.items.map((item) => {
      const itemDetail: any = {
        type: "sales_invoice_details",
        attributes: {
          quantity: item.quantity || 1,
          unit_price: Number(item.unitPrice || 0),
          vat_rate: item.vatRate ?? 0,
          discount_type: item.discountType || "percentage",
          discount_value: item.discountValue || 0,
          description: item.description || `Uluslararasi Rezervasyon Hizmeti (${input.pnr})`,
        },
      };

      const prodId = item.productId || defaultProductId;
      if (prodId) {
        itemDetail.relationships = {
          product: {
            data: { id: prodId, type: "products" },
          },
        };
      }

      return itemDetail;
    });

    const postBody = {
      data: {
        type: "sales_invoices",
        attributes: {
          item_type: "invoice",
          description: input.description || `Turizm Rezervasyon - PNR: ${input.pnr}`,
          issue_date: input.issueDate || today,
          due_date: input.dueDate || today,
          currency: input.currency || "USD",
          exchange_rate: input.exchangeRate || 1.0,
          withholding_rate: 0,
          vat_withholding_code: null,
          invoice_series: null,
          order_no: input.pnr,
          order_date: input.issueDate || today,
          is_abroad: input.isAbroad ?? true,
        },
        relationships: {
          contact: {
            data: { id: input.contactId, type: "contacts" },
          },
          details: {
            data: detailsData,
          },
        },
      },
    };

    try {
      const res = await axios.post(`${this.apiBase()}/sales_invoices`, postBody, {
        headers,
        timeout: 15000,
      });
      return res.data?.data?.id;
    } catch (err: any) {
      const detail = JSON.stringify(err.response?.data || err.message);
      throw new Error(`فشل إنشاء مسودة الفاتورة في باراشوت: ${detail}`);
    }
  }

  /**
   * 4. Sign and issue official E-Arşiv
   */
  async signEArchive(
    salesInvoiceId: string,
    options?: {
      vatExemptionCode?: string;
      vatExemptionReason?: string;
      note?: string;
    }
  ): Promise<{ jobId: string }> {
    const headers = await this.authHeaders();
    await rateLimiter.throttle();

    const postBody = {
      data: {
        type: "e_archives",
        attributes: {
          vat_withholding_head_code: null,
          vat_exemption_reason_code: options?.vatExemptionCode || this.config.vatExemptionReasonCode || "302",
          vat_exemption_reason:
            options?.vatExemptionReason ||
            this.config.vatExemptionReason ||
            "3065 sayili KDVK 11/1-a ve 12/2 maddeleri uyarinca Hizmet Ihracati",
          note:
            options?.note ||
            this.config.note ||
            "Hizmet yurt disinda ifa edilmis ve yurt disinda yararlanilmistir. KDV kapsami disindadir.",
          excise_duty_codes: {},
        },
        relationships: {
          sales_invoice: {
            data: { id: salesInvoiceId, type: "sales_invoices" },
          },
        },
      },
    };

    try {
      const res = await axios.post(`${this.apiBase()}/e_archives`, postBody, {
        headers,
        timeout: 20000,
      });

      const trackableJob = res.data?.data?.relationships?.trackable_jobs?.data;
      const jobId = Array.isArray(trackableJob) ? trackableJob[0]?.id : trackableJob?.id;

      if (!jobId) {
        throw new Error("لم ترجع باراشوت معرّف المهمة trackable_job بعد طلب e_archives.");
      }

      return { jobId };
    } catch (err: any) {
      const detail = JSON.stringify(err.response?.data || err.message);
      throw new Error(`فشل إطلاق توقيع الفاتورة الرسمية (e_archives): ${detail}`);
    }
  }

  /**
   * 5. Poll Trackable Job until status === 'done'
   */
  async pollTrackableJob(jobId: string, maxAttempts = 25, intervalMs = 2000): Promise<boolean> {
    const headers = await this.authHeaders();

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, intervalMs));
      await rateLimiter.throttle();

      try {
        const res = await axios.get(`${this.apiBase()}/trackable_jobs/${jobId}`, {
          headers,
          timeout: 15000,
        });

        const status = res.data?.data?.attributes?.status;
        if (status === "done") {
          return true;
        }

        if (status === "error") {
          const errors = JSON.stringify(res.data?.data?.attributes?.errors || []);
          throw new Error(`فشلت مهمة التوقيع الرسمية في باراشوت: ${errors}`);
        }
      } catch (err: any) {
        if (err.message.includes("فشلت مهمة التوقيع")) throw err;
        console.warn(`[ParasutClient.pollTrackableJob attempt ${i + 1} warn]:`, err.message);
      }
    }

    throw new Error(`انتهت مهلة انتظار اعتماد الفاتورة لدى باراشوت (تجاوز ${maxAttempts * (intervalMs / 1000)} ثانية).`);
  }

  /**
   * 6. Retrieve E-Archive Details (Invoice Number & ETTN UUID)
   */
  async getEArchiveDetails(salesInvoiceId: string): Promise<{
    eArchiveId: string;
    invoiceNo: string;
    uuid: string;
  }> {
    const headers = await this.authHeaders();
    await rateLimiter.throttle();

    try {
      const res = await axios.get(`${this.apiBase()}/sales_invoices/${salesInvoiceId}?include=active_e_document`, {
        headers,
        timeout: 15000,
      });

      const included = res.data?.included;
      const eDoc = Array.isArray(included) ? included.find((x: any) => x.type === "e_archives") : null;

      if (!eDoc) {
        throw new Error("لم يتم العثور على وثيقة e_archives المرتبطة بهذه الفاتورة في باراشوت.");
      }

      return {
        eArchiveId: eDoc.id,
        invoiceNo: eDoc.attributes?.invoice_no || "",
        uuid: eDoc.attributes?.uuid || "",
      };
    } catch (err: any) {
      const detail = JSON.stringify(err.response?.data || err.message);
      throw new Error(`فشل استرجاع تفاصيل الوثيقة الرسمية من باراشوت: ${detail}`);
    }
  }

  /**
   * 7. Download Signed E-Arşiv PDF (with HTTP 204 retry handling)
   */
  async downloadSignedPdf(
    eArchiveId: string,
    maxAttempts = 15,
    intervalMs = 2000
  ): Promise<{ url: string; pdfBuffer: Buffer }> {
    const headers = await this.authHeaders();

    for (let i = 0; i < maxAttempts; i++) {
      await rateLimiter.throttle();

      try {
        const res = await axios.get(`${this.apiBase()}/e_archives/${eArchiveId}/pdf`, {
          headers,
          timeout: 15000,
          validateStatus: (status) => status === 200 || status === 204,
        });

        if (res.status === 204) {
          // File is still being prepared by Parasut/GİB, wait and retry
          await new Promise((r) => setTimeout(r, intervalMs));
          continue;
        }

        if (res.status === 200 && res.data?.data?.attributes?.url) {
          const downloadUrl = res.data.data.attributes.url;

          // Immediately download binary before 1-hour AWS S3 signed URL expires
          const download = await axios.get(downloadUrl, {
            responseType: "arraybuffer",
            timeout: 30000,
          });

          return {
            url: downloadUrl,
            pdfBuffer: Buffer.from(download.data),
          };
        }
      } catch (err: any) {
        console.warn(`[ParasutClient.downloadSignedPdf attempt ${i + 1} warn]:`, err.message);
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }

    throw new Error("انتهت مهلة استلام ملف الـ PDF الرسمي من باراشوت (استمرت الاستجابة بكود 204).");
  }

  /**
   * 8. Test Connection
   */
  async testConnection(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const start = Date.now();

    try {
      const headers = await this.authHeaders();
      await rateLimiter.throttle();

      const res = await axios.get(`${this.apiBase()}/contacts`, {
        headers,
        params: { "page[size]": 1 },
        timeout: 15000,
      });

      const latencyMs = Date.now() - start;
      const ok = res.status === 200;

      return {
        ok,
        message: `تم الاتصال بنجاح بـ Paraşüt API v4 (بيئة ${
          this.config.environment === "sandbox" ? "ساندبوكس" : "الإنتاج الرسمية"
        }) - زمن الاستجابة ${latencyMs}ms.`,
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      const detail = err.response?.data?.error_description || err.response?.data?.error || err.message;
      return {
        ok: false,
        message: `فشل الاتصال بـ باراشوت: ${detail} (${latencyMs}ms)`,
        latencyMs,
      };
    }
  }
}
