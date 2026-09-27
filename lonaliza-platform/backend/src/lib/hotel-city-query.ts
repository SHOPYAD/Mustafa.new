const CITY_QUERY: Record<string, string> = {
  jed: "Jeddah",
  jeddah: "Jeddah",
  جدة: "Jeddah",
  جده: "Jeddah",
  saw: "Istanbul",
  ist: "Istanbul",
  istanbul: "Istanbul",
  إسطنبول: "Istanbul",
  اسطنبول: "Istanbul",
  ruh: "Riyadh",
  riyadh: "Riyadh",
  الرياض: "Riyadh",
  dxb: "Dubai",
  dubai: "Dubai",
  دبي: "Dubai",
  auh: "Abu Dhabi",
  "abu dhabi": "Abu Dhabi",
  أبوظبي: "Abu Dhabi",
  ابوظبي: "Abu Dhabi",
  cah: "Cairo",
  cai: "Cairo",
  cairo: "Cairo",
  القاهرة: "Cairo",
  doh: "Doha",
  doha: "Doha",
  الدوحة: "Doha",
  amman: "Amman",
  عمّان: "Amman",
  عمان: "Amman",
  tzx: "Trabzon",
  trabzon: "Trabzon",
  طرابزون: "Trabzon",
  mad: "Madrid",
  madrid: "Madrid",
  مدريد: "Madrid",
  rak: "Marrakech",
  marrakech: "Marrakech",
  marrakesh: "Marrakech",
  مراكش: "Marrakech",
  cmn: "Casablanca",
  casablanca: "Casablanca",
  "الدار البيضاء": "Casablanca",
  كازابلانكا: "Casablanca",
  aga: "Agadir",
  agadir: "Agadir",
  أكادير: "Agadir",
  tng: "Tangier",
  tangier: "Tangier",
  طنجة: "Tangier",
  fes: "Fes",
  فاس: "Fes",
  rabat: "Rabat",
  الرباط: "Rabat",
};

function keyOf(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function hotelCityQuery(raw?: string, airportCode?: string): string {
  const city = String(raw || "").trim();
  const code = String(airportCode || "").trim();
  return CITY_QUERY[keyOf(city)] || CITY_QUERY[keyOf(code)] || city || code;
}

export function stayCheckout(checkIn: string, checkOut?: string, nights = 3): string {
  if (checkOut && checkIn && checkOut > checkIn) return checkOut;
  const start = new Date(`${checkIn || ""}T12:00:00`);
  if (Number.isNaN(start.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 1 + nights);
    return fallback.toISOString().slice(0, 10);
  }
  start.setDate(start.getDate() + Math.max(1, nights));
  return start.toISOString().slice(0, 10);
}

export function stayNights(checkIn: string, checkOut: string, fallback = 3): number {
  const a = new Date(`${checkIn}T12:00:00`).getTime();
  const b = new Date(`${checkOut}T12:00:00`).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return fallback;
  return Math.max(1, Math.round((b - a) / 86400000));
}
