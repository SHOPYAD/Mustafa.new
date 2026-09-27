import { GatewayNotRegisteredError } from './errors';
import type { PaymentGateway } from './PaymentGateway.interface';

/**
 * Registry of all known payment gateway adapters.
 *
 * Adapters register themselves once at module load via `gateways/index.ts`
 * (which import-side-effects every adapter file). The registry stores factory
 * functions, not instances — instances are constructed per-request with the
 * tenant's decrypted config.
 */

export type GatewayFactory = (
  config: Record<string, unknown>,
  options?: { testMode?: boolean },
) => PaymentGateway;

interface RegistryEntry {
  factory: GatewayFactory;
  /** Static metadata read from a single instance built with `{}` config. */
  meta: {
    kind: string;
    displayName: string;
    type: PaymentGateway['type'];
    supportedCountries: readonly string[];
    supportedCurrencies: readonly string[];
    configFields: PaymentGateway['configFields'];
  };
}

const registry = new Map<string, RegistryEntry>();

export const GatewayRegistry = {
  /**
   * Register a gateway factory.
   *
   * The factory is called once with `{}` to read static metadata. Adapters MUST
   * construct cleanly with empty config — `assertConfigured` may throw later, but
   * the constructor itself must not.
   */
  register(factory: GatewayFactory): void {
    const probe = factory({}, { testMode: true });
    if (registry.has(probe.kind)) {
      // eslint-disable-next-line no-console
      console.warn(`[GatewayRegistry] Overwriting existing registration for "${probe.kind}"`);
    }
    registry.set(probe.kind, {
      factory,
      meta: {
        kind: probe.kind,
        displayName: probe.displayName,
        type: probe.type,
        supportedCountries: probe.supportedCountries,
        supportedCurrencies: probe.supportedCurrencies,
        configFields: probe.configFields,
      },
    });
  },

  /** Build a gateway instance for the given kind using tenant-supplied config. */
  resolve(
    kind: string,
    config: Record<string, unknown>,
    options?: { testMode?: boolean },
  ): PaymentGateway {
    const entry = registry.get(kind);
    if (!entry) throw new GatewayNotRegisteredError(kind);
    return entry.factory(config, options);
  },

  has(kind: string): boolean {
    return registry.has(kind);
  },

  /** Static metadata of all registered gateways. Used to build the public catalog. */
  list(): RegistryEntry['meta'][] {
    return Array.from(registry.values()).map((e) => e.meta);
  },

  /** Filter registered gateways by country / type. Used by tenant UI catalog. */
  filter(opts: { country?: string; type?: PaymentGateway['type'] }): RegistryEntry['meta'][] {
    const country = opts.country?.toUpperCase();
    return this.list().filter((m) => {
      if (opts.type && m.type !== opts.type) return false;
      if (
        country &&
        !m.supportedCountries.includes('*') &&
        !m.supportedCountries.includes(country)
      ) {
        return false;
      }
      return true;
    });
  },

  /** Test helper. Do NOT call from production code. */
  _resetForTests(): void {
    registry.clear();
  },
};

export type GatewayMeta = RegistryEntry['meta'];
