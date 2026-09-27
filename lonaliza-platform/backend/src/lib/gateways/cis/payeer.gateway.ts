import { createHash } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'payeer';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'shopId', label: 'Shop ID', type: 'text', required: true },
  { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, secret: true },
];

function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex').toUpperCase();
}

export class PayeerGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Payeer';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['RU', 'KZ'] as const;
  readonly supportedCurrencies = ['USD', 'EUR', 'RUB'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const shopId = this.requiredConfig<string>('shopId');
    const secret = this.requiredConfig<string>('secretKey');
    const amount = params.amount.toFixed(2);
    const curr = (params.currency || 'USD').toUpperCase();
    const sign = sha256(`${shopId}:${params.orderId}:${amount}:${curr}:${secret}`);

    const u = new URL('https://payeer.com/merchant/');
    u.searchParams.set('m_shop', shopId);
    u.searchParams.set('m_orderid', params.orderId);
    u.searchParams.set('m_amount', amount);
    u.searchParams.set('m_curr', curr);
    u.searchParams.set('m_desc', Buffer.from(params.description || `Order ${params.orderId}`).toString('base64'));
    u.searchParams.set('m_sign', sign);

    return { gatewayId: params.orderId, orderId: params.orderId, status: 'pending', redirectUrl: u.toString(), rawResponse: { redirectUrl: u.toString() } };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Payeer refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');
    const p = payload as any;

    const secret = this.requiredConfig<string>('secretKey');
    const parts = [
      p.m_operation_id,
      p.m_operation_ps,
      p.m_operation_date,
      p.m_operation_pay_date,
      p.m_shop,
      p.m_orderid,
      p.m_amount,
      p.m_curr,
      p.m_desc,
      p.m_status,
      secret,
    ].map((v) => String(v || ''));
    const expected = sha256(parts.join(':'));
    const got = String(p.m_sign || '').toUpperCase();
    if (!got || !safeCompare(got, expected)) throw new WebhookVerificationFailedError(KIND);

    const mapped = String(p.m_status || '').toLowerCase() === 'success' ? 'paid' : 'failed';
    return {
      id: String(p.m_operation_id || p.m_orderid || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : 'payment.failed',
      gateway: KIND,
      orderId: String(p.m_orderid || ''),
      gatewayPaymentId: String(p.m_operation_id || ''),
      status: mapped,
      amount: p.m_amount !== undefined ? Number(p.m_amount) : undefined,
      currency: String(p.m_curr || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('shopId');
    this.requiredConfig<string>('secretKey');
    return { success: true, message: 'Configuration accepted. Validate via test transaction.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new PayeerGateway(config, options));
registerMarketing(KIND, { brandLabel: 'Payeer', description: 'Wallet and merchant payments in CIS.', logoPath: '/static/payment-gateways/payeer.png', brandColor: '#0284c7', websiteUrl: 'https://payeer.com', badges: ['new'] });
