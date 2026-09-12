/* Agent B: public homepage content */

export type PartnerAirlineRecord = {
  iata: string;
  icao: string;
  name: string;
  country: string;
};

export type PartnerHotelCity = "Istanbul" | "Antalya" | "Trabzon";

export type PartnerHotelRecord = {
  id: string;
  name: string;
  nameAr: string;
  city: PartnerHotelCity;
  cityAr: string;
  stars: 4 | 5;
  domain: string;
};

export const KIWI_AIRLINE_LOGO = "https://images.kiwi.com/airlines/64";

export function catalogAirlineLogo(iata: string): string {
  const code = String(iata || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{2,3}$/.test(code)) return "";
  return `${KIWI_AIRLINE_LOGO}/${code}.png`;
}

const LOCAL_HOTEL_LOGOS: Record<string, string> = {
  "fourseasons.com": "/hotels/fourseasons.svg",
  "kempinski.com": "/hotels/kempinski.svg",
  "raffles.com": "/hotels/raffles.svg",
  "cvkhotelsandresorts.com": "/hotels/cvk.svg",
  "ritzcarlton.com": "/hotels/ritzcarlton.svg",
  "mandarinoriental.com": "/hotels/mandarin-oriental.svg",
  "shangri-la.com": "/hotels/shangri-la.svg",
  "swissotel.com": "/hotels/swissotel.svg",
  "peninsula.com": "/hotels/peninsula.svg",
  "sixsenses.com": "/hotels/six-senses.svg",
  "perapalace.com": "/hotels/pera-palace.svg",
  "marriott.com": "/hotels/marriott.svg",
  "fairmont.com": "/hotels/fairmont.svg",
  "hilton.com": "/hotels/hilton.svg",
  "ihg.com": "/hotels/ihg.svg",
  "rixos.com": "/hotels/rixos.svg",
  "titanic.com.tr": "/hotels/titanic.svg",
  "maxxroyal.com": "/hotels/maxx-royal.svg",
  "regnumhotels.com": "/hotels/regnum.svg",
  "calista.com.tr": "/hotels/calista.svg",
  "gloria.com.tr": "/hotels/gloria.svg",
  "corneliaresort.com": "/hotels/cornelia.svg",
  "akrahotels.com": "/hotels/akra.svg",
  "susesihotel.com": "/hotels/susesi.svg",
  "nghotels.com.tr": "/hotels/ng-hotels.svg",
  "limakhotels.com": "/hotels/limak.svg",
  "ichotels.com.tr": "/hotels/ic-hotels.svg",
  "nirvanahotels.com": "/hotels/nirvana.svg",
  "zorlugrand.com": "/hotels/zorlu.svg",
  "accor.com": "/hotels/novotel.svg",
  "radissonhotels.com": "/hotels/radisson.svg",
  "dedeman.com": "/hotels/dedeman.svg",
  "ustaparkhotel.com": "/hotels/usta-park.svg",
  "seralakehotel.com": "/hotels/sera-lake.svg",
  "grandvaves.com": "/hotels/grand-vaves.svg",
  "horonhotel.com": "/hotels/horon.svg",
  "royalrezidans.com": "/hotels/royal-rezidans.svg",
};

export function catalogHotelLogo(domain: string): string {
  const host = String(domain || "").trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
  if (!host) return "";
  return LOCAL_HOTEL_LOGOS[host] || `/hotels/${host.replace(/[^a-z0-9]+/g, "-")}.svg`;
}

