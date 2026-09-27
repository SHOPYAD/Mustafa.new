\# Paraşüt API v4: التوثيق البرمجي الكامل والمستخرج مباشرة من المنصة الرسمية  
\*\*المصدر المباشر:\*\* الموقع الرسمي لتوثيق مطوري باراشوت (\[apidocs.parasut.com\](https://apidocs.parasut.com/))    
\*\*تاريخ الاستخراج الحي:\*\* سبتمبر 2026    
\*\*المعيار:\*\* JSON:API Specification (v1.0) / RESTful API    
\*\*الهدف:\*\* التكامل البرمجي التلقائي لإصدار الفواتير السياحية، توقيعها إلكترونياً (e-Arşiv / e-Fatura)، سحب الـ PDF الرسمي، وإرساله للعميل.

\---

\#\# 1\. الإعدادات العامة وعناوين الـ API (General Information & Base URLs)

\- \*\*الرابط الأساسي (Base URL):\*\* \`https://api.parasut.com\`  
\- \*\*رابط واجهة برمجة الإصدار الرابع (V4 Base Path):\*\* \`https://api.parasut.com/v4/{company\_id}\`  
  \* \`{company\_id}\`: هو الرقم التعريفي للشركة داخل قاعدة بيانات باراشوت (مثل \`12345\`).  
\- \*\*ترويسات الطلب الإلزامية (Request Headers):\*\*  
  \* \`Content-Type: application/json\` أو \`application/vnd.api+json\`  
  \* \`Accept: application/json\`  
  \* \`Authorization: Bearer {access\_token}\`  
\- \*\*معدل الطلبات المسموح (Rate Limiting):\*\*  
  \* يُسمح بحد أقصى \*\*10 طلبات لكل 10 ثوانٍ\*\* (10 requests per 10 seconds).

\---

\#\# 2\. المصادقة والترخيص (Authentication & OAuth2)

تستخدم منصة باراشوت بروتوكول OAuth2 لتوليد رموز الوصول. مدة صلاحية الرمز \*\*ساعتان (7200 ثانية)\*\*.

\- \*\*نقطة النهاية (Endpoint):\*\* \`POST https://api.parasut.com/oauth/token\`

\#\#\# أ. الحصول على الرمز عبر اسم المستخدم وكلمة المرور (grant\_type=password)  
تُستخدم هذه الطريقة في الأنظمة الخلفية المؤتمتة (Backend Services):  
\`\`\`bash  
curl \-F grant\_type=password      \-F client\_id=CLIENT\_ID      \-F client\_secret=CLIENT\_SECRET      \-F username=YOUREMAIL      \-F password=YOURPASSWORD      \-F redirect\_uri=urn:ietf:wg:oauth:2.0:oob      \-X POST https://api.parasut.com/oauth/token  
\`\`\`

\#\#\# ب. تحديث الرمز قبل انتهائه (grant\_type=refresh\_token)  
\`\`\`bash  
curl \-F grant\_type=refresh\_token      \-F client\_id=CLIENT\_ID      \-F client\_secret=CLIENT\_SECRET      \-F refresh\_token=REFRESH\_TOKEN      \-X POST https://api.parasut.com/oauth/token  
\`\`\`

\#\#\# ج. هيكل استجابة المصادقة (JSON Response):  
\`\`\`json  
{  
  "access\_token": "XYZXYZXYZ...",  
  "token\_type": "bearer",  
  "expires\_in": 7200,  
  "refresh\_token": "ABCABCABC..."  
}  
\`\`\`

\---

\#\# 3\. إدارة العملاء (Contacts API)

قبل إنشاء الفاتورة، يجب التحقق من وجود العميل أو إنشاؤه للحصول على معرف العميل (\`contact\_id\`).

\#\#\# أ. البحث عن عميل مسجل مسبقاً:  
\- \*\*نقطة النهاية:\*\* \`GET https://api.parasut.com/v4/{company\_id}/contacts\`  
\- \*\*المعلمات:\*\* \`?filter\[email\]={email}\` أو \`?filter\[tax\_number\]={tax\_number}\`

\#\#\# ب. إنشاء عميل جديد (Create Contact):  
\- \*\*نقطة النهاية:\*\* \`POST https://api.parasut.com/v4/{company\_id}/contacts\`  
\- \*\*هيكل الطلب (JSON:API):\*\*  
\`\`\`json  
{  
  "data": {  
    "type": "contacts",  
    "attributes": {  
      "name": "اسم العميل أو السائح",  
      "email": "customer@example.com",  
      "contact\_type": "person",  
      "tax\_number": "11111111111",  
      "tax\_office": "Yurtdisi",  
      "district": "Paris",  
      "city": "Paris",  
      "country": "France",  
      "address": "عنوان العميل بالكامل",  
      "phone": "+33123456789",  
      "is\_abroad": true,  
      "account\_type": "customer"  
    }  
  }  
}  
\`\`\`  
\*ملاحظة هامة للسياح الأجانب:\* في حال عدم وجود رقم ضريبي تركي، يتم تحديد \`is\_abroad: true\` وإدخال الرقم الافتراضي المعتمد رسمياً \`11111111111\` مع وضع رقم جواز السفر في العنوان أو الملاحظات.

\---

\#\# 4\. فواتير المبيعات (Sales Invoices API)

إنشاء الفاتورة بصيغتها التجارية تمهيداً للتوقيع والترسيم الإلكتروني.

\- \*\*نقطة النهاية:\*\* \`POST https://api.parasut.com/v4/{company\_id}/sales\_invoices\`  
\- \*\*هيكل الطلب الحرفي (JSON:API Request):\*\*  
\`\`\`json  
{  
  "data": {  
    "type": "sales\_invoices",  
    "attributes": {  
      "item\_type": "invoice",  
      "description": "حجز سياحي دولي \- PNR: GGT-10492",  
      "issue\_date": "2026-09-07",  
      "due\_date": "2026-09-07",  
      "currency": "USD",  
      "exchange\_rate": 34.50,  
      "withholding\_rate": 0,  
      "vat\_withholding\_code": null,  
      "invoice\_series": null,  
      "order\_no": "GGT-10492",  
      "order\_date": "2026-09-07",  
      "is\_abroad": true  
    },  
    "relationships": {  
      "contact": {  
        "data": {  
          "id": "معرف\_العميل\_CONTACT\_ID",  
          "type": "contacts"  
        }  
      },  
      "details": {  
        "data": \[  
          {  
            "type": "sales\_invoice\_details",  
            "attributes": {  
              "quantity": 1,  
              "unit\_price": 100.0,  
              "vat\_rate": 0,  
              "discount\_type": "percentage",  
              "discount\_value": 0,  
              "description": "عمولة وساطة حجز فندق خارجي (باريس \- روما)"  
            },  
            "relationships": {  
              "product": {  
                "data": {  
                  "id": "معرف\_الخدمة\_PRODUCT\_ID",  
                  "type": "products"  
                }  
              }  
            }  
          }  
        \]  
      }  
    }  
  }  
}  
\`\`\`

\---

\#\# 5\. الترسيم والتوقيع الرسمي (Resmileştirme & E-Arşiv)

\#\#\# أ. التحقق من صندوق الوارد للفاتورة الإلكترونية (\`E-Fatura Gelen Kutusu\`):  
قبل إصدار E-Arşiv، يتم التحقق مما إذا كان العميل مسجلاً في منظومة E-Fatura (السياح والأفراد غير مسجلين، ويصدر لهم E-Arşiv دائماً):  
\- \*\*نقطة النهاية:\*\* \`GET https://api.parasut.com/v4/{company\_id}/e\_invoice\_inboxes?filter\[vkn\]={tax\_number}\`

\#\#\# ب. إطلاق طلب التوقيع الرسمي وإنشاء E-Arşiv:  
\- \*\*نقطة النهاية:\*\* \`POST https://api.parasut.com/v4/{company\_id}/e\_archives\`  
\- \*\*هيكل الطلب الحرفي (JSON:API Request):\*\*  
\`\`\`json  
{  
  "data": {  
    "type": "e\_archives",  
    "attributes": {  
      "vat\_withholding\_head\_code": null,  
      "vat\_exemption\_reason\_code": "302",  
      "vat\_exemption\_reason": "3065 sayili KDVK 11/1-a ve 12/2 maddeleri uyarinca Hizmet Ihracati",  
      "note": "Hizmet yurt disinda ifa edilmis ve yurt disinda yararlanilmistir. KDV kapsami disindadir.",  
      "excise\_duty\_codes": {}  
    },  
    "relationships": {  
      "sales\_invoice": {  
        "data": {  
          "id": "معرف\_فاتورة\_المبيعات\_SALES\_INVOICE\_ID",  
          "type": "sales\_invoices"  
        }  
      }  
    }  
  }  
}  
\`\`\`  
\* \*\*الاستجابة:\*\* تُرجع المنصة كائن برمز \`201 Created\` يحتوي على ارتباط بمهمة غير متزامنة من نوع \`trackable\_jobs\`.

\---

\#\# 6\. متابعة حالة المعالجة (TRACKABLE JOB)

عملية التوقيع بالختم المالي والتسجيل لدى مصلحة الضرائب التركية (GİB) تتم بشكل غير متزامن (Asynchronous).

\- \*\*نقطة النهاية:\*\* \`GET https://api.parasut.com/v4/{company\_id}/trackable\_jobs/{job\_id}\`  
\- \*\*حالات المهمة (\`status\`):\*\*  
  \* \`queued\`: قيد الانتظار في الطابور.  
  \* \`running\`: جاري إرسالها وتوقيعها مع GİB.  
  \* \`error\`: فشلت العملية (تُفحص مصفوفة \`errors\` لمعرفة سبب الرفض).  
  \* \`done\`: اكتملت العملية بنجاح وتم توقيع الفاتورة رسمياً.  
\- \*\*مثال الاستجابة الناجحة:\*\*  
\`\`\`json  
{  
  "data": {  
    "id": "job\_id\_98412",  
    "type": "trackable\_jobs",  
    "attributes": {  
      "status": "done",  
      "errors": \[\]  
    },  
    "relationships": null  
  }  
}  
\`\`\`

\---

\#\# 7\. سحب المعرف الرقمي ورابط المستند الرسمي (E-ARŞİV PDF)

\#\#\# أ. الحصول على معرف الـ E-Arşiv ورقم الفاتورة الرسمي:  
\- \*\*نقطة النهاية:\*\* \`GET https://api.parasut.com/v4/{company\_id}/sales\_invoices/{sales\_invoice\_id}?include=active\_e\_document\`  
\- يتم استخراج الحقول التالية من كائن \`included\` الذي يحمل \`type: "e\_archives"\`:  
  \* \`id\`: المعرف الخاص بالوثيقة (\`e\_archive\_id\`).  
  \* \`attributes.invoice\_no\`: رقم الفاتورة الرسمي الصادر من GİB (مثل \`EAR2026000000142\`).  
  \* \`attributes.uuid\`: المعرف الرقمي العالمي الموحد (ETTN).

\#\#\# ب. سحب رابط تحميل الـ PDF الرسمي:  
\- \*\*نقطة النهاية:\*\* \`GET https://api.parasut.com/v4/{company\_id}/e\_archives/{e\_archive\_id}/pdf\`  
\- \*\*معالجة كود HTTP 204:\*\*  
  \* إذا كان الملف لا يزال قيد التجهيز على خوادم باراشوت، يعيد السيرفر رمز \`204 No Content\`.  
  \* يقوم الكود بإعادة المحاولة كل ثانيتين حتى يستلم رمز \`200 OK\`.  
\- \*\*مثال الاستجابة (HTTP 200 OK):\*\*  
\`\`\`json  
{  
  "data": {  
    "id": "123456",  
    "type": "e\_document\_pdfs",  
    "attributes": {  
      "url": "https://parasut-e-document-pdfs.s3.amazonaws.com/...?AWSAccessKeyId=...",  
      "expires\_at": "2026-09-07T14:00:00.000Z"  
    },  
    "relationships": null  
  }  
}  
\`\`\`  
\*تحذير حاسم للمطور:\* الرابط المُرجع على S3 صالح لمدة \*\*ساعة واحدة فقط\*\*. يجب على الكود تنزيل محتوى الملف فوراً (Stream Binary Buffer) وتخزينه في خوادمكم أو إرساله مباشرة كمرفق في بريد العميل.

\---

\#\# 8\. كود تنفيذي متكامل وجاهز للإنتاج (Production Node.js / TypeScript)

\`\`\`typescript  
import axios, { AxiosInstance } from 'axios';

export class ParasutOfficialClient {  
  private http: AxiosInstance;  
  private token: string | null \= null;  
  private tokenExpiresAt \= 0;

  constructor(  
    private companyId: string,  
    private clientId: string,  
    private clientSecret: string,  
    private username: string,  
    private password: string,  
    private baseUrl \= 'https://api.parasut.com'  
  ) {  
    this.http \= axios.create({ baseURL: \`${this.baseUrl}/v4/${this.companyId}\` });  
  }

  // 1\. إدارة جلسة OAuth2  
  private async getValidToken(): Promise\<string\> {  
    const now \= Math.floor(Date.now() / 1000);  
    if (this.token && this.tokenExpiresAt \> now \+ 300\) return this.token;

    const res \= await axios.post(\`${this.baseUrl}/oauth/token\`, {  
      grant\_type: 'password',  
      client\_id: this.clientId,  
      client\_secret: this.clientSecret,  
      username: this.username,  
      password: this.password,  
      redirect\_uri: 'urn:ietf:wg:oauth:2.0:oob',  
    });

    this.token \= res.data.access\_token;  
    this.tokenExpiresAt \= now \+ res.data.expires\_in;  
    return this.token\!;  
  }

  private async authHeaders() {  
    const token \= await this.getValidToken();  
    return {  
      Authorization: \`Bearer ${token}\`,  
      'Content-Type': 'application/json',  
      Accept: 'application/json',  
    };  
  }

  // 2\. فحص أو إنشاء العميل  
  async getOrCreateCustomer(name: string, email: string, country \= 'France', address \= 'Paris'): Promise\<string\> {  
    const headers \= await this.authHeaders();  
    const search \= await this.http.get('/contacts', { headers, params: { 'filter\[email\]': email } });  
    if (search.data?.data?.length \> 0\) return search.data.data\[0\].id;

    const isAbroad \= country.toLowerCase() \!== 'turkey' && country.toLowerCase() \!== 'tr';  
    const created \= await this.http.post(  
      '/contacts',  
      {  
        data: {  
          type: 'contacts',  
          attributes: {  
            name,  
            email,  
            contact\_type: 'person',  
            tax\_number: '11111111111',  
            tax\_office: isAbroad ? 'Yurtdisi' : 'VergiDairesi',  
            country,  
            address,  
            is\_abroad: isAbroad,  
            account\_type: 'customer',  
          },  
        },  
      },  
      { headers }  
    );  
    return created.data.data.id;  
  }

  // 3\. إنشاء مسودة الفاتورة  
  async createInvoice(contactId: string, pnr: string, amount: number, currency: string, rate: number, productId: string) {  
    const headers \= await this.authHeaders();  
    const today \= new Date().toISOString().split('T')\[0\];

    const res \= await this.http.post(  
      '/sales\_invoices',  
      {  
        data: {  
          type: 'sales\_invoices',  
          attributes: {  
            item\_type: 'invoice',  
            description: \`Turizm Rezervasyon \- PNR: ${pnr}\`,  
            issue\_date: today,  
            due\_date: today,  
            currency,  
            exchange\_rate: rate,  
            is\_abroad: true,  
            order\_no: pnr,  
            order\_date: today,  
          },  
          relationships: {  
            contact: { data: { id: contactId, type: 'contacts' } },  
            details: {  
              data: \[  
                {  
                  type: 'sales\_invoice\_details',  
                  attributes: {  
                    quantity: 1,  
                    unit\_price: amount,  
                    vat\_rate: 0,  
                    description: \`Uluslararasi Rezervasyon Hizmeti (${pnr})\`,  
                  },  
                  relationships: {  
                    product: { data: { id: productId, type: 'products' } },  
                  },  
                },  
              \],  
            },  
          },  
        },  
      },  
      { headers }  
    );  
    return res.data.data.id;  
  }

  // 4\. التوقيع والترسيم e-Arşiv ومراقبة الـ Job  
  async signEArchive(invoiceId: string): Promise\<string\> {  
    const headers \= await this.authHeaders();  
    const res \= await this.http.post(  
      '/e\_archives',  
      {  
        data: {  
          type: 'e\_archives',  
          attributes: {  
            vat\_exemption\_reason\_code: '302',  
            vat\_exemption\_reason: 'KDVK 11/1-a ve 12/2 Hizmet Ihracati',  
            note: 'Hizmet yurt disinda ifa edilmistir.',  
          },  
          relationships: {  
            sales\_invoice: { data: { id: invoiceId, type: 'sales\_invoices' } },  
          },  
        },  
      },  
      { headers }  
    );

    const jobId \= res.data?.data?.relationships?.trackable\_jobs?.data?.\[0\]?.id;  
    if (\!jobId) throw new Error('لم يتم إرجاع معرف المهمة trackable\_job');

    // Polling حتى تكتمل المهمة  
    for (let i \= 0; i \< 20; i++) {  
      await new Promise((r) \=\> setTimeout(r, 2000));  
      const job \= await this.http.get(\`/trackable\_jobs/${jobId}\`, { headers });  
      const status \= job.data?.data?.attributes?.status;  
      if (status \=== 'done') return invoiceId;  
      if (status \=== 'error') throw new Error(\`فشل توقيع الفاتورة: ${JSON.stringify(job.data?.data?.attributes?.errors)}\`);  
    }  
    throw new Error('انتهت مهلة انتظار توقيع الفاتورة');  
  }

  // 5\. تحميل ملف الـ PDF الرسمي  
  async downloadSignedPdf(invoiceId: string): Promise\<{ invoiceNo: string; uuid: string; pdfBuffer: Buffer }\> {  
    const headers \= await this.authHeaders();

    // استخراج e\_archive\_id  
    const inv \= await this.http.get(\`/sales\_invoices/${invoiceId}?include=active\_e\_document\`, { headers });  
    const eDoc \= inv.data?.included?.find((x: any) \=\> x.type \=== 'e\_archives');  
    if (\!eDoc) throw new Error('لم يتم العثور على وثيقة e-Arşiv المرتبطة');

    const eArchiveId \= eDoc.id;  
    const invoiceNo \= eDoc.attributes.invoice\_no;  
    const uuid \= eDoc.attributes.uuid;

    // استعلام رابط الـ PDF (معالجة كود 204\)  
    for (let i \= 0; i \< 15; i++) {  
      const pRes \= await this.http.get(\`/e\_archives/${eArchiveId}/pdf\`, {  
        headers,  
        validateStatus: (s) \=\> s \=== 200 || s \=== 204,  
      });

      if (pRes.status \=== 204\) {  
        await new Promise((r) \=\> setTimeout(r, 2000));  
        continue;  
      }

      if (pRes.status \=== 200 && pRes.data?.data?.attributes?.url) {  
        const download \= await axios.get(pRes.data.data.attributes.url, { responseType: 'arraybuffer' });  
        return { invoiceNo, uuid, pdfBuffer: Buffer.from(download.data) };  
      }  
    }  
    throw new Error('انتهت مهلة استلام رابط ملف الـ PDF');  
  }  
}  
\`\`\`  
