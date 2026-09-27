// src/lib/transfers/storage.ts
/**
 * Lonaliza Enterprise Transfers In-Memory + Atomic Disk Persistence Store
 * Engineered for high concurrency, ultra-fast responses, and resilience.
 */

import fs from "fs";
import path from "path";
import type {
  TransferVehicleClass,
  TransferZone,
  TransferRoute,
  TransferTour,
  TransferSupplier,
  TransferSupplierVehicle,
  TransferBooking,
  TransferTelemetry,
  TransferReview,
  TransferQuoteRequest,
  TransferGlobalSettings,
  TransferTripStatus,
} from "./types";
import {
  DEFAULT_TRANSFER_SETTINGS,
  SEEDED_VEHICLE_CLASSES,
  SEEDED_ZONES,
  SEEDED_ROUTES,
  SEEDED_DAILY_TOURS,
  SEEDED_SUPPLIERS,
  SEEDED_SUPPLIER_VEHICLES,
} from "./seedData";

interface StoreData {
  settings: TransferGlobalSettings;
  vehicleClasses: TransferVehicleClass[];
  zones: TransferZone[];
  routes: TransferRoute[];
  tours: TransferTour[];
  suppliers: TransferSupplier[];
  vehicles: TransferSupplierVehicle[];
  bookings: TransferBooking[];
  reviews: TransferReview[];
  quoteRequests: TransferQuoteRequest[];
}

const DATA_DIR = path.resolve(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "lonaliza_transfers_v1.json");

class TransferStore {
  private data: StoreData | null = null;
  private telemetryMap: Map<string, TransferTelemetry> = new Map();
  private writePromise: Promise<void> | null = null;
  private isSaving = false;
  private needsSave = false;

  constructor() {
    this.initStore();
  }

