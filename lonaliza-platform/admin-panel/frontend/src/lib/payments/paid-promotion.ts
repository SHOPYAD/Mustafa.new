export type IyzicoPaidSource = "webhook" | "callback" | "threeds" | "refresh";

export type IyzicoPaymentState = {
  status: string;
  paymentStatus: string;
};

/**
 * Paid promotion is fail-closed: only a signed iyzico merchant webhook may
 * move a booking to `paid`. Callback / 3DS complete / admin refresh persist
 * ids and stay `pending_payment` so abandoned ACS sessions cannot fire
 * "حجز ناجح" emails.
 */
export function resolveIyzicoPaymentState(input: {
  alreadyPaid: boolean;
  currentStatus?: string;
  currentPaymentStatus?: string;
  retrievedPaid: boolean;
  pendingReview: boolean;
  retrieveOk: boolean;
  amountMatched: boolean;
  webhookStatus?: string;
  source?: IyzicoPaidSource;
}): IyzicoPaymentState {
  if (input.alreadyPaid) {
    return { status: "paid", paymentStatus: "paid" };
  }

  const webhookStatus = String(input.webhookStatus || "").toUpperCase();
  const fromWebhook = input.source === "webhook";
  const webhookSuccess = fromWebhook && webhookStatus === "SUCCESS";
  const webhookFailure = fromWebhook && webhookStatus === "FAILURE";
  const amountOk = input.amountMatched !== false;
  const reviewCleared = Boolean(input.pendingReview && webhookSuccess);

  if (webhookFailure) {
    return { status: "pending_payment", paymentStatus: "failed" };
  }

  if (fromWebhook && (input.retrievedPaid || reviewCleared) && amountOk) {
    return { status: "paid", paymentStatus: "paid" };
  }

  if (input.pendingReview) {
    return { status: "pending_payment", paymentStatus: "pending_review" };
  }

  if (!amountOk && (input.retrievedPaid || webhookSuccess)) {
    return { status: "pending_payment", paymentStatus: "amount_mismatch" };
  }

  if (input.retrievedPaid || webhookSuccess) {
    return { status: "pending_payment", paymentStatus: "awaiting_webhook" };
  }

  if (input.source === "threeds" || input.source === "callback") {
    return {
      status: "pending_payment",
      paymentStatus: input.retrieveOk ? "awaiting_webhook" : "pending_payment",
    };
  }

  if (!input.retrieveOk) {
    return {
      status: "pending_payment",
      paymentStatus: input.currentPaymentStatus || "pending_payment",
    };
  }

  return { status: "pending_payment", paymentStatus: "failed" };
}

export function isWebhookPaidPromotion(
  source: IyzicoPaidSource | undefined,
  nextStatus: string
): boolean {
  return source === "webhook" && nextStatus === "paid";
}
