"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2, Send, Radio } from "lucide-react";
import LonalizaAudioPlayer from "@/components/messaging/LonalizaAudioPlayer";

export default function VoiceNoteRecorder({
  disabled,
  onRecorded,
}: {
  disabled?: boolean;
  onRecorded: (file: File, durationMs: number) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<number | null>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearInterval(timer.current);
      recRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function start() {
    setError("");
    setBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const type = rec.mimeType || "audio/webm";
        setBlob(new Blob(chunks.current, { type }));
      };
      recRef.current = rec;
      startedAt.current = Date.now();
      rec.start();
      setRecording(true);
      setSeconds(0);
      timer.current = window.setInterval(() => {
        const s = Math.round((Date.now() - startedAt.current) / 1000);
        setSeconds(s);
        if (s >= 120) stop();
      }, 250);
    } catch {
      setError("اسمح للميكروفون لتسجيل ملاحظة صوتية");
    }
  }

  function stop() {
    if (timer.current) window.clearInterval(timer.current);
    recRef.current?.stop();
    setRecording(false);
  }

  function cancel() {
    if (timer.current) window.clearInterval(timer.current);
    recRef.current?.stop();
    setRecording(false);
    setBlob(null);
    setSeconds(0);
  }

  function send() {
    if (!blob) return;
    const ext = blob.type.includes("mp4") ? "m4a" : "webm";
    const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: blob.type || "audio/webm" });
    onRecorded(file, Math.max(500, Date.now() - startedAt.current));
    setBlob(null);
    setSeconds(0);
  }

  // Audio Preview with custom Lonaliza player
  if (blob && !recording) {
    const previewUrl = URL.createObjectURL(blob);
    return (
      <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-[#EDE9FE] border border-purple-300/80 px-3 py-1.5 shadow-sm">
        <LonalizaAudioPlayer src={previewUrl} durationMs={seconds * 1000} bubbleTone="purple" />
        <button
          type="button"
          onClick={() => setBlob(null)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-rose-600 hover:bg-rose-50 shadow-xs transition-colors"
          title="حذف التسجيل"
          aria-label="حذف"
        >
          <Trash2 size={16} />
        </button>
        <button
          type="button"
          onClick={send}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2E1065] to-[#7C3AED] text-amber-300 shadow-md hover:scale-105 active:scale-95 transition-all"
          title="إرسال الملاحظة الصوتية"
          aria-label="إرسال الصوت"
        >
          <Send size={16} />
        </button>
      </div>
    );
  }

  // Active Live Recording State
  if (recording) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-rose-50/90 border border-rose-200 px-3.5 py-1.5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
          </span>
          <span className="text-xs font-black font-mono text-rose-700">
            {Math.floor(seconds / 60)}:{seconds % 60 < 10 ? "0" : ""}{seconds % 60}
          </span>
        </div>

        {/* Live Audio Equalizer Bars animation */}
        <div className="flex items-center gap-1 h-5 px-1">
          {[40, 90, 60, 100, 70, 85, 45, 95, 60, 80].map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className="w-1 rounded-full bg-rose-500 animate-pulse"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={cancel}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-100/50 shadow-xs transition-colors"
          title="إلغاء"
          aria-label="إلغاء"
        >
          <Trash2 size={16} />
        </button>

        <button
          type="button"
          onClick={stop}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md hover:bg-rose-700 active:scale-95 transition-all"
          title="إنهاء التسجيل ومعاينته"
          aria-label="إيقاف"
        >
          <Square size={14} className="fill-white" />
        </button>
      </div>
    );
  }

  // Default Idle State: Prominent Royal Purple & Gold Button
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={start}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2E1065] via-[#431475] to-[#7C3AED] text-amber-300 shadow-md shadow-purple-950/20 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all ring-1 ring-amber-400/30"
        title="تسجيل رسالة صوتية"
        aria-label="تسجيل صوتي"
      >
        <Mic size={20} className="text-amber-300" />
      </button>
      {error ? <p className="max-w-[10rem] text-[10px] font-bold text-rose-600 leading-tight">{error}</p> : null}
    </div>
  );
}
