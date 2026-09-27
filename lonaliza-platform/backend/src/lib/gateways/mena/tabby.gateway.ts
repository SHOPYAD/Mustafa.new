/**
 * Tabby (BNPL) — hosted checkout via POST /api/v2/checkout.
 *
 * Auth: `Authorization: Bearer <secret_key>`.
 *
 * Redirect: `configuration.available_products.installments[].web_url`
 *
 * Refund: POST /api/v2/payments/{payment_id}/refunds
 *
 * KSA: https://api.tabby.sa — UAE/KW: https://api.tabby.ai
 *
 * Docs: https://docs.tabby.ai/api-reference/checkout/create-a-session
 */

import { z } from 'zod';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import {
  GatewayApiError,
  InvalidRequestError,
  InvalidWebhookError,
  NetworkError,
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

const KIND = 'tabby';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'secretKey',
    label: 'Secret key',
    type: 'password',
    required: true,
    secret: true,
    helpText: 'Tabby Merchant Dashboard → Settings → API credentials → Secret key.',
  },
  {
    key: 'merchantCode',
    label: 'Merchant code',
    type: 'text',
    required: true,
    helpText: 'Assigned by your Tabby integration manager.',
  },
  {
    key: 'region',
    label: 'API region',
    type: 'select',
    required: false,
    options: [
      { value: 'ksa', label: 'Saudi Arabia (api.tabby.sa)' },
      { value: 'uae', label: 'UAE / Kuwait (api.tabby.ai)' },
    ],
    default: 'uae',
  },
  {
    key: 'lang',
    label: 'Checkout language',
    type: 'select',
    required: false,
    options: [
      { value: 'en', label: 'English' },
      { value: 'ar', label: 'Arabic' },
    ],
    default: 'en',
  },
];

const tabbyCreateSchema = baseCreatePaymentSchema.extend({
  successUrl: z.string().url('Tabby requires successUrl'),
  failureUrl: z.string().url('Tabby requires failureUrl'),
});

interface TabbyCheckoutSession {
  id?: string;
  status?: string;
  payment?: { id?: string; status?: string; amount?: string; currency?: string };
  configuration?: {
    available_products?: {
      installments?: Array<{ web_url?: string }>;
    };
  };
}

interface TabbyPaymentGet {
  id: string;
  status: string;
}

