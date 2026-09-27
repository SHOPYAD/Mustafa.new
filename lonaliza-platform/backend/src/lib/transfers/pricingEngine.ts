// src/lib/transfers/pricingEngine.ts
/**
 * Lonaliza Intelligent Pricing & Distance Matrix Engine for Turkey
 * Handles exact route matching, dynamic distance estimation, night surcharges,
 * hourly tour calculations, and payment discount structures.
 */

import { transferStore } from "./storage";
import type {
  TransferVehicleClass,
  TransferZone,
  TransferPaymentMode,
  TransferSupplierVehicle,
} from "./types";

export interface CalculateTransferParams {
  fromZoneId?: string;
  toZoneId?: string;
  fromCoords?: { lat: number; lng: number };
  toCoords?: { lat: number; lng: number };
  vehicleClassId?: string;
  scheduledAt?: string;
  tripType?: "oneway" | "roundtrip";
  paymentMode?: TransferPaymentMode;
  passengers?: { adults: number; children: number; infants: number };
  luggage?: { large: number; small: number };
}

export interface CalculatedOffer {
  vehicleClass: TransferVehicleClass;
  matchedVehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    plateNumber: string;
    cleanlinessRating: number; // e.g. 99%
    driver: {
      name: string;
      phone: string;
      photoUrl?: string;
      languages: string[];
    };
    images: string[];
  };
  distanceKm: number;
  durationMinutes: number;
  basePrice: number;
  nightSurchargeAmount: number;
  roundtripDiscountAmount: number;
  paymentModeDiscountAmount: number;
  finalTotal: number;
  depositAmount: number;
  remainingCashOnArrival: number;
  currency: string;
  paymentMode: TransferPaymentMode;
  isExactRouteMatched: boolean;
}

export interface CalculateTourParams {
  tourIdOrSlug?: string;
  hubCity?: string;
  hours: number;
  vehicleClassId?: string;
  paymentMode?: TransferPaymentMode;
}

export interface CalculatedTourOffer {
  tourTitle: { ar: string; en: string; tr: string };
  hours: number;
  vehicleClass: TransferVehicleClass;
  basePrice: number;
  extraHoursPrice: number;
  paymentModeDiscountAmount: number;
  finalTotal: number;
  depositAmount: number;
  remainingCashOnArrival: number;
  currency: string;
  paymentMode: TransferPaymentMode;
  matchedVehicle?: CalculatedOffer["matchedVehicle"];
}

/**
 * Calculates geodesic distance via Haversine formula, adjusted with
 * Turkish road tortuosity factor (~1.35x) for real driving distances.
 */
export function estimateDrivingDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): { distanceKm: number; durationMinutes: number } {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;

  // Real road factor in Turkey (urban highways & coastal roads)
  const drivingKm = Math.max(5, Math.round(straightLineKm * 1.35));

  // Average speed: 45 km/h in urban areas + highway mix (1.33 min per km + 10 min buffer)
  const durationMins = Math.max(15, Math.round(drivingKm * 1.25 + 8));

  return {
    distanceKm: drivingKm,
    durationMinutes: durationMins,
  };
}

/**
 * Calculates point-to-point transfer offers for all eligible vehicle classes.
 */
