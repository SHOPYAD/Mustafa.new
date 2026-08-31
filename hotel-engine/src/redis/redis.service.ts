import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";

export const SEARCH_TTL_SEC = 9 * 60;
export const DETAIL_TTL_SEC = 10 * 60;
export const ROOMS_TTL_SEC = 15 * 60;
export const PREBOOK_TTL_SEC = 45;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private readonly prefix = process.env.REDIS_KEY_PREFIX || "lonaliza:hotels:";

  async onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT || 6380),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    });
    await this.client.ping();
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
  }

  key(parts: string[]): string {
    return `${this.prefix}${parts.join(":")}`;
  }

  async ping(): Promise<boolean> {
    if (!this.client) return false;
    try {
      return (await this.client.ping()) === "PONG";
    } catch {
      return false;
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSec: number): Promise<void> {
    if (!this.client) return;
    await this.client.set(key, JSON.stringify(value), "EX", Math.max(1, ttlSec));
  }
}
