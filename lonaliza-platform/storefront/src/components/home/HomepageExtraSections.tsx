"use client";

import Image from "next/image";
import Link from "next/link";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import EditorSection from "@/components/editor/EditorSection";
import type { ReactNode } from "react";

/** Renders CMS extra sections added via Gemini (addSection) */
export default function HomepageExtraSections() {
  const homepage = useHomepageContent();
  const { locale } = useLocale();
  const sections = homepage.extraSections || [];

  if (!sections.length) return null;

  return (
    <>
      {sections.map((section) => {
        const title = tContent(section, "title", locale);
        const subtitle = tContent(section, "subtitle", locale);
        const body = tContent(section, "body", locale);
        const cta = tContent(section, "ctaLabel", locale);
        const href = section.ctaHref || "/contact";
        const accent = section.accent || "#f97316";
        const wrap = (node: ReactNode) => (
          <EditorSection
            key={section.id}
            sectionType="extraSection"
            sectionId={`extra-${section.id}`}
            labelAr={section.titleAr || "قسم إضافي"}
            labelEn={section.titleEn || "Extra Section"}
          >
            {node}
          </EditorSection>
        );

        if (section.type === "ctaStrip") {
          return wrap(
            <section
              className="py-12 md:py-16"
              style={{ background: `linear-gradient(90deg, ${accent}22, transparent)` }}
            >
              <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-slate-600 mt-2">{subtitle}</p>
                  )}
                </div>
                {cta && (
                  <Link
                    href={href}
                    className="px-8 py-3 rounded-full text-white font-semibold shrink-0"
                    style={{ backgroundColor: accent }}
                  >
                    {cta}
                  </Link>
                )}
              </div>
            </section>
          );
        }

        return wrap(
          <section
            className={`py-16 md:py-24 ${
              section.type === "promoBanner" ? "relative overflow-hidden" : "bg-white"
            }`}
          >
            {section.type === "promoBanner" && section.image && (
              <div className="absolute inset-0">
                <Image
                  src={section.image}
                  alt=""
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/70" />
              </div>
            )}
            <div
              className={`relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ${
                section.type === "promoBanner" ? "text-center text-white" : ""
              }`}
            >
              {section.type === "imageRow" && section.image && (
                <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-8">
                  <Image
                    src={section.image}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <h2
                className={`text-3xl md:text-4xl font-bold mb-4 ${
                  section.type === "promoBanner" ? "text-white" : "text-slate-900"
                }`}
                style={{ fontFamily: "var(--font-sora)" }}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  className={`text-lg mb-4 ${
                    section.type === "promoBanner"
                      ? "text-white/80"
                      : "text-slate-600"
                  }`}
                >
                  {subtitle}
                </p>
              )}
              {body && (
                <p
                  className={`leading-relaxed max-w-3xl ${
                    section.type === "promoBanner"
                      ? "text-white/70 mx-auto"
                      : "text-slate-500"
                  }`}
                >
                  {body}
                </p>
              )}
              {cta && (
                <Link
                  href={href}
                  className={`inline-block mt-8 px-8 py-3 rounded-full font-semibold transition-transform hover:scale-105 ${
                    section.type === "promoBanner"
                      ? "bg-white text-slate-900"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {cta}
                </Link>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
