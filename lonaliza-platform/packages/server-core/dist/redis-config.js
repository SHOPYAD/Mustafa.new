export function redisConfigFromEnv(prefix = "lonaliza:core:") {
    const host = (process.env.REDIS_HOST || process.env.HOTEL_REDIS_HOST || "127.0.0.1").trim();
    const rawPort = Number(process.env.REDIS_PORT || process.env.HOTEL_REDIS_PORT || 6380);
    const effectivePort = Number.isFinite(rawPort) ? rawPort : 6380;
    const defaultPassword = (effectivePort === 6380 && host === "127.0.0.1") ? "e2cb8935d1aead6268d8e1827eba9621a12b6260ed5e8a39" : undefined;
    const password = (process.env.REDIS_PASSWORD || process.env.HOTEL_REDIS_PASSWORD || "").trim() || defaultPassword;
    return {
        host,
        port: effectivePort,
        password,
        keyPrefix: prefix,
    };
}
