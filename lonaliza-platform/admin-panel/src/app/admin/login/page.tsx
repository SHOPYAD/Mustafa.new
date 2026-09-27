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
    await new Promise((r) => setTimeout(r, 400));
    const ok = await login(username, password);
    if (ok) {
      router.push("/admin");
    } else {
      setError("Invalid username or password.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-secondary/8 rounded-full blur-[120px]' />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-600/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-blue-600/5 rounded-full blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative w-full max-w-[420px]">
        <div className="text-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg?v=5"
            alt="Lonaliza"
            className="mx-auto h-16 w-auto object-contain mb-5"
          />
          <h1 className='text-3xl font-bold text-foreground tracking-tight'>
            Lonaliza
          </h1>
          <p className='text-muted-foreground text-sm mt-1.5 font-medium'>
            Admin Control Panel
          </p>
        </div>

        <div className='bg-card/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl'>
          <h2 className='text-lg font-semibold text-foreground mb-6'>
            Welcome back 👋
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className='block text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2'>
                Username
              </label>
              <div className="relative">
                <User
                  size={16}
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                  className='w-full pl-11 pr-4 py-4 bg-card/5 border border-border rounded-2xl text-foreground placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-border/40 focus:border-border/40 transition-all text-sm'
                />
              </div>
            </div>

            <div>
              <label className='block text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2'>
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                  className='w-full pl-11 pr-12 py-4 bg-card/5 border border-border rounded-2xl text-foreground placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-border/40 focus:border-border/40 transition-all text-sm'
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors'
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className='w-full py-4 mt-2 bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-black rounded-2xl shadow-lg shadow-purple-950/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer'
            >
              {isLoading ? (
                <>
                  <div className='w-4 h-4 border-2 border-border border-t-white rounded-full animate-spin' />
                  Signing in...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>
        </div>

        <p className='text-center text-muted-foreground text-xs mt-6'>
          Lonaliza · Admin Portal
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className='w-8 h-8 border-2 border-border/20 border-t-amber-500 rounded-full animate-spin' />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
