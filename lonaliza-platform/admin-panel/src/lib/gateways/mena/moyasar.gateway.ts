/**
 * Moyasar (Saudi Arabia / MENA) — Invoices flow.
 *
 * Why invoices instead of direct /payments?
 *   - Hosted-checkout invoices give us 3DS, mada, Apple Pay, STC Pay and
 *     credit-card support out of the box without exposing the buyer's PAN
 *     to our backend.
 *   - We can still issue server-driven refunds against the resulting payment
 *     id once the invoice is paid.
 *
 * Flow:
 *   1. createPayment -> POST /v1/invoices
 *      Returns { id, url, status }; redirect the buyer to `url`.
 *   2. Buyer pays on Moyasar's hosted page; Moyasar:
 *        a) redirects browser to `success_url` / `back_url`, AND
 *        b) hits our `webhook_url` (configured per-tenant in Moyasar dashboard)
 *           with a JSON event { type, data }.
 *   3. parseWebhookEventImpl validates the event and emits a normalized event.
 *   4. Refunds via POST /v1/payments/{id}/refund.
 *
 * Auth:
 *   HTTP Basic with `<secret_api_key>:` (note the trailing colon).
 *
 * Webhook auth:
 *   Moyasar sends `Authorization: Basic <base64(token:)>` where `token` is
 *   the webhook secret you set when subscribing the URL in the dashboard.
 *
 * Amounts use MINOR units (halalas): 10.50 SAR = 1050.
 *
 * Docs:
 *   https://docs.moyasar.com/api/invoices
 *   https://docs.moyasar.com/webhooks
 */

import { timingSafeEqual } from 'crypto';
import { z } from 'zod';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import {
  GatewayApiError,
  InvalidWebhookError,
  NetworkError,
  PaymentError,
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

const KIND = 'moyasar';
const API_BASE = 'https://api.moyasar.com/v1';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'secretApiKey',
    label: 'Secret API Key',
    type: 'password',
    required: true,
    secret: true,
    placeholder: 'sk_test_…',
    helpText: 'Moyasar dashboard → Account → Keys → Secret API key.',
  },
  {
    key: 'publishableApiKey',
    label: 'Publishable API Key',
    type: 'text',
    required: false,
    placeholder: 'pk_test_…',
    helpText: 'Optional. Used by client-side hosted card form.',
  },
  {
    key: 'webhookSecret',
    label: 'Webhook secret',
    type: 'password',
    required: false,
    secret: true,
    helpText: 'Set this if you enabled HTTP Basic auth on your Moyasar webhook.',
  },
  {
    key: 'methods',
    label: 'Allowed payment methods',
    type: 'multiselect',
    required: false,
    options: [
      { value: 'creditcard', label: 'Credit card' },
      { value: 'mada', label: 'mada' },
      { value: 'applepay', label: 'Apple Pay' },
      { value: 'stcpay', label: 'STC Pay' },
    ],
    helpText: 'Leave empty to allow every method enabled on your Moyasar account.',
  },
];

const moyasarCreateSchema = baseCreatePaymentSchema.extend({
  callbackUrl: z.string().url('Moyasar requires callbackUrl'),
});

interface MoyasarInvoice {
  id: string;
  status: string;
  amount: number;
  currency: string;
  description?: string;
  url?: string;
  callback_url?: string;
  success_url?: string;
  back_url?: string;
  metadata?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

interface MoyasarPayment {
  id: string;
  status: string;
  amount: number;
  amount_format?: string;
  currency: string;
  refunded?: number;
  refunded_at?: string;
  captured?: number;
  invoice_id?: string;
  metadata?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
  source?: { type?: string; company?: string };
}

interface MoyasarRefundLike {
  id: string;
  status: string;
  amount: number;
  currency: string;
  refunded?: number;
  refunded_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface MoyasarWebhookEnvelope {
  id?: string;
  type: string;
  created_at?: string;
  data: MoyasarPayment;
}

const SUPPORTED_CURRENCIES = ['SAR', 'AED', 'KWD', 'BHD', 'QAR', 'OMR', 'USD', 'EUR', 'GBP'] as const;

export class MoyasarGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Moyasar';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['SA', 'AE', 'KW', 'BH', 'QA', 'OM'] as const;
  readonly supportedCurrencies = SUPPORTED_CURRENCIES;
  readonly configFields = CONFIG_FIELDS;

  protected createSchema() {
    return moyasarCreateSchema;
  }

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const body: Record<string, unknown> = {
      amount: this.toMinorUnits(params.amount, params.currency),
      currency: params.currency.toUpperCase(),
      description: (params.description || `Order ${params.orderId}`).slice(0, 200),
      callback_url: params.callbackUrl,
    };
    if (params.successUrl) body.success_url = params.successUrl;
    if (params.failureUrl) body.back_url = params.failureUrl;

    const metadata: Record<string, string> = {
      orderId: params.orderId,
      subdomain: params.subdomain,
      ...(params.metadata || {}),
    };
    body.metadata = metadata;

    const methods = this.optionalConfig<string[] | string>('methods');
    if (methods) {
      body.methods = Array.isArray(methods) ? methods : String(methods).split(',');
    }

    const invoice = await this.request<MoyasarInvoice>('POST', '/invoices', body);

    if (!invoice.url) {
      throw new GatewayApiError(KIND, 'Moyasar did not return a hosted invoice URL', {
        cause: invoice,
      });
    }

    return {
      gatewayId: invoice.id,
      orderId: params.orderId,
      status: this.mapStatus(invoice.status),
      redirectUrl: invoice.url,
      rawResponse: invoice,
    };
  }

