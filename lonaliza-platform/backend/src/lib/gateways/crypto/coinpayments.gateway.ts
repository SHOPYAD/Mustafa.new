import { createHmac } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'coinpayments';
const API_BASE = 'https://www.coinpayments.net/api.php';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'publicKey', label: 'Public Key', type: 'text', required: true },
  { key: 'privateKey', label: 'Private Key', type: 'password', required: true, secret: true },
  { key: 'ipnSecret', label: 'IPN Secret', type: 'password', required: true, secret: true },
];

function cpSign(form: string, secret: string): string {
  return createHmac('sha512', secret).update(form).digest('hex');
}

export class CoinPaymentsGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'CoinPayments';
  readonly type: GatewayType = 'crypto';
  readonly supportedCountries = ['GLOBAL'] as const;
  readonly supportedCurrencies = ['USD', 'USDT', 'BTC', 'ETH', 'LTC'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const publicKey = this.requiredConfig<string>('publicKey');
    const privateKey = this.requiredConfig<string>('privateKey');

    const form = new URLSearchParams();
    form.set('version', '1');
    form.set('cmd', 'create_transaction');
    form.set('key', publicKey);
    form.set('format', 'json');
    form.set('amount', params.amount.toFixed(2));
    form.set('currency1', (params.currency || 'USD').toUpperCase());
    form.set('currency2', 'USDT.TRC20');
    form.set('buyer_email', params.customer?.email || 'guest@example.com');
    form.set('item_name', params.description || 'Payment');
    form.set('item_number', params.orderId);
    form.set('ipn_url', params.callbackUrl || '');
    form.set('success_url', params.successUrl || params.callbackUrl || '');
    form.set('cancel_url', params.failureUrl || params.callbackUrl || '');

    const body = form.toString();
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        HMAC: cpSign(body, privateKey),
      },
      body,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new GatewayApiError(KIND, `CoinPayments create failed: ${res.status}`);
    const data = (await res.json()) as any;
    const result = data?.result || {};
    if (!result.txn_id || !result.status_url) throw new GatewayApiError(KIND, 'CoinPayments did not return transaction info', { cause: data });

    return { gatewayId: String(result.txn_id), orderId: params.orderId, status: 'pending', redirectUrl: String(result.checkout_url || result.status_url), rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('CoinPayments refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');

    const ipnSecret = this.requiredConfig<string>('ipnSecret');
    const sig = String(headers?.['hmac'] || headers?.['x-hmac'] || '');
    const raw = JSON.stringify(payload);
    const expected = cpSign(raw, ipnSecret);
    if (!sig || !safeCompare(sig.toLowerCase(), expected.toLowerCase())) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const p = payload as any;
    const statusNum = Number(p.status || 0);
    const mapped = statusNum >= 100 || statusNum === 2 ? 'paid' : statusNum < 0 ? 'failed' : 'pending';

    return {
      id: String(p.txn_id || p.invoice || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.item_number || p.invoice || ''),
      gatewayPaymentId: String(p.txn_id || ''),
      status: mapped,
      amount: p.amount1 !== undefined ? Number(p.amount1) : undefined,
      currency: String(p.currency1 || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('publicKey');
    this.requiredConfig<string>('privateKey');
    this.requiredConfig<string>('ipnSecret');
    return { success: true, message: 'Configuration accepted. Validate via test transaction.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new CoinPaymentsGateway(config, options));
registerMarketing(KIND, { brandLabel: 'CoinPayments', description: 'Global multi-coin payment processing.', logoPath: '/static/payment-gateways/coinpayments.png', brandColor: '#2563eb', websiteUrl: 'https://www.coinpayments.net', badges: ['new'] });
