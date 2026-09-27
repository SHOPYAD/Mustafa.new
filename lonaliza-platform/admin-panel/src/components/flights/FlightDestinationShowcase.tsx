"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plane,
  Sparkles,
  Timer,
  Tag,
  Calendar,
  Compass,
} from "lucide-react";
import AirlineLogo from "@/components/flights/AirlineLogo";
import DestinationCityImage from "@/components/flights/DestinationCityImage";
import type { AirportPick } from "@/components/flights/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { cn } from "@/lib/utils";

interface CityDeal {
  id: string;
  nameAr: string;
  nameEn: string;
  iata: string;
  skyId: string;
  entityId: string;
  countryAr: string;
  countryEn: string;
  image: string;
  priceUsd: number;
  airlineCode: string;
  airlineNameAr: string;
  airlineNameEn: string;
  isDirect: boolean;
  flightDuration: string;
}

interface CountryTab {
  id: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  cities: CityDeal[];
}

const COUNTRIES_DATA: CountryTab[] = [
  {
    id: "turkey",
    nameAr: "تركيا",
    nameEn: "Turkey",
    flag: "🇹🇷",
    cities: [
      {
        id: "ist",
        nameAr: "إسطنبول",
        nameEn: "Istanbul",
        iata: "IST",
        skyId: "ISTA",
        entityId: "27542903",
        countryAr: "تركيا",
        countryEn: "Turkey",
        image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
        priceUsd: 135,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: true,
        flightDuration: "3h 40m",
      },
      {
        id: "ayt",
        nameAr: "أنطاليا",
        nameEn: "Antalya",
        iata: "AYT",
        skyId: "AYT",
        entityId: "27539659",
        countryAr: "تركيا",
        countryEn: "Turkey",
        image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80",
        priceUsd: 148,
        airlineCode: "PC",
        airlineNameAr: "بيغاسوس",
        airlineNameEn: "Pegasus Airlines",
        isDirect: true,
        flightDuration: "4h 10m",
      },
      {
        id: "bjv",
        nameAr: "بودروم",
        nameEn: "Bodrum",
        iata: "BJV",
        skyId: "BJV",
        entityId: "27539682",
        countryAr: "تركيا",
        countryEn: "Turkey",
        image: "https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800&q=80",
        priceUsd: 165,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "5h 25m",
      },
      {
        id: "tzx",
        nameAr: "طرابزون",
        nameEn: "Trabzon",
        iata: "TZX",
        skyId: "TZX",
        entityId: "27539828",
        countryAr: "تركيا",
        countryEn: "Turkey",
        image: "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800&q=80",
        priceUsd: 155,
        airlineCode: "F3",
        airlineNameAr: "طيران ناس",
        airlineNameEn: "flynas",
        isDirect: true,
        flightDuration: "3h 55m",
      },
      {
        id: "nav",
        nameAr: "كابادوكيا",
        nameEn: "Cappadocia",
        iata: "NAV",
        skyId: "NAV",
        entityId: "27539744",
        countryAr: "تركيا",
        countryEn: "Turkey",
        image: "https://images.unsplash.com/photo-1609137144822-0d1275d27d75?w=800&q=80",
        priceUsd: 172,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "5h 45m",
      },
      {
        id: "adb",
        nameAr: "إزمير",
        nameEn: "Izmir",
        iata: "ADB",
        skyId: "ADB",
        entityId: "27539660",
        countryAr: "تركيا",
        countryEn: "Turkey",
        image: "https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800&q=80",
        priceUsd: 142,
        airlineCode: "PC",
        airlineNameAr: "بيغاسوس",
        airlineNameEn: "Pegasus Airlines",
        isDirect: false,
        flightDuration: "5h 15m",
      },
      {
        id: "yei",
        nameAr: "بورصة",
        nameEn: "Bursa",
        iata: "YEI",
        skyId: "YEI",
        entityId: "27539839",
        countryAr: "تركيا",
        countryEn: "Turkey",
        image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80",
        priceUsd: 160,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "5h 30m",
      },
      {
        id: "dlm",
        nameAr: "فتحية / دالامان",
        nameEn: "Fethiye / Dalaman",
        iata: "DLM",
        skyId: "DLM",
        entityId: "27539662",
        countryAr: "تركيا",
        countryEn: "Turkey",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        priceUsd: 158,
        airlineCode: "PC",
        airlineNameAr: "بيغاسوس",
        airlineNameEn: "Pegasus Airlines",
        isDirect: false,
        flightDuration: "5h 20m",
      },
      {
        id: "esb",
        nameAr: "أنقرة",
        nameEn: "Ankara",
        iata: "ESB",
        skyId: "ESB",
        entityId: "27539661",
        countryAr: "تركيا",
        countryEn: "Turkey",
        image: "https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800&q=80",
        priceUsd: 139,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: true,
        flightDuration: "3h 50m",
      },
      {
        id: "ada",
        nameAr: "أضنة",
        nameEn: "Adana",
        iata: "ADA",
        skyId: "ADA",
        entityId: "27539657",
        countryAr: "تركيا",
        countryEn: "Turkey",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
        priceUsd: 145,
        airlineCode: "PC",
        airlineNameAr: "بيغاسوس",
        airlineNameEn: "Pegasus Airlines",
        isDirect: false,
        flightDuration: "5h 10m",
      },
    ],
  },
  {
    id: "france",
    nameAr: "فرنسا",
    nameEn: "France",
    flag: "🇫🇷",
    cities: [
      {
        id: "cdg",
        nameAr: "باريس",
        nameEn: "Paris",
        iata: "CDG",
        skyId: "PARI",
        entityId: "27539733",
        countryAr: "فرنسا",
        countryEn: "France",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
        priceUsd: 210,
        airlineCode: "AF",
        airlineNameAr: "الخطوط الفرنسية",
        airlineNameEn: "Air France",
        isDirect: true,
        flightDuration: "5h 45m",
      },
      {
        id: "nce",
        nameAr: "نيس",
        nameEn: "Nice",
        iata: "NCE",
        skyId: "NCE",
        entityId: "27539719",
        countryAr: "فرنسا",
        countryEn: "France",
        image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80",
        priceUsd: 235,
        airlineCode: "AF",
        airlineNameAr: "الخطوط الفرنسية",
        airlineNameEn: "Air France",
        isDirect: false,
        flightDuration: "7h 15m",
      },
      {
        id: "lys",
        nameAr: "ليون",
        nameEn: "Lyon",
        iata: "LYS",
        skyId: "LYS",
        entityId: "27539715",
        countryAr: "فرنسا",
        countryEn: "France",
        image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&q=80",
        priceUsd: 228,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "7h 40m",
      },
      {
        id: "mrs",
        nameAr: "مرسيليا",
        nameEn: "Marseille",
        iata: "MRS",
        skyId: "MRS",
        entityId: "27539717",
        countryAr: "فرنسا",
        countryEn: "France",
        image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&q=80",
        priceUsd: 245,
        airlineCode: "AF",
        airlineNameAr: "الخطوط الفرنسية",
        airlineNameEn: "Air France",
        isDirect: false,
        flightDuration: "7h 50m",
      },
      {
        id: "bod",
        nameAr: "بوردو",
        nameEn: "Bordeaux",
        iata: "BOD",
        skyId: "BOD",
        entityId: "27539702",
        countryAr: "فرنسا",
        countryEn: "France",
        image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80",
        priceUsd: 250,
        airlineCode: "AF",
        airlineNameAr: "الخطوط الفرنسية",
        airlineNameEn: "Air France",
        isDirect: false,
        flightDuration: "8h 10m",
      },
      {
        id: "sxb",
        nameAr: "ستراسبورغ",
        nameEn: "Strasbourg",
        iata: "SXB",
        skyId: "SXB",
        entityId: "27539739",
        countryAr: "فرنسا",
        countryEn: "France",
        image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&q=80",
        priceUsd: 260,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "7h 35m",
      },
      {
        id: "tls",
        nameAr: "تولوز",
        nameEn: "Toulouse",
        iata: "TLS",
        skyId: "TLS",
        entityId: "27539741",
        countryAr: "فرنسا",
        countryEn: "France",
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
        priceUsd: 240,
        airlineCode: "AF",
        airlineNameAr: "الخطوط الفرنسية",
        airlineNameEn: "Air France",
        isDirect: false,
        flightDuration: "8h 00m",
      },
      {
        id: "ceq",
        nameAr: "كان",
        nameEn: "Cannes",
        iata: "NCE",
        skyId: "NCE",
        entityId: "27539719",
        countryAr: "فرنسا",
        countryEn: "France",
        image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80",
        priceUsd: 238,
        airlineCode: "AF",
        airlineNameAr: "الخطوط الفرنسية",
        airlineNameEn: "Air France",
        isDirect: false,
        flightDuration: "7h 20m",
      },
      {
        id: "lil",
        nameAr: "ليل",
        nameEn: "Lille",
        iata: "LIL",
        skyId: "LIL",
        entityId: "27539714",
        countryAr: "فرنسا",
        countryEn: "France",
        image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80",
        priceUsd: 255,
        airlineCode: "AF",
        airlineNameAr: "الخطوط الفرنسية",
        airlineNameEn: "Air France",
        isDirect: false,
        flightDuration: "8h 25m",
      },
      {
        id: "nte",
        nameAr: "نانت",
        nameEn: "Nantes",
        iata: "NTE",
        skyId: "NTE",
        entityId: "27539722",
        countryAr: "فرنسا",
        countryEn: "France",
        image: "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=800&q=80",
        priceUsd: 265,
        airlineCode: "AF",
        airlineNameAr: "الخطوط الفرنسية",
        airlineNameEn: "Air France",
        isDirect: false,
        flightDuration: "8h 35m",
      },
    ],
  },
  {
    id: "morocco",
    nameAr: "المغرب",
    nameEn: "Morocco",
    flag: "🇲🇦",
    cities: [
      {
        id: "rak",
        nameAr: "مراكش",
        nameEn: "Marrakech",
        iata: "RAK",
        skyId: "RAK",
        entityId: "27539791",
        countryAr: "المغرب",
        countryEn: "Morocco",
        image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80",
        priceUsd: 195,
        airlineCode: "AT",
        airlineNameAr: "الخطوط الملكية المغربية",
        airlineNameEn: "Royal Air Maroc",
        isDirect: true,
        flightDuration: "6h 15m",
      },
      {
        id: "cmn",
        nameAr: "الدار البيضاء",
        nameEn: "Casablanca",
        iata: "CMN",
        skyId: "CASB",
        entityId: "27539773",
        countryAr: "المغرب",
        countryEn: "Morocco",
        image: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80",
        priceUsd: 185,
        airlineCode: "AT",
        airlineNameAr: "الخطوط الملكية المغربية",
        airlineNameEn: "Royal Air Maroc",
        isDirect: true,
        flightDuration: "5h 50m",
      },
      {
        id: "tng",
        nameAr: "طنجة",
        nameEn: "Tangier",
        iata: "TNG",
        skyId: "TNG",
        entityId: "27539824",
        countryAr: "المغرب",
        countryEn: "Morocco",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
        priceUsd: 210,
        airlineCode: "AT",
        airlineNameAr: "الخطوط الملكية المغربية",
        airlineNameEn: "Royal Air Maroc",
        isDirect: false,
        flightDuration: "7h 20m",
      },
      {
        id: "fez",
        nameAr: "فاس",
        nameEn: "Fes",
        iata: "FEZ",
        skyId: "FEZ",
        entityId: "27539780",
        countryAr: "المغرب",
        countryEn: "Morocco",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80",
        priceUsd: 215,
        airlineCode: "AT",
        airlineNameAr: "الخطوط الملكية المغربية",
        airlineNameEn: "Royal Air Maroc",
        isDirect: false,
        flightDuration: "7h 35m",
      },
      {
        id: "aga",
        nameAr: "أكادير",
        nameEn: "Agadir",
        iata: "AGA",
        skyId: "AGA",
        entityId: "27539766",
        countryAr: "المغرب",
        countryEn: "Morocco",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        priceUsd: 220,
        airlineCode: "AT",
        airlineNameAr: "الخطوط الملكية المغربية",
        airlineNameEn: "Royal Air Maroc",
        isDirect: false,
        flightDuration: "7h 55m",
      },
      {
        id: "rba",
        nameAr: "الرباط",
        nameEn: "Rabat",
        iata: "RBA",
        skyId: "RBA",
        entityId: "27539790",
        countryAr: "المغرب",
        countryEn: "Morocco",
        image: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=800&q=80",
        priceUsd: 200,
        airlineCode: "AT",
        airlineNameAr: "الخطوط الملكية المغربية",
        airlineNameEn: "Royal Air Maroc",
        isDirect: false,
        flightDuration: "7h 10m",
      },
      {
        id: "ttu",
        nameAr: "تطوان / شفشاون",
        nameEn: "Tetouan / Chefchaouen",
        iata: "TTU",
        skyId: "TTU",
        entityId: "27539825",
        countryAr: "المغرب",
        countryEn: "Morocco",
        image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
        priceUsd: 230,
        airlineCode: "AT",
        airlineNameAr: "الخطوط الملكية المغربية",
        airlineNameEn: "Royal Air Maroc",
        isDirect: false,
        flightDuration: "8h 15m",
      },
      {
        id: "esu",
        nameAr: "الصويرة",
        nameEn: "Essaouira",
        iata: "ESU",
        skyId: "ESU",
        entityId: "27539779",
        countryAr: "المغرب",
        countryEn: "Morocco",
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
        priceUsd: 225,
        airlineCode: "AT",
        airlineNameAr: "الخطوط الملكية المغربية",
        airlineNameEn: "Royal Air Maroc",
        isDirect: false,
        flightDuration: "8h 00m",
      },
      {
        id: "oud",
        nameAr: "وجدة",
        nameEn: "Oujda",
        iata: "OUD",
        skyId: "OUD",
        entityId: "27539788",
        countryAr: "المغرب",
        countryEn: "Morocco",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
        priceUsd: 235,
        airlineCode: "AT",
        airlineNameAr: "الخطوط الملكية المغربية",
        airlineNameEn: "Royal Air Maroc",
        isDirect: false,
        flightDuration: "8h 30m",
      },
      {
        id: "ozz",
        nameAr: "ورزازات",
        nameEn: "Ouarzazate",
        iata: "OZZ",
        skyId: "OZZ",
        entityId: "27539789",
        countryAr: "المغرب",
        countryEn: "Morocco",
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
        priceUsd: 245,
        airlineCode: "AT",
        airlineNameAr: "الخطوط الملكية المغربية",
        airlineNameEn: "Royal Air Maroc",
        isDirect: false,
        flightDuration: "8h 45m",
      },
    ],
  },
  {
    id: "thailand",
    nameAr: "تايلاند",
    nameEn: "Thailand",
    flag: "🇹🇭",
    cities: [
      {
        id: "bkk",
        nameAr: "بانكوك",
        nameEn: "Bangkok",
        iata: "BKK",
        skyId: "BKKT",
        entityId: "27539860",
        countryAr: "تايلاند",
        countryEn: "Thailand",
        image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
        priceUsd: 260,
        airlineCode: "TG",
        airlineNameAr: "الخطوط التايلاندية",
        airlineNameEn: "Thai Airways",
        isDirect: true,
        flightDuration: "7h 30m",
      },
      {
        id: "hkt",
        nameAr: "بوكيت",
        nameEn: "Phuket",
        iata: "HKT",
        skyId: "HKT",
        entityId: "27539866",
        countryAr: "تايلاند",
        countryEn: "Thailand",
        image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80",
        priceUsd: 275,
        airlineCode: "TG",
        airlineNameAr: "الخطوط التايلاندية",
        airlineNameEn: "Thai Airways",
        isDirect: true,
        flightDuration: "8h 00m",
      },
      {
        id: "cnx",
        nameAr: "تشيانغ ماي",
        nameEn: "Chiang Mai",
        iata: "CNX",
        skyId: "CNX",
        entityId: "27539862",
        countryAr: "تايلاند",
        countryEn: "Thailand",
        image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
        priceUsd: 290,
        airlineCode: "TG",
        airlineNameAr: "الخطوط التايلاندية",
        airlineNameEn: "Thai Airways",
        isDirect: false,
        flightDuration: "9h 30m",
      },
      {
        id: "usm",
        nameAr: "كوه ساموي",
        nameEn: "Koh Samui",
        iata: "USM",
        skyId: "USM",
        entityId: "27539872",
        countryAr: "تايلاند",
        countryEn: "Thailand",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
        priceUsd: 310,
        airlineCode: "PG",
        airlineNameAr: "بانكوك أيرويز",
        airlineNameEn: "Bangkok Airways",
        isDirect: false,
        flightDuration: "9h 45m",
      },
      {
        id: "kbv",
        nameAr: "كرابي",
        nameEn: "Krabi",
        iata: "KBV",
        skyId: "KBV",
        entityId: "27539864",
        countryAr: "تايلاند",
        countryEn: "Thailand",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
        priceUsd: 285,
        airlineCode: "TG",
        airlineNameAr: "الخطوط التايلاندية",
        airlineNameEn: "Thai Airways",
        isDirect: false,
        flightDuration: "9h 20m",
      },
      {
        id: "utp",
        nameAr: "باتايا",
        nameEn: "Pattaya",
        iata: "UTP",
        skyId: "UTP",
        entityId: "27539873",
        countryAr: "تايلاند",
        countryEn: "Thailand",
        image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80",
        priceUsd: 270,
        airlineCode: "TG",
        airlineNameAr: "الخطوط التايلاندية",
        airlineNameEn: "Thai Airways",
        isDirect: false,
        flightDuration: "9h 10m",
      },
      {
        id: "hhq",
        nameAr: "هوا هين",
        nameEn: "Hua Hin",
        iata: "HHQ",
        skyId: "HHQ",
        entityId: "27539863",
        countryAr: "تايلاند",
        countryEn: "Thailand",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        priceUsd: 295,
        airlineCode: "TG",
        airlineNameAr: "الخطوط التايلاندية",
        airlineNameEn: "Thai Airways",
        isDirect: false,
        flightDuration: "9h 50m",
      },
      {
        id: "urt",
        nameAr: "سورات ثاني",
        nameEn: "Surat Thani",
        iata: "URT",
        skyId: "URT",
        entityId: "27539871",
        countryAr: "تايلاند",
        countryEn: "Thailand",
        image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80",
        priceUsd: 290,
        airlineCode: "FD",
        airlineNameAr: "طيران آسيا",
        airlineNameEn: "AirAsia",
        isDirect: false,
        flightDuration: "10h 15m",
      },
      {
        id: "cei",
        nameAr: "تشيانغ راي",
        nameEn: "Chiang Rai",
        iata: "CEI",
        skyId: "CEI",
        entityId: "27539861",
        countryAr: "تايلاند",
        countryEn: "Thailand",
        image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
        priceUsd: 305,
        airlineCode: "TG",
        airlineNameAr: "الخطوط التايلاندية",
        airlineNameEn: "Thai Airways",
        isDirect: false,
        flightDuration: "10h 30m",
      },
      {
        id: "uth",
        nameAr: "أودون ثاني",
        nameEn: "Udon Thani",
        iata: "UTH",
        skyId: "UTH",
        entityId: "27539874",
        countryAr: "تايلاند",
        countryEn: "Thailand",
        image: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80",
        priceUsd: 315,
        airlineCode: "TG",
        airlineNameAr: "الخطوط التايلاندية",
        airlineNameEn: "Thai Airways",
        isDirect: false,
        flightDuration: "10h 40m",
      },
    ],
  },
  {
    id: "indonesia",
    nameAr: "إندونيسيا",
    nameEn: "Indonesia",
    flag: "🇮🇩",
    cities: [
      {
        id: "dps",
        nameAr: "بالي",
        nameEn: "Bali",
        iata: "DPS",
        skyId: "DPS",
        entityId: "27539893",
        countryAr: "إندونيسيا",
        countryEn: "Indonesia",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
        priceUsd: 295,
        airlineCode: "GA",
        airlineNameAr: "جارودا إندونيسيا",
        airlineNameEn: "Garuda Indonesia",
        isDirect: true,
        flightDuration: "9h 15m",
      },
      {
        id: "cgk",
        nameAr: "جاكرتا",
        nameEn: "Jakarta",
        iata: "CGK",
        skyId: "JKTA",
        entityId: "27539890",
        countryAr: "إندونيسيا",
        countryEn: "Indonesia",
        image: "https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=800&q=80",
        priceUsd: 280,
        airlineCode: "GA",
        airlineNameAr: "جارودا إندونيسيا",
        airlineNameEn: "Garuda Indonesia",
        isDirect: true,
        flightDuration: "8h 45m",
      },
      {
        id: "lop",
        nameAr: "لومبوك",
        nameEn: "Lombok",
        iata: "LOP",
        skyId: "LOP",
        entityId: "27539897",
        countryAr: "إندونيسيا",
        countryEn: "Indonesia",
        image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80",
        priceUsd: 320,
        airlineCode: "GA",
        airlineNameAr: "جارودا إندونيسيا",
        airlineNameEn: "Garuda Indonesia",
        isDirect: false,
        flightDuration: "11h 20m",
      },
      {
        id: "sub",
        nameAr: "سورابايا",
        nameEn: "Surabaya",
        iata: "SUB",
        skyId: "SUB",
        entityId: "27539900",
        countryAr: "إندونيسيا",
        countryEn: "Indonesia",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        priceUsd: 310,
        airlineCode: "GA",
        airlineNameAr: "جارودا إندونيسيا",
        airlineNameEn: "Garuda Indonesia",
        isDirect: false,
        flightDuration: "10h 50m",
      },
      {
        id: "yia",
        nameAr: "يوجياكارتا",
        nameEn: "Yogyakarta",
        iata: "YIA",
        skyId: "YIA",
        entityId: "27539903",
        countryAr: "إندونيسيا",
        countryEn: "Indonesia",
        image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80",
        priceUsd: 325,
        airlineCode: "GA",
        airlineNameAr: "جارودا إندونيسيا",
        airlineNameEn: "Garuda Indonesia",
        isDirect: false,
        flightDuration: "11h 10m",
      },
      {
        id: "bdo",
        nameAr: "باندونغ",
        nameEn: "Bandung",
        iata: "BDO",
        skyId: "BDO",
        entityId: "27539889",
        countryAr: "إندونيسيا",
        countryEn: "Indonesia",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
        priceUsd: 305,
        airlineCode: "GA",
        airlineNameAr: "جارودا إندونيسيا",
        airlineNameEn: "Garuda Indonesia",
        isDirect: false,
        flightDuration: "10h 40m",
      },
      {
        id: "kno",
        nameAr: "ميدان",
        nameEn: "Medan",
        iata: "KNO",
        skyId: "KNO",
        entityId: "27539895",
        countryAr: "إندونيسيا",
        countryEn: "Indonesia",
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
        priceUsd: 315,
        airlineCode: "GA",
        airlineNameAr: "جارودا إندونيسيا",
        airlineNameEn: "Garuda Indonesia",
        isDirect: false,
        flightDuration: "11h 00m",
      },
      {
        id: "lbj",
        nameAr: "لابوان باجو",
        nameEn: "Labuan Bajo",
        iata: "LBJ",
        skyId: "LBJ",
        entityId: "27539896",
        countryAr: "إندونيسيا",
        countryEn: "Indonesia",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        priceUsd: 345,
        airlineCode: "GA",
        airlineNameAr: "جارودا إندونيسيا",
        airlineNameEn: "Garuda Indonesia",
        isDirect: false,
        flightDuration: "12h 15m",
      },
      {
        id: "upg",
        nameAr: "ماكاسار",
        nameEn: "Makassar",
        iata: "UPG",
        skyId: "UPG",
        entityId: "27539901",
        countryAr: "إندونيسيا",
        countryEn: "Indonesia",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
        priceUsd: 330,
        airlineCode: "GA",
        airlineNameAr: "جارودا إندونيسيا",
        airlineNameEn: "Garuda Indonesia",
        isDirect: false,
        flightDuration: "11h 45m",
      },
      {
        id: "bth",
        nameAr: "باتام",
        nameEn: "Batam",
        iata: "BTH",
        skyId: "BTH",
        entityId: "27539891",
        countryAr: "إندونيسيا",
        countryEn: "Indonesia",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80",
        priceUsd: 320,
        airlineCode: "GA",
        airlineNameAr: "جارودا إندونيسيا",
        airlineNameEn: "Garuda Indonesia",
        isDirect: false,
        flightDuration: "11h 30m",
      },
    ],
  },
  {
    id: "spain",
    nameAr: "إسبانيا",
    nameEn: "Spain",
    flag: "🇪🇸",
    cities: [
      {
        id: "mad",
        nameAr: "مدريد",
        nameEn: "Madrid",
        iata: "MAD",
        skyId: "MADR",
        entityId: "27539750",
        countryAr: "إسبانيا",
        countryEn: "Spain",
        image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
        priceUsd: 215,
        airlineCode: "IB",
        airlineNameAr: "الخطوط الإيبيرية",
        airlineNameEn: "Iberia",
        isDirect: true,
        flightDuration: "6h 10m",
      },
      {
        id: "bcn",
        nameAr: "برشلونة",
        nameEn: "Barcelona",
        iata: "BCN",
        skyId: "BCN",
        entityId: "27539745",
        countryAr: "إسبانيا",
        countryEn: "Spain",
        image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
        priceUsd: 205,
        airlineCode: "IB",
        airlineNameAr: "الخطوط الإيبيرية",
        airlineNameEn: "Iberia",
        isDirect: true,
        flightDuration: "5h 55m",
      },
      {
        id: "agp",
        nameAr: "مالقة",
        nameEn: "Malaga",
        iata: "AGP",
        skyId: "AGP",
        entityId: "27539746",
        countryAr: "إسبانيا",
        countryEn: "Spain",
        image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&q=80",
        priceUsd: 225,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "7h 45m",
      },
      {
        id: "svq",
        nameAr: "إشبيلية",
        nameEn: "Seville",
        iata: "SVQ",
        skyId: "SVQ",
        entityId: "27539755",
        countryAr: "إسبانيا",
        countryEn: "Spain",
        image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80",
        priceUsd: 230,
        airlineCode: "IB",
        airlineNameAr: "الخطوط الإيبيرية",
        airlineNameEn: "Iberia",
        isDirect: false,
        flightDuration: "7h 50m",
      },
      {
        id: "vlc",
        nameAr: "فالنسيا",
        nameEn: "Valencia",
        iata: "VLC",
        skyId: "VLC",
        entityId: "27539756",
        countryAr: "إسبانيا",
        countryEn: "Spain",
        image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80",
        priceUsd: 220,
        airlineCode: "IB",
        airlineNameAr: "الخطوط الإيبيرية",
        airlineNameEn: "Iberia",
        isDirect: false,
        flightDuration: "7h 30m",
      },
      {
        id: "pmi",
        nameAr: "مايوركا",
        nameEn: "Mallorca",
        iata: "PMI",
        skyId: "PMI",
        entityId: "27539752",
        countryAr: "إسبانيا",
        countryEn: "Spain",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        priceUsd: 240,
        airlineCode: "IB",
        airlineNameAr: "الخطوط الإيبيرية",
        airlineNameEn: "Iberia",
        isDirect: false,
        flightDuration: "8h 05m",
      },
      {
        id: "ibz",
        nameAr: "إيبيزا",
        nameEn: "Ibiza",
        iata: "IBZ",
        skyId: "IBZ",
        entityId: "27539748",
        countryAr: "إسبانيا",
        countryEn: "Spain",
        image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80",
        priceUsd: 250,
        airlineCode: "IB",
        airlineNameAr: "الخطوط الإيبيرية",
        airlineNameEn: "Iberia",
        isDirect: false,
        flightDuration: "8h 20m",
      },
      {
        id: "grx",
        nameAr: "غرناطة",
        nameEn: "Granada",
        iata: "GRX",
        skyId: "GRX",
        entityId: "27539747",
        countryAr: "إسبانيا",
        countryEn: "Spain",
        image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
        priceUsd: 245,
        airlineCode: "IB",
        airlineNameAr: "الخطوط الإيبيرية",
        airlineNameEn: "Iberia",
        isDirect: false,
        flightDuration: "8h 15m",
      },
      {
        id: "bio",
        nameAr: "بلباو",
        nameEn: "Bilbao",
        iata: "BIO",
        skyId: "BIO",
        entityId: "27539749",
        countryAr: "إسبانيا",
        countryEn: "Spain",
        image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80",
        priceUsd: 255,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "8h 35m",
      },
      {
        id: "alc",
        nameAr: "أليكانتي",
        nameEn: "Alicante",
        iata: "ALC",
        skyId: "ALC",
        entityId: "27539757",
        countryAr: "إسبانيا",
        countryEn: "Spain",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80",
        priceUsd: 235,
        airlineCode: "IB",
        airlineNameAr: "الخطوط الإيبيرية",
        airlineNameEn: "Iberia",
        isDirect: false,
        flightDuration: "7h 55m",
      },
    ],
  },
  {
    id: "uae",
    nameAr: "الإمارات",
    nameEn: "UAE",
    flag: "🇦🇪",
    cities: [
      {
        id: "dxb",
        nameAr: "دبي",
        nameEn: "Dubai",
        iata: "DXB",
        skyId: "DXBA",
        entityId: "27539950",
        countryAr: "الإمارات",
        countryEn: "UAE",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
        priceUsd: 110,
        airlineCode: "EK",
        airlineNameAr: "طيران الإمارات",
        airlineNameEn: "Emirates",
        isDirect: true,
        flightDuration: "1h 55m",
      },
      {
        id: "auh",
        nameAr: "أبوظبي",
        nameEn: "Abu Dhabi",
        iata: "AUH",
        skyId: "AUHA",
        entityId: "27539951",
        countryAr: "الإمارات",
        countryEn: "UAE",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80",
        priceUsd: 95,
        airlineCode: "EY",
        airlineNameAr: "الاتحاد للطيران",
        airlineNameEn: "Etihad Airways",
        isDirect: true,
        flightDuration: "1h 45m",
      },
      {
        id: "shj",
        nameAr: "الشارقة",
        nameEn: "Sharjah",
        iata: "SHJ",
        skyId: "SHJ",
        entityId: "27539952",
        countryAr: "الإمارات",
        countryEn: "UAE",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
        priceUsd: 85,
        airlineCode: "G9",
        airlineNameAr: "العربية للطيران",
        airlineNameEn: "Air Arabia",
        isDirect: true,
        flightDuration: "1h 50m",
      },
      {
        id: "rkt",
        nameAr: "رأس الخيمة",
        nameEn: "Ras Al Khaimah",
        iata: "RKT",
        skyId: "RKT",
        entityId: "27539953",
        countryAr: "الإمارات",
        countryEn: "UAE",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        priceUsd: 115,
        airlineCode: "G9",
        airlineNameAr: "العربية للطيران",
        airlineNameEn: "Air Arabia",
        isDirect: false,
        flightDuration: "3h 10m",
      },
      {
        id: "aan",
        nameAr: "العين",
        nameEn: "Al Ain",
        iata: "AAN",
        skyId: "AAN",
        entityId: "27539954",
        countryAr: "الإمارات",
        countryEn: "UAE",
        image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80",
        priceUsd: 125,
        airlineCode: "EY",
        airlineNameAr: "الاتحاد للطيران",
        airlineNameEn: "Etihad Airways",
        isDirect: false,
        flightDuration: "3h 25m",
      },
      {
        id: "fjr",
        nameAr: "الفجيرة",
        nameEn: "Fujairah",
        iata: "FJR",
        skyId: "FJR",
        entityId: "27539955",
        countryAr: "الإمارات",
        countryEn: "UAE",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        priceUsd: 130,
        airlineCode: "EK",
        airlineNameAr: "طيران الإمارات",
        airlineNameEn: "Emirates",
        isDirect: false,
        flightDuration: "3h 40m",
      },
      {
        id: "ajm",
        nameAr: "عجمان",
        nameEn: "Ajman",
        iata: "DXB",
        skyId: "DXBA",
        entityId: "27539950",
        countryAr: "الإمارات",
        countryEn: "UAE",
        image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80",
        priceUsd: 110,
        airlineCode: "FZ",
        airlineNameAr: "فلاي دبي",
        airlineNameEn: "flydubai",
        isDirect: true,
        flightDuration: "1h 55m",
      },
      {
        id: "xsb",
        nameAr: "صير بني ياس",
        nameEn: "Sir Bani Yas",
        iata: "XSB",
        skyId: "XSB",
        entityId: "27539956",
        countryAr: "الإمارات",
        countryEn: "UAE",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
        priceUsd: 165,
        airlineCode: "EY",
        airlineNameAr: "الاتحاد للطيران",
        airlineNameEn: "Etihad Airways",
        isDirect: false,
        flightDuration: "4h 00m",
      },
      {
        id: "zdy",
        nameAr: "جزيرة دلما",
        nameEn: "Delma Island",
        iata: "ZDY",
        skyId: "ZDY",
        entityId: "27539957",
        countryAr: "الإمارات",
        countryEn: "UAE",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
        priceUsd: 180,
        airlineCode: "EY",
        airlineNameAr: "الاتحاد للطيران",
        airlineNameEn: "Etihad Airways",
        isDirect: false,
        flightDuration: "4h 20m",
      },
      {
        id: "hta",
        nameAr: "حتا الجبلية",
        nameEn: "Hatta",
        iata: "DXB",
        skyId: "DXBA",
        entityId: "27539950",
        countryAr: "الإمارات",
        countryEn: "UAE",
        image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80",
        priceUsd: 110,
        airlineCode: "EK",
        airlineNameAr: "طيران الإمارات",
        airlineNameEn: "Emirates",
        isDirect: true,
        flightDuration: "1h 55m",
      },
    ],
  },
  {
    id: "egypt",
    nameAr: "مصر",
    nameEn: "Egypt",
    flag: "🇪🇬",
    cities: [
      {
        id: "cai",
        nameAr: "القاهرة",
        nameEn: "Cairo",
        iata: "CAI",
        skyId: "CAIR",
        entityId: "27539970",
        countryAr: "مصر",
        countryEn: "Egypt",
        image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80",
        priceUsd: 95,
        airlineCode: "MS",
        airlineNameAr: "مصر للطيران",
        airlineNameEn: "EgyptAir",
        isDirect: true,
        flightDuration: "2h 20m",
      },
      {
        id: "ssh",
        nameAr: "شرم الشيخ",
        nameEn: "Sharm El Sheikh",
        iata: "SSH",
        skyId: "SSH",
        entityId: "27539971",
        countryAr: "مصر",
        countryEn: "Egypt",
        image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80",
        priceUsd: 115,
        airlineCode: "F3",
        airlineNameAr: "طيران ناس",
        airlineNameEn: "flynas",
        isDirect: true,
        flightDuration: "2h 00m",
      },
      {
        id: "hrg",
        nameAr: "الغردقة",
        nameEn: "Hurghada",
        iata: "HRG",
        skyId: "HRG",
        entityId: "27539972",
        countryAr: "مصر",
        countryEn: "Egypt",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        priceUsd: 120,
        airlineCode: "MS",
        airlineNameAr: "مصر للطيران",
        airlineNameEn: "EgyptAir",
        isDirect: true,
        flightDuration: "2h 10m",
      },
      {
        id: "hbe",
        nameAr: "الإسكندرية",
        nameEn: "Alexandria",
        iata: "HBE",
        skyId: "HBE",
        entityId: "27539973",
        countryAr: "مصر",
        countryEn: "Egypt",
        image: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80",
        priceUsd: 105,
        airlineCode: "MS",
        airlineNameAr: "مصر للطيران",
        airlineNameEn: "EgyptAir",
        isDirect: true,
        flightDuration: "2h 35m",
      },
      {
        id: "lxr",
        nameAr: "الأقصر",
        nameEn: "Luxor",
        iata: "LXR",
        skyId: "LXR",
        entityId: "27539974",
        countryAr: "مصر",
        countryEn: "Egypt",
        image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&q=80",
        priceUsd: 135,
        airlineCode: "MS",
        airlineNameAr: "مصر للطيران",
        airlineNameEn: "EgyptAir",
        isDirect: false,
        flightDuration: "4h 15m",
      },
      {
        id: "asw",
        nameAr: "أسوان",
        nameEn: "Aswan",
        iata: "ASW",
        skyId: "ASW",
        entityId: "27539975",
        countryAr: "مصر",
        countryEn: "Egypt",
        image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
        priceUsd: 140,
        airlineCode: "MS",
        airlineNameAr: "مصر للطيران",
        airlineNameEn: "EgyptAir",
        isDirect: false,
        flightDuration: "4h 30m",
      },
      {
        id: "rmf",
        nameAr: "مرسى علم",
        nameEn: "Marsa Alam",
        iata: "RMF",
        skyId: "RMF",
        entityId: "27539976",
        countryAr: "مصر",
        countryEn: "Egypt",
        image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80",
        priceUsd: 145,
        airlineCode: "MS",
        airlineNameAr: "مصر للطيران",
        airlineNameEn: "EgyptAir",
        isDirect: false,
        flightDuration: "4h 45m",
      },
      {
        id: "dbb",
        nameAr: "العلمين الجديدة",
        nameEn: "Al Alamein",
        iata: "DBB",
        skyId: "DBB",
        entityId: "27539977",
        countryAr: "مصر",
        countryEn: "Egypt",
        image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80",
        priceUsd: 150,
        airlineCode: "MS",
        airlineNameAr: "مصر للطيران",
        airlineNameEn: "EgyptAir",
        isDirect: true,
        flightDuration: "2h 45m",
      },
      {
        id: "tcp",
        nameAr: "طابا",
        nameEn: "Taba",
        iata: "TCP",
        skyId: "TCP",
        entityId: "27539978",
        countryAr: "مصر",
        countryEn: "Egypt",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
        priceUsd: 160,
        airlineCode: "MS",
        airlineNameAr: "مصر للطيران",
        airlineNameEn: "EgyptAir",
        isDirect: false,
        flightDuration: "5h 10m",
      },
      {
        id: "muh",
        nameAr: "مرسى مطروح",
        nameEn: "Marsa Matruh",
        iata: "MUH",
        skyId: "MUH",
        entityId: "27539979",
        countryAr: "مصر",
        countryEn: "Egypt",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        priceUsd: 155,
        airlineCode: "MS",
        airlineNameAr: "مصر للطيران",
        airlineNameEn: "EgyptAir",
        isDirect: false,
        flightDuration: "5h 00m",
      },
    ],
  },
  {
    id: "usa",
    nameAr: "أمريكا",
    nameEn: "USA",
    flag: "🇺🇸",
    cities: [
      {
        id: "jfk",
        nameAr: "نيويورك",
        nameEn: "New York",
        iata: "JFK",
        skyId: "NYCA",
        entityId: "27537542",
        countryAr: "أمريكا",
        countryEn: "USA",
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
        priceUsd: 480,
        airlineCode: "SV",
        airlineNameAr: "الخطوط السعودية",
        airlineNameEn: "Saudia",
        isDirect: true,
        flightDuration: "12h 30m",
      },
      {
        id: "lax",
        nameAr: "لوس أنجلوس",
        nameEn: "Los Angeles",
        iata: "LAX",
        skyId: "LAXA",
        entityId: "27537543",
        countryAr: "أمريكا",
        countryEn: "USA",
        image: "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800&q=80",
        priceUsd: 520,
        airlineCode: "SV",
        airlineNameAr: "الخطوط السعودية",
        airlineNameEn: "Saudia",
        isDirect: true,
        flightDuration: "15h 45m",
      },
      {
        id: "mia",
        nameAr: "ميامي",
        nameEn: "Miami",
        iata: "MIA",
        skyId: "MIAM",
        entityId: "27537544",
        countryAr: "أمريكا",
        countryEn: "USA",
        image: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800&q=80",
        priceUsd: 510,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "16h 20m",
      },
      {
        id: "mco",
        nameAr: "أورلاندو",
        nameEn: "Orlando",
        iata: "MCO",
        skyId: "ORLB",
        entityId: "27537545",
        countryAr: "أمريكا",
        countryEn: "USA",
        image: "https://images.unsplash.com/photo-1575089976121-8ed7b2a54265?w=800&q=80",
        priceUsd: 535,
        airlineCode: "EK",
        airlineNameAr: "طيران الإمارات",
        airlineNameEn: "Emirates",
        isDirect: false,
        flightDuration: "17h 10m",
      },
      {
        id: "sfo",
        nameAr: "سان فرانسيسكو",
        nameEn: "San Francisco",
        iata: "SFO",
        skyId: "SFOA",
        entityId: "27537546",
        countryAr: "أمريكا",
        countryEn: "USA",
        image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
        priceUsd: 540,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "16h 50m",
      },
      {
        id: "ord",
        nameAr: "شيكاغو",
        nameEn: "Chicago",
        iata: "ORD",
        skyId: "CHIA",
        entityId: "27537547",
        countryAr: "أمريكا",
        countryEn: "USA",
        image: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&q=80",
        priceUsd: 495,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "15h 30m",
      },
      {
        id: "las",
        nameAr: "لاس فيغاس",
        nameEn: "Las Vegas",
        iata: "LAS",
        skyId: "LASA",
        entityId: "27537548",
        countryAr: "أمريكا",
        countryEn: "USA",
        image: "https://images.unsplash.com/photo-1581351123004-757df051db8e?w=800&q=80",
        priceUsd: 550,
        airlineCode: "BA",
        airlineNameAr: "الخطوط البريطانية",
        airlineNameEn: "British Airways",
        isDirect: false,
        flightDuration: "17h 40m",
      },
      {
        id: "iad",
        nameAr: "واشنطن",
        nameEn: "Washington",
        iata: "IAD",
        skyId: "WASA",
        entityId: "27537549",
        countryAr: "أمريكا",
        countryEn: "USA",
        image: "https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=800&q=80",
        priceUsd: 485,
        airlineCode: "SV",
        airlineNameAr: "الخطوط السعودية",
        airlineNameEn: "Saudia",
        isDirect: true,
        flightDuration: "13h 15m",
      },
      {
        id: "bos",
        nameAr: "بوسطن",
        nameEn: "Boston",
        iata: "BOS",
        skyId: "BOSA",
        entityId: "27537550",
        countryAr: "أمريكا",
        countryEn: "USA",
        image: "https://images.unsplash.com/photo-1501979376783-d1956166d73b?w=800&q=80",
        priceUsd: 490,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "15h 10m",
      },
      {
        id: "iah",
        nameAr: "هيوستن",
        nameEn: "Houston",
        iata: "IAH",
        skyId: "HOUA",
        entityId: "27537551",
        countryAr: "أمريكا",
        countryEn: "USA",
        image: "https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?w=800&q=80",
        priceUsd: 530,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "17h 00m",
      },
    ],
  },
  {
    id: "uk",
    nameAr: "بريطانيا",
    nameEn: "UK",
    flag: "🇬🇧",
    cities: [
      {
        id: "lhr",
        nameAr: "لندن",
        nameEn: "London",
        iata: "LHR",
        skyId: "LOND",
        entityId: "27544008",
        countryAr: "بريطانيا",
        countryEn: "UK",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
        priceUsd: 190,
        airlineCode: "BA",
        airlineNameAr: "الخطوط البريطانية",
        airlineNameEn: "British Airways",
        isDirect: true,
        flightDuration: "6h 40m",
      },
      {
        id: "man",
        nameAr: "مانشستر",
        nameEn: "Manchester",
        iata: "MAN",
        skyId: "MAN",
        entityId: "27544010",
        countryAr: "بريطانيا",
        countryEn: "UK",
        image: "https://images.unsplash.com/photo-1579830341094-7164993175ef?w=800&q=80",
        priceUsd: 215,
        airlineCode: "SV",
        airlineNameAr: "الخطوط السعودية",
        airlineNameEn: "Saudia",
        isDirect: false,
        flightDuration: "7h 55m",
      },
      {
        id: "edi",
        nameAr: "إدنبرة",
        nameEn: "Edinburgh",
        iata: "EDI",
        skyId: "EDI",
        entityId: "27544012",
        countryAr: "بريطانيا",
        countryEn: "UK",
        image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80",
        priceUsd: 235,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "8h 20m",
      },
      {
        id: "bhx",
        nameAr: "برمنغهام",
        nameEn: "Birmingham",
        iata: "BHX",
        skyId: "BHX",
        entityId: "27544014",
        countryAr: "بريطانيا",
        countryEn: "UK",
        image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80",
        priceUsd: 220,
        airlineCode: "SV",
        airlineNameAr: "الخطوط السعودية",
        airlineNameEn: "Saudia",
        isDirect: false,
        flightDuration: "8h 10m",
      },
      {
        id: "gla",
        nameAr: "غلاسكو",
        nameEn: "Glasgow",
        iata: "GLA",
        skyId: "GLA",
        entityId: "27544016",
        countryAr: "بريطانيا",
        countryEn: "UK",
        image: "https://images.unsplash.com/photo-1571494146906-86de15d3817b?w=800&q=80",
        priceUsd: 240,
        airlineCode: "EK",
        airlineNameAr: "طيران الإمارات",
        airlineNameEn: "Emirates",
        isDirect: false,
        flightDuration: "8h 45m",
      },
      {
        id: "lpl",
        nameAr: "ليفربول",
        nameEn: "Liverpool",
        iata: "LPL",
        skyId: "LPL",
        entityId: "27544018",
        countryAr: "بريطانيا",
        countryEn: "UK",
        image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80",
        priceUsd: 230,
        airlineCode: "BA",
        airlineNameAr: "الخطوط البريطانية",
        airlineNameEn: "British Airways",
        isDirect: false,
        flightDuration: "8h 30m",
      },
      {
        id: "brs",
        nameAr: "بريستول",
        nameEn: "Bristol",
        iata: "BRS",
        skyId: "BRS",
        entityId: "27544020",
        countryAr: "بريطانيا",
        countryEn: "UK",
        image: "https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=800&q=80",
        priceUsd: 245,
        airlineCode: "BA",
        airlineNameAr: "الخطوط البريطانية",
        airlineNameEn: "British Airways",
        isDirect: false,
        flightDuration: "8h 40m",
      },
      {
        id: "ncl",
        nameAr: "نيوكاسل",
        nameEn: "Newcastle",
        iata: "NCL",
        skyId: "NCL",
        entityId: "27544022",
        countryAr: "بريطانيا",
        countryEn: "UK",
        image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&q=80",
        priceUsd: 250,
        airlineCode: "EK",
        airlineNameAr: "طيران الإمارات",
        airlineNameEn: "Emirates",
        isDirect: false,
        flightDuration: "9h 00m",
      },
      {
        id: "bfs",
        nameAr: "بلفاست",
        nameEn: "Belfast",
        iata: "BFS",
        skyId: "BFS",
        entityId: "27544024",
        countryAr: "بريطانيا",
        countryEn: "UK",
        image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80",
        priceUsd: 260,
        airlineCode: "BA",
        airlineNameAr: "الخطوط البريطانية",
        airlineNameEn: "British Airways",
        isDirect: false,
        flightDuration: "9h 15m",
      },
      {
        id: "lba",
        nameAr: "ليدز",
        nameEn: "Leeds",
        iata: "LBA",
        skyId: "LBA",
        entityId: "27544026",
        countryAr: "بريطانيا",
        countryEn: "UK",
        image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&q=80",
        priceUsd: 255,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "9h 05m",
      },
    ],
  },
  {
    id: "italy",
    nameAr: "إيطاليا",
    nameEn: "Italy",
    flag: "🇮🇹",
    cities: [
      {
        id: "fco",
        nameAr: "روما",
        nameEn: "Rome",
        iata: "FCO",
        skyId: "ROMA",
        entityId: "27539795",
        countryAr: "إيطاليا",
        countryEn: "Italy",
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
        priceUsd: 195,
        airlineCode: "AZ",
        airlineNameAr: "إيتا إيطاليا",
        airlineNameEn: "ITA Airways",
        isDirect: true,
        flightDuration: "5h 15m",
      },
      {
        id: "mxp",
        nameAr: "ميلانو",
        nameEn: "Milan",
        iata: "MXP",
        skyId: "MILA",
        entityId: "27539794",
        countryAr: "إيطاليا",
        countryEn: "Italy",
        image: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&q=80",
        priceUsd: 185,
        airlineCode: "AZ",
        airlineNameAr: "إيتا إيطاليا",
        airlineNameEn: "ITA Airways",
        isDirect: true,
        flightDuration: "5h 30m",
      },
      {
        id: "vce",
        nameAr: "البندقية",
        nameEn: "Venice",
        iata: "VCE",
        skyId: "VCE",
        entityId: "27539797",
        countryAr: "إيطاليا",
        countryEn: "Italy",
        image: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800&q=80",
        priceUsd: 210,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "7h 25m",
      },
      {
        id: "flr",
        nameAr: "فلورنسا",
        nameEn: "Florence",
        iata: "FLR",
        skyId: "FLR",
        entityId: "27539798",
        countryAr: "إيطاليا",
        countryEn: "Italy",
        image: "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=800&q=80",
        priceUsd: 220,
        airlineCode: "AZ",
        airlineNameAr: "إيتا إيطاليا",
        airlineNameEn: "ITA Airways",
        isDirect: false,
        flightDuration: "7h 40m",
      },
      {
        id: "nap",
        nameAr: "نابولي",
        nameEn: "Naples",
        iata: "NAP",
        skyId: "NAP",
        entityId: "27539796",
        countryAr: "إيطاليا",
        countryEn: "Italy",
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
        priceUsd: 215,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "7h 35m",
      },
      {
        id: "pmo",
        nameAr: "باليرمو / صقلية",
        nameEn: "Palermo / Sicily",
        iata: "PMO",
        skyId: "PMO",
        entityId: "27539800",
        countryAr: "إيطاليا",
        countryEn: "Italy",
        image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80",
        priceUsd: 235,
        airlineCode: "AZ",
        airlineNameAr: "إيتا إيطاليا",
        airlineNameEn: "ITA Airways",
        isDirect: false,
        flightDuration: "8h 10m",
      },
      {
        id: "blq",
        nameAr: "بولونيا",
        nameEn: "Bologna",
        iata: "BLQ",
        skyId: "BLQ",
        entityId: "27539799",
        countryAr: "إيطاليا",
        countryEn: "Italy",
        image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80",
        priceUsd: 225,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "7h 50m",
      },
      {
        id: "cta",
        nameAr: "كاتانيا",
        nameEn: "Catania",
        iata: "CTA",
        skyId: "CTA",
        entityId: "27539801",
        countryAr: "إيطاليا",
        countryEn: "Italy",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        priceUsd: 240,
        airlineCode: "AZ",
        airlineNameAr: "إيتا إيطاليا",
        airlineNameEn: "ITA Airways",
        isDirect: false,
        flightDuration: "8h 25m",
      },
      {
        id: "trn",
        nameAr: "تورينو",
        nameEn: "Turin",
        iata: "TRN",
        skyId: "TRN",
        entityId: "27539802",
        countryAr: "إيطاليا",
        countryEn: "Italy",
        image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&q=80",
        priceUsd: 230,
        airlineCode: "AZ",
        airlineNameAr: "إيتا إيطاليا",
        airlineNameEn: "ITA Airways",
        isDirect: false,
        flightDuration: "8h 05m",
      },
      {
        id: "bri",
        nameAr: "باري",
        nameEn: "Bari",
        iata: "BRI",
        skyId: "BRI",
        entityId: "27539803",
        countryAr: "إيطاليا",
        countryEn: "Italy",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
        priceUsd: 245,
        airlineCode: "TK",
        airlineNameAr: "الخطوط التركية",
        airlineNameEn: "Turkish Airlines",
        isDirect: false,
        flightDuration: "8h 35m",
      },
    ],
  },
];

