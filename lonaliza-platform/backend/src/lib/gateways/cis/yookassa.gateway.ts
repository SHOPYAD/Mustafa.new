import { createHmac } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'yookassa';
const API_BASE = 'https://api.yookassa.ru/v3';

function sign(raw: string, secret: string): string {
  return createHmac('sha256', secret).update(raw).digest('hex');
}

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'shopId', label: 'Shop ID', type: 'text', required: true },
  { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, secret: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

function auth(shopId: string, secretKey: string): string {
  return `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`;
}

export class YooKassaGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'YooKassa';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['RU'] as const;
  readonly supportedCurrencies = ['RUB'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const shopId = this.requiredConfig<string>('shopId');
    const secretKey = this.requiredConfig<string>('secretKey');

    const body = {
      amount: { value: params.amount.toFixed(2), currency: (params.currency || 'RUB').toUpperCase() },
      confirmation: { type: 'redirect', return_url: params.successUrl || params.callbackUrl || '' },
      capture: true,
      description: params.description || `Order ${params.orderId}`,
      metadata: { orderId: params.orderId },
    };

    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth(shopId, secretKey),
        'Idempotence-Key': params.orderId,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new GatewayApiError(KIND, `YooKassa create failed: ${res.status}`);
    const data = (await res.json()) as any;
    if (!data.id || !data.confirmation?.confirmation_url) throw new GatewayApiError(KIND, 'YooKassa did not return payment info', { cause: data });

    return { gatewayId: String(data.id), orderId: params.orderId, status: 'pending', redirectUrl: String(data.confirmation.confirmation_url), rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('YooKassa refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');

    const expected = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-yookassa-signature'] || '');
    const sig = sign(String(headers?.['x-raw-body'] || JSON.stringify(payload)), expected);
    if (!got || !safeCompare(got.toLowerCase(), sig.toLowerCase())) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const obj = p.object || {};
    const event = String(p.event || '').toLowerCase();
    const mapped = event.includes('succeeded') ? 'paid' : event.includes('canceled') ? 'failed' : 'pending';

    return {
      id: String(obj.id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(obj.metadata?.orderId || ''),
      gatewayPaymentId: String(obj.id || ''),
      status: mapped,
      amount: obj.amount?.value !== undefined ? Number(obj.amount.value) : undefined,
      currency: String(obj.amount?.currency || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('shopId');
    this.requiredConfig<string>('secretKey');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via test payment.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new YooKassaGateway(config, options));
registerMarketing(KIND, { brandLabel: 'YooKassa', description: 'Russian online payments and wallets.', logoPath: '/static/payment-gateways/yookassa.png', brandColor: '#2563eb', websiteUrl: 'https://yookassa.ru', badges: ['new'] });
