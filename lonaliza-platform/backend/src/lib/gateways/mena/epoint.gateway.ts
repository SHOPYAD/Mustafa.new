import { createHmac } from 'crypto';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import {
  GatewayApiError,
  InvalidRequestError,
  InvalidWebhookError,
  WebhookVerificationFailedError,
} from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type {
  CreatePaymentParams,
  GatewayConfigField,
  GatewayPaymentResult,
  GatewayRefundResult,
  GatewayTestResult,
  GatewayType,
  RefundParams,
  WebhookEvent,
} from '../core/types';

const KIND = 'epoint';
const API_BASE = 'https://epoint.az/api';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
  { key: 'privateKey', label: 'Private Key', type: 'password', required: true, secret: true },
];

function sign(secret: string, data: Record<string, unknown>): string {
  const payload = Object.keys(data)
    .filter((k) => k !== 'signature')
    .sort()
    .map((k) => `${k}=${String(data[k] ?? '')}`)
    .join('&');
  return createHmac('sha256', secret).update(payload).digest('hex').toUpperCase();
}

export class EPointGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'ePoint';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['AZ'] as const;
  readonly supportedCurrencies = ['AZN', 'USD', 'EUR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const merchantId = this.requiredConfig<string>('merchantId');
    const privateKey = this.requiredConfig<string>('privateKey');

    const body: Record<string, unknown> = {
      merchant_id: merchantId,
      order_id: params.orderId,
      amount: Math.round(params.amount * 100),
      currency: params.currency || 'AZN',
      description: params.description || 'Payment',
      success_url: params.successUrl || params.callbackUrl || '',
      fail_url: params.failureUrl || params.callbackUrl || '',
      callback_url: params.callbackUrl || '',
      language: 'az',
      email: params.customer?.email || '',
      phone: params.customer?.phone || '',
    };
    body.signature = sign(privateKey, body);

    const res = await fetch(`${API_BASE}/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new GatewayApiError(KIND, `ePoint create failed: ${res.status}`);
    }

    const data = (await res.json()) as Record<string, any>;
    if (!data.success || !data.data?.payment_url) {
      throw new GatewayApiError(KIND, String(data.message || 'ePoint create failed'), {
        cause: data,
      });
    }

    return {
      gatewayId: String(data.data.payment_id || params.orderId),
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: String(data.data.payment_url),
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('ePoint refund endpoint is not implemented in this adapter', {
      gateway: KIND,
    });
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not object');
    }
    const p = payload as Record<string, unknown>;

    const privateKey = this.requiredConfig<string>('privateKey');
    const received = String(p.signature || '');
    const expected = sign(privateKey, p);
    if (!received || expected !== received) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const statusRaw = String(p.status || '').toLowerCase();
    const mapped = ['success', 'completed'].includes(statusRaw)
      ? 'paid'
      : ['failed', 'cancelled'].includes(statusRaw)
        ? 'failed'
        : 'pending';

    return {
      id: String(p.payment_id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.order_id || ''),
      gatewayPaymentId: String(p.payment_id || ''),
      status: mapped,
      amount: p.amount !== undefined ? Number(p.amount) / 100 : undefined,
      currency: String(p.currency || ''),
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('merchantId');
    this.requiredConfig<string>('privateKey');
    return {
      success: true,
      message: 'Configuration accepted. Validate via sandbox payment run.',
      durationMs: 0,
    };
  }
}

GatewayRegistry.register((config, options) => new EPointGateway(config, options));

registerMarketing(KIND, {
  brandLabel: 'ePoint',
  description: 'Azerbaijan payment gateway for hosted card checkout.',
  logoPath: '/static/payment-gateways/epoint.png',
  brandColor: '#111111',
  websiteUrl: 'https://epoint.az',
  badges: ['new'],
});
