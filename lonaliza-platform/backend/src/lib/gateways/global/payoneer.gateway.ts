/**
 * Payoneer Checkout — bridge adapter.
 *
 * The Web SDK expects a `longId` from a merchant server. Public session URLs are not static;
 * this adapter POSTs order context to **your** `createSessionUrl`, which must return JSON with
 * `redirectUrl` and/or `longId` after calling Payoneer’s session API.
 */

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

const KIND = 'payoneer';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  {
    key: 'createSessionUrl',
    label: 'Create-session endpoint (HTTPS)',
    type: 'url',
    required: true,
    helpText:
      'Your service returns JSON: { "redirectUrl"?: string, "longId"?: string, "gatewayId"?: string }.',
  },
  {
    key: 'createSessionAuthHeader',
    label: 'Authorization header (optional)',
    type: 'password',
    required: false,
    secret: true,
    helpText: 'e.g. Bearer token for your bridge endpoint.',
  },
];

export class PayoneerGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Payoneer Checkout';
  readonly type = 'card' as const;
  readonly supportedCountries = ['*'] as const;
  readonly supportedCurrencies = ['*'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(
    params: CreatePaymentParams,
  ): Promise<GatewayPaymentResult> {
    const url = this.requiredConfig<string>('createSessionUrl');
    const auth = this.optionalConfig<string>('createSessionAuthHeader');

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (auth) headers.Authorization = auth;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderId: params.orderId,
          amount: params.amount,
          currency: params.currency.toUpperCase(),
          description: params.description,
          successUrl: params.successUrl,
          failureUrl: params.failureUrl,
          callbackUrl: params.callbackUrl,
          subdomain: params.subdomain,
          metadata: params.metadata,
        }),
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
      throw new GatewayApiError(KIND, `Payoneer bridge HTTP ${response.status}`, {
        httpStatus: response.status,
        cause: parsed,
      });
    }

    const obj = parsed as {
      redirectUrl?: string;
      longId?: string;
      gatewayId?: string;
    };

    const gatewayId = obj.gatewayId || obj.longId || params.orderId;
    const redirectUrl = obj.redirectUrl;

    if (!redirectUrl && !obj.longId) {
      throw new GatewayApiError(KIND, 'Payoneer bridge must return redirectUrl and/or longId', {
        cause: parsed,
      });
    }

    return {
      gatewayId,
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: redirectUrl || undefined,
      clientSecret: obj.longId,
      rawResponse: parsed,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError(
      'Process Payoneer refunds in the Payoneer merchant environment or extend your bridge.',
      { gateway: KIND },
    );
  }

  protected parseWebhookEventImpl(payload: unknown, _headers?: Record<string, string>): WebhookEvent {
    const o =
      payload && typeof payload === 'object' && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : null;
    if (!o) {
      throw new InvalidWebhookError(KIND, 'payload is not an object');
    }
    const statusRaw = String(o.status || o.state || '');
    const st = statusRaw.toLowerCase();
    const status: PaymentStatus =
      st === 'completed' || st === 'paid' || st === 'success' ? 'paid' : 'pending';
    const type: WebhookEventType = status === 'paid' ? 'payment.paid' : 'unknown';

    return {
      id: String(o.id || o.paymentId || `payoneer-${Date.now()}`),
      type,
      gateway: KIND,
      orderId: String(o.orderId || o.merchantReferenceId || ''),
      gatewayPaymentId: String(o.transactionId || o.paymentId || ''),
      status,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }
}

registerMarketing(KIND, {
  brandLabel: 'Payoneer',
  description: 'Global payments — point createSessionUrl at your Payoneer session bridge.',
  logoPath: 'payoneer.svg',
  brandColor: '#FF6600',
  websiteUrl: 'https://www.payoneer.com',
  docsUrl: 'https://checkoutdocs.payoneer.com/docs/getting-started-checkout-web-sdk',
  badges: ['beta'],
  platformBillingEligible: false,
});

GatewayRegistry.register((config, options) => new PayoneerGateway(config, options));