/** 112 real carriers for the homepage airlines marquee. */
export const HOMEPAGE_AIRLINES: PartnerAirlineRecord[] = [
  { iata: "EK", icao: "UAE", name: "Emirates", country: "United Arab Emirates" },
  { iata: "EY", icao: "ETD", name: "Etihad Airways", country: "United Arab Emirates" },
  { iata: "QR", icao: "QTR", name: "Qatar Airways", country: "Qatar" },
  { iata: "GF", icao: "GFA", name: "Gulf Air", country: "Bahrain" },
  { iata: "WY", icao: "OMA", name: "Oman Air", country: "Oman" },
  { iata: "SV", icao: "SVA", name: "Saudia", country: "Saudi Arabia" },
  { iata: "XY", icao: "KNE", name: "Flynas", country: "Saudi Arabia" },
  { iata: "F3", icao: "FAD", name: "flyadeal", country: "Saudi Arabia" },
  { iata: "FZ", icao: "FDB", name: "flydubai", country: "United Arab Emirates" },
  { iata: "G9", icao: "ABY", name: "Air Arabia", country: "United Arab Emirates" },
  { iata: "3L", icao: "ADY", name: "Air Arabia Abu Dhabi", country: "United Arab Emirates" },
  { iata: "J9", icao: "JZR", name: "Jazeera Airways", country: "Kuwait" },
  { iata: "KU", icao: "KAC", name: "Kuwait Airways", country: "Kuwait" },
  { iata: "OV", icao: "OMS", name: "SalamAir", country: "Oman" },
  { iata: "RJ", icao: "RJA", name: "Royal Jordanian", country: "Jordan" },
  { iata: "ME", icao: "MEA", name: "Middle East Airlines", country: "Lebanon" },
  { iata: "MS", icao: "MSR", name: "Egyptair", country: "Egypt" },
  { iata: "NP", icao: "NIA", name: "Nile Air", country: "Egypt" },
  { iata: "SM", icao: "MSC", name: "Air Cairo", country: "Egypt" },
  { iata: "IA", icao: "IAW", name: "Iraqi Airways", country: "Iraq" },
  { iata: "IF", icao: "FBA", name: "Fly Baghdad", country: "Iraq" },
  { iata: "CY", icao: "CYP", name: "Cyprus Airways", country: "Cyprus" },
  { iata: "LY", icao: "ELY", name: "El Al", country: "Israel" },
  { iata: "TK", icao: "THY", name: "Turkish Airlines", country: "Turkey" },
  { iata: "PC", icao: "PGT", name: "Pegasus Airlines", country: "Turkey" },
  { iata: "VF", icao: "TKJ", name: "AJet", country: "Turkey" },
  { iata: "XQ", icao: "SXS", name: "SunExpress", country: "Turkey" },
  { iata: "FH", icao: "FHY", name: "Freebird Airlines", country: "Turkey" },
  { iata: "XC", icao: "CAI", name: "Corendon Airlines", country: "Turkey" },
  { iata: "TI", icao: "TWI", name: "Tailwind Airlines", country: "Turkey" },
  { iata: "AT", icao: "RAM", name: "Royal Air Maroc", country: "Morocco" },
  { iata: "TU", icao: "TAR", name: "Tunisair", country: "Tunisia" },
  { iata: "AH", icao: "DAH", name: "Air Algérie", country: "Algeria" },
  { iata: "BJ", icao: "LBT", name: "Nouvelair", country: "Tunisia" },
  { iata: "8U", icao: "AAW", name: "Afriqiyah Airways", country: "Libya" },
  { iata: "LH", icao: "DLH", name: "Lufthansa", country: "Germany" },
  { iata: "BA", icao: "BAW", name: "British Airways", country: "United Kingdom" },
  { iata: "AF", icao: "AFR", name: "Air France", country: "France" },
  { iata: "KL", icao: "KLM", name: "KLM", country: "Netherlands" },
  { iata: "IB", icao: "IBE", name: "Iberia", country: "Spain" },
  { iata: "AZ", icao: "ITY", name: "ITA Airways", country: "Italy" },
  { iata: "LX", icao: "SWR", name: "Swiss", country: "Switzerland" },
  { iata: "OS", icao: "AUA", name: "Austrian Airlines", country: "Austria" },
  { iata: "SN", icao: "BEL", name: "Brussels Airlines", country: "Belgium" },
  { iata: "SK", icao: "SAS", name: "SAS", country: "Sweden" },
  { iata: "AY", icao: "FIN", name: "Finnair", country: "Finland" },
  { iata: "TP", icao: "TAP", name: "TAP Air Portugal", country: "Portugal" },
  { iata: "EI", icao: "EIN", name: "Aer Lingus", country: "Ireland" },
  { iata: "A3", icao: "AEE", name: "Aegean Airlines", country: "Greece" },
  { iata: "W6", icao: "WZZ", name: "Wizz Air", country: "Hungary" },
  { iata: "FR", icao: "RYR", name: "Ryanair", country: "Ireland" },
  { iata: "U2", icao: "EZY", name: "easyJet", country: "United Kingdom" },
  { iata: "LS", icao: "EXS", name: "Jet2.com", country: "United Kingdom" },
  { iata: "EW", icao: "EWG", name: "Eurowings", country: "Germany" },
  { iata: "VY", icao: "VLG", name: "Vueling", country: "Spain" },
  { iata: "DY", icao: "NAX", name: "Norwegian", country: "Norway" },
  { iata: "LO", icao: "LOT", name: "LOT Polish Airlines", country: "Poland" },
  { iata: "OK", icao: "CSA", name: "Czech Airlines", country: "Czechia" },
  { iata: "RO", icao: "ROT", name: "TAROM", country: "Romania" },
  { iata: "JU", icao: "ASL", name: "Air Serbia", country: "Serbia" },
  { iata: "BT", icao: "BTI", name: "airBaltic", country: "Latvia" },
  { iata: "HV", icao: "TRA", name: "Transavia", country: "Netherlands" },
  { iata: "DE", icao: "CFG", name: "Condor", country: "Germany" },
  { iata: "X3", icao: "TUI", name: "TUI fly", country: "Germany" },
  { iata: "V7", icao: "VOE", name: "Volotea", country: "Spain" },
  { iata: "QS", icao: "TVS", name: "Smartwings", country: "Czechia" },
  { iata: "AA", icao: "AAL", name: "American Airlines", country: "United States" },
  { iata: "DL", icao: "DAL", name: "Delta Air Lines", country: "United States" },
  { iata: "UA", icao: "UAL", name: "United Airlines", country: "United States" },
  { iata: "WN", icao: "SWA", name: "Southwest Airlines", country: "United States" },
  { iata: "B6", icao: "JBU", name: "JetBlue", country: "United States" },
  { iata: "AS", icao: "ASA", name: "Alaska Airlines", country: "United States" },
  { iata: "NK", icao: "NKS", name: "Spirit Airlines", country: "United States" },
  { iata: "F9", icao: "FFT", name: "Frontier Airlines", country: "United States" },
  { iata: "HA", icao: "HAL", name: "Hawaiian Airlines", country: "United States" },
  { iata: "AC", icao: "ACA", name: "Air Canada", country: "Canada" },
  { iata: "WS", icao: "WJA", name: "WestJet", country: "Canada" },
  { iata: "AM", icao: "AMX", name: "Aeroméxico", country: "Mexico" },
  { iata: "SQ", icao: "SIA", name: "Singapore Airlines", country: "Singapore" },
  { iata: "CX", icao: "CPA", name: "Cathay Pacific", country: "Hong Kong" },
  { iata: "NH", icao: "ANA", name: "ANA", country: "Japan" },
  { iata: "JL", icao: "JAL", name: "Japan Airlines", country: "Japan" },
  { iata: "KE", icao: "KAL", name: "Korean Air", country: "South Korea" },
  { iata: "OZ", icao: "AAR", name: "Asiana Airlines", country: "South Korea" },
  { iata: "CI", icao: "CAL", name: "China Airlines", country: "Taiwan" },
  { iata: "BR", icao: "EVA", name: "EVA Air", country: "Taiwan" },
  { iata: "TG", icao: "THA", name: "Thai Airways", country: "Thailand" },
  { iata: "MH", icao: "MAS", name: "Malaysia Airlines", country: "Malaysia" },
  { iata: "GA", icao: "GIA", name: "Garuda Indonesia", country: "Indonesia" },
  { iata: "PR", icao: "PAL", name: "Philippine Airlines", country: "Philippines" },
  { iata: "VN", icao: "HVN", name: "Vietnam Airlines", country: "Vietnam" },
  { iata: "QF", icao: "QFA", name: "Qantas", country: "Australia" },
  { iata: "NZ", icao: "ANZ", name: "Air New Zealand", country: "New Zealand" },
  { iata: "AI", icao: "AIC", name: "Air India", country: "India" },
  { iata: "6E", icao: "IGO", name: "IndiGo", country: "India" },
  { iata: "UK", icao: "VTI", name: "Vistara", country: "India" },
  { iata: "SG", icao: "SEJ", name: "SpiceJet", country: "India" },
  { iata: "CA", icao: "CCA", name: "Air China", country: "China" },
  { iata: "MU", icao: "CES", name: "China Eastern", country: "China" },
  { iata: "CZ", icao: "CSN", name: "China Southern", country: "China" },
  { iata: "HU", icao: "CHH", name: "Hainan Airlines", country: "China" },
  { iata: "TR", icao: "TGW", name: "Scoot", country: "Singapore" },
  { iata: "AK", icao: "AXM", name: "AirAsia", country: "Malaysia" },
  { iata: "FD", icao: "AIQ", name: "Thai AirAsia", country: "Thailand" },
  { iata: "5J", icao: "CEB", name: "Cebu Pacific", country: "Philippines" },
  { iata: "D7", icao: "XAX", name: "AirAsia X", country: "Malaysia" },
  { iata: "ET", icao: "ETH", name: "Ethiopian Airlines", country: "Ethiopia" },
  { iata: "KQ", icao: "KQA", name: "Kenya Airways", country: "Kenya" },
  { iata: "SA", icao: "SAA", name: "South African Airways", country: "South Africa" },
  { iata: "WB", icao: "RWD", name: "RwandAir", country: "Rwanda" },
  { iata: "HM", icao: "SEY", name: "Air Seychelles", country: "Seychelles" },
  { iata: "KC", icao: "KZR", name: "Air Astana", country: "Kazakhstan" },
  { iata: "HY", icao: "UZB", name: "Uzbekistan Airways", country: "Uzbekistan" },
  { iata: "J2", icao: "AHY", name: "Azerbaijan Airlines", country: "Azerbaijan" },
  { iata: "A9", icao: "TGZ", name: "Georgian Airways", country: "Georgia" },
  { iata: "IR", icao: "IRA", name: "Iran Air", country: "Iran" },
  { iata: "W5", icao: "IRM", name: "Mahan Air", country: "Iran" },
];

