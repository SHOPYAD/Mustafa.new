import { createHash, createHmac } from 'crypto';

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { safeCompare } from '../core/crypto';
import { GatewayApiError, InvalidRequestError, InvalidWebhookError, WebhookVerificationFailedError } from '../core/errors';
import { GatewayRegistry } from '../core/GatewayRegistry';
import type { CreatePaymentParams, GatewayConfigField, GatewayPaymentResult, GatewayRefundResult, GatewayTestResult, GatewayType, RefundParams, WebhookEvent } from '../core/types';

const KIND = 'payu-latam';
const API_BASE = 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi';

function sign(raw: string, secret: string): string {
  return createHmac('sha256', secret).update(raw).digest('hex');
}

function md5(raw: string): string {
  return createHash('md5').update(raw).digest('hex');
}

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'apiKey', label: 'API Key', type: 'password', required: true, secret: true },
  { key: 'apiLogin', label: 'API Login', type: 'text', required: true },
  { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
  { key: 'accountId', label: 'Account ID', type: 'text', required: true },
  { key: 'webhookSecret', label: 'Webhook Secret (legacy fallback)', type: 'password', required: false, secret: true },
  { key: 'paymentCountry', label: 'Payment Country', type: 'text', required: false, default: 'CO' },
  { key: 'isProduction', label: 'Production Mode', type: 'boolean', required: false, default: false },
];

export class PayULatamGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'PayU Latam';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['CO', 'MX', 'PE', 'AR', 'CL', 'PA'] as const;
  readonly supportedCurrencies = ['COP', 'MXN', 'PEN', 'ARS', 'CLP', 'USD'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const apiKey = this.requiredConfig<string>('apiKey');
    const apiLogin = this.requiredConfig<string>('apiLogin');
    const merchantId = this.requiredConfig<string>('merchantId');
    const accountId = this.requiredConfig<string>('accountId');
    const isProduction = Boolean(this.optionalConfig<boolean>('isProduction'));
    const paymentCountry = (this.optionalConfig<string>('paymentCountry') || 'CO').toUpperCase();
    const apiBase = isProduction ? 'https://api.payulatam.com/payments-api/4.0/service.cgi' : API_BASE;

    const body = {
      language: 'en',
      command: 'SUBMIT_TRANSACTION',
      merchant: { apiKey, apiLogin },
      transaction: {
        order: {
          accountId,
          referenceCode: params.orderId,
          description: params.description || `Order ${params.orderId}`,
          language: 'en',
          additionalValues: {
            TX_VALUE: {
              value: Number(params.amount.toFixed(2)),
              currency: (params.currency || 'USD').toUpperCase(),
            },
          },
          buyer: { emailAddress: params.customer?.email || 'guest@example.com' },
        },
        payer: { fullName: params.customer?.name || 'Guest User', emailAddress: params.customer?.email || 'guest@example.com' },
        type: 'AUTHORIZATION_AND_CAPTURE',
        paymentMethod: 'VISA',
        paymentCountry,
        deviceSessionId: `sess-${params.orderId}`,
        ipAddress: '127.0.0.1',
        cookie: 'cookie',
        userAgent: 'liotrip/payment-api',
      },
      test: !isProduction,
    };

    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new GatewayApiError(KIND, `PayU Latam create failed: ${res.status}`);
    const data = (await res.json()) as any;
    const tx = data?.transactionResponse || {};

    return {
      gatewayId: String(tx.transactionId || params.orderId),
      orderId: params.orderId,
      status: String(tx.state || '').toUpperCase() === 'APPROVED' ? 'paid' : 'pending',
      redirectUrl: params.successUrl || params.callbackUrl || '',
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('PayU Latam refund endpoint is not implemented in this adapter', { gateway: KIND });
  }

  protected parseWebhookEventImpl(payload: unknown, headers?: Record<string, string>): WebhookEvent {
    if (!payload || typeof payload !== 'object') throw new InvalidWebhookError(KIND, 'payload is not object');

    const p = payload as any;
    const apiKey = this.requiredConfig<string>('apiKey');
    const merchantId = this.requiredConfig<string>('merchantId');
    const referenceCode = String(p.reference_sale || p.referenceCode || '');
    const amountNum = Number(p.value ?? p.amount ?? 0);
    const currency = String(p.currency || '').toUpperCase();
    const receivedSign = String(p.sign || p.signature || '').toLowerCase();

    const candidates = [
      md5(`${apiKey}~${merchantId}~${referenceCode}~${amountNum.toFixed(1)}~${currency}`).toLowerCase(),
      md5(`${apiKey}~${merchantId}~${referenceCode}~${amountNum.toFixed(2)}~${currency}`).toLowerCase(),
    ];

    const nativeOk = Boolean(receivedSign) && candidates.some((c) => safeCompare(receivedSign, c));

    // Legacy fallback for environments already using edge-generated HMAC header
    const fallbackSecret = this.optionalConfig<string>('webhookSecret');
    const fallbackSig = String(headers?.['x-payu-signature'] || '');
    const fallbackExpected = fallbackSecret
      ? sign(String(headers?.['x-raw-body'] || JSON.stringify(payload)), fallbackSecret)
      : '';
    const fallbackOk = Boolean(fallbackSecret && fallbackSig) && safeCompare(fallbackSig.toLowerCase(), fallbackExpected.toLowerCase());

    if (!nativeOk && !fallbackOk) {
      throw new WebhookVerificationFailedError(KIND);
    }

    const state = String(p.state_pol || p.state || '').toUpperCase();
    const mapped = ['4', 'APPROVED'].includes(state) ? 'paid' : ['5', '6', 'DECLINED', 'EXPIRED'].includes(state) ? 'failed' : 'pending';

    return {
      id: String(p.transaction_id || p.reference_sale || Date.now()),
      type: mapped === 'paid' ? 'payment.paid' : mapped === 'failed' ? 'payment.failed' : 'payment.created',
      gateway: KIND,
      orderId: String(p.reference_sale || p.referenceCode || ''),
      gatewayPaymentId: String(p.transaction_id || ''),
      status: mapped,
      amount: p.value !== undefined ? Number(p.value) : undefined,
      currency: String(p.currency || '').toUpperCase() || undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('apiKey');
    this.requiredConfig<string>('apiLogin');
    this.requiredConfig<string>('merchantId');
    this.requiredConfig<string>('accountId');
    return { success: true, message: 'Configuration accepted. Validate via sandbox transaction.', durationMs: 0 };
  }
}

GatewayRegistry.register((config, options) => new PayULatamGateway(config, options));
registerMarketing(KIND, { brandLabel: 'PayU Latam', description: 'Payments across Latin America.', logoPath: '/static/payment-gateways/payu-latam.png', brandColor: '#16a34a', websiteUrl: 'https://corporate.payu.com', badges: ['new'] });
