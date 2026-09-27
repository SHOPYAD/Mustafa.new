"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export type AdminQuickLink = {
  id: string;
  label: string;
  url: string;
  group: string;
  description?: string;
};

const DEFAULT_QUICK_LINKS: AdminQuickLink[] = [
  // Dashboards
  { id: "ov-1", label: "نظرة عامة والمؤشرات (Overview)", url: "/admin", group: "لوحات المؤشرات" },
  { id: "ov-2", label: "تحليلات حركة الزوار (Analytics)", url: "/admin/analytics", group: "لوحات المؤشرات" },
  { id: "ov-3", label: "إدارة العملاء والصفقات (CRM)", url: "/admin/crm", group: "لوحات المؤشرات" },
  { id: "ov-4", label: "المتجر والطلبات (E-Commerce)", url: "/admin/ecommerce", group: "لوحات المؤشرات" },
  { id: "ov-5", label: "المالية والتدفقات (Finance)", url: "/admin/finance", group: "لوحات المؤشرات" },

  // Operations
  { id: "op-1", label: "جميع الحجوزات التشغيلية", url: "/admin/bookings", group: "العمليات والحجوزات" },
  { id: "op-2", label: "طلبات الإلغاء والاسترداد", url: "/admin/cancellations", group: "العمليات والحجوزات" },
  { id: "op-3", label: "تقييمات العملاء والآراء", url: "/admin/reviews", group: "العمليات والحجوزات" },

  // Catalog
  { id: "cat-1", label: "مزودو ومارك أب الفنادق", url: "/admin/hotels", group: "الكتالوج السياحي" },
  { id: "cat-2", label: "كتالوج الفنادق الداخلي", url: "/admin/hotels/catalog", group: "الكتالوج السياحي" },
  { id: "cat-3", label: "تذاكر الطيران وموزعو GDS", url: "/admin/flights", group: "الكتالوج السياحي" },
  { id: "cat-4", label: "الباقات والعروض السياحية", url: "/admin/packages", group: "الكتالوج السياحي" },
  { id: "cat-5", label: "خدمات المواصلات والاستقبال", url: "/admin/transfers", group: "الكتالوج السياحي" },
  { id: "cat-6", label: "تأجير السيارات الفاخرة", url: "/admin/cars", group: "الكتالوج السياحي" },
  { id: "cat-7", label: "الجولات السياحية والأنشطة", url: "/admin/tours", group: "الكتالوج السياحي" },
  { id: "cat-8", label: "خدمات التأشيرات الإلكترونية", url: "/admin/visa", group: "الكتالوج السياحي" },

  // Builders
  { id: "bd-1", label: "محرر الصفحة الرئيسية المرئي", url: "/admin/homepage-editor", group: "المحرر والمحتوى" },
  { id: "bd-2", label: "المحرر البصري التفاعلي", url: "/admin/visual-editor", group: "المحرر والمحتوى" },
  { id: "bd-3", label: "إدارة الصفحات الثابتة", url: "/admin/pages", group: "المحرر والمحتوى" },
  { id: "bd-4", label: "مكتبة الوسائط والصور", url: "/admin/media", group: "المحرر والمحتوى" },
  { id: "bd-5", label: "مقالات المدونة السياحية", url: "/admin/blog", group: "المحرر والمحتوى" },

  // Marketing & AI
  { id: "mk-1", label: "الحملات التسويقية", url: "/admin/marketing", group: "التسويق والذكاء" },
  { id: "mk-2", label: "التسويق عبر البريد الإلكتروني", url: "/admin/email-marketing", group: "التسويق والذكاء" },
  { id: "mk-3", label: "إدارة الإعلانات الممولة", url: "/admin/ads", group: "التسويق والذكاء" },
  { id: "mk-4", label: "برامج ووكلاء الذكاء الاصطناعي", url: "/admin/ai-programs", group: "التسويق والذكاء" },
  { id: "mk-5", label: "استوديو الأتمتة المتقدم", url: "/admin/automation-studio", group: "التسويق والذكاء" },

  // System & Finance
  { id: "sys-1", label: "المدفوعات وبوابات الدفع", url: "/admin/payments", group: "النظام والمالية" },
  { id: "sys-2", label: "الفواتير وسندات القبض", url: "/admin/invoices", group: "النظام والمالية" },
  { id: "sys-3", label: "إعدادات المنصة العامة", url: "/admin/settings", group: "النظام والمالية" },
  { id: "sys-4", label: "قاعدة بيانات PocketBase", url: "/admin/pocketbase", group: "النظام والمالية" },
  { id: "sys-5", label: "نظام إعادة البيع (Reseller Hub)", url: "/admin/resale", group: "النظام والمالية" },
];

export function ModernSearchDialog() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "j" || e.key === "k") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) setQuery("");
  };

  const handleSelect = (url: string) => {
    handleOpenChange(false);
    router.push(url);
  };

  const groups = React.useMemo(() => {
    const map = new Map<string, AdminQuickLink[]>();
    for (const link of DEFAULT_QUICK_LINKS) {
      const list = map.get(link.group) ?? [];
      list.push(link);
      map.set(link.group, list);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <>
      <Button
        onClick={() => handleOpenChange(true)}
        variant="outline"
        size="sm"
        className="h-8 gap-2 px-2.5 text-xs text-muted-foreground bg-muted/30 hover:bg-muted border-border/70 rounded-lg font-normal transition-all"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">البحث السريع في اللوحة...</span>
        <span className="sm:hidden">بحث...</span>
        <kbd className="hidden sm:inline-flex h-4 select-none items-center gap-0.5 rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] text-muted-foreground/90">
          <span>⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput
          placeholder="ابحث عن صفحة، خدمة، أو إعداد..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[360px] p-2">
          <CommandEmpty>لم يتم العثور على نتائج مطابقة.</CommandEmpty>
          {groups.map(([groupName, items], index) => (
            <React.Fragment key={groupName}>
              {index > 0 && <CommandSeparator className="my-1.5" />}
              <CommandGroup heading={groupName} className="text-xs font-semibold text-muted-foreground">
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.group} ${item.label} ${item.url}`}
                    onSelect={() => handleSelect(item.url)}
                    className="cursor-pointer py-2 px-2.5 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary/70" />
                      <span>{item.label}</span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
