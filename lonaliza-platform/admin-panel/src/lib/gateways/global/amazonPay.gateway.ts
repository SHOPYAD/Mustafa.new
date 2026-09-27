/**
 * Amazon Pay API v2 — Create Checkout Session, Update (amount), GET `amazonPayRedirectUrl`.
 *
 * Signing: AMZN-PAY-RSASSA-PSS-V2
 *   https://developer.amazon.com/docs/amazon-pay-api-v2/signing-requests.html
 */

import { constants, createHash, sign as cryptoSign } from 'crypto';
import { z } from 'zod';
import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import {
  GatewayApiError,
  InvalidRequestError,
  InvalidWebhookError,
  NetworkError,
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

const KIND = 'amazon_pay';

const EMPTY_PAYLOAD_SHA256 = createHash('sha256').update('', 'utf8').digest('hex');

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'publicKeyId',
    label: 'Public key ID',
    type: 'text',
    required: true,
    placeholder: 'SANDBOX-…',
    helpText: 'Amazon Pay Integration Central → Public Key ID.',
  },
  {
    key: 'privateKeyPem',
    label: 'Private key (PEM)',
    type: 'password',
    required: true,
    secret: true,
    helpText: 'RSA private key matching the registered public key.',
  },
  {
    key: 'storeId',
    label: 'Store ID',
    type: 'text',
    required: true,
    placeholder: 'amzn1.application-oa2-client.…',
  },
  {
    key: 'payRegion',
    label: 'Amazon Pay region',
    type: 'select',
    required: true,
    options: [
      { value: 'na', label: 'North America (pay-api.amazon.com)' },
      { value: 'eu', label: 'Europe (pay-api.amazon.eu)' },
      { value: 'jp', label: 'Japan (pay-api.amazon.jp)' },
    ],
  },
];

const amazonCreateSchema = baseCreatePaymentSchema.extend({
  successUrl: z.string().url('Amazon Pay requires successUrl'),
});

