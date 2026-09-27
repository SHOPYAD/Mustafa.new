/**
 * Shopier (Turkey) — hosted-form / direct-post integration.
 *
 * Flow:
 *   1. createPayment builds a signed payload and asks the controller to POST
 *      it to https://www.shopier.com/ShowProductDetails/api_pay4.php as an
 *      auto-submitting HTML form. Because this plugin's `redirectUrl` semantics
 *      assume a GET, we expose the form fields in `rawResponse.formFields`
 *      and the action URL in `redirectUrl`. The web layer is responsible for
 *      either:
 *         a) rendering an auto-submit form, OR
 *         b) appending the fields as form-data to a thin redirector page.
 *      Both options are documented in the integration guide.
 *   2. Shopier hosts the card form, runs 3DS, then POSTs the result
 *      form-urlencoded to our callbackUrl with: platform_order_id, status,
 *      installment, payment_id, random_nr, signature.
 *   3. parseWebhookEventImpl verifies the signature.
 *   4. Refunds are NOT exposed via Shopier's public API; merchants must
 *      issue them from the Shopier panel. We surface that explicitly.
 *
 * Auth signatures (HMAC-SHA256, base64-encoded):
 *   create:  data = random_nr + platform_order_id + total_order_value + currency
 *   webhook: data = random_nr + platform_order_id
 *   key:     API_secret  (always)
 *
 * Docs: https://destek.shopier.com/hc/en-us/articles/360008173393
 */

import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { z } from 'zod';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import {
  InvalidRequestError,
  InvalidWebhookError,
  PaymentError,
  WebhookVerificationFailedError,
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
} from '../core/types';
import { baseCreatePaymentSchema } from '../core/validation';

const KIND = 'shopier';
const FORM_ACTION = 'https://www.shopier.com/ShowProductDetails/api_pay4.php';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'apiKey',
    label: 'API Key',
    type: 'text',
    required: true,
    helpText: 'Shopier paneli → Hesabım → API Bilgilerim → API key.',
  },
  {
    key: 'apiSecret',
    label: 'API Secret',
    type: 'password',
    required: true,
    secret: true,
    helpText: 'Used for HMAC signing. Keep secret.',
  },
  {
    key: 'websiteIndex',
    label: 'Website index',
    type: 'number',
    required: false,
    helpText: 'Default 1. Only change if Shopier issued additional website indices.',
    default: 1,
  },
  {
    key: 'language',
    label: 'Default language',
    type: 'select',
    required: false,
    options: [
      { value: '0', label: 'Türkçe' },
      { value: '1', label: 'English' },
    ],
    default: '0',
  },
];

const shopierCreateSchema = baseCreatePaymentSchema.extend({
  callbackUrl: z.string().url('Shopier requires callbackUrl'),
});

const CURRENCY_MAP: Record<string, string> = {
  TRY: '0',
  TL: '0',
  USD: '1',
  EUR: '2',
};

