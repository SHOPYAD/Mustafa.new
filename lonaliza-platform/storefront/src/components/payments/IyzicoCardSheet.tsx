"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { CreditCard, Loader2, Lock, ShieldCheck, Trash2 } from "lucide-react";
import { paymentCopy } from "@/lib/payments/copy";
import { formatCardNumberDisplay, parseCardForm, type PublicSavedCard } from "@/lib/payments/card-fields";
import { destroyIyzicoArtifacts, IYZICO_3DS_MESSAGE, observeIyzicoLeaks } from "@/lib/payments/iyzico-viewport";

export type IyzicoCardSheetHandle = {
  charge: (bookingId: string) => Promise<boolean>;
  validationError: () => string;
};

type Props = {
  expanded: boolean;
  bookingId: string;
  amountLabel: string;
  locale: string;
  sandbox?: boolean;
  identityNumber?: string;
  payLabel?: string;
  bookingBusy?: boolean;
  payDisabled?: boolean;
  buyer: {
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone: string;
    countryCode?: string;
    country?: string;
    amount?: number;
    currency?: string;
  };
  onRequestPay?: () => void | Promise<void>;
  onThreeDs?: (active: boolean) => void;
  onPending: () => void;
  onFailed: (message: string) => void;
};

const fieldClass =
  "min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-[#7C3AED]/30 focus:border-purple-500 focus:ring-2";

