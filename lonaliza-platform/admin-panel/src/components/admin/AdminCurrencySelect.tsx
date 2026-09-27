"use client";

import { useEffect, useState } from "react";
import type { SiteCurrency } from "@/types/currency";

type Props = {
  value: string;
  onChange: (code: string) => void;
  className?: string;
};

export default function AdminCurrencySelect({
  value,
  onChange,
  className,
}: Props) {
  const [codes, setCodes] = useState<string[]>(["USD", "EUR", "GBP", "TRY", "AED", "SAR"]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/fx", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { currencies?: SiteCurrency[] }) => {
        if (cancelled || !Array.isArray(data.currencies)) return;
        const next = data.currencies.map((c) => c.code).filter(Boolean);
        if (next.length) setCodes(next);
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const options = codes.includes(value) || !value ? codes : [value, ...codes];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {options.map((code) => (
        <option key={code} value={code} className='bg-background'>
          {code}
        </option>
      ))}
    </select>
  );
}
