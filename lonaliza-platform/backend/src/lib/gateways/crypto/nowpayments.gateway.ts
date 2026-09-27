import { createHmac } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'nowpayments';
const API_BASE = 'https://api.nowpayments.io/v1';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'apiKey', label: 'API Key', type: 'password', required: true, secret: true },
  { key: 'ipnSecret', label: 'IPN Secret', type: 'password', required: true, secret: true },
];

function npSign(body: string, secret: string): string {
  return createHmac('sha512', secret).update(body).digest('hex');
}

export class NowPaymentsGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'NOWPayments';
  readonly type: GatewayType = 'crypto';
  readonly supportedCountries = ['GLOBAL'] as const;
  readonly supportedCurrencies = ['USD', 'EUR', 'USDT', 'BTC', 'ETH', 'LTC'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const apiKey = this.requiredConfig<string>('apiKey');

    const bodyObj = {
      price_amount: Number(params.amount.toFixed(2)),
      price_currency: (params.currency || 'USD').toLowerCase(),
      pay_currency: 'usdttrc20',
      order_id: params.orderId,
      order_description: params.description || 'Payment',
      ipn_callback_url: params.callbackUrl || '',
      success_url: params.successUrl || params.callbackUrl || '',
      cancel_url: params.failureUrl || params.callbackUrl || '',
    };

    const res = await fetch(`${API_BASE}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(bodyObj),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new GatewayApiError(KIND, `NOWPayments create failed: ${res.status}`);
    const data = (await res.json()) as any;
    if (!data.payment_id || !data.pay_address) throw new GatewayApiError(KIND, 'NOWPayments did not return payment fields', { cause: data });

    return { gatewayId: String(data.payment_id), orderId: params.orderId, status: 'pending', redirectUrl: String(data.invoice_url || data.pay_address), rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('NOWPayments refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');

    const secret = this.requiredConfig<string>('ipnSecret');
    const signature = String(headers?.['x-nowpayments-sig'] || '');
    const raw = JSON.stringify(payload);
    const expected = npSign(raw, secret);
    if (!signature || !safeCompare(signature.toLowerCase(), expected.toLowerCase())) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const p = payload as any;
    const s = String(p.payment_status || '').toLowerCase();
    const mapped = ['finished', 'confirmed'].includes(s) ? 'paid' : ['failed', 'expired', 'refunded'].includes(s) ? 'failed' : 'pending';

    return {
      id: String(p.payment_id || p.order_id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.order_id || ''),
      gatewayPaymentId: String(p.payment_id || ''),
      status: mapped,
      amount: p.price_amount !== undefined ? Number(p.price_amount) : undefined,
      currency: String(p.price_currency || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('apiKey');
    this.requiredConfig<string>('ipnSecret');
    return { success: true, message: 'Configuration accepted. Validate via test invoice creation.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new NowPaymentsGateway(config, options));
registerMarketing(KIND, { brandLabel: 'NOWPayments', description: 'Crypto checkout with wide coin support.', logoPath: '/static/payment-gateways/nowpayments.png', brandColor: '#16a34a', websiteUrl: 'https://nowpayments.io', badges: ['new'] });
