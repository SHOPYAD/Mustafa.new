/**
 * PayTR (Turkey) — iFrame API integration.
 *
 * Flow:
 *   1. createPayment -> POST /odeme/api/get-token (form-urlencoded)
 *      Returns { status, token }; we redirect the buyer to the iframe URL:
 *        https://www.paytr.com/odeme/guvenli/<token>
 *   2. PayTR hosts the card form, runs 3DS, then POSTs form-urlencoded result
 *      to our callbackUrl with: merchant_oid, status, total_amount, hash.
 *   3. Callback handler verifies hash, then emits a normalized WebhookEvent.
 *      MUST respond with the literal text "OK" (200), otherwise PayTR retries.
 *   4. Refunds via POST /odeme/iade.
 *
 * Auth (PayTR PKI):
 *   paytr_token = base64( hmacSha256(
 *     merchant_id + user_ip + merchant_oid + email + payment_amount +
 *     user_basket + no_installment + max_installment + currency + test_mode,
 *     merchant_key + merchant_salt
 *   ) )
 *
 * Webhook hash:
 *   hash = base64( hmacSha256(
 *     merchant_oid + merchant_salt + status + total_amount,
 *     merchant_key
 *   ) )
 *
 * Amounts are in MINOR units (kuruş): 10.50 TRY = 1050.
 *
 * Docs:
 *   https://dev.paytr.com/iframe-api
 *   https://dev.paytr.com/iframe-api/iframe-api-1-adim
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
} from '../core/types';
import { baseCreatePaymentSchema } from '../core/validation';

const KIND = 'paytr';
const API_BASE = 'https://www.paytr.com/odeme/api';
const IFRAME_BASE = 'https://www.paytr.com/odeme/guvenli';
const REFUND_URL = 'https://www.paytr.com/odeme/iade';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'merchantId',
    label: 'Merchant ID',
    type: 'text',
    required: true,
    placeholder: '123456',
    helpText: 'PayTR mağaza panelinizden — Bilgi → Mağaza Bilgileri.',
  },
  {
    key: 'merchantKey',
    label: 'Merchant Key',
    type: 'password',
    required: true,
    secret: true,
    helpText: 'Used inside HMAC. Keep secret.',
  },
  {
    key: 'merchantSalt',
    label: 'Merchant Salt',
    type: 'password',
    required: true,
    secret: true,
    helpText: 'Used inside HMAC. Keep secret.',
  },
  {
    key: 'maxInstallment',
    label: 'Max installment count',
    type: 'number',
    required: false,
    helpText: '0 = single payment only. Otherwise max 12.',
    default: 0,
  },
];

const paytrCreateSchema = baseCreatePaymentSchema.extend({
  callbackUrl: z.string().url('PayTR requires callbackUrl'),
  successUrl: z.string().url('PayTR requires successUrl'),
  failureUrl: z.string().url('PayTR requires failureUrl'),
});

interface PaytrTokenResponse {
  status: 'success' | 'failed';
  reason?: string;
  token?: string;
}

interface PaytrRefundResponse {
  status: 'success' | 'error';
  err_no?: string;
  err_msg?: string;
  merchant_oid?: string;
  return_amount?: string;
}

/** PayTR currency codes are non-standard ('TL' instead of 'TRY'). */
const CURRENCY_MAP: Record<string, string> = {
  TRY: 'TL',
  TL: 'TL',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  RUB: 'RUB',
};

