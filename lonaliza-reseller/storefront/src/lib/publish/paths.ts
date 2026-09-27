import path from "path";

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

export function publishDataDir(): string {
  const override = (process.env.PUBLISH_STORE_DIR || "").trim();
  if (override) return override;
  if (isServerlessHosting()) return path.join("/tmp", "lonaliza-publish");
  return path.join(process.cwd(), ".data", "publish");
}

export function publishStoreFile(): string {
  return path.join(publishDataDir(), "store.json");
}

export function publishCronSecretFile(): string {
  return path.join(publishDataDir(), "cron-secret");
}
