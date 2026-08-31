import { Injectable } from "@nestjs/common";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export type TunnelHealth = {
  interfaceName: string;
  up: boolean;
  handshakeAgeSec: number | null;
  peerIp: string;
  proxyConfigured: boolean;
  egressIp: string | null;
  detail: string;
};

@Injectable()
export class WireguardService {
  private readonly iface = process.env.WG_INTERFACE || "wg-lonaliza";
  private readonly peerIp = process.env.WG_PEER_IP || "10.88.0.2";

  async health(): Promise<TunnelHealth> {
    const proxyConfigured = Boolean((process.env.HOTEL_PROXY_URL || "").trim());
    try {
      const { stdout } = await execFileAsync("wg", ["show", this.iface, "latest-handshakes"], {
        timeout: 2500,
      });
      const parts = stdout.trim().split(/\s+/);
      const ts = Number(parts[1] || 0);
      const handshakeAgeSec = ts > 0 ? Math.max(0, Math.floor(Date.now() / 1000 - ts)) : null;
      const up = handshakeAgeSec != null && handshakeAgeSec < 180;
      let egressIp: string | null = null;
      if (proxyConfigured) {
        egressIp = await this.probeEgress();
      }
      return {
        interfaceName: this.iface,
        up,
        handshakeAgeSec,
        peerIp: this.peerIp,
        proxyConfigured,
        egressIp,
        detail: up ? "handshake recent" : "no recent handshake — phone offline or not configured",
      };
    } catch (e) {
      return {
        interfaceName: this.iface,
        up: false,
        handshakeAgeSec: null,
        peerIp: this.peerIp,
        proxyConfigured,
        egressIp: null,
        detail: e instanceof Error ? e.message : "wg interface missing",
      };
    }
  }

  proxyUrl(): string {
    return (process.env.HOTEL_PROXY_URL || "").trim();
  }

  private async probeEgress(): Promise<string | null> {
    const proxy = this.proxyUrl();
    if (!proxy) return null;
    try {
      const { stdout } = await execFileAsync(
        "curl",
        ["-sS", "--max-time", "8", "-x", proxy, "https://api.ipify.org"],
        { timeout: 10000 }
      );
      const ip = stdout.trim();
      return /^\d{1,3}(\.\d{1,3}){3}$/.test(ip) ? ip : ip || null;
    } catch {
      return null;
    }
  }
}
