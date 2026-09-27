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

const KIND = 'noonpayments';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'businessId', label: 'Business ID', type: 'text', required: true },
  { key: 'appName', label: 'App Name', type: 'text', required: true },
  { key: 'appKey', label: 'App Key', type: 'password', required: true, secret: true },
  {
    key: 'baseUrl',
    label: 'Base URL',
    type: 'select',
    required: false,
    options: [
      { value: 'https://api.noonpayments.com/payment/v1/', label: 'Global Production' },
      { value: 'https://api-test.noonpayments.com/payment/v1/', label: 'Global Sandbox' },
      { value: 'https://api.sa.noonpayments.com/payment/v1/', label: 'SA Production' },
      { value: 'https://api-test.sa.noonpayments.com/payment/v1/', label: 'SA Sandbox' },
      { value: 'https://api.eg.noonpayments.com/payment/v1/', label: 'EG Production' },
      { value: 'https://api-test.eg.noonpayments.com/payment/v1/', label: 'EG Sandbox' },
    ],
    default: 'https://api-test.noonpayments.com/payment/v1/',
  },
  {
    key: 'webhookSecret',
    label: 'Webhook Secret',
    type: 'password',
    required: true,
    secret: true,
  },
];

function authKey(businessId: string, appName: string, appKey: string): string {
  return Buffer.from(`${businessId}.${appName}:${appKey}`).toString('base64');
}

export class NoonPaymentsGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'NoonPayments';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['SA', 'AE', 'EG'] as const;
  readonly supportedCurrencies = ['SAR', 'AED', 'EGP', 'USD'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const businessId = this.requiredConfig<string>('businessId');
    const appName = this.requiredConfig<string>('appName');
    const appKey = this.requiredConfig<string>('appKey');
    const baseUrl =
      this.optionalConfig<string>('baseUrl') ||
      'https://api-test.noonpayments.com/payment/v1/';

    const body = {
      apiOperation: 'INITIATE',
      order: {
        amount: Number(params.amount.toFixed(2)),
        currency: params.currency.toUpperCase(),
        reference: params.orderId,
        name: (params.description || 'Order').slice(0, 80),
        channel: 'web',
        category: 'pay',
      },
      configuration: {
        tokenizeCc: 'true',
        returnUrl: params.successUrl || params.callbackUrl || '',
        locale: 'en',
        paymentAction: 'AUTHORIZE,SALE',
      },
    };

    const res = await fetch(`${baseUrl}order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Key ${authKey(businessId, appName, appKey)}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new GatewayApiError(KIND, `Noon create failed: ${res.status}`);
    }

    const data = (await res.json()) as Record<string, any>;
    if (Number(data.resultCode) !== 0 || !data.result?.order) {
      throw new GatewayApiError(KIND, String(data.resultMessage || 'Noon create failed'), {
        cause: data,
      });
    }

    return {
      gatewayId: String(data.result.order.id || params.orderId),
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: String(data.result.url || ''),
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('NoonPayments refund endpoint is not implemented in this adapter', {
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
    const p = payload as Record<string, any>;

    const configured = this.requiredConfig<string>('webhookSecret');
    const incoming = String(
      headers?.['x-webhook-secret'] || headers?.['x-noon-signature'] || '',
    );
    if (!incoming || incoming !== configured) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const order = p.result?.order || p.order || {};
    const statusRaw = String(order.status || p.status || '').toUpperCase();
    const mapped = ['PAID', 'CAPTURED', 'SUCCESS'].includes(statusRaw)
      ? 'paid'
      : ['FAILED', 'DECLINED', 'CANCELLED'].includes(statusRaw)
        ? 'failed'
        : 'pending';

    return {
      id: String(order.id || p.transaction_id || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(order.reference || p.reference || ''),
      gatewayPaymentId: String(order.id || p.transaction_id || ''),
      status: mapped,
      amount: order.amount !== undefined ? Number(order.amount) : undefined,
      currency: String(order.currency || p.currency || ''),
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('businessId');
    this.requiredConfig<string>('appName');
    this.requiredConfig<string>('appKey');
    return {
      success: true,
      message: 'Configuration accepted. Validate via sandbox payment run.',
      durationMs: 0,
    };
  }
}

GatewayRegistry.register((config, options) => new NoonPaymentsGateway(config, options));

registerMarketing(KIND, {
  brandLabel: 'NoonPayments',
  description: 'MENA payment orchestration for cards and wallets.',
  logoPath: '/static/payment-gateways/noonpayments.png',
  brandColor: '#1f1f1f',
  websiteUrl: 'https://www.noonpayments.com',
  badges: ['new'],
});
