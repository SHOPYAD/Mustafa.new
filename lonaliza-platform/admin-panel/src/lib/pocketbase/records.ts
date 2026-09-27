export type EnquiryBookingRecord = {
  id: string;
  type: string;
  status: string;
  service_name?: string;
  destination?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  message?: string;
  user?: string;
  metadata?: Record<string, unknown>;
  ref_code?: string;
  created: string;
  updated: string;
};

export type HotelBookingRecord = {
  id: string;
  user?: string;
  hotel_id: string;
  hotel_name: string;
  hotel_slug: string;
  room_id?: string;
  room_name?: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  guest_names?: string[];
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  notes?: string;
  price: number;
  currency: string;
  provider: string;
  status: string;
  offer_snapshot?: Record<string, unknown>;
  ref_code?: string;
  iyzico_payment_id?: string;
  iyzico_token?: string;
  payment_status?: string;
  charged_amount?: number;
  charged_currency?: string;
  display_amount?: number;
  display_currency?: string;
  fx_rate?: number;
  fx_source?: string;
  fx_at?: string;
  cancel_status?: string;
  cancel_requested_at?: string;
  cancel_reason?: string;
  cancel_fee_amount?: number;
  refund_amount?: number;
  cancel_admin_note?: string;
  cancel_approved_at?: string;
  iyzico_refund_id?: string;
  free_cancellation?: boolean;
  non_refundable?: boolean;
  created: string;
  updated: string;
};

export type CustomerRecord = {
  id: string;
  user?: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  locale?: string;
  created: string;
  updated: string;
};

export function enquiryToApi(row: EnquiryBookingRecord) {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    service_name: row.service_name || null,
    destination: row.destination || null,
    customer_name: row.customer_name,
    customer_email: row.customer_email || null,
    customer_phone: row.customer_phone || null,
    message: row.message || null,
    user_id: row.user || null,
    metadata: row.metadata || {},
    created_at: row.created || new Date().toISOString(),
    updated_at: row.updated || row.created || new Date().toISOString(),
    source: "pocketbase",
  };
}

const FULFILMENT_LABEL_AR: Record<string, string> = {
  awaiting_payment: "بانتظار الدفع",
  supplier_pending: "جارٍ التثبيت لدى المورد",
  supplier_confirmed: "مؤكد لدى المورد",
  voucher_sent: "مؤكد — أُرسل الفوشر",
  supplier_failed: "فشل التثبيت لدى المورد",
  refund_pending: "فشل المورد — استرداد معلّق",
  refunded: "مسترد",
  refund_failed: "فشل الاسترداد — تدخل يدوي",
  cancelled: "ملغى لدى المورد",
};

export function hotelBookingToEnquiry(row: HotelBookingRecord) {
  const snap = (row.offer_snapshot && typeof row.offer_snapshot === "object" ? row.offer_snapshot : {}) as Record<string, unknown>;
  const fulfilment = String(snap.fulfilment_status || "");
  const supplierRef = String(snap.hotel_confirmation_code || snap.supplier_reference || snap.supplier_order_id || "");
  const needsAttention = fulfilment === "supplier_failed" || fulfilment === "refund_pending" || fulfilment === "refund_failed";
  return {
    id: `hotel:${row.id}`,
    type: "hotel",
    status: row.status === "cancelled" ? "resolved" : needsAttention ? "in-progress" : "new",
    service_name: row.hotel_name,
    destination: row.hotel_slug,
    customer_name: row.customer_name,
    customer_email: row.customer_email || null,
    customer_phone: row.customer_phone || null,
    message: [
      row.room_name ? `الغرفة: ${row.room_name}` : "",
      `من ${row.check_in} إلى ${row.check_out}`,
      `${row.adults} بالغ / ${row.children} طفل`,
      row.guest_names?.length ? `الأسماء: ${row.guest_names.join("، ")}` : "",
      row.notes || "",
      `السعر: ${row.currency} ${row.price}`,
      `حالة الدفع: ${row.status}`,
      fulfilment ? `حالة المورد: ${FULFILMENT_LABEL_AR[fulfilment] || fulfilment}${snap.supplier ? ` (${String(snap.supplier)})` : ""}` : "",
      supplierRef ? `رقم تأكيد المورد: ${supplierRef}` : "",
      snap.fulfilment_error ? `خطأ المورد: ${String(snap.fulfilment_error)}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    user_id: row.user || null,
    metadata: {
      hotel_booking_id: row.id,
      payment_status: row.status,
      provider: row.provider,
      supplier: snap.supplier ? String(snap.supplier) : undefined,
      fulfilment_status: fulfilment || undefined,
      supplier_reference: supplierRef || undefined,
      quote_id: snap.quote_id ? String(snap.quote_id) : undefined,
    },
    created_at: row.created || new Date().toISOString(),
    updated_at: row.updated || row.created || new Date().toISOString(),
    source: "pocketbase",
  };
}

export function customerToProfile(row: CustomerRecord) {
  return {
    id: row.id,
    user_id: row.user || row.id,
    full_name: row.name,
    email: row.email || "",
    phone: row.phone || "",
    created_at: row.created || new Date().toISOString(),
    updated_at: row.updated || row.created || new Date().toISOString(),
    source: "pocketbase",
  };
}
