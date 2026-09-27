"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CardRow = { id: string; code: string; amount: number; status: string; purchaserId: string };

export default function AdminGiftCardsPage() {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [amount, setAmount] = useState(50);

  async function load() {
    const res = await fetch("/api/admin/gift-cards", { credentials: "same-origin" });
    const data = await res.json();
    if (data.ok) setCards(data.cards || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminPage className="flex flex-col gap-6">
      <AdminPageHeader
        breadcrumb={<span>لوحة التحكم <span className="mx-1 opacity-50">/</span> بطاقات الهدايا</span>}
        title="بطاقات الهدايا"
        description="إصدار وإبطال بطاقات الهدايا القائمة دون تغيير مسار الـ API."
        icon={<Gift size={20} />}
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="max-w-40"
            />
            <Button
              type="button"
              onClick={async () => {
                await fetch("/api/admin/gift-cards", {
                  method: "POST",
                  credentials: "same-origin",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ amount }),
                });
                await load();
              }}
            >
              إصدار يدوي
            </Button>
          </div>
          {cards.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>لا بطاقات</EmptyTitle>
                <EmptyDescription>أصدروا بطاقة للبدء.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الرمز</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.code}</TableCell>
                    <TableCell>${c.amount}</TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell>
                      {c.status === "active" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            await fetch("/api/admin/gift-cards", {
                              method: "POST",
                              credentials: "same-origin",
                              headers: { "content-type": "application/json" },
                              body: JSON.stringify({ action: "void", id: c.id }),
                            });
                            await load();
                          }}
                        >
                          إبطال
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminPage>
  );
}