export function calculateTransferOffers(params: CalculateTransferParams): CalculatedOffer[] {
  const settings = transferStore.getSettings();
  const paymentMode = params.paymentMode || "online_full";
  const vehicleClasses = transferStore.getVehicleClasses();
  const approvedVehicles = transferStore.getSupplierVehicles(undefined, "approved");

  // Determine coordinates
  let fromCoords = params.fromCoords;
  let toCoords = params.toCoords;

  if (params.fromZoneId && !fromCoords) {
    const zone = transferStore.getZoneById(params.fromZoneId);
    if (zone) fromCoords = zone.center;
  }
  if (params.toZoneId && !toCoords) {
    const zone = transferStore.getZoneById(params.toZoneId);
    if (zone) toCoords = zone.center;
  }

  // Fallback coordinates (IST to Taksim) if none provided
  const c1 = fromCoords || { lat: 41.2753, lng: 28.7519 };
  const c2 = toCoords || { lat: 41.0369, lng: 28.985 };
  const { distanceKm, durationMinutes } = estimateDrivingDistance(c1, c2);

  // Check night hours (23:00 to 06:00)
  let isNight = false;
  if (params.scheduledAt) {
    const date = new Date(params.scheduledAt);
    const hour = date.getHours();
    isNight = hour >= 23 || hour < 6;
  }

  const results: CalculatedOffer[] = [];

  for (const vc of vehicleClasses) {
    if (params.vehicleClassId && vc.id !== params.vehicleClassId && vc.code !== params.vehicleClassId) {
      continue;
    }

    // Check passenger and luggage capacities
    const totalPax = (params.passengers?.adults || 1) + (params.passengers?.children || 0);
    if (totalPax > vc.capacity.passengers) {
      continue;
    }

    // Check if route exists in database
    let exactRouteMatched = false;
    let basePrice = 0;
    let nightSurcharge = 0;
    let returnDiscount = 0;

    const routes = transferStore.getRoutes(params.fromZoneId, params.toZoneId, vc.id);
    const route = routes[0];

    if (route) {
      exactRouteMatched = true;
      basePrice = route.basePrice;
      if (isNight && route.nightSurcharge) {
        nightSurcharge = route.nightSurcharge.amount || (basePrice * (route.nightSurcharge.percent || 0)) / 100;
      }
      if (params.tripType === "roundtrip") {
        returnDiscount = ((basePrice * 2) * (route.returnDiscountPercent || 10)) / 100;
      }
    } else {
      // Dynamic fallback pricing based on vehicle tier & distance
      const tierPerKm: Record<string, number> = {
        economy: 1.1,
        comfort: 1.3,
        business: 1.6,
        vip: 1.8,
        group: 2.2,
      };
      const tierBaseDrop: Record<string, number> = {
        economy: 25,
        comfort: 35,
        business: 45,
        vip: 55,
        group: 65,
      };

      const perKm = tierPerKm[vc.tier] || 1.4;
      const baseDrop = tierBaseDrop[vc.tier] || 40;
      basePrice = Math.round(baseDrop + distanceKm * perKm);

      if (isNight) {
        nightSurcharge = 10;
      }
      if (params.tripType === "roundtrip") {
        returnDiscount = Math.round(basePrice * 2 * 0.1);
      }
    }

    const subtotalBeforeDiscounts = (params.tripType === "roundtrip" ? basePrice * 2 : basePrice) + nightSurcharge - returnDiscount;

    // Payment Mode Discounts
    let paymentDiscount = 0;
    let deposit = 0;
    let remainingCash = 0;

    if (paymentMode === "online_full") {
      paymentDiscount = Math.round((subtotalBeforeDiscounts * settings.onlineFullDiscountPercent) / 100);
    } else if (paymentMode === "deposit_half") {
      paymentDiscount = Math.round((subtotalBeforeDiscounts * settings.depositDiscountPercent) / 100);
    }

    const finalTotal = Math.max(20, subtotalBeforeDiscounts - paymentDiscount);

    if (paymentMode === "online_full") {
      deposit = finalTotal;
      remainingCash = 0;
    } else if (paymentMode === "deposit_half") {
      deposit = Math.round(finalTotal * 0.5);
      remainingCash = finalTotal - deposit;
    } else {
      // cash_arrival
      deposit = 0;
      remainingCash = finalTotal;
    }

    // Match best approved vehicle for driver preview
    const matchingVehicles = approvedVehicles.filter((v) => v.vehicleClassId === vc.id);
    const primaryVehicle = matchingVehicles[0];

    const matchedVehicle = primaryVehicle
      ? {
          id: primaryVehicle.id,
          make: primaryVehicle.make,
          model: primaryVehicle.model,
          year: primaryVehicle.year,
          plateNumber: primaryVehicle.plateNumber,
          cleanlinessRating: primaryVehicle.cleanlinessRating,
          driver: primaryVehicle.driver,
          images: primaryVehicle.ownImages?.map((img) => img.url) || vc.images.map((i) => i.url),
        }
      : {
          id: `demo-${vc.code}`,
          make: "Mercedes-Benz",
          model: vc.exampleModels[0] || "VIP Luxury",
          year: 2024,
          plateNumber: "34 VIP 2024",
          cleanlinessRating: 99,
          driver: {
            name: "سائق خاص معتمد",
            phone: "+90 534 231 12 34",
            photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
            languages: ["ar", "en", "tr"],
          },
          images: vc.images.map((i) => i.url),
        };

    results.push({
      vehicleClass: vc,
      matchedVehicle,
      distanceKm,
      durationMinutes,
      basePrice,
      nightSurchargeAmount: nightSurcharge,
      roundtripDiscountAmount: returnDiscount,
      paymentModeDiscountAmount: paymentDiscount,
      finalTotal,
      depositAmount: deposit,
      remainingCashOnArrival: remainingCash,
      currency: settings.baseCurrency,
      paymentMode,
      isExactRouteMatched: exactRouteMatched,
    });
  }

  // Sort by display order / tier
  return results.sort((a, b) => a.vehicleClass.displayOrder - b.vehicleClass.displayOrder);
}

