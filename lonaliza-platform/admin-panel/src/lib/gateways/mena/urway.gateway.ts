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

const KIND = 'urway';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'terminalId', label: 'Terminal ID', type: 'text', required: true },
  { key: 'password', label: 'Password', type: 'password', required: true, secret: true },
  {
    key: 'merchantKey',
    label: 'Merchant Key',
    type: 'password',
    required: true,
    secret: true,
  },
  {
    key: 'baseUrl',
    label: 'Base URL',
    type: 'select',
    required: false,
    options: [
      {
        value: 'https://payments-dev.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest',
        label: 'Sandbox',
      },
      {
        value: 'https://payments.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest',
        label: 'Production',
      },
    ],
    default:
      'https://payments-dev.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest',
  },
  { key: 'country', label: 'Country', type: 'text', required: false, default: 'SA' },
];

function hash(trackId: string, terminalId: string, password: string, merchantKey: string, amount: string, currency: string): string {
  return createHash('sha256')
    .update(`${trackId}|${terminalId}|${password}|${merchantKey}|${amount}|${currency}`)
    .digest('hex');
}

export class URWayGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'URWay';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['SA', 'AE'] as const;
  readonly supportedCurrencies = ['SAR', 'AED', 'USD'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const terminalId = this.requiredConfig<string>('terminalId');
    const password = this.requiredConfig<string>('password');
    const merchantKey = this.requiredConfig<string>('merchantKey');
    const baseUrl =
      this.optionalConfig<string>('baseUrl') ||
      'https://payments-dev.urway-tech.com/URWAYPGService/transaction/jsonProcess/JSONrequest';

    const trackid = params.orderId;
    const amount = params.amount.toFixed(2);
    const currency = params.currency.toUpperCase();

    const requestHash = hash(trackid, terminalId, password, merchantKey, amount, currency);

    const body = {
      trackid,
      terminalId,
      customerEmail: params.customer?.email || 'guest@example.com',
      action: '1',
      merchantIp: '127.0.0.1',
      password,
      currency,
      country: this.optionalConfig<string>('country') || 'SA',
      amount,
      requestHash,
      udf1: '',
      udf2: params.orderId,
      udf3: '',
      udf4: '',
      udf5: '',
      tokenizationType: '0',
    };

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new GatewayApiError(KIND, `URWay create failed: ${res.status}`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    if (String(data.responseCode || '') !== '000') {
      throw new GatewayApiError(KIND, String(data.responseMessage || 'URWay create failed'), {
        cause: data,
      });
    }

    return {
      gatewayId: String(data.payid || trackid),
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: String(data.paymentUrl || data.targetUrl || ''),
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('URWay refunds are not implemented in this adapter yet', {
      gateway: KIND,
    });
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not object');
    }
    const p = payload as Record<string, unknown>;

    const terminalId = this.requiredConfig<string>('terminalId');
    const password = this.requiredConfig<string>('password');
    const merchantKey = this.requiredConfig<string>('merchantKey');

    const trackid = String(p.trackid || p.TrackId || '');
    const amount = String(p.amount || '');
    const currency = String(p.currency || 'SAR');
    const received = String(p.responseHash || '');

    if (!trackid || !amount || !received) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const expected = hash(trackid, terminalId, password, merchantKey, amount, currency);
    if (expected !== received) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const code = String(p.responseCode || '');
    const mapped = code === '000' ? 'paid' : ['100', '400', '401'].includes(code) ? 'failed' : 'pending';

    return {
      id: String(p.TranId || p.tranid || p.payid || trackid || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.udf2 || trackid || ''),
      gatewayPaymentId: String(p.payid || p.TranId || p.tranid || ''),
      status: mapped,
      amount: amount ? Number(amount) : undefined,
      currency,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('terminalId');
    this.requiredConfig<string>('password');
    this.requiredConfig<string>('merchantKey');
    return {
      success: true,
      message: 'Configuration accepted. Validate via sandbox payment run.',
      durationMs: 0,
    };
  }
}

GatewayRegistry.register((config, options) => new URWayGateway(config, options));

registerMarketing(KIND, {
  brandLabel: 'URWay',
  description: 'MENA payment gateway for cards and regional processing.',
  logoPath: 'urway.svg',
  brandColor: '#1363df',
  websiteUrl: 'https://urway-tech.com',
  badges: ['new'],
});
