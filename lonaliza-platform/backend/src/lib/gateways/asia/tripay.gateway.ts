import { createHmac } from 'crypto';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'tripay';
const API_BASE = 'https://tripay.co.id/api';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'apiKey', label: 'API Key', type: 'password', required: true, secret: true },
  { key: 'merchantCode', label: 'Merchant Code', type: 'text', required: true },
  { key: 'privateKey', label: 'Private Key', type: 'password', required: true, secret: true },
  { key: 'paymentMethod', label: 'Payment Method', type: 'text', required: false, default: 'BRIVA' },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

export class TripayGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Tripay';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['ID'] as const;
  readonly supportedCurrencies = ['IDR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const apiKey = this.requiredConfig<string>('apiKey');
    const merchantCode = this.requiredConfig<string>('merchantCode');
    const privateKey = this.requiredConfig<string>('privateKey');
    const merchantRef = params.orderId;
    const amount = Math.round(params.amount);
    const signature = createHmac('sha256', privateKey)
      .update(`${merchantCode}${merchantRef}${amount}`)
      .digest('hex');

    const body = {
      method: this.optionalConfig<string>('paymentMethod') || 'BRIVA',
      merchant_ref: merchantRef,
      amount,
      customer_name: params.customer?.name || 'Customer',
      customer_email: params.customer?.email || 'guest@example.com',
      customer_phone: params.customer?.phone || '',
      order_items: [{ sku: merchantRef, name: params.description || 'Payment', price: amount, quantity: 1 }],
      return_url: params.successUrl || params.callbackUrl || '',
      callback_url: params.callbackUrl || '',
      expired_time: Math.floor(Date.now() / 1000) + 3600,
      signature,
    };

    const res = await fetch(`${API_BASE}/transaction/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new GatewayApiError(KIND, `Tripay create failed: ${res.status}`);
    const data = (await res.json()) as any;
    const trx = data?.data || {};
    if (!trx.checkout_url && !trx.payment_url) throw new GatewayApiError(KIND, 'Tripay did not return checkout URL', { cause: data });

    return { gatewayId: String(trx.reference || merchantRef), orderId: params.orderId, status: 'pending', redirectUrl: String(trx.checkout_url || trx.payment_url), rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Tripay refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');
    const expected = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-webhook-secret'] || '');
    if (!got || got !== expected) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const s = String(p.status || '').toUpperCase();
    const mapped = s === 'PAID' ? 'paid' : ['FAILED', 'EXPIRED', 'CANCELED'].includes(s) ? 'failed' : 'pending';

    return {
      id: String(p.reference || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.merchant_ref || ''),
      gatewayPaymentId: String(p.reference || ''),
      status: mapped,
      amount: p.amount !== undefined ? Number(p.amount) : undefined,
      currency: 'IDR',
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('apiKey');
    this.requiredConfig<string>('merchantCode');
    this.requiredConfig<string>('privateKey');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via sandbox payment run.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new TripayGateway(config, options));
registerMarketing(KIND, { brandLabel: 'Tripay', description: 'Indonesia multi-channel payment gateway.', logoPath: '/static/payment-gateways/tripay.png', brandColor: '#111827', websiteUrl: 'https://tripay.co.id', badges: ['new'] });