type Props = {
  userOrigin: AirportPick | null;
};

export default function FlightDestinationShowcase({ userOrigin }: Props) {
  const { locale, dir } = useLocale();
  const { currency } = useCurrency();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("turkey");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Target departure date is exactly 1 month ahead (+30 days)
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }, []);

  const formattedTargetDate = useMemo(() => {
    try {
      const parts = targetDate.split("-");
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return targetDate;
    }
  }, [targetDate, locale]);

  const currentOrigin = userOrigin || {
    skyId: "RUH",
    entityId: "27546051",
    iata: "RUH",
    name: "مطار الملك خالد الدولي",
    city: "الرياض",
    country: "السعودية",
    kind: "airport",
  };

  const originName =
    locale === "ar"
      ? currentOrigin.city || currentOrigin.name || "الرياض"
      : currentOrigin.iata || currentOrigin.skyId || "Origin";

  const selectedCountry = COUNTRIES_DATA.find((c) => c.id === activeTab) || COUNTRIES_DATA[0];

  const scroll = (offset: number) => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const scrollTabs = (offset: number) => {
    if (!tabsRef.current) return;
    tabsRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      el.scrollLeft += event.deltaY;
      event.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleBookNow = (city: CityDeal) => {
    const params = new URLSearchParams({
      tripType: "one-way",
      originSkyId: currentOrigin.skyId,
      originEntityId: currentOrigin.entityId || currentOrigin.skyId,
      originIata: currentOrigin.iata || currentOrigin.skyId,
      originLabel: `${currentOrigin.city || currentOrigin.name} (${currentOrigin.iata || currentOrigin.skyId})`,
      destinationSkyId: city.skyId,
      destinationEntityId: city.entityId,
      destinationIata: city.iata,
      destinationLabel: `${locale === "ar" ? city.nameAr : city.nameEn} (${city.iata})`,
      date: targetDate,
      adults: "1",
      cabinClass: "economy",
      currency: currency.code || "USD",
    });
    router.push(`/flights/search?${params.toString()}`);
  };

  const formatPrice = (usd: number) => {
    const rate = currency.rate || 1;
    const val = Math.round(usd * rate);
    if (currency.code === "SAR") return `${val} ر.س`;
    if (currency.code === "AED") return `${val} د.إ`;
    if (currency.code === "EUR") return `€${val}`;
    if (currency.code === "GBP") return `£${val}`;
    return `$${val}`;
  };

  return (
    <section className="my-10 overflow-hidden rounded-3xl border border-purple-900/10 bg-white p-5 md:p-8 shadow-[0_12px_36px_rgba(46,16,101,0.06)]">
      {/* Header with GPS/Origin Alert & Target Date Badge */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100/80 px-3 py-1 text-xs font-black text-purple-950 border border-purple-200">
              <Compass size={13} className="text-purple-700" />
              <span>{locale === "ar" ? `رحلات تنطلق من: ${originName}` : `Departing from: ${originName}`}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-200/80">
              <Calendar size={13} className="text-amber-600" />
              <span>{locale === "ar" ? `عروض شهر للأمام (${formattedTargetDate})` : `1 Month Ahead Deals (${formattedTargetDate})`}</span>
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#1e1b4b] flex items-center gap-2">
            <span>{locale === "ar" ? "أرخص تذاكر الطيران للوجهات والعواصم العالمية" : "Cheapest Flight Deals to World Capitals"}</span>
            <Sparkles size={20} className="text-amber-500" />
          </h2>
          <p className="mt-1 text-xs md:text-sm font-semibold text-slate-500">
            {locale === "ar"
              ? `اختر الدولة لاستعراض 10 مدن وعواصم بأقل الأسعار المحجوزة مسبقاً من ${originName} بتواريخ بعد شهر كامل.`
              : `Select a country to browse 10 top destinations from ${originName} with guaranteed best advance rates.`}
          </p>
        </div>

        {/* Slider Arrow Controls */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            type="button"
            onClick={() => scroll(-380)}
            aria-label="Previous"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-950 shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
          >
            {dir === "rtl" ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button
            type="button"
            onClick={() => scroll(380)}
            aria-label="Next"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-950 shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
          >
            {dir === "rtl" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {/* Country Tabs — LTR scroller so RTL pages can actually swipe */}
      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => scrollTabs(-220)}
          aria-label="Previous countries"
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs sm:flex"
        >
          <ChevronLeft size={16} />
        </button>
        <div
          ref={tabsRef}
          dir="ltr"
          className="flex min-w-0 flex-1 touch-pan-x items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {COUNTRIES_DATA.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs md:text-sm font-black transition-all cursor-pointer",
                  isActive
                    ? "bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] text-white shadow-md shadow-purple-950/20 scale-[1.02]"
                    : "bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-950 border border-slate-200/70"
                )}
              >
                <span className="text-base">{tab.flag}</span>
                <span>{locale === "ar" ? tab.nameAr : tab.nameEn}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                    isActive ? "bg-white/20 text-amber-300" : "bg-white text-slate-500"
                  )}
                >
                  10
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => scrollTabs(220)}
          aria-label="Next countries"
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs sm:flex"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Horizontal Cards Slider (10 Cities for Active Country) */}
      <div
        ref={scrollerRef}
        dir="ltr"
        className="mt-6 flex gap-4 overflow-x-auto touch-pan-x pb-1 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
      >
        {selectedCountry.cities.map((city) => (
          <article
            key={city.id}
            className="group relative flex w-[17.5rem] sm:w-[19.5rem] shrink-0 flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 snap-start"
          >
            {/* Real Photographic City Image with Gradient Overlay */}
            <div className="relative h-44 w-full overflow-hidden bg-slate-100">
              <DestinationCityImage
                city={city.nameEn}
                country={city.countryEn}
                alt={locale === "ar" ? city.nameAr : city.nameEn}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              {/* Top Badges */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-black text-slate-950 shadow-xs">
                  <Tag size={10} className="text-purple-700" />
                  {city.iata}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black shadow-xs",
                    city.isDirect
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-500 text-slate-950"
                  )}
                >
                  {city.isDirect
                    ? locale === "ar"
                      ? "مباشر"
                      : "Direct"
                    : locale === "ar"
                    ? "توقف واحد"
                    : "1 Stop"}
                </span>
              </div>

              {/* Destination City & Country on Image */}
              <div className="absolute bottom-3 inset-x-3 text-white">
                <p className="text-lg font-black leading-tight drop-shadow-sm">
                  {locale === "ar" ? city.nameAr : city.nameEn}
                </p>
                <p className="text-xs font-semibold text-white/80">
                  {locale === "ar" ? city.countryAr : city.countryEn}
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="flex flex-1 flex-col justify-between p-4 bg-gradient-to-b from-white to-slate-50/50">
              {/* Route & Carrier Details */}
              <div className="space-y-2.5">
                {/* Route */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-1 text-slate-900">
                    <Plane size={13} className="text-purple-700" />
                    <span>
                      {locale === "ar"
                        ? `من ${originName} إلى ${city.nameAr}`
                        : `From ${originName} to ${city.nameEn}`}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Timer size={11} />
                    {city.flightDuration}
                  </span>
                </div>

                {/* Operating Airline */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <AirlineLogo
                      code={city.airlineCode}
                      name={locale === "ar" ? city.airlineNameAr : city.airlineNameEn}
                      size="sm"
                    />
                    <span className="font-bold text-slate-800 text-[11px] truncate max-w-[130px]">
                      {locale === "ar" ? city.airlineNameAr : city.airlineNameEn}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md">
                    {city.airlineCode}
                  </span>
                </div>
              </div>

              {/* Pricing & CTA Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 leading-none">
                    {locale === "ar" ? "تبدأ من" : "Starting from"}
                  </span>
                  <p className="text-lg font-black text-[#1e1b4b] mt-0.5">
                    {formatPrice(city.priceUsd)}
                  </p>
                </div>

                {/* CTA "سارع بالحجز" */}
                <button
                  type="button"
                  onClick={() => handleBookNow(city)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>{locale === "ar" ? "سارع بالحجز" : "Book Now"}</span>
                  {dir === "rtl" ? <ChevronLeft size={13} className="stroke-[3]" /> : <ChevronRight size={13} className="stroke-[3]" />}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
