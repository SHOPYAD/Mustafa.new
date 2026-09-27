"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2, Send } from "lucide-react";

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
        if (s >= 60) stop();
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

  function send() {
    if (!blob) return;
    const ext = blob.type.includes("mp4") ? "m4a" : "webm";
    const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: blob.type || "audio/webm" });
    onRecorded(file, Math.max(500, Date.now() - startedAt.current));
    setBlob(null);
    setSeconds(0);
  }

  if (blob && !recording) {
    return (
      <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-purple-50 px-2 py-1">
        <audio controls src={URL.createObjectURL(blob)} className="h-10 min-w-0 flex-1" />
        <button type="button" onClick={() => setBlob(null)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white" aria-label="حذف">
          <Trash2 size={16} />
        </button>
        <button type="button" onClick={send} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7C3AED] text-white" aria-label="إرسال الصوت">
          <Send size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {recording ? (
        <>
          <span className="text-xs font-black text-rose-600">{seconds}s</span>
          <button type="button" onClick={stop} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white" aria-label="إيقاف">
            <Square size={16} />
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={start}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-[#2E1065] disabled:opacity-40"
          aria-label="تسجيل صوتي"
        >
          <Mic size={18} />
        </button>
      )}
      {error ? <p className="max-w-[9rem] text-[11px] font-semibold text-rose-600">{error}</p> : null}
    </div>
  );
}
