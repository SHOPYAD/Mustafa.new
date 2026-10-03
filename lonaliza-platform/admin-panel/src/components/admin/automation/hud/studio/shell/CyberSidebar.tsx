"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BrainCircuit, ChevronDown, ChevronLeft, GitBranch, Layers, Network, Orbit, Search, UserRound, X } from "lucide-react";
import { buildAdminNav, type NavGroup, type NavLeaf } from "@/components/admin/admin-nav";
import type { Dictionary } from "@/lib/i18n/types";
import { screenForGroup, studioTargetForHref } from "@/lib/studio/graph/maps";
import { openStudioWindow } from "@/lib/studio/windows/window-store";
import { FONT, UI } from "@/lib/studio/tokens";

const PINNED = [
  { screenId: "20", label: "الحضور البشري والصوت الحي", hint: "الواجهة الرئيسية", icon: UserRound },
  { screenId: "23", label: "العقل المدبر السيادي 3D", hint: "1,208 عقدة · محاكاة عصبية تفاعلية", icon: BrainCircuit },
  { screenId: "21", label: "مسرح Nexus — سلايد البطاقات", hint: "ماوس · لمس · كاميرا/يد", icon: Orbit },
  { screenId: "22", label: "استوديو العقد والأتمتة البصرية", hint: "سحب · ربط · تشغيل تنفيذي", icon: GitBranch },
  { screenId: "01", label: "الأطلس العصبي الشامل", hint: "كل المجالات حول الوكيل", icon: Network },
  { screenId: "02", label: "التوسع التراكمي الشامل", hint: "مجال ← نظام ← كيان", icon: Layers },
];

function norm(s: string) {
  return s.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").toLowerCase();
}

/**
 * الشريط الجانبي للاستوديو: أقسام لوحة الإدارة الحقيقية (admin-nav) بأيقوناتها.
 * البند يفتح واجهته ونظامه في الاستوديو، أو صفحته داخل نافذة سيبرانية إن لم تكن له خريطة.
 */
