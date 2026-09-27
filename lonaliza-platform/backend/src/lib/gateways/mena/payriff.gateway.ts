import { createHash } from 'crypto';
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

const KIND = 'payriff';
const API_BASE = 'https://api.payriff.com';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
  { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, secret: true },
];

function sign(merchant: string, order: string, amount: number, currency: string, secret: string): string {
  return createHash('sha256')
    .update(`${merchant}${order}${amount}${currency}${secret}`)
    .digest('hex')
    .toUpperCase();
}

export class PayriffGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Payriff';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['AZ'] as const;
  readonly supportedCurrencies = ['AZN', 'USD', 'EUR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const merchant = this.requiredConfig<string>('merchantId');
    const secret = this.requiredConfig<string>('secretKey');
    const amount = Number(params.amount.toFixed(2));
    const currency = params.currency || 'AZN';

    const body: Record<string, unknown> = {
      merchant,
      order: params.orderId,
      amount,
      currency,
      description: params.description || 'Payment',
      approveURL: params.successUrl || params.callbackUrl || '',
      cancelURL: params.failureUrl || params.callbackUrl || '',
      declineURL: params.failureUrl || params.callbackUrl || '',
      callbackURL: params.callbackUrl || '',
      language: 'AZ',
    };
    body.signature = sign(merchant, params.orderId, amount, currency, secret);

    const res = await fetch(`${API_BASE}/api/v2/createOrder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new GatewayApiError(KIND, `Payriff create failed: ${res.status}`);
    }

    const data = (await res.json()) as Record<string, any>;
    if (Number(data.code) !== 1 || !data.payload?.redirect) {
      throw new GatewayApiError(KIND, String(data.message || 'Payriff create failed'), {
        cause: data,
      });
    }

    return {
      gatewayId: String(data.payload.sessionId || params.orderId),
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: String(data.payload.redirect),
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Payriff refund endpoint is not implemented in this adapter', {
      gateway: KIND,
    });
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not object');
    }
    const p = payload as Record<string, unknown>;

    const merchant = this.requiredConfig<string>('merchantId');
    const secret = this.requiredConfig<string>('secretKey');
    const order = String(p.order || '');
    const amount = Number(p.amount || 0);
    const currency = String(p.currency || 'AZN');
    const received = String(p.signature || '');

    const expected = sign(merchant, order, amount, currency, secret);
    if (!received || received !== expected) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const statusRaw = String(p.status || '').toUpperCase();
    const mapped = statusRaw === 'APPROVED' ? 'paid' : ['DECLINED', 'CANCELLED'].includes(statusRaw) ? 'failed' : 'pending';

    return {
      id: String(p.rrn || p.sessionId || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: order,
      gatewayPaymentId: String(p.rrn || p.sessionId || ''),
      status: mapped,
      amount,
      currency,
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

GatewayRegistry.register((config, options) => new PayriffGateway(config, options));

registerMarketing(KIND, {
  brandLabel: 'Payriff',
  description: 'Azerbaijan card payments with hosted redirect checkout.',
  logoPath: '/static/payment-gateways/payriff.png',
  brandColor: '#2152ff',
  websiteUrl: 'https://payriff.az',
  badges: ['new'],
});