export class AmazonPayGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Amazon Pay';
  readonly type = 'wallet' as const;
  readonly supportedCountries = ['*'] as const;
  readonly supportedCurrencies = ['*'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected createSchema() {
    return amazonCreateSchema;
  }

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const storeId = this.requiredConfig<string>('storeId');
    const env = this.testMode ? 'sandbox' : 'live';
    const pathCreate = `/${env}/v2/checkoutSessions`;

    const createBody = {
      webCheckoutDetails: {
        checkoutReviewReturnUrl: params.successUrl!,
      },
      storeId,
      chargePermissionType: 'OneTime',
      merchantMetadata: {
        merchantReferenceId: params.orderId.slice(0, 200),
        noteToBuyer: (params.description || '').slice(0, 500),
      },
    };

    const created = await this.signedRequest<{ checkoutSessionId: string }>(
      'POST',
      pathCreate,
      createBody,
      params.idempotencyKey || `amz-${params.orderId}`,
    );

    const sessionId = created.checkoutSessionId;
    if (!sessionId) {
      throw new GatewayApiError(KIND, 'Amazon Pay did not return checkoutSessionId', { cause: created });
    }

    const patchPath = `/${env}/v2/checkoutSessions/${encodeURIComponent(sessionId)}`;
    const patchBody: Record<string, unknown> = {
      webCheckoutDetails: {
        checkoutResultReturnUrl: params.successUrl!,
      },
      paymentDetails: {
        paymentIntent: 'AuthorizeWithCapture',
        canHandlePendingAuthorization: false,
        chargeAmount: {
          amount: this.formatMoney(params.amount, params.currency),
          currencyCode: params.currency.toUpperCase(),
        },
      },
    };
    if (params.failureUrl) {
      (patchBody.webCheckoutDetails as Record<string, string>).checkoutCancelUrl = params.failureUrl;
    }

    await this.signedRequest(
      'PATCH',
      patchPath,
      patchBody,
      `${params.idempotencyKey || params.orderId}-patch`,
    );

    const session = await this.signedRequest<AmazonCheckoutSession>(
      'GET',
      patchPath,
      undefined,
      `${params.idempotencyKey || params.orderId}-get`,
    );

    const redirect = session.webCheckoutDetails?.amazonPayRedirectUrl;

    return {
      gatewayId: sessionId,
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: redirect || undefined,
      rawResponse: session,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError(
      'Amazon Pay refunds require the Charge API and chargeId from post-capture webhooks.',
      { gateway: KIND },
    );
  }

  protected parseWebhookEventImpl(payload: unknown, _headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new InvalidWebhookError(KIND, 'payload is not an object');
    }
    const o = payload as Record<string, unknown>;
    const chargeId = String(o.chargeId || '');
    const orderRef = String(o.merchantReferenceId || '');
    const state = String((o.statusDetails as { state?: string } | undefined)?.state || o.state || '');
    const status = this.mapSessionState(state);
    const type: WebhookEventType =
      status === 'paid' ? 'payment.paid' : status === 'failed' ? 'payment.failed' : 'unknown';

    return {
      id: chargeId || `amz-${Date.now()}`,
      type,
      gateway: KIND,
      orderId: orderRef || undefined,
      gatewayPaymentId: chargeId || undefined,
      status,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  private formatMoney(amount: number, currency: string): string {
    const cur = currency.toUpperCase();
    const zero = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'VND', 'XAF', 'XOF', 'XPF'];
    if (zero.includes(cur)) return String(Math.round(amount));
    return amount.toFixed(2);
  }

  private mapSessionState(state: string): PaymentStatus {
    const s = state.toLowerCase();
    if (s === 'completed') return 'paid';
    if (s === 'open') return 'pending';
    if (s === 'canceled' || s === 'cancelled') return 'cancelled';
    if (s === 'declined' || s === 'failed') return 'failed';
    return 'pending';
  }

  private host(): string {
    const r = this.requiredConfig<string>('payRegion');
    if (r === 'eu') return 'pay-api.amazon.eu';
    if (r === 'jp') return 'pay-api.amazon.jp';
    return 'pay-api.amazon.com';
  }

  private amzTimestamp(d = new Date()): string {
    const iso = d.toISOString();
    const [date, time] = iso.split('T');
    const compactDate = date.replace(/-/g, '');
    const compactTime = time.replace(/:/g, '').replace(/\.\d{3}Z$/, 'Z');
    return `${compactDate}T${compactTime}`;
  }

  private async signedRequest<T>(
    method: 'GET' | 'POST' | 'PATCH',
    path: string,
    body: Record<string, unknown> | undefined,
    idempotencyKey: string,
  ): Promise<T> {
    const publicKeyId = this.requiredConfig<string>('publicKeyId');
    const privateKeyPem = this.requiredConfig<string>('privateKeyPem');
    const host = this.host();
    const region = this.requiredConfig<string>('payRegion');
    const payDate = this.amzTimestamp();

    const payload = body ? JSON.stringify(body) : '';
    const payloadHash =
      method === 'GET' ? EMPTY_PAYLOAD_SHA256 : createHash('sha256').update(payload, 'utf8').digest('hex');

    const headers: Record<string, string> = {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-amz-pay-date': payDate,
      'x-amz-pay-host': host,
      'x-amz-pay-region': region,
      'x-amz-pay-idempotency-key': idempotencyKey.slice(0, 128),
    };

    const canonicalHeaders =
      `accept:${headers.accept}\n` +
      `content-type:${headers['content-type']}\n` +
      `x-amz-pay-date:${headers['x-amz-pay-date']}\n` +
      `x-amz-pay-host:${headers['x-amz-pay-host']}\n` +
      `x-amz-pay-idempotency-key:${headers['x-amz-pay-idempotency-key']}\n` +
      `x-amz-pay-region:${headers['x-amz-pay-region']}\n`;

    const signedHeaders =
      'accept;content-type;x-amz-pay-date;x-amz-pay-host;x-amz-pay-idempotency-key;x-amz-pay-region';

    const canonicalRequest = [method, path, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');

    const canonicalRequestHash = createHash('sha256').update(canonicalRequest, 'utf8').digest('hex');
    const stringToSign = `AMZN-PAY-RSASSA-PSS-V2\n${canonicalRequestHash}`;

    const signature = cryptoSign(
      'sha256',
      Buffer.from(stringToSign, 'utf8'),
      {
        key: privateKeyPem,
        padding: constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32,
      },
    ).toString('base64');

    const authorization = `AMZN-PAY-RSASSA-PSS-V2 PublicKeyId=${publicKeyId}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const url = `https://${host}${path}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          ...headers,
          Authorization: authorization,
        },
        body: method === 'GET' ? undefined : payload,
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
      const err = parsed as { message?: string; reasonCode?: string };
      throw new GatewayApiError(KIND, err.message || `HTTP ${response.status}`, {
        httpStatus: response.status,
        providerCode: err.reasonCode,
        cause: parsed,
      });
    }
    return parsed as T;
  }
}

interface AmazonCheckoutSession {
  webCheckoutDetails?: {
    amazonPayRedirectUrl?: string;
  };
  statusDetails?: { state?: string };
}

registerMarketing(KIND, {
  brandLabel: 'Amazon Pay',
  description: 'Trusted Amazon wallet checkout for web — one-tap for millions of buyers.',
  logoPath: 'amazon-pay.svg',
  brandColor: '#FF9900',
  websiteUrl: 'https://pay.amazon.com',
  docsUrl: 'https://developer.amazon.com/docs/amazon-pay-api-v2/checkout-session.html',
  badges: ['popular'],
  platformBillingEligible: false,
});

GatewayRegistry.register((config, options) => new AmazonPayGateway(config, options));
