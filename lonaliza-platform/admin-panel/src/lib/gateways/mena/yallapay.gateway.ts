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

const KIND = 'yallapay';
const API_BASE = 'https://yallapay.net/api';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'privateKey', label: 'Private Key', type: 'password', required: true, secret: true },
  {
    key: 'currency',
    label: 'Currency',
    type: 'select',
    required: false,
    options: [
      { value: 'USD', label: 'USD' },
      { value: 'TRY', label: 'TRY' },
      { value: 'AED', label: 'AED' },
      { value: 'SAR', label: 'SAR' },
      { value: 'EGP', label: 'EGP' },
    ],
    default: 'USD',
  },
  {
    key: 'webhookSecret',
    label: 'Webhook Secret',
    type: 'password',
    required: false,
    secret: true,
  },
];

export class YallaPayGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'YallaPay';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['AE', 'SA', 'EG'] as const;
  readonly supportedCurrencies = ['USD', 'AED', 'SAR', 'EGP'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const privateKey = this.requiredConfig<string>('privateKey');
    const currency = this.optionalConfig<string>('currency') || params.currency || 'USD';

    const body = {
      private_key: privateKey,
      currency,
      amount: Number(params.amount.toFixed(2)),
      purpose: (params.description || 'Order').slice(0, 120),
      external_id: params.orderId,
      is_fallback: '0',
    };

    const res = await fetch(`${API_BASE}/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new GatewayApiError(KIND, `YallaPay create failed: ${res.status}`);
    }

    const data = (await res.json()) as Record<string, any>;
    if (String(data.status) !== 'success' || !data.data?.checkout_url) {
      throw new GatewayApiError(KIND, String(data.message || 'YallaPay create failed'), {
        cause: data,
      });
    }

    return {
      gatewayId: String(data.data.transaction_id || params.orderId),
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: String(data.data.checkout_url),
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('YallaPay refund endpoint is not implemented in this adapter', {
      gateway: KIND,
    });
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not object');
    }
    const p = payload as Record<string, unknown>;

    const expectedSecret = this.optionalConfig<string>('webhookSecret');
    if (expectedSecret) {
      const got = String(p.webhook_secret || '');
      if (got !== expectedSecret) {
        throw new WebhookVerificationFailedError(KIND);
      }
    }

    const statusRaw = String(p.status || '').toLowerCase();
    const mapped = ['paid', 'success', 'completed'].includes(statusRaw)
      ? 'paid'
      : ['failed', 'declined', 'cancelled'].includes(statusRaw)
        ? 'failed'
        : 'pending';

    return {
      id: String(p.transaction_id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.external_id || ''),
      gatewayPaymentId: String(p.transaction_id || ''),
      status: mapped,
      amount: p.amount !== undefined ? Number(p.amount) : undefined,
      currency: String(p.currency || ''),
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('privateKey');
    return {
      success: true,
      message: 'Configuration accepted. Validate via sandbox payment run.',
      durationMs: 0,
    };
  }
}

GatewayRegistry.register((config, options) => new YallaPayGateway(config, options));

registerMarketing(KIND, {
  brandLabel: 'YallaPay',
  description: 'MENA wallet and hosted checkout payment gateway.',
  logoPath: '/static/payment-gateways/yallapay.png',
  brandColor: '#00a884',
  websiteUrl: 'https://yallapay.net',
  badges: ['new'],
});
