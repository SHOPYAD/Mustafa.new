/**
 * Stripe — PaymentIntents + client-side confirmation (Elements / Payment Element).
 *
 * Tenant config holds the platform or Connect secret key used to create intents.
 * Refunds use the PaymentIntent id (`pi_…`) as `gatewayId`.
 *
 * Implemented using native HTTPS fetch to Stripe REST API v1 (zero external runtime dependencies).
 * Docs: https://stripe.com/docs/api/payment_intents
 */

import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import { GatewayRegistry } from '../core/GatewayRegistry';
import { InvalidWebhookError, GatewayApiError } from '../core/errors';
import type {
  CreatePaymentParams,
  GatewayConfigField,
  GatewayPaymentResult,
  GatewayRefundResult,
  GatewayTestResult,
  GatewayType,
  PaymentStatus,
  RefundParams,
  WebhookEvent,
  WebhookEventType,
} from '../core/types';
import { baseCreatePaymentSchema } from '../core/validation';

const KIND = 'stripe';
const STRIPE_API_BASE = 'https://api.stripe.com/v1';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'secretKey',
    label: 'Secret key',
    type: 'password',
    required: true,
    secret: true,
    placeholder: 'sk_live_… / sk_test_…',
    helpText: 'Stripe Dashboard → Developers → API keys → Secret key.',
  },
  {
    key: 'publishableKey',
    label: 'Publishable key',
    type: 'text',
    required: false,
    placeholder: 'pk_live_…',
    helpText: 'Used by storefront Payment Element; optional for server-only flows.',
  },
];

export class StripeGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Stripe';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['*'] as const;
  readonly supportedCurrencies = ['*'] as const;
  readonly configFields = CONFIG_FIELDS;

  private async stripeRequest<T = any>(
    endpoint: string,
    method: 'GET' | 'POST',
    bodyParams?: Record<string, string | number | boolean | undefined>,
    idempotencyKey?: string,
  ): Promise<T> {
    const secretKey = this.requiredConfig<string>('secretKey');
    const headers: Record<string, string> = {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    let body: string | undefined;
    if (bodyParams && method === 'POST') {
      const searchParams = new URLSearchParams();
      for (const [k, v] of Object.entries(bodyParams)) {
        if (v !== undefined && v !== null) {
          searchParams.append(k, String(v));
        }
      }
      body = searchParams.toString();
    }

    const res = await fetch(`${STRIPE_API_BASE}${endpoint}`, {
      method,
      headers,
      body,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error?.message || `Stripe API error: ${res.status}`;
      throw new GatewayApiError(KIND, msg, res.status, data);
    }
    return data as T;
  }

  protected createSchema() {
    return baseCreatePaymentSchema;
  }

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const postBody: Record<string, string | number | boolean | undefined> = {
      amount: Math.round(params.amount * 100),
      currency: params.currency.toLowerCase(),
      description: params.description,
      'automatic_payment_methods[enabled]': true,
      'metadata[orderId]': params.orderId,
      'metadata[subdomain]': params.subdomain,
    };

    if (params.customer?.email) {
      postBody.receipt_email = params.customer.email;
    }

    if (params.metadata) {
      for (const [mk, mv] of Object.entries(params.metadata)) {
        postBody[`metadata[${mk}]`] = String(mv);
      }
    }

    const intent = await this.stripeRequest<{
      id: string;
      status: string;
      client_secret: string;
    }>('/payment_intents', 'POST', postBody, params.idempotencyKey);

    if (!intent.client_secret) {
      throw new Error('Stripe PaymentIntent returned without client_secret');
    }

    return {
      gatewayId: intent.id,
      orderId: params.orderId,
      status: this.mapIntentStatus(intent.status),
      clientSecret: intent.client_secret,
      rawResponse: intent,
    };
  }

  protected async refundPaymentImpl(params: RefundParams): Promise<GatewayRefundResult> {
    const postBody: Record<string, string | number | boolean | undefined> = {
      payment_intent: params.gatewayId,
    };

    if (params.amount != null && params.amount > 0) {
      postBody.amount = Math.round(params.amount * 100);
    }
    if (params.reason) {
      postBody.reason = params.reason;
    }
    if (params.metadata) {
      for (const [mk, mv] of Object.entries(params.metadata)) {
        postBody[`metadata[${mk}]`] = String(mv);
      }
    }

    const refund = await this.stripeRequest<{
      id: string;
      status: string;
      amount?: number;
      created?: number;
    }>('/refunds', 'POST', postBody, params.idempotencyKey);

    return {
      success: refund.status === 'succeeded' || refund.status === 'pending',
      gatewayRefundId: refund.id,
      status: refund.status === 'failed' ? 'failed' : 'succeeded',
      totalRefunded: (refund.amount ?? 0) / 100,
      refundedAt: new Date((refund.created ?? 0) * 1000),
      rawResponse: refund,
    };
  }

  protected parseWebhookEventImpl(payload: unknown): WebhookEvent {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidWebhookError(KIND, 'payload is not an object');
    }
    const env = payload as {
      id?: string;
      type?: string;
      created?: number;
      data?: { object?: Record<string, unknown> };
    };
    const obj = env.data?.object;
    if (!obj || typeof obj !== 'object') {
      throw new InvalidWebhookError(KIND, 'event.data.object missing');
    }
    const pi = obj as {
      id?: string;
      status?: string;
      metadata?: Record<string, string>;
      amount?: number;
      currency?: string;
    };
    const type = String(env.type || '');
    return {
      id: String(env.id || 'unknown'),
      type: this.mapStripeWebhookType(type),
      gateway: KIND,
      orderId: pi.metadata?.orderId,
      gatewayPaymentId: pi.id,
      status: this.mapIntentStatus(pi.status || ''),
      amount: typeof pi.amount === 'number' ? pi.amount / 100 : undefined,
      currency: pi.currency?.toUpperCase(),
      timestamp: new Date(
        typeof env.created === 'number' ? env.created * 1000 : Date.now(),
      ),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    const bal = await this.stripeRequest<{
      available?: Array<{ currency: string }>;
    }>('/balance', 'GET');

    return {
      success: true,
      message: 'Stripe secret key accepted',
      durationMs: 0,
      details: {
        availableCurrencies: bal.available?.map((b) => b.currency) ?? [],
      },
    };
  }

  private mapIntentStatus(status: string): PaymentStatus {
    switch (status) {
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'processing':
        return 'pending';
      case 'requires_action':
      case 'requires_capture':
        return 'requires_action';
      case 'succeeded':
        return 'paid';
      case 'canceled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  private mapStripeWebhookType(eventType: string): WebhookEventType {
    const t = eventType.toLowerCase();
    if (t.includes('payment_intent.succeeded')) return 'payment.paid';
    if (t.includes('payment_intent.payment_failed')) return 'payment.failed';
    if (t.includes('charge.refunded')) return 'payment.refunded';
    if (t.includes('refund')) return 'payment.refunded';
    if (t.includes('canceled')) return 'payment.cancelled';
    return 'unknown';
  }
}

registerMarketing(KIND, {
  brandLabel: 'Stripe',
  description: 'Cards, wallets, and local methods via PaymentIntents + Elements.',
  logoPath: 'stripe.svg',
  brandColor: '#635BFF',
  websiteUrl: 'https://stripe.com',
  docsUrl: 'https://stripe.com/docs/api',
  badges: ['recommended', 'popular'],
  platformBillingEligible: true,
});

GatewayRegistry.register((config, options) => new StripeGateway(config, options));