export class TabbyGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Tabby';
  readonly type: GatewayType = 'bnpl';
  readonly supportedCountries = ['SA', 'AE', 'KW'] as const;
  readonly supportedCurrencies = ['SAR', 'AED', 'KWD'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected createSchema() {
    return tabbyCreateSchema;
  }

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const now = new Date().toISOString();
    const amountStr = this.formatAmount(params.amount, params.currency);
    const c = params.customer || {};
    const ship = params.billingAddress || {};
    const buyerName = c.name || `${c.firstName || 'Buyer'} ${c.lastName || ''}`.trim();
    const body = {
      payment: {
        amount: amountStr,
        currency: params.currency.toUpperCase(),
        description: (params.description || `Order ${params.orderId}`).slice(0, 200),
        buyer: {
          name: buyerName,
          email: c.email || 'guest@example.com',
          phone: this.normalizePhone(c.phone, params.billingAddress?.country),
        },
        shipping_address: {
          city: ship.city || 'Dubai',
          address: ship.line1 || 'Address',
          zip: ship.postalCode || '00000',
        },
        order: {
          reference_id: params.orderId,
          updated_at: now,
          tax_amount: '0.00',
          shipping_amount: '0.00',
          discount_amount: '0.00',
          items: [
            {
              reference_id: params.orderId,
              title: (params.description || 'Order').slice(0, 120),
              description: (params.description || 'Item').slice(0, 200),
              quantity: 1,
              unit_price: amountStr,
              category: 'General',
            },
          ],
        },
        buyer_history: {
          registered_since: now,
          loyalty_level: 0,
          wishlist_count: 0,
        },
        order_history: [
          {
            purchased_at: now,
            amount: amountStr,
            payment_method: 'card' as const,
            status: 'complete' as const,
            buyer: {
              name: buyerName,
              email: c.email || 'guest@example.com',
              phone: this.normalizePhone(c.phone, params.billingAddress?.country),
            },
            shipping_address: {
              city: ship.city || 'Dubai',
              address: ship.line1 || 'Address',
              zip: ship.postalCode || '00000',
            },
            items: [
              {
                reference_id: `${params.orderId}-hist`,
                title: 'Previous order',
                quantity: 1,
                unit_price: '1.00',
                category: 'General',
              },
            ],
          },
        ],
        meta: {
          order_id: params.orderId,
          subdomain: params.subdomain,
        },
      },
      lang: (this.optionalConfig<string>('lang') || 'en') as 'en' | 'ar',
      merchant_code: this.requiredConfig<string>('merchantCode'),
      merchant_urls: {
        success: params.successUrl!,
        cancel: params.failureUrl!,
        failure: params.failureUrl!,
      },
    };

    const session = await this.request<TabbyCheckoutSession>('POST', '/api/v2/checkout', body);

    if (session.status === 'rejected') {
      throw new GatewayApiError(KIND, 'Tabby rejected this customer for BNPL', {
        cause: session,
      });
    }

    const webUrl =
      session.configuration?.available_products?.installments?.find((i) => i.web_url)?.web_url;
    if (!webUrl) {
      throw new GatewayApiError(KIND, 'Tabby response missing installments web_url', {
        cause: session,
      });
    }

    const paymentId = session.payment?.id || session.id;
    if (!paymentId) {
      throw new GatewayApiError(KIND, 'Tabby response missing payment id', { cause: session });
    }

    return {
      gatewayId: paymentId,
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: webUrl,
      rawResponse: session,
    };
  }

  protected async refundPaymentImpl(params: RefundParams): Promise<GatewayRefundResult> {
    if (!params.amount) {
      throw new InvalidRequestError('Tabby refunds require an explicit amount', {
        gateway: KIND,
      });
    }
    const amountStr = this.formatAmount(params.amount, params.currency || 'AED');
    const body = {
      amount: amountStr,
      reference_id: params.idempotencyKey || `ref_${params.gatewayId}_${Date.now()}`,
      reason: params.reason || 'Refund',
    };
    const payment = await this.request<TabbyPaymentGet>(
      'POST',
      `/api/v2/payments/${encodeURIComponent(params.gatewayId)}/refunds`,
      body,
    );
    return {
      success: true,
      gatewayRefundId: payment.id,
      status: 'succeeded',
      totalRefunded: params.amount,
      refundedAt: new Date(),
      rawResponse: payment,
    };
  }

  protected parseWebhookEventImpl(
    payload: unknown,
    _headers?: Record<string, string>,
  ): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not an object');
    }
    const p = payload as Record<string, unknown>;
    const pay = (p.payment as Record<string, unknown>) || p;
    const statusRaw = String(pay.status || '').toUpperCase();
    const mapped: PaymentStatus =
      statusRaw === 'CLOSED' || statusRaw === 'AUTHORIZED'
        ? 'paid'
        : statusRaw === 'REJECTED'
          ? 'failed'
          : statusRaw === 'EXPIRED'
            ? 'expired'
            : 'pending';
    const eventType: WebhookEventType =
      mapped === 'paid'
        ? 'payment.paid'
        : mapped === 'failed'
          ? 'payment.failed'
          : mapped === 'expired'
            ? 'payment.expired'
            : 'payment.created';

    const amt = typeof pay.amount === 'string' ? Number.parseFloat(pay.amount) : Number(pay.amount);
    const ord = pay.order as Record<string, unknown> | undefined;

    return {
      id: String(pay.id || p.id || `tabby_${Date.now()}`),
      type: eventType,
      gateway: KIND,
      orderId: typeof ord?.reference_id === 'string' ? (ord.reference_id as string) : undefined,
      gatewayPaymentId: typeof pay.id === 'string' ? pay.id : String(pay.id ?? ''),
      status: mapped,
      amount: Number.isFinite(amt) ? amt : undefined,
      currency: typeof pay.currency === 'string' ? pay.currency : undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    try {
      await this.request('GET', '/api/v2/payments?limit=1');
      return {
        success: true,
        message: 'Tabby secret key accepted',
        durationMs: 0,
        details: { region: this.optionalConfig<string>('region') ?? 'uae' },
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
    const r = (this.optionalConfig<string>('region') || 'uae').toLowerCase();
    return r === 'ksa' ? 'https://api.tabby.sa' : 'https://api.tabby.ai';
  }

  private formatAmount(amount: number, currency: string): string {
    const c = currency.toUpperCase();
    const decimals = c === 'KWD' ? 3 : 2;
    return amount.toFixed(decimals);
  }

  private normalizePhone(phone?: string, country?: string): string {
    if (!phone) {
      return country === 'SA' ? '500000000' : '500000001';
    }
    return phone.replace(/\s/g, '').replace(/^\+/, '');
  }

  private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const secret = this.requiredConfig<string>('secretKey');
    const url = `${this.baseUrl()}${path}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${secret}`,
          ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        },
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
      throw classifyHttpError(KIND, response.status, parsed);
    }
    return parsed as T;
  }
}

registerMarketing(KIND, {
  brandLabel: 'Tabby',
  description: 'Buy now, pay later — available in Saudi Arabia, UAE, and Kuwait.',
  logoPath: 'tabby.svg',
  brandColor: '#3EEDBF',
  websiteUrl: 'https://tabby.ai',
  docsUrl: 'https://docs.tabby.ai/api-reference/checkout/create-a-session',
  badges: ['recommended', 'popular'],
  platformBillingEligible: false,
});

GatewayRegistry.register((config, options) => new TabbyGateway(config, options));
