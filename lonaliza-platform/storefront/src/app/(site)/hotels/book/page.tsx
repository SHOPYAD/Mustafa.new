"use client";

import { Suspense } from "react";
import HotelBookCheckout from "@/components/hotels/HotelBookCheckout";

export default function HotelBookPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center">...</div>}>
      <HotelBookCheckout />
    </Suspense>
  );
}
