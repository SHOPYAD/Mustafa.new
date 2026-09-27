/**
 * RapidAPI / iyzico must not go through a leftover local HTTP proxy
 * (previously 127.0.0.1:37367) — that surfaces as HTTP 0.
 */

const PROXY_ENV_KEYS = [
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "http_proxy",
  "https_proxy",
  "ALL_PROXY",
  "all_proxy",
  "SOCKS_PROXY",
  "SOCKS5_PROXY",
  "socks_proxy",
  "socks5_proxy",
] as const;

type ProxySnapshot = {
  values: Partial<Record<(typeof PROXY_ENV_KEYS)[number], string | undefined>>;
  noProxy?: string;
  noProxyLc?: string;
};

let depth = 0;
let saved: ProxySnapshot | null = null;

export function proxyEnvPresent(): boolean {
  return PROXY_ENV_KEYS.some((key) => Boolean(process.env[key]));
}

function clearProxyEnv() {
  const values: ProxySnapshot["values"] = {};
  for (const key of PROXY_ENV_KEYS) {
    values[key] = process.env[key];
    delete process.env[key];
  }
  saved = {
    values,
    noProxy: process.env.NO_PROXY,
    noProxyLc: process.env.no_proxy,
  };
  process.env.NO_PROXY = "*";
  process.env.no_proxy = "*";
}

function restoreProxyEnv() {
  if (!saved) return;
  for (const key of PROXY_ENV_KEYS) {
    if (saved.values[key] == null) delete process.env[key];
    else process.env[key] = saved.values[key];
  }
  if (saved.noProxy == null) delete process.env.NO_PROXY;
  else process.env.NO_PROXY = saved.noProxy;
  if (saved.noProxyLc == null) delete process.env.no_proxy;
  else process.env.no_proxy = saved.noProxyLc;
  saved = null;
}

export async function withDirectNetwork<T>(fn: () => Promise<T>): Promise<T> {
  if (depth === 0) clearProxyEnv();
  depth += 1;
  try {
    return await fn();
  } finally {
    depth -= 1;
    if (depth === 0) restoreProxyEnv();
  }
}

export function directFetch(
  input: string | URL,
  init?: RequestInit
): Promise<Response> {
  return withDirectNetwork(() => fetch(input, init));
}
