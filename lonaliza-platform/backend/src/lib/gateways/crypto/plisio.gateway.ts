import { createHash } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'plisio';
const API_BASE = 'https://plisio.net/api/v1';

function md5(s: string): string {
  return createHash('md5').update(s).digest('hex');
}


function buildVerifyHash(data: Record<string, unknown>, apiKey: string): string {
  const params: Record<string, string> = {
    currency: String(data.currency || ''),
    order_number: String(data.order_number || ''),
    order_name: String(data.order_name || ''),
    source_currency: String(data.source_currency || ''),
    source_rate: String(data.source_rate || ''),
    amount: String(data.amount || ''),
    status: String(data.status || ''),
    tx_urls: String(data.tx_urls || ''),
    txn_id: String(data.txn_id || ''),
  };

  const ordered = Object.keys(params)
    .sort()
    .map((k) => params[k])
    .join('|');

  return createHash('sha1').update(`${ordered}|${apiKey}`).digest('hex');
}

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'apiKey', label: 'API Key', type: 'password', required: true, secret: true },
  { key: 'webhookSecret', label: 'Webhook Secret (legacy fallback)', type: 'password', required: false, secret: true },
];

export class PlisioGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Plisio';
  readonly type: GatewayType = 'crypto';
  readonly supportedCountries = ['GLOBAL'] as const;
  readonly supportedCurrencies = ['USD', 'EUR', 'BTC', 'ETH', 'USDT'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const apiKey = this.requiredConfig<string>('apiKey');

    const qs = new URLSearchParams();
    qs.set('api_key', apiKey);
    qs.set('source_currency', (params.currency || 'USD').toUpperCase());
    qs.set('source_amount', params.amount.toFixed(2));
    qs.set('order_number', params.orderId);
    qs.set('order_name', params.description || `Order ${params.orderId}`);
    qs.set('callback_url', params.callbackUrl || '');
    qs.set('success_callback_url', params.successUrl || params.callbackUrl || '');
    qs.set('fail_callback_url', params.failureUrl || params.callbackUrl || '');

    const res = await fetch(`${API_BASE}/invoices/new?${qs.toString()}`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new GatewayApiError(KIND, `Plisio create failed: ${res.status}`);
    const data = (await res.json()) as any;
    const d = data?.data || {};
    if (!d.txn_id || !d.invoice_url) throw new GatewayApiError(KIND, 'Plisio did not return invoice fields', { cause: data });

    return { gatewayId: String(d.txn_id), orderId: params.orderId, status: 'pending', redirectUrl: String(d.invoice_url), rawResponse: data };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Plisio refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');

    const p = payload as Record<string, unknown>;
    const verifyHash = String(p.verify_hash || '').toLowerCase();
    if (!verifyHash) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const apiKey = this.requiredConfig<string>('apiKey');
    const expectedHash = buildVerifyHash(p, apiKey).toLowerCase();
    if (!safeCompare(verifyHash, expectedHash)) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const data = p as any;
    const s = String(data.status || '').toLowerCase();
    const mapped = ['completed', 'confirmed'].includes(s) ? 'paid' : ['error', 'expired', 'cancelled', 'mismatch'].includes(s) ? 'failed' : 'pending';

    return {
      id: String(data.txn_id || data.order_number || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(data.order_number || ''),
      gatewayPaymentId: String(data.txn_id || ''),
      status: mapped,
      amount: data.source_amount !== undefined ? Number(data.source_amount) : undefined,
      currency: String(data.source_currency || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('apiKey');
    return { success: true, message: 'Configuration accepted. Validate via test invoice.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new PlisioGateway(config, options));
registerMarketing(KIND, { brandLabel: 'Plisio', description: 'Crypto invoice and checkout service.', logoPath: '/static/payment-gateways/plisio.png', brandColor: '#7c3aed', websiteUrl: 'https://plisio.net', badges: ['new'] });
