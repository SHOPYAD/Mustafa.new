let googleAuthEnabled = false;
let loaded = false;

export function setPublicGoogleAuthEnabled(enabled: boolean) {
  googleAuthEnabled = Boolean(enabled);
  loaded = true;
}

export function getPublicGoogleAuthEnabled(): boolean {
  return googleAuthEnabled;
}

export function isPublicConfigLoaded(): boolean {
  return loaded;
}
