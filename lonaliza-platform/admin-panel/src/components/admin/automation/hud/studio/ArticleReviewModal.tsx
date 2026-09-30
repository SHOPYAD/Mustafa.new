"use client";

import React from "react";
import { X } from "lucide-react";
import type { ArticlePipelineClient } from "@/lib/swarm/article-pipeline-types";

interface ArticleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  style?: React.CSSProperties;
  onMouseDownHeader?: (e: React.MouseEvent) => void;
  pipeline?: ArticlePipelineClient | null;
}

export default function ArticleReviewModal({
  isOpen,
  onClose,
  style,
  onMouseDownHeader,
  pipeline,
}: ArticleReviewModalProps) {
  if (!isOpen) return null;
  const published = Boolean(pipeline?.published && pipeline.directUrl);
  return (
    <div
      id="studio-window-article-review"
      style={style}
      className="absolute rounded-xl border-2 border-cyan-400/60 bg-[#030e1d]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,229,255,0.35)] overflow-hidden flex flex-col z-50 max-h-[calc(100vh-90px)]"
    >
      <div
        onMouseDown={onMouseDownHeader}
        className="shrink-0 flex items-center justify-between px-3.5 py-2.5 border-b border-cyan-500/30 bg-cyan-950/80 cursor-grab"
      >
        <button type="button" onClick={onClose} className="w-5 h-5 rounded border border-cyan-400/50 text-cyan-200" title="إغلاق">
          <X size={12} className="mx-auto" />
        </button>
        <p className="text-xs font-bold text-cyan-100">
          {pipeline?.articleId ? `المقال ${pipeline.articleId}` : "لا يوجد مقال لهذه المهمة"}
        </p>
      </div>
      <div className="flex-1 overflow-hidden min-h-[420px]" style={{ direction: "rtl" }}>
        {published && pipeline?.directUrl ? (
          <iframe title={pipeline.slug} src={pipeline.directUrl} className="w-full h-full min-h-[480px] bg-white" />
        ) : (
          <div className="p-4 text-sm text-slate-200 space-y-3 overflow-y-auto max-h-[70vh]">
            <p>{pipeline?.blockedReason || "المقال لم يُنشر. لا يُفتح قالب تركيا."}</p>
            <ul className="space-y-2">
              {(pipeline?.stages || []).map((stage) => (
                <li key={stage.id} className="border border-cyan-500/20 rounded-lg p-2">
                  <p className="font-bold">{stage.label} — {stage.status}</p>
                  <p className="text-cyan-200/80">{stage.tool}</p>
                  <p>{stage.error || stage.outcome}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