export function CyberSidebar({
  open,
  onClose,
  currentScreenId,
  onOpenScreen,
}: {
  open: boolean;
  onClose: () => void;
  currentScreenId: string;
  onOpenScreen: (screenId: string, focusHubId?: string | null) => void;
}) {
  const nav = useMemo<NavGroup[]>(() => buildAdminNav({} as Dictionary["admin"]), []);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    setPos((current) => {
      if (current) return current;
      try {
        const saved = JSON.parse(sessionStorage.getItem("cyber-menu-pos") || "");
        if (typeof saved?.x === "number" && typeof saved?.y === "number") return saved;
      } catch { /* موضع افتراضي */ }
      return { x: Math.max(16, window.innerWidth - 384), y: 72 };
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const nq = norm(q.trim());
  const groups = nav
    .map((g) => ({
      ...g,
      branches: g.branches.map((b) => ({ ...b, items: b.items.filter((l) => l.label && (!nq || norm(l.label).includes(nq) || norm(g.label).includes(nq))) })).filter((b) => b.items.length),
    }))
    .filter((g) => g.branches.length);

  const openLeaf = (leaf: NavLeaf) => {
    const target = studioTargetForHref(leaf.href);
    if (target) onOpenScreen(target.screenId, target.hubId);
    else {
      onOpenScreen(currentScreenId === "20" ? "01" : currentScreenId);
      setTimeout(() => openStudioWindow("route", `page:${leaf.href}`, leaf.label, { href: leaf.href, page: true }, { w: 1080, h: 660 }), 350);
    }
    onClose();
  };

  const startDrag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const origin = pos ?? { x: 24, y: 72 };
    const sx = e.clientX - origin.x;
    const sy = e.clientY - origin.y;
    const move = (ev: PointerEvent) => {
      const next = {
        x: Math.min(Math.max(8, ev.clientX - sx), window.innerWidth - 80),
        y: Math.min(Math.max(8, ev.clientY - sy), window.innerHeight - 80),
      };
      setPos(next);
      try { sessionStorage.setItem("cyber-menu-pos", JSON.stringify(next)); } catch { /* ignore */ }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  if (!open || !pos) return null;

  return (
    <aside
      dir="rtl"
      aria-label="أقسام اللوحة"
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: "min(360px, 88vw)",
        height: "min(78vh, 720px)",
        zIndex: 1000001,
        background: "linear-gradient(180deg, rgba(3,16,28,0.98), rgba(2,9,17,0.99))",
        border: `1px solid ${UI.border}`,
        borderRadius: 16,
        boxShadow: "0 18px 50px rgba(0,0,0,0.55), 0 0 22px rgba(64,214,245,0.22)",
        fontFamily: FONT,
        color: UI.text,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
        <div onPointerDown={startDrag} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px", cursor: "grab" }}>
          <span style={{ width: 34, height: 34, borderRadius: 17, border: "1.5px solid #40d6f5", display: "grid", placeItems: "center", boxShadow: "0 0 12px rgba(64,214,245,0.5)" }}>
            <Network size={18} color="#8ff0ff" />
          </span>
          <span style={{ flex: 1, display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
            <span style={{ fontSize: 16.5, fontWeight: 700 }}>أقسام اللوحة</span>
            <span style={{ fontSize: 12.5, color: UI.textDim }}>كل الأقسام الحقيقية للوحة الإدارة</span>
          </span>
          <button type="button" aria-label="إغلاق" onClick={onClose} style={{ width: 30, height: 30, border: 0, borderRadius: 8, background: "transparent", color: "#c9d8df", cursor: "pointer", display: "grid", placeItems: "center" }}>
            <X size={18} />
          </button>
        </div>

        <label style={{ margin: "0 14px 10px", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 10, border: `1px solid ${UI.borderSoft}`, background: "rgba(2,10,18,0.85)" }}>
          <Search size={16} color={UI.textDim} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في الأقسام..." style={{ flex: 1, background: "transparent", border: 0, outline: "none", color: UI.text, fontSize: 14.5, fontFamily: FONT }} />
        </label>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 10px 16px" }}>
          {!nq ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
              {PINNED.map((p) => {
                const active = currentScreenId === p.screenId;
                const I = p.icon;
                return (
                  <button
                    key={p.screenId}
                    type="button"
                    onClick={() => {
                      onOpenScreen(p.screenId);
                      onClose();
                    }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, border: `1px solid ${active ? "rgba(95,232,255,0.75)" : "rgba(64,214,245,0.18)"}`, background: active ? "rgba(10,60,80,0.45)" : "rgba(4,18,30,0.6)", boxShadow: active ? "0 0 14px rgba(64,214,245,0.3)" : "none", color: UI.text, cursor: "pointer", fontFamily: FONT, textAlign: "right" }}
                  >
                    <I size={19} color={active ? "#8ff0ff" : "#5fe8ff"} />
                    <span style={{ flex: 1, display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 600 }}>{p.label}</span>
                      <span style={{ fontSize: 12, color: UI.textDim }}>{p.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div role="tree" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {groups.map((g) => {
              const GI = g.icon;
              const isOpen = !!expanded[g.id] || !!nq;
              const groupScreen = screenForGroup(g.id);
              const active = currentScreenId === groupScreen;
              return (
                <div key={g.id} role="treeitem" aria-expanded={isOpen}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, borderRadius: 10, background: active ? "rgba(64,214,245,0.1)" : "transparent", border: `1px solid ${active ? "rgba(64,214,245,0.45)" : "transparent"}` }}>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenScreen(groupScreen);
                        onClose();
                      }}
                      style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: 0, background: "transparent", color: UI.text, cursor: "pointer", fontFamily: FONT, textAlign: "right" }}
                    >
                      <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", background: "rgba(64,214,245,0.08)", border: "1px solid rgba(64,214,245,0.3)" }}>
                        <GI size={17} color="#5fe8ff" />
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{g.label}</span>
                    </button>
                    <button type="button" aria-label={isOpen ? "طي" : "توسيع"} onClick={() => setExpanded((x) => ({ ...x, [g.id]: !x[g.id] }))} style={{ width: 30, height: 30, border: 0, background: "transparent", cursor: "pointer", color: "#c9d8df", display: "grid", placeItems: "center" }}>
                      {isOpen ? <ChevronDown size={16} /> : <ChevronLeft size={16} />}
                    </button>
                  </div>
                  {isOpen ? (
                    <div style={{ margin: "2px 22px 8px 0", paddingRight: 10, borderRight: "1px solid rgba(64,214,245,0.22)" }}>
                      {g.branches.map((b) => (
                        <div key={b.id} style={{ marginTop: 4 }}>
                          {b.label && g.branches.length > 1 ? <div style={{ fontSize: 12, color: UI.textFaint, padding: "4px 8px" }}>{b.label}</div> : null}
                          {b.items.map((l) => {
                            const LI = l.icon;
                            const linked = !!studioTargetForHref(l.href);
                            return (
                              <button
                                key={l.id}
                                type="button"
                                onClick={() => openLeaf(l)}
                                title={l.description || l.href}
                                style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "6px 8px", border: 0, borderRadius: 8, background: "transparent", color: "#d6e4ea", cursor: "pointer", fontFamily: FONT, fontSize: 13.8, textAlign: "right" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(64,214,245,0.08)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                              >
                                <LI size={15} color={linked ? "#5fe8ff" : "#8aa0ab"} />
                                <span style={{ flex: 1 }}>{l.label}</span>
                                {linked ? <span style={{ width: 6, height: 6, borderRadius: 3, background: "#35f0a0", boxShadow: "0 0 6px #35f0a0" }} title="له خريطة في الاستوديو" /> : null}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
  );
}
