"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CustomerSession = {
  id: string;
  email: string;
  name: string;
};

type AuthContextValue = {
  user: CustomerSession | null;
  loading: boolean;
  modalOpen: boolean;
  modalMode: "login" | "register";
  authNotice: string;
  openAuth: (mode?: "login" | "register") => void;
  closeAuth: () => void;
  setAuthNotice: (notice: string) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const CustomerAuthContext = createContext<AuthContextValue | null>(null);

const emptyAuth: AuthContextValue = {
  user: null,
  loading: false,
  modalOpen: false,
  modalMode: "login",
  authNotice: "",
  openAuth: () => undefined,
  closeAuth: () => undefined,
  setAuthNotice: () => undefined,
  refresh: async () => undefined,
  logout: async () => undefined,
};

export function useCustomerAuth(): AuthContextValue {
  return useContext(CustomerAuthContext) || emptyAuth;
}

export default function CustomerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<CustomerSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "register">("login");
  const [authNotice, setAuthNotice] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await res.json()) as { user?: CustomerSession | null };
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem("alrayyan_visit_beacon")) return;
    } catch {
      /* private mode — still send once this mount */
    }
    const path = window.location.pathname || "/";
    if (path.startsWith("/admin") || path.startsWith("/api")) return;
    void fetch("/api/track/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ path }),
    })
      .then(() => {
        try {
          sessionStorage.setItem("alrayyan_visit_beacon", "1");
        } catch {
          /* ignore */
        }
      })
      .catch(() => undefined);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      modalOpen,
      modalMode,
      authNotice,
      openAuth: (mode = "login") => {
        setModalMode(mode);
        setModalOpen(true);
      },
      closeAuth: () => setModalOpen(false),
      setAuthNotice,
      refresh,
      logout,
    }),
    [user, loading, modalOpen, modalMode, authNotice, refresh, logout]
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}
