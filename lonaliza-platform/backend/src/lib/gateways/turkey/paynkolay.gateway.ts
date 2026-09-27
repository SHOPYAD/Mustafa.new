import { createHash } from 'crypto';
import { z } from 'zod';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import {
  GatewayApiError,
  InvalidRequestError,
  InvalidWebhookError,
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
  RefundParams,
  WebhookEvent,
} from '../core/types';
import { baseCreatePaymentSchema } from '../core/validation';

const KIND = 'paynkolay';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'sx', label: 'SX', type: 'text', required: true },
  {
    key: 'merchantSecretKey',
    label: 'Merchant Secret Key',
    type: 'password',
    required: true,
    secret: true,
  },
  { key: 'merchantNo', label: 'Merchant No', type: 'text', required: false },
  {
    key: 'baseUrl',
    label: 'Base URL',
    type: 'select',
    required: false,
    options: [
      { value: 'https://paynkolaytest.nkolayislem.com.tr', label: 'Sandbox' },
      { value: 'https://paynkolay.nkolayislem.com.tr', label: 'Production' },
    ],
    default: 'https://paynkolaytest.nkolayislem.com.tr',
  },
];

const schema = baseCreatePaymentSchema.extend({
  successUrl: z.string().url(),
  failureUrl: z.string().url(),
});

export class PaynKolayGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'PaynKolay';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['TR'] as const;
  readonly supportedCurrencies = ['TRY'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected createSchema() {
    return schema;
  }

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const sx = this.requiredConfig<string>('sx');
    const secret = this.requiredConfig<string>('merchantSecretKey');
    const baseUrl =
      this.optionalConfig<string>('baseUrl') ||
      'https://paynkolaytest.nkolayislem.com.tr';

    const rnd = String(Date.now());
    const clientRefCode = params.orderId;
    const amount = params.amount.toFixed(2);
    const customerKey = '';

    const hashString = [
      sx,
      clientRefCode,
      amount,
      params.successUrl,
      params.failureUrl,
      rnd,
      customerKey,
      secret,
    ].join('|');
    const hashDatav2 = createHash('sha512').update(hashString, 'utf8').digest('base64');

    const form = new URLSearchParams();
    form.set('sx', sx);
    form.set('clientRefCode', clientRefCode);
    form.set('amount', amount);
    form.set('successUrl', params.successUrl!);
    form.set('failUrl', params.failureUrl!);
    form.set('rnd', rnd);
    form.set('hashDatav2', hashDatav2);
    form.set('use3D', 'true');
    form.set('currencyCode', '949');
    form.set('transactionType', 'SALES');

    const res = await fetch(`${baseUrl}/Vpos/by-link-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new GatewayApiError(KIND, `PaynKolay create failed: ${res.status}`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    const payUrl = String(data.paymentUrl || data.url || data.link || '');
    if (!payUrl) {
      throw new GatewayApiError(KIND, 'PaynKolay did not return a payment URL', {
        cause: data,
      });
    }

    return {
      gatewayId: String(data.id || clientRefCode),
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: payUrl,
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError(
      'PaynKolay refunds are panel/API-operation specific and not enabled in this adapter yet.',
      { gateway: KIND },
    );
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not object');
    }
    const p = payload as Record<string, unknown>;

    const responseCode = String(p.RESPONSE_CODE || '');
    const providedHash = String(p.hashDataV2 || '');

    const merchantNo = String(p.MERCHANT_NO || this.optionalConfig<string>('merchantNo') || '');
    const secret = this.requiredConfig<string>('merchantSecretKey');
    const hashString = [
      merchantNo,
      String(p.REFERENCE_CODE || ''),
      String(p.AUTH_CODE || ''),
      responseCode,
      String(p.USE_3D || ''),
      String(p.RND || ''),
      String(p.INSTALLMENT || ''),
      String(p.AUTHORIZATION_AMOUNT || ''),
      String(p.CURRENCY_CODE || ''),
      secret,
    ].join('|');
    const expected = createHash('sha512').update(hashString, 'utf8').digest('base64');

    if (!providedHash || expected !== providedHash) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const isPaid = responseCode === '2';
    return {
      id: String(p.REFERENCE_CODE || p.CLIENT_REFERENCE_CODE || Date.now()),
      type: isPaid ? 'payment.paid' : 'payment.failed',
      gateway: KIND,
      orderId: String(p.CLIENT_REFERENCE_CODE || p.REFERENCE_CODE || ''),
      gatewayPaymentId: String(p.AUTH_CODE || p.REFERENCE_CODE || ''),
      status: isPaid ? 'paid' : 'failed',
      amount:
        p.AUTHORIZATION_AMOUNT !== undefined
          ? Number(String(p.AUTHORIZATION_AMOUNT).replace(',', '.'))
          : undefined,
      currency: String(p.CURRENCY_CODE || 'TRY'),
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('sx');
    this.requiredConfig<string>('merchantSecretKey');
    return {
      success: true,
      message: 'Configuration accepted. Validate via sandbox payment run.',
      durationMs: 0,
    };
  }
}

GatewayRegistry.register((config, options) => new PaynKolayGateway(config, options));

registerMarketing(KIND, {
  brandLabel: 'PaynKolay',
  description: 'Turkey card payments with hosted checkout links.',
  logoPath: '/static/payment-gateways/paynkolay.png',
  brandColor: '#0e5aa7',
  websiteUrl: 'https://www.nkolayislem.com.tr',
  docsUrl: 'https://paynkolay.nkolayislem.com.tr',
  badges: ['new'],
});
