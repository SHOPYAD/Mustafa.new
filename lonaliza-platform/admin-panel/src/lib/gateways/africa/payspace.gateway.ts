import { createHmac } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'payspace';
const API_BASE = 'https://sandbox.payspace.co.za/api/v1';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
  { key: 'apiKey', label: 'API Key', type: 'password', required: true, secret: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

function sign(raw: string, secret: string): string {
  return createHmac('sha256', secret).update(raw).digest('hex');
}

export class PaySpaceGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'PaySpace';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['ZA'] as const;
  readonly supportedCurrencies = ['ZAR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const merchantId = this.requiredConfig<string>('merchantId');
    const apiKey = this.requiredConfig<string>('apiKey');

    const body = {
      merchantId,
      reference: params.orderId,
      amount: Number(params.amount.toFixed(2)),
      currency: (params.currency || 'ZAR').toUpperCase(),
      callbackUrl: params.callbackUrl || '',
      successUrl: params.successUrl || params.callbackUrl || '',
      failureUrl: params.failureUrl || params.callbackUrl || '',
      description: params.description || `Order ${params.orderId}`,
    };

    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new GatewayApiError(KIND, `PaySpace create failed: ${res.status}`);
    const data = (await res.json()) as any;
    const d = data?.data || data;
    if (!d.id || !d.checkoutUrl) throw new GatewayApiError(KIND, 'PaySpace did not return id/checkoutUrl', { cause: data });

    return { gatewayId: String(d.id), orderId: params.orderId, status: 'pending', redirectUrl: String(d.checkoutUrl), rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('PaySpace refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');
    const secret = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-payspace-signature'] || '');
    const expected = sign(String(headers?.['x-raw-body'] || JSON.stringify(payload)), secret);
    if (!got || !safeCompare(got.toLowerCase(), expected.toLowerCase())) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const s = String(p.status || '').toLowerCase();
    const mapped = ['paid', 'success', 'completed'].includes(s) ? 'paid' : ['failed', 'cancelled', 'expired'].includes(s) ? 'failed' : 'pending';

    return {
      id: String(p.id || p.reference || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.reference || ''),
      gatewayPaymentId: String(p.id || ''),
      status: mapped,
      amount: p.amount !== undefined ? Number(p.amount) : undefined,
      currency: String(p.currency || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('merchantId');
    this.requiredConfig<string>('apiKey');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via sandbox checkout.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new PaySpaceGateway(config, options));
registerMarketing(KIND, { brandLabel: 'PaySpace', description: 'South Africa digital payments gateway.', logoPath: '/static/payment-gateways/payspace.png', brandColor: '#0f766e', websiteUrl: 'https://www.payspace.com', badges: ['new'] });
