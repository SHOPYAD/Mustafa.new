import {
  DM_Sans,
  Figtree,
  Geist,
  Geist_Mono,
  Inter,
  JetBrains_Mono,
  Lora,
  Merriweather,
  Noto_Sans,
  Noto_Serif,
  Nunito_Sans,
  Outfit,
  Playfair_Display,
  Public_Sans,
  Raleway,
  Roboto,
  Roboto_Slab,
} from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

export type FontRegistryItem = {
  label: string;
  family: string;
  font?: { variable: string };
  googleSlug?: string;
  isArabic?: boolean;
};

export const fontRegistry: Record<string, FontRegistryItem> = {
  // Top Arabic Fonts
  cairo: {
    label: "Cairo (القاهرة - عربي وأنيق)",
    family: "'Cairo', sans-serif",
    googleSlug: "Cairo:wght@400;600;700;800;900",
    isArabic: true,
  },
  tajawal: {
    label: "Tajawal (تجوال - حديث وواضح)",
    family: "'Tajawal', sans-serif",
    googleSlug: "Tajawal:wght@400;500;700;800",
    isArabic: true,
  },
  ibmPlexSansArabic: {
    label: "IBM Plex Arabic (آي بي إم عربي راقي)",
    family: "'IBM Plex Sans Arabic', sans-serif",
    googleSlug: "IBM+Plex+Sans+Arabic:wght@400;500;600;700",
    isArabic: true,
  },
  alexandria: {
    label: "Alexandria (الإسكندرية - عصري)",
    family: "'Alexandria', sans-serif",
    googleSlug: "Alexandria:wght@400;600;700;800",
    isArabic: true,
  },
  almarai: {
    label: "Almarai (المراعي - هندسي)",
    family: "'Almarai', sans-serif",
    googleSlug: "Almarai:wght@400;700;800",
    isArabic: true,
  },

  // Top Latin & Executive UI Fonts
  figtree: {
    label: "Figtree (فقتري - عصري متوازن)",
    family: "var(--font-figtree), sans-serif",
    font: figtree,
  },
  inter: {
    label: "Inter (إنتر - دقيق وعملي)",
    family: "var(--font-inter), sans-serif",
    font: inter,
  },
  outfit: {
    label: "Outfit (أوتفت - هندسي عصري)",
    family: "var(--font-outfit), sans-serif",
    font: outfit,
  },
  dmSans: {
    label: "DM Sans (دي إم - ناعم ومريح)",
    family: "var(--font-dm-sans), sans-serif",
    font: dmSans,
  },
  geist: {
    label: "Geist (جايست - تقني عالي الحداثة)",
    family: "var(--font-geist), sans-serif",
    font: geist,
  },
  roboto: {
    label: "Roboto (روبوتو - القياسي العالمي)",
    family: "var(--font-roboto), sans-serif",
    font: roboto,
  },
  playfairDisplay: {
    label: "Playfair Display (بلايفير - كلاسيكي فاخر)",
    family: "var(--font-playfair-display), serif",
    font: playfairDisplay,
  },
  notoSans: {
    label: "Noto Sans (نوتو سانس)",
    family: "var(--font-noto-sans), sans-serif",
    font: notoSans,
  },
  nunitoSans: {
    label: "Nunito Sans (نونيتو سانس)",
    family: "var(--font-nunito-sans), sans-serif",
    font: nunitoSans,
  },
  raleway: {
    label: "Raleway (ريلواي)",
    family: "var(--font-raleway), sans-serif",
    font: raleway,
  },
  publicSans: {
    label: "Public Sans (ببليك سانس)",
    family: "var(--font-public-sans), sans-serif",
    font: publicSans,
  },
  geistMono: {
    label: "Geist Mono (أحادي المسافة)",
    family: "var(--font-geist-mono), monospace",
    font: geistMono,
  },
  jetBrainsMono: {
    label: "JetBrains Mono (برمجي)",
    family: "var(--font-jetbrains-mono), monospace",
    font: jetBrainsMono,
  },
};

export type FontKey = keyof typeof fontRegistry;

export const fontKeys = Object.keys(fontRegistry) as FontKey[];

export const fontVars = Object.values(fontRegistry)
  .filter((item): item is FontRegistryItem & { font: { variable: string } } => Boolean(item.font?.variable))
  .map(({ font }) => font.variable)
  .join(" ");

export const fontOptions = fontKeys.map((key) => ({
  key,
  label: fontRegistry[key].label,
  family: fontRegistry[key].family,
  googleSlug: fontRegistry[key].googleSlug,
}));
