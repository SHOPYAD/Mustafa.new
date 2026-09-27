/**
 * Checkout.com — Payment Links (hosted page) + Payments API (refunds / status).
 *
 * Docs:
 *   https://www.checkout.com/docs/integrate/payment-links
 *   https://api-reference.checkout.com/#tag/Payment-Links/operation/CreatePaymentLink
 *
 * Base URL includes a per-account `{prefix}` (first 8 chars of client_id without `cli_`).
 * Webhook HMAC key is configured in Dashboard → Workflows → webhook signing key (`Cko-Signature`).
 */

import { createHmac, timingSafeEqual } from 'crypto';
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
  PaymentStatus,
  RefundParams,
  WebhookEvent,
  WebhookEventType,
} from '../core/types';
import { baseCreatePaymentSchema } from '../core/validation';

const KIND = 'checkout';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'secretKey',
    label: 'Secret API Key',
    type: 'password',
    required: true,
    secret: true,
    placeholder: 'sk_… or sk_sbox_…',
    helpText: 'Dashboard → Developers → API keys → Secret key (Bearer).',
  },
  {
    key: 'apiPrefix',
    label: 'API URL prefix (8 chars)',
    type: 'text',
    required: true,
    placeholder: 'abcd1234',
    helpText:
      'First 8 characters of your client_id after `cli_`, shown under Developers → Base URL (e.g. https://abcd1234.api.checkout.com).',
  },
  {
    key: 'processingChannelId',
    label: 'Processing channel ID',
    type: 'text',
    required: true,
    placeholder: 'pc_…',
    helpText: 'Required for Payment Links — copy from Dashboard → Settings → Processing channel.',
  },
  {
    key: 'webhookSigningKey',
    label: 'Webhook signing key',
    type: 'password',
    required: false,
    secret: true,
    helpText:
      'Workflows webhook “signature key” used to verify `Cko-Signature` (HMAC-SHA256 over raw body).',
  },
];

const checkoutCreateSchema = baseCreatePaymentSchema.extend({
  successUrl: z.string().url('Checkout.com Payment Links require successUrl for return_url'),
});

