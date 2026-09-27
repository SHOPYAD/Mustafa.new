import { createHmac } from 'crypto';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'paycom';
const API_BASE = 'https://checkout.test.paycom.uz/api';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
  { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, secret: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

export class PaycomGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Paycom';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['UZ'] as const;
  readonly supportedCurrencies = ['UZS'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const merchantId = this.requiredConfig<string>('merchantId');
    const secret = this.requiredConfig<string>('secretKey');

    const accountOrder = params.orderId;
    const amountTiyin = Math.round(params.amount * 100);
    const payload = {
      id: Date.now(),
      method: 'receipts.create',
      params: {
        amount: amountTiyin,
        account: { order_id: accountOrder },
      },
    };

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${merchantId}:${secret}`).toString('base64')}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new GatewayApiError(KIND, `Paycom create failed: ${res.status}`);

    const data = (await res.json()) as any;
    const receipt = data?.result?.receipt || {};
    const checkId = String(receipt._id || '');
    if (!checkId) throw new GatewayApiError(KIND, 'Paycom did not return receipt id', { cause: data });

    const redirectUrl = `https://checkout.paycom.uz/${checkId}`;
    return { gatewayId: checkId, orderId: params.orderId, status: 'pending', redirectUrl, rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Paycom refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');
    const expected = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-webhook-secret'] || '');
    if (!got || got !== expected) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const state = Number(p.params?.state ?? p.state ?? p.result?.state ?? 0);
    const mapped = state === 4 ? 'paid' : state < 0 ? 'failed' : 'pending';
    const orderId = String(p.params?.account?.order_id || p.account?.order_id || p.result?.receipt?.account?.order_id || '');
    const gatewayPaymentId = String(p.params?.id || p.result?.receipt?._id || p.id || '');
    const amountRaw = p.params?.amount ?? p.amount;

    return {
      id: String(p.id || gatewayPaymentId || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId,
      gatewayPaymentId,
      status: mapped,
      amount: amountRaw !== undefined ? Number(amountRaw) / 100 : undefined,
      currency: 'UZS',
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('merchantId');
    this.requiredConfig<string>('secretKey');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via test receipt flow.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new PaycomGateway(config, options));
registerMarketing(KIND, { brandLabel: 'Paycom', description: 'Uzbekistan online card checkout.', logoPath: '/static/payment-gateways/paycom.png', brandColor: '#0f172a', websiteUrl: 'https://paycom.uz', badges: ['new'] });
