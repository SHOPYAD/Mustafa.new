import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'doku';
const API_BASE = 'https://api-sandbox.doku.com';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'clientId', label: 'Client ID', type: 'text', required: true },
  { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, secret: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

export class DokuGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'DOKU';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['ID'] as const;
  readonly supportedCurrencies = ['IDR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const clientId = this.requiredConfig<string>('clientId');
    const secretKey = this.requiredConfig<string>('secretKey');
    const body = {
      order: { amount: Math.round(params.amount), invoice_number: params.orderId, currency: 'IDR' },
      payment: { payment_due_date: 60 },
      customer: { name: params.customer?.name || 'Customer', email: params.customer?.email || 'guest@example.com' },
      url: { return_url: params.successUrl || params.callbackUrl || '', callback_url: params.callbackUrl || '' },
    };

    const res = await fetch(`${API_BASE}/checkout/v1/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Client-Id': clientId, 'Secret-Key': secretKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new GatewayApiError(KIND, `DOKU create failed: ${res.status}`);
    const data = (await res.json()) as any;
    const payUrl = String(data?.response?.payment?.url || data?.payment?.url || '');
    if (!payUrl) throw new GatewayApiError(KIND, 'DOKU did not return payment URL', { cause: data });

    return { gatewayId: String(data?.response?.order?.invoice_number || params.orderId), orderId: params.orderId, status: 'pending', redirectUrl: payUrl, rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('DOKU refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');
    const expected = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-webhook-secret'] || '');
    if (!got || got !== expected) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const s = String(p.transaction?.status || p.status || '').toUpperCase();
    const mapped = ['SUCCESS', 'PAID', 'COMPLETED'].includes(s) ? 'paid' : ['FAILED', 'EXPIRED', 'CANCELLED'].includes(s) ? 'failed' : 'pending';
    return {
      id: String(p.transaction?.id || p.id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.order?.invoice_number || p.invoice_number || ''),
      gatewayPaymentId: String(p.transaction?.id || p.id || ''),
      status: mapped,
      amount: p.order?.amount !== undefined ? Number(p.order.amount) : undefined,
      currency: 'IDR',
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('clientId');
    this.requiredConfig<string>('secretKey');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via sandbox payment run.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new DokuGateway(config, options));
registerMarketing(KIND, { brandLabel: 'DOKU', description: 'Indonesia payment orchestration and channels.', logoPath: '/static/payment-gateways/doku.png', brandColor: '#1f4e79', websiteUrl: 'https://www.doku.com', badges: ['new'] });
