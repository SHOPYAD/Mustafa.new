// src/components/admin/transfers/ReviewsTab.tsx
"use client";

import React, { useState } from "react";
import { Star, Sparkles, MessageSquare, CheckCircle, ShieldAlert, User } from "lucide-react";

interface Props {
  reviews: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onModerateReview: (id: string, status: "published" | "pending" | "hidden", adminReply?: string) => Promise<void>;
}

export const ReviewsTab: React.FC<Props> = ({
  reviews,
  isLoading,
  onRefresh,
  onModerateReview,
}) => {
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    await onModerateReview(id, "published", replyText);
    setReplyingId(null);
    setReplyText("");
  };

  return (
    <div className="space-y-4 animate-fadeIn" dir="rtl">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/60">
        <div>
          <h3 className="text-sm font-bold text-foreground">تقييمات العملاء ومؤشرات النظافة والجودة</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            مراجعة تقييمات رحلات النقل والجولات اليومية، ومستوى نظافة السيارات، وتعامل السائقين.
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border/60">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">لا توجد تقييمات حتى الآن</h3>
          <p className="text-xs text-muted-foreground">عند إتمام العملاء لرحلاتهم سيتمكنون من تقييم السائق والسيارة ونظافتها.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl bg-card border border-border/60 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">{r.customerName}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{r.bookingNumber}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs font-mono bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{r.ratings?.overall || 5.0} / 5</span>
                </div>
              </div>

              {/* Ratings Breakdown */}
              <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-muted/40 text-[11px]">
                <div>
                  <span className="text-muted-foreground block">النظافة:</span>
                  <span className="font-bold text-emerald-500 flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" /> {r.ratings?.cleanliness || 5}/5
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">المواعيد:</span>
                  <span className="font-bold text-foreground">{r.ratings?.punctuality || 5}/5</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">السائق:</span>
                  <span className="font-bold text-foreground">{r.ratings?.driver || 5}/5</span>
                </div>
              </div>

              {/* Comment */}
              <p className="text-xs text-foreground bg-muted/20 p-2.5 rounded-xl border border-border/30 leading-relaxed">
                "{r.comment || "تجربة ممتازة وسيارة فاخرة وسائق محترم وغاية في الأدب والنظافة."}"
              </p>

              {/* Admin reply */}
              {r.adminReply ? (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-foreground space-y-1">
                  <div className="font-bold text-amber-500 text-[11px]">رد مؤسسة لوناليزا:</div>
                  <div>{r.adminReply}</div>
                </div>
              ) : replyingId === r.id ? (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="اكتب رد المؤسسة على العميل..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-amber-500 focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setReplyingId(null)}
                      className="px-3 py-1 text-xs rounded-lg bg-muted text-foreground"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => handleSendReply(r.id)}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400"
                    >
                      نشر الرد
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <button
                    onClick={() => {
                      setReplyingId(r.id);
                      setReplyText("");
                    }}
                    className="flex items-center gap-1 text-amber-500 hover:text-amber-400 font-bold"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>كتابة رد رسمي</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {r.status !== "published" && (
                      <button
                        onClick={() => onModerateReview(r.id, "published")}
                        className="text-emerald-500 hover:underline text-[11px] font-bold"
                      >
                        نشر
                      </button>
                    )}
                    {r.status !== "hidden" && (
                      <button
                        onClick={() => onModerateReview(r.id, "hidden")}
                        className="text-rose-500 hover:underline text-[11px]"
                      >
                        إخفاء
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
