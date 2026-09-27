import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { resolveAdsCredentials } from "@/lib/ads/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type MetaPostItem = {
  id: string;
  message: string;
  imageUrl?: string;
  permalink?: string;
  createdTime: string;
};

const FALLBACK_POSTS: MetaPostItem[] = [
  {
    id: "post_lonaliza_01",
    message: "استمتع بأفخم عروض الصيف في إسطنبول وطرابزون مع خدمات VIP شاملة الإقامة والاستقبال الخاص 🌴✨",
    imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&auto=format&fit=crop&q=80",
    permalink: "https://instagram.com/p/lonaliza_summer_01",
    createdTime: "قبل يومين",
  },
  {
    id: "post_lonaliza_02",
    message: "رحلات البوسفور البحرية الخاصة باليخوت الملكية مع وجبة عشاء فاخرة وإطلالة ساحرة على جسر البوسفور 🚤🌅",
    imageUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600&auto=format&fit=crop&q=80",
    permalink: "https://instagram.com/p/lonaliza_yacht_02",
    createdTime: "قبل 4 أيام",
  },
  {
    id: "post_lonaliza_03",
    message: "باقات شهر العسل في كابادوكيا: مناطيد هوائية وإقامة في أفخم فنادق الكهوف الحجرية الفاخرة 🎈🏰",
    imageUrl: "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=600&auto=format&fit=crop&q=80",
    permalink: "https://instagram.com/p/lonaliza_cappadocia_03",
    createdTime: "قبل أسبوع",
  },
  {
    id: "post_lonaliza_04",
    message: "أسطول سيارات مرسيدس فيتو VIP مع سائق خاص يتحدث العربية لخدمة العائلات في جميع مدن تركيا 🚗💼",
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
    permalink: "https://instagram.com/p/lonaliza_vito_04",
    createdTime: "قبل 10 أيام",
  },
];

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const creds = await resolveAdsCredentials();
    if (creds.metaAccessToken && creds.metaPageId) {
      const url = `https://graph.facebook.com/v19.0/${encodeURIComponent(
        creds.metaPageId
      )}/posts?fields=id,message,created_time,full_picture,permalink_url&limit=10&access_token=${encodeURIComponent(
        creds.metaAccessToken
      )}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          const posts: MetaPostItem[] = json.data.map((item: any) => ({
            id: item.id,
            message: item.message || "منشور بدون نص",
            imageUrl: item.full_picture,
            permalink: item.permalink_url,
            createdTime: new Date(item.created_time).toLocaleDateString("ar-SA"),
          }));
          return NextResponse.json({ ok: true, posts, source: "live_meta_api" });
        }
      }
    }
  } catch {}

  return NextResponse.json({ ok: true, posts: FALLBACK_POSTS, source: "curated_posts" });
}
