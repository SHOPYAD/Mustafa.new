import { createHash } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'unitpay';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'publicKey', label: 'Public Key', type: 'text', required: true },
  { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, secret: true },
];

function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

export class UnitPayGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'UnitPay';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['RU'] as const;
  readonly supportedCurrencies = ['RUB', 'USD'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const publicKey = this.requiredConfig<string>('publicKey');

    const u = new URL(`https://${publicKey}.unitpay.money/pay/`);
    u.searchParams.set('sum', params.amount.toFixed(2));
    u.searchParams.set('account', params.orderId);
    u.searchParams.set('desc', params.description || `Order ${params.orderId}`);
    u.searchParams.set('currency', (params.currency || 'RUB').toUpperCase());

    return { gatewayId: params.orderId, orderId: params.orderId, status: 'pending', redirectUrl: u.toString(), rawResponse: { redirectUrl: u.toString() } };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('UnitPay refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');
    const p = payload as any;

    const secret = this.requiredConfig<string>('secretKey');
    const params = p.params || {};
    const method = String(p.method || 'pay');
    const signPayload = `${method}{up}${params.unitpayId || ''}{up}${params.account || ''}{up}${params.sum || ''}{up}${params.payerSum || ''}{up}${params.payerCurrency || ''}{up}${params.date || ''}{up}${secret}`;
    const expected = sha256(signPayload).toLowerCase();
    const got = String(params.signature || p.signature || '').toLowerCase();
    if (!got || !safeCompare(got, expected)) throw new WebhookVerificationFailedError(KIND);

    const statusRaw = method.toLowerCase();
    const mapped = statusRaw.includes('pay') ? 'paid' : statusRaw.includes('error') ? 'failed' : 'pending';

    return {
      id: String(params.unitpayId || params.account || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(params.account || ''),
      gatewayPaymentId: String(params.unitpayId || ''),
      status: mapped,
      amount: params.sum !== undefined ? Number(params.sum) : undefined,
      currency: String(params.payerCurrency || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('publicKey');
    this.requiredConfig<string>('secretKey');
    return { success: true, message: 'Configuration accepted. Validate via test payment.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new UnitPayGateway(config, options));
registerMarketing(KIND, { brandLabel: 'UnitPay', description: 'CIS online payment processing.', logoPath: '/static/payment-gateways/unitpay.png', brandColor: '#1d4ed8', websiteUrl: 'https://unitpay.money', badges: ['new'] });
