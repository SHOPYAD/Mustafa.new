import { createHmac } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'anypay';
const API_BASE = 'https://api.anypayx.com/api';

function sign(raw: string, secret: string): string {
  return createHmac('sha256', secret).update(raw).digest('hex');
}

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'apiToken', label: 'API Token', type: 'password', required: true, secret: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

export class AnyPayGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'AnyPay';
  readonly type: GatewayType = 'crypto';
  readonly supportedCountries = ['GLOBAL'] as const;
  readonly supportedCurrencies = ['USD', 'EUR', 'BTC', 'USDT'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const token = this.requiredConfig<string>('apiToken');

    const body = {
      external_id: params.orderId,
      amount: Number(params.amount.toFixed(2)),
      currency: (params.currency || 'USD').toUpperCase(),
      callback_url: params.callbackUrl || '',
      success_url: params.successUrl || params.callbackUrl || '',
      cancel_url: params.failureUrl || params.callbackUrl || '',
      description: params.description || 'Payment',
    };

    const res = await fetch(`${API_BASE}/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new GatewayApiError(KIND, `AnyPay create failed: ${res.status}`);
    const data = (await res.json()) as any;
    const d = data?.data || data;
    if (!d?.id || !d?.url) throw new GatewayApiError(KIND, 'AnyPay did not return invoice fields', { cause: data });

    return { gatewayId: String(d.id), orderId: params.orderId, status: 'pending', redirectUrl: String(d.url), rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('AnyPay refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');

    const secret = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-anypay-signature'] || '');
    const expected = sign(String(headers?.['x-raw-body'] || JSON.stringify(payload)), secret);
    if (!got || !safeCompare(got.toLowerCase(), expected.toLowerCase())) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const s = String(p.status || '').toLowerCase();
    const mapped = ['paid', 'completed', 'confirmed'].includes(s) ? 'paid' : ['failed', 'expired', 'cancelled'].includes(s) ? 'failed' : 'pending';

    return {
      id: String(p.id || p.external_id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.external_id || ''),
      gatewayPaymentId: String(p.id || ''),
      status: mapped,
      amount: p.amount !== undefined ? Number(p.amount) : undefined,
      currency: String(p.currency || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('apiToken');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via test invoice.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new AnyPayGateway(config, options));
registerMarketing(KIND, { brandLabel: 'AnyPay', description: 'Unified crypto checkout processor.', logoPath: '/static/payment-gateways/anypay.png', brandColor: '#111827', websiteUrl: 'https://anypayx.com', badges: ['new'] });
