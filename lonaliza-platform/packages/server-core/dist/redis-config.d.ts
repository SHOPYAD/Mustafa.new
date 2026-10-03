export type RedisConnectionConfig = {
    host: string;
    port: number;
    password?: string;
    keyPrefix?: string;
};
export declare function redisConfigFromEnv(prefix?: string): RedisConnectionConfig;
