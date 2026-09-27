import { createHash } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'perfectmoney';
const API_BASE = 'https://perfectmoney.com/api';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'payeeAccount', label: 'Payee Account', type: 'text', required: true },
  { key: 'alternatePassphrase', label: 'Alternate Passphrase', type: 'password', required: true, secret: true },
  { key: 'paymentUrl', label: 'Payment URL', type: 'text', required: false, default: 'https://perfectmoney.com/api/step1.asp' },
];

function md5Upper(s: string): string {
  return createHash('md5').update(s).digest('hex').toUpperCase();
}

export class PerfectMoneyGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Perfect Money';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['GLOBAL'] as const;
  readonly supportedCurrencies = ['USD', 'EUR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const payeeAccount = this.requiredConfig<string>('payeeAccount');
    const paymentUrl = this.optionalConfig<string>('paymentUrl') || 'https://perfectmoney.com/api/step1.asp';

    const u = new URL(paymentUrl);
    u.searchParams.set('PAYEE_ACCOUNT', payeeAccount);
    u.searchParams.set('PAYEE_NAME', 'Liotrip');
    u.searchParams.set('PAYMENT_AMOUNT', params.amount.toFixed(2));
    u.searchParams.set('PAYMENT_UNITS', (params.currency || 'USD').toUpperCase());
    u.searchParams.set('PAYMENT_ID', params.orderId);
    u.searchParams.set('STATUS_URL', params.callbackUrl || '');
    u.searchParams.set('PAYMENT_URL', params.successUrl || params.callbackUrl || '');
    u.searchParams.set('NOPAYMENT_URL', params.failureUrl || params.callbackUrl || '');
    u.searchParams.set('BAGGAGE_FIELDS', 'ORDER_ID');
    u.searchParams.set('ORDER_ID', params.orderId);

    return { gatewayId: params.orderId, orderId: params.orderId, status: 'pending', redirectUrl: u.toString(), rawResponse: { redirectUrl: u.toString() } };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Perfect Money refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');

    const alt = this.requiredConfig<string>('alternatePassphrase');
    const p = payload as any;

    const v2HashInput = [
      String(p.PAYMENT_ID || ''),
      String(p.PAYEE_ACCOUNT || ''),
      String(p.PAYMENT_AMOUNT || ''),
      String(p.PAYMENT_UNITS || ''),
      String(p.PAYMENT_BATCH_NUM || ''),
      String(p.PAYER_ACCOUNT || ''),
      md5Upper(alt),
      String(p.TIMESTAMPGMT || ''),
    ].join(':');
    const expected = md5Upper(v2HashInput);
    const got = String(p.V2_HASH || '').toUpperCase();
    if (!got || !safeCompare(got, expected)) throw new WebhookVerificationFailedError(KIND);

    return {
      id: String(p.PAYMENT_BATCH_NUM || p.PAYMENT_ID || Date.now()),
      type: 'payment.paid',
      gateway: KIND,
      orderId: String(p.PAYMENT_ID || ''),
      gatewayPaymentId: String(p.PAYMENT_BATCH_NUM || ''),
      status: 'paid',
      amount: p.PAYMENT_AMOUNT !== undefined ? Number(p.PAYMENT_AMOUNT) : undefined,
      currency: String(p.PAYMENT_UNITS || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('payeeAccount');
    this.requiredConfig<string>('alternatePassphrase');
    return { success: true, message: 'Configuration accepted. Validate via PM test payment.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new PerfectMoneyGateway(config, options));
registerMarketing(KIND, { brandLabel: 'Perfect Money', description: 'Wallet-based global online payments.', logoPath: '/static/payment-gateways/perfectmoney.png', brandColor: '#0f172a', websiteUrl: 'https://perfectmoney.com', badges: ['new'] });