  private initStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        this.data = {
          settings: { ...DEFAULT_TRANSFER_SETTINGS, ...(parsed.settings || {}) },
          vehicleClasses: parsed.vehicleClasses?.length ? parsed.vehicleClasses : SEEDED_VEHICLE_CLASSES,
          zones: parsed.zones?.length ? parsed.zones : SEEDED_ZONES,
          routes: parsed.routes?.length ? parsed.routes : SEEDED_ROUTES,
          tours: parsed.tours?.length ? parsed.tours : SEEDED_DAILY_TOURS,
          suppliers: parsed.suppliers?.length ? parsed.suppliers : SEEDED_SUPPLIERS,
          vehicles: parsed.vehicles?.length ? parsed.vehicles : SEEDED_SUPPLIER_VEHICLES,
          bookings: parsed.bookings || [],
          reviews: parsed.reviews || [],
          quoteRequests: parsed.quoteRequests || [],
        };
      } else {
        this.data = {
          settings: { ...DEFAULT_TRANSFER_SETTINGS },
          vehicleClasses: [...SEEDED_VEHICLE_CLASSES],
          zones: [...SEEDED_ZONES],
          routes: [...SEEDED_ROUTES],
          tours: [...SEEDED_DAILY_TOURS],
          suppliers: [...SEEDED_SUPPLIERS],
          vehicles: [...SEEDED_SUPPLIER_VEHICLES],
          bookings: [],
          reviews: [],
          quoteRequests: [],
        };
        this.persistImmediate();
      }
    } catch (err) {
      console.error("[TransferStore init error]:", err);
      this.data = {
        settings: { ...DEFAULT_TRANSFER_SETTINGS },
        vehicleClasses: [...SEEDED_VEHICLE_CLASSES],
        zones: [...SEEDED_ZONES],
        routes: [...SEEDED_ROUTES],
        tours: [...SEEDED_DAILY_TOURS],
        suppliers: [...SEEDED_SUPPLIERS],
        vehicles: [...SEEDED_SUPPLIER_VEHICLES],
        bookings: [],
        reviews: [],
        quoteRequests: [],
      };
    }
  }

  private persistImmediate() {
    if (!this.data) return;
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      const tempFile = `${STORE_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), "utf-8");
      fs.renameSync(tempFile, STORE_FILE);
    } catch (e) {
      console.error("[TransferStore persistImmediate error]:", e);
    }
  }

  private queueSave() {
    this.needsSave = true;
    if (this.isSaving) return;

    this.isSaving = true;
    setTimeout(() => {
      this.needsSave = false;
      this.persistImmediate();
      this.isSaving = false;
      if (this.needsSave) {
        this.queueSave();
      }
    }, 100);
  }

  // ── Settings ─────────────────────────────────────────────────────────────
  getSettings(): TransferGlobalSettings {
    return this.data?.settings || DEFAULT_TRANSFER_SETTINGS;
  }

  updateSettings(patch: Partial<TransferGlobalSettings>): TransferGlobalSettings {
    if (!this.data) this.initStore();
    this.data!.settings = { ...this.data!.settings, ...patch };
    this.queueSave();
    return this.data!.settings;
  }

  // ── Vehicle Classes ──────────────────────────────────────────────────────
  getVehicleClasses(includeInactive = false): TransferVehicleClass[] {
    const list = this.data?.vehicleClasses || [];
    return includeInactive ? list : list.filter((vc) => vc.isActive);
  }

  getVehicleClassById(id: string): TransferVehicleClass | undefined {
    return this.data?.vehicleClasses.find((vc) => vc.id === id || vc.code === id);
  }

  saveVehicleClass(doc: Partial<TransferVehicleClass> & { code: string }): TransferVehicleClass {
    const now = new Date().toISOString();
    const existingIdx = this.data?.vehicleClasses.findIndex((vc) => vc.id === doc.id || vc.code === doc.code);

    if (existingIdx !== undefined && existingIdx >= 0) {
      const updated: TransferVehicleClass = {
        ...this.data!.vehicleClasses[existingIdx],
        ...doc,
        updatedAt: now,
      } as TransferVehicleClass;
      this.data!.vehicleClasses[existingIdx] = updated;
      this.queueSave();
      return updated;
    } else {
      const created: TransferVehicleClass = {
        id: doc.id || `vc-${Date.now()}`,
        code: doc.code,
        name: doc.name || { ar: doc.code, en: doc.code, tr: doc.code },
        description: doc.description || { ar: "", en: "", tr: "" },
        exampleModels: doc.exampleModels || [],
        images: doc.images || [],
        capacity: doc.capacity || { passengers: 4, luggageLarge: 4, luggageSmall: 4 },
        amenities: doc.amenities || [],
        specs: doc.specs || { doors: 4, transmission: "automatic", fuelType: "diesel" },
        tier: doc.tier || "comfort",
        serviceTypes: doc.serviceTypes || ["transfer", "daily_tour"],
        displayOrder: doc.displayOrder || this.data!.vehicleClasses.length + 1,
        rating: { avg: 5.0, count: 0 },
        origin: doc.origin || "master",
        moderationStatus: "approved",
        isActive: doc.isActive !== false,
        createdAt: now,
        updatedAt: now,
      };
      this.data!.vehicleClasses.push(created);
      this.queueSave();
      return created;
    }
  }

  deleteVehicleClass(id: string): boolean {
    if (!this.data) return false;
    const initialLen = this.data.vehicleClasses.length;
    this.data.vehicleClasses = this.data.vehicleClasses.filter((vc) => vc.id !== id && vc.code !== id);
    if (this.data.vehicleClasses.length !== initialLen) {
      this.queueSave();
      return true;
    }
    return false;
  }

  // ── Zones ────────────────────────────────────────────────────────────────
  getZones(city?: string, kind?: string, includeInactive = false): TransferZone[] {
    let list = this.data?.zones || [];
    if (!includeInactive) list = list.filter((z) => z.isActive);
    if (city && city !== "all") {
      const c = city.toLowerCase();
      list = list.filter((z) => z.city.toLowerCase() === c);
    }
    if (kind && kind !== "all") {
      list = list.filter((z) => z.kind === kind);
    }
    return list.sort((a, b) => b.popularityRank - a.popularityRank);
  }

  getZoneById(id: string): TransferZone | undefined {
    return this.data?.zones.find((z) => z.id === id || z.code === id);
  }

  saveZone(doc: Partial<TransferZone> & { code: string; city: string }): TransferZone {
    const now = new Date().toISOString();
    const existingIdx = this.data?.zones.findIndex((z) => z.id === doc.id || z.code === doc.code);

    if (existingIdx !== undefined && existingIdx >= 0) {
      const updated: TransferZone = {
        ...this.data!.zones[existingIdx],
        ...doc,
        updatedAt: now,
      } as TransferZone;
      this.data!.zones[existingIdx] = updated;
      this.queueSave();
      return updated;
    } else {
      const created: TransferZone = {
        id: doc.id || `zone-${Date.now()}`,
        code: doc.code,
        name: doc.name || { ar: doc.code, en: doc.code, tr: doc.code },
        city: doc.city,
        country: doc.country || "Turkey",
        kind: doc.kind || "district",
        airportCode: doc.airportCode,
        center: doc.center || { lat: 41.0082, lng: 28.9784 },
        radiusKm: doc.radiusKm || 8,
        popularityRank: doc.popularityRank || 50,
        isActive: doc.isActive !== false,
        createdAt: now,
        updatedAt: now,
      };
      this.data!.zones.push(created);
      this.queueSave();
      return created;
    }
  }

  deleteZone(id: string): boolean {
    if (!this.data) return false;
    const initialLen = this.data.zones.length;
    this.data.zones = this.data.zones.filter((z) => z.id !== id && z.code !== id);
    if (this.data.zones.length !== initialLen) {
      this.queueSave();
      return true;
    }
    return false;
  }

  // ── Routes ───────────────────────────────────────────────────────────────
  getRoutes(fromZoneId?: string, toZoneId?: string, vehicleClassId?: string, includeInactive = false): TransferRoute[] {
    let list = this.data?.routes || [];
    if (!includeInactive) list = list.filter((r) => r.isActive);
    if (fromZoneId) list = list.filter((r) => r.fromZoneId === fromZoneId || (r.direction === "both" && r.toZoneId === fromZoneId));
    if (toZoneId) list = list.filter((r) => r.toZoneId === toZoneId || (r.direction === "both" && r.fromZoneId === toZoneId));
    if (vehicleClassId) list = list.filter((r) => r.vehicleClassId === vehicleClassId);
    return list;
  }

  saveRoute(doc: Partial<TransferRoute> & { fromZoneId: string; toZoneId: string; vehicleClassId: string; basePrice: number }): TransferRoute {
    const now = new Date().toISOString();
    const existingIdx = this.data?.routes.findIndex((r) => r.id === doc.id);

    if (existingIdx !== undefined && existingIdx >= 0) {
      const updated = {
        ...this.data!.routes[existingIdx],
        ...doc,
        updatedAt: now,
      };
      this.data!.routes[existingIdx] = updated;
      this.queueSave();
      return updated;
    } else {
      const created: TransferRoute = {
        id: doc.id || `route-${Date.now()}`,
        fromZoneId: doc.fromZoneId,
        toZoneId: doc.toZoneId,
        vehicleClassId: doc.vehicleClassId,
        direction: doc.direction || "both",
        basePrice: Number(doc.basePrice),
        currency: doc.currency || "USD",
        returnDiscountPercent: doc.returnDiscountPercent ?? 10,
        nightSurcharge: doc.nightSurcharge || { startHour: 23, endHour: 6, amount: 10, percent: 0 },
        estimatedDurationMinutes: doc.estimatedDurationMinutes || 45,
        estimatedDistanceKm: doc.estimatedDistanceKm || 35,
        supplierNet: doc.supplierNet || Number(doc.basePrice) * 0.85,
        isActive: doc.isActive !== false,
        createdAt: now,
        updatedAt: now,
      };
      this.data!.routes.push(created);
      this.queueSave();
      return created;
    }
  }

  deleteRoute(id: string): boolean {
    if (!this.data) return false;
    const initialLen = this.data.routes.length;
    this.data.routes = this.data.routes.filter((r) => r.id !== id);
    if (this.data.routes.length !== initialLen) {
      this.queueSave();
      return true;
    }
    return false;
  }

  // ── Daily Tours ──────────────────────────────────────────────────────────
  getTours(hubCity?: string, category?: string, includeInactive = false): TransferTour[] {
    let list = this.data?.tours || [];
    if (!includeInactive) list = list.filter((t) => t.isActive);
    if (hubCity && hubCity !== "all") {
      const c = hubCity.toLowerCase();
      list = list.filter((t) => t.hubCity.toLowerCase() === c);
    }
    if (category && category !== "all") {
      list = list.filter((t) => t.category === category);
    }
    return list.sort((a, b) => b.popularityRank - a.popularityRank);
  }

  getTourByIdOrSlug(idOrSlug: string): TransferTour | undefined {
    return this.data?.tours.find((t) => t.id === idOrSlug || t.slug === idOrSlug);
  }

  saveTour(doc: Partial<TransferTour> & { slug: string; hubCity: string }): TransferTour {
    const now = new Date().toISOString();
    const existingIdx = this.data?.tours.findIndex((t) => t.id === doc.id || t.slug === doc.slug);

    if (existingIdx !== undefined && existingIdx >= 0) {
      const updated = {
        ...this.data!.tours[existingIdx],
        ...doc,
        updatedAt: now,
      };
      this.data!.tours[existingIdx] = updated;
      this.queueSave();
      return updated;
    } else {
      const created: TransferTour = {
        id: doc.id || `tour-${Date.now()}`,
        slug: doc.slug,
        title: doc.title || { ar: doc.slug, en: doc.slug, tr: doc.slug },
        summary: doc.summary || { ar: "", en: "", tr: "" },
        description: doc.description || { ar: "", en: "", tr: "" },
        hubCity: doc.hubCity,
        country: doc.country || "Turkey",
        category: doc.category || "city",
        durationHours: doc.durationHours || 8,
        startTimeOptions: doc.startTimeOptions || ["09:00", "10:00"],
        itinerary: doc.itinerary || [],
        pickup: doc.pickup || { instructions: { ar: "الاستقبال من بهو الفندق", en: "Hotel lobby pickup", tr: "Otel lobisinden alış" }, windowMinutes: 15 },
        prices: doc.prices || [],
        extraHourPrice: doc.extraHourPrice || { amount: 20, currency: "USD" },
        inclusions: doc.inclusions || ["سيارة خاصة VIP وسائق", "الوقود ومواقف السيارات"],
        exclusions: doc.exclusions || ["تذاكر الدخول والوجبات الشخصية"],
        driverLanguages: doc.driverLanguages || ["ar", "en", "tr"],
        images: doc.images || [],
        popularityRank: doc.popularityRank || 80,
        isActive: doc.isActive !== false,
        createdAt: now,
        updatedAt: now,
      };
      this.data!.tours.push(created);
      this.queueSave();
      return created;
    }
  }

  deleteTour(id: string): boolean {
    if (!this.data) return false;
    const initialLen = this.data.tours.length;
    this.data.tours = this.data.tours.filter((t) => t.id !== id && t.slug !== id);
    if (this.data.tours.length !== initialLen) {
      this.queueSave();
      return true;
    }
    return false;
  }

  // ── Suppliers & Fleet ────────────────────────────────────────────────────
  getSuppliers(status?: string, includeInactive = false): TransferSupplier[] {
    let list = this.data?.suppliers || [];
    if (!includeInactive) list = list.filter((s) => s.isActive);
    if (status && status !== "all") list = list.filter((s) => s.status === status);
    return list;
  }

  getSupplierById(id: string): TransferSupplier | undefined {
    return this.data?.suppliers.find((s) => s.id === id);
  }

  saveSupplier(doc: Partial<TransferSupplier> & { legalName: string; tradeName: string; contactEmail: string }): TransferSupplier {
    const now = new Date().toISOString();
    const existingIdx = this.data?.suppliers.findIndex((s) => s.id === doc.id);

    if (existingIdx !== undefined && existingIdx >= 0) {
      const updated = {
        ...this.data!.suppliers[existingIdx],
        ...doc,
        updatedAt: now,
      };
      this.data!.suppliers[existingIdx] = updated;
      this.queueSave();
      return updated;
    } else {
      const settings = this.getSettings();
      const created: TransferSupplier = {
        id: doc.id || `sup-${Date.now()}`,
        accountType: doc.accountType || "company",
        legalName: doc.legalName,
        tradeName: doc.tradeName,
        contactEmail: doc.contactEmail,
        contactPhone: doc.contactPhone || "",
        serviceTypes: doc.serviceTypes || ["transfer", "daily_tour"],
        commissionPct: doc.commissionPct ?? settings.defaultCommissionPercent,
        autoApproveVehicles: doc.autoApproveVehicles ?? settings.autoApproveFleet,
        settlementModel: doc.settlementModel || "weekly",
        status: doc.status || "active",
        documents: doc.documents || [],
        payoutVouchers: doc.payoutVouchers || [],
        rating: { avg: 5.0, count: 0 },
        stats: { tripsCompleted: 0, offersReceived: 0, offersAccepted: 0 },
        isActive: doc.isActive !== false,
        createdAt: now,
        updatedAt: now,
      };
      this.data!.suppliers.push(created);
      this.queueSave();
      return created;
    }
  }

  addPayoutVoucher(supplierId: string, voucher: Omit<TransferSupplier["payoutVouchers"][0], "id" | "uploadedAt">) {
    const sup = this.getSupplierById(supplierId);
    if (!sup) return null;
    const item = {
      ...voucher,
      id: `vouch-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    sup.payoutVouchers.push(item);
    this.queueSave();
    return item;
  }

  getSupplierVehicles(supplierId?: string, moderationStatus?: string, includeInactive = false): TransferSupplierVehicle[] {
    let list = this.data?.vehicles || [];
    if (!includeInactive) list = list.filter((v) => v.isActive);
    if (supplierId) list = list.filter((v) => v.supplierId === supplierId);
    if (moderationStatus && moderationStatus !== "all") list = list.filter((v) => v.moderationStatus === moderationStatus);
    return list;
  }

  getSupplierVehicleById(id: string): TransferSupplierVehicle | undefined {
    return this.data?.vehicles.find((v) => v.id === id);
  }

  saveSupplierVehicle(doc: Partial<TransferSupplierVehicle> & { supplierId: string; vehicleClassId: string; plateNumber: string }): TransferSupplierVehicle {
    const now = new Date().toISOString();
    const existingIdx = this.data?.vehicles.findIndex((v) => v.id === doc.id);
    const supplier = this.getSupplierById(doc.supplierId);
    const settings = this.getSettings();

    // Determine initial moderation status
    const shouldAutoApprove = supplier?.autoApproveVehicles || settings.autoApproveFleet;
    const initialStatus = shouldAutoApprove ? "approved" : (doc.moderationStatus || "pending");

    if (existingIdx !== undefined && existingIdx >= 0) {
      const updated = {
        ...this.data!.vehicles[existingIdx],
        ...doc,
        updatedAt: now,
      };
      this.data!.vehicles[existingIdx] = updated;
      this.queueSave();
      return updated;
    } else {
      const created: TransferSupplierVehicle = {
        id: doc.id || `veh-${Date.now()}`,
        supplierId: doc.supplierId,
        vehicleClassId: doc.vehicleClassId,
        plateNumber: doc.plateNumber.toUpperCase(),
        make: doc.make || "Mercedes-Benz",
        model: doc.model || "Vito Tourer VIP",
        year: doc.year || 2024,
        color: doc.color || "Black",
        cleanlinessRating: doc.cleanlinessRating ?? 98,
        ownImages: doc.ownImages || [],
        driver: doc.driver || { name: "سائق معتمد", phone: "", languages: ["ar", "en", "tr"] },
        customPricing: doc.customPricing,
        moderationStatus: initialStatus,
        isActive: doc.isActive !== false,
        createdAt: now,
        updatedAt: now,
      };
      this.data!.vehicles.push(created);
      this.queueSave();
      return created;
    }
  }

  moderateVehicle(id: string, status: "approved" | "rejected", note?: string): TransferSupplierVehicle | null {
    const veh = this.getSupplierVehicleById(id);
    if (!veh) return null;
    veh.moderationStatus = status;
    veh.moderationNote = note;
    veh.updatedAt = new Date().toISOString();
    this.queueSave();
    return veh;
  }

  deleteSupplierVehicle(id: string): boolean {
    if (!this.data) return false;
    const len = this.data.vehicles.length;
    this.data.vehicles = this.data.vehicles.filter((v) => v.id !== id);
    if (this.data.vehicles.length !== len) {
      this.queueSave();
      return true;
    }
    return false;
  }

  // ── Bookings ─────────────────────────────────────────────────────────────
  getBookings(filter?: { serviceType?: string; status?: string | string[]; search?: string; supplierId?: string; driverId?: string }): TransferBooking[] {
    let list = this.data?.bookings || [];
    if (!filter) return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filter.serviceType && filter.serviceType !== "all") {
      list = list.filter((b) => b.serviceType === filter.serviceType);
    }
    if (filter.status) {
      if (Array.isArray(filter.status)) {
        const set = new Set(filter.status);
        list = list.filter((b) => set.has(b.status));
      } else if (filter.status !== "all") {
        list = list.filter((b) => b.status === filter.status);
      }
    }
    if (filter.supplierId) {
      list = list.filter((b) => b.assignment?.supplierId === filter.supplierId);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (b) =>
          b.bookingNumber.toLowerCase().includes(q) ||
          b.contact.name.toLowerCase().includes(q) ||
          b.contact.phone.toLowerCase().includes(q) ||
          b.contact.email.toLowerCase().includes(q) ||
          (b.assignment?.driverName || "").toLowerCase().includes(q) ||
          (b.legs?.[0]?.fromLabel || "").toLowerCase().includes(q) ||
          (b.legs?.[0]?.toLabel || "").toLowerCase().includes(q) ||
          (b.tour?.titleSnapshot || "").toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getBookingById(id: string): TransferBooking | undefined {
    return this.data?.bookings.find((b) => b.id === id || b.bookingNumber === id);
  }

  createBooking(doc: Omit<TransferBooking, "id" | "bookingNumber" | "createdAt" | "updatedAt">): TransferBooking {
    const now = new Date().toISOString();
    const count = (this.data?.bookings.length || 0) + 1;
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = doc.serviceType === "daily_tour" ? "LONA-TOUR" : "LONA-TR";
    const bookingNumber = `${prefix}-${new Date().getFullYear()}${String(count).padStart(4, "0")}-${randomSuffix}`;

    const newBooking: TransferBooking = {
      ...doc,
      id: `bk-${Date.now()}-${randomSuffix}`,
      bookingNumber,
      createdAt: now,
      updatedAt: now,
    };

    if (!this.data) this.initStore();
    this.data!.bookings.unshift(newBooking);
    this.queueSave();
    return newBooking;
  }

  updateBookingStatus(id: string, status: TransferTripStatus, reason?: string): TransferBooking | null {
    const booking = this.getBookingById(id);
    if (!booking) return null;
    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    if (reason) {
      booking.adminNotes = (booking.adminNotes ? booking.adminNotes + "\n" : "") + `[${new Date().toISOString()}] ${status}: ${reason}`;
    }
    this.queueSave();
    return booking;
  }

  assignBooking(
    bookingId: string,
    assignment: { supplierId: string; vehicleId?: string; driverName: string; driverPhone: string; plateNumber: string }
  ): TransferBooking | null {
    const booking = this.getBookingById(bookingId);
    if (!booking) return null;

    booking.assignment = {
      ...assignment,
      assignedAt: new Date().toISOString(),
    };
    booking.status = "assigned";
    booking.updatedAt = new Date().toISOString();
    this.queueSave();
    return booking;
  }

  // ── Telemetry (Realtime Live GPS Map) ────────────────────────────────────
  updateTelemetry(item: TransferTelemetry) {
    const key = `${item.driverId}_${item.vehicleId}`;
    this.telemetryMap.set(key, { ...item, updatedAt: new Date().toISOString() });
  }

  getAllTelemetry(): TransferTelemetry[] {
    return Array.from(this.telemetryMap.values());
  }

  // ── Reviews ──────────────────────────────────────────────────────────────
  getReviews(serviceType?: string, status?: string): TransferReview[] {
    let list = this.data?.reviews || [];
    if (serviceType && serviceType !== "all") list = list.filter((r) => r.serviceType === serviceType);
    if (status && status !== "all") list = list.filter((r) => r.status === status);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addReview(doc: Omit<TransferReview, "id" | "createdAt">): TransferReview {
    const review: TransferReview = {
      ...doc,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data!.reviews.unshift(review);
    this.queueSave();
    return review;
  }

  moderateReview(id: string, status: "published" | "pending" | "hidden", adminReply?: string): TransferReview | null {
    const rev = this.data?.reviews.find((r) => r.id === id);
    if (!rev) return null;
    rev.status = status;
    if (adminReply !== undefined) rev.adminReply = adminReply;
    this.queueSave();
    return rev;
  }

  // ── Quote Requests ───────────────────────────────────────────────────────
  getQuoteRequests(status?: string): TransferQuoteRequest[] {
    let list = this.data?.quoteRequests || [];
    if (status && status !== "all") list = list.filter((q) => q.status === status);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addQuoteRequest(doc: Omit<TransferQuoteRequest, "id" | "createdAt">): TransferQuoteRequest {
    const quote: TransferQuoteRequest = {
      ...doc,
      id: `qr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data!.quoteRequests.unshift(quote);
    this.queueSave();
    return quote;
  }

  updateQuoteRequest(id: string, patch: Partial<TransferQuoteRequest>): TransferQuoteRequest | null {
    const qr = this.data?.quoteRequests.find((q) => q.id === id);
    if (!qr) return null;
    Object.assign(qr, patch, { handledAt: new Date().toISOString() });
    this.queueSave();
    return qr;
  }
}

// Global Singleton instance
const globalStore = (global as any).__lonalizaTransferStore || new TransferStore();
if (process.env.NODE_ENV !== "production") {
  (global as any).__lonalizaTransferStore = globalStore;
}

export const transferStore: TransferStore = globalStore;
