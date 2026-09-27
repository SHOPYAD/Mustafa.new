/**
 * Curated Lucide groups for the admin picker.
 * The full Lucide set is still available via `lucide-react/dynamic` `iconNames`.
 */

export type UiIconCategoryId =
  | "travel"
  | "transport"
  | "places"
  | "people"
  | "commerce"
  | "communication"
  | "nature"
  | "files"
  | "ui"
  | "security"
  | "time"
  | "food"
  | "media";

export type UiIconCategory = {
  id: UiIconCategoryId;
  names: readonly string[];
};

export const UI_ICON_CATEGORIES: readonly UiIconCategory[] = [
  {
    id: "travel",
    names: [
      "plane",
      "plane-takeoff",
      "plane-landing",
      "hotel",
      "bed-double",
      "bed-single",
      "tickets",
      "ticket",
      "luggage",
      "briefcase",
      "map",
      "map-pin",
      "map-pinned",
      "compass",
      "globe",
      "globe-2",
      "earth",
      "palmtree",
      "tree-palm",
      "umbrella",
      "backpack",
      "camera",
      "binoculars",
      "route",
      "signpost",
      "milestone",
      "navigation",
      "navigation-2",
      "flag",
      "flag-triangle-right",
    ],
  },
  {
    id: "transport",
    names: [
      "car",
      "car-front",
      "car-taxi-front",
      "bus",
      "bus-front",
      "train-front",
      "tram-front",
      "ship",
      "sailboat",
      "bike",
      "truck",
      "ambulance",
      "fuel",
      "parking-circle",
      "parking-meter",
      "traffic-cone",
      "anchor",
      "helicopter",
    ],
  },
  {
    id: "places",
    names: [
      "house",
      "home",
      "building",
      "building-2",
      "landmark",
      "castle",
      "church",
      "school",
      "hospital",
      "warehouse",
      "factory",
      "store",
      "shopping-bag",
      "hotel",
      "tent",
      "trees",
      "mountain",
      "mountain-snow",
      "waves",
      "amphora",
    ],
  },
  {
    id: "people",
    names: [
      "user",
      "user-round",
      "users",
      "users-round",
      "user-check",
      "contact",
      "smile",
      "heart",
      "hand-heart",
      "handshake",
      "baby",
      "person-standing",
      "accessibility",
    ],
  },
  {
    id: "commerce",
    names: [
      "credit-card",
      "wallet",
      "banknote",
      "coins",
      "badge-percent",
      "percent",
      "tag",
      "tags",
      "gift",
      "shopping-cart",
      "shopping-bag",
      "receipt",
      "receipt-text",
      "circle-dollar-sign",
      "badge-dollar-sign",
      "store",
    ],
  },
  {
    id: "communication",
    names: [
      "phone",
      "phone-call",
      "mail",
      "mails",
      "message-circle",
      "message-square",
      "messages-square",
      "send",
      "inbox",
      "megaphone",
      "bell",
      "share-2",
      "link",
      "at-sign",
    ],
  },
  {
    id: "nature",
    names: [
      "sun",
      "moon",
      "cloud",
      "cloud-sun",
      "cloud-rain",
      "snowflake",
      "flame",
      "leaf",
      "flower-2",
      "trees",
      "palmtree",
      "mountain",
      "waves",
      "fish",
      "bird",
      "rabbit",
    ],
  },
  {
    id: "files",
    names: [
      "file-text",
      "file",
      "files",
      "folder",
      "newspaper",
      "book-open",
      "book-marked",
      "clipboard",
      "stamp",
      "pen-line",
      "notebook-pen",
      "image",
      "images",
    ],
  },
  {
    id: "ui",
    names: [
      "search",
      "settings",
      "menu",
      "layout-dashboard",
      "layout-grid",
      "panels-top-left",
      "plus",
      "minus",
      "x",
      "check",
      "info",
      "circle-help",
      "circle-alert",
      "star",
      "bookmark",
      "filter",
      "sliders-horizontal",
      "ellipsis",
      "chevron-down",
      "arrow-right",
      "external-link",
    ],
  },
  {
    id: "security",
    names: [
      "shield",
      "shield-check",
      "shield-alert",
      "lock",
      "lock-keyhole",
      "key",
      "key-round",
      "fingerprint",
      "scan-eye",
      "eye",
      "eye-off",
    ],
  },
  {
    id: "time",
    names: [
      "calendar",
      "calendar-days",
      "calendar-check",
      "clock",
      "timer",
      "hourglass",
      "history",
      "alarm-clock",
    ],
  },
  {
    id: "food",
    names: [
      "utensils",
      "utensils-crossed",
      "coffee",
      "wine",
      "martini",
      "cake",
      "ice-cream-cone",
      "apple",
      "soup",
    ],
  },
  {
    id: "media",
    names: [
      "play",
      "pause",
      "video",
      "camera",
      "image",
      "music",
      "mic",
      "headphones",
      "tv",
      "clapperboard",
      "sparkles",
      "bot",
      "wand-sparkles",
    ],
  },
];

export const CURATED_LUCIDE_NAMES: readonly string[] = Array.from(
  new Set(UI_ICON_CATEGORIES.flatMap((group) => [...group.names]))
);

export function categoryLabel(
  id: UiIconCategoryId | "all" | "custom",
  locale: string
): string {
  const ar: Record<string, string> = {
    all: "كل الأيقونات",
    custom: "SVG مخصّص",
    travel: "سفر",
    transport: "مواصلات",
    places: "أماكن",
    people: "أشخاص",
    commerce: "تجارة",
    communication: "تواصل",
    nature: "طبيعة",
    files: "ملفات",
    ui: "واجهة",
    security: "أمان",
    time: "وقت",
    food: "طعام",
    media: "وسائط",
  };
  const en: Record<string, string> = {
    all: "All icons",
    custom: "Custom SVG",
    travel: "Travel",
    transport: "Transport",
    places: "Places",
    people: "People",
    commerce: "Commerce",
    communication: "Communication",
    nature: "Nature",
    files: "Files",
    ui: "Interface",
    security: "Security",
    time: "Time",
    food: "Food",
    media: "Media",
  };
  const tr: Record<string, string> = {
    all: "Tüm ikonlar",
    custom: "Özel SVG",
    travel: "Seyahat",
    transport: "Ulaşım",
    places: "Yerler",
    people: "Kişiler",
    commerce: "Ticaret",
    communication: "İletişim",
    nature: "Doğa",
    files: "Dosyalar",
    ui: "Arayüz",
    security: "Güvenlik",
    time: "Zaman",
    food: "Yemek",
    media: "Medya",
  };
  if (locale === "ar") return ar[id] || id;
  if (locale === "tr") return tr[id] || id;
  return en[id] || id;
}
