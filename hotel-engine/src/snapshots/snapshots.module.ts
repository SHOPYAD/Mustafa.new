import { Global, Module } from "@nestjs/common";
import { SnapshotsService } from "./snapshots.service";

@Global()
@Module({
  providers: [SnapshotsService],
  exports: [SnapshotsService],
})
export class SnapshotsModule {}
