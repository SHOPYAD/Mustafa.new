import { createHash } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'freekassa';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
  { key: 'secretWord1', label: 'Secret Word #1', type: 'password', required: true, secret: true },
  { key: 'secretWord2', label: 'Secret Word #2', type: 'password', required: true, secret: true },
];

function md5(s: string): string {
  return createHash('md5').update(s).digest('hex');
}

export class FreeKassaGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'FreeKassa';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['RU'] as const;
  readonly supportedCurrencies = ['RUB', 'USD'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const merchantId = this.requiredConfig<string>('merchantId');
    const secretWord1 = this.requiredConfig<string>('secretWord1');
    const amount = params.amount.toFixed(2);
    const sign = md5(`${merchantId}:${amount}:${secretWord1}:${params.orderId}`);

    const u = new URL('https://pay.freekassa.ru/');
    u.searchParams.set('m', merchantId);
    u.searchParams.set('oa', amount);
    u.searchParams.set('o', params.orderId);
    u.searchParams.set('s', sign);
    u.searchParams.set('us_order', params.orderId);

    return { gatewayId: params.orderId, orderId: params.orderId, status: 'pending', redirectUrl: u.toString(), rawResponse: { redirectUrl: u.toString() } };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('FreeKassa refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');
    const p = payload as any;

    const merchantId = this.requiredConfig<string>('merchantId');
    const secretWord2 = this.requiredConfig<string>('secretWord2');
    const amount = String(p.AMOUNT || p.amount || '');
    const intid = String(p.intid || p.INTID || '');
    const order = String(p.MERCHANT_ORDER_ID || p.order_id || '');
    const got = String(p.SIGN || '').toLowerCase();
    const expected = md5(`${merchantId}:${amount}:${secretWord2}:${order}`).toLowerCase();
    if (!got || !safeCompare(got, expected)) throw new WebhookVerificationFailedError(KIND);

    return {
      id: intid || order || String(Date.now()),
      type: 'payment.paid',
      gateway: KIND,
      orderId: order,
      gatewayPaymentId: intid,
      status: 'paid',
      amount: amount ? Number(amount) : undefined,
      currency: 'RUB',
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('merchantId');
    this.requiredConfig<string>('secretWord1');
    this.requiredConfig<string>('secretWord2');
    return { success: true, message: 'Configuration accepted. Validate via test payment.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new FreeKassaGateway(config, options));
registerMarketing(KIND, { brandLabel: 'FreeKassa', description: 'Russian payment aggregation platform.', logoPath: '/static/payment-gateways/freekassa.png', brandColor: '#0f172a', websiteUrl: 'https://freekassa.ru', badges: ['new'] });
