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

const KIND = 'toyyibpay';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, secret: true },
  { key: 'categoryCode', label: 'Category Code', type: 'text', required: true },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
  { key: 'isProduction', label: 'Production Mode', type: 'boolean', required: false, default: false },
];

export class ToyyibPayGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'ToyyibPay';
  readonly type: GatewayType = 'wallet';
  readonly supportedCountries = ['MY'] as const;
  readonly supportedCurrencies = ['MYR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const secretKey = this.requiredConfig<string>('secretKey');
    const categoryCode = this.requiredConfig<string>('categoryCode');
    const isProduction = Boolean(this.optionalConfig<boolean>('isProduction'));
    const apiBase = isProduction
      ? 'https://toyyibpay.com/index.php/api'
      : 'https://dev.toyyibpay.com/index.php/api';
    const payHost = isProduction ? 'https://toyyibpay.com' : 'https://dev.toyyibpay.com';

    const form = new URLSearchParams();
    form.set('userSecretKey', secretKey);
    form.set('categoryCode', categoryCode);
    form.set('billName', (params.description || 'Bill').slice(0, 80));
    form.set('billDescription', (params.description || 'Payment').slice(0, 120));
    form.set('billPriceSetting', '1');
    form.set('billPayorInfo', '1');
    form.set('billAmount', String(Math.round(params.amount * 100)));
    form.set('billReturnUrl', params.successUrl || params.callbackUrl || '');
    form.set('billCallbackUrl', params.callbackUrl || '');
    form.set('billExternalReferenceNo', params.orderId);
    form.set('billTo', params.customer?.name || 'Customer');
    form.set('billEmail', params.customer?.email || 'guest@example.com');
    form.set('billPhone', params.customer?.phone || '60123456789');
    form.set('billSplitPayment', '0');
    form.set('billSplitPaymentArgs', '');
    form.set('billPaymentChannel', '0');
    form.set('billContentEmail', 'Thank you for your payment');

    const res = await fetch(`${apiBase}/createBill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new GatewayApiError(KIND, `ToyyibPay create failed: ${res.status}`);
    }

    const data = (await res.json()) as Array<Record<string, unknown>>;
    const code = String(data?.[0]?.BillCode || '');
    if (!code) {
      throw new GatewayApiError(KIND, 'ToyyibPay did not return BillCode', { cause: data });
    }

    return {
      gatewayId: code,
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: `${payHost}/${code}`,
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('ToyyibPay refund endpoint is not implemented in this adapter', {
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

    const expectedSecret = this.requiredConfig<string>('webhookSecret');
    const gotSecret = String(headers?.['x-webhook-secret'] || '');
    if (!gotSecret || gotSecret !== expectedSecret) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const p = payload as Record<string, unknown>;
    const statusId = String(p.status_id || '');
    const mapped = statusId === '1' ? 'paid' : statusId === '3' ? 'failed' : 'pending';

    return {
      id: String(p.transaction_id || p.billcode || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.order_id || p.billExternalReferenceNo || ''),
      gatewayPaymentId: String(p.transaction_id || p.billcode || ''),
      status: mapped,
      amount: p.amount !== undefined ? Number(p.amount) / 100 : undefined,
      currency: 'MYR',
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('secretKey');
    this.requiredConfig<string>('categoryCode');
    this.requiredConfig<string>('webhookSecret');
    return {
      success: true,
      message: 'Configuration accepted. Validate via ToyyibPay sandbox payment run.',
      durationMs: 0,
    };
  }
}

GatewayRegistry.register((config, options) => new ToyyibPayGateway(config, options));

registerMarketing(KIND, {
  brandLabel: 'ToyyibPay',
  description: 'Malaysia hosted bill and wallet payment platform.',
  logoPath: '/static/payment-gateways/toyyibpay.png',
  brandColor: '#10b981',
  websiteUrl: 'https://toyyibpay.com',
  badges: ['new'],
});
