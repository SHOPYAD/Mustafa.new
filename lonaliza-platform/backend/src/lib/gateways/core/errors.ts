/**
 * Typed payment errors.
 *
 * Why a hierarchy?
 *   - Resolvers can `instanceof` check to map to localized user messages.
 *   - Hooks (audit log, sentry) can branch on `code` for severity.
 *   - Re-throwing keeps the original gateway response in `cause` for support.
 */

export type PaymentErrorCode =
  | 'GATEWAY_NOT_CONFIGURED'
  | 'GATEWAY_NOT_REGISTERED'
  | 'GATEWAY_NOT_ENTITLED'
  | 'INVALID_REQUEST'
  | 'INVALID_WEBHOOK'
  | 'WEBHOOK_VERIFICATION_FAILED'
  | 'AUTHENTICATION_FAILED'
  | 'AUTHORIZATION_FAILED'
  | 'CARD_DECLINED'
  | 'INSUFFICIENT_FUNDS'
  | 'EXPIRED_CARD'
  | 'INCORRECT_CVC'
  | 'PROCESSING_ERROR'
  | 'RATE_LIMITED'
  | 'GATEWAY_API_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'PAYMENT_ABORTED_BY_HOOK'
  | 'PAYMENT_ALREADY_REFUNDED'
  | 'AMOUNT_TOO_SMALL'
  | 'AMOUNT_TOO_LARGE'
  | 'CURRENCY_NOT_SUPPORTED'
  | 'COUNTRY_NOT_SUPPORTED'
  | 'INTERNAL_ERROR';

export interface PaymentErrorOptions {
  code: PaymentErrorCode;
  /** Adapter `kind` (e.g. 'stripe'). Helps debugging. */
  gateway?: string;
  /** Original error or raw provider response. */
  cause?: unknown;
  /** Provider's own error code, when present. */
  providerCode?: string;
  /** Whether the operation is safe to retry without side effects. */
  retryable?: boolean;
  /** HTTP status from the provider, if applicable. */
  httpStatus?: number;
  /** Extra structured metadata for logging. NEVER include secrets. */
  meta?: Record<string, unknown>;
}

export class PaymentError extends Error {
  public readonly code: PaymentErrorCode;
  public readonly gateway?: string;
  public readonly providerCode?: string;
  public readonly retryable: boolean;
  public readonly httpStatus?: number;
  public readonly meta?: Record<string, unknown>;
  public readonly cause?: unknown;

  constructor(message: string, options: PaymentErrorOptions) {
    super(message);
    this.name = 'PaymentError';
    this.code = options.code;
    this.gateway = options.gateway;
    this.providerCode = options.providerCode;
    this.retryable = options.retryable ?? false;
    this.httpStatus = options.httpStatus;
    this.meta = options.meta;
    this.cause = options.cause;
  }