export class ShopierGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Shopier';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['TR'] as const;
  readonly supportedCurrencies = ['TRY', 'USD', 'EUR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected createSchema() {
    return shopierCreateSchema;
  }

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const apiKey = this.requiredConfig<string>('apiKey');
    const apiSecret = this.requiredConfig<string>('apiSecret');
    const websiteIndex = String(this.optionalConfig<number>('websiteIndex') ?? 1);
    const language = this.optionalConfig<string>('language') ?? '0';

    const platformOrderId = this.normalizeOid(params.orderId);
    const totalOrderValue = params.amount.toFixed(2);
    const currencyCode = this.mapCurrency(params.currency);
    const randomNr = randomBytes(8).toString('hex');

    const sigPayload = randomNr + platformOrderId + totalOrderValue + currencyCode;
    const signature = createHmac('sha256', apiSecret).update(sigPayload).digest('base64');

    const c = params.customer || {};
    const a = params.billingAddress || {};

    const formFields: Record<string, string> = {
      API_key: apiKey,
      website_index: websiteIndex,
      platform_order_id: platformOrderId,
      product_name: (params.description || 'Order').slice(0, 80),
      product_type: '1',
      buyer_name: c.firstName || c.name || 'Buyer',
      buyer_surname: c.lastName || 'User',
      buyer_email: c.email || 'guest@example.com',
      buyer_account_age: '0',
      buyer_id_nr: c.customerId || platformOrderId,
      buyer_phone: c.phone || '+905555555555',
      billing_address: a.line1 || 'N/A',
      billing_city: a.city || 'Istanbul',
      billing_country: 'Turkey',
      billing_postcode: a.postalCode || '34000',
      shipping_address: a.line1 || 'N/A',
      shipping_city: a.city || 'Istanbul',
      shipping_country: 'Turkey',
      shipping_postcode: a.postalCode || '34000',
      total_order_value: totalOrderValue,
      currency: currencyCode,
      platform: '0',
      is_in_frame: '0',
      current_language: language,
      modul_version: 'lonaliza-2.0',
      random_nr: randomNr,
      signature,
      ok_url: params.successUrl || params.callbackUrl!,
      fail_url: params.failureUrl || params.callbackUrl!,
    };

    return {
      gatewayId: platformOrderId,
      orderId: params.orderId,
      status: 'pending' as PaymentStatus,
      // The web layer must build an auto-submit POST form pointing at this URL.
      redirectUrl: FORM_ACTION,
      rawResponse: {
        method: 'POST',
        action: FORM_ACTION,
        formFields,
      },
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError(
      'Shopier does not expose refunds via its public API. ' +
        'Issue refunds from the Shopier merchant panel instead.',
      { gateway: KIND },
    );
  }

  protected parseWebhookEventImpl(
    payload: unknown,
    _headers?: Record<string, string>,
  ): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not an object');
    }
    const p = payload as Record<string, unknown>;
    const platformOrderId = String(p.platform_order_id ?? '');
    const status = String(p.status ?? '');
    const randomNr = String(p.random_nr ?? '');
    const receivedSig = String(p.signature ?? '');

    if (!platformOrderId || !randomNr || !receivedSig) {
      throw new InvalidWebhookError(KIND, 'missing required fields');
    }

    const apiSecret = this.requiredConfig<string>('apiSecret');
    const expected = createHmac('sha256', apiSecret)
      .update(randomNr + platformOrderId)
      .digest('base64');

    if (!this.constantTimeEqual(expected, receivedSig)) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const mappedStatus: PaymentStatus =
      status === 'success' ? 'paid' : status === 'failed' ? 'failed' : 'pending';
    const eventType: WebhookEvent['type'] =
      mappedStatus === 'paid'
        ? 'payment.paid'
        : mappedStatus === 'failed'
          ? 'payment.failed'
          : 'payment.created';

    return {
      id: typeof p.payment_id === 'string' ? p.payment_id : platformOrderId,
      type: eventType,
      gateway: KIND,
      orderId: platformOrderId,
      gatewayPaymentId:
        typeof p.payment_id === 'string' ? p.payment_id : platformOrderId,
      status: mappedStatus,
      amount: typeof p.total === 'number' ? p.total : undefined,
      currency: typeof p.currency === 'string' ? p.currency : undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  /**
   * Shopier has no API endpoint to validate credentials without creating an
   * order, and the form-post flow requires a browser to follow through. We
   * therefore verify config presence and signature reproducibility only.
   */
  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    try {
      const apiSecret = this.requiredConfig<string>('apiSecret');
      const sample = createHmac('sha256', apiSecret).update('probe').digest('base64');
      return {
        success: !!sample,
        message:
          'Configuration accepted. Shopier provides no live credential probe; ' +
          'verify by completing a sandbox order.',
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

  private mapCurrency(code: string): string {
    const upper = code.toUpperCase();
    const mapped = CURRENCY_MAP[upper];
    if (!mapped) {
      throw new InvalidRequestError(`Shopier does not support currency ${code}`, {
        gateway: KIND,
      });
    }
    return mapped;
  }

  private normalizeOid(orderId: string): string {
    const cleaned = orderId.replace(/[^A-Za-z0-9_-]/g, '');
    if (!cleaned) {
      throw new InvalidRequestError('orderId reduces to empty after sanitisation', {
        gateway: KIND,
      });
    }
    return cleaned.slice(0, 64);
  }

  private constantTimeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }
}

registerMarketing(KIND, {
  brandLabel: 'Shopier',
  description: 'Türkiye’nin küçük işletme dostu hızlı ödeme bağlantısı sağlayıcısı.',
  logoPath: 'shopier.svg',
  brandColor: '#FFC600',
  websiteUrl: 'https://www.shopier.com',
  docsUrl: 'https://destek.shopier.com/hc/en-us/articles/360008173393',
  badges: ['popular'],
  platformBillingEligible: false,
});

GatewayRegistry.register((config, options) => new ShopierGateway(config, options));
