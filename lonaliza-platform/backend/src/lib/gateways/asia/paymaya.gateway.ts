import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'paymaya';
const API_BASE = 'https://pg-sandbox.paymaya.com/checkout/v1';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, secret: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

function auth(secret: string): string {
  return `Basic ${Buffer.from(`${secret}:`).toString('base64')}`;
}

export class PayMayaGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'PayMaya';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['PH'] as const;
  readonly supportedCurrencies = ['PHP'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const secretKey = this.requiredConfig<string>('secretKey');
    const body = {
      totalAmount: { value: Number(params.amount.toFixed(2)), currency: params.currency || 'PHP' },
      buyer: { firstName: params.customer?.firstName || 'Guest', lastName: params.customer?.lastName || 'User', contact: { email: params.customer?.email || 'guest@example.com', phone: params.customer?.phone || '' } },
      redirectUrl: { success: params.successUrl || params.callbackUrl || '', failure: params.failureUrl || params.callbackUrl || '', cancel: params.failureUrl || params.callbackUrl || '' },
      requestReferenceNumber: params.orderId,
      items: [{ name: params.description || 'Payment', quantity: 1, totalAmount: { value: Number(params.amount.toFixed(2)), currency: params.currency || 'PHP' } }],
    };

    const res = await fetch(`${API_BASE}/checkouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth(secretKey) },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new GatewayApiError(KIND, `PayMaya create failed: ${res.status}`);

    const data = (await res.json()) as any;
    if (!data.checkoutId || !data.redirectUrl) throw new GatewayApiError(KIND, 'PayMaya did not return checkout data', { cause: data });

    return { gatewayId: String(data.checkoutId), orderId: params.orderId, status: 'pending', redirectUrl: String(data.redirectUrl), rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('PayMaya refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');
    const expected = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-webhook-secret'] || '');
    if (!got || got !== expected) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const event = String(p.event || '').toLowerCase();
    const mapped = event.includes('success') ? 'paid' : event.includes('fail') ? 'failed' : 'pending';

    return {
      id: String(p.id || p.checkoutId || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.requestReferenceNumber || ''),
      gatewayPaymentId: String(p.checkoutId || p.id || ''),
      status: mapped,
      amount: p.amount !== undefined ? Number(p.amount) : undefined,
      currency: String(p.currency || 'PHP'),
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('secretKey');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via PayMaya sandbox run.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new PayMayaGateway(config, options));
registerMarketing(KIND, { brandLabel: 'PayMaya', description: 'Philippines wallet and checkout payments.', logoPath: '/static/payment-gateways/paymaya.png', brandColor: '#1f9d55', websiteUrl: 'https://www.paymaya.com', badges: ['new'] });
