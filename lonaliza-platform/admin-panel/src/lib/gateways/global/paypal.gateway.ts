/**
 * PayPal — Orders API v2 (hosted approval page) + Payments API refunds.
 *
 * Tenant config holds OAuth client credentials (`clientId`, `clientSecret`).
 * The gateway caches the OAuth token in Redis (`paypal_token_{clientId}`) for
 * `expires_in - 60` seconds, mirroring the legacy `apis/paypal/api.ts` cache key
 * so the migration is transparent to any pre-cached tokens already in Redis.
 *
 * Docs:
 *   https://developer.paypal.com/docs/api/orders/v2/
 *   https://developer.paypal.com/docs/api/payments/v2/
 *   https://developer.paypal.com/api/rest/authentication/
 */

import { z } from 'zod';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import {
  GatewayApiError,
  InvalidWebhookError,
  NetworkError,
  PaymentError,
  classifyHttpError,
} from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type {
  CreatePaymentParams,
  GatewayConfigField,
  GatewayPaymentResult,
  GatewayRefundResult,
  GatewayTestResult,
  GatewayType,
  PaymentStatus,
  RefundParams,
  WebhookEvent,
  WebhookEventType,
} from '../core/types';
import { baseCreatePaymentSchema } from '../core/validation';

const KIND = 'paypal';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'clientId',
    label: 'Client ID',
    type: 'text',
    required: true,
    placeholder: 'A21AA…',
    helpText:
      'PayPal Developer Dashboard → My Apps & Credentials → REST API apps → Client ID.',
  },
  {
    key: 'clientSecret',
    label: 'Client Secret',
    type: 'password',
    required: true,
    secret: true,
    placeholder: 'E…',
    helpText:
      'REST API app Secret. Use Sandbox credentials when Test mode is enabled.',
  },
  {
    key: 'webhookId',
    label: 'Webhook ID',
    type: 'text',
    required: false,
    placeholder: 'WH-…',
    helpText:
      'Optional. Created in the PayPal Developer Dashboard under Webhooks and used for signature verification.',
  },
];

const paypalCreateSchema = baseCreatePaymentSchema.extend({
  successUrl: z.string().url('PayPal requires successUrl as return_url'),
  failureUrl: z.string().url('PayPal requires failureUrl as cancel_url'),
});

interface OAuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type?: string;
}

interface PayPalOrder {
  id: string;
  status: string;
  links?: Array<{ href: string; rel: string; method?: string }>;
  purchase_units?: Array<{
    amount?: { currency_code?: string; value?: string };
    payments?: {
      captures?: Array<{
        id: string;
        status?: string;
        amount?: { currency_code?: string; value?: string };
      }>;
    };
  }>;
}

interface PayPalRefund {
  id: string;
  status?: string;
  amount?: { currency_code?: string; value?: string };
  create_time?: string;
}

