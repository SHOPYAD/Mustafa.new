import type {
  CaptureParams,
  CreatePaymentParams,
  GatewayCaptureResult,
  GatewayConfigField,
  GatewayPaymentResult,
  GatewayRefundResult,
  GatewayTestResult,
  GatewayType,
  GatewayVoidResult,
  PaymentStatus,
  RefundParams,
  VoidParams,
  WebhookEvent,
} from './types';

/**
 * Contract every payment gateway adapter must implement.
 *
 * Lifecycle methods are split into:
 *   - REQUIRED: createPayment, refundPayment, parseWebhookEvent
 *   - VERIFICATION: verifyWebhook OR verifyWebhookAsync (one is required)
 *   - OPTIONAL: capturePayment, voidPayment, getPaymentStatus, testConnection
 */
export interface PaymentGateway {
  /** Stable machine identifier ('stripe', 'moyasar', 'iyzico', …). */
  readonly kind: string;
  /** Human-readable provider name. */
  readonly displayName: string;
  /** Family of payment instrument this gateway represents. */
  readonly type: GatewayType;
  /** ISO 3166-1 alpha-2 codes. Use `['*']` for global gateways. */
  readonly supportedCountries: readonly string[];
  /** ISO 4217 codes. Adapters must throw `CurrencyNotSupportedError` for unknown currencies. */
  readonly supportedCurrencies: readonly string[];
  /** Schema describing what tenants must provide in TenantPaymentSettings.config. */
  readonly configFields: readonly GatewayConfigField[];

  /**
   * Initiate a new payment.
   * MUST be idempotent if the caller passes `idempotencyKey`.
   */
  createPayment(params: CreatePaymentParams): Promise<GatewayPaymentResult>;

  /** Capture a previously authorized payment (manual capture flow). */
  capturePayment?(params: CaptureParams): Promise<GatewayCaptureResult>;

  /** Refund a captured payment, full or partial. */
  refundPayment(params: RefundParams): Promise<GatewayRefundResult>;

  /** Cancel an authorized but uncaptured payment. */
  voidPayment?(params: VoidParams): Promise<GatewayVoidResult>;

  /**
   * Verify webhook authenticity using HMAC or shared secret.
   * Use this OR `verifyWebhookAsync`, never both.
   */
  verifyWebhook?(rawBody: string, signature: string, headers?: Record<string, string>): boolean;

  /**
   * Async webhook verification (e.g. PayPal calls back to the provider to verify).
   */
  verifyWebhookAsync?(
    rawBody: string,
    signature: string,
    headers?: Record<string, string>,
  ): Promise<boolean>;

  /** Parse a verified webhook payload into our normalized WebhookEvent shape. */
  parseWebhookEvent(payload: unknown, headers?: Record<string, string>): WebhookEvent;

  /** Optional read-after-create lookup. Useful for reconciliation. */
  getPaymentStatus?(gatewayId: string): Promise<PaymentStatus>;

  /**
   * Optional connection probe used by the "Test connection" button in the UI.
   * Should issue ONE small read-only request and return success/failure quickly.
   */
  testConnection?(): Promise<GatewayTestResult>;
}