export class PayTRGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'PayTR';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['TR'] as const;
  readonly supportedCurrencies = ['TRY', 'USD', 'EUR', 'GBP', 'RUB'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected createSchema() {
    return paytrCreateSchema;
  }

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const merchantId = this.requiredConfig<string>('merchantId');
    const merchantKey = this.requiredConfig<string>('merchantKey');
    const merchantSalt = this.requiredConfig<string>('merchantSalt');

    const userIp = this.extractClientIp(params);
    const merchantOid = this.normalizeOid(params.orderId);
    const email = params.customer?.email || 'guest@example.com';
    const paymentAmount = this.toMinorUnits(params.amount);
    const currency = this.mapCurrency(params.currency);
    const noInstallment = '0';
    const maxInstallment = String(this.optionalConfig<number>('maxInstallment') ?? 0);
    const testMode = this.testMode ? '1' : '0';

    const userBasket = this.encodeBasket([
      [(params.description || 'Order').slice(0, 80), this.amountToString(params.amount), 1],
    ]);

    // PayTR's PKI signature input is concatenation in a strict order.
    const signaturePayload = [
      merchantId,
      userIp,
      merchantOid,
      email,
      paymentAmount,
      userBasket,
      noInstallment,
      maxInstallment,
      currency,
      testMode,
    ].join('');
    const paytrToken = createHmac('sha256', merchantKey + merchantSalt)
      .update(signaturePayload)
      .digest('base64');

    const form = new URLSearchParams();
    form.set('merchant_id', merchantId);
    form.set('user_ip', userIp);
    form.set('merchant_oid', merchantOid);
    form.set('email', email);
    form.set('payment_amount', paymentAmount);
    form.set('paytr_token', paytrToken);
    form.set('user_basket', userBasket);
    form.set('debug_on', '0');
    form.set('no_installment', noInstallment);
    form.set('max_installment', maxInstallment);
    form.set('user_name', this.fullName(params));
    form.set('user_address', params.billingAddress?.line1 || 'N/A');
    form.set('user_phone', params.customer?.phone || '+905555555555');
    form.set('merchant_ok_url', params.successUrl!);
    form.set('merchant_fail_url', params.failureUrl!);
    form.set('timeout_limit', '30');
    form.set('currency', currency);
    form.set('test_mode', testMode);
    form.set('lang', 'tr');

    const res = await this.formRequest<PaytrTokenResponse>(`${API_BASE}/get-token`, form);

    if (res.status !== 'success' || !res.token) {
      throw new GatewayApiError(KIND, res.reason || 'PayTR did not return a token', {
        cause: res,
      });
    }

    return {
      gatewayId: merchantOid,
      orderId: params.orderId,
      status: 'pending' as PaymentStatus,
      redirectUrl: `${IFRAME_BASE}/${res.token}`,
      rawResponse: { token: res.token, status: res.status },
    };
  }

  protected async refundPaymentImpl(params: RefundParams): Promise<GatewayRefundResult> {
    if (!params.amount) {
      throw new InvalidRequestError('PayTR requires an explicit refund amount', {
        gateway: KIND,
      });
    }
    const merchantId = this.requiredConfig<string>('merchantId');
    const merchantKey = this.requiredConfig<string>('merchantKey');
    const merchantSalt = this.requiredConfig<string>('merchantSalt');

    const merchantOid = this.normalizeOid(params.gatewayId);
    const returnAmount = this.amountToString(params.amount);

    // Refund signature: merchant_id + merchant_oid + return_amount + merchant_salt
    const sigPayload = merchantId + merchantOid + returnAmount + merchantSalt;
    const paytrToken = createHmac('sha256', merchantKey)
      .update(sigPayload)
      .digest('base64');

    const form = new URLSearchParams();
    form.set('merchant_id', merchantId);
    form.set('merchant_oid', merchantOid);
    form.set('return_amount', returnAmount);
    form.set('paytr_token', paytrToken);

    const res = await this.formRequest<PaytrRefundResponse>(REFUND_URL, form);

    if (res.status !== 'success') {
      throw new GatewayApiError(KIND, res.err_msg || 'Refund failed', {
        providerCode: res.err_no,
        cause: res,
      });
    }

    return {
      success: true,
      gatewayRefundId: res.merchant_oid || merchantOid,
      status: 'succeeded',
      totalRefunded: params.amount,
      refundedAt: new Date(),
      rawResponse: res,
    };
  }

  /**
   * Verifies PayTR's hash on the form-urlencoded callback POST and returns
   * a normalized WebhookEvent. Caller is responsible for replying with "OK".
   */
  protected parseWebhookEventImpl(
    payload: unknown,
    _headers?: Record<string, string>,
  ): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not an object');
    }
    const p = payload as Record<string, unknown>;
    const merchantOid = String(p.merchant_oid ?? '');
    const status = String(p.status ?? '');
    const totalAmountRaw = String(p.total_amount ?? '');
    const receivedHash = String(p.hash ?? '');

    if (!merchantOid || !status || !totalAmountRaw || !receivedHash) {
      throw new InvalidWebhookError(KIND, 'missing required fields');
    }

    const merchantKey = this.requiredConfig<string>('merchantKey');
    const merchantSalt = this.requiredConfig<string>('merchantSalt');

    const sigPayload = merchantOid + merchantSalt + status + totalAmountRaw;
    const expected = createHmac('sha256', merchantKey).update(sigPayload).digest('base64');

    if (!this.constantTimeEqual(expected, receivedHash)) {
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

    // PayTR sends total_amount in minor units (kuruş).
    const minor = Number.parseInt(totalAmountRaw, 10);
    const major = Number.isFinite(minor) ? minor / 100 : undefined;

    return {
      id: merchantOid,
      type: eventType,
      gateway: KIND,
      orderId: merchantOid,
      gatewayPaymentId: typeof p.payment_id === 'string' ? p.payment_id : merchantOid,
      status: mappedStatus,
      amount: major,
      currency: typeof p.currency === 'string' ? p.currency : 'TRY',
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  /**
   * Connectivity probe — call /get-token with a tiny basket. A `success` response
   * proves auth + HMAC correctness; a `failed` response with PayTR's reason
   * means we reached the server but auth or another field is wrong.
   */
  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    try {
      const probe = await this.createPaymentImpl({
        amount: 1,
        currency: 'TRY',
        orderId: `probe${Date.now()}`,
        subdomain: 'probe',
        callbackUrl: 'https://example.com/cb',
        successUrl: 'https://example.com/ok',
        failureUrl: 'https://example.com/fail',
        customer: { email: 'probe@example.com', firstName: 'Probe', lastName: 'User' },
        billingAddress: { line1: 'Probe', city: 'Istanbul', country: 'TR' },
      });
      return {
        success: !!probe.redirectUrl,
        message: probe.redirectUrl
          ? 'PayTR accepted the request and returned an iframe URL'
          : 'No iframe URL returned',
        durationMs: 0,
        details: { mode: this.testMode ? 'test' : 'live' },
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : String(err),
        durationMs: 0,
      };
    }
  }

  // ────────────── helpers ──────────────

  /** PayTR amounts must be integer kuruş with no separator. 10.50 TRY -> "1050". */
  private toMinorUnits(majorAmount: number): string {
    return Math.round(majorAmount * 100).toString();
  }

  /** Plain decimal string with two digits, no separator. 10.5 -> "10.50". */
  private amountToString(majorAmount: number): string {
    return majorAmount.toFixed(2);
  }

  private mapCurrency(code: string): string {
    const upper = code.toUpperCase();
    return CURRENCY_MAP[upper] || upper;
  }

  /** PayTR rejects merchant_oid containing anything but [A-Za-z0-9]. */
  private normalizeOid(orderId: string): string {
    const cleaned = orderId.replace(/[^A-Za-z0-9]/g, '');
    if (!cleaned) {
      throw new InvalidRequestError('orderId reduces to empty after sanitisation', {
        gateway: KIND,
      });
    }
    return cleaned.slice(0, 64);
  }

  private extractClientIp(params: CreatePaymentParams): string {
    const fromMeta = params.metadata?.userIp;
    if (fromMeta && /^[\d.]+$/.test(fromMeta)) return fromMeta;
    return '127.0.0.1';
  }

  private fullName(params: CreatePaymentParams): string {
    const c = params.customer || {};
    return c.name || `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || 'Buyer';
  }

  /**
   * PayTR basket format: base64( JSON [[name, price, qty], ...] )
   * Prices must be plain decimal strings in major units.
   */
  private encodeBasket(rows: Array<[string, string, number]>): string {
    return Buffer.from(JSON.stringify(rows)).toString('base64');
  }

  private constantTimeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }

  private async formRequest<T>(url: string, body: URLSearchParams): Promise<T> {
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: body.toString(),
      });
    } catch (err) {
      throw new NetworkError(KIND, err);
    }

    let parsed: unknown;
    const text = await response.text();
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      // PayTR sometimes returns plain text on errors; preserve it as cause.
      parsed = { status: 'failed', reason: text } as PaytrTokenResponse;
    }

    if (!response.ok) {
      throw classifyHttpError(KIND, response.status, parsed);
    }
    return parsed as T;
  }
}

registerMarketing(KIND, {
  brandLabel: 'PayTR',
  description: 'Türkiye’nin yaygın iframe ödeme sağlayıcısı — kart, taksit, BKM Express.',
  logoPath: 'paytr.svg',
  brandColor: '#FF6F00',
  websiteUrl: 'https://www.paytr.com',
  docsUrl: 'https://dev.paytr.com/iframe-api',
  badges: ['popular'],
  platformBillingEligible: false,
});

GatewayRegistry.register((config, options) => new PayTRGateway(config, options));
