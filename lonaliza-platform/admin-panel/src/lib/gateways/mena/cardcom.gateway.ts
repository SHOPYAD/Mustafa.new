import { BaseGateway } from '../core/BaseGateway';
import { registerMarketing } from '../catalog';
import {
  GatewayApiError,
  InvalidRequestError,
  InvalidWebhookError,
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

const KIND = 'cardcom';
const API_BASE = 'https://secure.cardcom.solutions/api/v11';

const CONFIG_FIELDS: readonly GatewayConfigField[] = [
  { key: 'terminalNumber', label: 'Terminal Number', type: 'text', required: true },
  { key: 'userName', label: 'User Name', type: 'text', required: true },
  { key: 'language', label: 'Language', type: 'select', required: false, options: [{ value: 'he', label: 'Hebrew' }, { value: 'en', label: 'English' }], default: 'he' },
  { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
];

export class CardcomGateway extends BaseGateway {
  readonly kind = KIND;
  readonly displayName = 'Cardcom';
  readonly type: GatewayType = 'card';
  readonly supportedCountries = ['IL'] as const;
  readonly supportedCurrencies = ['ILS', 'USD', 'EUR'] as const;
  readonly configFields = CONFIG_FIELDS;

  protected async createPaymentImpl(params: CreatePaymentParams): Promise<GatewayPaymentResult> {
    const terminalNumber = this.requiredConfig<string>('terminalNumber');
    const userName = this.requiredConfig<string>('userName');

    const body = {
      TerminalNumber: terminalNumber,
      UserName: userName,
      APILevel: 10,
      Operation: {
        Type: 2,
        SumToBill: Number(params.amount.toFixed(2)),
        Currency: params.currency || 'ILS',
        Description: params.description || 'Payment',
        InvoiceHead: {
          CustName: params.customer?.name || 'Customer',
          SendByEmail: true,
          CustEmail: params.customer?.email || '',
          CustMobile: params.customer?.phone || '',
          ExtendedInvoiceType: 1,
          InvoiceType: 1,
          Language: this.optionalConfig<string>('language') || 'he',
        },
      },
      ReturnValue: params.successUrl || params.callbackUrl || '',
      IndicatorUrl: params.callbackUrl || '',
      InternalDealNumber: params.orderId,
    };

    const res = await fetch(`${API_BASE}/LowProfile/CreateInvoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new GatewayApiError(KIND, `Cardcom create failed: ${res.status}`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    if (Number(data.ResponseCode) !== 0) {
      throw new GatewayApiError(KIND, String(data.ResponseMessage || 'Cardcom create failed'), {
        cause: data,
      });
    }

    return {
      gatewayId: String(data.LowProfileId || params.orderId),
      orderId: params.orderId,
      status: 'pending',
      redirectUrl: String(data.Url || ''),
      rawResponse: data,
    };
  }

  protected async refundPaymentImpl(_params: RefundParams): Promise<GatewayRefundResult> {
    throw new InvalidRequestError('Cardcom refund endpoint is not implemented in this adapter', {
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
    const p = payload as Record<string, unknown>;
    const expectedSecret = this.requiredConfig<string>('webhookSecret');
    const gotSecret = String(
      headers?.['x-webhook-secret'] || headers?.['x-cardcom-signature'] || '',
    );
    if (!gotSecret || gotSecret !== expectedSecret) {
      throw new InvalidWebhookError(KIND, 'invalid webhook signature');
    }
    const success = String(p.OperationResponse || '') === '0';

    return {
      id: String(p.LowProfileId || Date.now()),
      type: success ? 'payment.paid' : 'payment.failed',
      gateway: KIND,
      orderId: String(p.InternalDealNumber || ''),
      gatewayPaymentId: String(p.LowProfileId || ''),
      status: success ? 'paid' : 'failed',
      amount: undefined,
      currency: undefined,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  protected async testConnectionImpl(): Promise<GatewayTestResult> {
    this.requiredConfig<string>('terminalNumber');
    this.requiredConfig<string>('userName');
    return {
      success: true,
      message: 'Configuration accepted. Validate via sandbox payment run.',
      durationMs: 0,
    };
  }
}

GatewayRegistry.register((config, options) => new CardcomGateway(config, options));

registerMarketing(KIND, {
  brandLabel: 'Cardcom',
  description: 'Israel card gateway for hosted low-profile invoices.',
  logoPath: '/static/payment-gateways/cardcom.png',
  brandColor: '#27406f',
  websiteUrl: 'https://secure.cardcom.solutions',
  badges: ['new'],
});
