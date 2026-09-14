"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

export default function InAppMessageToast() {
  const [title, setTitle] = useState("");

  useEffect(() => {
    const onMsg = (ev: Event) => {
      const detail = (ev as CustomEvent<{ title?: string }>).detail;
      setTitle(detail?.title || "رسالة جديدة");
      window.setTimeout(() => setTitle(""), 4200);
    };
    window.addEventListener("lonaliza-dm", onMsg as EventListener);
    return () => window.removeEventListener("lonaliza-dm", onMsg as EventListener);
  }, []);

  if (!title) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[80] flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-sm items-center gap-2 rounded-2xl bg-[#2E1065] px-4 py-3 text-white shadow-2xl">
        <MessageCircle size={18} className="shrink-0 text-amber-300" />
        <p className="text-sm font-black">{title}</p>
      </div>
    </div>
  );
}
