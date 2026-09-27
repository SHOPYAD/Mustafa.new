/**
 * Paymentwall — Widget API (single digital-good product) redirect URL.
 *
 * Widget signature v2:
 *   https://github.com/paymentwall/paymentwall-php/blob/master/lib/Paymentwall/Signature/Widget.php
 * Pingback signature:
 *   https://github.com/paymentwall/paymentwall-php/blob/master/lib/Paymentwall/Signature/Pingback.php
 */

import { createHash, timingSafeEqual } from 'crypto';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type {
  CreatePaymentParams,
  GatewayConfigField,
  GatewayPaymentResult,
  GatewayRefundResult,
  PaymentStatus,
  RefundParams,
  WebhookEvent,
  WebhookEventType,
} from '../core/types';

const KIND = 'paymentwall';

const WIDGET_BASE = 'https://api.paymentwall.com/api/subscription';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'publicKey',
    label: 'Project public key',
    type: 'text',
    required: true,
    placeholder: 't_…',
    helpText: 'Merchant Area → Projects → Key.',
  },
  {
    key: 'privateKey',
    label: 'Project secret key',
    type: 'password',
    required: true,
    secret: true,
  },
  {
    key: 'widgetCode',
    label: 'Widget code',
    type: 'text',
    required: true,
    placeholder: 'p1_…',
  },
];

export class PaymentwallGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Paymentwall';
  readonly type = 'card' as const;
  readonly supportedCountries = ['*'] as const;
  readonly supportedCurrencies = ['*'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const publicKey = this.requiredConfig<string>('publicKey');
    const privateKey = this.requiredConfig<string>('privateKey');
    const widget = this.requiredConfig<string>('widgetCode');

    const uid =
      params.customer?.email?.slice(0, 64) ||
      params.customer?.customerId?.slice(0, 64) ||
      params.orderId.slice(0, 64);

    const amountStr = this.formatAmount(params.amount, params.currency);
    const query: Record<string, string> = {
      key: publicKey,
      uid,
      widget,
      amount: amountStr,
      currencyCode: params.currency.toUpperCase(),
      ag_name: (params.description || `Order ${params.orderId}`).slice(0, 128),
      ag_external_id: params.orderId.slice(0, 128),
      ag_type: 'fixed',
      sign_version: '2',
    };
    if (params.customer?.email) query.email = params.customer.email;
    if (params.successUrl) query.success_url = params.successUrl;
    if (params.failureUrl) query.failure_url = params.failureUrl;
    if (params.callbackUrl) query.pingback_url = params.callbackUrl;

    query.sign = this.widgetSignV2(query, privateKey);

    const redirectUrl = `${WIDGET_BASE}?${new URLSearchParams(query).toString()}`;

    return {
      gatewayId: params.orderId,
      orderId: params.orderId,
      status: 'pending',
      redirectUrl,
      rawResponse: { widgetUrl: redirectUrl },
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError(
      'Paymentwall refunds are not exposed through this adapter; process refunds in the Paymentwall Merchant Area or via Paymentwall support.',
      { gateway: KIND },
    );
  }

  protected parseWebhookEventImpl(payload: unknown, _headers?: Record<string, string>): WebhookEvent {
    const flat = this.flattenPayload(payload);
    const privateKey = this.requiredConfig<string>('privateKey');
    const sig = flat.sig || '';
    const version = Number(flat.sign_version || 3);

    const copy = { ...flat };
    delete copy.sig;
    delete copy.sign;

    const expected = this.pingbackSign(copy, privateKey, version);
    if (!sig || !this.constantTimeEqual(String(sig), expected)) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const type = this.mapPingbackType(flat.type);
    const status = this.mapPingbackStatus(flat);

    return {
      id: String(flat.ref || flat.uid || `pw-${Date.now()}`),
      type,
      gateway: KIND,
      orderId: flat.ag_external_id || flat.goodsid || flat.merchant_order_id,
      gatewayPaymentId: String(flat.ref || ''),
      status,
      amount: flat.product ? Number(flat.product) : undefined,
      currency: flat.currency,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  private widgetSignV2(params: Record<string, string>, secret: string): string {
    const work = { ...params };
    delete work.sign;
    this.ksortDeepString(work);
    let base = '';
    for (const [key, value] of Object.entries(work)) {
      base += `${key}=${value === 'false' ? '0' : value}`;
    }
    base += secret;
    return createHash('md5').update(base, 'utf8').digest('hex');
  }

  private pingbackSign(params: Record<string, string>, secret: string, version: number): string {
    const work = { ...params };
    delete work.sig;
    delete work.sign;
    if (version === 2 || version === 3) {
      this.ksortDeepString(work);
    }
    let base = '';
    for (const [key, value] of Object.entries(work)) {
      if (value === undefined) continue;
      base += `${key}=${value}`;
    }
    base += secret;
    if (version === 3) {
      return createHash('sha256').update(base, 'utf8').digest('hex');
    }
    return createHash('md5').update(base, 'utf8').digest('hex');
  }

  private ksortDeepString(obj: Record<string, string>): void {
    const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
    const sorted: Record<string, string> = {};
    for (const k of keys) {
      sorted[k] = obj[k];
    }
    for (const k of Object.keys(obj)) {
      delete obj[k];
    }
    Object.assign(obj, sorted);
  }

  private flattenPayload(payload: unknown): Record<string, string> {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const o = payload as Record<string, unknown>;
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(o)) {
        if (v === undefined || v === null) continue;
        out[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
      }
      return out;
    }
    throw new InvalidWebhookError(KIND, 'payload is not an object');
  }

  private mapPingbackType(t?: string): WebhookEventType {
    const x = String(t || '').toLowerCase();
    if (x === '0') return 'payment.disputed';
    if (x === '1') return 'payment.paid';
    return 'unknown';
  }

  private mapPingbackStatus(f: Record<string, string>): PaymentStatus {
    const st = (f.status || '').toLowerCase();
    if (st === '1' || st === 'completed' || st === 'success') return 'paid';
    if (st === '0' || st === 'pending') return 'pending';
    if (st === '2' || st === 'failed') return 'failed';
    return 'pending';
  }

  private formatAmount(amount: number, currency: string): string {
    const cur = currency.toUpperCase();
    const zero = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'VND', 'XAF', 'XOF', 'XPF'];
    if (zero.includes(cur)) return String(Math.round(amount));
    return amount.toFixed(2);
  }

  private constantTimeEqual(a: string, b: string): boolean {
    const x = Buffer.from(a, 'utf8');
    const y = Buffer.from(b, 'utf8');
    if (x.length !== y.length) return false;
    return timingSafeEqual(x, y);
  }
}

registerMarketing(KIND, {
  brandLabel: 'Paymentwall',
  description: 'Monetization platform with cards, bank transfers, and local methods in 200+ countries.',
  logoPath: 'paymentwall.svg',
  brandColor: '#205081',
  websiteUrl: 'https://www.paymentwall.com',
  docsUrl: 'https://docs.paymentwall.com/integration/widget-home',
  badges: ['popular'],
  platformBillingEligible: false,
});

GatewayRegistry.register((config, options) => new PaymentwallGateway(config, options));
