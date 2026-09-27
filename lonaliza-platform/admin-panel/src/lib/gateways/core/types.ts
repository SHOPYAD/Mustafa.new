/**
 * Core types for the unified payment gateway layer.
 *
 * Architectural rule: every gateway adapter MUST return values shaped
 * by the types in this file. Gateway-specific raw responses live inside
 * `rawResponse` for debugging only.
 */

export type GatewayType = 'card' | 'wallet' | 'bnpl' | 'bank' | 'crypto' | 'transfer' | 'cod';

export type PaymentStatus =
  | 'initiated'
  | 'pending'
  | 'requires_action'
  | 'authorized'
  | 'captured'
  | 'paid'
  | 'partially_refunded'
  | 'refunded'
  | 'voided'
  | 'failed'
  | 'cancelled'
  | 'expired';

export type RefundStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled';

export type WebhookEventType =
  | 'payment.created'
  | 'payment.authorized'
  | 'payment.captured'
  | 'payment.paid'
  | 'payment.failed'
  | 'payment.cancelled'
  | 'payment.refunded'
  | 'payment.partially_refunded'
  | 'payment.disputed'
  | 'payment.expired'
  | 'unknown';

export interface GatewayConfigField {
  /** Field key persisted under TenantPaymentSettings.enabledPaymentMethods[].config */
  key: string;
  /** Human label (English). Localisation handled in UI layer. */
  label: string;
  /** Type used by DynamicConfigForm to choose the right widget. */
  type: 'text' | 'password' | 'select' | 'boolean' | 'number' | 'url' | 'multiselect';
  required?: boolean;
  /** Tooltip / helper text rendered below the field. */
  helpText?: string;
  /** Available options for `select` / `multiselect` types. */
  options?: Array<{ value: string; label: string }>;
  /** Marks the field as a secret. UI redacts to `••••` after save. */
  secret?: boolean;
  /** Default value (rarely used; only when sensible). */
  default?: string | number | boolean;
  /** Optional regex validation hint for the UI. Server-side validation uses Zod. */
  pattern?: string;
  /** Placeholder shown in input. */
  placeholder?: string;
  /** Group the field into a section (e.g. "Production", "Webhooks"). */
  group?: string;
}

export interface MoneyAmount {
  /** Amount in MAJOR units (e.g. 10.5 = 10.50 USD). Gateways that need minor units convert internally. */
  amount: number;
  /** ISO 4217 currency code. */
  currency: string;
}

export interface CustomerInfo {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  customerId?: string;
}

export interface BillingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string; // ISO 3166-1 alpha-2
}

export interface PaymentCardParams {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  registerCard?: 0 | 1;
}

export interface CreatePaymentParams extends MoneyAmount {
  /**
   * Internal order/invoice reference (ours, not the gateway's).
   * Echoed back in webhooks to allow correlation.
   */
  orderId: string;
  description?: string;
  customer?: CustomerInfo;
  billingAddress?: BillingAddress;
  paymentCard?: PaymentCardParams;
  /** Where the gateway should send the user after the payment is completed. */
  successUrl?: string;
  failureUrl?: string;
  /** URL the gateway should hit server-to-server with the result. */
  callbackUrl?: string;
  /**
   * Idempotency key used to safely retry the create call without
   * double-charging. Gateway adapters should forward when supported.
   */
  idempotencyKey?: string;
  /**
   * Pass-through metadata persisted alongside the gateway charge.
   * Avoid PII; keep keys short. Stripe limit: 50 keys × 500 chars.
   */
  metadata?: Record<string, string>;
  /** Tenant subdomain — required so adapters can build per-tenant callback URLs. */
  subdomain: string;
  /**
   * Hosted checkout presentation. `embedded` returns an HTML snippet when the
   * gateway supports it (e.g. Iyzico Checkout Form). Defaults to redirect.
   */
  checkoutChannel?: 'redirect' | 'embedded';
}

export interface GatewayPaymentResult {
  /** Gateway-side identifier (charge id / order id / intention id). */
  gatewayId: string;
  /** Echo of our `orderId` for safety. */
  orderId: string;
  status: PaymentStatus;
  /**
   * URL the user must be redirected to. Populated for hosted/3DS/BNPL flows.
   * Null/undefined for direct-API gateways that finalise via JS SDK (e.g. Stripe Elements).
   */
  redirectUrl?: string;
  /** Stripe-style client secret if the gateway uses one. */
  clientSecret?: string;
  /**
   * Decoded HTML for embedded hosted checkout (e.g. Iyzico `checkoutFormContent`
   * after Base64 decode). Safe to send to a trusted client for `dangerouslySetInnerHTML`;
   * do not log in full in production.
   */
  embeddedHtml?: string;
  /** Raw provider response. Persist for support/debugging only — never expose to clients. */
  rawResponse?: unknown;
}

export interface CaptureParams {
  gatewayId: string;
  /** Optional partial capture amount; when omitted, capture full authorized amount. */
  amount?: number;
  currency?: string;
  idempotencyKey?: string;
}

export interface GatewayCaptureResult {
  gatewayId: string;
  status: PaymentStatus;
  capturedAmount: number;
  capturedAt: Date;
  rawResponse?: unknown;
}

export interface RefundParams {
  gatewayId: string;
  /** Partial refund when set; full refund when omitted. */
  amount?: number;
  currency?: string;
  reason?: string;
  idempotencyKey?: string;
  metadata?: Record<string, string>;
}

export interface GatewayRefundResult {
  success: boolean;
  gatewayRefundId: string;
  status: RefundStatus;
  totalRefunded: number;
  refundedAt: Date;
  rawResponse?: unknown;
}

export interface VoidParams {
  gatewayId: string;
  idempotencyKey?: string;
}

export interface GatewayVoidResult {
  success: boolean;
  status: PaymentStatus;
  voidedAt: Date;
  rawResponse?: unknown;
}

export interface WebhookEvent {
  /** Provider-side event id (e.g. Stripe's evt_xxx). Used for idempotent processing. */
  id: string;
  type: WebhookEventType;
  /** Adapter `kind` (e.g. 'stripe', 'moyasar'). */
  gateway: string;
  /** Our internal id, when present in the event. */
  orderId?: string;
  /** Provider-side payment id. */
  gatewayPaymentId?: string;
  status?: PaymentStatus;
  amount?: number;
  currency?: string;
  /** Wall-clock event timestamp from the provider. */
  timestamp: Date;
  /** Full raw payload for forensic logging. */
  rawPayload: unknown;
}

export interface GatewayTestResult {
  success: boolean;
  message: string;
  durationMs: number;
  /** Optional details (e.g. account name, mode). Avoid leaking secrets. */
  details?: Record<string, unknown>;
}
