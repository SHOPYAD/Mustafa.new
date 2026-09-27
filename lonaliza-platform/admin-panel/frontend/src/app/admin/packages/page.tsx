// src/app/admin/packages/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Package,
    RotateCcw,
    Search,
    Star,
} from "lucide-react";
import { deletePackage, resetPackages, savePackages } from "@/data/packages";
import { fetchPublishedPackages } from "@/data/packages-client";
import {
    deleteAdminPackage,
    persistAdminPackage,
    resetAdminPackages,
    syncLocalPackagesToServer,
} from "@/data/packages-admin";
import { type HolidayPackage } from "@/types/package";
import PackageFormModal from "@/components/admin/PackageFormModal";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import { normalizeImportedPackage } from "@/lib/import-normalize";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import WhiteLabelUpgradeOverlay from "@/components/admin/WhiteLabelUpgradeOverlay";
import { AdminKpi, AdminKpiStrip, AdminPage, AdminPageHeader } from "@/components/admin/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminPackagesPage() {
    const { t, locale } = useLocale();
    const [packages, setPackages] = useState<HolidayPackage[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPkg, setEditingPkg] = useState<HolidayPackage | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        void (async () => {
            try {
                const synced = await syncLocalPackagesToServer();
                setPackages(synced);
            } catch {
                const fallback = await fetchPublishedPackages();
                setPackages(fallback);
            }
        })();
    }, []);

    const refresh = () => {
        void fetchPublishedPackages().then((list) => {
            savePackages(list);
            setPackages(list);
        });
    };

    const handleAdd = async (data: Omit<HolidayPackage, "id">) => {
        await persistAdminPackage({
            ...data,
            isPublished: true,
            createdAt: new Date().toISOString(),
        });
        refresh();
    };

    const handleUpdate = async (data: Omit<HolidayPackage, "id">) => {
        if (!editingPkg) return;
        await persistAdminPackage({ ...editingPkg, ...data, id: editingPkg.id });
        setEditingPkg(null);
        refresh();
    };

    const handleDelete = async (id: string) => {
        setPackages((prev) => prev.filter((p) => p.id !== id));
        setDeleteConfirmId(null);
        try {
            await deleteAdminPackage(id);
        } catch (e) {
            console.error("Delete package error:", e);
        }
        deletePackage(id);
        refresh();
    };

    const handleReset = async () => {
        try {
            await resetAdminPackages();
        } catch {
            /* keep local reset */
        }
        resetPackages();
        setShowResetConfirm(false);
        refresh();
    };

    const filtered = packages.filter(
        (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminPage className="flex flex-col gap-6">
            <WhiteLabelUpgradeOverlay moduleName="البرامج السياحية">
            <AdminPageHeader
                title={locale === "ar" ? "البرامج السياحية" : "Holiday packages"}
                description={locale === "ar" ? "إدارة الباقات المنشورة على الموقع." : "Manage published holiday packages."}
                icon={<Package className="size-5" />}
                actions={
                    <>
                        <Button type="button" onClick={() => { setEditingPkg(null); setIsModalOpen(true); }}>
                            <Plus size={14} />
                            {locale === "ar" ? "إضافة باقة" : "Add package"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowResetConfirm(true)}>
                            <RotateCcw size={14} />
                            {locale === "ar" ? "استعادة الافتراضي" : "Reset"}
                        </Button>
                    </>
                }
            />
            <ServiceImportChat
                serviceType="package"
                onApply={async (item) => {
                    const normalized = normalizeImportedPackage(item);
                    await persistAdminPackage({
                        ...normalized,
                        isPublished: true,
                        isFeatured: normalized.isFeatured !== false,
                        createdAt: new Date().toISOString(),
                    });
                    refresh();
                }}
            />

            <AdminKpiStrip cols={3}>
                <AdminKpi label="Total" value={packages.length} />
                <AdminKpi label={t.common.featured} value={packages.filter((p) => p.isFeatured).length} />
                <AdminKpi label="Countries" value={new Set(packages.map((p) => p.country)).size} />
            </AdminKpiStrip>

            <Card>
                <CardContent className="space-y-4 pt-6">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-10" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title, destination, or country..." />
                </div>
                {filtered.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyTitle>No packages found</EmptyTitle>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <>
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Package</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>{t.common.days}</TableHead>
                                        <TableHead>{t.common.price}</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Amenities</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((pkg) => (
                                        <TableRow key={pkg.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {pkg.images[0] ? (
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={pkg.images[0].url} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : null}
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate">{tContent(pkg, "title", locale) || pkg.title}</p>
                                                        {pkg.isFeatured ? <Badge variant="secondary">{t.common.featured}</Badge> : null}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{tContent(pkg, "destination", locale) || pkg.destination}, {tContent(pkg, "country", locale) || pkg.country}</TableCell>
                                            <TableCell>{pkg.durationDays} {t.common.days}</TableCell>
                                            <TableCell className="font-bold">${pkg.price.toLocaleString()}</TableCell>
                                            <TableCell><span className="inline-flex items-center gap-1"><Star size={12} className="fill-current" />{pkg.rating}</span></TableCell>
                                            <TableCell className="max-w-[14rem] truncate text-xs text-muted-foreground">{pkg.amenities.join(", ")}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1.5">
                                                    <Button type="button" size="sm" variant="outline" onClick={() => { setEditingPkg(pkg); setIsModalOpen(true); }} title="Edit"><Pencil size={14} /></Button>
                                                    {deleteConfirmId === pkg.id ? (
                                                        <>
                                                            <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(pkg.id)}>Confirm</Button>
                                                            <Button type="button" size="sm" variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                                                        </>
                                                    ) : (
                                                        <Button type="button" size="sm" variant="destructive" onClick={() => setDeleteConfirmId(pkg.id)} title="Delete"><Trash2 size={14} /></Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="grid gap-3 md:hidden">
                            {filtered.map((pkg) => (
                                <Card key={`m-${pkg.id}`}>
                                    <CardContent className="space-y-2 pt-4">
                                    <p className="font-semibold">{tContent(pkg, "title", locale) || pkg.title}</p>
                                    <p className="text-sm text-muted-foreground">{tContent(pkg, "destination", locale) || pkg.destination} · ${pkg.price.toLocaleString()}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Button type="button" size="sm" variant="outline" onClick={() => { setEditingPkg(pkg); setIsModalOpen(true); }}>Edit</Button>
                                        <Button type="button" size="sm" variant="destructive" onClick={() => setDeleteConfirmId(pkg.id)}>Delete</Button>
                                    </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
                </CardContent>
            </Card>

            <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset All Packages</DialogTitle>
                        <DialogDescription>All custom package data will be lost. This cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
                        <Button type="button" variant="destructive" onClick={handleReset}>Reset All</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            </WhiteLabelUpgradeOverlay>

            <PackageFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingPkg(null); }}
                onSubmit={editingPkg ? handleUpdate : handleAdd}
                editPackage={editingPkg}
            />
        </AdminPage>
    );
}
