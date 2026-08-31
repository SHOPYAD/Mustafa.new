import { Module } from "@nestjs/common";
import { CatalogModule } from "../catalog/catalog.module";
import { CrawlModule } from "../crawl/crawl.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [CatalogModule, CrawlModule],
  controllers: [HealthController],
})
export class HealthModule {}
