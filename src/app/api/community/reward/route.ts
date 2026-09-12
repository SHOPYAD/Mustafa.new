import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { getNostrSocialSettings } from "@/lib/server/nostr-social-store";
import { creditCommunityPoints, getWalletForUser } from "@/lib/loyalty/server";

export const runtime = "nodejs";

// In-memory rate limiting map: userId -> lastActionTimestamp
const userLastAction = new Map<string, number>();

export async function POST(req: Request) {
  let body: {
    action?: "post" | "photo" | "reel" | "comment" | "like";
    eventId?: string;
    commentText?: string;
    hasBooking?: boolean;
    booking?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const { action, eventId, commentText, hasBooking, booking } = body;
  if (!action || !["post", "photo", "reel", "comment", "like"].includes(action)) {
    return NextResponse.json({ ok: false, error: "invalid_action" }, { status: 400 });
  }

  // Always update in-store likes/comments count if eventId is provided
  if (eventId) {
    if (action === "like") {
      try {
        const { togglePostLike } = await import("@/lib/server/community-feed-store");
        await togglePostLike(eventId);
      } catch {}
    } else if (action === "comment") {
      try {
        const { addPostComment } = await import("@/lib/server/community-feed-store");
        await addPostComment(eventId, commentText || "تعليق");
      } catch {}
    }
  }

  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json(
      { ok: true, awarded: 0, message: "تم تسجيل تفاعلك! سجّل الدخول لكسب نقاط مكافآت في محفظتك" }
    );
  }

  const settings = await getNostrSocialSettings();
  const cfg = settings.pointsConfig;

  // Check cooldown for spam prevention (like spam, comment spam)
  const now = Date.now();
  const lastTime = userLastAction.get(user.id) || 0;
  const cooldownMs = (cfg.minCooldownSeconds ?? ((cfg.cooldownMinutes || 1) * 60)) * 1000;
  if (action !== "like" && now - lastTime < cooldownMs) {
    return NextResponse.json(
      {
        ok: false,
        error: "cooldown",
        message: `يرجى الانتظار ${(Math.ceil((cooldownMs - (now - lastTime)) / 1000))} ثانية قبل كسب نقاط إضافية`,
      },
      { status: 429 }
    );
  }

  // Determine user segment: Segment A (Verified Lonaliza Customer) vs Segment B (Community-Only Visitor)
  let isVerifiedCustomer = Boolean(hasBooking || booking);
  if (!isVerifiedCustomer) {
    try {
      const u = user as unknown as { bookingsCount?: number; tier?: string; hasBookings?: boolean };
      if ((u.bookingsCount && u.bookingsCount > 0) || u.hasBookings) {
        isVerifiedCustomer = true;
      }
    } catch {}
  }

  // If engagement condition is active, publishing rewards are held until engagement is met
  if (Boolean(cfg.requireEngagementForPoints ?? true) && ["post", "photo", "reel"].includes(action)) {
    return NextResponse.json({
      ok: true,
      awarded: 0,
      isPending: true,
      message: `تم تسجيل منشورك بنجاح! ستُضاف نقاط المكافأة تلقائياً لمحفظتك فور وصول المنشور إلى تفاعل الجمهور المحدد (${cfg.minLikesForPoints ?? 50} إعجاب و ${cfg.minCommentsForPoints ?? 10} تعليقات).`,
      action,
      isVerifiedCustomer,
    });
  }

  // Calculate points based on customer segment
  let points = 0;
  let actionLabel = "";

  if (isVerifiedCustomer) {
    // Segment A: High rewards for confirmed Lonaliza customers
    switch (action) {
      case "reel":
        points = cfg.pointsPerReel || 250;
        actionLabel = "نشر مقطع ريلز سياحي موثق (عميل معتمد)";
        break;
      case "photo":
        points = cfg.pointsPerPhoto ?? cfg.pointsPerPhotoPost ?? 100;
        actionLabel = "مشاركة صور تجربة حجز موثق (عميل معتمد)";
        break;
      case "post":
        points = cfg.pointsPerPost || 150;
        actionLabel = "نشر تقرير سياحي موثق (عميل معتمد)";
        break;
      case "comment":
        points = cfg.pointsPerComment || 25;
        actionLabel = "التعليق والمساعدة السياحية (عميل معتمد)";
        break;
      case "like":
        points = cfg.pointsPerLike || 5;
        actionLabel = "إعجاب بتجربة سياحية";
        break;
    }
  } else {
    // Segment B: Controlled rewards for community-only travelers without confirmed booking
    switch (action) {
      case "reel":
        points = cfg.guestPointsPerReel || 75;
        actionLabel = "نشر مقطع ريلز سياحي (عضو مجتمع)";
        break;
      case "photo":
        points = cfg.guestPointsPerPhoto || 30;
        actionLabel = "مشاركة صور تجربة سياحية (عضو مجتمع)";
        break;
      case "post":
        points = cfg.guestPointsPerPost || 40;
        actionLabel = "نشر تقرير سياحي (عضو مجتمع)";
        break;
      case "comment":
        points = cfg.guestPointsPerComment || 10;
        actionLabel = "التعليق والتفاعل (عضو مجتمع)";
        break;
      case "like":
        points = cfg.guestPointsPerLike || 2;
        actionLabel = "إعجاب بتجربة سياحية";
        break;
    }
  }

  // Check Caps & Limits from user wallet ledger (Daily, Weekly, Monthly)
  const wallet = await getWalletForUser(user.id);
  const nowDate = new Date();
  const todayStr = nowDate.toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(now - 7 * 24 * 3600 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 3600 * 1000).toISOString();

  const earnLedger = wallet.ledger.filter((entry) => entry.kind === "earn");
  const earnedToday = earnLedger
    .filter((entry) => entry.createdAt.startsWith(todayStr))
    .reduce((sum, entry) => sum + (entry.points || 0), 0);
  const earnedWeekly = earnLedger
    .filter((entry) => entry.createdAt >= sevenDaysAgo)
    .reduce((sum, entry) => sum + (entry.points || 0), 0);
  const earnedMonthly = earnLedger
    .filter((entry) => entry.createdAt >= thirtyDaysAgo)
    .reduce((sum, entry) => sum + (entry.points || 0), 0);

  // Daily Cap
  const dailyCap = cfg.dailyEarnCap ?? cfg.dailyCapPoints ?? 1000;
  if (earnedToday + points > dailyCap) {
    const remainingCap = Math.max(0, dailyCap - earnedToday);
    if (remainingCap <= 0) {
      return NextResponse.json({
        ok: false,
        error: "daily_cap_reached",
        message: "تم الوصول إلى الحد الأقصى للنقاط اليومية، استمر بالتفاعل وستكسب المزيد غداً!",
        totalPoints: wallet.points,
      });
    }
    points = remainingCap;
  }

  // Weekly Cap
  const weeklyCap = cfg.weeklyEarnCap ?? 5000;
  if (earnedWeekly + points > weeklyCap) {
    const remainingWeekly = Math.max(0, weeklyCap - earnedWeekly);
    if (remainingWeekly <= 0) {
      return NextResponse.json({
        ok: false,
        error: "weekly_cap_reached",
        message: "تم الوصول إلى الحد الأقصى للنقاط الأسبوعية، نشكرك على تفاعلك المستمر!",
        totalPoints: wallet.points,
      });
    }
    points = Math.min(points, remainingWeekly);
  }

  // Monthly Cap
  const monthlyCap = cfg.monthlyEarnCap ?? 15000;
  if (earnedMonthly + points > monthlyCap) {
    const remainingMonthly = Math.max(0, monthlyCap - earnedMonthly);
    if (remainingMonthly <= 0) {
      return NextResponse.json({
        ok: false,
        error: "monthly_cap_reached",
        message: "تم الوصول إلى الحد الأقصى للنقاط الشهرية!",
        totalPoints: wallet.points,
      });
    }
    points = Math.min(points, remainingMonthly);
  }

  const result = await creditCommunityPoints(
    user.id,
    points,
    action,
    `مجتمع لوناليزا: ${actionLabel}`,
    eventId,
    isVerifiedCustomer
  );

  if (result.ok) {
    userLastAction.set(user.id, now);
  }

  const message = result.isPending
    ? `تم تسجيل ${result.awarded} نقطة بنجاح (معلقة بانتظار اعتماد الإدارة لضمان النزاهة والمكافآت العادلة)`
    : `مبروك! تم إضافة ${result.awarded} نقطة مؤكدة إلى محفظتك`;

  return NextResponse.json({
    ok: result.ok,
    awarded: result.awarded,
    totalPoints: result.totalPoints,
    isPending: result.isPending,
    message,
    action,
    actionLabel,
    isVerifiedCustomer,
  });
}
