"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  AgencyExtraInput,
  AgencyExtraPackage,
  AgencyExtraService,
} from "@/types/agency-extra";

export function emptyDraft(): AgencyExtraInput {
  return {
    titleAr: "",
    titleEn: "",
    titleTr: "",
    descAr: "",
    descEn: "",
    descTr: "",
    priceType: "fixed",
    priceValue: 0,
    serviceTypes: ["flights"],
    isActive: true,
    sort: 100,
    icon: "star",
    kind: "other",
    termsAr: "",
    termsEn: "",
    termsTr: "",
  };
}

export function useAdminFlightExtras(fallbackLoadError = "فشل تحميل الخدمات الإضافية") {
  const [extras, setExtras] = useState<AgencyExtraPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<AgencyExtraInput>(emptyDraft);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/flight-extras", { cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean; extras?: AgencyExtraPackage[] };
      if (data.ok && Array.isArray(data.extras)) {
        setExtras(data.extras);
      } else {
        setMessage(fallbackLoadError);
      }
    } catch {
      setMessage(fallbackLoadError);
    } finally {
      setLoading(false);
    }
  }, [fallbackLoadError]);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = useCallback(() => {
    setDraft(emptyDraft());
    setEditingId("new");
    setMessage("");
  }, []);

  const openEdit = useCallback((pkg: AgencyExtraPackage) => {
    setDraft({ ...pkg });
    setEditingId(pkg.id);
    setMessage("");
  }, []);

  const closeEditor = useCallback(() => {
    setEditingId(null);
    setMessage("");
  }, []);

  const toggleService = useCallback((service: AgencyExtraService) => {
    setDraft((prev) => {
      const current = prev.serviceTypes || ["flights"];
      const next = current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service];
      return { ...prev, serviceTypes: next.length ? next : ["flights"] };
    });
  }, []);

  const saveDraft = useCallback(
    async (fallbackSaveError = "فشل الحفظ"): Promise<boolean> => {
      setSaving(true);
      setMessage("");
      try {
        const isNew = editingId === "new";
        const res = await fetch("/api/admin/flight-extras", {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isNew ? draft : { ...draft, id: editingId }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!data.ok) {
          setMessage(data.error || fallbackSaveError);
          return false;
        }
        setEditingId(null);
        await load();
        return true;
      } catch {
        setMessage(fallbackSaveError);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [editingId, draft, load]
  );

  const toggleActive = useCallback(
    async (pkg: AgencyExtraPackage) => {
      await fetch("/api/admin/flight-extras", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pkg, isActive: !pkg.isActive }),
      });
      await load();
    },
    [load]
  );

  const remove = useCallback(
    async (id: string) => {
      await fetch(`/api/admin/flight-extras?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      await load();
    },
    [load]
  );

  const reset = useCallback(async () => {
    await fetch("/api/admin/flight-extras", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    setEditingId(null);
    await load();
  }, [load]);

  return {
    extras,
    loading,
    saving,
    editingId,
    setEditingId,
    draft,
    setDraft,
    message,
    setMessage,
    load,
    openNew,
    openEdit,
    closeEditor,
    toggleService,
    saveDraft,
    toggleActive,
    remove,
    reset,
  };
}
