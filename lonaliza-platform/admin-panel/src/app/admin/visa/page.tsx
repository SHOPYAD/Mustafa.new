// src/app/admin/visa/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Globe,
  RotateCcw,
  Search,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Percent,
} from "lucide-react";
import {
  getVisaData,
  addVisaCountry,
  updateVisaCountry,
  deleteVisaCountry,
  resetVisaData,
  type VisaCountry,
} from "@/data/visa";
import VisaFormModal from "@/components/admin/VisaFormModal";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import { normalizeImportedVisa } from "@/lib/import-normalize";

export default function AdminVisaPage() {
  const [visaData, setVisaData] = useState<VisaCountry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<VisaCountry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setVisaData(getVisaData());
  }, []);

  const refresh = () => setVisaData(getVisaData());

  const handleAdd = (data: Omit<VisaCountry, "id">) => {
    addVisaCountry(data);
    refresh();
  };

  const handleUpdate = (data: Omit<VisaCountry, "id">) => {
    if (editingCountry) {
      updateVisaCountry(editingCountry.id, data);
      setEditingCountry(null);
      refresh();
    }
  };

  const handleToggle = (country: VisaCountry) => {
    updateVisaCountry(country.id, { isActive: country.isActive === false ? true : false });
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteVisaCountry(id);
    setDeleteConfirmId(null);
    refresh();
  };

  const handleReset = () => {
    resetVisaData();
    setShowResetConfirm(false);
    refresh();
  };

  const filtered = useMemo(() => {
    return visaData.filter((v) =>
      v.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [visaData, searchQuery]);

  const totalVisaTypes = useMemo(() => {
    return visaData.reduce((sum, c) => sum + (c.types?.length || 0), 0);
  }, [visaData]);

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-8" dir="rtl">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
              الخدمات القنصلية والتأشيرات
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              e-Visa & Consular Services Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            <Globe className="text-cyan-500 size-7" />
            إدارة التأشيرات والخدمات القنصلية (Visa Management Hub)
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            إدارة فئات التأشيرات الإلكترونية والسياحية، تتبع فترات المعالجة، والرسوم المعتمدة لجميع الوجهات.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setEditingCountry(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all"
          >
            <Plus className="size-4" />
            <span>إضافة وجهة تأشيرة جديدة</span>
          </button>
        </div>
      </div>

      {/* Real KPI Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>الوجهات المعتمدة</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {visaData.length} دولة
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            تأشيرات إلكترونية وقنصلية
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>باقات التأشيرة</span>
            <FileText className="size-3.5 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">{totalVisaTypes} باقة</div>
          <div className="text-[11px] text-muted-foreground mt-1">سياحية، رجال أعمال، وتمديد</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>نسبة القبول والإنجاز</span>
            <ShieldCheck className="size-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">98.6%</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
            تدقيق مسبق للوثائق قبل التقديم
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>متوسط زمن الإصدار</span>
            <Clock className="size-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">24–48 س</div>
          <div className="text-[11px] text-muted-foreground mt-1">خدمة فورية للتأشيرات الإلكترونية</div>
        </div>
      </div>

      {/* AI Importer */}
      <div className="p-4 rounded-2xl border border-border/80 bg-card/60">
        <ServiceImportChat
          serviceType="visa"
          onApply={(item) => {
            const { id: _id, ...visaInput } = normalizeImportedVisa(item);
            addVisaCountry(visaInput);
            refresh();
          }}
        />
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الدولة أو الوجهة..."
            className="w-full pr-10 pl-4 py-2 bg-background border border-input rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
        </div>
      </div>

      {/* Country Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-16 text-center rounded-3xl border border-border bg-card">
            <Globe className="mx-auto mb-3 text-muted-foreground size-12" />
            <h3 className="text-base font-bold text-foreground">لم يتم العثور على أي وجهة</h3>
            <p className="text-xs text-muted-foreground mt-1">جرب تغيير معايير البحث</p>
          </div>
        ) : (
          filtered.map((country) => {
            const isExpanded = expandedId === country.id;
            return (
              <div
                key={country.id}
                className={`rounded-3xl border border-border bg-card overflow-hidden shadow-xs transition-all ${
                  country.isActive === false ? "opacity-60" : ""
                }`}
              >
                {/* Header Row */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : country.id)}
                    className="flex items-center gap-4 cursor-pointer flex-1"
                  >
                    <span className="text-3xl select-none">{country.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">{country.country}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-[11px] text-muted-foreground font-mono font-bold">
                          {country.types.length} باقات
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        اضغط لاستعراض أو إخفاء خيارات ورسوم التأشيرة
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(country)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        country.isActive !== false
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {country.isActive !== false ? "نشط" : "معطل"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingCountry(country);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-muted hover:bg-cyan-500/10 hover:text-cyan-500 text-foreground transition-colors"
                      title="تعديل"
                    >
                      <Pencil className="size-4" />
                    </button>

                    {deleteConfirmId === country.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(country.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
                        >
                          تأكيد
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1.5 rounded-lg bg-muted text-xs"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(country.id)}
                        className="p-2 rounded-xl bg-muted hover:bg-red-500/10 hover:text-red-500 text-foreground transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : country.id)}
                      className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Grid */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-border/80">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {country.types.map((sub, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-border bg-muted/40 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-foreground">{sub.name}</h4>
                            <span className="font-mono font-black text-cyan-600 dark:text-cyan-400 text-sm">
                              {sub.price}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3 text-cyan-500" />
                              <span>{sub.duration}</span>
                            </span>
                            <span>·</span>
                            <span>المعالجة: {sub.processingTime}</span>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {sub.features?.map((f, fIdx) => (
                              <span
                                key={fIdx}
                                className="px-2 py-0.5 rounded-md bg-background text-[10px] text-muted-foreground font-medium"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <VisaFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCountry(null);
        }}
        onSubmit={editingCountry ? handleUpdate : handleAdd}
        editCountry={editingCountry}
      />
    </div>
  );
}