/**
 * Calculates hourly Daily Tour offers.
 */
export function calculateDailyTourOffers(params: CalculateTourParams): CalculatedTourOffer[] {
  const settings = transferStore.getSettings();
  const paymentMode = params.paymentMode || "online_full";
  const requestedHours = Math.max(4, Math.min(16, Number(params.hours) || 8));
  const vehicleClasses = transferStore.getVehicleClasses();
  const approvedVehicles = transferStore.getSupplierVehicles(undefined, "approved");

  let tour = params.tourIdOrSlug ? transferStore.getTourByIdOrSlug(params.tourIdOrSlug) : undefined;
  if (!tour) {
    const tours = transferStore.getTours(params.hubCity);
    tour = tours[0] || transferStore.getTours()[0];
  }

  const results: CalculatedTourOffer[] = [];

  for (const vc of vehicleClasses) {
    if (params.vehicleClassId && vc.id !== params.vehicleClassId && vc.code !== params.vehicleClassId) {
      continue;
    }

    // Lookup base tour price for this vehicle class
    const priceEntry = tour.prices.find((p) => p.vehicleClassId === vc.id);
    let basePrice = priceEntry?.price || (vc.tier === "group" ? 280 : vc.tier === "vip" ? 220 : 170);

    // If requested hours exceed tour standard hours, add extra hour fee
    const defaultHours = tour.durationHours || 8;
    let extraHoursPrice = 0;
    if (requestedHours > defaultHours) {
      const extraH = requestedHours - defaultHours;
      const ratePerHour = tour.extraHourPrice?.amount || (vc.tier === "vip" ? 25 : 20);
      extraHoursPrice = extraH * ratePerHour;
    }

    const subtotal = basePrice + extraHoursPrice;

    // Payment Mode Discounts
    let paymentDiscount = 0;
    if (paymentMode === "online_full") {
      paymentDiscount = Math.round((subtotal * settings.onlineFullDiscountPercent) / 100);
    } else if (paymentMode === "deposit_half") {
      paymentDiscount = Math.round((subtotal * settings.depositDiscountPercent) / 100);
    }

    const finalTotal = Math.max(50, subtotal - paymentDiscount);
    let deposit = 0;
    let remainingCash = 0;

    if (paymentMode === "online_full") {
      deposit = finalTotal;
      remainingCash = 0;
    } else if (paymentMode === "deposit_half") {
      deposit = Math.round(finalTotal * 0.5);
      remainingCash = finalTotal - deposit;
    } else {
      deposit = 0;
      remainingCash = finalTotal;
    }

    const matchingVehicles = approvedVehicles.filter((v) => v.vehicleClassId === vc.id);
    const primaryVehicle = matchingVehicles[0];

    const matchedVehicle = primaryVehicle
      ? {
          id: primaryVehicle.id,
          make: primaryVehicle.make,
          model: primaryVehicle.model,
          year: primaryVehicle.year,
          plateNumber: primaryVehicle.plateNumber,
          cleanlinessRating: primaryVehicle.cleanlinessRating,
          driver: primaryVehicle.driver,
          images: primaryVehicle.ownImages?.map((img) => img.url) || vc.images.map((i) => i.url),
        }
      : {
          id: `demo-${vc.code}`,
          make: "Mercedes-Benz",
          model: vc.exampleModels[0] || "VIP Lounge",
          year: 2024,
          plateNumber: "34 LONA 2024",
          cleanlinessRating: 99,
          driver: {
            name: "سائق مرشد سياحي خاص",
            phone: "+90 534 231 12 34",
            photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
            languages: ["ar", "en", "tr"],
          },
          images: vc.images.map((i) => i.url),
        };

    results.push({
      tourTitle: tour.title,
      hours: requestedHours,
      vehicleClass: vc,
      basePrice,
      extraHoursPrice,
      paymentModeDiscountAmount: paymentDiscount,
      finalTotal,
      depositAmount: deposit,
      remainingCashOnArrival: remainingCash,
      currency: settings.baseCurrency,
      paymentMode,
      matchedVehicle,
    });
  }

  return results.sort((a, b) => a.vehicleClass.displayOrder - b.vehicleClass.displayOrder);
}
