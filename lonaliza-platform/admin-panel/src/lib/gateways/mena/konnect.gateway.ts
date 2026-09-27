import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import {
  GatewayApiError,
  InvalidRequestError,
  InvalidWebhookError,
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

const KIND = 'konnect';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'apiKey', label: 'API Key', type: 'password', required: true, secret: true },
  { key: 'receiverWalletId', label: 'Receiver Wallet ID', type: 'text', required: true },
  {
    key: 'baseUrl',
    label: 'Base URL',
    type: 'select',
    required: false,
    options: [
      { value: 'https://api.sandbox.konnect.network/api/v2', label: 'Sandbox' },
      { value: 'https://api.konnect.network/api/v2', label: 'Production' },
    ],
    default: 'https://api.sandbox.konnect.network/api/v2',
  },
  { key: 'token', label: 'Token', type: 'text', required: false, default: 'TND' },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

export class KonnectGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Konnect';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['TN'] as const;
  readonly supportedCurrencies = ['TND', 'EUR', 'USD'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const apiKey = this.requiredConfig<string>('apiKey');
    const receiverWalletId = this.requiredConfig<string>('receiverWalletId');
    const baseUrl = this.optionalConfig<string>('baseUrl') || 'https://api.sandbox.konnect.network/api/v2';

    const body = {
      receiverWalletId,
      token: this.optionalConfig<string>('token') || 'TND',
      amount: Number(params.amount.toFixed(3)),
      type: 'immediate',
      description: (params.description || 'Payment').slice(0, 120),
      acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
      lifespan: 60,
      checkoutForm: false,
      addPaymentFeesToAmount: false,
      orderId: params.orderId,
      webhook: params.callbackUrl,
    };

    const res = await fetch(`${baseUrl}/payments/init-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new GatewayApiError(KIND, `Konnect create failed: ${res.status}`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    const payUrl = String(data.payUrl || '');
    if (!payUrl) {
      throw new GatewayApiError(KIND, 'Konnect did not return payUrl', { cause: data });
    }

    return {
      gatewayId: String(data.paymentRef || params.orderId),
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: payUrl,
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Konnect refund endpoint is not implemented in this adapter', {
      gateway: KIND,
    });
  }

  protected parseWebhookEventImpl(
    payload: unknown,
    headers?: Record<string, string>,
  ): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not object');
    }
    const p = payload as Record<string, unknown>;
    const expectedSecret = this.requiredConfig<string>('webhookSecret');
    const gotSecret = String(
      headers?.['x-webhook-secret'] || headers?.['x-konnect-signature'] || '',
    );
    if (!gotSecret || gotSecret !== expectedSecret) {
      throw new InvalidWebhookError(KIND, 'invalid webhook signature');
    }
    const statusRaw = String(p.status || '').toLowerCase();
    const mapped = statusRaw === 'completed' ? 'paid' : statusRaw === 'failed' ? 'failed' : 'pending';

    return {
      id: String(p.payment_ref || p.paymentRef || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.orderId || ''),
      gatewayPaymentId: String(p.payment_ref || p.paymentRef || ''),
      status: mapped,
      amount: p.amount !== undefined ? Number(p.amount) : undefined,
      currency: String(p.token || ''),
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('apiKey');
    this.requiredConfig<string>('receiverWalletId');
    return {
      success: true,
      message: 'Configuration accepted. Validate via sandbox payment run.',
      durationMs: 0,
    };
  }
}

GatewayRegistry.register((config, options) => new KonnectGateway(config, options));

registerMarketing(KIND, {
  brandLabel: 'Konnect',
  description: 'Tunisia payment gateway for wallet and card collections.',
  logoPath: '/static/payment-gateways/konnect.png',
  brandColor: '#0f2b6b',
  websiteUrl: 'https://konnect.network',
  badges: ['new'],
});