/** Luxury 4–5★ properties in Istanbul, Antalya, and Trabzon. */
export const HOMEPAGE_HOTELS: PartnerHotelRecord[] = [
  { id: "fs-sultanahmet", name: "Four Seasons Hotel Istanbul at Sultanahmet", nameAr: "فورسيزونز السلطان أحمد", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "fourseasons.com" },
  { id: "fs-bosphorus", name: "Four Seasons Hotel Istanbul at the Bosphorus", nameAr: "فورسيزونز البوسفور", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "fourseasons.com" },
  { id: "ciragan-kempinski", name: "Çırağan Palace Kempinski Istanbul", nameAr: "قصر تشراغان كمبينسكي", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "kempinski.com" },
  { id: "raffles-ist", name: "Raffles Istanbul", nameAr: "رافلز إسطنبول", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "raffles.com" },
  { id: "cvk-park", name: "CVK Park Bosphorus Hotel Istanbul", nameAr: "سي في كيه بارك البوسفور", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "cvkhotelsandresorts.com" },
  { id: "ritz-ist", name: "The Ritz-Carlton, Istanbul", nameAr: "ريتز كارلتون إسطنبول", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "ritzcarlton.com" },
  { id: "mo-bosphorus", name: "Mandarin Oriental Bosphorus, Istanbul", nameAr: "ماندارين أورينتال البوسفور", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "mandarinoriental.com" },
  { id: "shangri-la-ist", name: "Shangri-La Bosphorus, Istanbul", nameAr: "شانغريلا البوسفور", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "shangri-la.com" },
  { id: "swissotel-ist", name: "Swissôtel The Bosphorus Istanbul", nameAr: "سويسوتيل البوسفور", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "swissotel.com" },
  { id: "peninsula-ist", name: "The Peninsula Istanbul", nameAr: "ذا بنينسولا إسطنبول", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "peninsula.com" },
  { id: "six-senses-ist", name: "Six Senses Kocatas Mansions, Istanbul", nameAr: "سيكس سنسز قوجاتاش", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "sixsenses.com" },
  { id: "pera-palace", name: "Pera Palace Hotel", nameAr: "بيرا بالاس", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "perapalace.com" },
  { id: "st-regis-ist", name: "The St. Regis Istanbul", nameAr: "سانت ريجيس إسطنبول", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "marriott.com" },
  { id: "fairmont-ist", name: "Fairmont Quasar Istanbul", nameAr: "فيرمونت كوازار", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "fairmont.com" },
  { id: "jw-bosphorus", name: "JW Marriott Istanbul Bosphorus", nameAr: "جي دبليو ماريوت البوسفور", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "marriott.com" },
  { id: "conrad-ist", name: "Conrad Istanbul Bosphorus", nameAr: "كونراد البوسفور", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "hilton.com" },
  { id: "hilton-bosphorus", name: "Hilton Istanbul Bosphorus", nameAr: "هيلتون إسطنبول البوسفور", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "hilton.com" },
  { id: "intercont-ist", name: "InterContinental Istanbul", nameAr: "إنتركونتيننتال إسطنبول", city: "Istanbul", cityAr: "إسطنبول", stars: 5, domain: "ihg.com" },
  { id: "rixos-belek", name: "Rixos Premium Belek", nameAr: "ريكوس بريميوم بيليك", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "rixos.com" },
  { id: "rixos-sungate", name: "Rixos Sungate", nameAr: "ريكوس صن غيت", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "rixos.com" },
  { id: "titanic-mardan", name: "Titanic Mardan Palace", nameAr: "تيتانيك مردان بالاس", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "titanic.com.tr" },
  { id: "titanic-lara", name: "Titanic Deluxe Lara", nameAr: "تيتانيك ديلوكس لارا", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "titanic.com.tr" },
  { id: "maxx-belek", name: "Maxx Royal Belek Golf Resort", nameAr: "ماكس رويال بيليك", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "maxxroyal.com" },
  { id: "maxx-kemer", name: "Maxx Royal Kemer Resort", nameAr: "ماكس رويال كمر", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "maxxroyal.com" },
  { id: "regnum-carya", name: "Regnum Carya", nameAr: "ريغنوم كاريا", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "regnumhotels.com" },
  { id: "calista", name: "Calista Luxury Resort", nameAr: "كاليستا لاكشري", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "calista.com.tr" },
  { id: "gloria-serenity", name: "Gloria Serenity Resort", nameAr: "غلوريا سيرينيتي", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "gloria.com.tr" },
  { id: "cornelia-diamond", name: "Cornelia Diamond Golf Resort & Spa", nameAr: "كورنيليا دايموند", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "corneliaresort.com" },
  { id: "akra", name: "Akra Hotel", nameAr: "أكرا أنطاليا", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "akrahotels.com" },
  { id: "susesi", name: "Susesi Luxury Resort", nameAr: "سوسيسي لاكشري", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "susesihotel.com" },
  { id: "ng-phaselis", name: "NG Phaselis Bay", nameAr: "إن جي فاسيليس باي", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "nghotels.com.tr" },
  { id: "limak-lara", name: "Limak Lara Deluxe Hotel & Resort", nameAr: "ليماك لارا ديلوكس", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "limakhotels.com" },
  { id: "ic-green", name: "IC Hotels Green Palace", nameAr: "آي سي جرين بالاس", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "ichotels.com.tr" },
  { id: "nirvana-cosmo", name: "Nirvana Cosmopolitan", nameAr: "نيرفانا كوزموبوليتان", city: "Antalya", cityAr: "أنطاليا", stars: 5, domain: "nirvanahotels.com" },
  { id: "zorlu-grand", name: "Zorlu Grand Hotel", nameAr: "زورلو جراند هوتيل", city: "Trabzon", cityAr: "طرابزون", stars: 5, domain: "zorlugrand.com" },
  { id: "novotel-tzx", name: "Novotel Trabzon", nameAr: "نوفوتيل طرابزون", city: "Trabzon", cityAr: "طرابزون", stars: 5, domain: "accor.com" },
  { id: "hgi-tzx", name: "Hilton Garden Inn Trabzon", nameAr: "هيلتون جاردن إن طرابزون", city: "Trabzon", cityAr: "طرابزون", stars: 4, domain: "hilton.com" },
  { id: "radisson-tzx", name: "Radisson Blu Hotel Trabzon", nameAr: "راديسون بلو طرابزون", city: "Trabzon", cityAr: "طرابزون", stars: 5, domain: "radissonhotels.com" },
  { id: "dedeman-tzx", name: "Park Dedeman Trabzon", nameAr: "بارك ديديمان طرابزون", city: "Trabzon", cityAr: "طرابزون", stars: 4, domain: "dedeman.com" },
  { id: "usta-park", name: "Usta Park Hotel", nameAr: "أوستا بارك", city: "Trabzon", cityAr: "طرابزون", stars: 4, domain: "ustaparkhotel.com" },
  { id: "sera-lake", name: "Sera Lake Resort Hotel", nameAr: "سيرا ليك ريزورت", city: "Trabzon", cityAr: "طرابزون", stars: 5, domain: "seralakehotel.com" },
  { id: "grand-vaves", name: "Grand Vaves Hotel", nameAr: "جراند فافيس", city: "Trabzon", cityAr: "طرابزون", stars: 4, domain: "grandvaves.com" },
  { id: "horon", name: "Horon Hotel", nameAr: "هورون هوتيل", city: "Trabzon", cityAr: "طرابزون", stars: 4, domain: "horonhotel.com" },
  { id: "royal-rezidans", name: "Royal Rezidans Trabzon", nameAr: "رويال رزدانس طرابزون", city: "Trabzon", cityAr: "طرابزون", stars: 4, domain: "royalrezidans.com" },
];

