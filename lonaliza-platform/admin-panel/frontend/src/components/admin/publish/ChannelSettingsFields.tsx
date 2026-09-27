"use client";

import { adminInputClass, adminLabelClass } from "@/components/admin/ui/admin-ui-classes";
import type { ChannelComposeSettings } from "./types";
import { ruleFor } from "./provider-rules";

export function ChannelSettingsFields({
  provider,
  settings,
  onChange,
  globalCaption,
}: {
  provider: string;
  settings: ChannelComposeSettings;
  onChange: (next: ChannelComposeSettings) => void;
  globalCaption: string;
}) {
  const rule = ruleFor(provider);
  const patch = (partial: Partial<ChannelComposeSettings>) => onChange({ ...settings, ...partial });
  const caption = settings.overrideEnabled ? settings.overrideContent : globalCaption;

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-xs text-admin-text-primary">
        <input
          type="checkbox"
          className="size-4 accent-purple-700"
          checked={settings.overrideEnabled}
          onChange={(e) => patch({ overrideEnabled: e.target.checked })}
        />
        تجاوز النص العام لهذه القناة
      </label>
      {settings.overrideEnabled ? (
        <div>
          <label className={adminLabelClass}>نص خاص بالقناة</label>
          <textarea
            className={`${adminInputClass} min-h-24 resize-y`}
            value={settings.overrideContent}
            onChange={(e) => patch({ overrideContent: e.target.value })}
          />
          <p className="mt-1 text-[11px] text-admin-text-faint">
            {caption.length}/{rule.maxLength}
          </p>
        </div>
      ) : (
        <p className="text-[11px] text-admin-text-muted">
          يستخدم النص العام ({globalCaption.length}/{rule.maxLength}). {rule.notesAr}
        </p>
      )}

      {rule.allowsFirstComment ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={adminLabelClass}>تعليق أول / رد</label>
            <input
              className={adminInputClass}
              value={settings.firstComment}
              onChange={(e) => patch({ firstComment: e.target.value })}
              placeholder="يُنشر بعد المنشور الأصلي…"
            />
          </div>
          <div>
            <label className={adminLabelClass}>تأخير التعليق (ثوانٍ)</label>
            <input
              type="number"
              min={0}
              className={adminInputClass}
              value={settings.commentDelaySec}
              onChange={(e) => patch({ commentDelaySec: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-admin-text-muted">هذه المنصة لا تقبل أجزاء أو تعليقات إضافية.</p>
      )}

      {provider === "tiktok" || provider === "tiktok-business" ? (
        <>
          <div>
            <label className={adminLabelClass}>طريقة النشر</label>
            <select
              className={adminInputClass}
              value={settings.content_posting_method}
              onChange={(e) => patch({ content_posting_method: e.target.value as ChannelComposeSettings["content_posting_method"] })}
            >
              <option value="DIRECT_POST">نشر مباشر على تيك توك</option>
              <option value="UPLOAD">رفع لصندوق الوارد فقط</option>
            </select>
          </div>
          <div>
            <label className={adminLabelClass}>من يرى المقطع</label>
            <select
              className={adminInputClass}
              value={settings.privacy_level}
              onChange={(e) => patch({ privacy_level: e.target.value })}
            >
              <option value="PUBLIC_TO_EVERYONE">عام</option>
              <option value="MUTUAL_FOLLOW_FRIENDS">الأصدقاء المتبادلون</option>
              <option value="FOLLOWER_OF_CREATOR">المتابعون</option>
              <option value="SELF_ONLY">خاص</option>
            </select>
          </div>
        </>
      ) : null}

      {provider === "instagram" || provider === "instagram-standalone" ? (
        <>
          <div>
            <label className={adminLabelClass}>نوع المنشور</label>
            <select
              className={adminInputClass}
              value={settings.post_type}
              onChange={(e) => patch({ post_type: e.target.value as ChannelComposeSettings["post_type"] })}
            >
              <option value="post">منشور / ريل</option>
              <option value="story">ستوري</option>
            </select>
          </div>
          {settings.post_type === "post" ? (
            <>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  className="size-4 accent-purple-700"
                  checked={settings.is_trial_reel}
                  onChange={(e) => patch({ is_trial_reel: e.target.checked })}
                />
                ريل تجريبي (لغير المتابعين أولاً)
              </label>
              {settings.is_trial_reel ? (
                <div>
                  <label className={adminLabelClass}>استراتيجية التخرج</label>
                  <select
                    className={adminInputClass}
                    value={settings.graduation_strategy}
                    onChange={(e) =>
                      patch({ graduation_strategy: e.target.value as ChannelComposeSettings["graduation_strategy"] })
                    }
                  >
                    <option value="MANUAL">يدوي</option>
                    <option value="SS_PERFORMANCE">تلقائي حسب الأداء</option>
                  </select>
                </div>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}

      {provider === "youtube" ? (
        <>
          <div>
            <label className={adminLabelClass}>عنوان يوتيوب</label>
            <input
              className={adminInputClass}
              maxLength={100}
              value={settings.ytTitle}
              onChange={(e) => patch({ ytTitle: e.target.value })}
            />
          </div>
          <div>
            <label className={adminLabelClass}>الخصوصية</label>
            <select
              className={adminInputClass}
              value={settings.ytPrivacy}
              onChange={(e) => patch({ ytPrivacy: e.target.value as ChannelComposeSettings["ytPrivacy"] })}
            >
              <option value="public">عام</option>
              <option value="unlisted">غير مدرج</option>
              <option value="private">خاص</option>
            </select>
          </div>
          <div>
            <label className={adminLabelClass}>موجّه للأطفال؟</label>
            <select
              className={adminInputClass}
              value={settings.selfDeclaredMadeForKids}
              onChange={(e) =>
                patch({ selfDeclaredMadeForKids: e.target.value as ChannelComposeSettings["selfDeclaredMadeForKids"] })
              }
            >
              <option value="no">لا</option>
              <option value="yes">نعم</option>
            </select>
          </div>
        </>
      ) : null}

      {provider === "gmb" ? (
        <>
          <div>
            <label className={adminLabelClass}>نوع منشور جوجل للأعمال</label>
            <select
              className={adminInputClass}
              value={settings.topicType}
              onChange={(e) => patch({ topicType: e.target.value as ChannelComposeSettings["topicType"] })}
            >
              <option value="STANDARD">تحديث عادي</option>
              <option value="EVENT">فعالية</option>
              <option value="OFFER">عرض</option>
            </select>
          </div>
          {settings.topicType === "EVENT" ? (
            <div>
              <label className={adminLabelClass}>عنوان الفعالية</label>
              <input className={adminInputClass} value={settings.eventTitle} onChange={(e) => patch({ eventTitle: e.target.value })} />
            </div>
          ) : null}
          <div>
            <label className={adminLabelClass}>زر الإجراء</label>
            <select
              className={adminInputClass}
              value={settings.callToActionType}
              onChange={(e) => patch({ callToActionType: e.target.value })}
            >
              <option value="NONE">بدون</option>
              <option value="BOOK">احجز</option>
              <option value="LEARN_MORE">اعرف المزيد</option>
              <option value="CALL">اتصل</option>
            </select>
          </div>
          {settings.callToActionType !== "NONE" ? (
            <div>
              <label className={adminLabelClass}>رابط الإجراء</label>
              <input className={adminInputClass} value={settings.callToActionUrl} onChange={(e) => patch({ callToActionUrl: e.target.value })} />
            </div>
          ) : null}
        </>
      ) : null}

      {provider === "pinterest" ? (
        <>
          <div>
            <label className={adminLabelClass}>معرّف اللوحة (Board)</label>
            <input className={adminInputClass} value={settings.board} onChange={(e) => patch({ board: e.target.value })} required />
          </div>
          <div>
            <label className={adminLabelClass}>عنوان الدبوس</label>
            <input className={adminInputClass} maxLength={100} value={settings.pinTitle} onChange={(e) => patch({ pinTitle: e.target.value })} />
          </div>
          <div>
            <label className={adminLabelClass}>رابط الوجهة</label>
            <input className={adminInputClass} value={settings.pinLink} onChange={(e) => patch({ pinLink: e.target.value })} />
          </div>
        </>
      ) : null}

      {provider === "linkedin" || provider === "linkedin-page" ? (
        <>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              className="size-4 accent-purple-700"
              checked={settings.post_as_images_carousel}
              onChange={(e) => patch({ post_as_images_carousel: e.target.checked })}
            />
            نشر ككاروسيل صور (صورتان فأكثر)
          </label>
          {settings.post_as_images_carousel ? (
            <div>
              <label className={adminLabelClass}>اسم شرائح الكاروسيل</label>
              <input className={adminInputClass} value={settings.carousel_name} onChange={(e) => patch({ carousel_name: e.target.value })} />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
