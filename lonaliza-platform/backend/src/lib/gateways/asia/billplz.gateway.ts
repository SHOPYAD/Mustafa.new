import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'billplz';
const API_BASE = 'https://www.billplz-sandbox.com/api/v3';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'apiKey', label: 'API Key', type: 'password', required: true, secret: true },
  { key: 'collectionId', label: 'Collection ID', type: 'text', required: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

function auth(apiKey: string): string {
  return `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;
}

export class BillplzGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Billplz';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['MY'] as const;
  readonly supportedCurrencies = ['MYR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const apiKey = this.requiredConfig<string>('apiKey');
    const collectionId = this.requiredConfig<string>('collectionId');

    const form = new URLSearchParams();
    form.set('collection_id', collectionId);
    form.set('email', params.customer?.email || 'guest@example.com');
    form.set('name', params.customer?.name || 'Customer');
    form.set('amount', String(Math.round(params.amount * 100)));
    form.set('callback_url', params.callbackUrl || '');
    form.set('redirect_url', params.successUrl || params.callbackUrl || '');
    form.set('description', params.description || 'Payment');
    form.set('reference_1_label', 'order_id');
    form.set('reference_1', params.orderId);

    const res = await fetch(`${API_BASE}/bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: auth(apiKey) },
      body: form,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new GatewayApiError(KIND, `Billplz create failed: ${res.status}`);

    const data = (await res.json()) as any;
    const url = String(data.url || '');
    if (!url) throw new GatewayApiError(KIND, 'Billplz did not return bill URL', { cause: data });

    return { gatewayId: String(data.id || params.orderId), orderId: params.orderId, status: 'pending', redirectUrl: url, rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Billplz refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');
    const expected = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-webhook-secret'] || '');
    if (!got || got !== expected) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const state = String(p.state || '').toLowerCase();
    const paid = Boolean(p.paid || state === 'paid');
    const failed = ['failed', 'cancelled', 'canceled', 'expired'].includes(state);
    return {
      id: String(p.id || Date.now()),
      type: paid ? 'payment.paid' : failed ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.reference_1 || ''),
      gatewayPaymentId: String(p.id || ''),
      status: paid ? 'paid' : failed ? 'failed' : 'pending',
      amount: p.amount !== undefined ? Number(p.amount) / 100 : undefined,
      currency: 'MYR',
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('apiKey');
    this.requiredConfig<string>('collectionId');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via Billplz sandbox payment run.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new BillplzGateway(config, options));
registerMarketing(KIND, { brandLabel: 'Billplz', description: 'Malaysia bill payment platform.', logoPath: '/static/payment-gateways/billplz.png', brandColor: '#0ea5e9', websiteUrl: 'https://billplz.com', badges: ['new'] });
