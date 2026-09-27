// src/app/admin/visa/page.tsx
"use client";

import { useState, useEffect, Fragment } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Globe,
    RotateCcw,
    Search,
    ChevronDown,
    FileText,
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
import {
  AdminKpi,
  AdminKpiStrip,
  AdminPage,
  AdminPageHeader,
} from "@/components/admin/layout";
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

    const filtered = visaData.filter(
        (v) => v.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalVisaTypes = visaData.reduce((sum, c) => sum + c.types.length, 0);

    return (
        <AdminPage className="flex flex-col gap-6">
            <AdminPageHeader
                icon={<Globe className="size-5" />}
                title="Visa Management"
                description="Manage visa services, prices, and processing times"
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => setShowResetConfirm(true)}>
                            <RotateCcw size={14} />
                            Reset
                        </Button>
                        <Button type="button" onClick={() => { setEditingCountry(null); setIsModalOpen(true); }}>
                            <Plus size={18} />
                            Add Country
                        </Button>
                    </>
                }
            />

            <ServiceImportChat
                serviceType="visa"
                onApply={(item) => {
                    const { id: _id, ...visaInput } = normalizeImportedVisa(item);
                    addVisaCountry(visaInput);
                    refresh();
                }}
            />

            <AdminKpiStrip cols={3}>
                <AdminKpi label="Countries" value={visaData.length} />
                <AdminKpi label="Active" value={visaData.filter((v) => v.isActive !== false).length} />
                <AdminKpi label="Visa Types" value={totalVisaTypes} />
            </AdminKpiStrip>

            <Card>
                <CardContent className="space-y-4 pt-6">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by country name..." className="pl-10" />
                </div>
                {filtered.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyTitle>No countries found</EmptyTitle>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <>
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>الدولة</TableHead>
                                        <TableHead>الأنواع</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead>إجراء</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((country) => (
                                        <Fragment key={country.id}>
                                        <TableRow className={country.isActive === false ? "opacity-60" : ""}>
                                            <TableCell>
                                                <button type="button" onClick={() => setExpandedId(expandedId === country.id ? null : country.id)} className="flex items-center gap-3 text-start">
                                                    <span className="text-2xl">{country.flag}</span>
                                                    <span className="font-semibold">{country.country}</span>
                                                    <ChevronDown size={16} className={expandedId === country.id ? "rotate-180" : ""} />
                                                </button>
                                            </TableCell>
                                            <TableCell>{country.types.length}</TableCell>
                                            <TableCell>
                                                <Button type="button" size="sm" variant="outline" onClick={() => handleToggle(country)}>
                                                    {country.isActive === false ? "معطل" : "نشط"}
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1.5">
                                                    <Button type="button" size="sm" variant="outline" onClick={() => { setEditingCountry(country); setIsModalOpen(true); }} title="Edit">
                                                        <Pencil size={14} />
                                                    </Button>
                                                    {deleteConfirmId === country.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(country.id)}>Confirm</Button>
                                                            <Button type="button" size="sm" variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                                                        </div>
                                                    ) : (
                                                        <Button type="button" size="sm" variant="destructive" onClick={() => setDeleteConfirmId(country.id)} title="Delete">
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {expandedId === country.id ? (
                                            <TableRow>
                                                <TableCell colSpan={4}>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>النوع</TableHead>
                                                                <TableHead>المدة</TableHead>
                                                                <TableHead>السعر</TableHead>
                                                                <TableHead>المعالجة</TableHead>
                                                                <TableHead>المزايا</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                                {country.types.map((visa, idx) => (
                                                                    <TableRow key={idx}>
                                                                        <TableCell>
                                                                            <span className="inline-flex items-center gap-2">
                                                                                <FileText size={14} />
                                                                                {visa.name}
                                                                            </span>
                                                                        </TableCell>
                                                                        <TableCell>{visa.duration}</TableCell>
                                                                        <TableCell className="font-bold">{visa.price}</TableCell>
                                                                        <TableCell>{visa.processingTime}</TableCell>
                                                                        <TableCell>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {visa.features.map((f, i) => (
                                                                                    <Badge key={i} variant="secondary">{f}</Badge>
                                                                                ))}
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableCell>
                                            </TableRow>
                                        ) : null}
                                        </Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="grid gap-3 md:hidden">
                            {filtered.map((country) => (
                                <article key={`m-${country.id}`} className="rounded-xl border bg-card p-4 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <button type="button" onClick={() => setExpandedId(expandedId === country.id ? null : country.id)} className="flex items-center gap-2 text-start">
                                            <span className="text-2xl">{country.flag}</span>
                                            <span className="font-semibold">{country.country}</span>
                                        </button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => handleToggle(country)}>
                                            {country.isActive === false ? "معطل" : "نشط"}
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">الأنواع: {country.types.length}</p>
                                    {expandedId === country.id ? (
                                        <div className="space-y-2">
                                            {country.types.map((visa, idx) => (
                                                <div key={idx} className="rounded-xl border p-3">
                                                    <p className="font-semibold">{visa.name}</p>
                                                    <p className="text-sm">{visa.price}</p>
                                                    <p className="text-xs text-muted-foreground">{visa.duration} · {visa.processingTime}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                    <div className="flex flex-wrap gap-2">
                                        <Button type="button" size="sm" variant="outline" onClick={() => { setEditingCountry(country); setIsModalOpen(true); }}>تعديل</Button>
                                        <Button type="button" size="sm" variant="destructive" onClick={() => setDeleteConfirmId(country.id)}>حذف</Button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
                </CardContent>
            </Card>

            {/* Reset Modal */}
            <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset All Visa Data</DialogTitle>
                        <DialogDescription>All custom visa data will be lost. This cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
                        <Button type="button" variant="destructive" onClick={handleReset}>Reset All</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <VisaFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingCountry(null); }}
                onSubmit={editingCountry ? handleUpdate : handleAdd}
                editCountry={editingCountry}
            />
        </AdminPage>
    );
}
