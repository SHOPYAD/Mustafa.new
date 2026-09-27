// src/app/admin/tours/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    MapPin,
    RotateCcw,
    Search,
    AlertTriangle,
    Star,
    Sunrise,
    Sunset,
    Moon,
} from "lucide-react";
import { addTour, updateTour, deleteTour, resetTours, fetchAdminTours, type Tour } from "@/data/tours";
import TourFormModal from "@/components/admin/TourFormModal";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import { normalizeImportedTour } from "@/lib/import-normalize";
import WhiteLabelUpgradeOverlay from "@/components/admin/WhiteLabelUpgradeOverlay";
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

export default function AdminToursPage() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTour, setEditingTour] = useState<Tour | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        void fetchAdminTours().then(setTours);
    }, []);

    const refresh = () => {
        void fetchAdminTours().then(setTours);
    };

    const handleAdd = (data: Omit<Tour, "id">) => {
        addTour(data);
        refresh();
    };

    const handleUpdate = (data: Omit<Tour, "id">) => {
        if (editingTour) {
            updateTour(editingTour.id, data);
            setEditingTour(null);
            refresh();
        }
    };

    const handleToggle = (tour: Tour) => {
        updateTour(tour.id, { isActive: tour.isActive === false ? true : false });
        refresh();
    };

    const handleDelete = async (id: string) => {
        setTours((prev) => prev.filter((t) => t.id !== id));
        setDeleteConfirmId(null);
        try {
            await fetch(`/api/admin/tours?id=${encodeURIComponent(id)}`, {
                method: "DELETE",
            });
        } catch (e) {
            console.error("Delete tour error:", e);
        }
        deleteTour(id);
        refresh();
    };

    const handleReset = async () => {
        try {
            await fetch("/api/admin/tours", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reset" }),
            });
        } catch (e) {
            console.error("Reset tours error:", e);
        }
        resetTours();
        setShowResetConfirm(false);
        refresh();
    };

    const filtered = tours.filter(
        (t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const TimingBadge = ({ timing }: { timing: string }) => {
        const Icon = timing === "morning" ? Sunrise : timing === "afternoon" ? Sunset : Moon;
        const color = timing === "morning" ? "text-yellow-400" : timing === "afternoon" ? "text-amber-500" : "text-indigo-400";
        return (
            <span className={`inline-flex items-center gap-1 ${color}`}>
                <Icon size={14} />
                {timing}
            </span>
        );
    };

    return (
        <AdminPage className="flex flex-col gap-6">
            <WhiteLabelUpgradeOverlay moduleName="الجولات والرحلات اليومية">
            <AdminPageHeader
                breadcrumb={<span>لوحة التحكم <span className="mx-1 opacity-50">/</span> الجولات</span>}
                icon={<MapPin className="size-5" />}
                title="Tour Management"
                description="Manage UAE tours, timings, and pricing"
                actions={
                    <>
                        <Button type="button" variant="outline" onClick={() => setShowResetConfirm(true)}>
                            <RotateCcw size={14} />
                            Reset
                        </Button>
                        <Button type="button" onClick={() => { setEditingTour(null); setIsModalOpen(true); }}>
                            <Plus size={18} />
                            Add Tour
                        </Button>
                    </>
                }
            />

            <ServiceImportChat
                serviceType="tour"
                onApply={(item) => {
                    addTour(normalizeImportedTour(item));
                    refresh();
                }}
            />

            <AdminKpiStrip cols={3}>
                <AdminKpi label="Total" value={tours.length} />
                <AdminKpi label="Active" value={tours.filter((t) => t.isActive !== false).length} />
                <AdminKpi label="Popular" value={tours.filter((t) => t.popular).length} />
            </AdminKpiStrip>

            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-10" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title or category..." />
                    </div>
                    {filtered.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyTitle>No tours found</EmptyTitle>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <>
                        <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tour</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Timing</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-24" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((tour) => (
                                    <TableRow key={tour.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={tour.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">{tour.title}</p>
                                                    {tour.popular ? <Badge variant="secondary">Popular</Badge> : null}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{tour.category}</Badge></TableCell>
                                        <TableCell>{tour.duration}</TableCell>
                                        <TableCell><TimingBadge timing={tour.timing} /></TableCell>
                                        <TableCell className="font-semibold">AED {tour.price}</TableCell>
                                        <TableCell><span className="inline-flex items-center gap-1"><Star size={12} className="fill-current" />{tour.rating}</span></TableCell>
                                        <TableCell>
                                            <Button type="button" variant="outline" size="sm" onClick={() => handleToggle(tour)}>
                                                {tour.isActive === false ? "Off" : "On"}
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1.5">
                                                <Button type="button" variant="ghost" size="icon-sm" onClick={() => { setEditingTour(tour); setIsModalOpen(true); }}><Pencil size={14} /></Button>
                                                <Button type="button" variant="destructive" size="icon-sm" onClick={() => setDeleteConfirmId(tour.id)}><Trash2 size={14} /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                        <div className="grid gap-3 md:hidden">
                            {filtered.map((tour) => (
                                <Card key={`m-${tour.id}`}>
                                    <CardContent className="space-y-2 pt-4">
                                        <p className="font-semibold">{tour.title}</p>
                                        <p className="text-sm text-muted-foreground">AED {tour.price} · {tour.isActive === false ? "Off" : "On"}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => { setEditingTour(tour); setIsModalOpen(true); }}>Edit</Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => handleToggle(tour)}>Toggle</Button>
                                            <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteConfirmId(tour.id)}>Delete</Button>
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
                        <DialogTitle>Reset All Tours</DialogTitle>
                        <DialogDescription>All custom tour data will be lost. This cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
                        <Button type="button" variant="destructive" onClick={handleReset}>Reset All</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(deleteConfirmId)} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete tour</DialogTitle>
                        <DialogDescription>This tour will be removed from the catalog.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                        <Button type="button" variant="destructive" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            </WhiteLabelUpgradeOverlay>

            <TourFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingTour(null); }}
                onSubmit={editingTour ? handleUpdate : handleAdd}
                editTour={editingTour}
            />
        </AdminPage>
    );
}
