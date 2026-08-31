import { Module } from "@nestjs/common";
import { CatalogModule } from "../catalog/catalog.module";
import { CrawlModule } from "../crawl/crawl.module";
import { HotelsController } from "./hotels.controller";
import { HotelsService } from "./hotels.service";

@Module({
  imports: [CatalogModule, CrawlModule],
  controllers: [HotelsController],
  providers: [HotelsService],
  exports: [HotelsService],
})
export class HotelsModule {}
