import { z } from 'zod';

/**
 * Shared Zod schemas used by `BaseGateway.executeWithValidation`.
 * Adapter-specific schemas should compose these (`baseCreatePaymentSchema.merge(...)`).
 *
 * NOTE: `subdomain` is required because adapters need it to build callback URLs.
 */

const ISO_4217 = /^[A-Z]{3}$/;

export const moneySchema = z.object({
  amount: z.number().positive('amount must be > 0').finite(),
  currency: z.string().regex(ISO_4217, 'currency must be ISO 4217 (3 uppercase letters)'),
});

export const customerSchema = z
  .object({
    email: z.string().email().optional(),
    name: z.string().min(1).max(200).optional(),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    phone: z.string().min(3).max(30).optional(),
    customerId: z.string().min(1).max(100).optional(),
  })
  .strict();

export const billingAddressSchema = z
  .object({
    line1: z.string().max(200).optional(),
    line2: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    country: z
      .string()
      .length(2, 'country must be ISO 3166-1 alpha-2')
      .toUpperCase()
      .optional(),
  })
  .strict();

export const baseCreatePaymentSchema = moneySchema.extend({
  orderId: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  customer: customerSchema.optional(),
  billingAddress: billingAddressSchema.optional(),
  successUrl: z.string().url().optional(),
  failureUrl: z.string().url().optional(),
  callbackUrl: z.string().url().optional(),
  idempotencyKey: z.string().min(1).max(120).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  subdomain: z.string().min(1).max(120),
  checkoutChannel: z.enum(['redirect', 'embedded']).optional(),
});

export const baseRefundSchema = z.object({
  gatewayId: z.string().min(1).max(200),
  amount: z.number().positive().optional(),
  currency: z.string().regex(ISO_4217).optional(),
  reason: z.string().max(500).optional(),
  idempotencyKey: z.string().min(1).max(120).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const baseCaptureSchema = z.object({
  gatewayId: z.string().min(1).max(200),
  amount: z.number().positive().optional(),
  currency: z.string().regex(ISO_4217).optional(),
  idempotencyKey: z.string().min(1).max(120).optional(),
});

export const baseVoidSchema = z.object({
  gatewayId: z.string().min(1).max(200),
  idempotencyKey: z.string().min(1).max(120).optional(),
});

export type BaseCreatePaymentInput = z.infer<typeof baseCreatePaymentSchema>;
export type BaseRefundInput = z.infer<typeof baseRefundSchema>;
export type BaseCaptureInput = z.infer<typeof baseCaptureSchema>;
export type BaseVoidInput = z.infer<typeof baseVoidSchema>;
