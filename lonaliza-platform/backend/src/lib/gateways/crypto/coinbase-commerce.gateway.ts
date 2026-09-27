import { createHmac } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'coinbase-commerce';
const API_BASE = 'https://api.commerce.coinbase.com';

function sign(raw: string, secret: string): string {
  return createHmac('sha256', secret).update(raw).digest('hex');
}

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'apiKey', label: 'API Key', type: 'password', required: true, secret: true },
  { key: 'webhookSharedSecret', label: 'Webhook Shared Secret', type: 'password', required: true, secret: true },
];

export class CoinbaseCommerceGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Coinbase Commerce';
  readonly type: GatewayType = 'crypto';
  readonly supportedCountries = ['GLOBAL'] as const;
  readonly supportedCurrencies = ['USD', 'EUR', 'BTC', 'ETH', 'USDC'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const apiKey = this.requiredConfig<string>('apiKey');
    const body = {
      name: params.description || `Order ${params.orderId}`,
      description: params.description || 'Payment',
      pricing_type: 'fixed_price',
      local_price: {
        amount: params.amount.toFixed(2),
        currency: (params.currency || 'USD').toUpperCase(),
      },
      metadata: { orderId: params.orderId },
      redirect_url: params.successUrl || params.callbackUrl || '',
      cancel_url: params.failureUrl || params.callbackUrl || '',
    };

    const res = await fetch(`${API_BASE}/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': apiKey,
        'X-CC-Version': '2018-03-22',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new GatewayApiError(KIND, `Coinbase Commerce create failed: ${res.status}`);

    const data = (await res.json()) as any;
    const d = data?.data || {};
    if (!d.id || !d.hosted_url) throw new GatewayApiError(KIND, 'Coinbase Commerce did not return charge id/url', { cause: data });

    return { gatewayId: String(d.id), orderId: params.orderId, status: 'pending', redirectUrl: String(d.hosted_url), rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Coinbase Commerce refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');
    const secret = this.requiredConfig<string>('webhookSharedSecret');
    const sig = String(headers?.['x-cc-webhook-signature'] || '');
    const expected = sign(String(headers?.['x-raw-body'] || JSON.stringify(payload)), secret);
    if (!sig || !safeCompare(sig.toLowerCase(), expected.toLowerCase())) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const eventType = String(p.event?.type || '').toLowerCase();
    const data = p.event?.data || {};
    const mapped = eventType.includes('confirmed') || eventType.includes('resolved') ? 'paid' : eventType.includes('failed') ? 'failed' : 'pending';

    return {
      id: String(p.id || data.id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(data.metadata?.orderId || ''),
      gatewayPaymentId: String(data.id || ''),
      status: mapped,
      amount: data.pricing?.local?.amount !== undefined ? Number(data.pricing.local.amount) : undefined,
      currency: String(data.pricing?.local?.currency || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('apiKey');
    this.requiredConfig<string>('webhookSharedSecret');
    return { success: true, message: 'Configuration accepted. Validate via sandbox charge.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new CoinbaseCommerceGateway(config, options));
registerMarketing(KIND, { brandLabel: 'Coinbase Commerce', description: 'Hosted crypto checkout by Coinbase.', logoPath: '/static/payment-gateways/coinbase-commerce.png', brandColor: '#0052ff', websiteUrl: 'https://commerce.coinbase.com', badges: ['new'] });
