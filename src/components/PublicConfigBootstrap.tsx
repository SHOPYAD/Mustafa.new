"use client";

import { useEffect } from "react";
import { setPublicDeploymentRole, setPublicGoogleAuthEnabled } from "@/lib/public-config";

/**
 * Hydrates public flags (Google login) from the server store.
 */
export default function PublicConfigBootstrap() {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/public-config", { cache: "no-store" });
        const data = (await res.json()) as {
          ok?: boolean;
          googleAuthEnabled?: boolean;
          deploymentRole?: "origin" | "client";
        };
        if (!cancelled && data?.ok) {
          setPublicGoogleAuthEnabled(Boolean(data.googleAuthEnabled));
          if (data.deploymentRole) {
            setPublicDeploymentRole(data.deploymentRole);
          }
        }
      } catch {
        /* keep default (disabled) */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