  protected async refundPaymentImpl(params: RefundParams): Promise<GatewayRefundResult> {
    const body: Record<string, unknown> = {};
    if (params.amount) {
      body.amount = this.toMinorUnits(params.amount, params.currency || 'SAR');
    }
    const refund = await this.request<MoyasarPayment | MoyasarRefundLike>(
      'POST',
      `/payments/${encodeURIComponent(params.gatewayId)}/refund`,
      body,
      { idempotencyKey: params.idempotencyKey },
    );
    const refunded =
      ('refunded' in refund && typeof refund.refunded === 'number'
        ? refund.refunded
        : refund.amount) / 100;
    return {
      success: refund.status === 'refunded' || refund.status === 'succeeded',
      gatewayRefundId: refund.id,
      status: refund.status === 'failed' ? 'failed' : 'succeeded',
      totalRefunded: refunded,
      refundedAt: this.parseDate(refund),
      rawResponse: refund,
    };
  }

  protected async getPaymentStatusImpl(gatewayId: string): Promise<PaymentStatus> {
    const payment = await this.request<MoyasarPayment>(
      'GET',
      `/payments/${encodeURIComponent(gatewayId)}`,
    );
    return this.mapStatus(payment.status);
  }

  protected parseWebhookEventImpl(
    payload: unknown,
    headers?: Record<string, string>,
  ): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not an object');
    }
    const env = payload as Partial<MoyasarWebhookEnvelope>;
    if (!env.type || !env.data || typeof env.data !== 'object') {
      throw new InvalidWebhookError(KIND, 'envelope missing type or data');
    }

    // Optional HTTP Basic verification on the webhook secret.
    const expectedSecret = this.optionalConfig<string>('webhookSecret');
    if (expectedSecret) {
      const auth = headers?.authorization || headers?.Authorization || '';
      const expected = 'Basic ' + Buffer.from(`${expectedSecret}:`).toString('base64');
      if (!this.constantTimeEqual(auth, expected)) {
        throw new WebhookVerificationFailedError(KIND);
      }
    }

    const data = env.data;
    const status = this.mapStatus(data.status);
    const eventType = this.mapWebhookType(env.type, status);

    return {
      id: env.id || data.id,
      type: eventType,
      gateway: KIND,
      orderId:
        data.metadata?.orderId ||
        (typeof data.invoice_id === 'string' ? data.invoice_id : undefined),
      gatewayPaymentId: data.id,
      status,
      amount: typeof data.amount === 'number' ? data.amount / 100 : undefined,
      currency: data.currency,
      timestamp: this.parseDate(data),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    try {
      await this.request('GET', '/invoices?per_page=1');
      return {
        success: true,
        message: 'Moyasar credentials accepted',
        durationMs: 0,
        details: { mode: this.testMode ? 'test' : 'live' },
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

  // ────────────── helpers ──────────────

  private toMinorUnits(major: number, currency: string): number {
    const cur = currency.toUpperCase();
    const exp = cur === 'KWD' || cur === 'BHD' || cur === 'OMR' ? 1000 : 100;
    return Math.round(major * exp);
  }

  private mapStatus(raw: string): PaymentStatus {
    switch ((raw || '').toLowerCase()) {
      case 'initiated':
        return 'initiated';
      case 'authorized':
        return 'authorized';
      case 'paid':
      case 'captured':
        return 'paid';
      case 'failed':
        return 'failed';
      case 'voided':
        return 'voided';
      case 'refunded':
        return 'refunded';
      case 'partially_refunded':
        return 'partially_refunded';
      case 'expired':
        return 'expired';
      default:
        return 'pending';
    }
  }

  private mapWebhookType(raw: string, status: PaymentStatus): WebhookEventType {
    const t = (raw || '').toLowerCase();
    if (t.includes('paid') || status === 'paid') return 'payment.paid';
    if (t.includes('failed') || status === 'failed') return 'payment.failed';
    if (t.includes('refunded') && status === 'partially_refunded')
      return 'payment.partially_refunded';
    if (t.includes('refunded')) return 'payment.refunded';
    if (t.includes('authorized')) return 'payment.authorized';
    if (t.includes('captured')) return 'payment.captured';
    if (t.includes('voided') || t.includes('cancelled')) return 'payment.cancelled';
    if (t.includes('expired')) return 'payment.expired';
    return 'unknown';
  }

  private parseDate(p: { created_at?: string; updated_at?: string }): Date {
    const raw = p.updated_at || p.created_at;
    if (!raw) return new Date();
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }

  private constantTimeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, unknown>,
    opts: { idempotencyKey?: string } = {},
  ): Promise<T> {
    const secret = this.requiredConfig<string>('secretApiKey');
    const url = `${API_BASE}${path}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${secret}:`).toString('base64'),
    };
    if (method === 'POST') headers['Content-Type'] = 'application/json';
    if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey;

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

    let parsed: unknown;
    const text = await response.text();
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = { raw: text };
    }

    if (!response.ok) {
      const err = parsed as { message?: string; type?: string; errors?: unknown };
      if (err && typeof err === 'object' && 'message' in err) {
        throw new GatewayApiError(KIND, err.message || `HTTP ${response.status}`, {
          httpStatus: response.status,
          providerCode: err.type,
          cause: parsed,
        });
      }
      throw classifyHttpError(KIND, response.status, parsed);
    }
    return parsed as T;
  }
}

registerMarketing(KIND, {
  brandLabel: 'Moyasar',
  description: 'Leading Saudi payment gateway — Mada, Apple Pay, STC Pay, and cards.',
  logoPath: 'moyasar.svg',
  brandColor: '#00D2A4',
  websiteUrl: 'https://moyasar.com',
  docsUrl: 'https://docs.moyasar.com/api/invoices',
  badges: ['recommended', 'popular'],
  platformBillingEligible: false,
});

GatewayRegistry.register((config, options) => new MoyasarGateway(config, options));
