import { createHmac } from 'crypto';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import {
  GatewayApiError,
  InvalidRequestError,
  InvalidWebhookError,
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

const KIND = 'youcanpay';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'privateKey', label: 'Private Key', type: 'password', required: true, secret: true },
  { key: 'publicKey', label: 'Public Key', type: 'text', required: true },
  {
    key: 'baseUrl',
    label: 'Base URL',
    type: 'select',
    required: false,
    options: [
      { value: 'https://youcanpay.com/sandbox/api', label: 'Sandbox' },
      { value: 'https://youcanpay.com/api', label: 'Production' },
    ],
    default: 'https://youcanpay.com/sandbox/api',
  },
];

function sign(secret: string, payload: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export class YouCanPayGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'YouCan Pay';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['MA'] as const;
  readonly supportedCurrencies = ['MAD', 'EUR', 'USD'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const privateKey = this.requiredConfig<string>('privateKey');
    const baseUrl = this.optionalConfig<string>('baseUrl') || 'https://youcanpay.com/sandbox/api';

    const body = {
      order_id: params.orderId,
      amount: Math.round(params.amount * 100),
      currency: params.currency || 'MAD',
      customer_name: params.customer?.name || 'Customer',
      customer_email: params.customer?.email || 'guest@example.com',
      customer_phone: params.customer?.phone || '',
      success_url: params.successUrl || params.callbackUrl || '',
      error_url: params.failureUrl || params.callbackUrl || '',
      metadata: { description: params.description || 'Payment' },
    };

    const res = await fetch(`${baseUrl}/tokenize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${privateKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new GatewayApiError(KIND, `YouCanPay create failed: ${res.status}`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    const token = String(data.token || '');
    if (!token) {
      throw new GatewayApiError(KIND, 'YouCanPay did not return payment token', { cause: data });
    }

    const isSandbox = baseUrl.includes('/sandbox/');
    const payBase = isSandbox
      ? 'https://youcanpay.com/sandbox/payment'
      : 'https://youcanpay.com/payment';

    return {
      gatewayId: token,
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: `${payBase}/${token}`,
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('YouCanPay refund endpoint is not implemented in this adapter', {
      gateway: KIND,
    });
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not object');
    }
    const p = payload as Record<string, unknown>;

    // Optional soft integrity check if integrator passes a signed field.
    const givenSig = String(p.signature || '');
    if (!givenSig) {
      throw new InvalidWebhookError(KIND, 'missing signature');
    }
    const expected = sign(
      this.requiredConfig<string>('privateKey'),
      `${String(p.order_id || '')}|${String(p.amount || '')}|${String(p.status || '')}`,
    );
    if (expected !== givenSig) {
      throw new InvalidWebhookError(KIND, 'invalid signature');
    }

    const statusRaw = String(p.status || '').toLowerCase();
    const mapped = ['paid', 'success', 'completed'].includes(statusRaw)
      ? 'paid'
      : ['failed', 'cancelled'].includes(statusRaw)
        ? 'failed'
        : 'pending';

    return {
      id: String(p.id || p.transaction_id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.order_id || ''),
      gatewayPaymentId: String(p.id || p.transaction_id || ''),
      status: mapped,
      amount: p.amount !== undefined ? Number(p.amount) / 100 : undefined,
      currency: String(p.currency || ''),
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('privateKey');
    this.requiredConfig<string>('publicKey');
    return {
      success: true,
      message: 'Configuration accepted. Validate via sandbox payment run.',
      durationMs: 0,
    };
  }
}

GatewayRegistry.register((config, options) => new YouCanPayGateway(config, options));

registerMarketing(KIND, {
  brandLabel: 'YouCan Pay',
  description: 'Morocco-focused online card payment gateway.',
  logoPath: '/static/payment-gateways/youcanpay.png',
  brandColor: '#1a9dff',
  websiteUrl: 'https://youcanpay.com',
  badges: ['new'],
});
