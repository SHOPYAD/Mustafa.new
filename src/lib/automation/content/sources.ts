export type RssSource = {
  id: string;
  name: string;
  url: string;
  lang: "ar" | "tr" | "en";
  kind: "rss" | "official" | "trends";
};

/** Public RSS / official feeds. Titles + dates only — never full article bodies. */
export const CONTENT_RSS_SOURCES: RssSource[] = [
  {
    id: "aa-ar-turkey",
    name: "وكالة الأناضول — تركيا (عربي)",
    url: "https://www.aa.com.tr/ar/rss/default?cat=turkiye",
    lang: "ar",
    kind: "rss",
  },
  {
    id: "aa-tr-culture",
    name: "Anadolu Ajansı — Kültür",
    url: "https://www.aa.com.tr/tr/rss/default?cat=kultur",
    lang: "tr",
    kind: "rss",
  },
  {
    id: "hurriyet-seyahat",
    name: "Hürriyet Seyahat",
    url: "https://www.hurriyet.com.tr/rss/seyahat",
    lang: "tr",
    kind: "rss",
  },
  {
    id: "dailysabah-tourism",
    name: "Daily Sabah Tourism",
    url: "https://www.dailysabah.com/tourism/rss",
    lang: "en",
    kind: "rss",
  },
  {
    id: "trends-tr",
    name: "Google Trends RSS — TR",
    url: "https://trends.google.com/trending/rss?geo=TR",
    lang: "tr",
    kind: "trends",
  },
  {
    id: "trends-sa",
    name: "Google Trends RSS — SA",
    url: "https://trends.google.com/trending/rss?geo=SA",
    lang: "ar",
    kind: "trends",
  },
  {
    id: "goturkiye-news",
    name: "GoTürkiye / KTB announcements (RSS if published)",
    url: "https://www.ktb.gov.tr/EN-249299/announcements.html",
    lang: "en",
    kind: "official",
  },
];

export const TRENDS_DAILY_URLS = [
  "https://trends.google.com/trends/api/dailytrends?hl=ar&tz=-180&geo=TR&ns=15",
  "https://trends.google.com/trends/api/dailytrends?hl=ar&tz=-180&geo=SA&ns=15",
];

export const CONTENT_FETCH_UA =
  "AlrayyanTourismContentBot/1.0 (+https://lonaliza.com; content-research titles-only)";
