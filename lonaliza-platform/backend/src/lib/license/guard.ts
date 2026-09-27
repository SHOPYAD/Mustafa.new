import { verifyLicense } from "./client";
import { isOrigin } from "@/lib/server/deployment-role";

/**
 * Fail-Closed Server Guard:
 * Throws or blocks requests if running on a client instance without a valid license.
 */
export async function assertLicenseValid(context = "booking service"): Promise<void> {
  if (isOrigin()) return; // Origin is always permitted

  const state = await verifyLicense();
  if (!state.valid) {
    throw new Error(
      `[403] ${context} blocked: License is invalid (${state.errorCode || "unauthorized"}). ${state.errorMessage || ""}`
    );
  }
}
