/**
 * PayTabs (KSA / UAE / Egypt / Oman / Jordan / Global) — hosted Paypage v2.
 *
 * Flow:
 *   1. POST {regionBase}/payment/request with `tran_type=sale, tran_class=ecom`.
 *      Response includes `tran_ref` (gateway id) and `redirect_url` (hosted page).
 *   2. Buyer completes payment on PayTabs-hosted page.
 *   3. PayTabs calls our `callback` URL server-to-server with signed JSON body.
 *      Header `signature` = HMAC-SHA256(raw JSON body, serverKey), lowercase hex.
 *
 * Refund:
 *   POST {regionBase}/payment/request with `tran_type=refund, tran_class=ecom, tran_ref=<sale tran_ref>`.
 *
 * Region hosts:
 *   SA     https://secure.paytabs.sa
 *   AE     https://secure.paytabs.com
 *   EG     https://secure-egypt.paytabs.com
 *   OM     https://secure-oman.paytabs.com
 *   JO     https://secure-jordan.paytabs.com
 *   GLOBAL https://secure-global.paytabs.com
 *
 * Docs: https://site.paytabs.com/en/knowledge-base/paytabs-paypage-api/
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

const KIND = 'paytabs';

const REGION_BASE: Record<string, string> = {
  sa: 'https://secure.paytabs.sa',
  ae: 'https://secure.paytabs.com',
  eg: 'https://secure-egypt.paytabs.com',
  om: 'https://secure-oman.paytabs.com',
  jo: 'https://secure-jordan.paytabs.com',
  global: 'https://secure-global.paytabs.com',
};

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'profileId',
    label: 'Profile ID',
    type: 'text',
    required: true,
    placeholder: '12345',
    helpText: 'PayTabs merchant dashboard → Developers → Profile ID.',
  },
  {
    key: 'serverKey',
    label: 'Server key',
    type: 'password',
    required: true,
    secret: true,
    placeholder: 'SBJ9…',
    helpText:
      'Server-to-server secret. Used as the Authorization header and as the HMAC key for callback signature verification.',
  },
  {
    key: 'clientKey',
    label: 'Client key',
    type: 'text',
    required: false,
    placeholder: 'CJK…',
    helpText: 'Optional — used by the browser SDK for the embedded checkout variant.',
  },
  {
    key: 'region',
    label: 'Region',
    type: 'select',
    required: false,
    options: [
      { value: 'sa', label: 'Saudi Arabia (secure.paytabs.sa)' },
      { value: 'ae', label: 'UAE (secure.paytabs.com)' },
      { value: 'eg', label: 'Egypt (secure-egypt.paytabs.com)' },
      { value: 'om', label: 'Oman (secure-oman.paytabs.com)' },
      { value: 'jo', label: 'Jordan (secure-jordan.paytabs.com)' },
      { value: 'global', label: 'Global (secure-global.paytabs.com)' },
    ],
    default: 'sa',
  },
  {
    key: 'paypageLang',
    label: 'Paypage language',
    type: 'select',
    required: false,
    options: [
      { value: 'ar', label: 'Arabic' },
      { value: 'en', label: 'English' },
    ],
    default: 'en',
  },
];

const paytabsCreateSchema = baseCreatePaymentSchema.extend({
  successUrl: z.string().url('PayTabs requires successUrl as the return URL'),
  callbackUrl: z.string().url('PayTabs requires callbackUrl for server-to-server notifications'),
});

interface PayTabsCreateResponse {
  tran_ref?: string;
  redirect_url?: string;
  payment_url?: string;
  message?: string;
  code?: string;
  trace?: string;
}

interface PayTabsRefundResponse {
  tran_ref?: string;
  payment_result?: {
    response_status?: string;
    response_code?: string;
    response_message?: string;
  };
  cart_amount?: string;
  cart_currency?: string;
  message?: string;
}

export class PayTabsGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'PayTabs';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = [
    'SA',
    'AE',
    'EG',
    'OM',
    'JO',
    'KW',
    'BH',
    'QA',
    'IQ',
    'PS',
    '*',
  ] as const;
  readonly supportedCurrencies = [
    'SAR',
    'AED',
    'EGP',
    'OMR',
    'JOD',
    'KWD',
    'BHD',
    'QAR',
    'USD',
    'EUR',
    'GBP',
  ] as const;
  readonly configFields = CONFIG_FIELDS;

  protected createSchema() {
    return paytabsCreateSchema;
  }

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const currency = params.currency.toUpperCase();
    const body: Record<string, unknown> = {
      profile_id: this.profileIdNumeric(),
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: params.orderId.slice(0, 50),
      cart_description: (params.description || `Order ${params.orderId}`).slice(0, 150),
      cart_currency: currency,
      cart_amount: this.formatAmount(params.amount, currency),
      paypage_lang: this.optionalConfig<string>('paypageLang') || 'en',
      callback: params.metadata?.webhookUrl || params.callbackUrl,
      return: params.successUrl,
      customer_details: this.buildCustomer(params),
      framed: false,
      hide_shipping: true,
    };

    if (params.idempotencyKey) {
      body.user_defined = { idempotency_key: params.idempotencyKey };
    }

    const res = await this.request<PayTabsCreateResponse>('POST', '/payment/request', body);

    const redirect = res.redirect_url || res.payment_url;
    if (!res.tran_ref || !redirect) {
      throw new GatewayApiError(
        KIND,
        res.message || 'PayTabs did not return a tran_ref / redirect_url',
        { cause: res },
      );
    }

    return {
      gatewayId: res.tran_ref,
      orderId: params.orderId,
      status: 'pending' as PaymentStatus,
      redirectUrl: redirect,
      rawResponse: res,
    };
  }

  protected async refundPaymentImpl(params: RefundParams): Promise<GatewayRefundResult> {
    if (!params.amount) {
      throw new InvalidRequestError('PayTabs refunds require an explicit amount', {
        gateway: KIND,
      });
    }
    const currency = (params.currency || 'SAR').toUpperCase();
    const body: Record<string, unknown> = {
      profile_id: this.profileIdNumeric(),
      tran_type: 'refund',
      tran_class: 'ecom',
      tran_ref: params.gatewayId,
      cart_id: params.idempotencyKey?.slice(0, 50) || `refund_${Date.now()}`,
      cart_currency: currency,
      cart_amount: this.formatAmount(params.amount, currency),
      cart_description: (params.reason || 'Refund').slice(0, 150),
    };

    const res = await this.request<PayTabsRefundResponse>('POST', '/payment/request', body);
    const status = (res.payment_result?.response_status || '').toUpperCase();
    const ok = status === 'A' || status === 'H' || status === 'P';
    return {
      success: ok,
      gatewayRefundId: res.tran_ref || params.gatewayId,
      status: ok ? 'succeeded' : 'failed',
      totalRefunded: params.amount,
      refundedAt: new Date(),
      rawResponse: res,
    };
  }

  protected parseWebhookEventImpl(
    payload: unknown,
    headers?: Record<string, string>,
  ): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not an object');
    }

    const receivedSig = headers
      ? headers['signature'] || headers['Signature'] || headers['x-signature']
      : undefined;

    if (receivedSig) {
      const serverKey = this.optionalConfig<string>('serverKey');
      if (!serverKey) {
        throw new InvalidWebhookError(
          KIND,
          'Callback includes signature but serverKey is not configured',
        );
      }
      const canonical = JSON.stringify(payload);
      const expected = createHmac('sha256', serverKey).update(canonical).digest('hex');
      if (!this.constantTimeEqualHex(expected, String(receivedSig))) {
        throw new WebhookVerificationFailedError(KIND);
      }
    }

    const root = payload as Record<string, unknown>;
    const pr = (root.payment_result as Record<string, unknown>) || {};
    const responseStatus = String(pr.response_status || '').toUpperCase();
    const mappedStatus = this.mapPaytabsStatus(responseStatus);
    const eventType = this.mapWebhookEventType(String(root.tran_type || ''), mappedStatus);

    const cartId = typeof root.cart_id === 'string' ? root.cart_id : undefined;
    const tranRef = typeof root.tran_ref === 'string' ? root.tran_ref : undefined;
    const amount = root.cart_amount ? parseFloat(String(root.cart_amount)) : undefined;

    return {
      id: tranRef || `paytabs_${Date.now()}`,
      type: eventType,
      gateway: KIND,
      orderId: cartId,
      gatewayPaymentId: tranRef,
      status: mappedStatus,
      amount: Number.isFinite(amount as number) ? (amount as number) : undefined,
      currency:
        typeof root.cart_currency === 'string'
          ? (root.cart_currency as string).toUpperCase()
          : undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    const profileId = this.profileIdNumeric();
    const serverKey = this.requiredConfig<string>('serverKey');
    if (!serverKey || !profileId) {
      return { success: false, message: 'Missing profileId or serverKey', durationMs: 0 };
    }
    const probe: Record<string, unknown> = {
      profile_id: profileId,
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: `probe_${Date.now()}`,
      cart_description: 'PayTabs credential probe (not a real charge)',
      cart_currency: 'SAR',
      cart_amount: '0.10',
      paypage_lang: 'en',
      framed: false,
      hide_shipping: true,
      customer_details: {
        name: 'Probe User',
        email: 'probe@example.com',
        phone: '+966500000000',
        street1: 'Probe',
        city: 'Riyadh',
        state: 'Riyadh',
        country: 'SA',
        zip: '11564',
      },
    };
    try {
      const res = await this.request<PayTabsCreateResponse>('POST', '/payment/request', probe);
      const ok = Boolean(res.tran_ref && (res.redirect_url || res.payment_url));
      return {
        success: ok,
        message: ok
          ? 'PayTabs credentials accepted'
          : res.message || 'PayTabs rejected the probe request',
        durationMs: 0,
        details: { region: this.optionalConfig<string>('region') || 'sa', code: res.code },
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
    const r = (this.optionalConfig<string>('region') || 'sa').toLowerCase();
    return REGION_BASE[r] || REGION_BASE.sa;
  }

  private profileIdNumeric(): number {
    const raw = this.requiredConfig<string | number>('profileId');
    const n = typeof raw === 'number' ? raw : Number.parseInt(String(raw), 10);
    if (!Number.isFinite(n)) {
      throw new InvalidRequestError('PayTabs profileId must be numeric', { gateway: KIND });
    }
    return n;
  }

  private async request<T>(
    method: 'POST',
    path: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    const url = `${this.baseUrl()}${path}`;
    const serverKey = this.requiredConfig<string>('serverKey');

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: serverKey,
        },
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
      const err = parsed as { message?: string; code?: string };
      if (err && typeof err === 'object' && err.message) {
        throw new GatewayApiError(KIND, err.message, {
          httpStatus: response.status,
          providerCode: err.code,
          cause: parsed,
        });
      }
      throw classifyHttpError(KIND, response.status, parsed);
    }
    return parsed as T;
  }

  private buildCustomer(params: CreatePaymentParams): Record<string, string> {
    const c = params.customer || {};
    const a = params.billingAddress || {};
    const fullName =
      c.name || [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || 'Buyer';
    const country = (a.country || 'SA').toUpperCase();
    return {
      name: fullName.slice(0, 60),
      email: c.email || 'guest@example.com',
      phone: (c.phone || '+966500000000').replace(/\s/g, ''),
      street1: (a.line1 || 'NA').slice(0, 60),
      city: a.city || 'Riyadh',
      state: a.state || country,
      country,
      zip: a.postalCode || '00000',
      ip: params.metadata?.ip || '0.0.0.0',
    };
  }

  private formatAmount(major: number, currency: string): string {
    const three = ['BHD', 'JOD', 'KWD', 'OMR', 'TND'];
    const cur = currency.toUpperCase();
    if (three.includes(cur)) return major.toFixed(3);
    return major.toFixed(2);
  }

  private mapPaytabsStatus(letter: string): PaymentStatus {
    switch (letter) {
      case 'A':
        return 'paid';
      case 'H':
        return 'authorized';
      case 'P':
        return 'pending';
      case 'V':
        return 'voided';
      case 'D':
      case 'E':
        return 'failed';
      default:
        return 'pending';
    }
  }

  private mapWebhookEventType(tranType: string, status: PaymentStatus): WebhookEventType {
    const t = tranType.toLowerCase();
    if (t === 'refund' || t === 'return') return 'payment.refunded';
    if (t === 'void') return 'payment.cancelled';
    if (t === 'auth') return 'payment.authorized';
    if (status === 'paid') return 'payment.paid';
    if (status === 'failed') return 'payment.failed';
    if (status === 'cancelled' || status === 'voided') return 'payment.cancelled';
    return 'payment.created';
  }

  private constantTimeEqualHex(a: string, b: string): boolean {
    try {
      const ba = Buffer.from(a.toLowerCase(), 'hex');
      const bb = Buffer.from(b.toLowerCase(), 'hex');
      if (ba.length !== bb.length) return false;
      return timingSafeEqual(ba, bb);
    } catch {
      return false;
    }
  }
}

registerMarketing(KIND, {
  brandLabel: 'PayTabs',
  description: 'GCC payment gateway — Mada, Apple Pay, STC Pay, and multi-currency support.',
  logoPath: 'paytabs.svg',
  brandColor: '#0090C7',
  websiteUrl: 'https://paytabs.com',
  docsUrl: 'https://site.paytabs.com/en/knowledge-base/paytabs-paypage-api/',
  badges: ['popular'],
  platformBillingEligible: false,
});

GatewayRegistry.register((config, options) => new PayTabsGateway(config, options));
