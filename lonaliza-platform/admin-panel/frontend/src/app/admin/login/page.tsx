"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";
import { login, checkAuthenticated } from "@/data/auth";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      setError(decodeURIComponent(err));
    }
    void checkAuthenticated().then((ok) => {
      if (ok) router.replace("/admin");
    });
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const result = await login(username, password);
    if (result.ok) {
      router.push("/admin");
    } else {
      setError(result.error || "اسم المستخدم أو كلمة المرور غير صحيحة");
      setIsLoading(false);
    }
  };

  const fieldClass =
    "w-full min-h-11 ps-11 pe-4 py-3 rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-input-bg)] text-[color:var(--admin-text-primary)] placeholder:text-[color:var(--admin-text-faint)] text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--admin-gold)]/40 focus-visible:border-[color:var(--admin-gold)]";

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-4 bg-[color:var(--admin-bg-canvas)] text-[color:var(--admin-text-primary)]"
      dir="ltr"
    >
      <div className="relative w-full max-w-[440px]">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg?v=5"
            alt="Lonaliza"
            className="mx-auto h-14 w-auto object-contain mb-5"
          />
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[color:var(--admin-gold)]">
            Royal Command Center
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[color:var(--admin-text-primary)]">
            Lonaliza
          </h1>
          <p className="mt-1 text-sm text-[color:var(--admin-text-muted)]">
            تسجيل الدخول إلى لوحة الإدارة
          </p>
        </div>

        <div className="rounded-2xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] p-7">
          <h2 className="text-base font-semibold text-[color:var(--admin-text-primary)] mb-5">
            Welcome back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-950/50 border border-red-500/40">
                <AlertCircle size={16} className="text-red-300 flex-shrink-0" />
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-[color:var(--admin-text-muted)] text-xs font-bold uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute start-4 top-1/2 -translate-y-1/2 text-[color:var(--admin-gold)]"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-[color:var(--admin-text-muted)] text-xs font-bold uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute start-4 top-1/2 -translate-y-1/2 text-[color:var(--admin-gold)]"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                  className={`${fieldClass} pe-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 size-11 inline-flex items-center justify-center text-[color:var(--admin-text-muted)] hover:text-[color:var(--admin-gold)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-11 py-3 mt-1 rounded-xl bg-[color:var(--admin-gold)] hover:brightness-110 text-[color:var(--admin-gold-foreground)] font-extrabold text-sm tracking-wide transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="size-4 border-2 border-[#1a0b05]/30 border-t-[#1a0b05] rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Enter the command center"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[color:var(--admin-text-faint)] text-xs mt-6">
          Lonaliza · Royal Admin
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-[color:var(--admin-bg-canvas)] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[color:var(--admin-gold)]/20 border-t-[color:var(--admin-gold)] rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
