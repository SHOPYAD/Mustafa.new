import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ["error", "warn", "log"] });
  const host = process.env.ENGINE_HOST || "127.0.0.1";
  const port = Number(process.env.ENGINE_PORT || 3051);
  await app.listen(port, host);
  // eslint-disable-next-line no-console
  console.log(`lonaliza-hotel-engine listening on ${host}:${port}`);
}

void bootstrap();