export class CheckoutGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Checkout.com';
  readonly type = 'card' as const;
  readonly supportedCountries = ['*'] as const;
  readonly supportedCurrencies = ['*'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected createSchema() {
    return checkoutCreateSchema;
  }

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const minor = this.toMinorUnits(params.amount, params.currency);
    const body: Record<string, unknown> = {
      amount: minor,
      currency: params.currency.toUpperCase(),
      reference: params.orderId.slice(0, 100),
      description: (params.description || `Order ${params.orderId}`).slice(0, 200),
      processing_channel_id: this.requiredConfig<string>('processingChannelId'),
      payment_type: 'Regular',
      return_url: params.successUrl,
      metadata: {
        orderId: params.orderId,
        subdomain: params.subdomain,
        ...(params.metadata || {}),
      },
    };

    if (params.customer?.email) {
      body.customer = {
        email: params.customer.email,
        name:
          params.customer.name ||
          [params.customer.firstName, params.customer.lastName].filter(Boolean).join(' ') ||
          undefined,
        phone: params.customer.phone,
      };
    }
    if (params.billingAddress?.line1 || params.billingAddress?.country) {
      body.billing = {
        address: {
          address_line1: params.billingAddress?.line1,
          address_line2: params.billingAddress?.line2,
          city: params.billingAddress?.city,
          state: params.billingAddress?.state,
          zip: params.billingAddress?.postalCode,
          country: params.billingAddress?.country,
        },
      };
    }

    const created = await this.requestJson<{ id: string; _links?: { redirect?: { href?: string } } }>(
      'POST',
      '/payment-links',
      body,
      { idempotencyKey: params.idempotencyKey },
    );

    const redirect = created._links?.redirect?.href;
    if (!redirect) {
      throw new GatewayApiError(KIND, 'Checkout.com did not return a Payment Link redirect URL', {
        cause: created,
      });
    }

    return {
      gatewayId: created.id,
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: redirect,
      rawResponse: created,
    };
  }

  protected async refundPaymentImpl(params: RefundParams): Promise<GatewayRefundResult> {
    const currency = (params.currency || 'USD').toUpperCase();
    const body: Record<string, unknown> = {
      reference: `refund-${params.gatewayId}-${Date.now()}`.slice(0, 100),
    };
    if (params.amount) {
      body.amount = this.toMinorUnits(params.amount, currency);
    }
    const refund = await this.requestJson<{
      action_id?: string;
      status?: string;
      amount?: number;
      processed_on?: string;
    }>('POST', `/payments/${encodeURIComponent(params.gatewayId)}/refunds`, body, {
      idempotencyKey: params.idempotencyKey,
    });

    const major =
      typeof refund.amount === 'number' ? this.fromMinorUnits(refund.amount, currency) : params.amount || 0;

    return {
      success: (refund.status || '').toLowerCase() === 'pending' || (refund.status || '').toLowerCase() === 'approved',
      gatewayRefundId: refund.action_id || params.gatewayId,
      status: 'succeeded',
      totalRefunded: major,
      refundedAt: refund.processed_on ? new Date(refund.processed_on) : new Date(),
      rawResponse: refund,
    };
  }

  protected async getPaymentStatusImpl(gatewayId: string): Promise<PaymentStatus> {
    const pay = await this.requestJson<{ status?: string; approved?: boolean }>(
      'GET',
      `/payments/${encodeURIComponent(gatewayId)}`,
    );
    return this.mapPaymentStatus(pay.status, pay.approved);
  }

  verifyWebhook(rawBody: string, signature: string, headers?: Record<string, string>): boolean {
    const key = this.optionalConfig<string>('webhookSigningKey');
    if (!key) return false;
    const sig =
      signature ||
      headers?.['cko-signature'] ||
      headers?.['Cko-Signature'] ||
      '';
    if (!sig) return false;
    const expected = createHmac('sha256', key).update(rawBody, 'utf8').digest('hex');
    try {
      const a = Buffer.from(sig.trim(), 'utf8');
      const b = Buffer.from(expected, 'utf8');
      if (a.length !== b.length) return false;
      return timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  protected parseWebhookEventImpl(
    payload: unknown,
    headers?: Record<string, string>,
  ): WebhookEvent {
    const key = this.optionalConfig<string>('webhookSigningKey');
    if (key) {
      const raw =
        typeof payload === 'string'
          ? payload
          : Buffer.from(JSON.stringify(payload)).toString('utf8');
      const sig = headers?.['cko-signature'] || headers?.['Cko-Signature'] || '';
      if (!this.verifyWebhook(raw, sig, headers)) {
        throw new WebhookVerificationFailedError(KIND);
      }
    }

    let obj: Record<string, unknown>;
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      obj = payload as Record<string, unknown>;
    } else {
      throw new InvalidWebhookError(KIND, 'payload is not an object');
    }

    const type = String(obj.type || '');
    const data = (obj.data && typeof obj.data === 'object' ? obj.data : obj) as Record<string, unknown>;
    const paymentId = String(data.id || '');
    const amountMinor = typeof data.amount === 'number' ? data.amount : undefined;
    const currency = typeof data.currency === 'string' ? data.currency : undefined;
    const meta = data.metadata && typeof data.metadata === 'object' ? (data.metadata as Record<string, string>) : {};
    const orderId = meta.orderId || meta.order_id;
    const status = this.mapPaymentStatus(
      typeof data.status === 'string' ? data.status : undefined,
      typeof data.approved === 'boolean' ? data.approved : undefined,
    );
    const eventType = this.mapWebhookType(type, status);

    return {
      id: String(obj.id || paymentId || `cko-${Date.now()}`),
      type: eventType,
      gateway: KIND,
      orderId,
      gatewayPaymentId: paymentId || undefined,
      status,
      amount:
        amountMinor !== undefined && currency
          ? this.fromMinorUnits(amountMinor, currency)
          : undefined,
      currency,
      timestamp: obj.timestamp ? new Date(String(obj.timestamp)) : new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    try {
      await this.requestJson('GET', '/payment-links?limit=1');
      return {
        success: true,
        message: 'Checkout.com API credentials accepted',
        durationMs: 0,
        details: { mode: this.testMode ? 'sandbox' : 'live' },
      };
    } catch (err) {
      const message =
        err instanceof PaymentError ? err.message : err instanceof Error ? err.message : String(err);
      return { success: false, message, durationMs: 0 };
    }
  }

  private apiBase(): string {
    const prefix = this.requiredConfig<string>('apiPrefix').replace(/[^a-zA-Z0-9]/g, '');
    const host = this.testMode ? `${prefix}.api.sandbox.checkout.com` : `${prefix}.api.checkout.com`;
    return `https://${host}`;
  }

  private async requestJson<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, unknown>,
    opts: { idempotencyKey?: string } = {},
  ): Promise<T> {
    const secret = this.requiredConfig<string>('secretKey');
    const url = `${this.apiBase()}${path}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: `Bearer ${secret}`,
    };
    if (method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }
    if (opts.idempotencyKey) {
      headers['Cko-Idempotency-Key'] = opts.idempotencyKey;
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
      const err = parsed as { message?: string; error_type?: string; error_codes?: string[] };
      if (err && typeof err === 'object' && 'message' in err && err.message) {
        throw new GatewayApiError(KIND, err.message, {
          httpStatus: response.status,
          providerCode: err.error_type,
          cause: parsed,
        });
      }
      throw classifyHttpError(KIND, response.status, parsed);
    }
    return parsed as T;
  }

  private toMinorUnits(major: number, currency: string): number {
    const cur = currency.toUpperCase();
    const three = ['BHD', 'JOD', 'KWD', 'OMR', 'TND'];
    const zero = [
      'BIF',
      'CLP',
      'DJF',
      'GNF',
      'JPY',
      'KMF',
      'KRW',
      'MGA',
      'PYG',
      'RWF',
      'UGX',
      'VND',
      'VUV',
      'XAF',
      'XOF',
      'XPF',
    ];
    if (zero.includes(cur)) return Math.round(major);
    if (three.includes(cur)) return Math.round(major * 1000);
    return Math.round(major * 100);
  }

  private fromMinorUnits(minor: number, currency: string): number {
    const cur = currency.toUpperCase();
    const three = ['BHD', 'JOD', 'KWD', 'OMR', 'TND'];
    const zero = [
      'BIF',
      'CLP',
      'DJF',
      'GNF',
      'JPY',
      'KMF',
      'KRW',
      'MGA',
      'PYG',
      'RWF',
      'UGX',
      'VND',
      'VUV',
      'XAF',
      'XOF',
      'XPF',
    ];
    if (zero.includes(cur)) return minor;
    if (three.includes(cur)) return minor / 1000;
    return minor / 100;
  }

  private mapPaymentStatus(raw?: string, approved?: boolean): PaymentStatus {
    const s = (raw || '').toLowerCase();
    if (approved === true || s === 'captured' || s === 'paid' || s === 'authorized' || s === 'approved') {
      return s === 'authorized' ? 'authorized' : 'paid';
    }
    if (s === 'pending' || s === 'pending_capture') return 'pending';
    if (s === 'declined' || s === 'failed' || s === 'rejected') return 'failed';
    if (s === 'voided' || s === 'canceled' || s === 'cancelled') return 'voided';
    if (s === 'refunded') return 'refunded';
    if (s === 'partially_refunded' || s === 'partially refunded') return 'partially_refunded';
    return 'pending';
  }

  private mapWebhookType(type: string, status: PaymentStatus): WebhookEventType {
    const t = type.toLowerCase();
    if (t.includes('payment_approved') || t.includes('authorized')) return 'payment.authorized';
    if (t.includes('payment_captured') || t.includes('captured')) return 'payment.captured';
    if (t.includes('payment_pending')) return 'payment.created';
    if (t.includes('payment_declined') || t.includes('declined')) return 'payment.failed';
    if (t.includes('payment_refunded'))
      return status === 'partially_refunded' ? 'payment.partially_refunded' : 'payment.refunded';
    if (t.includes('payment_voided')) return 'payment.cancelled';
    if (status === 'paid') return 'payment.paid';
    if (status === 'failed') return 'payment.failed';
    return 'unknown';
  }
}

registerMarketing(KIND, {
  brandLabel: 'Checkout.com',
  description: 'Hosted Payment Links and global card processing with broad local payment method coverage.',
  logoPath: 'checkout.svg',
  brandColor: '#0C1142',
  websiteUrl: 'https://www.checkout.com',
  docsUrl: 'https://www.checkout.com/docs/integrate/payment-links',
  badges: ['recommended'],
  platformBillingEligible: false,
});

GatewayRegistry.register((config, options) => new CheckoutGateway(config, options));
