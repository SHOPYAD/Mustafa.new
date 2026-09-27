import { createHash } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'cryptomus';
const API_BASE = 'https://api.cryptomus.com/v1';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'merchantId', label: 'Merchant UUID', type: 'text', required: true },
  { key: 'apiKey', label: 'API Key', type: 'password', required: true, secret: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

function signBody(body: string, apiKey: string): string {
  const b64 = Buffer.from(body).toString('base64');
  return createHash('md5').update(b64 + apiKey).digest('hex');
}

export class CryptomusGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Cryptomus';
  readonly type: GatewayType = 'crypto';
  readonly supportedCountries = ['GLOBAL'] as const;
  readonly supportedCurrencies = ['USD', 'EUR', 'USDT', 'BTC', 'ETH'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const merchantId = this.requiredConfig<string>('merchantId');
    const apiKey = this.requiredConfig<string>('apiKey');

    const bodyObj = {
      amount: Number(params.amount.toFixed(2)),
      currency: (params.currency || 'USD').toUpperCase(),
      order_id: params.orderId,
      url_callback: params.callbackUrl || '',
      url_return: params.successUrl || params.callbackUrl || '',
      url_success: params.successUrl || params.callbackUrl || '',
      url_fail: params.failureUrl || params.callbackUrl || '',
      is_payment_multiple: false,
      lifetime: 3600,
    };
    const body = JSON.stringify(bodyObj);

    const res = await fetch(`${API_BASE}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        merchant: merchantId,
        sign: signBody(body, apiKey),
      },
      body,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new GatewayApiError(KIND, `Cryptomus create failed: ${res.status}`);
    const data = (await res.json()) as any;
    const d = data?.result || {};
    if (!d.url || !d.uuid) throw new GatewayApiError(KIND, 'Cryptomus did not return invoice url/uuid', { cause: data });

    return { gatewayId: String(d.uuid), orderId: params.orderId, status: 'pending', redirectUrl: String(d.url), rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Cryptomus refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');

    const webhookSecret = this.requiredConfig<string>('webhookSecret');
    const gotSignature = String(headers?.['sign'] || headers?.['x-sign'] || '');
    const raw = JSON.stringify(payload);
    const expected = createHash('md5').update(raw + webhookSecret).digest('hex');
    if (!gotSignature || !safeCompare(gotSignature.toLowerCase(), expected.toLowerCase())) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const p = payload as any;
    const statusRaw = String(p.status || '').toLowerCase();
    const mapped = ['paid', 'paid_over'].includes(statusRaw) ? 'paid' : ['cancel', 'cancelled', 'fail', 'failed', 'system_fail'].includes(statusRaw) ? 'failed' : 'pending';

    return {
      id: String(p.uuid || p.order_id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.order_id || ''),
      gatewayPaymentId: String(p.uuid || ''),
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
    return { success: true, message: 'Configuration accepted. Validate via live sandbox invoice.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new CryptomusGateway(config, options));
registerMarketing(KIND, { brandLabel: 'Cryptomus', description: 'Crypto payment processing with hosted checkout.', logoPath: '/static/payment-gateways/cryptomus.png', brandColor: '#1f2937', websiteUrl: 'https://cryptomus.com', badges: ['new'] });
