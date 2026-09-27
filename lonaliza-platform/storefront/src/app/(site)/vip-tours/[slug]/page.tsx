"use client";

import { use } from "react";
import TransferServiceDetail from "@/components/transfers/TransferServiceDetail";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function VipTourDetailPage({ params }: Props) {
  const { slug } = use(params);
  const { t } = useLocale();

  return (
    <TransferServiceDetail
      slug={slug}
      backHref="/vip-tours"
      backLabel={t.catalog.vipHeroTitle}
    />
  );
}
