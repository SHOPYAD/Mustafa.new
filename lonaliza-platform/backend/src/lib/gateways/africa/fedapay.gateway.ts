import { createHmac } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'fedapay';
const API_BASE = 'https://sandbox-api.fedapay.com/v1';

function sign(raw: string, secret: string): string {
  return createHmac('sha256', secret).update(raw).digest('hex');
}

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'apiKey', label: 'API Key', type: 'password', required: true, secret: true },
  { key: 'environment', label: 'Environment', type: 'select', required: false, default: 'sandbox', options: [{ label: 'Sandbox', value: 'sandbox' }, { label: 'Production', value: 'production' }] as any },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

export class FedaPayGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'FedaPay';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['BJ'] as const;
  readonly supportedCurrencies = ['XOF'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const apiKey = this.requiredConfig<string>('apiKey');
    const base = (this.optionalConfig<string>('environment') || 'sandbox') === 'production' ? 'https://api.fedapay.com/v1' : API_BASE;

    const body = {
      description: params.description || `Order ${params.orderId}`,
      amount: Math.round(params.amount),
      currency: { iso: (params.currency || 'XOF').toUpperCase() },
      callback_url: params.callbackUrl || '',
      customer: {
        firstname: params.customer?.firstName || 'Guest',
        lastname: params.customer?.lastName || 'User',
        email: params.customer?.email || 'guest@example.com',
        phone_number: { number: params.customer?.phone || '' },
      },
      metadata: { orderId: params.orderId },
    };

    const res = await fetch(`${base}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new GatewayApiError(KIND, `FedaPay create failed: ${res.status}`);
    const data = (await res.json()) as any;
    const d = data?.v1 || data?.data || data;
    if (!d?.id) throw new GatewayApiError(KIND, 'FedaPay did not return transaction id', { cause: data });

    const tokenRes = await fetch(`${base}/transactions/${d.id}/token`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!tokenRes.ok) throw new GatewayApiError(KIND, `FedaPay token failed: ${tokenRes.status}`);
    const tokenData = (await tokenRes.json()) as any;
    const redirect = String(tokenData?.url || tokenData?.data?.url || '');
    if (!redirect) throw new GatewayApiError(KIND, 'FedaPay did not return checkout URL', { cause: tokenData });

    return { gatewayId: String(d.id), orderId: params.orderId, status: 'pending', redirectUrl: redirect, rawResponse: { create: data, token: tokenData } };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('FedaPay refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');

    const expected = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-fedapay-signature'] || '');
    const sig = sign(String(headers?.['x-raw-body'] || JSON.stringify(payload)), expected);
    if (!got || !safeCompare(got.toLowerCase(), sig.toLowerCase())) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const d = p.entity || p.data || {};
    const statusRaw = String(d.status || p.name || '').toLowerCase();
    const mapped = statusRaw.includes('approved') || statusRaw.includes('successful') ? 'paid' : statusRaw.includes('declined') || statusRaw.includes('canceled') ? 'failed' : 'pending';

    return {
      id: String(d.id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(d.metadata?.orderId || ''),
      gatewayPaymentId: String(d.id || ''),
      status: mapped,
      amount: d.amount !== undefined ? Number(d.amount) : undefined,
      currency: String(d.currency?.iso || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('apiKey');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via sandbox transaction.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new FedaPayGateway(config, options));
registerMarketing(KIND, { brandLabel: 'FedaPay', description: 'West Africa digital payment gateway.', logoPath: '/static/payment-gateways/fedapay.png', brandColor: '#0ea5e9', websiteUrl: 'https://fedapay.com', badges: ['new'] });
