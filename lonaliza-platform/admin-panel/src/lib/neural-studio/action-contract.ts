import { z } from "zod";
export const DraftAction=z.discriminatedUnion("kind",[
 z.object({kind:z.literal("article.draft.create"),title:z.string().trim().min(3).max(180),content:z.string().trim().min(10).max(12000)}).strict(),
 z.object({kind:z.literal("automation.draft.create"),name:z.string().trim().min(3).max(180),type:z.enum(["trips.discover_and_draft","programs.discover_and_draft","activities.discover_and_draft","studio.weekly_plan"]),hour:z.number().int().min(0).max(23)}).strict()
]);
export type DraftActionInput=z.infer<typeof DraftAction>;
export function describeDraftAction(a:DraftActionInput){
 return a.kind==="article.draft.create"
 ? {title:"إنشاء مسودة مقال",effects:["حفظ مسودة غير منشورة في مخزن المقالات","قد يزامن المخزن المسودة مع PocketBase؛ لا نشر عام"],summary:a.title}
 : {title:"إنشاء وظيفة أتمتة متوقفة",effects:["حفظ وظيفة enabled=false وdryRun=true","لا جدولة فعالة ولا تشغيل ولا إرسال"],summary:a.name};
}
