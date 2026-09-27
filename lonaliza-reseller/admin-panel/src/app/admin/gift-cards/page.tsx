"use client";

import { useEffect, useState, useMemo } from "react";
import { Gift, Plus, Ban, CheckCircle2, Ticket, DollarSign } from "lucide-react";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseDataTable,
  EnterpriseStatusBadge,
  type ColumnDef,
} from "@/components/admin/enterprise";
import { Button } from "@/components/ui/button";

type CardRow = { id: string; code: string; amount: number; status: string; purchaserId: string };

export default function AdminGiftCardsPage() {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [amount, setAmount] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gift-cards", { credentials: "same-origin" });
      const data = await res.json();
      if (data.ok) setCards(data.cards || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const handleIssue = async () => {
    await fetch("/api/admin/gift-cards", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    void load();
  };

  const handleVoid = async (id: string) => {
    await fetch(`/api/admin/gift-cards?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    void load();
  };

  const activeCount = cards.filter((c) => c.status === "active").length;
  const totalValue = cards.reduce((acc, c) => acc + (c.amount || 0), 0);

  const filtered = useMemo(() => {
    return cards.filter(
      (c) =>
        !searchQuery ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.includes(searchQuery)
    );
  }, [cards, searchQuery]);

  const columns: ColumnDef<CardRow>[] = [
    {
      key: "code",
      header: "كود البطاقة",
      render: (c) => (
        <div className="flex items-center gap-2 font-mono font-bold text-primary py-1">
          <Ticket size={14} />
          <span>{c.code}</span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "القيمة المالية",
      sortable: true,
      render: (c) => (
        <span className="font-bold text-foreground text-sm tabular-nums">
          ${c.amount}
        </span>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      align: "center",
      render: (c) => (
        <EnterpriseStatusBadge
          variant={c.status === "active" ? "success" : c.status === "redeemed" ? "royal" : "danger"}
          label={c.status === "active" ? "صالحة للاستخدام" : c.status === "redeemed" ? "تم استخدامها" : "ملغاة"}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (c) => (
        <div className="flex justify-end">
          {c.status === "active" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs h-8 gap-1"
              onClick={() => void handleVoid(c.id)}
            >
              <Ban size={13} />
              <span>إبطال البطاقة</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <EnterprisePageHeader
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "المالية والخزينة", href: "/admin/gift-cards" },
          { label: "بطاقات الهدايا والقسائم" },
        ]}
        icon={<Gift className="h-6 w-6 text-primary" />}
        title="بطاقات الهدايا وقسائم الرصيد"
        subtitle="إصدار بطاقات الهدايا الرقمية بمبالغ محددة، تتبع حالات الصرف، وإبطال البطاقات غير المستخدمة."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/80 px-2 py-1">
              <span className="text-xs text-muted-foreground">$</span>
              <input
                type="number"
                min={10}
                step={10}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-16 bg-transparent text-xs font-bold text-foreground focus:outline-none"
              />
            </div>
            <Button
              type="button"
              onClick={() => void handleIssue()}
              className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20 gap-1.5 h-10 px-4"
            >
              <Plus size={15} />
              <span>إصدار بطاقة هدايا</span>
            </Button>
          </div>
        }
      />

      {/* KPI Grid */}
      <EnterpriseKpiGrid columns={3}>
        <EnterpriseKpiCard
          title="إجمالي البطاقات الصادرة"
          value={cards.length}
          subValue="بطاقة وقسيمة"
          icon={<Gift className="size-5" />}
          color="purple"
        />
        <EnterpriseKpiCard
          title="البطاقات الصالحة للاستخدام"
          value={activeCount}
          subValue="جاهزة للشراء"
          icon={<CheckCircle2 className="size-5" />}
          color="emerald"
        />
        <EnterpriseKpiCard
          title="القيمة الإجمالية المصدرة"
          value={`$${totalValue.toLocaleString()}`}
          subValue="رصيد هدايا للعملاء"
          icon={<DollarSign className="size-5" />}
          color="amber"
        />
      </EnterpriseKpiGrid>

      {/* Filter Bar */}
      <EnterpriseFilterBar
        searchPlaceholder="البحث برمز البطاقة أو المعرف..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        totalResults={filtered.length}
      />

      {/* Data Table */}
      <EnterpriseDataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        keyField="id"
        isLoading={loading}
        pageSize={10}
        emptyTitle="لا توجد بطاقات هدايا صادرة"
        emptyDescription="قوموا بإصدار بطاقات هدايا بمبالغ محددة لإهدائها للعملاء أو استخدامها كقسائم ترويجية."
      />
    </div>
  );
}
