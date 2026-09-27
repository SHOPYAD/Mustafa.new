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

const KIND = 'xendit';
const API_BASE = 'https://api.xendit.co';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'apiKey', label: 'API Key', type: 'password', required: true, secret: true },
  { key: 'webhookToken', label: 'Webhook Token', type: 'password', required: true, secret: true },
  {
    key: 'paymentMethod',
    label: 'Payment Method',
    type: 'select',
    required: false,
    options: [
      { value: 'invoice', label: 'Invoice' },
      { value: 'ewallet', label: 'E-Wallet' },
    ],
    default: 'invoice',
  },
];

function authHeader(apiKey: string): string {
  return `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;
}

export class XenditGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Xendit';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['ID', 'PH'] as const;
  readonly supportedCurrencies = ['IDR', 'PHP'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const apiKey = this.requiredConfig<string>('apiKey');
    const paymentMethod = this.optionalConfig<string>('paymentMethod') || 'invoice';

    if (paymentMethod !== 'invoice') {
      throw new InvalidRequestError('This adapter currently supports Xendit invoice flow only', {
        gateway: KIND,
      });
    }

    const body = {
      external_id: params.orderId,
      amount: Number(params.amount.toFixed(0)),
      payer_email: params.customer?.email || 'guest@example.com',
      description: params.description || 'Payment',
      currency: params.currency || 'IDR',
      success_redirect_url: params.successUrl || params.callbackUrl || '',
      failure_redirect_url: params.failureUrl || params.callbackUrl || '',
      customer: {
        given_names: params.customer?.name || 'Customer',
        email: params.customer?.email || 'guest@example.com',
        mobile_number: params.customer?.phone || '',
      },
      items: [
        {
          name: params.description || 'Payment',
          quantity: 1,
          price: Number(params.amount.toFixed(0)),
        },
      ],
    };

    const res = await fetch(`${API_BASE}/v2/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader(apiKey),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new GatewayApiError(KIND, `Xendit create failed: ${res.status}`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    const invoiceUrl = String(data.invoice_url || '');
    if (!invoiceUrl) {
      throw new GatewayApiError(KIND, 'Xendit did not return invoice_url', {
        cause: data,
      });
    }

    return {
      gatewayId: String(data.id || params.orderId),
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: invoiceUrl,
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Xendit refund endpoint is not implemented in this adapter', {
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

    const expectedToken = this.requiredConfig<string>('webhookToken');
    const gotToken = String(
      headers?.['x-callback-token'] || headers?.['x-webhook-token'] || '',
    );
    if (!gotToken || gotToken !== expectedToken) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const p = payload as Record<string, unknown>;
    const statusRaw = String(p.status || '').toUpperCase();
    const mapped = ['PAID', 'SETTLED', 'SUCCEEDED'].includes(statusRaw)
      ? 'paid'
      : ['EXPIRED', 'FAILED', 'VOIDED'].includes(statusRaw)
        ? 'failed'
        : 'pending';

    return {
      id: String(p.id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.external_id || ''),
      gatewayPaymentId: String(p.id || ''),
      status: mapped,
      amount: p.amount !== undefined ? Number(p.amount) : undefined,
      currency: String(p.currency || ''),
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('apiKey');
    this.requiredConfig<string>('webhookToken');
    return {
      success: true,
      message: 'Configuration accepted. Validate via Xendit sandbox payment run.',
      durationMs: 0,
    };
  }
}

GatewayRegistry.register((config, options) => new XenditGateway(config, options));

registerMarketing(KIND, {
  brandLabel: 'Xendit',
  description: 'Southeast Asia payments via invoices and wallets.',
  logoPath: '/static/payment-gateways/xendit.png',
  brandColor: '#3b82f6',
  websiteUrl: 'https://xendit.co',
  badges: ['new'],
});
