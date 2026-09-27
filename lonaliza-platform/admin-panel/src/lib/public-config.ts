export type DeploymentRole = "origin" | "client";

let googleAuthEnabled = false;
let deploymentRole: DeploymentRole = "origin";
let loaded = false;

export function setPublicGoogleAuthEnabled(enabled: boolean) {
  googleAuthEnabled = Boolean(enabled);
}

export function setPublicDeploymentRole(role: DeploymentRole) {
  deploymentRole = role === "client" ? "client" : "origin";
  loaded = true;
}

export function getPublicGoogleAuthEnabled(): boolean {
  return googleAuthEnabled;
}

export function getPublicDeploymentRole(): DeploymentRole {
  return deploymentRole;
}

export function isOriginClient(): boolean {
  return deploymentRole === "origin";
}

export function isPublicConfigLoaded(): boolean {
  return loaded;
}
