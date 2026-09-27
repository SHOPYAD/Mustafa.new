import { createHmac } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'bitpay';
const API_BASE = 'https://test.bitpay.com';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'token', label: 'API Token', type: 'password', required: true, secret: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

function sign(raw: string, secret: string): string {
  return createHmac('sha256', secret).update(raw).digest('hex');
}

export class BitPayGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'BitPay';
  readonly type: GatewayType = 'crypto';
  readonly supportedCountries = ['GLOBAL'] as const;
  readonly supportedCurrencies = ['USD', 'EUR', 'BTC'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const token = this.requiredConfig<string>('token');

    const body = {
      price: Number(params.amount.toFixed(2)),
      currency: (params.currency || 'USD').toUpperCase(),
      orderId: params.orderId,
      itemDesc: params.description || 'Payment',
      notificationURL: params.callbackUrl || '',
      redirectURL: params.successUrl || params.callbackUrl || '',
      transactionSpeed: 'medium',
    };

    const res = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-accept-version': '2.0.0', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new GatewayApiError(KIND, `BitPay create failed: ${res.status}`);
    const data = (await res.json()) as any;
    const inv = data?.data || data;
    if (!inv?.id || !inv?.url) throw new GatewayApiError(KIND, 'BitPay did not return invoice id/url', { cause: data });

    return { gatewayId: String(inv.id), orderId: params.orderId, status: 'pending', redirectUrl: String(inv.url), rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('BitPay refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');

    const secret = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-signature'] || headers?.['x-bitpay-sig'] || '');
    const expected = sign(JSON.stringify(payload), secret);
    if (!got || !safeCompare(got.toLowerCase(), expected.toLowerCase())) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const d = p.data || p;
    const s = String(d.status || '').toLowerCase();
    const mapped = ['confirmed', 'complete', 'paid'].includes(s) ? 'paid' : ['invalid', 'expired'].includes(s) ? 'failed' : 'pending';

    return {
      id: String(d.id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(d.orderId || ''),
      gatewayPaymentId: String(d.id || ''),
      status: mapped,
      amount: d.price !== undefined ? Number(d.price) : undefined,
      currency: String(d.currency || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('token');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via test invoice.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new BitPayGateway(config, options));
registerMarketing(KIND, { brandLabel: 'BitPay', description: 'Enterprise crypto payments and invoicing.', logoPath: '/static/payment-gateways/bitpay.png', brandColor: '#2563eb', websiteUrl: 'https://bitpay.com', badges: ['new'] });
