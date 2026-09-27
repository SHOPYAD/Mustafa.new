/**
 * Tamara (BNPL) — POST /checkout then redirect to `checkout_url`.
 *
 * Auth: `Authorization: Bearer <api_token>`
 *
 * Sandbox: https://api-sandbox.tamara.co — Production: https://api.tamara.co
 *
 * Refund: POST /payments/simplified-refund/{order_id}
 *
 * Docs: https://docs.tamara.co/reference/createcheckoutsession
 */

import { z } from 'zod';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import {
  GatewayApiError,
  InvalidRequestError,
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

const KIND = 'tamara';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'apiToken',
    label: 'API token',
    type: 'password',
    required: true,
    secret: true,
    helpText: 'Tamara Partner Portal → API credentials.',
  },
  {
    key: 'instalments',
    label: 'Default instalment count',
    type: 'number',
    required: false,
    default: 3,
    helpText: 'Typically 3 or 4 — must match what Tamara enabled for your store.',
  },
  {
    key: 'locale',
    label: 'Checkout locale',
    type: 'select',
    required: false,
    options: [
      { value: 'en_US', label: 'English' },
      { value: 'ar_SA', label: 'Arabic' },
    ],
    default: 'en_US',
  },
];

const tamaraCreateSchema = baseCreatePaymentSchema.extend({
  successUrl: z.string().url('Tamara requires successUrl'),
  failureUrl: z.string().url('Tamara requires failureUrl'),
});

interface TamaraCheckoutResponse {
  order_id: string;
  checkout_id: string;
  checkout_url: string;
  status: string;
}

interface TamaraRefundResponse {
  order_id: string;
  refund_id?: string;
  status?: string;
  refunded_amount?: { amount: number; currency: string };
}

