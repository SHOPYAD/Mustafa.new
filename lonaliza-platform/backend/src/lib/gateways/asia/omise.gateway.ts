import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'omise';
const API_BASE = 'https://api.omise.co';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, secret: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

function auth(secret: string): string {
  return `Basic ${Buffer.from(`${secret}:`).toString('base64')}`;
}

export class OmiseGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Omise';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['TH'] as const;
  readonly supportedCurrencies = ['THB'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const secret = this.requiredConfig<string>('secretKey');

    // Hosted source + charge model: return redirect URL from source if available.
    const srcForm = new URLSearchParams();
    srcForm.set('type', 'internet_banking_bbl');
    srcForm.set('amount', String(Math.round(params.amount * 100)));
    srcForm.set('currency', params.currency || 'THB');

    const srcRes = await fetch(`${API_BASE}/sources`, {
      method: 'POST',
      headers: { Authorization: auth(secret), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: srcForm,
      signal: AbortSignal.timeout(10000),
    });
    if (!srcRes.ok) throw new GatewayApiError(KIND, `Omise source create failed: ${srcRes.status}`);
    const source = (await srcRes.json()) as any;

    const chargeForm = new URLSearchParams();
    chargeForm.set('amount', String(Math.round(params.amount * 100)));
    chargeForm.set('currency', params.currency || 'THB');
    chargeForm.set('source', String(source.id || ''));
    chargeForm.set('return_uri', params.successUrl || params.callbackUrl || '');
    chargeForm.set('description', params.description || 'Payment');
    chargeForm.set('metadata[orderId]', params.orderId);

    const chargeRes = await fetch(`${API_BASE}/charges`, {
      method: 'POST',
      headers: { Authorization: auth(secret), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: chargeForm,
      signal: AbortSignal.timeout(10000),
    });
    if (!chargeRes.ok) throw new GatewayApiError(KIND, `Omise charge create failed: ${chargeRes.status}`);
    const charge = (await chargeRes.json()) as any;

    return {
      gatewayId: String(charge.id || params.orderId),
      orderId: params.orderId,
      status: String(charge.status || '').toLowerCase() === 'successful' ? 'paid' : 'pending',
      redirectUrl: String(source.redirect?.uri || charge.authorize_uri || ''),
      rawResponse: { source, charge },
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Omise refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');
    const expected = this.requiredConfig<string>('webhookSecret');
    const got = String(headers?.['x-webhook-secret'] || '');
    if (!got || got !== expected) throw new WebhookVerificationFailedError(KIND);

    const p = payload as any;
    const key = String(p.key || '').toLowerCase();
    const data = p.data || {};
    const mapped = key.includes('successful') ? 'paid' : key.includes('failed') ? 'failed' : 'pending';

    return {
      id: String(data.id || p.id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(data.metadata?.orderId || ''),
      gatewayPaymentId: String(data.id || ''),
      status: mapped,
      amount: data.amount !== undefined ? Number(data.amount) / 100 : undefined,
      currency: String(data.currency || 'THB').toUpperCase(),
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('secretKey');
    this.requiredConfig<string>('webhookSecret');
    return { success: true, message: 'Configuration accepted. Validate via Omise sandbox run.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new OmiseGateway(config, options));
registerMarketing(KIND, { brandLabel: 'Omise', description: 'Thailand payment gateway for cards and banking.', logoPath: '/static/payment-gateways/omise.png', brandColor: '#111827', websiteUrl: 'https://www.omise.co', badges: ['new'] });
