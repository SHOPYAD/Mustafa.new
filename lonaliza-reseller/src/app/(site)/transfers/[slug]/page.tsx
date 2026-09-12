"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import TransferServiceDetail from "@/components/transfers/TransferServiceDetail";
import { getTransferBySlug } from "@/data/transfers";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function TransferDetailPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    const item = getTransferBySlug(slug);
    if (item?.type === "vip_tour") {
      router.replace(`/vip-tours/${slug}`);
    }
  }, [slug, router]);

  return (
    <TransferServiceDetail
      slug={slug}
      backHref="/transfers"
      backLabel={t.transfers.title}
    />
  );
}
