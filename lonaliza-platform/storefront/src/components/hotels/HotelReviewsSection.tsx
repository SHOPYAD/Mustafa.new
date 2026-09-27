"use client";

import { useState } from "react";
import type { HotelGuestReview } from "@/types/hotel";
import type { Locale } from "@/lib/i18n/types";

const PAGE_SIZE = 10;

type Props = {
  reviews: HotelGuestReview[];
  locale: Locale;
  title: string;
  note: string;
  loadMoreLabel: string;
  showingLabel: (shown: number, total: number) => string;
};

export default function HotelReviewsSection({
  reviews,
  locale,
  title,
  note,
  loadMoreLabel,
  showingLabel,
}: Props) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (!reviews.length) return null;

  const slice = reviews.slice(0, visible);
  const hasMore = visible < reviews.length;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 mb-2">{note}</p>
      <p className="text-xs text-slate-400 mb-5">
        {showingLabel(slice.length, reviews.length)}
      </p>
      <div className="space-y-4">
        {slice.map((gr) => {
          const reviewTitle =
            locale === "ar" || locale === "tr"
              ? gr.titleAr || gr.titleEn
              : gr.titleEn;
          const text =
            locale === "ar" || locale === "tr"
              ? gr.textAr || gr.textEn
              : gr.textEn;
          const country =
            locale === "ar" || locale === "tr"
              ? gr.countryAr || gr.countryEn
              : gr.countryEn;
          const stayType =
            locale === "ar" || locale === "tr"
              ? gr.stayTypeAr || gr.stayTypeEn
              : gr.stayTypeEn;

          return (
            <article
              key={gr.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 bg-[#003580] text-white text-xs font-bold rounded">
                  {gr.rating.toFixed(1)}
                </span>
                <span className="font-semibold text-slate-900 text-sm">
                  {gr.author}
                </span>
                {country ? (
                  <span className="text-slate-400 text-xs">· {country}</span>
                ) : null}
                {gr.date ? (
                  <span className="text-slate-400 text-xs">· {gr.date}</span>
                ) : null}
                <span className="ms-auto text-xs font-medium text-slate-500">
                  {gr.source}
                </span>
              </div>
              {reviewTitle ? (
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                  {reviewTitle}
                </h3>
              ) : null}
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {text}
              </p>
              {stayType ? (
                <p className="mt-2 text-xs text-slate-400">{stayType}</p>
              ) : null}
            </article>
          );
        })}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="mt-6 w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-orange-300 hover:bg-orange-50 transition-colors"
        >
          {loadMoreLabel} ({reviews.length - visible})
        </button>
      )}
    </div>
  );
}
