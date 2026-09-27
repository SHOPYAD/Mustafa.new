"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Hotel,
  RotateCcw,
  Search,
  Star,
  Sparkles,
  Building2,
  CheckSquare,
  Square,
  ExternalLink,
  MapPin,
  CheckCircle2,
  X,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import {
  getHotels,
  addHotel,
  updateHotel,
  deleteHotel,
  resetHotels,
} from "@/data/hotels";
import type { Hotel as HotelType, HotelInput } from "@/types/hotel";
import HotelFormModal from "@/components/admin/HotelFormModal";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import BulkHotelImporterModal from "@/components/admin/BulkHotelImporterModal";
import HotelSyncDaemonController from "@/components/admin/HotelSyncDaemonController";
import { normalizeImportedHotel } from "@/lib/import-normalize";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  AdminKpi,
  AdminKpiStrip,
  AdminPage,
  AdminPageHeader,
} from "@/components/admin/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function AdminHotelsCatalogPage({ embedded = false }: { embedded?: boolean }) {
  const { t } = useLocale();
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelType | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isAiImporterOpen, setIsAiImporterOpen] = useState(false);

  useEffect(() => {
    setHotels(getHotels());
  }, []);

  const refresh = () => {
    const list = getHotels();
    setHotels(list);
    setSelectedHotelIds((prev) => prev.filter((id) => list.some((h) => h.id === id)));
  };

  const handleAdd = (data: HotelInput) => {
    addHotel(data);
    refresh();
  };

  const handleUpdate = (data: HotelInput) => {
    if (editingHotel) {
      updateHotel(editingHotel.id, data);
      setEditingHotel(null);
      refresh();
    }
  };

  const handleDelete = (id: string) => {
    setHotels((prev) => prev.filter((h) => h.id !== id));
    deleteHotel(id);
    setDeleteConfirmId(null);
    refresh();
  };

  const handleBulkDelete = () => {
    if (selectedHotelIds.length > 0) {
      selectedHotelIds.forEach((id) => deleteHotel(id));
      setSelectedHotelIds([]);
    } else {
      hotels.forEach((h) => deleteHotel(h.id));
    }
    setShowBulkDeleteConfirm(false);
    refresh();
  };

  const handleReset = () => {
    resetHotels();
    setShowResetConfirm(false);
    setSelectedHotelIds([]);
    refresh();
  };

  const toggleActive = (hotel: HotelType) => {
    updateHotel(hotel.id, { isActive: !hotel.isActive });
    refresh();
  };

  const toggleFeatured = (hotel: HotelType) => {
    updateHotel(hotel.id, { isFeatured: !hotel.isFeatured });
    refresh();
  };

  const toggleSelectAll = () => {
    if (selectedHotelIds.length === filtered.length) {
      setSelectedHotelIds([]);
    } else {
      setSelectedHotelIds(filtered.map((h) => h.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedHotelIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePublishBulk = (importedHotels: HotelInput[]) => {
    importedHotels.forEach((item) => {
      addHotel(item);
    });
    refresh();
  };

  // Extract unique cities
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    hotels.forEach((h) => {
      if (h.city) set.add(h.city.trim());
    });
    return Array.from(set);
  }, [hotels]);

  // Filtered hotels list
  const filtered = useMemo(() => {
    return hotels.filter((h) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        h.nameEn.toLowerCase().includes(q) ||
        h.nameAr.includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.whatsappNumber.includes(q.replace(/\D/g, ""));

      const matchesStar =
        starFilter === "all" ||
        (starFilter === "5" && h.stars >= 5) ||
        (starFilter === "4" && h.stars === 4) ||
        (starFilter === "featured" && h.isFeatured);

      const matchesCity = cityFilter === "all" || h.city.toLowerCase() === cityFilter.toLowerCase();

      return matchesSearch && matchesStar && matchesCity;
    });
  }, [hotels, searchQuery, starFilter, cityFilter]);

  const activeCount = hotels.filter((h) => h.isActive).length;
  const fiveStarCount = hotels.filter((h) => h.stars >= 5).length;

  const actionButtons = (
    <>
      <Button
        type="button"
        onClick={() => {
          setEditingHotel(null);
          setIsModalOpen(true);
        }}
      >
        <Plus className="size-4" />
        إضافة فندق جديد
      </Button>
      <Button type="button" variant="outline" onClick={() => setIsBulkModalOpen(true)}>
        <Sparkles className="size-4" />
        استيراد جماعي بالـ AI
      </Button>
      <Button type="button" variant="outline" onClick={() => setIsAiImporterOpen((prev) => !prev)}>
        <Sparkles className="size-3.5" />
        شات الاستيراد الفردي
        <ChevronDown className={`size-3 transition-transform ${isAiImporterOpen ? "rotate-180" : ""}`} />
      </Button>
      <Button type="button" variant="outline" onClick={() => setShowResetConfirm(true)}>
        <RotateCcw className="size-3.5" />
        إعادة ضبط
      </Button>
      {hotels.length > 0 ? (
        <Button type="button" variant="destructive" onClick={() => setShowBulkDeleteConfirm(true)}>
          <Trash2 className="size-3.5" />
          {selectedHotelIds.length > 0
            ? `حذف المحدد (${selectedHotelIds.length})`
            : "حذف جماعي للكل"}
        </Button>
      ) : null}
    </>
  );

  const inner = (
    <>
      {embedded ? (
        <div className="flex flex-wrap items-center justify-end gap-2">{actionButtons}</div>
      ) : (
        <AdminPageHeader
          icon={<Building2 className="size-5" />}
          title="الكتالوج الداخلي للفنادق"
          description={
            <>
              إدارة فنادق الوكالة الخاصة وتحديثات الأسعار اللحظية.
              <span className="ms-2">{hotels.length} فندق</span>
              <Link href="/admin/hotels" className="ms-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                مزودو الفنادق والمارك أب
                <ExternalLink className="size-3" />
              </Link>
            </>
          }
          actions={actionButtons}
        />
      )}

      <AdminKpiStrip cols={4}>
        <AdminKpi label="إجمالي فنادق الكتالوج" value={hotels.length} icon={<Building2 className="size-4" />} />
        <AdminKpi label="الفنادق النشطة للعملاء" value={activeCount} icon={<CheckCircle2 className="size-4" />} />
        <AdminKpi label="فنادق 5 نجوم" value={fiveStarCount} icon={<Star className="size-4" />} />
        <AdminKpi label="المدن والوجهات" value={`${uniqueCities.length}`} hint="وجهات مغطاة" icon={<MapPin className="size-4" />} />
      </AdminKpiStrip>

      <HotelSyncDaemonController />

      {isAiImporterOpen ? (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4" />
                شات استيراد فندق منفرد
              </CardTitle>
              <CardDescription>
                الصقوا رابط الفندق من Booking أو Tripadvisor لاستخراج البيانات والصور.
              </CardDescription>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setIsAiImporterOpen(false)}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ServiceImportChat
              serviceType="hotel"
              onApply={(data: Record<string, unknown>) => {
                const normalized = normalizeImportedHotel(data);
                handleAdd(normalized);
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث باسم الفندق، المدينة، أو رقم الواتساب..."
                className="ps-10"
              />
            </div>
            <Badge variant="secondary">
              نتائج: {filtered.length} من {hotels.length}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={starFilter === "all" && cityFilter === "all" ? "default" : "outline"}
              onClick={() => {
                setStarFilter("all");
                setCityFilter("all");
              }}
            >
              الكل ({hotels.length})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={starFilter === "5" ? "default" : "outline"}
              onClick={() => setStarFilter(starFilter === "5" ? "all" : "5")}
            >
              5 نجوم ({fiveStarCount})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={starFilter === "4" ? "default" : "outline"}
              onClick={() => setStarFilter(starFilter === "4" ? "all" : "4")}
            >
              4 نجوم
            </Button>
            {uniqueCities.map((c) => (
              <Button
                key={c}
                type="button"
                size="sm"
                variant={cityFilter === c ? "default" : "outline"}
                onClick={() => setCityFilter(cityFilter === c ? "all" : c)}
              >
                {c}
              </Button>
            ))}
          </div>
          {selectedHotelIds.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 px-3 py-2">
              <p className="text-xs font-semibold">
                تم تحديد {selectedHotelIds.length} فندق من أصل {filtered.length}
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedHotelIds([])}>
                  إلغاء التحديد
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={() => setShowBulkDeleteConfirm(true)}>
                  <Trash2 className="size-3.5" />
                  حذف المحدد
                </Button>
              </div>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="px-0">
          {filtered.length === 0 ? (
            <Empty className="mx-6 mb-6">
              <EmptyHeader>
                <EmptyTitle>لا توجد فنادق تطابق معايير البحث الحالية.</EmptyTitle>
                <EmptyDescription>غيّروا المرشّحات أو أضيفوا فندقاً جديداً.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">
                        <button type="button" onClick={toggleSelectAll} title="تحديد الكل">
                          {selectedHotelIds.length === filtered.length && filtered.length > 0 ? (
                            <CheckSquare className="size-4 text-primary" />
                          ) : (
                            <Square className="size-4 text-muted-foreground" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>الفندق</TableHead>
                      <TableHead>المدينة</TableHead>
                      <TableHead>التصنيف</TableHead>
                      <TableHead>الغرف</TableHead>
                      <TableHead>واتساب</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((hotel) => {
                      const isSelected = selectedHotelIds.includes(hotel.id);
                      return (
                        <TableRow key={`desk-${hotel.id}`}>
                          <TableCell className="text-center">
                            <button type="button" onClick={() => toggleSelectOne(hotel.id)}>
                              {isSelected ? (
                                <CheckSquare className="size-4 text-primary" />
                              ) : (
                                <Square className="size-4 text-muted-foreground" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {hotel.images?.[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={hotel.images[0]} alt={hotel.nameAr} className="size-12 rounded-xl object-cover border shrink-0 no-theme-image" />
                              ) : (
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted">
                                  <Hotel className="size-5 text-muted-foreground" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="truncate font-semibold">{hotel.nameAr || hotel.nameEn}</div>
                                <div className="truncate font-mono text-[11px] text-muted-foreground">{hotel.nameEn}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{hotel.city}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-0.5 font-semibold">
                              {hotel.stars} <Star className="size-3.5 fill-current" />
                            </span>
                          </TableCell>
                          <TableCell className="font-mono">{hotel.rooms?.length || 0}</TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground">
                            {hotel.whatsappNumber || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={hotel.isActive ? "secondary" : "outline"}>
                              {hotel.isActive ? "نشط" : "معطل"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button type="button" variant="ghost" size="icon-sm">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toggleFeatured(hotel)}>
                                  {hotel.isFeatured ? "إلغاء التمييز" : "تمييز"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleActive(hotel)}>
                                  {hotel.isActive ? "تعطيل" : "تفعيل"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingHotel(hotel);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  تعديل
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/hotels/${hotel.slug || hotel.id}`} target="_blank">
                                    معاينة
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem variant="destructive" onClick={() => setDeleteConfirmId(hotel.id)}>
                                  حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="grid gap-3 px-4 pb-4 md:hidden">
                {filtered.map((hotel) => (
                  <Card key={`mob-${hotel.id}`}>
                    <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-sm">{hotel.nameAr || hotel.nameEn}</CardTitle>
                        <CardDescription>
                          {hotel.city} · {hotel.stars}★ · {hotel.rooms?.length || 0} غرف
                        </CardDescription>
                      </div>
                      <button type="button" onClick={() => toggleSelectOne(hotel.id)}>
                        {selectedHotelIds.includes(hotel.id) ? (
                          <CheckSquare className="size-4 text-primary" />
                        ) : (
                          <Square className="size-4 text-muted-foreground" />
                        )}
                      </button>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingHotel(hotel);
                          setIsModalOpen(true);
                        }}
                      >
                        تعديل
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => toggleActive(hotel)}>
                        {hotel.isActive ? "تعطيل" : "تفعيل"}
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteConfirmId(hotel.id)}>
                        حذف
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isModalOpen ? (
        <HotelFormModal
          isOpen={isModalOpen}
          editHotel={editingHotel}
          onSubmit={(data: HotelInput) => {
            if (editingHotel) {
              handleUpdate(data);
            } else {
              handleAdd(data);
            }
            setIsModalOpen(false);
          }}
          onClose={() => {
            setIsModalOpen(false);
            setEditingHotel(null);
          }}
        />
      ) : null}

      {isBulkModalOpen ? (
        <BulkHotelImporterModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onPublishAll={handlePublishBulk}
        />
      ) : null}

      <Dialog open={Boolean(deleteConfirmId)} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حذف الفندق</DialogTitle>
            <DialogDescription>
              سيتم إزالة الفندق وغرفه وصوره كلياً من الكتالوج الداخلي.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteConfirmId(null)}>
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف الجماعي</DialogTitle>
            <DialogDescription>
              {selectedHotelIds.length > 0
                ? `سيتم حذف ${selectedHotelIds.length} فندق محدد دفعة واحدة`
                : "سيتم حذف جميع فنادق الكتالوج الداخلي دفعة واحدة"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowBulkDeleteConfirm(false)}>
              إلغاء
            </Button>
            <Button type="button" variant="destructive" onClick={handleBulkDelete}>
              حذف جماعي فوراً
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إعادة ضبط الكتالوج</DialogTitle>
            <DialogDescription>
              سيتم استعادة كافة الفنادق والغرف والصور الأصلية للمنصة.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowResetConfirm(false)}>
              إلغاء
            </Button>
            <Button type="button" onClick={handleReset}>
              نعم، استعادة الافتراضي
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  if (embedded) {
    return (
      <div className="flex flex-col gap-5" dir="rtl">
        {inner}
      </div>
    );
  }

  return <AdminPage className="space-y-6" dir="rtl">{inner}</AdminPage>;
}
