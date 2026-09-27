"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  TrendingUp,
  Share2,
  Video,
  FileText,
  Package,
  Building2,
  Plane,
  ChevronLeft,
  ChevronRight,
  Hand,
  Sparkles,
  Zap,
  Play,
  ExternalLink,
  Volume2,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Camera,
  CameraOff,
  Maximize2,
  X,
  Activity,
  Layers,
  ShieldCheck,
} from "lucide-react";

export interface HolographicCardSector {
  id: string;
  stationId: string;
  titleAr: string;
  titleEn: string;
  category: string;
  color: string;
  icon: any;
  metricLabel1: string;
  metricValue1: string;
  metricLabel2: string;
  metricValue2: string;
  status: "OPTIMAL" | "NOMINAL" | "ACTIVE";
  description: string;
  quickActionCommand: string;
  features: string[];
}

export const NEXUS_SECTOR_CARDS: HolographicCardSector[] = [
  {
    id: "nexus-hotels",
    stationId: "hotels",
    titleAr: "محرك الفنادق والـ GDS العالمي (On-Demand)",
    titleEn: "GLOBAL HOTELS & BEDBANKS ENGINE",
    category: "الفنادق وشبكة الموردين العالمية",
    color: "#00e5ff",
    icon: Building2,
    metricLabel1: "عروض المتجر الرئيسية",
    metricValue1: "140 فندق مختار",
    metricLabel2: "تغطية الموردين (Travelport / Seeru / PKFare)",
    metricValue2: "تغطية عالمية On-Demand",
    status: "OPTIMAL",
    description: "محرك بحث حي متصل بموردي العالم حسب الطلب لكافة المدن مع تثبيت الصرف، وإدارة تسويق الـ 140 فندق المعروضة بالسلايدر الرئيسي.",
    quickActionCommand: "مزامنة أسعار فنادق السلايدر الرئيسي وتحديث هوامش الربح مع الموردين",
    features: [
      "بحث مباشر On-Demand عبر ترافلبورت وسيرو وبكفير",
      "إدارة أسعار وتوافر الـ 140 فندق المختارة للمتجر",
      "حماية تسعير الصرف اللحظي ضد تقلبات العملة",
      "قفل هوامش ربح الموردين تلقائياً بنسب +15% و +18%",
    ],
  },
  {
    id: "nexus-flights",
    stationId: "flights",
    titleAr: "رادار تذاكر الطيران وموزعو GDS",
    titleEn: "FLIGHTS RADAR & TICKETING GDS",
    category: "حجوزات الطيران والـ GDS",
    color: "#38bdf8",
    icon: Plane,
    metricLabel1: "الربط الآلي للتذاكر",
    metricValue1: "Travelport & Seeru GDS",
    metricLabel2: "هوامش أرباح التذاكر",
    metricValue2: "+8% إلى +14%",
    status: "OPTIMAL",
    description: "رادار الرحلات الجوية العالمي مع إصدار التذاكر الفوري وإعادة التوجيه الذكي ومراقبة تحديثات المقاعد والأسعار.",
    quickActionCommand: "فحص رادار رحلات اليوم وضبط هوامش ربح تذاكر طيران الخليج وإسطنبول",
    features: [
      "مزامنة جداول رحلات الخطوط التركية وطيران الخليج",
      "إصدار التذاكر الفوري الآلي عبر بوابات GDS",
      "تنبيهات فورية لتغير أوقات الإقلاع والبوابات",
      "قفل العمولات الذاتية لحجوزات الأفراد والشركات",
    ],
  },
  {
    id: "nexus-transfers",
    stationId: "transfers",
    titleAr: "أسطول النقل البري وتتبع السائقين VIP",
    titleEn: "VIP FLEET & GROUND DISPATCH",
    category: "المواصلات وتأجير السيارات",
    color: "#10b981",
    icon: Package,
    metricLabel1: "أسطول مرسيدس فيتو",
    metricValue1: "18 سيارة VIP نشطة",
    metricLabel2: "تغطية المسارات والمطارات",
    metricValue2: "طرابزون، إسطنبول، بورصة",
    status: "OPTIMAL",
    description: "إدارة وتوزيع سيارات مرسيدس فيتو العائلية مع نظام التتبع اللحظي للسائقين واستقبال المطارات والجولات اليومية.",
    quickActionCommand: "مراجعة جداول حركة الأسطول وتعيين سائقي استقبال مطار طرابزون وإسطنبول",
    features: [
      "تتبع حي لمواقع المركبات عبر GPS والخرائط",
      "سائقين محترفين يتحدثون العربية والتركية بطلاقة",
      "تسعير ديناميكي حسب المسارات والكيلومترات",
      "ربط مباشر مع رحلات الطيران لمنع التأخير",
    ],
  },
  {
    id: "nexus-b2b",
    stationId: "resale",
    titleAr: "شبكة وكالات السفر ومحافظ B2B",
    titleEn: "B2B RESELLERS & DEPOSIT WALLET",
    category: "توزيع B2B والشركات",
    color: "#a855f7",
    icon: TrendingUp,
    metricLabel1: "محفظة التوريد المركزية",
    metricValue1: "$307,400 رصيد ديبوزيت",
    metricLabel2: "الوكالات المعتمدة",
    metricValue2: "42 وكالة شريكة",
    status: "ACTIVE",
    description: "إدارة خطوط الائتمان ومحافظ الشحن المركزية للشركات والوكالات السياحية وإصدار التذاكر على مدار الساعة.",
    quickActionCommand: "مراجعة إيداعات وكالات B2B وتأكيد خطوط الائتمان للحجوزات المعلقة",
    features: [
      "محفظة ديبوزيت موحدة بخصم فوري للعمليات",
      "بوابة وكيل خاصة بأسعار الجملة للشركات",
      "تسويات يومية آلية مع إصدار كشوف الحساب",
      "تحكم بصلاحيات حجز الطيران والفنادق للشركاء",
    ],
  },
  {
    id: "nexus-ads",
    stationId: "ads",
    titleAr: "حملات Meta Ads و Google PMax",
    titleEn: "ADS & ROAS MASTER DECK",
    category: "الحملات والتسويق الرقمي",
    color: "#f59e0b",
    icon: TrendingUp,
    metricLabel1: "متوسط ROAS المحقق",
    metricValue1: "4.8x عائـد",
    metricLabel2: "الميزانية النشطة",
    metricValue2: "$1,450 / يوم",
    status: "OPTIMAL",
    description: "إدارة وضبط ميزانيات إعلانات الخليج، مراقبة كلفة النقرة اللحظية وتوليد الكريتيف الذاتي بالذكاء الاصطناعي.",
    quickActionCommand: "تشغيل أتمتة الحملات الإعلانية ومضاعفة ميزانية الباقات الأكثر تحويلاً",
    features: [
      "مراقبة CBO و Target ROAS اللحظي",
      "توليد 6 نسخ إعلانية بلهجة خليجية بيضاء",
      "إيقاف تلقائي للحملات المنهكة",
      "ربط مباشر مع بيكسل Meta و Google CAPI",
    ],
  },
  {
    id: "nexus-social",
    stationId: "publish",
    titleAr: "مصنع المحتوى والريلز ومقالات SEO",
    titleEn: "AI CONTENT & MEDIA STUDIO",
    category: "النشر والإنتاج البصري",
    color: "#ec4899",
    icon: Share2,
    metricLabel1: "أدلة السفر المفهرسة",
    metricValue1: "48 مقالاً E-E-A-T",
    metricLabel2: "ريلز درون البسفور 4K",
    metricValue2: "6 ريلز جاهزة للبث",
    status: "ACTIVE",
    description: "نشر متزامن رسمي عبر الـ API لـ Instagram و TikTok و X وقناة التليجرام مع أدلة السفر المفهرسة في Google.",
    quickActionCommand: "إطلاق جدولة محتوى الذروة لرحلات طرابزون وأوزنجول على كافة القنوات",
    features: [
      "جدولة متوافقة مع قمم توقيت الرياض والخليج",
      "ريلز 4K لطرابزون والبسفور بتعليق صوتي خليجي",
      "مقالات 2500+ كلمة بمعايير Google E-E-A-T",
      "بث فوري عبر الـ API بدون تدخل يدوي",
    ],
  },
];

