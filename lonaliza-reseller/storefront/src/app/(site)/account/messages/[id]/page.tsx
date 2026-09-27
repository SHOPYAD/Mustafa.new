"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import ChatThreadView from "@/components/messaging/ChatThreadView";

export default function PrivateMessagePage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading, openAuth } = useCustomerAuth();

  useEffect(() => {
    if (!loading && !user) openAuth("login");
  }, [loading, user, openAuth]);

  if (!id) return null;
  return <ChatThreadView threadId={id} />;
}
