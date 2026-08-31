import { Controller, Get, UseGuards } from "@nestjs/common";
import { EngineAuthGuard } from "../auth/engine-auth.guard";
import { CrawlService } from "../crawl/crawl.service";
import { RedisService } from "../redis/redis.service";
import { WireguardService } from "../wireguard/wireguard.service";
import { CatalogService } from "../catalog/catalog.service";

@Controller("v1")
@UseGuards(EngineAuthGuard)
export class HealthController {
  constructor(
    private readonly redis: RedisService,
    private readonly wg: WireguardService,
    private readonly crawl: CrawlService,
    private readonly catalog: CatalogService
  ) {}

  @Get("health")
  async health() {
    const redisUp = await this.redis.ping();
    const tunnel = await this.wg.health();
    return {
      ok: redisUp,
      service: "lonaliza-hotel-engine",
      redis: { up: redisUp, port: Number(process.env.REDIS_PORT || 6380) },
      tunnel,
      catalogCount: this.catalog.list().length,
      lastCrawl: this.crawl.lastStatus(),
    };
  }
}
