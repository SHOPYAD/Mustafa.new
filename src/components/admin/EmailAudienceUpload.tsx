"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import type { AudienceParseResult } from "@/lib/email/parse-audience";
import { parseCsvAudienceFile } from "@/lib/email/parse-audience";

const dropClass =
  "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed min-h-[220px] px-6 py-10 text-center transition-colors";

function fileKind(file: File): "csv" | "xlsx" | "xls" | "other" {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || file.type === "text/csv" || file.type === "text/plain") {
    return "csv";
  }
  if (
    name.endsWith(".xlsx") ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "xlsx";
  }
  if (name.endsWith(".xls") || file.type === "application/vnd.ms-excel") {
    return "xls";
  }
  return "other";
}

export default function EmailAudienceUpload({
  ar,
  result,
  onParsed,
  onClear,
}: {
  ar: boolean;
  result: AudienceParseResult | null;
  onParsed: (parsed: AudienceParseResult) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setBusy(true);
    try {
      const kind = fileKind(file);
      if (kind === "xls") {
        throw new Error(
          ar
            ? "صيغة ‎.xls القديمة غير مدعومة. احفظ الملف كـ CSV أو XLSX."
            : "Legacy .xls is not supported. Save as CSV or XLSX."
        );
      }
      if (kind === "other") {
        throw new Error(ar ? "ارفع ملف CSV أو XLSX فقط." : "Upload a CSV or XLSX file only.");
      }
      if (kind === "csv") {
        const text = await file.text();
        const parsed = parseCsvAudienceFile(text, file.name);
        if (parsed.rows.length === 0) {
          throw new Error(ar ? "الملف فارغ أو بلا صفوف." : "The file has no rows.");
        }
        onParsed(parsed);
        return;
      }
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/email-campaigns/parse-file", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as { result?: AudienceParseResult; error?: string };
      if (!res.ok || !json.result) {
        throw new Error(json.error || (ar ? "تعذّر قراءة Excel" : "Could not read Excel"));
      }
      if (json.result.rows.length === 0) {
        throw new Error(ar ? "الملف فارغ أو بلا صفوف." : "The file has no rows.");
      }
      onParsed(json.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : ar ? "فشل رفع الملف" : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`${dropClass} ${
          dragging
            ? "border-amber-400 bg-amber-500/10"
            : "border-white/20 bg-white/[0.02] hover:border-amber-400/50"
        }`}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        {busy ? (
          <Loader2 size={36} className="animate-spin text-amber-300" />
        ) : (
          <FileSpreadsheet size={40} className="text-amber-300" />
        )}
        <div>
          <p className="text-white font-semibold">
            {ar ? "اسحب ملف العناوين هنا" : "Drop the audience file here"}
          </p>
          <p className="text-sm text-white/45 mt-1">
            {ar ? "أو استخدم الزر لاختيار ملف CSV / Excel" : "or choose a CSV / Excel file"}
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-sm disabled:opacity-40"
        >
          <Upload size={16} />
          {ar ? "اختر ملف CSV" : "Choose CSV file"}
        </button>
        <p className="text-[12px] text-white/40 max-w-lg leading-6">
          {ar
            ? "الأعمدة المتوقعة: email إلزامي، name أو full_name، company أو company_name (اختياري). تُقبل الرؤوس العربية: البريد، الاسم، الشركة. الصيغ: ‎.csv و ‎.xlsx"
            : "Expected columns: email (required), name or full_name, company or company_name (optional). Arabic headers البريد / الاسم / الشركة are accepted. Formats: .csv and .xlsx"}
        </p>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      {result && (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <p className="text-sm text-emerald-200">
              {ar
                ? `تم رفع ${result.fileName || "الملف"} بنجاح: ${result.validCount} صفاً صالحاً / ${result.rejectedCount} مرفوضاً. البريد غير الصالح يُعلَّم ولن يُرسل.`
                : `Uploaded ${result.fileName || "file"}: ${result.validCount} valid / ${result.rejectedCount} rejected. Invalid emails are flagged and will not be sent.`}
            </p>
            <button
              type="button"
              onClick={onClear}
              className="text-emerald-100/70 hover:text-white"
              title={ar ? "مسح الملف" : "Clear file"}
            >
              <X size={16} />
            </button>
          </div>

          <div className="overflow-x-auto max-h-[28rem] rounded-xl border border-white/10">
            <table className="w-full text-sm text-right">
              <thead className="bg-white/[0.04] text-white/50 text-xs">
                <tr>
                  <th className="px-3 py-2 font-medium">{ar ? "البريد" : "Email"}</th>
                  <th className="px-3 py-2 font-medium">{ar ? "الاسم" : "Name"}</th>
                  <th className="px-3 py-2 font-medium">{ar ? "الشركة" : "Company"}</th>
                  <th className="px-3 py-2 font-medium">{ar ? "ملاحظات" : "Notes"}</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, idx) => (
                  <tr
                    key={`${row.email}-${idx}`}
                    className={
                      row.valid
                        ? "border-t border-white/5 text-white/80"
                        : "border-t border-red-500/10 bg-red-500/5 text-red-200"
                    }
                  >
                    <td className="px-3 py-2 font-mono text-[12px] whitespace-nowrap">
                      {row.rawEmail || row.email || "—"}
                    </td>
                    <td className="px-3 py-2">{row.name || "—"}</td>
                    <td className="px-3 py-2">{row.company || "—"}</td>
                    <td className="px-3 py-2 text-xs">
                      {row.note || (ar ? "جاهز للإرسال" : "Ready")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
