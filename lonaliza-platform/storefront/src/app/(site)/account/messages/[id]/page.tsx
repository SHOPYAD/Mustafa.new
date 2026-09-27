"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import WhatsAppMessenger from "@/components/messaging/WhatsAppMessenger";

export default function PrivateMessagePage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading, openAuth } = useCustomerAuth();

  useEffect(() => {
    if (!loading && !user) openAuth("login");
  }, [loading, user, openAuth]);

  if (!id) return null;
  return (
    <div className="lonaliza-web-header-offset mx-auto max-w-7xl px-2 sm:px-4 pb-16 pt-20">
      <WhatsAppMessenger initialThreadId={id} />
    </div>
  );
}
