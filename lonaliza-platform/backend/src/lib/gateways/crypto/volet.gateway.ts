import { createHmac } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'volet';
const API_BASE = 'https://api.volet.com/v1';

function sign(raw: string, secret: string): string {
  return createHmac('sha256', secret).update(raw).digest('hex');
}

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'apiKey', label: 'API Key', type: 'password', required: true, secret: true },
  { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

export class VoletGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Volet';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['GLOBAL'] as const;
  readonly supportedCurrencies = ['USD', 'EUR', 'USDT'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const apiKey = this.requiredConfig<string>('apiKey');
    const merchantId = this.requiredConfig<string>('merchantId');

    const body = {
      merchant_id: merchantId,
      order_id: params.orderId,
      amount: Number(params.amount.toFixed(2)),
      currency: (params.currency || 'USD').toUpperCase(),
      callback_url: params.callbackUrl || '',
      success_url: params.successUrl || params.callbackUrl || '',
      fail_url: params.failureUrl || params.callbackUrl || '',
      description: params.description || 'Payment',
    };

    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new GatewayApiError(KIND, `Volet create failed: ${res.status}`);
    const data = (await res.json()) as any;
    const d = data?.data || data;
    if (!d.id || !d.checkout_url) throw new GatewayApiError(KIND, 'Volet did not return id/checkout_url', { cause: data });

    return { gatewayId: String(d.id), orderId: params.orderId, status: 'pending', redirectUrl: String(d.checkout_url), rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Volet refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');

    const secret = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-volet-signature'] || '');
    const expected = sign(String(headers?.['x-raw-body'] || JSON.stringify(payload)), secret);
    if (!got || !safeCompare(got.toLowerCase(), expected.toLowerCase())) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const s = String(p.status || '').toLowerCase();
    const mapped = ['paid', 'success', 'completed'].includes(s) ? 'paid' : ['failed', 'cancelled', 'expired'].includes(s) ? 'failed' : 'pending';

    return {
      id: String(p.id || p.order_id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.order_id || ''),
      gatewayPaymentId: String(p.id || ''),
      status: mapped,
      amount: p.amount !== undefined ? Number(p.amount) : undefined,
      currency: String(p.currency || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('apiKey');
    this.requiredConfig<string>('merchantId');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via sandbox payment.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new VoletGateway(config, options));
registerMarketing(KIND, { brandLabel: 'Volet', description: 'Digital wallet checkout and payouts.', logoPath: '/static/payment-gateways/volet.png', brandColor: '#1f2937', websiteUrl: 'https://volet.com', badges: ['new'] });
