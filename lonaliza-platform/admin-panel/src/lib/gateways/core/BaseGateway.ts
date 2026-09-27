import type { ZodSchema } from 'zod';
import {
  CountryNotSupportedError,
  CurrencyNotSupportedError,
  GatewayNotConfiguredError,
  InvalidRequestError,
  PaymentError,
} from './errors';
import type { PaymentGateway } from './PaymentGateway.interface';
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
import { baseCreatePaymentSchema, baseRefundSchema } from './validation';

/**
 * Abstract base class adapters extend.
 *
 * Template method pattern:
 *   public createPayment(params)
 *     -> guard checks (currency / country / config)
 *     -> Zod validation (caller can override schema via createSchema)
 *     -> abstract createPaymentImpl()
 *     -> uniform error wrapping
 */
export abstract class BaseGateway implements PaymentGateway {
  abstract readonly kind: string;
  abstract readonly displayName: string;
  abstract readonly type: GatewayType;
  abstract readonly supportedCountries: readonly string[];
  abstract readonly supportedCurrencies: readonly string[];
  abstract readonly configFields: readonly GatewayConfigField[];

  /** Tenant-supplied configuration after decryption. Set by the registry on instantiation. */
  protected readonly config: Readonly<Record<string, unknown>>;
  protected readonly testMode: boolean;

  constructor(config: Record<string, unknown>, options: { testMode?: boolean } = {}) {
    this.config = Object.freeze({ ...config });
    this.testMode = options.testMode ?? false;
  }

  // Template methods

  async createPayment(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    this.assertConfigured();
    this.assertCurrency(params.currency);
    this.assertCountry(params.billingAddress?.country);
    this.parseInput(this.createSchema(), params);
    return this.wrapErrors('createPayment', () => this.createPaymentImpl(params));
  }

  async refundPayment(params: RefundParams): Promise<GatewayRefundResult> {
    this.assertConfigured();
    if (params.currency) this.assertCurrency(params.currency);
    this.parseInput(this.refundSchema(), params);
    return this.wrapErrors('refundPayment', () => this.refundPaymentImpl(params));
  }

  async capturePayment(params: CaptureParams): Promise<GatewayCaptureResult> {
    if (!this.capturePaymentImpl) {
      throw new InvalidRequestError(`${this.kind} does not support capture`, {
        gateway: this.kind,
      });
    }
    this.assertConfigured();
    if (params.currency) this.assertCurrency(params.currency);
    return this.wrapErrors('capturePayment', () => this.capturePaymentImpl!(params));
  }

  async voidPayment(params: VoidParams): Promise<GatewayVoidResult> {
    if (!this.voidPaymentImpl) {
      throw new InvalidRequestError(`${this.kind} does not support void`, {
        gateway: this.kind,
      });
    }
    this.assertConfigured();
    return this.wrapErrors('voidPayment', () => this.voidPaymentImpl!(params));
  }

  async getPaymentStatus(gatewayId: string): Promise<PaymentStatus> {
    if (!this.getPaymentStatusImpl) {
      throw new InvalidRequestError(`${this.kind} does not implement status lookup`, {
        gateway: this.kind,
      });
    }
    this.assertConfigured();
    return this.wrapErrors('getPaymentStatus', () => this.getPaymentStatusImpl!(gatewayId));
  }

  async testConnection(): Promise<GatewayTestResult> {
    if (!this.testConnectionImpl) {
      return {
        success: true,
        message: 'No connection probe defined; configuration accepted',
        durationMs: 0,
      };
    }
    const started = Date.now();
    try {
      this.assertConfigured();
      const out = await this.testConnectionImpl();
      return { ...out, durationMs: Date.now() - started };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - started,
      };
    }
  }

  parseWebhookEvent(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    return this.parseWebhookEventImpl(payload, headers);
  }

  // Abstract / optional implementation hooks

  protected abstract createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult>;
  protected abstract refundPaymentImpl(params: RefundParams): Promise<GatewayRefundResult>;
  protected abstract parseWebhookEventImpl(
    payload: unknown,
    headers?: Record<string, string>,
  ): WebhookEvent;

  protected capturePaymentImpl?(params: CaptureParams): Promise<GatewayCaptureResult>;
  protected voidPaymentImpl?(params: VoidParams): Promise<GatewayVoidResult>;
  protected getPaymentStatusImpl?(gatewayId: string): Promise<PaymentStatus>;
  protected testConnectionImpl?(): Promise<GatewayTestResult>;

  /** Adapters override to extend the base schema with provider-specific fields. */
  protected createSchema(): ZodSchema {
    return baseCreatePaymentSchema;
  }

  protected refundSchema(): ZodSchema {
    return baseRefundSchema;
  }

  // Guards

  protected assertConfigured(): void {
    for (const field of this.configFields) {
      if (!field.required) continue;
      const v = this.config[field.key];
      if (v === undefined || v === null || v === '') {
        throw new GatewayNotConfiguredError(this.kind, field.key);
      }
    }
  }

  protected assertCurrency(currency: string): void {
    if (this.supportedCurrencies.includes('*')) return;
    if (!this.supportedCurrencies.includes(currency.toUpperCase())) {
      throw new CurrencyNotSupportedError(
        this.kind,
        currency,
        Array.from(this.supportedCurrencies),
      );
    }
  }

  protected assertCountry(country?: string): void {
    if (!country) return;
    if (this.supportedCountries.includes('*')) return;
    if (!this.supportedCountries.includes(country.toUpperCase())) {
      throw new CountryNotSupportedError(
        this.kind,
        country,
        Array.from(this.supportedCountries),
      );
    }
  }

  protected parseInput<T>(schema: ZodSchema<T>, input: unknown): T {
    const result = schema.safeParse(input);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new InvalidRequestError(`Validation failed: ${issues}`, {
        gateway: this.kind,
        meta: { issues: result.error.issues },
      });
    }
    return result.data;
  }

  /**
   * Wrap raw provider errors so adapters never have to remember to do it themselves.
   * Adapters that want fine-grained control can call `mapProviderError` directly.
   */
  protected async wrapErrors<R>(op: string, fn: () => Promise<R>): Promise<R> {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof PaymentError) throw err;
      const mapped = this.mapProviderError(op, err);
      if (mapped) throw mapped;
      throw new PaymentError(`[${this.kind}.${op}] ${(err as Error)?.message ?? 'unknown'}`, {
        code: 'GATEWAY_API_ERROR',
        gateway: this.kind,
        cause: err,
      });
    }
  }

  /**
   * Adapters override to translate raw provider errors into typed PaymentErrors.
   * Returning `undefined` lets `wrapErrors` fall through to the generic mapping.
   */
  protected mapProviderError(_op: string, _err: unknown): PaymentError | undefined {
    return undefined;
  }

  // Helpers for adapters

  /** Read a config value and throw if missing / wrong type. */
  protected requiredConfig<T = string>(key: string): T {
    const v = this.config[key];
    if (v === undefined || v === null || v === '') {
      throw new GatewayNotConfiguredError(this.kind, key);
    }
    return v as T;
  }

  /** Read an optional config value; returns `undefined` when missing. */
  protected optionalConfig<T = string>(key: string): T | undefined {
    const v = this.config[key];
    return v === undefined || v === null || v === '' ? undefined : (v as T);
  }
}
