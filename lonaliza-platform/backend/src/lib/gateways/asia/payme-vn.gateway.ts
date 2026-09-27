import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'payme-vn';
const API_BASE = 'https://sbx.payme.vn/api';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'clientId', label: 'Client ID', type: 'text', required: true },
  { key: 'apiKey', label: 'API Key', type: 'password', required: true, secret: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

export class PayMeVNGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'PayMe VN';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['VN'] as const;
  readonly supportedCurrencies = ['VND'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const clientId = this.requiredConfig<string>('clientId');
    const apiKey = this.requiredConfig<string>('apiKey');

    const body = {
      partnerId: clientId,
      amount: Math.round(params.amount),
      currency: 'VND',
      orderId: params.orderId,
      description: params.description || 'Payment',
      returnUrl: params.successUrl || params.callbackUrl || '',
      callbackUrl: params.callbackUrl || '',
    };

    const res = await fetch(`${API_BASE}/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new GatewayApiError(KIND, `PayMe VN create failed: ${res.status}`);

    const data = (await res.json()) as any;
    const url = String(data.payUrl || data.checkoutUrl || '');
    if (!url) throw new GatewayApiError(KIND, 'PayMe VN did not return checkout URL', { cause: data });

    return { gatewayId: String(data.transactionId || params.orderId), orderId: params.orderId, status: 'pending', redirectUrl: url, rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('PayMe VN refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');
    const expected = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-webhook-secret'] || '');
    if (!got || got !== expected) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const s = String(p.status || '').toUpperCase();
    const mapped = ['PAID', 'SUCCESS', 'COMPLETED'].includes(s) ? 'paid' : ['FAILED', 'CANCELLED', 'EXPIRED'].includes(s) ? 'failed' : 'pending';

    return {
      id: String(p.transactionId || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.orderId || ''),
      gatewayPaymentId: String(p.transactionId || ''),
      status: mapped,
      amount: p.amount !== undefined ? Number(p.amount) : undefined,
      currency: 'VND',
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('clientId');
    this.requiredConfig<string>('apiKey');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via sandbox run.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new PayMeVNGateway(config, options));
registerMarketing(KIND, { brandLabel: 'PayMe VN', description: 'Vietnam wallet and checkout payment gateway.', logoPath: '/static/payment-gateways/payme-vn.png', brandColor: '#2563eb', websiteUrl: 'https://payme.vn', badges: ['new'] });
