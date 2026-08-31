import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class EngineAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = (process.env.ENGINE_TOKEN || "").trim();
    if (!expected) {
      throw new UnauthorizedException("ENGINE_TOKEN is not configured");
    }
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
    const header = String(req.headers.authorization || "");
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (token !== expected) {
      throw new UnauthorizedException("Invalid engine token");
    }
    return true;
  }
}
