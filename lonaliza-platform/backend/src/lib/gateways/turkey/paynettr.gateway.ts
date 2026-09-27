import { createHmac } from 'crypto';
import { z } from 'zod';
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
import { baseCreatePaymentSchema } from '../core/validation';

const KIND = 'paynettr';
const API_BASE = 'https://api.paynet.com.tr';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
  {
    key: 'secretKey',
    label: 'Secret Key',
    type: 'password',
    required: true,
    secret: true,
  },
];

const schema = baseCreatePaymentSchema.extend({
  successUrl: z.string().url().optional(),
  failureUrl: z.string().url().optional(),
  callbackUrl: z.string().url().optional(),
});

function signature(secret: string, data: Record<string, unknown>): string {
  const payload = Object.keys(data)
    .filter((k) => k !== 'signature')
    .sort()
    .map((k) => `${k}=${String(data[k] ?? '')}`)
    .join('&');
  return createHmac('sha256', secret).update(payload).digest('hex').toUpperCase();
}

export class PayNetTRGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'PayNet TR';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['TR'] as const;
  readonly supportedCurrencies = ['TRY'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected createSchema() {
    return schema;
  }

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const merchantId = this.requiredConfig<string>('merchantId');
    const secretKey = this.requiredConfig<string>('secretKey');
    const orderId = params.orderId;

    const body: Record<string, unknown> = {
      merchant_id: merchantId,
      order_id: orderId,
      amount: Math.round(params.amount * 100),
      currency: params.currency || 'TRY',
      description: params.description || 'Payment',
      success_url: params.successUrl || params.callbackUrl || '',
      fail_url: params.failureUrl || params.callbackUrl || '',
      callback_url: params.callbackUrl || '',
      customer_email: params.customer?.email || '',
      customer_name: params.customer?.name || '',
      customer_phone: params.customer?.phone || '',
    };

    body.signature = signature(secretKey, body);

    const res = await fetch(`${API_BASE}/api/v1/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new GatewayApiError(KIND, `PayNetTR create failed: ${res.status}`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    if (!data.success) {
      throw new GatewayApiError(KIND, String(data.message || 'PayNetTR create failed'));
    }

    return {
      gatewayId: String(data.payment_id || orderId),
      orderId,
      status: 'pending',
      redirectUrl: String(data.payment_url || ''),
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('PayNetTR refund endpoint not implemented in this adapter', {
      gateway: KIND,
    });
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not object');
    }
    const p = payload as Record<string, unknown>;

    const secretKey = this.requiredConfig<string>('secretKey');
    const received = String(p.signature || '');
    const expected = signature(secretKey, p);
    if (!received || expected !== received) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const status = String(p.status || '').toLowerCase();
    const mapped = ['success', 'completed', 'approved'].includes(status)
      ? 'paid'
      : ['failed', 'declined', 'cancelled'].includes(status)
        ? 'failed'
        : 'pending';

    return {
      id: String(p.payment_id || p.transaction_id || p.order_id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.order_id || ''),
      gatewayPaymentId: String(p.payment_id || p.transaction_id || ''),
      status: mapped,
      amount: p.amount !== undefined ? Number(p.amount) / 100 : undefined,
      currency: String(p.currency || 'TRY'),
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('merchantId');
    this.requiredConfig<string>('secretKey');
    return {
      success: true,
      message: 'Configuration accepted. Validate via sandbox payment run.',
      durationMs: 0,
    };
  }
}

GatewayRegistry.register((config, options) => new PayNetTRGateway(config, options));

registerMarketing(KIND, {
  brandLabel: 'PayNet TR',
  description: 'Turkey card payment gateway with hosted payment URLs.',
  logoPath: '/static/payment-gateways/paynettr.png',
  brandColor: '#2a4fa4',
  websiteUrl: 'https://www.paynet.com.tr',
  docsUrl: 'https://api.paynet.com.tr',
  badges: ['new'],
});
