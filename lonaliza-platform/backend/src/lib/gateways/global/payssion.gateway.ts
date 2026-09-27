/**
 * Payssion — global alternative payment methods (APM) redirect flow.
 *
 * Reference implementation (signing + endpoints):
 *   https://github.com/payssion/payssion-php
 *
 * Notify: `notify_sig` = md5(api_key|pm_id|amount|currency|order_id|state|secret_key)
 */

import { createHash, timingSafeEqual } from 'crypto';
import { z } from 'zod';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import {
  GatewayApiError,
  InvalidWebhookError,
  NetworkError,
  WebhookVerificationFailedError,
  classifyHttpError,
} from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type {
  CreatePaymentParams,
  GatewayConfigField,
  GatewayPaymentResult,
  GatewayRefundResult,
  PaymentStatus,
  RefundParams,
  WebhookEvent,
  WebhookEventType,
} from '../core/types';
import { baseCreatePaymentSchema } from '../core/validation';

const KIND = 'payssion';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'apiKey',
    label: 'API Key',
    type: 'password',
    required: true,
    secret: true,
    helpText: 'Payssion merchant dashboard → API credentials.',
  },
  {
    key: 'secretKey',
    label: 'Secret Key',
    type: 'password',
    required: true,
    secret: true,
  },
  {
    key: 'pmId',
    label: 'Default payment method ID',
    type: 'text',
    required: true,
    placeholder: 'alipay_cn, wechatpay_cn, …',
    helpText: 'Override per payment with metadata.pm_id if needed.',
  },
];

const payssionCreateSchema = baseCreatePaymentSchema.extend({
  successUrl: z.string().url('Payssion requires successUrl as return_url'),
});

