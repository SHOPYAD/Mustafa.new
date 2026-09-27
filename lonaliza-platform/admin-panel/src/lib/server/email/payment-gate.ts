import type { InvoiceService } from "@/lib/booking-service";
import type { EmailTemplateKind } from "@/lib/server/email/types";

export type PaymentEmailGate = "paid" | "failed" | "pending";

/** Canonical booking payment state for transactional mail. Never treat checkout-create as paid. */
export function paymentEmailGate(input: {
  status?: unknown;
  payment_status?: unknown;
}): PaymentEmailGate {
  const status = String(input.status || "").trim().toLowerCase();
  const pay = String(input.payment_status || status || "").trim().toLowerCase();
  if (status === "paid" || pay === "paid") return "paid";
  if (
    pay === "failed" ||
    pay === "amount_mismatch" ||
    status === "failed" ||
    pay === "cancelled" ||
    status === "cancelled"
  ) {
    return "failed";
  }
  return "pending";
}

export function isVerifiedPaid(input: {
  status?: unknown;
  payment_status?: unknown;
}): boolean {
  return paymentEmailGate(input) === "paid";
}

/** Service-specific success kinds. Flights never fall back to hotel_success. */
export function successTemplateKinds(service: InvoiceService): EmailTemplateKind[] {
  switch (service) {
    case "flight":
      return ["flight_success", "booking_success"];
    case "hotel":
      return ["hotel_success", "booking_success"];
    case "package":
      return ["package_success", "booking_success"];
    case "tour":
      return ["tour_success", "booking_success"];
    case "transfer":
      return ["transfer_success", "booking_success"];
    case "car":
      return ["car_success", "booking_success"];
    case "visa":
      return ["visa_success", "booking_success"];
    default: {
      const _exhaustive: never = service;
      return _exhaustive;
    }
  }
}

/** Abandoned / unpaid checkout: reminder templates only — never *_success. */
export function pendingTemplateKinds(service: InvoiceService): EmailTemplateKind[] {
  switch (service) {
    case "flight":
      return ["flight_reminder"];
    case "hotel":
      return ["hotel_reminder"];
    case "package":
      return ["package_reminder"];
    case "tour":
      return ["tour_reminder"];
    case "transfer":
      return ["transfer_reminder"];
    case "car":
      return ["car_reminder"];
    case "visa":
      return ["visa_reminder"];
    default: {
      const _exhaustive: never = service;
      return _exhaustive;
    }
  }
}

export function templateKindsForGate(
  service: InvoiceService,
  gate: PaymentEmailGate
): EmailTemplateKind[] {
  if (gate === "paid") return successTemplateKinds(service);
  if (gate === "failed") return pendingTemplateKinds(service);
  return pendingTemplateKinds(service);
}
