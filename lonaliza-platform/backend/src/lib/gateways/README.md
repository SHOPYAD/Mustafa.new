# Unified Payment Gateways (`gateways/`)

This module is the single source of truth for every payment gateway integration shipped with Liotrip. It replaces the legacy per-folder adapters under `apis/{qpay,monpay,...}` with a uniform contract, type-safe configs, automatic encryption of secrets, and a public catalog the UI can render directly.

## High-level layout

```
gateways/
├── core/
│   ├── types.ts                  Shared payment-result, status, and webhook types
│   ├── errors.ts                 Typed PaymentError hierarchy + classifyHttpError helper
│   ├── validation.ts             Zod base schemas (createPayment / refund / capture / void)
│   ├── PaymentGateway.interface  Public contract every adapter implements
│   ├── BaseGateway.ts            Abstract template-method base class
│   ├── GatewayRegistry.ts        In-memory registry of factory functions
│   ├── crypto.ts                 AES-256-GCM authenticated encryption for tenant secrets
│   └── countries.ts              ISO 3166-1 country reference table
│
├── catalog.ts                    Marketing metadata + getCatalog() filters
├── index.ts                      Public re-exports + side-effect adapter registrations
├── README.md                     ← you are here
│
├── turkey/                       Phase 1 adapters (iyzico, paytr, shopier, …)
├── mena/                         Phase 2 adapters (moyasar, paymob, tabby, tamara, …)
├── global/                       Phase 3 adapters (stripe, paypal, paytabs, checkout.com, …)
├── asia/                         Phase 4 (Indonesia, Malaysia, Philippines, …)
├── crypto/                       Phase 5 (cryptomus, nowpayments, coingate, …)
└── cis/, africa/, latam/         Phase 6
```

## Adding a new gateway — step-by-step

1. **Create the file** `gateways/<region>/<provider>.gateway.ts`:

   ```ts
   import { BaseGateway, registerMarketing, GatewayRegistry } from '~/gateways';

   class FooPayGateway extends BaseGateway {
     readonly kind = 'foopay';
     readonly displayName = 'FooPay';
     readonly type = 'card' as const;
     readonly supportedCountries = ['TR'] as const;
     readonly supportedCurrencies = ['TRY', 'USD'] as const;
     readonly configFields = [
       { key: 'apiKey', label: 'API Key', type: 'password', required: true, secret: true },
       { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
       { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, secret: true },
     ] as const;

     protected async createPaymentImpl(params) { /* call FooPay API */ }
     protected async refundPaymentImpl(params) { /* … */ }
     protected parseWebhookEventImpl(payload) { /* normalise */ }
     verifyWebhook(rawBody, signature) { /* HMAC-SHA256 compare */ }
   }

   GatewayRegistry.register((config, opts) => new FooPayGateway(config, opts));

   registerMarketing('foopay', {
     description: 'Turkish acquirer with installment support',
     logoPath: 'foopay.svg',
     brandColor: '#0040ff',
     websiteUrl: 'https://foopay.com',
     docsUrl: 'https://docs.foopay.com',
   });
   ```

2. **Side-effect import** the file in `gateways/index.ts` under the appropriate region block. This is what triggers `GatewayRegistry.register(...)` at module load time.

3. **Drop the logo** at `payment_api/src/public/payment-gateways/<logoPath>`.

4. **Write tests** under `__tests__/gateways/<region>/<provider>.test.ts`:
   - createPayment happy path (mocked HTTP)
   - refundPayment
   - webhook signature verification (positive + tampered)
   - parseWebhookEvent against a fixture payload

5. **No manual changes required** to controllers, GraphQL, or models — the registry/catalog handle discovery automatically.

## Lifecycle (createPayment)

```
caller (resolver / booking-frontend)
  └── gateway.createPayment(params)
        ├── assertConfigured()                    BaseGateway
        ├── assertCurrency(params.currency)       BaseGateway
        ├── assertCountry(params.billingAddress)  BaseGateway
        ├── parseInput(createSchema(), params)    Zod, BaseGateway
        ├── createPaymentImpl(params)             ← adapter code
        └── wrapErrors → PaymentError             BaseGateway
```

## Webhook flow (Phase 1.5+)

```
HTTP POST /callback/<kind>
  └── controller resolves gateway via GatewayRegistry
        ├── verifyWebhook(rawBody, signature) — must be true
        ├── parseWebhookEvent(payload)        — normalises to WebhookEvent
        └── dispatcher.handle(WebhookEvent)   — updates Payment / Booking
```

## Security guarantees

- **All secret config fields** (those with `secret: true` in `configFields`) are encrypted on save with AES-256-GCM (`core/crypto.ts`) and only decrypted in-memory when constructing a gateway instance.
- **GraphQL responses** redact secret fields to `••••` via `redactSecrets` — UI never sees the real key after first save.
- **Webhook signatures** must be verified with `safeCompare` (constant-time) inside `verifyWebhook`.
- **Idempotency keys** must be forwarded to providers that support them.

## Required environment variable

```
PAYMENT_CONFIG_ENCRYPTION_KEY=<32 random bytes, hex or base64>
# generate with:  openssl rand -base64 32
```

In dev, an insecure deterministic fallback is used and logged. In production, missing key throws on first encryption attempt.

## Migration plan vs the legacy `apis/` folder

The legacy `apis/{qpay,monpay,socialpay,storepay,pocket,minupay,golomt,wechatpay,khanbank,qpayQuickqr}` adapters are **planned for removal in Phase 0.5** (Mongolian gateways, per user direction). Stripe / PayPal / PayTabs will be re-implemented inside `gateways/global/` while keeping the existing model + GraphQL shape compatible until Phase 7.

Until Phase 1 lands its first adapter, this module is purely a foundation — `gateways/index.ts` is not yet imported by `main.ts` and the runtime is unchanged.