  /**
   * Safe shape for client responses (NO `cause`, NO `meta` containing secrets).
   * Resolvers should use this when forwarding to GraphQL.
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      gateway: this.gateway,
      providerCode: this.providerCode,
      retryable: this.retryable,
    };
  }
}

export class GatewayNotConfiguredError extends PaymentError {
  constructor(gateway: string, missingField?: string) {
    super(
      missingField
        ? `Gateway "${gateway}" is missing required configuration: ${missingField}`
        : `Gateway "${gateway}" is not configured for this tenant`,
      { code: 'GATEWAY_NOT_CONFIGURED', gateway, retryable: false },
    );
    this.name = 'GatewayNotConfiguredError';
  }
}

export class GatewayNotRegisteredError extends PaymentError {
  constructor(kind: string) {
    super(`No payment gateway is registered for kind "${kind}"`, {
      code: 'GATEWAY_NOT_REGISTERED',
      gateway: kind,
      retryable: false,
    });
    this.name = 'GatewayNotRegisteredError';
  }
}

export class GatewayNotEntitledError extends PaymentError {
  constructor(kind: string, planName?: string) {
    super(
      planName
        ? `Gateway "${kind}" is not included in plan "${planName}". Upgrade required.`
        : `Gateway "${kind}" is not enabled for this tenant's plan`,
      { code: 'GATEWAY_NOT_ENTITLED', gateway: kind, retryable: false, meta: { planName } },
    );
    this.name = 'GatewayNotEntitledError';
  }
}

export class InvalidRequestError extends PaymentError {
  constructor(message: string, options: Partial<PaymentErrorOptions> = {}) {
    super(message, { ...options, code: 'INVALID_REQUEST', retryable: false });
    this.name = 'InvalidRequestError';
  }
}

export class InvalidWebhookError extends PaymentError {
  constructor(gateway: string, reason: string, cause?: unknown) {
    super(`Invalid webhook from ${gateway}: ${reason}`, {
      code: 'INVALID_WEBHOOK',
      gateway,
      cause,
      retryable: false,
    });
    this.name = 'InvalidWebhookError';
  }
}

export class WebhookVerificationFailedError extends PaymentError {
  constructor(gateway: string, cause?: unknown) {
    super(`Webhook signature verification failed for ${gateway}`, {
      code: 'WEBHOOK_VERIFICATION_FAILED',
      gateway,
      cause,
      retryable: false,
    });
    this.name = 'WebhookVerificationFailedError';
  }
}

export class AuthenticationError extends PaymentError {
  constructor(gateway: string, message = 'Authentication with payment gateway failed') {
    super(message, { code: 'AUTHENTICATION_FAILED', gateway, retryable: false });
    this.name = 'AuthenticationError';
  }
}

export class CardDeclinedError extends PaymentError {
  constructor(gateway: string, providerCode?: string, message?: string) {
    super(message || 'The card was declined', {
      code: 'CARD_DECLINED',
      gateway,
      providerCode,
      retryable: false,
    });
    this.name = 'CardDeclinedError';
  }
}

export class InsufficientFundsError extends PaymentError {
  constructor(gateway: string) {
    super('Insufficient funds', { code: 'INSUFFICIENT_FUNDS', gateway, retryable: false });
    this.name = 'InsufficientFundsError';
  }
}

export class RateLimitedError extends PaymentError {
  constructor(gateway: string, retryAfterSeconds?: number) {
    super(
      retryAfterSeconds
        ? `Gateway ${gateway} rate-limited; retry after ${retryAfterSeconds}s`
        : `Gateway ${gateway} rate-limited`,
      {
        code: 'RATE_LIMITED',
        gateway,
        retryable: true,
        meta: { retryAfterSeconds },
      },
    );
    this.name = 'RateLimitedError';
  }
}

export class GatewayApiError extends PaymentError {
  constructor(
    gateway: string,
    message: string,
    options: Partial<PaymentErrorOptions> = {},
  ) {
    super(`[${gateway}] ${message}`, {
      ...options,
      code: 'GATEWAY_API_ERROR',
      gateway,
      retryable: options.retryable ?? false,
    });
    this.name = 'GatewayApiError';
  }
}

export class NetworkError extends PaymentError {
  constructor(gateway: string, cause?: unknown) {
    super(`Network error contacting ${gateway}`, {
      code: 'NETWORK_ERROR',
      gateway,
      cause,
      retryable: true,
    });
    this.name = 'NetworkError';
  }
}

export class PaymentAbortedByHookError extends PaymentError {
  constructor(reason: string) {
    super(`Payment aborted by hook: ${reason}`, {
      code: 'PAYMENT_ABORTED_BY_HOOK',
      retryable: false,
    });
    this.name = 'PaymentAbortedByHookError';
  }
}

export class CurrencyNotSupportedError extends PaymentError {
  constructor(gateway: string, currency: string, supported: string[]) {
    super(
      `Currency ${currency} is not supported by ${gateway}. Supported: ${supported.join(', ')}`,
      {
        code: 'CURRENCY_NOT_SUPPORTED',
        gateway,
        retryable: false,
        meta: { currency, supported },
      },
    );
    this.name = 'CurrencyNotSupportedError';
  }
}

export class CountryNotSupportedError extends PaymentError {
  constructor(gateway: string, country: string, supported: string[]) {
    super(
      `Country ${country} is not supported by ${gateway}. Supported: ${supported.join(', ')}`,
      {
        code: 'COUNTRY_NOT_SUPPORTED',
        gateway,
        retryable: false,
        meta: { country, supported },
      },
    );
    this.name = 'CountryNotSupportedError';
  }
}

/** Helper: detect the right error type from an HTTP response shape. */
export function classifyHttpError(
  gateway: string,
  status: number,
  body: unknown,
): PaymentError {
  if (status === 401 || status === 403) {
    return new AuthenticationError(gateway);
  }
  if (status === 429) {
    return new RateLimitedError(gateway);
  }
  if (status >= 500) {
    return new GatewayApiError(gateway, `Gateway server error (HTTP ${status})`, {
      httpStatus: status,
      cause: body,
      retryable: true,
    });
  }
  return new GatewayApiError(gateway, `HTTP ${status}`, {
    httpStatus: status,
    cause: body,
  });
}
