import { createHmac } from 'crypto';
import { z } from 'zod';
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
import { baseCreatePaymentSchema } from '../core/validation';

const KIND = 'paywant';
const API_BASE = 'https://secure.paywant.com';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'apiKey', label: 'API Key', type: 'text', required: true },
  {
    key: 'apiSecret',
    label: 'API Secret',
    type: 'password',
    required: true,
    secret: true,
  },
  { key: 'paymentChannel', label: 'Payment Channel', type: 'text', required: false },
];

const schema = baseCreatePaymentSchema.extend({
  customer: z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
    customerId: z.string().optional(),
  }).optional(),
});

function b64Hmac(secret: string, data: string): string {
  return createHmac('sha256', secret).update(data).digest('base64');
}

export class PaywantGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Paywant';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['TR'] as const;
  readonly supportedCurrencies = ['TRY'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected createSchema() {
    return schema;
  }

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const apiKey = this.requiredConfig<string>('apiKey');
    const apiSecret = this.requiredConfig<string>('apiSecret');

    const userID = params.customer?.customerId || params.orderId;
    const userEmail = params.customer?.email || 'guest@example.com';
    const userAccountName = params.customer?.name || 'Guest User';
    const userIp = '127.0.0.1';

    const signatureData = `${userAccountName}|${userEmail}|${userID}${apiKey}`;
    const hash = b64Hmac(apiSecret, signatureData);

    const body = {
      apiKey,
      userAccountName,
      userEmail,
      userID: Number.isNaN(Number(userID)) ? 0 : Number(userID),
      userIPAddress: userIp,
      hash,
      proApi: true,
      productData: {
        name: (params.description || 'Order').slice(0, 80),
        amount: Number(params.amount.toFixed(2)),
        extraData: params.orderId,
        paymentChannel: this.optionalConfig<string>('paymentChannel') || '0',
        commissionType: '1',
      },
    };

    const res = await fetch(`${API_BASE}/payment/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new GatewayApiError(KIND, `Paywant create failed: ${res.status}`);
    }

    const data = (await res.json()) as { status?: boolean; message?: string };
    if (!data.status || !data.message) {
      throw new GatewayApiError(KIND, 'Paywant did not return a checkout link', {
        cause: data,
      });
    }

    return {
      gatewayId: params.orderId,
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: data.message,
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Paywant refund API is not enabled in this adapter', {
      gateway: KIND,
    });
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not object');
    }

    const p = payload as Record<string, unknown>;
    const apiKey = this.requiredConfig<string>('apiKey');
    const apiSecret = this.requiredConfig<string>('apiSecret');

    const signatureData = `${String(p.transactionID || '')}|${String(p.extraData || '')}|${String(
      p.userID || '',
    )}|${String(p.userAccountName || '')}|${String(p.status || '')}|${String(
      p.paymentChannel || '',
    )}|${String(p.paymentTotal || '')}|${String(p.netProfit || '')}${apiKey}`;

    const expected = b64Hmac(apiSecret, signatureData);
    if (expected !== String(p.hash || '')) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const paid = Number(p.status) === 100;
    return {
      id: String(p.transactionID || Date.now()),
      type: paid ? 'payment.paid' : 'payment.failed',
      gateway: KIND,
      orderId: String(p.extraData || ''),
      gatewayPaymentId: String(p.transactionID || ''),
      status: paid ? 'paid' : 'failed',
      amount: p.paymentTotal !== undefined ? Number(p.paymentTotal) : undefined,
      currency: 'TRY',
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('apiKey');
    this.requiredConfig<string>('apiSecret');
    return {
      success: true,
      message: 'Configuration accepted. Validate via sandbox payment run.',
      durationMs: 0,
    };
  }
}

GatewayRegistry.register((config, options) => new PaywantGateway(config, options));

registerMarketing(KIND, {
  brandLabel: 'Paywant',
  description: 'Hosted checkout link payments for Turkey merchants.',
  logoPath: '/static/payment-gateways/paywant.png',
  brandColor: '#141b2d',
  websiteUrl: 'https://paywant.com',
  docsUrl: 'https://secure.paywant.com',
  badges: ['new'],
});
