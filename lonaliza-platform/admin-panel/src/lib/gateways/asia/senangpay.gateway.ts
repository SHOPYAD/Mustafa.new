import { createHash } from 'crypto';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'senangpay';
const API_BASE = 'https://sandbox.senangpay.my/payment';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
  { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, secret: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

export class SenangPayGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'SenangPay';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['MY'] as const;
  readonly supportedCurrencies = ['MYR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const merchantId = this.requiredConfig<string>('merchantId');
    const secret = this.requiredConfig<string>('secretKey');
    const amount = params.amount.toFixed(2);
    const detail = params.description || 'Payment';
    const orderId = params.orderId;
    const hash = createHash('md5').update(secret + detail + amount + orderId).digest('hex');

    const payUrl = `${API_BASE}/${merchantId}?detail=${encodeURIComponent(detail)}&amount=${encodeURIComponent(amount)}&order_id=${encodeURIComponent(orderId)}&hash=${hash}`;

    return { gatewayId: orderId, orderId: params.orderId, status: 'pending', redirectUrl: payUrl, rawResponse: { url: payUrl } };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('SenangPay refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');
    const expected = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-webhook-secret'] || '');
    if (!got || got !== expected) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const statusRaw = String(p.status || '').toLowerCase();
    const statusId = String(p.status_id || '');
    const paid = statusId === '1' || statusRaw === 'paid' || statusRaw === 'success';
    const failed = statusId === '0' || ['failed', 'cancelled', 'expired'].includes(statusRaw);
    return {
      id: String(p.transaction_id || p.order_id || Date.now()),
      type: paid ? 'payment.paid' : failed ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.order_id || ''),
      gatewayPaymentId: String(p.transaction_id || ''),
      status: paid ? 'paid' : failed ? 'failed' : 'pending',
      amount: p.amount !== undefined ? Number(p.amount) : undefined,
      currency: 'MYR',
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('merchantId');
    this.requiredConfig<string>('secretKey');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via SenangPay sandbox run.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new SenangPayGateway(config, options));
registerMarketing(KIND, { brandLabel: 'SenangPay', description: 'Malaysia online payment gateway.', logoPath: '/static/payment-gateways/senangpay.png', brandColor: '#14b8a6', websiteUrl: 'https://senangpay.my', badges: ['new'] });
