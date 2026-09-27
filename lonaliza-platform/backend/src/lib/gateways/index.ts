/**
 * Public entry point for the unified payment gateway layer.
 *
 * Usage from elsewhere in the plugin:
 *   import { GatewayRegistry, getCatalog } from '~/gateways';
 *
 * Adding a new gateway:
 *   1. Implement an adapter under `gateways/{region}/<name>.gateway.ts` extending `BaseGateway`.
 *   2. Append a side-effect import below in the matching region block.
 *   3. Optionally register marketing metadata via `registerMarketing(...)` inside the adapter file.
 *
 * IMPORTANT: keep imports grouped by region and alphabetical within a region —
 * makes the dependency graph easy to audit.
 */

// Public API re-exports
export { GatewayRegistry } from './core/GatewayRegistry';
export type { GatewayMeta } from './core/GatewayRegistry';
export { BaseGateway } from './core/BaseGateway';
export type { PaymentGateway } from './core/PaymentGateway.interface';
export * from './core/types';
export * from './core/errors';
export * from './core/validation';
export * from './core/countries';
export {
  encrypt,
  decrypt,
  encryptSecrets,
  decryptSecrets,
  isEncrypted,
  redactSecrets,
  safeCompare,
} from './core/crypto';
export {
  getCatalog,
  getCatalogEntry,
  getPlatformBillingCatalog,
  registerMarketing,
} from './catalog';
export type { CatalogEntry, CatalogFilter, MarketingMeta } from './catalog';

// Adapter side-effect registrations
// Imports below run for their side-effects: each adapter file calls
// `GatewayRegistry.register(...)` and `registerMarketing(...)` at module load.
//
// Phase 1 — Turkey
import './turkey/iyzico.gateway';
import './turkey/paytr.gateway';
import './turkey/shopier.gateway';
import './turkey/paynkolay.gateway';
import './turkey/paywant.gateway';
import './turkey/paynettr.gateway';
//
// Phase 2 — MENA
import './mena/moyasar.gateway';
import './mena/paymob.gateway';
import './mena/paytabs.gateway';
import './mena/tabby.gateway';
import './mena/tamara.gateway';
import './mena/urway.gateway';
import './mena/noonpayments.gateway';
import './mena/yallapay.gateway';
import './mena/epoint.gateway';
import './mena/payriff.gateway';
import './mena/cardcom.gateway';
import './mena/youcanpay.gateway';
import './mena/konnect.gateway';
//
// Phase 3 — Global
import './global/amazonPay.gateway';
import './global/checkout.gateway';
import './global/stripe.gateway';
import './global/paypal.gateway';
import './global/payoneer.gateway';
import './global/paymentwall.gateway';
import './global/payssion.gateway';
import './global/twocheckout.gateway';

// Phase 4 — Asia
import './asia/midtrans.gateway';
import './asia/xendit.gateway';
import './asia/toyyibpay.gateway';
import './asia/tripay.gateway';
import './asia/doku.gateway';
import './asia/billplz.gateway';
import './asia/senangpay.gateway';
import './asia/paymaya.gateway';
import './asia/omise.gateway';
import './asia/payme-vn.gateway';
import './asia/zarinpal.gateway';
import './asia/paycom.gateway';

// Phase 5 — Crypto
import './crypto/cryptomus.gateway';
import './crypto/nowpayments.gateway';
import './crypto/coinpayments.gateway';
import './crypto/coingate.gateway';
import './crypto/bitpay.gateway';
import './crypto/coinbase-commerce.gateway';
import './crypto/plisio.gateway';
import './crypto/anypay.gateway';
import './crypto/perfectmoney.gateway';
import './crypto/volet.gateway';
import './cis/yookassa.gateway';
import './africa/fedapay.gateway';
import './latam/payu-latam.gateway';
import './cis/freekassa.gateway';
import './cis/unitpay.gateway';
import './cis/payeer.gateway';
import './africa/payspace.gateway';
import './africa/primepayments.gateway';
