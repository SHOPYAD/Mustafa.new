import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { saveSwarmDiscussionMessage } from "@/lib/automation/agent-collab-store";

export interface TripFeedbackItem {
  id: string;
  rating: number; // 1 to 5
  feedback?: string;
  destination?: string;
  tripTitle?: string;
  tags?: string[];
  sessionId?: string;
  tripData?: any;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data", "agent-swarm");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");

function ensureFeedbackDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readFeedbacks(): TripFeedbackItem[] {
  try {
    ensureFeedbackDir();
    if (!fs.existsSync(FEEDBACK_FILE)) {
      fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const raw = fs.readFileSync(FEEDBACK_FILE, "utf-8");
    return JSON.parse(raw) as TripFeedbackItem[];
  } catch {
    return [];
  }
}

function saveFeedback(item: TripFeedbackItem): void {
  ensureFeedbackDir();
  const list = readFeedbacks();
  list.unshift(item);
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(list.slice(0, 500), null, 2), "utf-8");
}

export async function GET() {
  try {
    const feedbacks = readFeedbacks();
    const count = feedbacks.length;
    const avg = count > 0 ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / count).toFixed(1) : "5.0";

    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const tagCounts: Record<string, number> = {};

    feedbacks.forEach((f) => {
      const r = Math.max(1, Math.min(5, Math.round(f.rating || 5))) as 1 | 2 | 3 | 4 | 5;
      ratingBreakdown[r] = (ratingBreakdown[r] || 0) + 1;
      (f.tags || []).forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });

    return NextResponse.json({
      ok: true,
      feedbacks: feedbacks.slice(0, 100),
      totalCount: count,
      averageRating: parseFloat(avg),
      ratingBreakdown,
      topTags: Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([tag, count]) => ({ tag, count })),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to load feedback" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Handle Admin Directive to Swarm
    if (body.action === "directive") {
      const targetAgent = String(body.targetAgent || "site_advisor");
      const directive = String(body.directive || "").trim();
      const destination = String(body.destination || "");
      if (!directive) {
        return NextResponse.json({ ok: false, error: "نص التوجيه مطلوب" }, { status: 400 });
      }

      saveSwarmDiscussionMessage({
        id: `disc_${Date.now()}_directive`,
        fromAgent: "admin_override",
        toAgent: targetAgent,
        type: "decision",
        topic: `توجيه إداري فوري مبني على تقييمات العملاء (${destination || "عام"})`,
        contentAr: `⚡ توجيه إداري عاجل إلى [${targetAgent}]:\n${directive}\n💡 يجب تضمين هذا التوجيه فوراً في ذاكرة التخطيط والالتزام به في كافة البرامج المستقبلية.`,
        timestamp: new Date().toISOString(),
        impactLevel: "high",
      });

      return NextResponse.json({
        ok: true,
        message: "تم إرسال التوجيه بنجاح إلى خلية الوكلاء وتحديث سجل القرارات الإدارية.",
      });
    }

    // Handle Customer Feedback Submission
    const rating = Math.max(1, Math.min(5, Number(body.rating || 5)));
    const feedback = String(body.feedback || "").trim();
    const destination = String(body.destination || "").trim();
    const tripTitle = String(body.tripTitle || "").trim();
    const tags = Array.isArray(body.tags) ? body.tags.map((t: unknown) => String(t)) : [];
    const sessionId = String(body.sessionId || "").trim();
    const tripData = body.tripData || null;

    const newItem: TripFeedbackItem = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      rating,
      feedback,
      destination,
      tripTitle,
      tags,
      sessionId,
      tripData,
      createdAt: new Date().toISOString(),
    };

    saveFeedback(newItem);

    // Notify Swarm Hive & Record in Hive Discussion
    try {
      const stars = "⭐".repeat(rating);
      saveSwarmDiscussionMessage({
        id: `disc_${Date.now()}_feedback`,
        fromAgent: "site_advisor",
        toAgent: "all",
        type: "insight",
        topic: `تقييم برنامج رحلة (${rating}/5 ${stars})`,
        contentAr: `📝 تقييم جودة البرنامج من العميل:\n- **التقييم:** ${rating} من 5 ${stars}\n- **الوجهة:** ${destination || "غير محددة"}\n- **البرنامج:** ${tripTitle || "برنامج مخصص"}\n- **المميزات / الوسوم:** ${tags.length > 0 ? tags.join("، ") : "عام"}\n- **ملاحظة العميل:** ${feedback ? `"${feedback}"` : "بدون ملاحظة إضافية"}\n💡 تم حفظ التقييم في ذاكرة الخلية لدعم التعلم التراكمي وتحسين اقتراحات البرامج المستقبلية.`,
        timestamp: new Date().toISOString(),
        impactLevel: rating <= 3 ? "high" : "low",
      });
    } catch (swarmErr) {
      console.error("[Swarm Feedback Notification Error]:", swarmErr);
    }

    return NextResponse.json({
      ok: true,
      message: "شكراً لتقييمكم! تم استلام آرائكم بنجاح ومشاركتها مع فريق التخطيط والذكاء الاصطناعي.",
      item: newItem,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "فشل تسجيل التقييم" },
      { status: 500 }
    );
  }
}