export class PayssionGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Payssion';
  readonly type = 'card' as const;
  readonly supportedCountries = ['*'] as const;
  readonly supportedCurrencies = ['*'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected createSchema() {
    return payssionCreateSchema;
  }

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const apiKey = this.requiredConfig<string>('apiKey');
    const secretKey = this.requiredConfig<string>('secretKey');
    const pmId =
      (params.metadata?.pm_id as string | undefined) || this.requiredConfig<string>('pmId');

    const form: Record<string, string> = {
      api_key: apiKey,
      pm_id: pmId,
      amount: String(params.amount),
      currency: params.currency.toUpperCase(),
      order_id: params.orderId,
      description: (params.description || `Order ${params.orderId}`).slice(0, 200),
      return_url: params.successUrl!,
    };
    if (params.callbackUrl) form.notify_url = params.callbackUrl;

    form.api_sig = this.signCreate(form, secretKey);

    const res = await this.postForm<PayssionCreateResponse>('payment/create', form);

    if (Number(res.result_code) !== 200 || !res.redirect_url) {
      throw new GatewayApiError(KIND, res.description || res.result_message || 'Payssion create failed', {
        providerCode: String(res.result_code),
        cause: res,
      });
    }

    return {
      gatewayId: res.transaction_id || res.order_id || params.orderId,
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: res.redirect_url,
      rawResponse: res,
    };
  }

  protected async refundPaymentImpl(params: RefundParams): Promise<GatewayRefundResult> {
    const apiKey = this.requiredConfig<string>('apiKey');
    const secretKey = this.requiredConfig<string>('secretKey');
    const currency = (params.currency || 'USD').toUpperCase();
    const form: Record<string, string> = {
      api_key: apiKey,
      transaction_id: params.gatewayId,
      currency,
    };
    if (params.amount !== undefined) form.amount = String(params.amount);
    form.api_sig = this.signRefund(form, secretKey);

    const res = await this.postForm<PayssionRefundResponse>('refunds', form);
    if (Number(res.result_code) !== 200) {
      throw new GatewayApiError(KIND, res.description || 'Payssion refund failed', {
        providerCode: String(res.result_code),
        cause: res,
      });
    }
    return {
      success: true,
      gatewayRefundId: res.refund_id || res.transaction_id || params.gatewayId,
      status: 'succeeded',
      totalRefunded: params.amount || 0,
      refundedAt: new Date(),
      rawResponse: res,
    };
  }

  protected async getPaymentStatusImpl(gatewayId: string): Promise<PaymentStatus> {
    const apiKey = this.requiredConfig<string>('apiKey');
    const secretKey = this.requiredConfig<string>('secretKey');
    const form: Record<string, string> = {
      api_key: apiKey,
      transaction_id: gatewayId,
      order_id: '',
    };
    form.api_sig = this.signDetails(form, secretKey);
    const res = await this.postForm<PayssionDetailsResponse>('payment/details', form);
    return this.mapState(res.state || res.transaction?.state);
  }

  protected parseWebhookEventImpl(payload: unknown, _headers?: Record<string, string>): WebhookEvent {
    const obj =
      payload && typeof payload === 'object' && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : null;
    if (!obj) throw new InvalidWebhookError(KIND, 'payload is not an object');

    const apiKey = this.requiredConfig<string>('apiKey');
    const secretKey = this.requiredConfig<string>('secretKey');
    const pmId = String(obj.pm_id || '');
    const amount = String(obj.amount ?? '');
    const currency = String(obj.currency || '');
    const orderId = String(obj.order_id || '');
    const state = String(obj.state || '');
    const notifySig = String(obj.notify_sig || '');

    const check = [apiKey, pmId, amount, currency, orderId, state, secretKey].join('|');
    const expected = createHash('md5').update(check, 'utf8').digest('hex');
    if (!notifySig || !this.constantTimeEqual(notifySig, expected)) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const status = this.mapState(state);
    const type = this.mapWebhookType(state, status);

    return {
      id: String(obj.transaction_id || orderId || `payssion-${Date.now()}`),
      type,
      gateway: KIND,
      orderId,
      gatewayPaymentId: String(obj.transaction_id || ''),
      status,
      amount: Number(obj.amount),
      currency: currency || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  private signCreate(params: Record<string, string>, secret: string): string {
    const ordered = {
      api_key: params.api_key,
      pm_id: params.pm_id,
      amount: params.amount,
      currency: params.currency,
      order_id: params.order_id,
      secret_key: secret,
    };
    return createHash('md5')
      .update(Object.values(ordered).join('|'), 'utf8')
      .digest('hex');
  }

  private signDetails(params: Record<string, string>, secret: string): string {
    const ordered = {
      api_key: params.api_key,
      transaction_id: params.transaction_id,
      order_id: params.order_id,
      secret_key: secret,
    };
    return createHash('md5')
      .update(Object.values(ordered).join('|'), 'utf8')
      .digest('hex');
  }

  private signRefund(params: Record<string, string>, secret: string): string {
    const ordered = {
      api_key: params.api_key,
      transaction_id: params.transaction_id,
      amount: params.amount ?? '',
      currency: params.currency,
      secret_key: secret,
    };
    return createHash('md5')
      .update(Object.values(ordered).join('|'), 'utf8')
      .digest('hex');
  }

  private async postForm<T>(path: string, form: Record<string, string>): Promise<T> {
    const base = this.testMode ? 'http://sandbox.payssion.com/api/v1/' : 'https://www.payssion.com/api/v1/';
    const url = `${base}${path}`;
    const body = new URLSearchParams(form).toString();
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'liotrip-payment_api/1.0',
        },
        body,
      });
    } catch (err) {
      throw new NetworkError(KIND, err);
    }
    const text = await response.text();
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = { raw: text };
    }
    if (!response.ok) {
      throw classifyHttpError(KIND, response.status, parsed);
    }
    return parsed as T;
  }

  private mapState(state?: string): PaymentStatus {
    switch ((state || '').toLowerCase()) {
      case 'completed':
        return 'paid';
      case 'paid_partial':
        return 'partially_refunded';
      case 'pending':
        return 'pending';
      case 'failed':
      case 'error':
        return 'failed';
      case 'expired':
        return 'expired';
      default:
        return 'pending';
    }
  }

  private mapWebhookType(state: string, status: PaymentStatus): WebhookEventType {
    if (state === 'completed' || status === 'paid') return 'payment.paid';
    if (state === 'failed' || state === 'error') return 'payment.failed';
    if (state === 'expired') return 'payment.expired';
    if (state === 'paid_partial') return 'payment.partially_refunded';
    return 'unknown';
  }

  private constantTimeEqual(a: string, b: string): boolean {
    const x = Buffer.from(a, 'utf8');
    const y = Buffer.from(b, 'utf8');
    if (x.length !== y.length) return false;
    return timingSafeEqual(x, y);
  }
}

interface PayssionCreateResponse {
  result_code?: number | string;
  result_message?: string;
  description?: string;
  redirect_url?: string;
  transaction_id?: string;
  order_id?: string;
}

interface PayssionRefundResponse {
  result_code?: number | string;
  description?: string;
  refund_id?: string;
  transaction_id?: string;
}

interface PayssionDetailsResponse {
  state?: string;
  transaction?: { state?: string };
}

registerMarketing(KIND, {
  brandLabel: 'Payssion',
  description: '200+ local payment methods worldwide via one redirect integration.',
  logoPath: 'payssion.svg',
  brandColor: '#1E88E5',
  websiteUrl: 'https://www.payssion.com',
  docsUrl: 'https://www.payssion.com/en/docs/',
  badges: ['popular'],
  platformBillingEligible: false,
});

GatewayRegistry.register((config, options) => new PayssionGateway(config, options));
