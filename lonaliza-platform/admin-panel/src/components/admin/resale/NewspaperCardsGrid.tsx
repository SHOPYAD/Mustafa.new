"use client";

import React, { useState } from "react";
import {
  MapPin,
  Star,
  Globe,
  Phone,
  Mail,
  MessageSquare,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import type { ScrapedBusinessLead, OutreachStatus } from "@/lib/server/gmaps-scraper/types";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

interface NewspaperCardsGridProps {
  leads: ScrapedBusinessLead[];
  selectedLeadIds: string[];
  onToggleSelect: (id: string) => void;
  onStatusChange: (id: string, status: OutreachStatus) => void;
  onOpenWhatsApp: (lead: ScrapedBusinessLead) => void;
  onOpenEmail: (lead: ScrapedBusinessLead) => void;
  onDeleteLead?: (id: string) => void;
  loading: boolean;
}

export default function NewspaperCardsGrid({
  leads,
  selectedLeadIds,
  onToggleSelect,
  onStatusChange,
  onOpenWhatsApp,
  onOpenEmail,
  onDeleteLead,
  loading,
}: NewspaperCardsGridProps) {
  const [leadToDelete, setLeadToDelete] = useState<ScrapedBusinessLead | null>(null);
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="rounded-2xl border border-border bg-card p-4 space-y-3 h-72">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="p-16 text-center space-y-3 rounded-2xl border border-border bg-card">
        <div className="size-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
          <Building2 className="size-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground">لا توجد شركات سياحية مطابقة</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          قم بتوسيع نطاق التصفية أو إطلاق مسح حي جديد لمدينتك المستهدفة.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {leads.map((lead) => {
        const isSelected = selectedLeadIds.includes(lead.id);
        const cleanDomain = lead.website ? lead.website.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0] : "";

        return (
          <div
            key={lead.id}
            className={`group relative rounded-2xl border transition-all duration-200 bg-card hover:shadow-md flex flex-col justify-between overflow-hidden ${
              isSelected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            {/* Top Masthead / Image Banner */}
            <div className="relative h-36 w-full bg-slate-900 overflow-hidden">
              {lead.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lead.thumbnail}
                  alt={lead.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to pattern on broken image
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <Building2 className="size-8 text-purple-400/60 mb-1" />
                  <span className="text-[11px] font-bold text-slate-300">مكتب سياحي معتمد</span>
                  <span className="text-[10px] text-slate-400">{lead.city} • {lead.country}</span>
                </div>
              )}

              {/* Selection Checkbox */}
              <div className="absolute top-2.5 start-2.5 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(lead.id)}
                  className="size-4.5 rounded-lg border-2 border-white/80 text-primary cursor-pointer accent-purple-600 bg-black/40 backdrop-blur-xs"
                />
              </div>

              {/* Category Badge */}
              <div className="absolute top-2.5 end-2.5 z-10">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-purple-600/90 text-white backdrop-blur-xs shadow-xs">
                  {lead.category || "وكالة سياحة وسفر"}
                </span>
              </div>

              {/* Rating Pill */}
              <div className="absolute bottom-2 start-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                <Star className="size-3 text-amber-400 fill-amber-400" />
                <span>{lead.reviewRating ? lead.reviewRating.toFixed(1) : "4.8"}</span>
                {lead.reviewCount ? (
                  <span className="text-slate-300 text-[9px]">({lead.reviewCount})</span>
                ) : null}
              </div>

              {/* City Pill */}
              <div className="absolute bottom-2 end-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                <MapPin className="size-3 text-rose-400" />
                <span>{lead.city}</span>
              </div>
            </div>

            {/* Editorial Content Body */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                {/* Title */}
                <h3 className="text-sm font-black text-foreground leading-snug line-clamp-2" title={lead.title}>
                  {lead.title}
                </h3>

                {/* Address snippet */}
                <p className="text-[11px] text-muted-foreground flex items-start gap-1 line-clamp-2">
                  <MapPin className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{lead.address || `${lead.city}، ${lead.country}`}</span>
                </p>

                {/* Contact Badges Grid */}
                <div className="pt-2 space-y-1.5 border-t border-border/60 text-xs">
                  {/* Phone */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-bold">
                      <Phone className="size-3 text-emerald-600" />
                      <span>الهاتف:</span>
                    </span>
                    {lead.phone ? (
                      <span className="text-[11px] font-mono font-bold text-foreground dir-ltr">
                        {lead.phone}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                        لا يوجد هاتف مسجل
                      </span>
                    )}
                  </div>

                  {/* Website */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-bold">
                      <Globe className="size-3 text-purple-600" />
                      <span>الموقع:</span>
                    </span>
                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-purple-600 hover:text-purple-500 font-bold flex items-center gap-0.5 truncate max-w-[170px]"
                        title={lead.website}
                      >
                        <span className="truncate">{cleanDomain}</span>
                        <ExternalLink className="size-2.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                        لا يوجد موقع إلكتروني
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-bold">
                      <Mail className="size-3 text-blue-600" />
                      <span>البريد:</span>
                    </span>
                    {lead.email ? (
                      <span className="text-[11px] text-foreground font-mono font-medium truncate max-w-[170px]" title={lead.email}>
                        {lead.email}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                        لا يوجد بريد إلكتروني
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="pt-3 border-t border-border space-y-2">
                {/* Status Selector + Delete Lead */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-bold">حالة التواصل:</span>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={lead.outreachStatus}
                      onChange={(e) => onStatusChange(lead.id, e.target.value as OutreachStatus)}
                      className="px-2 py-0.5 rounded-lg bg-card-2 border border-border text-[10px] font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="new">جديدة (New)</option>
                      <option value="contacted_whatsapp">أُرسل واتساب</option>
                      <option value="contacted_email">أُرسل إيميل</option>
                      <option value="qualified">مؤهلة ومهتمة</option>
                      <option value="meeting_booked">حجز ديمو</option>
                      <option value="converted">تم التحويل</option>
                      <option value="archived">أرشيف</option>
                    </select>
                    {onDeleteLead && (
                      <button
                        type="button"
                        onClick={() => setLeadToDelete(lead)}
                        className="p-1 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="حذف هذه الشركة من قاعدة البيانات"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct Action Buttons: WhatsApp & Email */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* WhatsApp Action Button */}
                  <button
                    type="button"
                    onClick={() => onOpenWhatsApp(lead)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    title="مراسلة الشركة عبر واتساب من لوحة التحكم"
                  >
                    <MessageSquare className="size-3.5" />
                    <span>مراسلة واتس</span>
                  </button>

                  {/* Email Action Button */}
                  <button
                    type="button"
                    onClick={() => onOpenEmail(lead)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    title="إرسال بريد إلكتروني مباشر عبر خادم SMTP"
                  >
                    <Mail className="size-3.5" />
                    <span>مراسلة بريد</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* In-App Confirmation Modal for Lead Deletion */}
      <ConfirmDeleteModal
        isOpen={!!leadToDelete}
        onClose={() => setLeadToDelete(null)}
        onConfirm={() => {
          if (leadToDelete && onDeleteLead) {
            onDeleteLead(leadToDelete.id);
            setLeadToDelete(null);
          }
        }}
        title="حذف بطاقة الشركة نهائياً"
        description={`هل أنت متأكد من حذف شركة "${leadToDelete?.title || ""}" من قاعدة بيانات السكرابر؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="نعم، حذف الشركة"
        cancelLabel="إلغاء التراجع"
        isDestructive={true}
      />
    </div>
  );
}
