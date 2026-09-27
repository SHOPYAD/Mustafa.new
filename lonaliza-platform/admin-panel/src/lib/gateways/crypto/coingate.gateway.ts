import { createHmac } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'coingate';
const API_BASE = 'https://api-sandbox.coingate.com/v2';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'apiToken', label: 'API Token', type: 'password', required: true, secret: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

function sign(raw: string, secret: string): string {
  return createHmac('sha256', secret).update(raw).digest('hex');
}

export class CoinGateGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'CoinGate';
  readonly type: GatewayType = 'crypto';
  readonly supportedCountries = ['GLOBAL'] as const;
  readonly supportedCurrencies = ['USD', 'EUR', 'BTC', 'ETH', 'USDT'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const apiToken = this.requiredConfig<string>('apiToken');
    const body = {
      order_id: params.orderId,
      price_amount: Number(params.amount.toFixed(2)),
      price_currency: (params.currency || 'USD').toUpperCase(),
      receive_currency: 'USDT',
      callback_url: params.callbackUrl || '',
      cancel_url: params.failureUrl || params.callbackUrl || '',
      success_url: params.successUrl || params.callbackUrl || '',
      title: params.description || 'Payment',
    };

    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${apiToken}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new GatewayApiError(KIND, `CoinGate create failed: ${res.status}`);
    const data = (await res.json()) as any;
    if (!data.id || !data.payment_url) throw new GatewayApiError(KIND, 'CoinGate did not return order id/payment_url', { cause: data });

    return { gatewayId: String(data.id), orderId: params.orderId, status: 'pending', redirectUrl: String(data.payment_url), rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('CoinGate refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');

    const secret = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-coingate-signature'] || headers?.['x-signature'] || '');
    const expected = sign(JSON.stringify(payload), secret);
    if (!got || !safeCompare(got.toLowerCase(), expected.toLowerCase())) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const s = String(p.status || '').toLowerCase();
    const mapped = ['paid', 'confirming', 'confirmed'].includes(s) ? 'paid' : ['canceled', 'invalid', 'expired'].includes(s) ? 'failed' : 'pending';

    return {
      id: String(p.id || p.order_id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.order_id || ''),
      gatewayPaymentId: String(p.id || ''),
      status: mapped,
      amount: p.price_amount !== undefined ? Number(p.price_amount) : undefined,
      currency: String(p.price_currency || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('apiToken');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via sandbox order.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new CoinGateGateway(config, options));
registerMarketing(KIND, { brandLabel: 'CoinGate', description: 'Crypto checkout and settlement gateway.', logoPath: '/static/payment-gateways/coingate.png', brandColor: '#0f172a', websiteUrl: 'https://coingate.com', badges: ['new'] });