export const FEATURED_TRAVEL_PARTNERS = [
  { id: "tk", name: "Turkish Airlines", logoUrl: catalogAirlineLogo("TK") },
  { id: "pc", name: "Pegasus", logoUrl: catalogAirlineLogo("PC") },
  { id: "ek", name: "Emirates", logoUrl: catalogAirlineLogo("EK") },
  { id: "qr", name: "Qatar Airways", logoUrl: catalogAirlineLogo("QR") },
  { id: "booking", name: "Booking.com", logoUrl: "/partners/booking.svg" },
  { id: "hilton", name: "Hilton", logoUrl: "/hotels/hilton.svg" },
  { id: "marriott", name: "Marriott", logoUrl: "/hotels/marriott.svg" },
  { id: "rixos", name: "Rixos", logoUrl: "/hotels/rixos.svg" },
] as const;

export type CatalogAirlineLogo = {
  iata: string;
  name: string;
  logoUrl: string;
};

export type CatalogHotelLogo = {
  id: string;
  name: string;
  nameAr: string;
  city: PartnerHotelCity;
  cityAr: string;
  stars: 4 | 5;
  logoUrl: string;
};

/** Client-safe bundled catalogs — first paint + API fallback so tracks are never empty. */
export const FALLBACK_AIRLINE_LOGOS: CatalogAirlineLogo[] = HOMEPAGE_AIRLINES.map((row) => ({
  iata: row.iata,
  name: row.name,
  logoUrl: catalogAirlineLogo(row.iata),
}));

const HOTEL_ID_LOGOS: Record<string, string> = {
  "st-regis-ist": "/hotels/st-regis.svg",
  "jw-bosphorus": "/hotels/jw-marriott.svg",
  "conrad-ist": "/hotels/conrad.svg",
  "hgi-tzx": "/hotels/hilton-garden-inn.svg",
};

export const FALLBACK_HOTEL_LOGOS: CatalogHotelLogo[] = HOMEPAGE_HOTELS.map((row) => ({
  id: row.id,
  name: row.name,
  nameAr: row.nameAr,
  city: row.city,
  cityAr: row.cityAr,
  stars: row.stars,
  logoUrl: HOTEL_ID_LOGOS[row.id] || catalogHotelLogo(row.domain),
}));

/** Repeat items until the row is wider than a 4K viewport even before CSS duplicates the track. */
export function fillMarqueeItems<T>(items: readonly T[], minCount = 24): T[] {
  if (!items.length) return [];
  const out: T[] = [];
  while (out.length < minCount) {
    out.push(...items);
  }
  return out;
}
