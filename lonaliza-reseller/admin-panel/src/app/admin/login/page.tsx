"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, User, AlertCircle, ShieldCheck } from "lucide-react";
import { login, checkAuthenticated } from "@/data/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <div
      className="min-h-dvh w-full flex items-center justify-center p-4 sm:p-6 bg-background text-foreground transition-colors"
      dir="rtl"
    >
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-card border border-border shadow-xs p-2 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg?v=5"
              alt="Lonaliza"
              className="size-10 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Lonaliza Studio
          </h1>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="size-3.5 text-amber-500" />
            بوابة الإدارة المركزية والعمليات
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/80 shadow-md backdrop-blur-xs bg-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold">تسجيل الدخول</CardTitle>
            <CardDescription className="text-xs">
              أدخل بيانات حسابك للمتابعة إلى لوحة التحكم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground/80">
                  اسم المستخدم أو البريد الإلكتروني
                </label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    required
                    autoComplete="username"
                    className="ps-9 h-10 text-sm border-border bg-background/50 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground/80">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                    className="ps-9 pe-10 h-10 text-sm border-border bg-background/50 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 mt-2 font-semibold text-sm shadow-xs transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    جاري التحقق...
                  </span>
                ) : (
                  "دخول إلى لوحة التحكم"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-center text-[11px] text-muted-foreground">
          <span>منصة لوناليزا للسياحة والسفر · إصدار المؤسسات v2.0</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-background flex items-center justify-center">
          <div className="size-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