const IyzicoCardSheet = forwardRef<IyzicoCardSheetHandle, Props>(function IyzicoCardSheet(
  {
    expanded,
    bookingId,
    amountLabel,
    locale,
    sandbox,
    identityNumber,
    payLabel,
    bookingBusy,
    payDisabled,
    buyer,
    onRequestPay,
    onThreeDs,
    onPending,
    onFailed,
  },
  ref
) {
  const copy = paymentCopy(locale);
  const rtl = locale === "ar";
  const [holder, setHolder] = useState(buyer.name || "");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [saved, setSaved] = useState<PublicSavedCard[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [threeDSHtml, setThreeDSHtml] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const threeDsPushed = useRef(false);
  const bookingIdRef = useRef(bookingId);
  const onThreeDsRef = useRef(onThreeDs);
  const onPendingRef = useRef(onPending);
  const onFailedRef = useRef(onFailed);

  bookingIdRef.current = bookingId;
  onThreeDsRef.current = onThreeDs;
  onPendingRef.current = onPending;
  onFailedRef.current = onFailed;

  const fieldError = useMemo(() => {
    if (selectedId) {
      if (cvc.replace(/\D/g, "").length < 3) return copy.cvcInvalid;
      return "";
    }
    const parsed = parseCardForm({ cardHolderName: holder, cardNumber: number, expiry, cvc });
    if (parsed.ok) return "";
    if (parsed.error === "cardholder_required") return copy.cardholderRequired;
    if (parsed.error === "card_number_invalid") return copy.numberInvalid;
    if (parsed.error === "expiry_invalid") return copy.expiryInvalid;
    return copy.cvcInvalid;
  }, [selectedId, holder, number, expiry, cvc, copy]);

  const teardownThreeDS = () => {
    const iframe = iframeRef.current;
    if (iframe) {
      try {
        iframe.srcdoc = "";
        iframe.removeAttribute("srcdoc");
        iframe.src = "about:blank";
      } catch {
        /* ignore */
      }
    }
    setThreeDSHtml("");
    destroyIyzicoArtifacts();
    onThreeDsRef.current?.(false);
    threeDsPushed.current = false;
  };

  const validationError = () => fieldError;

  const charge = async (nextBookingId?: string) => {
    setError("");
    const useId = String(nextBookingId || bookingIdRef.current || "").trim();
    if (!useId) {
      setError(copy.failed);
      return false;
    }
    const payload: Record<string, unknown> = {
      bookingId: useId,
      amount: buyer.amount,
      currency: buyer.currency,
      name: buyer.name,
      firstName: buyer.firstName,
      lastName: buyer.lastName,
      email: buyer.email,
      phone: buyer.phone,
      countryCode: buyer.countryCode,
      country: buyer.country,
      identityNumber: identityNumber || "",
      saveCard: selectedId ? false : saveCard,
    };
    if (selectedId) {
      if (cvc.replace(/\D/g, "").length < 3) {
        setError(copy.cvcInvalid);
        return false;
      }
      payload.savedCardId = selectedId;
      payload.cvc = cvc.replace(/\D/g, "");
    } else {
      const parsed = parseCardForm({ cardHolderName: holder, cardNumber: number, expiry, cvc });
      if (!parsed.ok) {
        setError(fieldError);
        return false;
      }
      payload.card = parsed.card;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/payments/iyzico/charge", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        threeDSHtml?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error === "cvc_invalid" ? copy.cvcInvalid : copy.failed);
        onFailedRef.current(data.error || copy.failed);
        return false;
      }
      if (data.threeDSHtml) {
        if (!threeDsPushed.current) {
          try {
            window.history.pushState({ lonaliza3ds: true }, "");
            threeDsPushed.current = true;
          } catch {
            /* ignore */
          }
        }
        onThreeDsRef.current?.(true);
        setThreeDSHtml(data.threeDSHtml);
        return true;
      }
      onPendingRef.current();
      return true;
    } catch {
      setError(copy.failed);
      onFailedRef.current(copy.failed);
      return false;
    } finally {
      setBusy(false);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      charge: (id: string) => charge(id),
      validationError,
    }),
    // charge/validationError close over current field state
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fieldError, selectedId, holder, number, expiry, cvc, saveCard, buyer, identityNumber]
  );

  useEffect(() => {
    if (!expanded) return;
    setHolder((prev) => prev || buyer.name || "");
    void fetch("/api/account/cards", { cache: "no-store", credentials: "include" })
      .then((res) => res.json())
      .then((data: { cards?: PublicSavedCard[] }) => setSaved(Array.isArray(data.cards) ? data.cards : []))
      .catch(() => setSaved([]));
  }, [expanded, buyer.name]);

  useEffect(() => {
    if (!expanded) {
      teardownThreeDS();
      return;
    }
    const stopLeaks = observeIyzicoLeaks();
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { source?: string; status?: string; payment?: string } | null;
      if (!data || data.source !== IYZICO_3DS_MESSAGE) return;
      teardownThreeDS();
      if (data.payment === "failed") {
        onFailedRef.current(copy.failed);
        return;
      }
      onPendingRef.current();
    };
    const onPop = () => {
      teardownThreeDS();
    };
    const onHide = () => {
      destroyIyzicoArtifacts();
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("popstate", onPop);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      stopLeaks();
      teardownThreeDS();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const removeCard = async (id: string) => {
    await fetch(`/api/account/cards?id=${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
    setSaved((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId("");
  };

  const submitFields = async () => {
    if (fieldError) {
      setError(fieldError);
      return;
    }
    if (onRequestPay) {
      await onRequestPay();
      return;
    }
    await charge();
  };

  const charging = busy || Boolean(bookingBusy);

  return (
    <div
      id="lonaliza-iyzico-card-sheet"
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
        expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
      dir={rtl ? "rtl" : "ltr"}
      aria-hidden={!expanded}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
          {sandbox ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-[11px] font-bold text-amber-950">
              {copy.sandbox}
            </p>
          ) : null}

          {threeDSHtml ? (
            <div id="lonaliza-iyzico-3ds" className="flex min-h-[360px] flex-col bg-white">
              <p className="px-1 pb-2 text-xs text-slate-600">{copy.threeDs}</p>
              <iframe
                ref={iframeRef}
                title="3-D Secure"
                srcDoc={threeDSHtml}
                className="min-h-[340px] w-full flex-1 rounded-xl border border-slate-100"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
              />
              <button
                type="button"
                onClick={() => {
                  teardownThreeDS();
                  onFailedRef.current(copy.failed);
                }}
                className="min-h-[44px] px-2 py-2 text-sm font-bold text-slate-600"
              >
                {copy.close}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-black text-[#2e1065]">{amountLabel}</p>

              {saved.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500">{copy.savedCards}</p>
                  {saved.map((card) => (
                    <label
                      key={card.id}
                      className={`flex min-h-[44px] cursor-pointer items-center justify-between gap-2 rounded-2xl border px-3 py-2 ${
                        selectedId === card.id ? "border-purple-600 bg-purple-50" : "border-slate-200"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <input
                          type="radio"
                          name="saved-card"
                          checked={selectedId === card.id}
                          onChange={() => setSelectedId(card.id)}
                        />
                        <CreditCard size={16} />
                        {card.brand} •••• {card.last4}
                      </span>
                      <button
                        type="button"
                        onClick={() => void removeCard(card.id)}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-slate-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </label>
                  ))}
                  <button type="button" onClick={() => setSelectedId("")} className="min-h-[44px] text-xs font-bold text-purple-800">
                    {copy.useNewCard}
                  </button>
                </div>
              ) : null}

              {!selectedId ? (
                <>
                  <label className="block text-xs font-bold text-slate-600">
                    {copy.cardholder}
                    <input
                      value={holder}
                      onChange={(e) => setHolder(e.target.value)}
                      autoComplete="cc-name"
                      className={`mt-1 ${fieldClass}`}
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-600">
                    {copy.number}
                    <input
                      value={number}
                      onChange={(e) => setNumber(formatCardNumberDisplay(e.target.value))}
                      inputMode="numeric"
                      autoComplete="cc-number"
                      className={`mt-1 ${fieldClass}`}
                      dir="ltr"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block text-xs font-bold text-slate-600">
                      {copy.expiry}
                      <input
                        value={expiry}
                        onChange={(e) => {
                          const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                        }}
                        placeholder="MM/YY"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        className={`mt-1 ${fieldClass}`}
                        dir="ltr"
                      />
                    </label>
                    <label className="block text-xs font-bold text-slate-600">
                      {copy.cvc}
                      <input
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        className={`mt-1 ${fieldClass}`}
                        dir="ltr"
                      />
                    </label>
                  </div>
                  <label className="flex min-h-[44px] items-start gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="mt-1"
                    />
                    <span>{copy.saveCard}</span>
                  </label>
                </>
              ) : (
                <label className="block text-xs font-bold text-slate-600">
                  {copy.cvc}
                  <input
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    className={`mt-1 ${fieldClass}`}
                    dir="ltr"
                  />
                </label>
              )}

              <p className="inline-flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-purple-700" />
                {copy.pci}
              </p>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button
                type="button"
                disabled={charging || Boolean(payDisabled)}
                onClick={() => void submitFields()}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-[#2e1065] py-3 font-bold text-white disabled:opacity-50"
              >
                {charging ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                {charging ? copy.processing : payLabel || copy.pay}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default IyzicoCardSheet;
export { IyzicoCardSheet as IyzicoCardAccordion };