export class TamaraGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Tamara';
  readonly type: GatewayType = 'bnpl';
  readonly supportedCountries = ['SA', 'AE', 'BH', 'KW', 'OM'] as const;
  readonly supportedCurrencies = ['SAR', 'AED', 'BHD', 'KWD', 'OMR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected createSchema() {
    return tamaraCreateSchema;
  }

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const cur = params.currency.toUpperCase();
    const country = (params.billingAddress?.country || 'SA').toUpperCase();
    const c = params.customer || {};
    const a = params.billingAddress || {};
    const first = c.firstName || c.name?.split(' ')[0] || 'Buyer';
    const last = c.lastName || c.name?.split(' ').slice(1).join(' ') || 'User';
    const instalments = Number(this.optionalConfig<number>('instalments') ?? 3);
    const phone = (c.phone || '566000000').replace(/\D/g, '').slice(-9);

    const body = {
      order_reference_id: params.orderId,
      order_number: params.orderId,
      total_amount: { amount: params.amount, currency: cur },
      description: (params.description || `Order ${params.orderId}`).slice(0, 256),
      country_code: country,
      payment_type: 'PAY_BY_INSTALMENTS',
      instalments,
      items: [
        {
          name: (params.description || 'Order').slice(0, 255),
          type: 'Digital',
          reference_id: params.orderId,
          sku: `SKU-${params.orderId}`.slice(0, 128),
          quantity: 1,
          total_amount: { amount: String(params.amount), currency: cur },
          unit_price: { amount: params.amount, currency: cur },
        },
      ],
      consumer: {
        email: c.email || 'guest@example.com',
        first_name: first,
        last_name: last,
        phone_number: phone,
      },
      shipping_address: {
        first_name: first,
        last_name: last,
        line1: a.line1 || 'Line 1',
        city: a.city || 'Riyadh',
        country_code: country,
        phone_number: phone,
      },
      tax_amount: { amount: 0, currency: cur },
      shipping_amount: { amount: 0, currency: cur },
      merchant_url: {
        success: params.successUrl!,
        failure: params.failureUrl!,
        cancel: params.failureUrl!,
      },
      platform: 'lonaliza',
      is_mobile: false,
      locale: (this.optionalConfig<string>('locale') || 'en_US') as 'en_US' | 'ar_SA',
    };

    const res = await this.request<TamaraCheckoutResponse>('POST', '/checkout', body);

    if (!res.checkout_url || !res.order_id) {
      throw new GatewayApiError(KIND, 'Tamara did not return checkout_url or order_id', {
        cause: res,
      });
    }

    return {
      gatewayId: res.order_id,
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: res.checkout_url,
      rawResponse: res,
    };
  }

  protected async refundPaymentImpl(params: RefundParams): Promise<GatewayRefundResult> {
    if (!params.amount) {
      throw new InvalidRequestError('Tamara refunds require an explicit amount', {
        gateway: KIND,
      });
    }
    const cur = (params.currency || 'SAR').toUpperCase();
    const res = await this.request<TamaraRefundResponse>(
      'POST',
      `/payments/simplified-refund/${encodeURIComponent(params.gatewayId)}`,
      {
        total_amount: { amount: params.amount, currency: cur },
        comment: params.reason || 'Refund',
        merchant_refund_id: params.idempotencyKey,
      },
    );
    const refAmt = res.refunded_amount?.amount ?? params.amount;
    return {
      success: true,
      gatewayRefundId: res.refund_id || res.order_id,
      status: 'succeeded',
      totalRefunded: refAmt,
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
    const p = payload as Record<string, unknown>;
    const orderId =
      typeof p.order_id === 'string'
        ? p.order_id
        : typeof (p.order as Record<string, unknown>)?.order_id === 'string'
          ? String((p.order as Record<string, unknown>).order_id)
          : undefined;
    const statusRaw = String(p.order_status || p.status || '').toLowerCase();
    let mapped: PaymentStatus = 'pending';
    if (statusRaw.includes('approved') || statusRaw.includes('authorised')) {
      mapped = 'authorized';
    }
    if (statusRaw.includes('captured') || statusRaw.includes('fully_captured')) {
      mapped = 'paid';
    }
    if (statusRaw.includes('refund')) {
      mapped = 'refunded';
    }
    if (statusRaw.includes('fail') || statusRaw.includes('declin')) {
      mapped = 'failed';
    }
    if (statusRaw.includes('cancel')) {
      mapped = 'cancelled';
    }

    const eventType: WebhookEventType =
      mapped === 'paid'
        ? 'payment.paid'
        : mapped === 'failed'
          ? 'payment.failed'
          : mapped === 'refunded'
            ? 'payment.refunded'
            : 'payment.created';

    return {
      id: String(orderId || p.event_id || `tamara_${Date.now()}`),
      type: eventType,
      gateway: KIND,
      orderId: typeof p.order_reference_id === 'string' ? p.order_reference_id : undefined,
      gatewayPaymentId: orderId,
      status: mapped,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    try {
      this.requiredConfig<string>('apiToken');
      return {
        success: true,
        message:
          'API token configured. Run a sandbox checkout to verify end-to-end connectivity.',
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

  private baseUrl(): string {
    return this.testMode ? 'https://api-sandbox.tamara.co' : 'https://api.tamara.co';
  }

  private async request<T>(method: 'POST' | 'GET', path: string, body?: unknown): Promise<T> {
    const token = this.requiredConfig<string>('apiToken');
    const url = `${this.baseUrl()}${path}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
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
  brandLabel: 'Tamara',
  description: 'Buy now, pay in installments — GCC markets including KSA, UAE, and Kuwait.',
  logoPath: 'tamara.svg',
  brandColor: '#FF3E6C',
  websiteUrl: 'https://www.tamara.co',
  docsUrl: 'https://docs.tamara.co/reference/createcheckoutsession',
  badges: ['popular'],
  platformBillingEligible: false,
});

GatewayRegistry.register((config, options) => new TamaraGateway(config, options));
