"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  Cpu,
  Layers,
  Zap,
  Tag,
  ArrowRight,
  Globe,
  Sliders,
  Check,
  X,
} from "lucide-react";
import type { ThesaurusCluster } from "@/lib/studio/index/domain-thesaurus";

interface EnrichedCluster extends ThesaurusCluster {
  customTerms?: string[];
  totalTermsCount?: number;
}

interface ThesaurusStats {
  totalClusters: number;
  totalBaseTerms: number;
  totalCustomTerms: number;
  grandTotalTerms: number;
}

interface CuratorSuggestion {
  term: string;
  dialect: string;
  context: string;
}

export function ThesaurusManager() {
  const [clusters, setClusters] = useState<EnrichedCluster[]>([]);
  const [stats, setStats] = useState<ThesaurusStats | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string>("flights.search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // New term input
  const [newTerm, setNewTerm] = useState("");
  const [isAddingTerm, setIsAddingTerm] = useState(false);

  // AI Curator Modal state
  const [isCuratorOpen, setIsCuratorOpen] = useState(false);
  const [curatorDialect, setCuratorDialect] = useState<string>("all");
  const [isCurating, setIsCurating] = useState(false);
  const [curatedSuggestions, setCuratedSuggestions] = useState<CuratorSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, boolean>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Fetch clusters and stats from API
  const fetchThesaurusData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/studio/thesaurus");
      const json = await res.json();
      if (json.ok) {
        setClusters(json.clusters || []);
        setStats(json.stats || null);
      }
    } catch (err) {
      console.error("Failed to load thesaurus data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThesaurusData();
  }, [fetchThesaurusData]);

  // Selected cluster
  const currentCluster = useMemo(() => {
    return clusters.find((c) => c.id === selectedClusterId) || clusters[0] || null;
  }, [clusters, selectedClusterId]);

  // Filter clusters
  const filteredClusters = useMemo(() => {
    let list = clusters;
    if (selectedDomain !== "all") {
      list = list.filter((c) => c.domain === selectedDomain);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.primaryAr.toLowerCase().includes(q) ||
          c.primaryEn.toLowerCase().includes(q) ||
          c.id.includes(q) ||
          c.sampleTerms.some((t) => t.includes(q))
      );
    }
    return list;
  }, [clusters, selectedDomain, searchQuery]);

  // Handle Add New Term
  const handleAddTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !currentCluster) return;

    try {
      setIsAddingTerm(true);
      const res = await fetch("/api/admin/studio/thesaurus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_term",
          clusterId: currentCluster.id,
          term: newTerm.trim(),
        }),
      });

      const json = await res.json();
      if (json.ok) {
        setNewTerm("");
        setStatusMessage(`تمت إضافة المصطلح "${json.term}" بنجاح`);
        setTimeout(() => setStatusMessage(null), 3000);
        await fetchThesaurusData();
      }
    } catch (err) {
      console.error("Failed to add term:", err);
    } finally {
      setIsAddingTerm(false);
    }
  };

  // Handle Delete Term
  const handleDeleteTerm = async (term: string) => {
    if (!currentCluster) return;

    try {
      const res = await fetch("/api/admin/studio/thesaurus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_term",
          clusterId: currentCluster.id,
          term,
        }),
      });

      const json = await res.json();
      if (json.ok) {
        await fetchThesaurusData();
      }
    } catch (err) {
      console.error("Failed to delete term:", err);
    }
  };

  // Run AI Curator
  const handleRunCurator = async () => {
    if (!currentCluster) return;

    try {
      setIsCurating(true);
      setCuratedSuggestions([]);
      setSelectedSuggestions({});

      const res = await fetch("/api/admin/studio/thesaurus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "curate_ai",
          clusterId: currentCluster.id,
          dialect: curatorDialect,
        }),
      });

      const json = await res.json();
      if (json.ok && Array.isArray(json.suggestions)) {
        setCuratedSuggestions(json.suggestions);
        // By default select all suggestions
        const initialSelected: Record<string, boolean> = {};
        json.suggestions.forEach((s: CuratorSuggestion) => {
          initialSelected[s.term] = true;
        });
        setSelectedSuggestions(initialSelected);
      }
    } catch (err) {
      console.error("AI Curator error:", err);
    } finally {
      setIsCurating(false);
    }
  };

  // Approve selected suggestions
  const handleApproveCurated = async () => {
    if (!currentCluster) return;
    const toApprove = Object.keys(selectedSuggestions).filter((k) => selectedSuggestions[k]);
    if (toApprove.length === 0) return;

    try {
      const res = await fetch("/api/admin/studio/thesaurus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_curated",
          clusterId: currentCluster.id,
          terms: toApprove,
        }),
      });

      const json = await res.json();
      if (json.ok) {
        setIsCuratorOpen(false);
        setCuratedSuggestions([]);
        setStatusMessage(`تم اعتماد ${json.addedCount} مصطلحاً جديداً في المعجم!`);
        setTimeout(() => setStatusMessage(null), 4000);
        await fetchThesaurusData();
      }
    } catch (err) {
      console.error("Failed to approve curated terms:", err);
    }
  };

  // Sync Index
  const handleSyncIndex = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch("/api/admin/studio/thesaurus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_index" }),
      });

      const json = await res.json();
      if (json.ok) {
        setStatusMessage("تمت مزامنة الفهرس وقاموس النوايا بنجاح 100%");
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div dir="rtl" className="h-full w-full bg-[#020712] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(64,214,245,0.3)]">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-cyan-100 flex items-center gap-2">
              <span>ستوديو إدارة المعجم ومنسق الذكاء الاصطناعي</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                SOVEREIGN THESAURUS
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              إدارة 26 عنقوداً تشغيلياً وتوليد المرادفات السياحية باللهجات الإقليمية
            </p>
          </div>
        </div>

        {/* Global Statistics & Sync Action */}
        <div className="flex items-center gap-4">
          {stats && (
            <div className="hidden md:flex items-center gap-3 text-xs bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-xl">
              <div>
                <span className="text-slate-400">العناقيد: </span>
                <span className="font-mono font-bold text-cyan-300">{stats.totalClusters}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div>
                <span className="text-slate-400">المصطلحات الأساسية: </span>
                <span className="font-mono font-bold text-amber-300">{stats.totalBaseTerms.toLocaleString()}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div>
                <span className="text-slate-400">المصطلحات المخصصة: </span>
                <span className="font-mono font-bold text-emerald-300">{stats.totalCustomTerms}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSyncIndex}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(64,214,245,0.4)] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            <span>مزامنة الفهرس الشامل</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-6 py-2 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Workspace: Left List & Right Detail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Cluster Navigator */}
        <div className="w-80 border-l border-cyan-500/20 bg-slate-950/50 flex flex-col shrink-0">
          {/* Search & Domain Filter */}
          <div className="p-3 border-b border-slate-800/80 space-y-2">
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في العناقيد..."
                className="w-full rounded-xl bg-slate-900 border border-slate-800 py-1.5 pr-9 pl-3 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Cluster List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredClusters.map((cluster) => {
              const isSelected = cluster.id === selectedClusterId;
              const customCount = cluster.customTerms?.length || 0;

              return (
                <button
                  key={cluster.id}
                  type="button"
                  onClick={() => setSelectedClusterId(cluster.id)}
                  className={`w-full text-right p-3 rounded-xl transition-all border ${
                    isSelected
                      ? "bg-cyan-950/40 border-cyan-400/50 shadow-[0_0_15px_rgba(64,214,245,0.2)]"
                      : "bg-slate-900/30 border-transparent hover:bg-slate-900/70 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                      {cluster.domain}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="text-slate-400">{cluster.termsCount}</span>
                      {customCount > 0 && (
                        <span className="text-emerald-400 font-bold">+{customCount}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-200 line-clamp-1">
                    {cluster.primaryAr}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                    {cluster.id}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Cluster Workspace */}
        {currentCluster ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/30">
            {/* Cluster Workspace Header */}
            <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {currentCluster.domain}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{currentCluster.id}</span>
                </div>
                <h2 className="text-lg font-bold text-cyan-100">{currentCluster.primaryAr}</h2>
                <div className="text-xs text-slate-400">{currentCluster.primaryEn}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCuratorOpen(true);
                    handleRunCurator();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>توليد مرادفات بالذكاء الاصطناعي</span>
                </button>
              </div>
            </div>

            {/* Target Nodes Linked to this Cluster */}
            <div className="px-6 py-3 border-b border-slate-800/50 bg-slate-950/40 shrink-0">
              <div className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                <span>عقد المنصة المربوطة بهذا العنقود ({currentCluster.targetNodeIds.length}):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentCluster.targetNodeIds.map((nodeId) => (
                  <span
                    key={nodeId}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300"
                  >
                    {nodeId}
                  </span>
                ))}
              </div>
            </div>

            {/* Terms Area: Add Term Bar & Term Tags */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Add Custom Term Input */}
              <form onSubmit={handleAddTerm} className="flex gap-2">
                <input
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="أضف مصطلحاً أو تعبيراً عامياً جديداً لهذا العنقود..."
                  className="flex-1 rounded-xl bg-slate-900/80 border border-slate-800 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500/50"
                />
                <button
                  type="submit"
                  disabled={isAddingTerm || !newTerm.trim()}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 transition-all disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة مصطلح</span>
                </button>
              </form>

              {/* Custom Curated Terms Section */}
              {currentCluster.customTerms && currentCluster.customTerms.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>المصطلحات المخصصة المعتمدة حديثاً ({currentCluster.customTerms.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentCluster.customTerms.map((term) => (
                      <span
                        key={term}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 shadow-sm"
                      >
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTerm(term)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Base Terms Cloud */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-cyan-400" />
                  <span>عينة المصطلحات الأساسية في العنقود ({currentCluster.sampleTerms.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentCluster.sampleTerms.map((term, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            اختر عنقوداً من القائمة الجانبية لبدء التحرير
          </div>
        )}
      </div>

      {/* AI Curator Modal */}
      {isCuratorOpen && currentCluster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-[580px] max-w-full rounded-2xl border border-amber-500/40 bg-slate-950 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.25)] flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950/80 border border-amber-400/40 text-amber-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-200">
                    منسق المرادفات الذاتي (AI Curator Copilot)
                  </h3>
                  <p className="text-xs text-slate-400">
                    عنقود: {currentCluster.primaryAr}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCuratorOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Dialect Selector */}
            <div className="flex items-center gap-2 mb-4 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 px-2">اللهجة:</span>
              {[
                { id: "all", label: "شامل كافة اللهجات" },
                { id: "gulf", label: "🇸🇦 سعودي وخليجي" },
                { id: "egyptian", label: "🇪🇬 مصري" },
                { id: "levantine", label: "🇱🇧 شامي" },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setCuratorDialect(d.id)}
                  className={`flex-1 py-1 text-xs rounded-lg transition-all ${
                    curatorDialect === d.id
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Suggestions List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2 min-h-[220px]">
              {isCurating ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-amber-300">
                  <RefreshCw className="h-8 w-8 animate-spin text-amber-400" />
                  <span className="text-xs font-mono">
                    جاري استدعاء نموذج الذكاء لتوليد مصطلحات دارجة دقيقة…
                  </span>
                </div>
              ) : curatedSuggestions.length > 0 ? (
                curatedSuggestions.map((sug) => {
                  const isChecked = Boolean(selectedSuggestions[sug.term]);
                  return (
                    <label
                      key={sug.term}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                          : "bg-slate-900/40 border-slate-800/80 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setSelectedSuggestions((prev) => ({
                              ...prev,
                              [sug.term]: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-200">{sug.term}</div>
                          <div className="text-[10px] text-slate-400">{sug.context}</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-mono">
                        {sug.dialect}
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="text-center p-8 text-slate-500 text-xs">
                  اضغط على زر "إعادة التوليد" لاستدعاء المقترحات.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
              <button
                type="button"
                onClick={handleRunCurator}
                disabled={isCurating}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isCurating ? "animate-spin" : ""}`} />
                <span>إعادة توليد خيارات جديدة</span>
              </button>

              <button
                type="button"
                onClick={handleApproveCurated}
                disabled={
                  isCurating ||
                  Object.values(selectedSuggestions).filter(Boolean).length === 0
                }
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>اعتماد المحدد في المعجم</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
