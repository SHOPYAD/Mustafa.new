// src/components/admin/transfers/AiFleetOnboardingModal.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Sparkles,
  Upload,
  Video,
  Mic,
  MicOff,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Loader2,
  Car,
  Users,
  Luggage,
  Play,
  Pencil,
  ArrowRight,
  Globe2,
  Send,
  Trash2,
} from "lucide-react";
import { getAmenityIcon } from "./VehicleClassesTab";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveDirect: (vehicleClass: any) => Promise<void>;
  onEditInForm: (vehicleClass: any) => void;
}

export const AiFleetOnboardingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveDirect,
  onEditInForm,
}) => {
  const [promptText, setPromptText] = useState("");
  const [images, setImages] = useState<Array<{ url: string; isCover: boolean }>>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<"ar" | "en" | "tr">("ar");

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "ar-SA";

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setPromptText((prev) => `${prev} ${finalTranscript}`.trim());
          }
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Timer for voice recording
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert("التسجيل الصوتي المباشر غير مدعوم في متصفحك الحالي، يمكنك كتابة الوصف يدوياً.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Voice start error:", err);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/transfers/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "فشل رفع الملف");

        if (data.mediaType === "video") {
          setVideoUrl(data.url);
        } else {
          setImages((prev) => [
            ...prev,
            { url: data.url, isCover: prev.length === 0 },
          ]);
        }
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء رفع الصور");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [
      ...prev,
      { url: imageUrlInput.trim(), isCover: prev.length === 0 },
    ]);
    setImageUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  const handleSetCover = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isCover: i === index,
      }))
    );
  };

  const handleGenerateAi = async () => {
    if (!promptText.trim() && images.length === 0) {
      setError("يرجى إدخال شرح عن السيارة أو رفع صورة واحدة على الأقل لتحليلها.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/transfers/admin/ai-fleet-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText,
          images: images.map((img) => ({ url: img.url, isCover: img.isCover })),
          videoUrl,
        }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "فشل استخراج بيانات السيارة بالذكاء الاصطناعي");

      setAiResult(data.vehicleClass);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء استدعاء وكيل الذكاء الاصطناعي");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDirectPublish = async () => {
    if (!aiResult) return;
    await onSaveDirect(aiResult);
    onClose();
  };

  const handleTransferToEdit = () => {
    if (!aiResult) return;
    onEditInForm(aiResult);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-purple-200/60 dark:border-purple-900/50 shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Bot size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  وكيل الذكاء الاصطناعي لإضافة سيارات الأسطول
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                  AI Fleet Copilot
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5 font-sans">
                ارفع صور وفيديوهات السيارة واكتب أو سجل صوتياً بأي لغة (عربي، تركي، إنجليزي، فرنسي) وسيتكفل الذكاء الاصطناعي باستخراج كافة المواصفات والمميزات بدقة.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input Form (Photos, Voice, Prompt) */}
          <div className="lg:col-span-6 space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold">
                {error}
              </div>
            )}

            {/* Step 1: Media Upload Dropzone */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900 dark:text-white flex items-center justify-between">
                <span>1. صور وفيديوهات السيارة</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {images.length} صور مضافة
                </span>
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-200 dark:border-purple-800/80 hover:border-purple-500 dark:hover:border-purple-500 bg-purple-50/30 dark:bg-purple-950/20 p-4 rounded-2xl text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="size-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isUploading ? "جاري رفع الصور والفيديو..." : "اضغط لرفع صور السيارة من جهازك (يدعم السحب والإفلات)"}
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans">
                    صيغ الصور: JPG, PNG, WEBP (حتى 15MB) | الفيديو: MP4 (حتى 100MB)
                  </div>
                </div>
              </div>

              {/* Paste Image URL */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddImageUrl()}
                  placeholder="أو الصق رابط صورة مباشرة (URL)..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-200 cursor-pointer"
                >
                  إضافة
                </button>
              </div>

              {/* Image Thumbnails Strip */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative size-16 rounded-xl overflow-hidden border-2 transition-all group ${
                        img.isCover ? "border-amber-400 shadow-md ring-2 ring-amber-400/30" : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      {img.isCover && (
                        <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1 rounded-sm">
                          غلاف
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {!img.isCover && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(idx)}
                            className="p-1 rounded bg-amber-400 text-black text-[9px] font-bold"
                            title="تعيين كغلاف"
                          >
                            غلاف
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 rounded bg-rose-600 text-white"
                          title="حذف"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Video Link */}
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Video size={16} />
                </div>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="رابط فيديو جولة 360° (YouTube / MP4)..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Step 2: Voice or Text Prompt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-900 dark:text-white">
                  2. شرح السيارة (صوتياً أو كتابياً)
                </label>
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm ${
                    isRecording
                      ? "bg-rose-600 text-white animate-pulse shadow-rose-600/30"
                      : "bg-purple-700 hover:bg-purple-800 text-white"
                  }`}
                >
                  {isRecording ? <MicOff size={14} className="text-white shrink-0" /> : <Mic size={14} className="text-white shrink-0" />}
                  <span className="text-white font-black">
                    {isRecording
                      ? `جاري التسجيل (${recordingTime} ثانية) - اضغط للإيقاف`
                      : "تسجيل صوتي حي 🎙️"}
                  </span>
                </button>
              </div>

              <textarea
                rows={4}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="اكتب أو سجل صوتياً بأي لغة (عربي، تركي، إنجليزي، فرنسي)...&#10;مثال: مرسيدس فيتو 2024 VIP مقاعد مساج وثلاجة ومشروبات وشاشة ذكية Apple TV واستقبال مطار إسطنبول وسائق يتحدث العربية يتسع لـ 6 ركاب و 6 حقائب..."
                className="w-full p-3.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
              />

              {/* Quick Template Chips */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400">قوالب سريعة بنقرة واحدة:</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "مرسيدس فيتو VIP ملكية 2024 (6 مقاعد مساج وثلاجة)",
                    "مرسيدس سبرينتر VIP عائلات ومجموعات كبيرة (14 راكب)",
                    "مرسيدس مايباخ S-Class قمة الفخامة الرئاسية (3 ركاب)",
                    "فولكس فاجن كارافيلا VIP رجال أعمال (8 ركاب)",
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPromptText(preset)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 text-[10px] font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Big Action Button */}
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleGenerateAi}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-xs font-black bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white shadow-lg shadow-purple-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin text-amber-300" />
                  <span>الذكاء الاصطناعي يقوم بتحليل السيارة واستخراج المواصفات...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-amber-300" />
                  <span>توليد وتحليل فئة السيارة بالذكاء الاصطناعي ✨</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: AI Live Result & Fleet Publishing */}
          <div className="lg:col-span-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-r rtl:lg:border-r-0 rtl:lg:border-l border-slate-200 dark:border-slate-800 pt-6 lg:pt-0 lg:pe-6">
            {!aiResult ? (
              <div className="h-full min-h-[380px] flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-50/60 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
                <div className="size-16 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
                  <Car size={32} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    معاينة بطاقة السيارة المستخرجة بالذكاء الاصطناعي
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
                    ارفع الصور واكتب الشرح أو سجله صوتياً واضغط على زر التوليد لمعاينة فئة السيارة ومواصفاتها واعتمادها مباشرة في الأسطول.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn flex flex-col h-full justify-between">
                <div className="space-y-4">
                  {/* Generated Card Preview */}
                  <div className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 shadow-xl overflow-hidden">
                    {/* Visual Cover */}
                    <div className="relative h-44 w-full bg-slate-950">
                      <img
                        src={aiResult.images?.[0]?.url || "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80"}
                        alt={aiResult.name?.ar}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md uppercase">
                          {aiResult.tier?.toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                          جاهزة للاعتماد
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 left-3 text-white">
                        <h4 className="text-base font-black leading-snug">{aiResult.name?.ar}</h4>
                        <div className="text-xs text-purple-200/90 font-sans">{aiResult.name?.en}</div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3 text-xs">
                      {/* Capacity Chips */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                            <Users size={13} />
                          </div>
                          <span className="font-bold">سعة {aiResult.capacity?.passengers || 6} ركاب</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                            <Luggage size={13} />
                          </div>
                          <span className="font-bold">سعة {aiResult.capacity?.luggageLarge || 6} حقائب</span>
                        </div>
                      </div>

                      {/* Extracted Amenities with Custom Icons */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          المميزات المستخرجة والمربوطة بأيقوناتها:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(aiResult.amenities || []).map((amenity: string, idx: number) => {
                            const IconComp = getAmenityIcon(amenity);
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 border border-purple-200/80 dark:border-purple-800 text-[10px] font-bold shadow-2xs"
                              >
                                <IconComp size={12} className="text-purple-700 dark:text-purple-400 shrink-0" />
                                <span>{amenity}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Multi-language Description Tabs */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-500">الوصف متعدد اللغات:</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setActiveLangTab("ar")}
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                activeLangTab === "ar" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              العربية
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveLangTab("en")}
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                activeLangTab === "en" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              English
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveLangTab("tr")}
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                activeLangTab === "tr" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              Türkçe
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                          {aiResult.description?.[activeLangTab] || aiResult.description?.ar}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Publish CTAs */}
                <div className="space-y-2 pt-4">
                  <button
                    type="button"
                    onClick={handleDirectPublish}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>اعتماد وحفظ السيارة في الأسطول مباشرة بنقرة واحدة (Publish Fleet)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTransferToEdit}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/40 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                  >
                    <Pencil size={14} />
                    <span>مراجعة وتعديل البيانات في النموذج الكامل</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