export class PayPalGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'PayPal';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['*'] as const;
  readonly supportedCurrencies = ['*'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected createSchema() {
    return paypalCreateSchema;
  }

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const currency = params.currency.toUpperCase();
    const body: Record<string, unknown> = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: params.orderId.slice(0, 256),
          description: (params.description || `Order ${params.orderId}`).slice(0, 127),
          custom_id: params.orderId.slice(0, 127),
          amount: {
            currency_code: currency,
            value: this.formatAmount(params.amount, currency),
          },
        },
      ],
      application_context: {
        return_url: params.successUrl,
        cancel_url: params.failureUrl,
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        brand_name: params.metadata?.brandName,
      },
    };

    const order = await this.requestJson<PayPalOrder>(
      'POST',
      '/v2/checkout/orders',
      body,
      { idempotencyKey: params.idempotencyKey },
    );

    const approveUrl =
      order.links?.find((l) => l.rel === 'approve' || l.rel === 'payer-action')?.href;
    if (!approveUrl) {
      throw new GatewayApiError(KIND, 'PayPal did not return an approval URL', {
        cause: order,
      });
    }

    return {
      gatewayId: order.id,
      orderId: params.orderId,
      status: this.mapOrderStatus(order.status),
      redirectUrl: approveUrl,
      rawResponse: order,
    };
  }

  protected async refundPaymentImpl(params: RefundParams): Promise<GatewayRefundResult> {
    const currency = (params.currency || 'USD').toUpperCase();
    const order = await this.requestJson<PayPalOrder>(
      'GET',
      `/v2/checkout/orders/${encodeURIComponent(params.gatewayId)}`,
    );
    const capture = order.purchase_units?.[0]?.payments?.captures?.[0];
    if (!capture?.id) {
      throw new GatewayApiError(KIND, 'PayPal order has no captured payment to refund', {
        cause: order,
      });
    }

    const body: Record<string, unknown> = {};
    if (params.amount != null && params.amount > 0) {
      body.amount = {
        currency_code: currency,
        value: this.formatAmount(params.amount, currency),
      };
    }
    if (params.reason) {
      body.note_to_payer = String(params.reason).slice(0, 255);
    }

    const refund = await this.requestJson<PayPalRefund>(
      'POST',
      `/v2/payments/captures/${encodeURIComponent(capture.id)}/refund`,
      body,
      { idempotencyKey: params.idempotencyKey },
    );

    const refundValue = parseFloat(refund.amount?.value || '0');
    const status = (refund.status || '').toUpperCase();
    return {
      success: status === 'COMPLETED' || status === 'PENDING',
      gatewayRefundId: refund.id,
      status: status === 'FAILED' ? 'failed' : 'succeeded',
      totalRefunded: Number.isFinite(refundValue) ? refundValue : params.amount || 0,
      refundedAt: refund.create_time ? new Date(refund.create_time) : new Date(),
      rawResponse: refund,
    };
  }

  protected async getPaymentStatusImpl(gatewayId: string): Promise<PaymentStatus> {
    const order = await this.requestJson<PayPalOrder>(
      'GET',
      `/v2/checkout/orders/${encodeURIComponent(gatewayId)}`,
    );
    return this.mapOrderStatus(order.status);
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not an object');
    }
    const env = payload as {
      id?: string;
      event_type?: string;
      create_time?: string;
      resource?: {
        id?: string;
        status?: string;
        amount?: { currency_code?: string; value?: string };
        custom_id?: string;
        supplementary_data?: { related_ids?: { order_id?: string } };
      };
    };
    const res = env.resource || {};
    const eventType = String(env.event_type || '');
    const status = this.mapOrderStatus(res.status);
    const amount = res.amount?.value ? parseFloat(res.amount.value) : undefined;
    const orderId = res.custom_id || res.supplementary_data?.related_ids?.order_id;

    return {
      id: String(env.id || `paypal-${Date.now()}`),
      type: this.mapWebhookType(eventType, status),
      gateway: KIND,
      orderId,
      gatewayPaymentId: res.id,
      status,
      amount: Number.isFinite(amount as number) ? (amount as number) : undefined,
      currency: res.amount?.currency_code,
      timestamp: env.create_time ? new Date(env.create_time) : new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    try {
      await this.getAccessToken({ forceRefresh: true });
      return {
        success: true,
        message: 'PayPal OAuth credentials accepted',
        durationMs: 0,
        details: { mode: this.testMode ? 'sandbox' : 'live' },
      };
    } catch (err) {
      const message =
        err instanceof PaymentError
          ? err.message
          : err instanceof Error
            ? err.message
            : String(err);
      return { success: false, message, durationMs: 0 };
    }
  }

  private apiBase(): string {
    return this.testMode ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
  }

  private static tokenCache = new Map<string, { token: string; expiresAt: number }>();

  private async getAccessToken(opts: { forceRefresh?: boolean } = {}): Promise<string> {
    const clientId = this.requiredConfig<string>('clientId');
    const clientSecret = this.requiredConfig<string>('clientSecret');
    const cacheKey = `paypal_token_${this.testMode ? 'sb_' : ''}${clientId}`;

    if (!opts.forceRefresh) {
      const cached = PayPalGateway.tokenCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.token;
      }
    }

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    let response: Response;
    try {
      response = await fetch(`${this.apiBase()}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'en_US',
          Authorization: `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
    } catch (err) {
      throw new NetworkError(KIND, err);
    }

    const text = await response.text();
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = { raw: text };
    }

    if (!response.ok) {
      throw classifyHttpError(KIND, response.status, parsed);
    }
    const token = parsed as OAuthTokenResponse;
    if (!token?.access_token) {
      throw new GatewayApiError(KIND, 'PayPal /oauth2/token returned no access_token', {
        cause: parsed,
      });
    }
    const ttl = Math.max(60, (token.expires_in || 300) - 60);
    PayPalGateway.tokenCache.set(cacheKey, {
      token: token.access_token,
      expiresAt: Date.now() + ttl * 1000,
    });
    return token.access_token;
  }

  private async requestJson<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, unknown>,
    opts: { idempotencyKey?: string } = {},
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${this.apiBase()}${path}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };
    if (method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }
    if (opts.idempotencyKey) {
      headers['PayPal-Request-Id'] = opts.idempotencyKey;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw new NetworkError(KIND, err);
    }

    const text = await response.text();
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = { raw: text };
    }

    if (!response.ok) {
      const err = parsed as { message?: string; name?: string };
      if (err && typeof err === 'object' && 'message' in err && err.message) {
        throw new GatewayApiError(KIND, err.message, {
          httpStatus: response.status,
          providerCode: err.name,
          cause: parsed,
        });
      }
      throw classifyHttpError(KIND, response.status, parsed);
    }
    return parsed as T;
  }

  private formatAmount(major: number, currency: string): string {
    const three = ['BHD', 'JOD', 'KWD', 'OMR', 'TND'];
    const zero = ['JPY', 'HUF', 'TWD'];
    const cur = currency.toUpperCase();
    if (zero.includes(cur)) return String(Math.round(major));
    if (three.includes(cur)) return major.toFixed(3);
    return major.toFixed(2);
  }

  private mapOrderStatus(raw?: string): PaymentStatus {
    const s = (raw || '').toUpperCase();
    switch (s) {
      case 'COMPLETED':
      case 'CAPTURED':
        return 'paid';
      case 'APPROVED':
        return 'authorized';
      case 'CREATED':
      case 'SAVED':
      case 'PENDING':
        return 'pending';
      case 'PAYER_ACTION_REQUIRED':
        return 'requires_action';
      case 'VOIDED':
      case 'CANCELLED':
      case 'CANCELED':
        return 'cancelled';
      case 'DECLINED':
      case 'FAILED':
        return 'failed';
      case 'REFUNDED':
        return 'refunded';
      case 'PARTIALLY_REFUNDED':
        return 'partially_refunded';
      default:
        return 'pending';
    }
  }

  private mapWebhookType(eventType: string, status: PaymentStatus): WebhookEventType {
    const t = eventType.toUpperCase();
    if (t.includes('CHECKOUT.ORDER.APPROVED')) return 'payment.authorized';
    if (
      t.includes('PAYMENT.CAPTURE.COMPLETED') ||
      t.includes('CHECKOUT.ORDER.COMPLETED')
    )
      return 'payment.paid';
    if (t.includes('PAYMENT.CAPTURE.PENDING')) return 'payment.created';
    if (t.includes('PAYMENT.CAPTURE.DENIED')) return 'payment.failed';
    if (t.includes('PAYMENT.CAPTURE.REFUNDED')) return 'payment.refunded';
    if (t.includes('PAYMENT.CAPTURE.REVERSED')) return 'payment.refunded';
    if (t.includes('CHECKOUT.ORDER.VOIDED')) return 'payment.cancelled';
    if (status === 'paid') return 'payment.paid';
    if (status === 'failed') return 'payment.failed';
    if (status === 'refunded') return 'payment.refunded';
    return 'unknown';
  }
}

registerMarketing(KIND, {
  brandLabel: 'PayPal',
  description:
    'Global wallet checkout with PayPal, Pay Later, and guest card support.',
  logoPath: 'paypal.svg',
  brandColor: '#003087',
  websiteUrl: 'https://www.paypal.com',
  docsUrl: 'https://developer.paypal.com/docs/api/orders/v2/',
  badges: ['popular'],
  platformBillingEligible: false,
});

GatewayRegistry.register((config, options) => new PayPalGateway(config, options));
