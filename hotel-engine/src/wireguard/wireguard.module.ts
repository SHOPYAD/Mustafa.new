import { Global, Module } from "@nestjs/common";
import { WireguardService } from "./wireguard.service";

@Global()
@Module({
  providers: [WireguardService],
  exports: [WireguardService],
})
export class WireguardModule {}
