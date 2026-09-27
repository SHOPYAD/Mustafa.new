/**
 * Verifone 2Checkout — hosted buy-link (`order/checkout.php`) with `PHASH` (HMAC_SHA256).
 *
 * Signing rules:
 *   https://verifone.cloud/docs/2checkout/Documentation/07Commerce/Checkout-links-and-options/Buy-Link-parameters
 */

import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { InvalidRequestError, InvalidWebhookError } from '../core/errors';
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

const KIND = 'twocheckout';

const CHECKOUT_URL = 'https://secure.2checkout.com/order/checkout.php';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'sellerId',
    label: 'Merchant / Seller ID',
    type: 'text',
    required: true,
    placeholder: 'numeric seller id',
    helpText: 'Used when validating INS/IPN payloads (vendor_id).',
  },
  {
    key: 'secretKey',
    label: 'Buy-link secret key',
    type: 'password',
    required: true,
    secret: true,
    helpText: 'Control Panel → Integrations → Webhooks & API → Secret key for PHASH.',
  },
  {
    key: 'productId',
    label: '2Checkout product ID',
    type: 'text',
    required: true,
    placeholder: '1234567',
    helpText: 'Catalog product numeric ID (`PRODS=`).',
  },
  {
    key: 'insSecretWord',
    label: 'INS / IPN secret word (optional)',
    type: 'password',
    required: false,
    secret: true,
    helpText: 'If set, validates legacy MD5 signatures on some INS payloads.',
  },
];

export class TwoCheckoutGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = '2Checkout (Verifone)';
  readonly type = 'card' as const;
  readonly supportedCountries = ['*'] as const;
  readonly supportedCurrencies = ['*'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const secretKey = this.requiredConfig<string>('secretKey');
    const productId = this.requiredConfig<string>('productId');
    const currency = params.currency.toUpperCase();
    const priceVal = this.formatPrice(params.amount, currency);
    const priceParam = `PRICES${productId}[${currency}]=${priceVal}`;

    const chunks: string[] = [
      'CART=1',
      `PRODS=${productId}`,
      'QTY=1',
      `CURRENCY=${currency}`,
      `REF=${params.orderId.slice(0, 100)}`,
      priceParam,
    ];
    if (params.successUrl) {
      chunks.push(`BACK_REF=${params.successUrl}`);
    }
    if (this.testMode) {
      chunks.push('DOTEST=1');
    }

    const paramString = chunks.join('&');
    const toSign = `${paramString.length}${paramString}`;
    const digest = createHmac('sha256', secretKey).update(toSign, 'utf8').digest('hex');
    const phash = `sha256.${digest}`;

    const redirectUrl = `${CHECKOUT_URL}?${paramString}&PHASH=${encodeURIComponent(phash)}`;

    return {
      gatewayId: params.orderId,
      orderId: params.orderId,
      status: 'pending',
      redirectUrl,
      rawResponse: { checkout: CHECKOUT_URL },
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError(
      'Use Verifone Central or the 2Checkout REST API to refund; this adapter only issues hosted buy-links.',
      { gateway: KIND },
    );
  }

  protected parseWebhookEventImpl(payload: unknown, _headers?: Record<string, string>): WebhookEvent {
    const flat = this.asFlat(payload);
    const secretWord = this.optionalConfig<string>('insSecretWord');
    const sellerId = this.optionalConfig<string>('sellerId');

    if (secretWord) {
      const vendor = String(flat.vendor_id || flat.sid || sellerId || '');
      const orderNo = String(flat.order_number || flat.ORDER_NUMBER || '');
      const total = String(flat.total || flat.IPN_TOTAL || flat.TOTAL || '');
      const md5Received = (flat.md5_hash || '').toString().toUpperCase();
      const expected = createHash('md5')
        .update(`${secretWord}${vendor}${orderNo}${total}`, 'utf8')
        .digest('hex')
        .toUpperCase();
      if (!md5Received || !this.constantTimeEqual(md5Received, expected)) {
        throw new InvalidWebhookError(KIND, 'INS md5_hash verification failed');
      }
    }

    const status = this.mapInsStatus(flat.ORDERSTATUS || flat.order_status || flat.status);
    const type = this.mapInsType(status);

    return {
      id: String(flat.SALE_ID || flat.sale_id || flat.refno || `2co-${Date.now()}`),
      type,
      gateway: KIND,
      orderId: flat.REF || flat.merchant_order_id || flat.vendor_order_id,
      gatewayPaymentId: String(flat.SALE_ID || flat.sale_id || ''),
      status,
      amount: flat.IPN_TOTAL ? Number(flat.IPN_TOTAL) : flat.total ? Number(flat.total) : undefined,
      currency: flat.IPN_CURRENCY || flat.currency,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  private asFlat(payload: unknown): Record<string, string> {
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

  private mapInsStatus(raw?: string): PaymentStatus {
    const s = (raw || '').toUpperCase();
    if (s === 'COMPLETE' || s === 'PAYMENT_RECEIVED') return 'paid';
    if (s === 'REFUND') return 'refunded';
    if (s === 'CHARGEBACK') return 'failed';
    if (s === 'CANCELED' || s === 'CANCELLED') return 'cancelled';
    return 'pending';
  }

  private mapInsType(status: PaymentStatus): WebhookEventType {
    if (status === 'paid') return 'payment.paid';
    if (status === 'refunded') return 'payment.refunded';
    if (status === 'failed') return 'payment.failed';
    if (status === 'cancelled') return 'payment.cancelled';
    return 'unknown';
  }

  private formatPrice(amount: number, currency: string): string {
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
  brandLabel: '2Checkout',
  description: 'Verifone 2Checkout hosted cart with global card and local payment methods.',
  logoPath: '2checkout.svg',
  brandColor: '#005EB8',
  websiteUrl: 'https://www.2checkout.com',
  docsUrl:
    'https://verifone.cloud/docs/2checkout/Documentation/07Commerce/Checkout-links-and-options/Buy-Link-parameters',
  badges: ['recommended'],
  platformBillingEligible: false,
});

GatewayRegistry.register((config, options) => new TwoCheckoutGateway(config, options));
