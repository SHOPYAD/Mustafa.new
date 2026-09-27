import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'zarinpal';
const API_BASE = 'https://api.zarinpal.com/pg/v4';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

export class ZarinpalGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Zarinpal';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['IR'] as const;
  readonly supportedCurrencies = ['IRR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const merchantId = this.requiredConfig<string>('merchantId');

    const body = {
      merchant_id: merchantId,
      amount: Math.round(params.amount),
      callback_url: params.callbackUrl || params.successUrl || '',
      description: params.description || 'Payment',
      metadata: { email: params.customer?.email || '', mobile: params.customer?.phone || '', orderId: params.orderId },
    };

    const res = await fetch(`${API_BASE}/payment/request.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new GatewayApiError(KIND, `Zarinpal request failed: ${res.status}`);

    const data = (await res.json()) as any;
    const auth = String(data?.data?.authority || '');
    if (!auth) throw new GatewayApiError(KIND, 'Zarinpal did not return authority', { cause: data });

    return {
      gatewayId: auth,
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: `https://www.zarinpal.com/pg/StartPay/${auth}`,
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Zarinpal refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');
    const expected = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-webhook-secret'] || '');
    if (!got || got !== expected) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const statusRaw = String(p.Status || p.status || '').toUpperCase();
    const statusOk = statusRaw === 'OK' || statusRaw === 'PAID' || statusRaw === 'SUCCESS';
    const statusFailed = ['NOK', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(statusRaw);

    return {
      id: String(p.Authority || p.authority || Date.now()),
      type: statusOk ? 'payment.paid' : statusFailed ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.orderId || p.metadata?.orderId || ''),
      gatewayPaymentId: String(p.Authority || p.authority || ''),
      status: statusOk ? 'paid' : statusFailed ? 'failed' : 'pending',
      amount: p.amount !== undefined ? Number(p.amount) : undefined,
      currency: 'IRR',
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('merchantId');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via sandbox run.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new ZarinpalGateway(config, options));
registerMarketing(KIND, { brandLabel: 'Zarinpal', description: 'Iran payment gateway with hosted checkout.', logoPath: '/static/payment-gateways/zarinpal.png', brandColor: '#0ea5e9', websiteUrl: 'https://zarinpal.com', badges: ['new'] });
