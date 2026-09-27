/**
 * Deployment-role helpers.
 *
 * `DEPLOYMENT_ROLE=origin` → this is the master platform (lonaliza.com).
 * `DEPLOYMENT_ROLE=client` → this is a licensed client copy.
 *
 * Defaults to "origin" when unset so the current live site works unchanged.
 */

export type DeploymentRole = "origin" | "client";

/**
 * Resolve the current deployment role.
 * Server-only — reads from process.env.
 */
export function getDeploymentRole(): DeploymentRole {
  const raw = (process.env.DEPLOYMENT_ROLE || "").trim().toLowerCase();
  if (raw === "client") return "client";
  return "origin";
}

/** True when running on the master platform (lonaliza.com). */
export function isOrigin(): boolean {
  return getDeploymentRole() === "origin";
}

/** True when running as a licensed client copy. */
export function isClient(): boolean {
  return getDeploymentRole() === "client";
}

/**
 * Guard: throws 403 if the current instance is not the origin.
 * Use in API routes and server actions that must only run on the master.
 */
export function assertOriginOnly(context = "this endpoint"): void {
  if (!isOrigin()) {
    throw new Error(`[403] ${context} is available on the origin platform only`);
  }
}

/**
 * Guard: throws 403 if the current instance is not a client.
 * Use in API routes that only make sense on client copies (e.g. license activate).
 */
export function assertClientOnly(context = "this endpoint"): void {
  if (!isClient()) {
    throw new Error(`[403] ${context} is available on client copies only`);
  }
}
