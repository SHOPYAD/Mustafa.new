import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CatalogModule } from "./catalog/catalog.module";
import { CrawlModule } from "./crawl/crawl.module";
import { HealthModule } from "./health/health.module";
import { HotelsModule } from "./hotels/hotels.module";
import { RedisModule } from "./redis/redis.module";
import { SnapshotsModule } from "./snapshots/snapshots.module";
import { WireguardModule } from "./wireguard/wireguard.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env"] }),
    RedisModule,
    CatalogModule,
    WireguardModule,
    SnapshotsModule,
    CrawlModule,
    HotelsModule,
    HealthModule,
  ],
})
export class AppModule {}
