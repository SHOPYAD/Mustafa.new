import { createHash } from 'crypto';
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

const KIND = 'midtrans';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'serverKey', label: 'Server Key', type: 'password', required: true, secret: true },
  { key: 'clientKey', label: 'Client Key', type: 'text', required: true },
  {
    key: 'isProduction',
    label: 'Production Mode',
    type: 'boolean',
    required: false,
    default: false,
  },
];

function authHeader(serverKey: string): string {
  return `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;
}

export class MidtransGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Midtrans';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['ID'] as const;
  readonly supportedCurrencies = ['IDR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const serverKey = this.requiredConfig<string>('serverKey');
    const isProduction = Boolean(this.optionalConfig<boolean>('isProduction'));
    const snapUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const body = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: Number(params.amount.toFixed(0)),
      },
      customer_details: {
        first_name: params.customer?.firstName || params.customer?.name || 'Customer',
        last_name: params.customer?.lastName || '',
        email: params.customer?.email || 'guest@example.com',
        phone: params.customer?.phone || '+62812345678',
      },
      callbacks: {
        finish: params.successUrl || params.callbackUrl || '',
      },
    };

    const res = await fetch(snapUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader(serverKey),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new GatewayApiError(KIND, `Midtrans create failed: ${res.status}`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    const redirectUrl = String(data.redirect_url || '');
    const token = String(data.token || '');
    if (!redirectUrl || !token) {
      throw new GatewayApiError(KIND, 'Midtrans did not return redirect_url/token', {
        cause: data,
      });
    }

    return {
      gatewayId: token,
      orderId: params.orderId,
      status: 'pending',
      redirectUrl,
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Midtrans refund endpoint is not implemented in this adapter', {
      gateway: KIND,
    });
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not object');
    }
    const p = payload as Record<string, unknown>;

    const orderId = String(p.order_id || '');
    const statusCode = String(p.status_code || '');
    const grossAmount = String(p.gross_amount || '');
    const signature = String(p.signature_key || '');
    const serverKey = this.requiredConfig<string>('serverKey');

    const expected = createHash('sha512')
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest('hex');
    if (!signature || signature !== expected) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const ts = String(p.transaction_status || '').toLowerCase();
    const mapped = ['capture', 'settlement'].includes(ts)
      ? 'paid'
      : ['deny', 'cancel', 'expire', 'failure'].includes(ts)
        ? 'failed'
        : 'pending';

    return {
      id: String(p.transaction_id || orderId || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId,
      gatewayPaymentId: String(p.transaction_id || ''),
      status: mapped,
      amount: grossAmount ? Number(grossAmount) : undefined,
      currency: String(p.currency || 'IDR'),
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('serverKey');
    this.requiredConfig<string>('clientKey');
    return {
      success: true,
      message: 'Configuration accepted. Validate via Midtrans sandbox payment run.',
      durationMs: 0,
    };
  }
}

GatewayRegistry.register((config, options) => new MidtransGateway(config, options));

registerMarketing(KIND, {
  brandLabel: 'Midtrans',
  description: 'Indonesia payment gateway with Snap hosted checkout.',
  logoPath: '/static/payment-gateways/midtrans.png',
  brandColor: '#00a8e8',
  websiteUrl: 'https://midtrans.com',
  badges: ['new'],
});