interface HolographicCylinderStageProps {
  frequencies?: number[];
  onSelectSector?: (stationId: string) => void;
  onSendDirective?: (directive: string) => void;
  className?: string;
}

export default function HolographicCylinderStage({
  frequencies = [],
  onSelectSector,
  onSendDirective,
  className = "",
}: HolographicCylinderStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const activeCardIndexRef = useRef<number>(0);
  const [isHandTrackingActive, setIsHandTrackingActive] = useState<boolean>(false);
  const [gestureFeedback, setGestureFeedback] = useState<string>("تحكم الماوس واللمس: نشط");
  const [activeGestureType, setActiveGestureType] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState<boolean>(false);

  // Video and offscreen canvas for real motion detection
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const gestureCooldownRef = useRef<number>(0);
  
  // Phase 4: Advanced Gesture State Machine Refs
  const palmStableFramesRef = useRef<number>(0);
  const cylinderVelocityRef = useRef<number>(0);

  // Cylinder parameters (Enhanced radius and elegant proportional scale)
  const CARD_COUNT = NEXUS_SECTOR_CARDS.length;
  const ANGLE_STEP = (2 * Math.PI) / CARD_COUNT;
  const CYLINDER_RADIUS = 340; // Increased radius for spacious depth

  // Active Card Data
  const activeCard = NEXUS_SECTOR_CARDS[activeCardIndex];

  // Helper to create curved card geometry with EXPLICIT [0, 1] UV mapping
  const createCurvedCardGeometry = (radius: number, width: number, height: number, segments: number) => {
    const geo = new THREE.BufferGeometry();
    const arcAngle = width / radius; // angle spanned by card width

    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const segX = segments;
    const segY = 8;

    for (let j = 0; j <= segY; j++) {
      const v = j / segY;
      const y = (0.5 - v) * height;

      for (let i = 0; i <= segX; i++) {
        const u = i / segX;
        const angle = (u - 0.5) * arcAngle;

        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius - radius; // curve inward

        positions.push(x, y, z);
        uvs.push(u, 1 - v);
      }
    }

    for (let j = 0; j < segY; j++) {
      for (let i = 0; i < segX; i++) {
        const a = j * (segX + 1) + i;
        const b = (j + 1) * (segX + 1) + i;
        const c = (j + 1) * (segX + 1) + (i + 1);
        const d = j * (segX + 1) + (i + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  };

  // Helper to generate dynamic high-tech canvas textures for each 3D card
  const createCardTexture = (card: HolographicCardSector, index: number, isHighlighted: boolean) => {
    const canvas = document.createElement("canvas");
    canvas.width = 440;
    canvas.height = 620;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Dark Glassmorphism Background
    const bgGrad = ctx.createLinearGradient(0, 0, 440, 620);
    bgGrad.addColorStop(0, "rgba(4, 18, 42, 0.96)");
    bgGrad.addColorStop(0.5, "rgba(2, 10, 26, 0.98)");
    bgGrad.addColorStop(1, "rgba(1, 6, 18, 1.0)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 440, 620);

    // Cyber Scanlines
    ctx.fillStyle = "rgba(0, 229, 255, 0.04)";
    for (let y = 0; y < 620; y += 7) {
      ctx.fillRect(0, y, 440, 2.5);
    }

    // Glowing Neon Border
    ctx.strokeStyle = isHighlighted ? "#00e5ff" : card.color;
    ctx.lineWidth = isHighlighted ? 8 : 4;
    ctx.strokeRect(8, 8, 424, 604);

    // Inner Corner Brackets
    ctx.strokeStyle = isHighlighted ? "#f59e0b" : "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 3;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(20, 60);
    ctx.lineTo(20, 20);
    ctx.lineTo(60, 20);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(420 - 40, 20);
    ctx.lineTo(420, 20);
    ctx.lineTo(420, 60);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(20, 600 - 40);
    ctx.lineTo(20, 600);
    ctx.lineTo(60, 600);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(420 - 40, 600);
    ctx.lineTo(420, 600);
    ctx.lineTo(420, 600 - 40);
    ctx.stroke();

    // Sector Number Badge
    ctx.fillStyle = isHighlighted ? "#00e5ff" : "rgba(255, 255, 255, 0.85)";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`[SECTOR 0${index + 1}]`, 32, 60);

    // Status Badge
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`• ${card.status}`, 408, 60);

    // Category Label
    ctx.fillStyle = "rgba(148, 163, 184, 0.95)";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(card.category, 220, 110);

    // Card Title (Arabic)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(card.titleAr, 220, 155);

    // English Subtitle
    ctx.fillStyle = card.color;
    ctx.font = "bold 15px monospace";
    ctx.fillText(card.titleEn, 220, 190);

    // Horizontal Divider
    ctx.strokeStyle = "rgba(0, 229, 255, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(32, 215);
    ctx.lineTo(408, 215);
    ctx.stroke();

    // Metric 1 Box
    ctx.fillStyle = "rgba(4, 26, 56, 0.85)";
    ctx.fillRect(32, 235, 376, 75);
    ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
    ctx.strokeRect(32, 235, 376, 75);

    ctx.fillStyle = "rgba(148, 163, 184, 0.95)";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(card.metricLabel1, 392, 262);
    ctx.fillStyle = "#00e5ff";
    ctx.font = "bold 26px monospace";
    ctx.fillText(card.metricValue1, 392, 298);

    // Metric 2 Box
    ctx.fillStyle = "rgba(4, 26, 56, 0.85)";
    ctx.fillRect(32, 325, 376, 75);
    ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
    ctx.strokeRect(32, 325, 376, 75);

    ctx.fillStyle = "rgba(148, 163, 184, 0.95)";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(card.metricLabel2, 392, 352);
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 24px monospace";
    ctx.fillText(card.metricValue2, 392, 388);

    // Description text
    ctx.fillStyle = "rgba(226, 232, 240, 0.9)";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(card.description.slice(0, 36), 220, 445);
    ctx.fillText(card.description.slice(36, 75), 220, 472);

    // Bottom Action Prompt
    ctx.fillStyle = isHighlighted ? "rgba(0, 229, 255, 0.25)" : "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(32, 520, 376, 55);
    ctx.strokeStyle = isHighlighted ? "#00e5ff" : "rgba(255, 255, 255, 0.25)";
    ctx.strokeRect(32, 520, 376, 55);

    ctx.fillStyle = isHighlighted ? "#00e5ff" : "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.fillText("[ انقر أو ابسط كفك للفتح الكامل ]", 220, 554);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  const rotateTo = useCallback(
    (index: number) => {
      const nextIdx = (index + CARD_COUNT) % CARD_COUNT;
      setActiveCardIndex(nextIdx);
      activeCardIndexRef.current = nextIdx;
    },
    [CARD_COUNT]
  );

  // Toggle Webcam Hand Tracking
  const toggleCamera = async () => {
    if (isHandTrackingActive) {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((t) => t.stop());
        webcamStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsHandTrackingActive(false);
      setGestureFeedback("تحكم الماوس واللمس: نشط");
      setActiveGestureType(null);
    } else {
      setCameraError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: false,
        });
        webcamStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
        setIsHandTrackingActive(true);
        setGestureFeedback("التعقب البصري نشط: لوّح يميناً/يساراً أو ابسط كفك");
      } catch (err: any) {
        console.warn("[NexusCamera] Permission or access error:", err);
        setCameraError("لم يتم منح إذن الكاميرا أو الجهاز لا يدعمها");
        setGestureFeedback("فشل فتح الكاميرا - الرجوع لتحكم الماوس");
      }
    }
  };

  // Real-time Computer Vision Optical Flow / Hand Gesture Detection Loop
  useEffect(() => {
    if (!isHandTrackingActive) return;

    let motionInterval: NodeJS.Timeout;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    motionCanvasRef.current = canvas;

    let prevCentroidX = 32;
    palmStableFramesRef.current = 0;

    motionInterval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !ctx) return;

      const now = Date.now();
      ctx.drawImage(video, 0, 0, 64, 48);
      const frame = ctx.getImageData(0, 0, 64, 48);
      const data = frame.data;

      if (!prevFrameDataRef.current) {
        prevFrameDataRef.current = new Uint8ClampedArray(data);
        return;
      }

      let motionPixels = 0;
      let sumX = 0;
      let sumY = 0;
      const prevData = prevFrameDataRef.current;

      for (let i = 0; i < data.length; i += 4) {
        const diffR = Math.abs(data[i] - prevData[i]);
        const diffG = Math.abs(data[i + 1] - prevData[i + 1]);
        const diffB = Math.abs(data[i + 2] - prevData[i + 2]);
        const totalDiff = (diffR + diffG + diffB) / 3;

        if (totalDiff > 28) {
          const pixelIndex = i / 4;
          const py = Math.floor(pixelIndex / 64);
          // Phase 4 ROI (Region of Interest): Ignore top 22 pixels (head motion)
          if (py > 22) {
            motionPixels++;
            const px = pixelIndex % 64;
            sumX += px;
            sumY += py;
          }
        }
      }

      prevFrameDataRef.current.set(data);

      if (now < gestureCooldownRef.current) return;

      // Inspect Modal is Open -> Listen for Closed Fist (sudden sharp contraction)
      // A fist creates a very small, concentrated motion block compared to a palm.
      setInspectModalOpen((isModalOpen) => {
        if (isModalOpen) {
          if (motionPixels > 50 && motionPixels < 200) {
            // Closed fist detected
            gestureCooldownRef.current = now + 1200;
            setActiveGestureType("FIST_CLOSED");
            setGestureFeedback("✊ قبضة مغلقة: إغلاق النافذة");
            setInspectModalOpen(false);
            setTimeout(() => setActiveGestureType(null), 1000);
          }
          return isModalOpen;
        }

        // Modal is Closed -> Listen for Swipes and Open Palm
        
        // 1. Open Palm (Stable large motion for ~300ms, which is ~3 frames at 90ms)
        if (motionPixels > 250 && motionPixels < 600) {
          palmStableFramesRef.current++;
          if (palmStableFramesRef.current >= 3) { // ~300ms stability
            gestureCooldownRef.current = now + 1400;
            setActiveGestureType("PALM_OPEN");
            setGestureFeedback("✋ كف مستقر: فتح القسم");
            setInspectModalOpen(true);
            palmStableFramesRef.current = 0;
            setTimeout(() => setActiveGestureType(null), 1000);
            return true;
          }
        } else {
          palmStableFramesRef.current = 0;
        }

        // 2. Continuous Velocity Stream Swipe (Hand wave)
        if (motionPixels > 80 && motionPixels < 350 && palmStableFramesRef.current === 0) {
          const centroidX = sumX / motionPixels;
          const deltaX = centroidX - prevCentroidX;
          prevCentroidX = centroidX;

          if (Math.abs(deltaX) > 2) {
            // Apply continuous torque
            cylinderVelocityRef.current += deltaX * 0.0035;
            setActiveGestureType(deltaX > 0 ? "SWIPE_RIGHT" : "SWIPE_LEFT");
            setGestureFeedback(deltaX > 0 ? "👉 تمرير لليمين" : "👈 تمرير لليسار");
            setTimeout(() => {
              setActiveGestureType((prev) => (prev?.startsWith("SWIPE") ? null : prev));
            }, 300);
          }
        }
        
        return isModalOpen;
      });

    }, 90);

    return () => {
      clearInterval(motionInterval);
    };
  }, [isHandTrackingActive, rotateTo]);

  // Main Three.js Scene Setup & Animation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    const w = container.clientWidth || 1280;
    const h = container.clientHeight || 720;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010712, 0.0012);

    const camera = new THREE.PerspectiveCamera(42, w / h, 1, 3000); // FOV 42
    // Position camera so cylinder curves gracefully with depth
    camera.position.set(0, 20, 560); // Z=560, Y=20

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x010712, 1);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Master Cylinder Group
    const cylinderGroup = new THREE.Group();
    scene.add(cylinderGroup);

    // Central & Ambient Lights
    const centralLight = new THREE.PointLight(0x00e5ff, 4.0, 800, 1.2);
    centralLight.position.set(0, 0, 0);
    scene.add(centralLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 3.5, 600, 1.2);
    amberLight.position.set(0, -60, 240);
    scene.add(amberLight);

    const ambientLight = new THREE.AmbientLight(0x041832, 2.4);
    scene.add(ambientLight);

    // 2. Build 6 Curved Holographic Cards on Cylindrical Orbit
    const cardMeshes: THREE.Mesh[] = [];
    const cardTextures: THREE.CanvasTexture[] = [];

    NEXUS_SECTOR_CARDS.forEach((card, idx) => {
      const isHighlighted = idx === activeCardIndexRef.current;
      const texture = createCardTexture(card, idx, isHighlighted)!;
      cardTextures.push(texture);

      // Curved geometry with proper UVs and proportional sizing (120w x 148h) Phase 4
      const cardGeo = createCurvedCardGeometry(CYLINDER_RADIUS, 120, 148, 24);

      const cardMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.96,
      });

      const mesh = new THREE.Mesh(cardGeo, cardMat);
      const angle = idx * ANGLE_STEP;

      mesh.position.x = Math.sin(angle) * CYLINDER_RADIUS;
      mesh.position.z = Math.cos(angle) * CYLINDER_RADIUS;
      mesh.rotation.y = angle;
      mesh.userData = { index: idx, cardId: card.id };

      cylinderGroup.add(mesh);
      cardMeshes.push(mesh);
    });

    // 3. Undulating Floor Wave Particles
    const waveCount = 3800;
    const wavePositions = new Float32Array(waveCount * 3);
    const waveColors = new Float32Array(waveCount * 3);

    for (let i = 0; i < waveCount; i++) {
      const x = (Math.random() - 0.5) * 1100;
      const z = (Math.random() - 0.5) * 1000;
      const y = -140;

      wavePositions[i * 3] = x;
      wavePositions[i * 3 + 1] = y;
      wavePositions[i * 3 + 2] = z;

      const isGold = Math.random() > 0.75;
      waveColors[i * 3] = isGold ? 0.96 : 0.0;
      waveColors[i * 3 + 1] = isGold ? 0.65 : 0.9;
      waveColors[i * 3 + 2] = isGold ? 0.08 : 1.0;
    }

    const waveGeo = new THREE.BufferGeometry();
    waveGeo.setAttribute("position", new THREE.BufferAttribute(wavePositions, 3));
    waveGeo.setAttribute("color", new THREE.BufferAttribute(waveColors, 3));

    const waveMat = new THREE.PointsMaterial({
      size: 3.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const wavePoints = new THREE.Points(waveGeo, waveMat);
    scene.add(wavePoints);

    // 4. Undulating Horizon Base Grid
    const gridHelper = new THREE.GridHelper(1100, 40, 0x00e5ff, 0x031c38);
    gridHelper.position.y = -142;
    scene.add(gridHelper);

    // Target Rotation & Drag State
    let targetRotationY = -activeCardIndexRef.current * ANGLE_STEP;
    let isDragging = false;
    let previousMouseX = 0;

    const domEl = renderer.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMouseX;
        previousMouseX = e.clientX;
        cylinderGroup.rotation.y += deltaX * 0.005;
        targetRotationY = cylinderGroup.rotation.y;
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        const normalizedRot = -cylinderGroup.rotation.y;
        const nearestIndex = Math.round(normalizedRot / ANGLE_STEP);
        targetRotationY = -nearestIndex * ANGLE_STEP;
        const actualIndex = ((nearestIndex % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
        activeCardIndexRef.current = actualIndex;
        setActiveCardIndex(actualIndex);
      }
    };

    domEl.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Touch Support
    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) touchStartX = e.touches[0].clientX;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const deltaX = e.touches[0].clientX - touchStartX;
        touchStartX = e.touches[0].clientX;
        cylinderGroup.rotation.y += deltaX * 0.005;
        targetRotationY = cylinderGroup.rotation.y;
      }
    };
    const handleTouchEnd = () => {
      const normalizedRot = -cylinderGroup.rotation.y;
      const nearestIndex = Math.round(normalizedRot / ANGLE_STEP);
      targetRotationY = -nearestIndex * ANGLE_STEP;
      const actualIndex = ((nearestIndex % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
      activeCardIndexRef.current = actualIndex;
      setActiveCardIndex(actualIndex);
    };

    domEl.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    // Click Raycaster to open card
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = domEl.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cardMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const idx = hit.object.userData.index;
        if (typeof idx === "number") {
          targetRotationY = -idx * ANGLE_STEP;
          activeCardIndexRef.current = idx;
          setActiveCardIndex(idx);
          setInspectModalOpen(true);
        }
      }
    };

    domEl.addEventListener("click", handleClick);

    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth interpolation to target rotation for mouse, plus momentum for hand gestures
      if (isHandTrackingActive && cylinderVelocityRef.current !== 0) {
        cylinderGroup.rotation.y += cylinderVelocityRef.current;
        cylinderVelocityRef.current *= 0.92; // Friction damping
        
        // Update target rotation and nearest index dynamically
        const normalizedRot = -cylinderGroup.rotation.y;
        const nearestIndex = Math.round(normalizedRot / ANGLE_STEP);
        targetRotationY = -nearestIndex * ANGLE_STEP;
        const actualIndex = ((nearestIndex % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
        
        if (actualIndex !== activeCardIndexRef.current) {
          activeCardIndexRef.current = actualIndex;
          setActiveCardIndex(actualIndex);
        }

        // Snap to nearest when velocity is very low
        if (Math.abs(cylinderVelocityRef.current) < 0.001) {
          cylinderVelocityRef.current = 0;
        }
      } else if (!isDragging) {
        targetRotationY = -activeCardIndexRef.current * ANGLE_STEP;
        cylinderGroup.rotation.y += (targetRotationY - cylinderGroup.rotation.y) * 0.08;
      }

      // Gentle floating animation
      cylinderGroup.position.y = Math.sin(elapsed * 1.5) * 4;

      // Animate floor wave particles
      const wavePosArr = waveGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < waveCount; i++) {
        const x = wavePosArr[i * 3];
        const z = wavePosArr[i * 3 + 2];
        const w = Math.sin(x * 0.015 + elapsed * 1.4) * 8 + Math.cos(z * 0.018 + elapsed * 1.1) * 6;
        wavePosArr[i * 3 + 1] = -140 + w;
      }
      waveGeo.attributes.position.needsUpdate = true;

      // Scale up the currently front-facing card slightly
      const currentRot = -cylinderGroup.rotation.y;
      cardMeshes.forEach((mesh, idx) => {
        const cardAngle = idx * ANGLE_STEP;
        const diff = Math.atan2(Math.sin(currentRot - cardAngle), Math.cos(currentRot - cardAngle));
        const isFacingFront = Math.abs(diff) < 0.35;
        const targetScale = isFacingFront ? 1.06 : 0.92;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 1280;
      const nh = container.clientHeight || 720;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      domEl.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      domEl.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      cardMeshes.forEach((m) => m.geometry.dispose());
      cardTextures.forEach((t) => t.dispose());
      waveGeo.dispose();
      waveMat.dispose();
      gridHelper.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [ANGLE_STEP, CARD_COUNT]);

  // Quick Directive Sender
  const handleQuickDirective = () => {
    if (activeCard && onSendDirective) {
      onSendDirective(activeCard.quickActionCommand);
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#010712] select-none ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Top Header Banner */}
      <div className="absolute top-4 left-6 right-6 z-20 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
            <Sparkles className="w-5 h-5 animate-pulse text-cyan-400" />
          </div>
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black font-mono text-white tracking-wide">
                مسرح البطاقات الهولوغرافية ثلاثية الأبعاد (NEXUS 3D Cylinder Stage)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                NEXUS ORBITAL DECK v6.5
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-0.5">
              مدار أسطواني متناسق · تفتيش كامل بالنقر أو ببسط الكف · تحكم باليد أو الماوس
            </span>
          </div>
        </div>

        {/* Live Camera & Gesture Toggle Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={toggleCamera}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-all shadow-lg active:scale-95 ${
              isHandTrackingActive
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "bg-[#031124]/90 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/15"
            }`}
          >
            {isHandTrackingActive ? <CameraOff size={14} /> : <Camera size={14} />}
            <span>{isHandTrackingActive ? "إيقاف الكاميرا" : "تفعيل الكاميرا والتعقب باليد"}</span>
          </button>
        </div>
      </div>

      {/* Top-Left Live Webcam Mini-Monitor with Gesture Detection Overlay */}
      <div className="absolute top-20 left-6 z-20 pointer-events-auto flex flex-col gap-2">
        <div className="relative w-48 h-36 rounded-2xl border-2 border-cyan-500/40 bg-black/85 backdrop-blur-xl overflow-hidden shadow-[0_0_25px_rgba(0,229,255,0.25)] flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isHandTrackingActive ? "block" : "hidden"}`}
          />

          {!isHandTrackingActive && (
            <div className="flex flex-col items-center justify-center gap-1.5 p-3 text-center">
              <Camera size={24} className="text-slate-500" />
              <span className="text-[10px] font-mono text-slate-400 leading-tight">
                كاميرا تعقب اليد غير مفعلة
              </span>
              <button
                type="button"
                onClick={toggleCamera}
                className="mt-1 px-2.5 py-1 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
              >
                تفعيل تعقب اليد
              </button>
            </div>
          )}

          {/* Cyber Scanning Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none border border-cyan-500/20">
            <div className="absolute top-1 left-1 size-2 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-1 right-1 size-2 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-1 left-1 size-2 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-1 right-1 size-2 border-b-2 border-r-2 border-cyan-400" />

            {/* Real-time Hand Gesture Overlay Box */}
            {activeGestureType && (
              <div className="absolute inset-3 border-2 border-dashed border-emerald-400 rounded-lg animate-pulse flex items-center justify-center bg-emerald-500/10">
                <span className="px-2 py-1 rounded bg-black/80 text-[10px] font-mono font-bold text-emerald-300">
                  {activeGestureType === "PALM_OPEN" && "✋ بسط الكف"}
                  {activeGestureType === "SWIPE_RIGHT" && "👉 تلويح يمين"}
                  {activeGestureType === "SWIPE_LEFT" && "👈 تلويح يسار"}
                </span>
              </div>
            )}
          </div>

          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[8px] font-mono text-cyan-400/80 bg-black/60 px-1.5 py-0.5 rounded">
            <span>AI_HAND_TRACK</span>
            <span className={isHandTrackingActive ? "text-emerald-400" : "text-amber-400"}>
              {isHandTrackingActive ? "TRACKING" : "STANDBY"}
            </span>
          </div>
        </div>

        {cameraError && (
          <div className="w-48 px-2 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[9px] text-rose-300 font-mono text-center">
            {cameraError}
          </div>
        )}

        <div className="w-48 px-2.5 py-1.5 rounded-xl bg-[#020b18]/85 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 text-center truncate shadow-sm">
          {gestureFeedback}
        </div>
      </div>

      {/* Orbit Selector Carousel Arrows */}
      <div className="absolute top-20 right-6 z-20 pointer-events-auto flex items-center gap-2 bg-[#020b18]/90 px-3 py-1.5 rounded-2xl border border-cyan-500/30 backdrop-blur-xl shadow-lg">
        <button
          type="button"
          onClick={() => rotateTo(activeCardIndex - 1)}
          className="p-1 rounded-lg hover:bg-cyan-500/20 text-cyan-400 transition-colors"
          title="البطاقة السابقة"
        >
          <ChevronRight size={18} />
        </button>

        <span className="text-xs font-mono font-bold text-white min-w-[80px] text-center">
          0{activeCardIndex + 1} / 0{CARD_COUNT} • {activeCard.titleAr.slice(0, 14)}...
        </span>

        <button
          type="button"
          onClick={() => rotateTo(activeCardIndex + 1)}
          className="p-1 rounded-lg hover:bg-cyan-500/20 text-cyan-400 transition-colors"
          title="البطاقة التالية"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Bottom Floating Quick Directive Bar */}
      <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-auto flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-[#020b18]/90 border border-cyan-500/35 backdrop-blur-2xl shadow-[0_0_35px_rgba(0,229,255,0.25)]">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-xl text-white flex items-center justify-center"
            style={{ backgroundColor: `${activeCard.color}25`, border: `1px solid ${activeCard.color}50` }}
          >
            <activeCard.icon size={20} style={{ color: activeCard.color }} />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-white">{activeCard.titleAr}</span>
            <span className="text-[11px] font-mono text-slate-400 truncate max-w-md">
              {activeCard.description}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInspectModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all active:scale-95"
          >
            <Maximize2 size={13} />
            <span>فتح نافذة القسم بالتفصيل</span>
          </button>

          <button
            type="button"
            onClick={handleQuickDirective}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-mono font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all active:scale-95 border border-amber-400/40"
          >
            <Zap size={13} className="fill-white" />
            <span>تنفيذ التوجيه الفوري لهذا القطاع</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Expanded Full-Screen Deep Inspection Modal                                */}
      {/* ========================================================================= */}
      {inspectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-cyan-500/50 bg-[#020b18] shadow-[0_0_60px_rgba(0,229,255,0.35)] flex flex-col p-6 lg:p-8 text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/30">
              <button
                type="button"
                onClick={() => setInspectModalOpen(false)}
                className="p-2 rounded-xl border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-white hover:bg-rose-500/20 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-lg font-black text-white">{activeCard.titleAr}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      [SECTOR 0{activeCardIndex + 1}]
                    </span>
                  </div>
                  <span className="text-xs font-mono text-amber-400 mt-0.5">{activeCard.titleEn}</span>
                </div>
                <div
                  className="p-3 rounded-2xl"
                  style={{ backgroundColor: `${activeCard.color}25`, border: `1px solid ${activeCard.color}` }}
                >
                  <activeCard.icon size={28} style={{ color: activeCard.color }} />
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="mt-4 text-sm text-slate-300 leading-relaxed p-4 rounded-2xl bg-[#031124] border border-cyan-500/20">
              {activeCard.description}
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-[#03142e] border border-cyan-500/30 flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-sans">{activeCard.metricLabel1}</span>
                <span className="text-2xl font-black font-mono text-cyan-400">{activeCard.metricValue1}</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1">✔ تم التحقق والمطابقة اللحظية مع المحرك</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#03142e] border border-amber-500/30 flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-sans">{activeCard.metricLabel2}</span>
                <span className="text-2xl font-black font-mono text-amber-400">{activeCard.metricValue2}</span>
                <span className="text-[10px] text-amber-300 font-mono mt-1">⚡ نشاط مستمر عبر محركات السرب</span>
              </div>
            </div>

            {/* Key Features List */}
            <div className="mt-6 flex flex-col gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400">[قدرات وإعدادات القسم الحقيقية]:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeCard.features.map((feat, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-3 rounded-xl bg-[#030d1d] border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-200">{feat}</span>
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-4 border-t border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setInspectModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-mono text-slate-300 hover:text-white"
              >
                إغلاق النافذة
              </button>

              <div className="flex items-center gap-2">
                {onSelectSector && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSector(activeCard.stationId);
                      setInspectModalOpen(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold"
                  >
                    فتح لوحة إعدادات القسم الكاملة
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleQuickDirective();
                    setInspectModalOpen(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-mono font-bold shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-amber-400/50"
                >
                  تشغيل التوجيه الفوري
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
