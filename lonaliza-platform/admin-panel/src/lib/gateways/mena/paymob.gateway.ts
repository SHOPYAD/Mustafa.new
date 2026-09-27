/**
 * Paymob Accept (Egypt / MENA) — classic iframe flow.
 *
 * Steps:
 *   1. POST /api/auth/tokens           { api_key }
 *   2. POST /api/ecommerce/orders      { auth_token, amount_cents, currency, items, ... }
 *   3. POST /api/acceptance/payment_keys { auth_token, order_id, integration_id, billing_data, ... }
 *   4. Redirect buyer to:
 *        {base}/api/acceptance/iframes/{integration_id}?payment_token={token}
 *
 * Refund:
 *   POST /api/acceptance/void_refund/refund { auth_token, transaction_id, amount_cents }
 *   For refunds, `gatewayId` MUST be Paymob's transaction id from the callback (not the order id
 *   returned at checkout creation).
 *
 * Webhook HMAC (when `hmac` is present):
 *   SHA512-HMAC over concatenated transaction fields — see `buildPaymobHmacString`.
 *
 * Region hosts:
 *   EG: https://accept.paymob.com
 *   SA: https://ksa.paymob.com
 *   AE: https://uae.paymob.com
 *   OM: https://oman.paymob.com
 *
 * Docs: https://developers.paymob.com/
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { z } from 'zod';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import {
  GatewayApiError,
  InvalidRequestError,
  InvalidWebhookError,
  NetworkError,
  WebhookVerificationFailedError,
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

const KIND = 'paymob';

const REGION_BASE: Record<string, string> = {
  eg: 'https://accept.paymob.com',
  ksa: 'https://ksa.paymob.com',
  uae: 'https://uae.paymob.com',
  om: 'https://oman.paymob.com',
};

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'apiKey',
    label: 'Secret API key',
    type: 'password',
    required: true,
    secret: true,
    helpText: 'Paymob dashboard → Settings → Account Info → API Key.',
  },
  {
    key: 'integrationId',
    label: 'Card integration ID',
    type: 'number',
    required: true,
    helpText: 'Developers → Payment integrations → your card integration numeric ID.',
  },
  {
    key: 'iframeIntegrationId',
    label: 'Iframe integration ID (optional)',
    type: 'number',
    required: false,
    helpText: 'Only if different from card integration ID; defaults to integration ID.',
  },
  {
    key: 'region',
    label: 'Data centre region',
    type: 'select',
    required: false,
    options: [
      { value: 'eg', label: 'Egypt (accept.paymob.com)' },
      { value: 'ksa', label: 'Saudi Arabia (ksa.paymob.com)' },
      { value: 'uae', label: 'UAE (uae.paymob.com)' },
      { value: 'om', label: 'Oman (oman.paymob.com)' },
    ],
    default: 'eg',
  },
  {
    key: 'hmacSecret',
    label: 'HMAC secret (callbacks)',
    type: 'password',
    required: false,
    secret: true,
    helpText: 'Dashboard callback HMAC secret — required to verify `hmac` on webhooks.',
  },
];

const paymobCreateSchema = baseCreatePaymentSchema.extend({
  callbackUrl: z.string().url('Paymob requires callbackUrl'),
});

interface PaymobAuthResponse {
  token: string;
}

interface PaymobOrderResponse {
  id: number;
}

interface PaymobPaymentKeyResponse {
  token: string;
}

interface PaymobRefundResponse {
  success?: boolean;
  id?: number;
  message?: string;
}

export class PaymobGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Paymob';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['EG', 'SA', 'AE', 'OM', 'BH', 'KW', 'QA', 'PS'] as const;
  readonly supportedCurrencies = ['EGP', 'SAR', 'AED', 'OMR', 'KWD', 'BHD', 'QAR', 'USD', 'EUR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected createSchema() {
    return paymobCreateSchema;
  }

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const authToken = await this.authenticate();
    const amountCents = this.toMinorUnits(params.amount, params.currency);
    const currency = params.currency.toUpperCase();

    const orderBody: Record<string, unknown> = {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amountCents,
      currency,
      merchant_order_id: params.orderId,
      items: [
        {
          name: (params.description || 'Order').slice(0, 120),
          amount_cents: amountCents,
          description: (params.description || 'Purchase').slice(0, 200),
          quantity: 1,
        },
      ],
    };

    const order = await this.request<PaymobOrderResponse>('POST', '/api/ecommerce/orders', orderBody);

    const billing = this.buildBillingData(params);
    const integrationId = Number(this.requiredConfig<string | number>('integrationId'));

    const keyBody: Record<string, unknown> = {
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: order.id,
      billing_data: billing,
      currency,
      integration_id: integrationId,
    };

    const keys = await this.request<PaymobPaymentKeyResponse>(
      'POST',
      '/api/acceptance/payment_keys',
      keyBody,
    );

    const iframeId = this.optionalConfig<number>('iframeIntegrationId') ?? integrationId;
    const base = this.baseUrl();
    const redirectUrl = `${base}/api/acceptance/iframes/${iframeId}?payment_token=${encodeURIComponent(keys.token)}`;

    return {
      gatewayId: String(order.id),
      orderId: params.orderId,
      status: 'pending' as PaymentStatus,
      redirectUrl,
      rawResponse: {
        paymobOrderId: order.id,
        paymentToken: keys.token,
        integrationId,
      },
    };
  }

  protected async refundPaymentImpl(params: RefundParams): Promise<GatewayRefundResult> {
    if (!params.amount) {
      throw new InvalidRequestError('Paymob refunds require an explicit amount', {
        gateway: KIND,
      });
    }
    const txId = Number.parseInt(String(params.gatewayId), 10);
    if (!Number.isFinite(txId)) {
      throw new InvalidRequestError(
        'Paymob refund expects gatewayId = Paymob transaction_id (numeric) from the payment callback',
        { gateway: KIND },
      );
    }
    const authToken = await this.authenticate();
    const amountCents = this.toMinorUnits(params.amount, params.currency || 'EGP');
    const res = await this.request<PaymobRefundResponse>(
      'POST',
      '/api/acceptance/void_refund/refund',
      {
        auth_token: authToken,
        transaction_id: txId,
        amount_cents: amountCents,
      },
    );
    return {
      success: res.success !== false,
      gatewayRefundId: String(res.id ?? txId),
      status: 'succeeded',
      totalRefunded: params.amount,
      refundedAt: new Date(),
      rawResponse: res,
    };
  }

  protected parseWebhookEventImpl(
    payload: unknown,
    _headers?: Record<string, string>,
  ): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not an object');
    }
    const root = payload as Record<string, unknown>;
    const obj = (root.obj as Record<string, unknown>) || root;
    const hmac = typeof root.hmac === 'string' ? root.hmac : undefined;

    if (hmac) {
      const secret = this.optionalConfig<string>('hmacSecret');
      if (!secret) {
        throw new InvalidWebhookError(
          KIND,
          'Callback includes hmac but hmacSecret is not configured for this tenant',
        );
      }
      const expected = createHmac('sha512', secret)
        .update(buildPaymobHmacString(obj))
        .digest('hex');
      if (!this.constantTimeEqualHex(expected, hmac)) {
        throw new WebhookVerificationFailedError(KIND);
      }
    }

    const success = obj.success === true || obj.success === 'true';
    const pending = obj.pending === true || obj.pending === 'true';
    const mappedStatus: PaymentStatus = success ? 'paid' : pending ? 'pending' : 'failed';
    const eventType: WebhookEventType = success
      ? 'payment.paid'
      : mappedStatus === 'failed'
        ? 'payment.failed'
        : 'payment.created';

    const order = (obj.order as Record<string, unknown>) || {};
    const amountCents = Number(obj.amount_cents ?? 0);

    return {
      id: String(obj.id ?? `paymob_${Date.now()}`),
      type: eventType,
      gateway: KIND,
      orderId:
        typeof order.id === 'string' || typeof order.id === 'number'
          ? String(order.id)
          : typeof obj.merchant_order_id === 'string'
            ? obj.merchant_order_id
            : undefined,
      gatewayPaymentId: obj.id !== undefined ? String(obj.id) : undefined,
      status: mappedStatus,
      amount: amountCents ? amountCents / 100 : undefined,
      currency: typeof obj.currency === 'string' ? obj.currency : undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    try {
      await this.authenticate();
      return {
        success: true,
        message: 'Paymob API key accepted (auth token issued)',
        durationMs: 0,
        details: { region: this.optionalConfig<string>('region') ?? 'eg' },
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : String(err),
        durationMs: 0,
      };
    }
  }

  private baseUrl(): string {
    const r = (this.optionalConfig<string>('region') || 'eg').toLowerCase();
    return REGION_BASE[r] || REGION_BASE.eg;
  }

  private async authenticate(): Promise<string> {
    const apiKey = this.requiredConfig<string>('apiKey');
    const res = await this.request<PaymobAuthResponse>('POST', '/api/auth/tokens', {
      api_key: apiKey,
    });
    if (!res.token) {
      throw new GatewayApiError(KIND, 'Auth response missing token', { cause: res });
    }
    return res.token;
  }

  private toMinorUnits(major: number, currency: string): number {
    const c = currency.toUpperCase();
    const exp = c === 'KWD' || c === 'BHD' || c === 'OMR' ? 1000 : 100;
    return Math.round(major * exp);
  }

  private buildBillingData(params: CreatePaymentParams): Record<string, string> {
    const c = params.customer || {};
    const a = params.billingAddress || {};
    const country = (a.country || 'EG').toUpperCase();
    const first = c.firstName || c.name?.split(' ')[0] || 'Buyer';
    const last = c.lastName || c.name?.split(' ').slice(1).join(' ') || 'User';
    return {
      apartment: 'NA',
      email: c.email || 'guest@example.com',
      floor: 'NA',
      first_name: first,
      street: a.line1 || 'NA',
      building: 'NA',
      phone_number: (c.phone || '+201000000000').replace(/\s/g, ''),
      shipping_method: 'PKG',
      postal_code: a.postalCode || '00000',
      city: a.city || 'Cairo',
      country,
      last_name: last,
      state: a.state || 'NA',
    };
  }

  private constantTimeEqualHex(a: string, b: string): boolean {
    try {
      const ba = Buffer.from(a, 'hex');
      const bb = Buffer.from(b, 'hex');
      if (ba.length !== bb.length) return false;
      return timingSafeEqual(ba, bb);
    } catch {
      return false;
    }
  }

  private async request<T>(method: 'POST', path: string, body: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl()}${path}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
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
    return parsed as T;
  }
}

function buildPaymobHmacString(obj: Record<string, unknown>): string {
  const order = (obj.order as Record<string, unknown>) || {};
  const src = (obj.source_data as Record<string, unknown>) || {};
  const parts: unknown[] = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    order.id,
    obj.owner,
    obj.pending,
    src.pan,
    src.sub_type,
    src.type,
    obj.success,
  ];
  return parts.map((v) => (v === null || v === undefined ? '' : String(v))).join('');
}

registerMarketing(KIND, {
  brandLabel: 'Paymob',
  description: 'Leading payment gateway for Egypt and the Gulf — cards, wallets, and installments.',
  logoPath: 'paymob.svg',
  brandColor: '#00C389',
  websiteUrl: 'https://paymob.com',
  docsUrl: 'https://developers.paymob.com/',
  badges: ['popular', 'recommended'],
  platformBillingEligible: false,
});

GatewayRegistry.register((config, options) => new PaymobGateway(config, options));
