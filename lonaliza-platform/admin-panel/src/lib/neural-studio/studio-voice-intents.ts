import { STUDIO_SCREENS } from "@/components/admin/automation/hud/screens/screensData";
import { atlasDomainDefs } from "@/lib/neural-studio/atlas-catalog";

export interface StudioVoiceIntent {
  screenId: string;
  domainId?: string;
  reply: string;
}

function norm(text: string) {
  return text.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/\s+/g, " ").trim();
}

/**
 * توجيه صوتي للتنقل فقط. لا ينفّذ كتابة ولا حجزاً ولا دفعاً.
 * إن لم تُطابق العبارة واجهة معروفة تُعاد null ليواصل مسار الوكيل.
 */
export function resolveStudioVoiceIntent(raw: string): StudioVoiceIntent | null {
  const text = norm(raw);
  if (!text) return null;

  if (/(التوسع التراكمي|الشاشه الكامله|الغوص الطرفي)/.test(text)) {
    return {
      screenId: "02",
      reply: "فتحت التوسع التراكمي. الآباء تبقى ظاهرة، والتنفيذ الكتابي يبقى داخل قسم الحجوزات.",
    };
  }

  const domains = atlasDomainDefs();
  for (const domain of domains) {
    const label = norm(domain.label);
    if (text.includes(label) && /(افتح|اعرض|ورني|انتقل|روح|شغل)/.test(text)) {
      return {
        screenId: "01",
        domainId: domain.id,
        reply: `فتحت الأطلس على ${domain.label}. التفاصيل من سجل المنصة، وأي إجراء كتابي يبقى داخل واجهة القسم بعد المعاينة.`,
      };
    }
  }

  if (/(الاطلس|الخريطه العصبيه|الاطلس العصبي)/.test(text)) {
    return {
      screenId: "01",
      reply: "فتحت الأطلس العصبي الشامل.",
    };
  }

  if (/(الحضور البشري|المجسم|الوكيل البشري|افتح الوكيل)/.test(text)) {
    return {
      screenId: "20",
      reply: "عدت إلى الحضور البشري.",
    };
  }

  for (const screen of STUDIO_SCREENS) {
    const title = norm(screen.title);
    if (title.length >= 6 && text.includes(title)) {
      return {
        screenId: screen.id,
        reply: `فتحت ${screen.title}.`,
      };
    }
  }

  return null;
}
