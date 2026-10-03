"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { getStudioSessionId } from "@/lib/studio/capabilities/client";
import { CyberFloatingPanel } from "@/components/admin/automation/hud/studio/shell/CyberFloatingPanel";
import { LoopsPanelTray } from "./LoopsPanelTray";
import {
  EnterpriseNodeLibraryDrawer,
  EnterpriseNodeDef,
  ENTERPRISE_NODE_CATALOG,
} from "./EnterpriseNodeLibraryDrawer";
import { STUDIO_Z } from "@/lib/studio/tokens";
import * as THREE from "three";
import {
  Play,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  Plane,
  Building2,
  Car,
  CreditCard,
  RefreshCw,
  Zap,
  ShieldCheck,
  Terminal,
  Activity,
  AlertCircle,
  FileCode,
  Sliders,
  Share2,
  TrendingUp,
  Video,
  FileText,
  Package,
  Cpu,
  Database,
  Brain,
  SlidersHorizontal,
  Bot,
  ExternalLink,
  ChevronRight,
  Plus,
  Send,
  Eye,
  Trash2,
  Maximize2,
  RotateCcw,
  Move,
  ZoomIn,
  ZoomOut,
  X,
  Link as LinkIcon,
  Crosshair,
  KeyRound,
  Lock,
} from "lucide-react";

// =========================================================================
// HOLOGRAPHIC NEURAL BACKGROUND (Pillar 2 - Master Plan v7)
// =========================================================================
function NeuralCanvasBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010816, 0.0018);

    const camera = new THREE.PerspectiveCamera(60, w / h, 1, 4000);
    camera.position.set(0, 0, 450);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const particleCount = 120000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const radius = 1800;
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * radius * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * radius * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * radius * 2;

      // Cyan / Magenta / Deep Blue Cyber Matrix Palette
      const rand = Math.random();
      if (rand > 0.6) {
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 1.0;
      } else if (rand > 0.3) {
        colors[i * 3] = 0.5;
        colors[i * 3 + 1] = 0.1;
        colors[i * 3 + 2] = 0.9;
      } else {
        colors[i * 3] = 0.1;
        colors[i * 3 + 1] = 0.3;
        colors[i * 3 + 2] = 1.0;
      }

      sizes[i] = Math.random() * 1.8;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        uniform float uTime;
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec3 pos = position;
          // Neural slow pulse
          pos.y += sin(uTime * 0.4 + pos.x * 0.003) * 12.0;
          pos.x += cos(uTime * 0.2 + pos.y * 0.003) * 12.0;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (350.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = 1.0 - (dist * 2.0);
          gl_FragColor = vec4(vColor, alpha * 0.6);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let animationFrameId: number;
    let time = 0;

    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.01;
      material.uniforms.uTime.value = time;
      
      // Gentle parallax
      particles.rotation.y += (mouseX * 0.15 - particles.rotation.y) * 0.03;
      particles.rotation.x += (-mouseY * 0.15 - particles.rotation.x) * 0.03;
      
      // Slow constant drift
      particles.rotation.z += 0.0005;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container) container.innerHTML = "";
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-80" />;
}

export type LoopSector =
  | "all"
  | "ads"
  | "social"
  | "video"
  | "articles"
  | "tours"
  | "distribution";

export type NodeType =
  | "trigger"
  | "intelligence"
  | "model"
  | "skill"
  | "rule"
  | "action"
  | "review";

export interface BlueprintLoopNode {
  id: string;
  type: NodeType;
  title: string;
  subtitle: string;
  details: string;
  status: "idle" | "running" | "completed" | "error";
  model?: string;
  skills?: string[];
  rules?: string[];
  memoryContext?: string;
  parameters: Record<string, string | number | boolean>;
  position?: { x: number; y: number };
}

export interface NodeConnection {
  id: string;
  from: string;
  to: string;
}

export interface PlatformLoop {
  id: string;
  name: string;
  sector: "ads" | "social" | "video" | "articles" | "tours" | "distribution";
  icon: any;
  color: string;
  categoryLabel: string;
  description: string;
  schedule: string;
  nodes: BlueprintLoopNode[];
  connections: NodeConnection[];
}

// =========================================================================
// 1. Initial Standard Lonaliza Platform Loops (6 Core Operational Engines)
// =========================================================================
const INITIAL_PLATFORM_LOOPS: PlatformLoop[] = [
  // 1. AD CAMPAIGNS & MARKETING ENGINE
  {
    id: "loop-ads-meta-google-pmax",
    name: "توليد وإدارة حملات Meta Ads & Google PMax الذاتية وضبط ROAS",
    sector: "ads",
    categoryLabel: "الحملات والإعلانات الممولة",
    icon: TrendingUp,
    color: "#f59e0b",
    description: "رصد ترندات السفر، توليد كريتيف الإعلانات، ضبط الميزانيات لحظياً وإيقاف الحملات المنهكة تلقائياً",
    schedule: "نبض كل 30 دقيقة + إطلاق فوري عند رصد ترند",
    nodes: [
      {
        id: "ads-node-1",
        type: "trigger",
        title: "حساس الطلب وترندات السفر",
        subtitle: "Google Trends & Search Intent Stream",
        details: "رصد قفزات البحث عن رحلات إسطنبول وأنطاليا والشمال التركي من دول الخليج (السعودية، الكويت، الإمارات)",
        status: "completed",
        parameters: { targetGeos: "KSA, UAE, KWT, QAT", minSpikeRatio: "+38%", monitoredKeywords: 184 },
        position: { x: 50, y: 160 },
      },
      {
        id: "ads-node-2",
        type: "intelligence",
        title: "وكيل الذاكرة وسياق الجمهور",
        subtitle: "Mem0 Semantic Memory Cluster",
        details: "استرجاع أفضل الهوكات الإعلانية التي حققت ROAS > 4.2x في الربع السابق مع تحليل فئات المسافرين VIP",
        status: "completed",
        memoryContext: "Mem0 Vector Namespace: 'ads_historical_conversions_q3'",
        parameters: { topRoasThreshold: "3.8x", persona: "Gulf Families & Luxury Honeymooners", lookalikes: "Top 2%" },
        position: { x: 380, y: 110 },
      },
      {
        id: "ads-node-3",
        type: "model",
        title: "نموذج صياغة الإعلانات المقنعة",
        subtitle: "Claude 3.5 Sonnet / Gemini 2.0 Flash",
        details: "توليد 6 نسخ إعلانية باللهجة الخليجية البيضاء مع عناوين جذابة ومحفزات حجز ونسب خصم ديناميكية",
        status: "completed",
        model: "Claude 3.5 Sonnet (Direct High-Convert Mode)",
        parameters: { variationsCount: 6, dialect: "Saudi / Gulf Neutral", headlineLength: "45 chars max", temperature: 0.65 },
        position: { x: 710, y: 180 },
      },
      {
        id: "ads-node-4",
        type: "skill",
        title: "مهارة Meta Graph API & Google Ads",
        subtitle: "Executive Tools: meta_ads_launcher & pmax_builder",
        details: "هيكلة المجموعات الإعلانية وتوزيع الميزانية الذكي وربط بيكسل التحويل والمزامنة الفورية",
        status: "completed",
        skills: ["meta_ads_graph_api_v19", "google_ads_pmax_rest", "conversion_api_capi"],
        parameters: { adAccount: "act_lonaliza_official_gcc", bidStrategy: "Target ROAS 400%", budgetType: "CBO" },
        position: { x: 1040, y: 110 },
      },
      {
        id: "ads-node-5",
        type: "rule",
        title: "قواعد الحوكمة وسقف الميزانية",
        subtitle: "Policy: Sovereign Safeguards & Ad Spend Guard",
        details: "تطبيق حد الإنفاق اليومي الأقصى وإلزامية المراجعة البشرية للحملات التي تتجاوز $500",
        status: "completed",
        rules: ["MAX_DAILY_BUDGET: $350", "MIN_ROAS_TARGET: 3.5x", "AUTO_PAUSE_ON_FATIGUE: TRUE", "BRAND_SAFETY: STRICT"],
        parameters: { maxDailyBudget: "$350.00", autoPauseThreshold: "ROAS < 2.1x", requireApprovalOver: "$500.00" },
        position: { x: 1370, y: 190 },
      },
      {
        id: "ads-node-6",
        type: "action",
        title: "إطلاق الحملات وتحديث الجمهور الحي",
        subtitle: "/api/ads/launch & Live Pixel Sync",
        details: "نشر الإعلانات على منصات Meta (Instagram/Facebook) و Google PMax وتفعيل التتبع اللحظي",
        status: "completed",
        parameters: { campaignsLive: 4, adSetsLive: 12, targetLandingPage: "https://lonaliza.com/tours/turkey-vip" },
        position: { x: 1700, y: 120 },
      },
      {
        id: "ads-node-7",
        type: "review",
        title: "تليجرام وقناة إشعارات الإدارة",
        subtitle: "Telegram Command Center & ROAS Tracker",
        details: "إرسال ملخص فوري للإدارة بالأرقام والمبالغ مع أزرار تحكم مباشرة (إيقاف / تعزيز / تعديل الميزانية)",
        status: "completed",
        parameters: { notifyTelegram: true, adminChatId: "-10023849182", quickActions: "Pause / Boost / Inspect" },
        position: { x: 2030, y: 170 },
      },
    ],
    connections: [
      { id: "c-ads-1-2", from: "ads-node-1", to: "ads-node-2" },
      { id: "c-ads-2-3", from: "ads-node-2", to: "ads-node-3" },
      { id: "c-ads-3-4", from: "ads-node-3", to: "ads-node-4" },
      { id: "c-ads-4-5", from: "ads-node-4", to: "ads-node-5" },
      { id: "c-ads-5-6", from: "ads-node-5", to: "ads-node-6" },
      { id: "c-ads-6-7", from: "ads-node-6", to: "ads-node-7" },
    ],
  },

  // 2. SOCIAL MEDIA MULTI-CHANNEL OMNI PUBLISHER
  {
    id: "loop-social-omnichannel-publish",
    name: "جدولة ونشر محتوى السوشيال ميديا الموحد (Instagram, TikTok, X, FB, Telegram)",
    sector: "social",
    categoryLabel: "النشر وسوشيال ميديا",
    icon: Share2,
    color: "#8b5cf6",
    description: "توليد ونشر المنشورات والستوريز وتنسيق الصور ونشرها المتزامن عبر 5 قنوات في ساعات الذروة",
    schedule: "يومياً 4 فترات ذروة (10:00, 14:00, 18:00, 21:00)",
    nodes: [
      {
        id: "soc-node-1",
        type: "trigger",
        title: "ساعة الجدولة الذكية لقمم التفاعل",
        subtitle: "Gulf Peak Engagement Scheduler",
        details: "إطلاق أوتوماتيكي متوافق مع توقيت الرياض (GMT+3) لرصد أوقات فتح التطبيقات الأعلى للمسافرين",
        status: "completed",
        parameters: { timezone: "Asia/Riyadh (GMT+3)", slots: "10:00 AM, 02:00 PM, 06:30 PM, 09:15 PM" },
        position: { x: 50, y: 160 },
      },
      {
        id: "soc-node-2",
        type: "intelligence",
        title: "وكيل رادار الوجهات الساخنة",
        subtitle: "Hot Destinations & Seasonal Weather Signal",
        details: "تحديد الوجهة الأكثر جذباً لليوم بناء على طقس الشمال التركي، شلالات أوزنجول، وعروض الفنادق الفاخرة",
        status: "completed",
        memoryContext: "Trending Catalog DB: 'Trabzon, Uzungol, Cappadocia & Bodrum'",
        parameters: { selectedDestination: "Trabzon & Uzungol Heights", weatherHighlight: "19°C Spring Breeze", dealRef: "HOTEL-TRB-09" },
        position: { x: 380, y: 110 },
      },
      {
        id: "soc-node-3",
        type: "model",
        title: "صياغة المحتوى المتعدد لكل منصة",
        subtitle: "DeepSeek-V3 / Gemini 2.0 Flash",
        details: "تكييف النص: كبشن ملهم وهاشتاجات لإنستغرام، ثريد تثقيفي لتويتر/X، نص تشويقي لتيك توك، ومنشور لقناة تليجرام",
        status: "completed",
        model: "DeepSeek-V3 Language Engine",
        parameters: { platformsTargeted: 5, tone: "Inspirational Luxury Travel", includeEmpathyHook: true },
        position: { x: 710, y: 180 },
      },
      {
        id: "soc-node-4",
        type: "skill",
        title: "مهارة معالجة وتجهيز الوسائط",
        subtitle: "Cloud Media Resizer & Sharpness Enhancer",
        details: "توليد وقص الصور بنسب 1:1 لإنستغرام، 16:9 لتويتر، 9:16 للستوري والتيك توك مع شعار لوناليزا الشفاف",
        status: "completed",
        skills: ["media_aspect_adapter", "watermark_embedder", "sharpness_filter_v2"],
        parameters: { watermarkOpacity: "18%", dimensions: "1080x1080 / 1080x1920", format: "WEBP / High Quality JPEG" },
        position: { x: 1040, y: 110 },
      },
      {
        id: "soc-node-5",
        type: "action",
        title: "البث المتزامن لشبكات التواصل",
        subtitle: "/api/social/publish & OAuth Multi-Gateways",
        details: "نشر متزامن رسمي عبر الـ API لـ: Instagram, TikTok, Twitter/X, Facebook Pages, Telegram Channel",
        status: "completed",
        parameters: { instagramStatus: "200 OK", xStatus: "200 OK", telegramStatus: "200 OK", tikTokStatus: "200 OK" },
        position: { x: 1370, y: 190 },
      },
      {
        id: "soc-node-6",
        type: "review",
        title: "متابعة التفاعل والرد الآلي",
        subtitle: "Omni Social CRM & Lead Bot",
        details: "تحويل استفسارات التعليقات والرسائل الخاصة (DM) عن الأسعار إلى وكيل المبيعات الآلي فوراً",
        status: "completed",
        parameters: { autoReplyDMs: true, routeToSalesAgent: true, detectedInquiries: 28 },
        position: { x: 1700, y: 130 },
      },
    ],
    connections: [
      { id: "c-soc-1-2", from: "soc-node-1", to: "soc-node-2" },
      { id: "c-soc-2-3", from: "soc-node-2", to: "soc-node-3" },
      { id: "c-soc-3-4", from: "soc-node-3", to: "soc-node-4" },
      { id: "c-soc-4-5", from: "soc-node-4", to: "soc-node-5" },
      { id: "c-soc-5-6", from: "soc-node-5", to: "soc-node-6" },
    ],
  },

  // 3. AI VIDEO & REELS CREATIVE STUDIO
  {
    id: "loop-creative-video-reels",
    name: "استوديو توليد وتوليف ريلز السفر وتيك توك الذاتي (AI Video & Storyboards)",
    sector: "video",
    categoryLabel: "الفيديو والريلز الإبداعي",
    icon: Video,
    color: "#ec4899",
    description: "بناء ستوري بورد سينمائي، دمج مقاطع 4K، توليد التعليق الصوتي باللهجة السعودية ودمج الترجمة المتحركة",
    schedule: "إنتاج 3 ريلز يومياً بجودة 1080x1920 (9:16)",
    nodes: [
      {
        id: "vid-node-1",
        type: "trigger",
        title: "موجز الإنتاج الإبداعي (Creative Brief)",
        subtitle: "Automated Campaign Creative Request",
        details: "طلب ريلز جديد: 'أفضل 5 فنادق مطلة على البسفور مع جاكوزي خاص وخدمة فيتو VIP'",
        status: "completed",
        parameters: { videoTheme: "Luxury Bosphorus Jacuzzi Suites", durationTarget: "28 seconds", format: "9:16 Vertical" },
        position: { x: 50, y: 160 },
      },
      {
        id: "vid-node-2",
        type: "intelligence",
        title: "بنك الأصول السينمائية (B-Roll Vault)",
        subtitle: "Lonaliza 4K Ultra-HD Media Library",
        details: "استرجاع 6 لقطات حصرية عالية الدقة لفنادق فور سيزونز، سويسوتيل، ولقطة درون لغروب البسفور مع مرسيدس فيتو",
        status: "completed",
        memoryContext: "Asset Vault: 'bosphorus_luxury_drone_4k_pack'",
        parameters: { clipsRetrieved: 6, maxBitrate: "45 Mbps", licensedOnly: true },
        position: { x: 380, y: 110 },
      },
      {
        id: "vid-node-3",
        type: "model",
        title: "محرك السيناريو والتعليق الصوتي",
        subtitle: "Claude 3.5 Sonnet + ElevenLabs Turbo v2",
        details: "كتابة سكريبت سينمائي مشوق وتوليد فويس أوفر نقي باللهجة السعودية الفخمة بمزامنة دقيقة مع نبض الموسيقى",
        status: "completed",
        model: "ElevenLabs Model: 'Saudi Male Executive - Luxury Travel'",
        parameters: { voiceModel: "eleven_multilingual_v2", speechPace: "1.05x", emotion: "Warm / Enthusiastic" },
        position: { x: 710, y: 180 },
      },
      {
        id: "vid-node-4",
        type: "skill",
        title: "محرك المونتاج السحابي (FFmpeg Engine)",
        subtitle: "src/lib/studio/video/ffmpeg.ts",
        details: "قص اللقطات على دقات الموسيقى، تطبيق انتقالات سينمائية ناعمة، حرق الترجمة العربية المتحركة (Dynamic Subtitles)",
        status: "completed",
        skills: ["ffmpeg_wasm_cloud_renderer", "ass_subtitle_burner", "audio_ducking_processor"],
        parameters: { outputResolution: "1080x1920", frameRate: "60fps", exportCodec: "H.264 / AAC", renderedFile: "/media/reels/bosphorus-suites-vip.mp4" },
        position: { x: 1040, y: 110 },
      },
      {
        id: "vid-node-5",
        type: "action",
        title: "تصدير الفيديو إلى Instagram Reels & TikTok",
        subtitle: "/api/studio/video/generate & Direct Upload",
        details: "رفع الفيديو الجاهز تلقائياً مع غلاف مخصص ووسوم التفاعل العالية وإرفاق رابط الحجز المباشر",
        status: "completed",
        parameters: { fileSizeMB: "18.4 MB", uploadStatus: "SUCCESS", liveUrl: "https://instagram.com/reel/C89x12" },
        position: { x: 1370, y: 190 },
      },
      {
        id: "vid-node-6",
        type: "review",
        title: "معاينة الفيديو وتحليلات المشاهدة",
        subtitle: "In-Studio Media Player & Completion Rate",
        details: "إمكانية تشغيل الفيديو مباشرة داخل الاستوديو وتتبع معدل إكمال المشاهدة (Watch Time Retention)",
        status: "completed",
        parameters: { retentionGoal: "> 70%", viralAlertThreshold: "10k views in 2h" },
        position: { x: 1700, y: 130 },
      },
    ],
    connections: [
      { id: "c-vid-1-2", from: "vid-node-1", to: "vid-node-2" },
      { id: "c-vid-2-3", from: "vid-node-2", to: "vid-node-3" },
      { id: "c-vid-3-4", from: "vid-node-3", to: "vid-node-4" },
      { id: "c-vid-4-5", from: "vid-node-4", to: "vid-node-5" },
      { id: "c-vid-5-6", from: "vid-node-5", to: "vid-node-6" },
    ],
  },

  // 4. AUTONOMOUS TRAVEL ARTICLES & SEO ENGINE
  {
    id: "loop-content-seo-articles",
    name: "مصنع المقالات السياحية العميقة المتوافقة 100% مع معايير Google SEO E-E-A-T",
    sector: "articles",
    categoryLabel: "المقالات ومحركات البحث SEO",
    icon: FileText,
    color: "#06b6d4",
    description: "كتابة أدلة سياحية كاملة (2500+ كلمة) مع أسئلة شائعة، جداول أسعار حقيقية، ونشر تلقائي للمدونة مع الفهرسة الفورية",
    schedule: "مقالان أسبوعياً + تحديث الكيوردز تلقائياً",
    nodes: [
      {
        id: "art-node-1",
        type: "trigger",
        title: "حساس نوايا البحث السياحي (SERP Intent)",
        subtitle: "Google Search Console & Semrush Stream",
        details: "رصد كلمة بحثية ذات نمو عالي: 'دليل تكلفة السياحة في إسطنبول وطرابزون 2026 بالتفصيل للعوائل'",
        status: "completed",
        parameters: { targetQuery: "تكلفة السياحة في تركيا 2026 للعوائل", monthlyVolume: "48,500 searches", searchIntent: "Commercial / Informational" },
        position: { x: 50, y: 160 },
      },
      {
        id: "art-node-2",
        type: "intelligence",
        title: "استعلام الأسعار وبيانات الفنادق الفعلية",
        subtitle: "Grounded Platform Database Query",
        details: "سحب أسعار فنادق 4 و 5 نجوم الحقيقية وتكلفة استئجار سيارة مرسيدس مع سائق من كاش المنصة لتضمين أرقام دقيقة 100%",
        status: "completed",
        memoryContext: "Live Platform Rates: '.data/hotels-runtime.json' & '.data/transfers.ts'",
        parameters: { hotelSampleAvg: "$145/night", vitoDailyAvg: "$130/day", liveCurrency: "USD & SAR" },
        position: { x: 380, y: 110 },
      },
      {
        id: "art-node-3",
        type: "model",
        title: "الكاتب التحريري الخبير (Long-Form Author)",
        subtitle: "Claude 3.5 Sonnet (2,800 Words Deep Guide)",
        details: "كتابة دليل سياحي شامل يتضمن: هيكل H1-H4، نصائح عملية، جدول ميزانية يومي، اقتراحات مطاعم، روابط داخلية لخدمات لوناليزا",
        status: "completed",
        model: "Claude 3.5 Sonnet (Deep E-E-A-T Specialized)",
        parameters: { wordCount: 2850, readabilityScore: "94/100", tone: "Authoritative & Helpful Local Expert" },
        position: { x: 710, y: 180 },
      },
      {
        id: "art-node-4",
        type: "skill",
        title: "مهندس السيو ومخطط الأسئلة الشائعة",
        subtitle: "SEO Schema Generator & Meta Architect",
        details: "بناء ترميز JSON-LD FAQPage Schema، OpenGraph tags، توليد Slug سيو نظيف، وضغط وتسمية الصور وفق الـ Alt Tags",
        status: "completed",
        skills: ["json_ld_schema_builder", "slug_generator_ar", "internal_link_injector"],
        parameters: { faqCount: 6, schemaType: "TouristDestination + FAQPage", canonicalUrl: "https://lonaliza.com/blog/turkey-family-travel-cost-guide" },
        position: { x: 1040, y: 110 },
      },
      {
        id: "art-node-5",
        type: "action",
        title: "النشر المباشر في مدونة لوناليزا",
        subtitle: "/admin/blog & PocketBase Direct Commit",
        details: "إدراج المقال فوراً في قاعدة بيانات المدونة وحفظه في حالة منشور [PUBLISHED] مع الصورة البارزة",
        status: "completed",
        parameters: { publishedId: "post_guide_turkey_2026_vip", category: "أدلة السفر الشاملة", publishedLive: true },
        position: { x: 1370, y: 190 },
      },
      {
        id: "art-node-6",
        type: "review",
        title: "إشعار الفهرسة اللحظية (Instant Indexing)",
        subtitle: "Google Indexing API & IndexNow Protocol",
        details: "إرسال رابط المقال فوراً إلى محركات بحث Google و Bing لطلب الزحف الفوري والأرشفة خلال دقائق",
        status: "completed",
        parameters: { googlePing: "200 SUCCESS", bingIndexNow: "200 SUCCESS", notifyEditor: true },
        position: { x: 1700, y: 130 },
      },
    ],
    connections: [
      { id: "c-art-1-2", from: "art-node-1", to: "art-node-2" },
      { id: "c-art-2-3", from: "art-node-2", to: "art-node-3" },
      { id: "c-art-3-4", from: "art-node-3", to: "art-node-4" },
      { id: "c-art-4-5", from: "art-node-4", to: "art-node-5" },
      { id: "c-art-5-6", from: "art-node-5", to: "art-node-6" },
    ],
  },

  // 5. AUTONOMOUS TOUR PACKAGES & SERVICES BUILDER
  {
    id: "loop-tours-packages-builder",
    name: "تجميع وتسعير برامج الرحلات السياحية الشاملة (فنادق + طيران + جولات VIP)",
    sector: "tours",
    categoryLabel: "البرامج والرحلات السياحية",
    icon: Package,
    color: "#10b981",
    description: "بناء بكجات سياحية متكاملة (برنامج 7 أو 10 أيام)، احتساب التكاليف وهوامش الأرباح ونشرها بالمتجر مع الحجز الفوري",
    schedule: "أسبوعي + عند توفر عروض طيران وفنادق خاصة",
    nodes: [
      {
        id: "tour-node-1",
        type: "trigger",
        title: "محلل مواسم السفر والعطلات الرسمية",
        subtitle: "Seasonal Calendar & Holiday Surge Predictor",
        details: "رصد اقتراب عطلة عيد الأضحى وإجازات المدارس في السعودية والخليج لتصميم برنامج سياحي عائلي منافس",
        status: "completed",
        parameters: { targetHoliday: "Saudi National Holidays", familySize: "4 to 6 Persons", targetSeason: "Summer Peaks" },
        position: { x: 50, y: 160 },
      },
      {
        id: "tour-node-2",
        type: "intelligence",
        title: "خوارزمية تجميع الموردين الشاملة",
        subtitle: "GDS Flight + BedBanks Hotel + VIP Vito Fleet",
        details: "تجميع المكونات: طيران الخطوط التركية + 4 ليالي فندق 5 نجوم بإسطنبول + 3 ليالي طرابزون + سيارة فيتو وسائق خاص يومياً",
        status: "completed",
        memoryContext: "Supplier Rates: 'Travelport + Hotelbeds + Lonaliza Vito Fleet'",
        parameters: { totalDays: 8, totalNights: 7, accommodationTier: "5-Star Bosphorus & Lake View" },
        position: { x: 380, y: 110 },
      },
      {
        id: "tour-node-3",
        type: "model",
        title: "مهندس خطة المسار والأنشطة اليومية",
        subtitle: "Gemini 2.0 Flash Enterprise",
        details: "صياغة خط سير يومي دقيق: اليوم 1 الاستقبال، اليوم 2 جولة سبانجا والمعشوقية، اليوم 3 البسفور، اليوم 4 التوجه لطرابزون وأوزنجول...",
        status: "completed",
        model: "Gemini 2.0 Flash Enterprise Planner",
        parameters: { itineraryDepth: "Hour-by-hour", highlightsCount: 16, includedServices: "Private Car, Fuel, Driver, VIP Lounge" },
        position: { x: 710, y: 180 },
      },
      {
        id: "tour-node-4",
        type: "skill",
        title: "حاسبة التكلفة الديناميكية وقفل الأرباح",
        subtitle: "Package Yield & Margin Lock Engine (+22%)",
        details: "جمع التكلفة الخام ($2,450) وتطبيق هامش الربح الإجباري (+22%) وتحديد السعر النهائي للعائلة ($2,989)",
        status: "completed",
        skills: ["package_pricing_calculator", "fx_rate_pegging", "tax_vat_buffer"],
        parameters: { rawCostUsd: "$2,450.00", markupPercent: "+22%", packageFinalPriceUsd: "$2,989.00", pricePerPersonSar: "2,800 SAR" },
        position: { x: 1040, y: 110 },
      },
      {
        id: "tour-node-5",
        type: "action",
        title: "نشر البكج في كتالوج المتجر وصفحة الهبوط",
        subtitle: "/admin/packages & Storefront Live Sync",
        details: "تفعيل صفحة البرنامج السياحي مع معرض الصور، جدول الرحلة، وبوابة دفع إيزيكو بالأقساط 3DS",
        status: "completed",
        parameters: { packageSlug: "istanbul-trabzon-8days-vip-family", storefrontActive: true, bookingEnabled: true },
        position: { x: 1370, y: 190 },
      },
      {
        id: "tour-node-6",
        type: "review",
        title: "حملة إشعار واتساب وتليجرام للعملاء VIP",
        subtitle: "Baileys WhatsApp Broadcast Engine",
        details: "إرسال كتالوج البرنامج الجديد تلقائياً للعملاء المهتمين بالسفر العائلي في الرياض وجدة مع إمكانية التخصيص",
        status: "completed",
        parameters: { targetedVipClients: 320, broadcastTemplate: "vip_package_summer_earlybird", conversionTracked: true },
        position: { x: 1700, y: 130 },
      },
    ],
    connections: [
      { id: "c-tour-1-2", from: "tour-node-1", to: "tour-node-2" },
      { id: "c-tour-2-3", from: "tour-node-2", to: "tour-node-3" },
      { id: "c-tour-3-4", from: "tour-node-3", to: "tour-node-4" },
      { id: "c-tour-4-5", from: "tour-node-4", to: "tour-node-5" },
      { id: "c-tour-5-6", from: "tour-node-5", to: "tour-node-6" },
    ],
  },

  // 6. GDS & BEDBANKS DISTRIBUTION & TREASURY
  {
    id: "loop-distribution-gds-repricing",
    name: "مزامنة شواغر ترافلبورت & هوتل بيدس وقفل هامش +15% وتأمين الصرف",
    sector: "distribution",
    categoryLabel: "الموزعين والخزينة GDS",
    icon: Building2,
    color: "#00e5ff",
    description: "استعلام شواغر 140 فندقاً حياً، مطابقة أسعار BedBanks، قفل هامش الربح المركزي، وتثبيت كاش الصرف ضد تقلبات الليرة",
    schedule: "دوري كل 4 ساعات عبر BullMQ Workers",
    nodes: [
      {
        id: "dist-node-1",
        type: "trigger",
        title: "جدول المزامنة الدوري للموزعين",
        subtitle: "Cron: 0 */4 * * * via BullMQ",
        details: "إطلاق فحص الأسعار والشواغر المباشرة لـ 140 فندقاً استراتيجياً في إسطنبول وبورصة وطرابزون وأنطاليا",
        status: "completed",
        parameters: { interval: "4h", source: "BullMQ Cron Worker", trackedProperties: 140 },
        position: { x: 50, y: 160 },
      },
      {
        id: "dist-node-2",
        type: "intelligence",
        title: "وكيل استكشاف BedBanks المتعدد",
        subtitle: "Travelport 7K7L & Hotelbeds HMAC SHA-256",
        details: "استعلام متزامن بين محركات ترافلبورت، هوتل بيدس، وتوريزما مع فحص سياسات الإلغاء والوجبات",
        status: "completed",
        memoryContext: "GDS Live Connections: Travelport PCC 7K7L + Hotelbeds Live API",
        parameters: { provider1: "Travelport GDS", provider2: "Hotelbeds BedsOnline", provider3: "BiletBank XML" },
        position: { x: 380, y: 110 },
      },
      {
        id: "dist-node-3",
        type: "skill",
        title: "محرك المارك أب الإجباري (+15%)",
        subtitle: "Rule: hmk_default_all_15",
        details: "تطبيق قاعدة هامش الربح السيادية الإلزامية ومنع عرض أي سعر خام للمستخدمين نهائياً",
        status: "completed",
        skills: ["enforce_central_markup_rule", "vat_calculator_turkey"],
        parameters: { markupRule: "hmk_default_all_15", percentage: "+15%", targetFile: ".data/hotels-runtime.json" },
        position: { x: 710, y: 180 },
      },
      {
        id: "dist-node-4",
        type: "rule",
        title: "التحوط المالي وتأمين الصرف (Zero FX Slippage)",
        subtitle: "Iyzico & Central Bank Live Pegging",
        details: "إضافة هامش أمان بنكي بنسبة +1.2% على أسعار صرف TRY و SAR لمنع أي خسائر ناتجة عن تذبذب العملة",
        status: "completed",
        rules: ["FX_BUFFER_MARGIN: +1.2%", "TRY_USD_PEG_CHECK: ACTIVE", "AUTO_UPDATE_CACHE: TRUE"],
        parameters: { fxBuffer: "+1.2%", cacheFile: ".data/iyzico-fx-cache.json", ttlSeconds: 900 },
        position: { x: 1040, y: 110 },
      },
      {
        id: "dist-node-5",
        type: "action",
        title: "تحديث قاعدة الأسعار الحية للمتجر و B2B",
        subtitle: "/api/admin/hotels-settings & Cache Invalidation",
        details: "كتابة الأسعار النهائية الجديدة في كاش التوزيع اللحظي وإتاحتها فوراً لمحرك البحث وحجوزات B2B",
        status: "completed",
        parameters: { updatedHotels: 140, cacheInvalidated: true, timeToLive: "4 hours" },
        position: { x: 1370, y: 190 },
      },
      {
        id: "dist-node-6",
        type: "review",
        title: "تدقيق هوامش الربح وتقرير الخزينة",
        subtitle: "Treasury Reconciliation & Auto Audit",
        details: "مطابقة فواتير الموزعين المتوقعة مع المبالغ المحصلة عبر إيزيكو وإصدار تنبيه إذا هبط الهامش عن 12%",
        status: "completed",
        parameters: { auditStatus: "PASSED", averageMargin: "16.8%", zeroLossGuaranteed: true },
        position: { x: 1700, y: 130 },
      },
    ],
    connections: [
      { id: "c-dist-1-2", from: "dist-node-1", to: "dist-node-2" },
      { id: "c-dist-2-3", from: "dist-node-2", to: "dist-node-3" },
      { id: "c-dist-3-4", from: "dist-node-3", to: "dist-node-4" },
      { id: "c-dist-4-5", from: "dist-node-4", to: "dist-node-5" },
      { id: "c-dist-5-6", from: "dist-node-5", to: "dist-node-6" },
    ],
  },
];

// Node Template Definitions for Adding New Nodes
const NODE_TEMPLATES: Array<{
  type: NodeType;
  label: string;
  badge: string;
  badgeColor: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultDetails: string;
  defaultParams: Record<string, string | number | boolean>;
}> = [
  {
    type: "trigger",
    label: "مشغل (Trigger)",
    badge: "[المشغل · TRIGGER]",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    defaultTitle: "مشغل حدث ذكي",
    defaultSubtitle: "Custom Event Trigger / Webhook",
    defaultDetails: "رصد إشارة خارجية أو توقيت زمني لتشغيل خط الأتمتة تلقائياً",
    defaultParams: { interval: "15m", sensitivity: "High", retryCount: 3 },
  },
  {
    type: "intelligence",
    label: "ذاكرة (RAG)",
    badge: "[الذاكرة · RAG]",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    defaultTitle: "استرجاع ذاكرة وسياق",
    defaultSubtitle: "Qdrant Vector Cluster / Mem0",
    defaultDetails: "استرجاع السياق التاريخي وقاعدة المعرفة والعملاء المميزين",
    defaultParams: { topK: 5, similarityThreshold: "0.85", namespace: "travel_kb" },
  },
  {
    type: "model",
    label: "نموذج (Model)",
    badge: "[النموذج · MODEL]",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    defaultTitle: "نموذج تفكير وتوليد",
    defaultSubtitle: "Claude 3.5 Sonnet / Gemini 2.0 Flash",
    defaultDetails: "معالجة المدخلات وصياغة المخرجات بدقة لغوية واحترافية فائقة",
    defaultParams: { temperature: 0.7, maxTokens: 2048, topP: 0.95 },
  },
  {
    type: "skill",
    label: "مهارة (Skill)",
    badge: "[المهارة · SKILL]",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    defaultTitle: "مهارة برمجية تنفيذية",
    defaultSubtitle: "Executive API / Converter",
    defaultDetails: "تنفيذ عملية حسابية، تحويل وسائط، أو ربط مع واجهة خارجية",
    defaultParams: { timeoutMs: 5000, cacheResult: true, strictValidation: true },
  },
  {
    type: "rule",
    label: "حوكمة (Rule)",
    badge: "[الحوكمة · RULE]",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    defaultTitle: "قاعدة حوكمة وحماية",
    defaultSubtitle: "Policy Gate & Threshold Check",
    defaultDetails: "التأكد من التوافق المالي، حدود الميزانية، وسلامة العلامة التجارية",
    defaultParams: { budgetLimit: "$500", rejectOnFailure: true, notifyAdmin: true },
  },
  {
    type: "action",
    label: "تنفيذ (Action)",
    badge: "[التنفيذ · ACTION]",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    defaultTitle: "تنفيذ ونشر نهائي",
    defaultSubtitle: "Live DB Commit / API Dispatch",
    defaultDetails: "نشر التغييرات على المتجر أو حسابات التواصل أو شبكة الموزعين",
    defaultParams: { commitLive: true, rollbackOnError: true },
  },
  {
    type: "review",
    label: "مراجعة (Review)",
    badge: "[المراجعة · REVIEW]",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    defaultTitle: "قناة إشعار ومراجعة",
    defaultSubtitle: "Telegram Bot / Admin Dashboard Alert",
    defaultDetails: "إرسال ملخص بالعملية مع أزرار الاعتماد أو الرفض الفوري",
    defaultParams: { channel: "Telegram VIP", priority: "High" },
  },
];

export default function VisualLoopsEngine() {
  const [loops, setLoops] = useState<PlatformLoop[]>(INITIAL_PLATFORM_LOOPS);
  const [selectedSector, setSelectedSector] = useState<LoopSector>("all");
  const [selectedLoopId, setSelectedLoopId] = useState<string>("loop-ads-meta-google-pmax");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("ads-node-1");

  // Flow Execution Animation State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  // Infinite Canvas State: Pan & Zoom
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 40, y: 60 });
  const [zoomScale, setZoomScale] = useState<number>(0.95);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  const [showNavPanel, setShowNavPanel] = useState(true);
  const [showSetupPanel, setShowSetupPanel] = useState(true);
  const [showNodePalette, setShowNodePalette] = useState(false);
  const [isNodeLibraryOpen, setIsNodeLibraryOpen] = useState<boolean>(false);

  // Pre-flight & Credentials Chat Vault State
  const [isCredsVaultOpen, setIsCredsVaultOpen] = useState<boolean>(false);
  const [credsVaultMetaToken, setCredsVaultMetaToken] = useState<string>("");
  const [credsVaultMetaAccountId, setCredsVaultMetaAccountId] = useState<string>("act_lonaliza_official_gcc");
  const [credsVaultPixelId, setCredsVaultPixelId] = useState<string>("");
  const [credsVaultGoogleToken, setCredsVaultGoogleToken] = useState<string>("");
  const [credsTestStatus, setCredsTestStatus] = useState<string | null>(null);
  const [credsSaving, setCredsSaving] = useState<boolean>(false);
  const panStartRef = useRef<{ mouseX: number; mouseY: number; startPanX: number; startPanY: number }>({
    mouseX: 0,
    mouseY: 0,
    startPanX: 40,
    startPanY: 60,
  });

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; nodeStartX: number; nodeStartY: number }>({
    mouseX: 0,
    mouseY: 0,
    nodeStartX: 0,
    nodeStartY: 0,
  });

  // Interactive Connection Wire Drafting
  const [wiringDraft, setWiringDraft] = useState<{
    fromNodeId: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } | null>(null);
  const [hoveredPortNodeId, setHoveredPortNodeId] = useState<string | null>(null);

  // Canvas Viewport Ref
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Current Active Loop
  const activeLoop = useMemo(() => {
    return loops.find((l) => l.id === selectedLoopId) || loops[0];
  }, [loops, selectedLoopId]);

  // Filtered Loops by Sector
  const filteredLoops = useMemo(() => {
    if (selectedSector === "all") return loops;
    return loops.filter((l) => l.sector === selectedSector);
  }, [loops, selectedSector]);

  // Selected Node in Active Loop
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return activeLoop.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [activeLoop, selectedNodeId]);

  // Helper: Get node position with fallback calculation
  const getNodePos = useCallback(
    (node: BlueprintLoopNode, index: number): { x: number; y: number } => {
      if (node.position) return node.position;
      return { x: 50 + index * 330, y: index % 2 === 0 ? 150 : 100 };
    },
    []
  );

  // Automatically center the nodes inside the visible canvas viewport
  const centerFlowInView = useCallback(() => {
    if (!canvasRef.current || !activeLoop || activeLoop.nodes.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const viewportW = rect.width || 800;
    const viewportH = rect.height || 600;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    activeLoop.nodes.forEach((n, idx) => {
      const pos = getNodePos(n, idx);
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x + 250);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y + 170);
    });

    const flowW = maxX - minX;
    const flowH = maxY - minY;

    // Optimal zoom
    const optimalZoom = Math.min(1.0, Math.max(0.6, (viewportW - 120) / Math.max(flowW, 1)));
    setZoomScale(Number(optimalZoom.toFixed(2)));

    // Center coordinates
    const targetPanX = (viewportW - flowW * optimalZoom) / 2 - minX * optimalZoom;
    const targetPanY = Math.max(30, (viewportH - flowH * optimalZoom) / 2 - minY * optimalZoom - 20);

    setPanOffset({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
  }, [activeLoop, getNodePos]);

  useEffect(() => {
    const timer = setTimeout(() => {
      centerFlowInView();
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedLoopId, centerFlowInView]);

  // =========================================================================
  // Canvas Mouse Interaction Handlers (Pan, Drag Nodes, Draw Wire)
  // =========================================================================
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only pan if clicking on canvas backdrop (not a node, port, or button)
    const target = e.target as HTMLElement;
    if (target.closest(".node-card, button, input, textarea, a, .port-handle")) {
      return;
    }
    setIsPanning(true);
    panStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startPanX: panOffset.x,
      startPanY: panOffset.y,
    };
  };

  // Robust window-level listeners for drag, pan, and wire routing (prevents freezing on fast mouse moves)
  useEffect(() => {
    if (!isPanning && !draggingNodeId && !wiringDraft) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      // 1. Handle Canvas Panning
      if (isPanning) {
        const dx = e.clientX - panStartRef.current.mouseX;
        const dy = e.clientY - panStartRef.current.mouseY;
        setPanOffset({
          x: panStartRef.current.startPanX + dx,
          y: panStartRef.current.startPanY + dy,
        });
        return;
      }

      // 2. Handle Node Dragging
      if (draggingNodeId) {
        const dx = (e.clientX - dragStartRef.current.mouseX) / zoomScale;
        const dy = (e.clientY - dragStartRef.current.mouseY) / zoomScale;
        const newX = Math.round(dragStartRef.current.nodeStartX + dx);
        const newY = Math.round(dragStartRef.current.nodeStartY + dy);

        setLoops((prevLoops) =>
          prevLoops.map((loop) => {
            if (loop.id !== activeLoop.id) return loop;
            return {
              ...loop,
              nodes: loop.nodes.map((node) => {
                if (node.id !== draggingNodeId) return node;
                return { ...node, position: { x: newX, y: newY } };
              }),
            };
          })
        );
        return;
      }

      // 3. Handle Wiring Draft
      if (wiringDraft && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const currentCanvasX = (e.clientX - rect.left - panOffset.x) / zoomScale;
        const currentCanvasY = (e.clientY - rect.top - panOffset.y) / zoomScale;
        setWiringDraft((prev) => (prev ? { ...prev, toX: currentCanvasX, toY: currentCanvasY } : null));
      }
    };

    const handleWindowMouseUp = () => {
      setIsPanning(false);
      setDraggingNodeId(null);

      if (wiringDraft && hoveredPortNodeId && hoveredPortNodeId !== wiringDraft.fromNodeId) {
        const connectionId = `conn-${Date.now()}`;
        setLoops((prevLoops) =>
          prevLoops.map((loop) => {
            if (loop.id !== activeLoop.id) return loop;
            const exists = loop.connections.some(
              (c) => c.from === wiringDraft.fromNodeId && c.to === hoveredPortNodeId
            );
            if (exists) return loop;
            return {
              ...loop,
              connections: [
                ...loop.connections,
                { id: connectionId, from: wiringDraft.fromNodeId, to: hoveredPortNodeId },
              ],
            };
          })
        );
      }
      setWiringDraft(null);
      setHoveredPortNodeId(null);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [isPanning, draggingNodeId, wiringDraft, zoomScale, panOffset, activeLoop.id, hoveredPortNodeId]);

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setWiringDraft(null);
  };

  // Canvas Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoomScale((prev) => Math.min(2.0, Math.max(0.4, Number((prev + zoomDelta).toFixed(2)))));
  };

  // Start dragging a node
  const handleNodeMouseDown = (e: React.MouseEvent, node: BlueprintLoopNode, index: number) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    const pos = getNodePos(node, index);
    setDraggingNodeId(node.id);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodeStartX: pos.x,
      nodeStartY: pos.y,
    };
  };

  // Start drawing a wire from output port
  const handlePortMouseDown = (e: React.MouseEvent, node: BlueprintLoopNode, index: number) => {
    e.stopPropagation();
    const pos = getNodePos(node, index);
    const portX = pos.x + 240;
    const portY = pos.y + 55;
    setWiringDraft({
      fromNodeId: node.id,
      fromX: portX,
      fromY: portY,
      toX: portX,
      toY: portY,
    });
  };

  // Delete a connection wire
  const handleDeleteConnection = (connId: string) => {
    setLoops((prevLoops) =>
      prevLoops.map((loop) => {
        if (loop.id !== activeLoop.id) return loop;
        return {
          ...loop,
          connections: loop.connections.filter((c) => c.id !== connId),
        };
      })
    );
  };

  // Add a new node from template
  const handleAddNodeFromTemplate = (tmpl: (typeof NODE_TEMPLATES)[0]) => {
    const newNodeId = `node-${tmpl.type}-${Date.now().toString().slice(-4)}`;
    // Place new node in the visible area near the rightmost node
    const rightmostX = activeLoop.nodes.reduce(
      (max, n, i) => Math.max(max, getNodePos(n, i).x),
      100
    );
    const newNode: BlueprintLoopNode = {
      id: newNodeId,
      type: tmpl.type,
      title: tmpl.defaultTitle,
      subtitle: tmpl.defaultSubtitle,
      details: tmpl.defaultDetails,
      status: "idle",
      parameters: { ...tmpl.defaultParams },
      position: { x: rightmostX + 320, y: 140 },
    };

    setLoops((prevLoops) =>
      prevLoops.map((loop) => {
        if (loop.id !== activeLoop.id) return loop;
        // Connect automatically to the last node
        const lastNode = loop.nodes[loop.nodes.length - 1];
        const newConns = [...loop.connections];
        if (lastNode) {
          newConns.push({
            id: `conn-auto-${Date.now()}`,
            from: lastNode.id,
            to: newNodeId,
          });
        }
        return {
          ...loop,
          nodes: [...loop.nodes, newNode],
          connections: newConns,
        };
      })
    );
    setSelectedNodeId(newNodeId);
  };

  // Add a new enterprise node from the Enterprise Node Catalog
  const handleAddEnterpriseNode = (nodeDef: EnterpriseNodeDef) => {
    const newNodeId = `node-${nodeDef.id}-${Date.now().toString().slice(-4)}`;
    const rightmostX = activeLoop.nodes.reduce(
      (max, n, i) => Math.max(max, getNodePos(n, i).x),
      100
    );
    const newNode: BlueprintLoopNode = {
      id: newNodeId,
      type: nodeDef.type,
      title: nodeDef.title,
      subtitle: nodeDef.subtitle,
      details: nodeDef.description,
      status: "idle",
      parameters: { ...nodeDef.defaultParams },
      position: { x: rightmostX + 320, y: 140 },
    };

    setLoops((prevLoops) =>
      prevLoops.map((loop) => {
        if (loop.id !== activeLoop.id) return loop;
        const lastNode = loop.nodes[loop.nodes.length - 1];
        const newConns = [...loop.connections];
        if (lastNode) {
          newConns.push({
            id: `conn-auto-${Date.now()}`,
            from: lastNode.id,
            to: newNodeId,
          });
        }
        return {
          ...loop,
          nodes: [...loop.nodes, newNode],
          connections: newConns,
        };
      })
    );
    setSelectedNodeId(newNodeId);
    setIsNodeLibraryOpen(false);
  };

  // Delete selected node
  const handleDeleteNode = (nodeId: string) => {
    setLoops((prevLoops) =>
      prevLoops.map((loop) => {
        if (loop.id !== activeLoop.id) return loop;
        return {
          ...loop,
          nodes: loop.nodes.filter((n) => n.id !== nodeId),
          connections: loop.connections.filter((c) => c.from !== nodeId && c.to !== nodeId),
        };
      })
    );
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(activeLoop.nodes.find((n) => n.id !== nodeId)?.id || null);
    }
  };

  const loopPayload = useCallback((loop: PlatformLoop) => {
    return {
      id: loop.id,
      name: loop.name,
      sector: loop.sector,
      description: loop.description,
      schedule: loop.schedule,
      nodes: loop.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        subtitle: n.subtitle,
        details: n.details,
        status: n.status,
        model: n.model,
        skills: n.skills,
        rules: n.rules,
        memoryContext: n.memoryContext,
        parameters: n.parameters,
        position: n.position,
      })),
      connections: loop.connections,
    };
  }, []);

  useEffect(() => {
    const loop = loopPayload(activeLoop);
    const sessionId = getStudioSessionId();
    void fetch("/api/admin/studio/loops/state", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, loop }),
    }).catch(() => undefined);
  }, [activeLoop, loopPayload]);

  type ExecuteApiBody = {
    ok: boolean;
    blockedCredentials?: boolean;
    credentialGaps?: Array<{ labelAr: string; settingsUrl?: string }>;
    graphErrors?: string[];
    message?: string;
    completedPct?: number;
    steps?: Array<{ nodeId: string; ok: boolean; message: string; durationMs: number }>;
    error?: string;
  };

  const applyStepStatuses = useCallback(
    (loopId: string, steps: NonNullable<ExecuteApiBody["steps"]>) => {
      const stepMap = new Map(steps.map((s) => [s.nodeId, s]));
      setLoops((prev) =>
        prev.map((l) => {
          if (l.id !== loopId) return l;
          return {
            ...l,
            nodes: l.nodes.map((n) => {
              const step = stepMap.get(n.id);
              if (!step) return n;
              return {
                ...n,
                status: step.ok ? ("completed" as const) : ("error" as const),
              };
            }),
          };
        })
      );
    },
    []
  );

  const runLoopOnServer = useCallback(
    async (opts: { nodeId?: string; dryRun: boolean; source?: "manual" | "voice" | "agent" }) => {
      const timestamp = new Date().toLocaleTimeString("ar-SA", { hour12: false });
      const loop = loopPayload(activeLoop);

      const preflightRes = await fetch("/api/admin/studio/loops/preflight", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ loop }),
      });
      const preflight = (await preflightRes.json()) as {
        ok?: boolean;
        status?: string;
        saySupervisorAr?: string;
        credentials?: { gaps?: Array<{ labelAr: string }> };
      };

      if (!preflightRes.ok || preflight.status === "blocked_credentials") {
        const msg =
          preflight.saySupervisorAr ||
          preflight.credentials?.gaps?.map((g) => g.labelAr).join(" · ") ||
          "فشل فحص الجاهزية — ينقص ربط API.";
        setExecutionLogs((prev) => [`[${timestamp}] ⚠️ ${msg}`, ...prev]);
        setIsCredsVaultOpen(true);
        window.dispatchEvent(
          new CustomEvent("studio:chat-line", { detail: { speaker: "الوكيل المشرف", text: msg } })
        );
        return null;
      }

      const execRes = await fetch("/api/admin/studio/loops/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          loop,
          dryRun: opts.dryRun,
          nodeId: opts.nodeId,
          source: opts.source ?? "manual",
        }),
      });
      const data = (await execRes.json()) as ExecuteApiBody;

      if (data.blockedCredentials) {
        setExecutionLogs((prev) => [
          `[${timestamp}] ⚠️ ${data.message || "blocked_credentials"}`,
          ...prev,
        ]);
        setIsCredsVaultOpen(true);
        return data;
      }

      if (data.steps?.length) {
        applyStepStatuses(activeLoop.id, data.steps);
      }

      const lines = (data.steps || []).map((step) => {
        const mark = step.ok ? "✔" : "✖";
        return `[${timestamp}] ${mark} ${step.message} (${step.durationMs}ms)`;
      });

      if (data.graphErrors?.length) {
        lines.unshift(`[${timestamp}] ✖ ${data.graphErrors.join(" · ")}`);
      }

      if (data.ok && (data.completedPct === 100 || data.steps?.every((s) => s.ok))) {
        lines.unshift(`[${timestamp}] ✔ ${data.message || "اكتمل التدflow."}`);
      } else if (!data.ok) {
        lines.unshift(`[${timestamp}] ✖ ${data.message || data.error || "توقف التدflow."}`);
      }

      setExecutionLogs((prev) => [...lines, ...prev]);
      return data;
    },
    [activeLoop, applyStepStatuses, loopPayload]
  );

  const handleTestSingleNode = async (node: BlueprintLoopNode) => {
    if (isRunning) return;
    setIsRunning(true);
    const timestamp = new Date().toLocaleTimeString("ar-SA", { hour12: false });
    setExecutionLogs((prev) => [
      `[${timestamp}] ⚡ اختبار عقدة: ${node.title} (dry-run)`,
      ...prev,
    ]);
    try {
      await runLoopOnServer({ nodeId: node.id, dryRun: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "execute_failed";
      setExecutionLogs((prev) => [`[${timestamp}] ✖ ${msg}`, ...prev]);
    } finally {
      setIsRunning(false);
      setActiveStepIndex(-1);
    }
  };

  const handleRunLoop = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveStepIndex(0);
    const timestamp = new Date().toLocaleTimeString("ar-SA", { hour12: false });
    setExecutionLogs([
      `[${timestamp}] ◈ إطلاق تدفق الأتمتة: ${activeLoop.name}`,
      `[${timestamp}] ◈ عدد العقد: ${activeLoop.nodes.length}`,
    ]);

    try {
      const data = await runLoopOnServer({ dryRun: false });
      if (data?.steps) {
        const failIdx = data.steps.findIndex((s) => !s.ok);
        setActiveStepIndex(failIdx >= 0 ? failIdx : data.steps.length - 1);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "execute_failed";
      setExecutionLogs((prev) => [`[${timestamp}] ✖ ${msg}`, ...prev]);
    } finally {
      setActiveStepIndex(-1);
      setIsRunning(false);
    }
  };

  const runLoopRef = useRef(handleRunLoop);
  const testNodeRef = useRef(handleTestSingleNode);
  const selectedNodeRef = useRef(selectedNode);
  runLoopRef.current = handleRunLoop;
  testNodeRef.current = handleTestSingleNode;
  selectedNodeRef.current = selectedNode;

  useEffect(() => {
    const mapVoiceSector = (raw: string): LoopSector | null => {
      const aliases: Record<string, LoopSector> = {
        meta: "ads",
        ads: "ads",
        flights: "tours",
        hotels: "distribution",
        transfers: "tours",
      };
      if (aliases[raw]) return aliases[raw];
      const allowed: LoopSector[] = ["all", "ads", "social", "video", "articles", "tours", "distribution"];
      return allowed.includes(raw as LoopSector) ? (raw as LoopSector) : null;
    };

    const onRun = () => {
      void runLoopRef.current();
    };
    const onRunNode = () => {
      const node = selectedNodeRef.current;
      if (node) void testNodeRef.current(node);
    };
    const onSector = (ev: Event) => {
      const sector = (ev as CustomEvent<{ sector?: string }>).detail?.sector;
      if (!sector) return;
      const mapped = mapVoiceSector(sector);
      if (mapped) setSelectedSector(mapped);
    };
    window.addEventListener("studio:loops-run", onRun);
    window.addEventListener("studio:loops-run-node", onRunNode);
    window.addEventListener("studio:loops-select-sector", onSector);
    return () => {
      window.removeEventListener("studio:loops-run", onRun);
      window.removeEventListener("studio:loops-run-node", onRunNode);
      window.removeEventListener("studio:loops-select-sector", onSector);
    };
  }, []);

  // Reset Canvas View
  const handleResetCanvas = () => {
    centerFlowInView();
  };

  const sectorNav = [
    { id: "all", label: "كافة القطاعات", icon: Layers },
    { id: "ads", label: "الحملات والإعلانات", icon: TrendingUp },
    { id: "social", label: "النشر وسوشيال", icon: Share2 },
    { id: "video", label: "الفيديو والريلز", icon: Video },
    { id: "articles", label: "المقالات وSEO", icon: FileText },
    { id: "tours", label: "البرامج والرحلات", icon: Package },
    { id: "distribution", label: "الموزعين والخزينة", icon: Building2 },
  ] as const;

  const navSidebarBody = (
    <div className="p-2 space-y-3 text-right flex-1 min-h-0 overflow-y-auto" dir="rtl">
      <div className="space-y-1">
        <div className="text-[10px] font-mono text-cyan-400 px-1">القطاع التشغيلي</div>
        {sectorNav.map((sec) => {
          const isAct = selectedSector === sec.id;
          const IconC = sec.icon;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                setSelectedSector(sec.id as LoopSector);
                const match = loops.find((l) => sec.id === "all" || l.sector === sec.id);
                if (match) {
                  setSelectedLoopId(match.id);
                  setSelectedNodeId(match.nodes[0]?.id || null);
                }
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-mono transition-all ${
                isAct ? "bg-cyan-500/20 border-cyan-300 text-white" : "border-cyan-500/25 text-cyan-100 hover:bg-cyan-500/10"
              }`}
            >
              <IconC size={14} />
              <span className="flex-1 text-right">{sec.label}</span>
            </button>
          );
        })}
      </div>
      <div className="space-y-1">
        <div className="text-[10px] font-mono text-cyan-400 px-1">التدفقات المتاحة</div>
        {filteredLoops.map((loop) => {
          const isSelected = selectedLoopId === loop.id;
          const IconComp = loop.icon;
          return (
            <button
              key={loop.id}
              type="button"
              onClick={() => {
                setSelectedLoopId(loop.id);
                setSelectedNodeId(loop.nodes[0]?.id || null);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-mono ${
                isSelected ? "border-cyan-300 bg-cyan-950/80 text-white" : "border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/10"
              }`}
            >
              <IconComp size={14} style={{ color: loop.color }} />
              <span className="flex-1 truncate text-right">{loop.name}</span>
              <span className="text-[9px] text-cyan-400">{loop.nodes.length}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full flex flex-col min-h-0 overflow-hidden bg-[#010712] text-slate-100 font-sans select-none">
      <header
        className="shrink-0 z-30 flex flex-wrap items-center gap-2 px-3 py-2 border-b border-cyan-500/25 bg-[#020b18]/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
        dir="rtl"
      >
        <div className="flex-1 min-w-[140px] text-right">
          <div className="text-xs font-bold text-white truncate">{activeLoop.name}</div>
          <div className="text-[10px] text-slate-400 font-mono truncate">
            {activeLoop.categoryLabel} · {activeLoop.schedule}
          </div>
        </div>
        {!showNavPanel && (
          <button
            type="button"
            onClick={() => setShowNavPanel(true)}
            className="px-2.5 py-1.5 rounded-xl border border-cyan-500/35 text-cyan-200 text-[11px] font-mono hover:bg-cyan-500/10"
          >
            القطاعات
          </button>
        )}
        {!showSetupPanel && (
          <button
            type="button"
            onClick={() => setShowSetupPanel(true)}
            className="px-2.5 py-1.5 rounded-xl border border-cyan-500/35 text-cyan-200 text-[11px] font-mono hover:bg-cyan-500/10"
          >
            إعداد الأتمتة
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsNodeLibraryOpen(true)}
          className="px-3 py-1.5 rounded-xl border border-cyan-400 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-white text-[11px] font-mono font-bold hover:brightness-125 transition-all shadow-[0_0_16px_rgba(0,240,255,0.35)] flex items-center gap-1.5"
        >
          <Plus size={14} className="text-cyan-300" />
          <span>مكتبة العقد والتكاملات (42 عقدة)</span>
        </button>
        <button
          type="button"
          onClick={() => setIsCredsVaultOpen((o) => !o)}
          className="px-2.5 py-1.5 rounded-xl border border-amber-500/40 text-amber-200 text-[11px] font-mono hover:bg-amber-500/10"
        >
          <KeyRound size={12} className="inline ml-1" />
          خزينة المفاتيح
        </button>
        <button
          type="button"
          onClick={() => setInspectorOpen((o) => !o)}
          className="px-2.5 py-1.5 rounded-xl border border-cyan-500/40 text-cyan-200 text-[11px] font-mono hover:bg-cyan-500/10"
        >
          {inspectorOpen ? "إخفاء المفتش" : "المفتش"}
        </button>
        <div className="flex items-center gap-1 px-2 py-1 rounded-xl border border-cyan-500/30 text-xs font-mono">
          <button type="button" onClick={() => setZoomScale((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))} aria-label="تصغير">
            <ZoomOut size={13} />
          </button>
          <span className="text-cyan-300 min-w-[42px] text-center">{Math.round(zoomScale * 100)}%</span>
          <button type="button" onClick={() => setZoomScale((z) => Math.min(2, Number((z + 0.1).toFixed(2))))} aria-label="تكبير">
            <ZoomIn size={13} />
          </button>
          <button type="button" onClick={handleResetCanvas} aria-label="إعادة توسيط">
            <RotateCcw size={13} />
          </button>
        </div>
        <button
          type="button"
          onClick={handleRunLoop}
          disabled={isRunning}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold disabled:opacity-50 shadow-[0_0_18px_rgba(0,229,255,0.25)]"
        >
          {isRunning ? "جاري التشغيل…" : "تشغيل التدفق"}
        </button>
      </header>

      <div className="relative z-10 flex-1 flex min-h-0 overflow-hidden">
        <div className="relative flex-1 flex flex-col min-h-0 min-w-0">
        <div
          ref={canvasRef}
          dir="ltr"
          onMouseDown={handleCanvasMouseDown}
          onWheel={handleWheel}
          className="canvas-backdrop relative flex-1 min-h-0 overflow-hidden cursor-grab active:cursor-grabbing bg-[#010816]"
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(0, 229, 255, 0.12) 1px, transparent 1px),
              linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: `${32 * zoomScale}px ${32 * zoomScale}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
          }}
        >
          <NeuralCanvasBackground />

          {/* Interactive Flow Elements Container (Transformed via Pan & Zoom) */}
          <div
            dir="ltr"
            className="absolute origin-top-left pointer-events-none"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
              width: "4000px",
              height: "2500px",
            }}
          >
            {/* SVG Layer for Connection Wires & Flow Pulses */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ overflow: "visible" }}
            >
              <defs>
                <linearGradient id="cyberWireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
                </linearGradient>
                <filter id="wireGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Render Existing Connections */}
              {activeLoop.connections.map((conn) => {
                const fromNodeIndex = activeLoop.nodes.findIndex((n) => n.id === conn.from);
                const toNodeIndex = activeLoop.nodes.findIndex((n) => n.id === conn.to);
                if (fromNodeIndex === -1 || toNodeIndex === -1) return null;

                const fromNode = activeLoop.nodes[fromNodeIndex];
                const toNode = activeLoop.nodes[toNodeIndex];
                const fromPos = getNodePos(fromNode, fromNodeIndex);
                const toPos = getNodePos(toNode, toNodeIndex);

                // Port Handles
                const sx = fromPos.x + 240;
                const sy = fromPos.y + 55;
                const tx = toPos.x;
                const ty = toPos.y + 55;

                // Cubic Bezier curve
                const dx = Math.max(80, Math.abs(tx - sx) * 0.45);
                const pathD = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;

                const isConnActive =
                  activeStepIndex !== -1 && activeStepIndex === fromNodeIndex;

                return (
                  <g key={conn.id} className="group cursor-pointer pointer-events-auto">
                    {/* Background wide transparent hit area */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="18"
                      onClick={() => handleDeleteConnection(conn.id)}
                    />

                    {/* Main Glow Wire */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isConnActive ? "#00e5ff" : "rgba(0, 229, 255, 0.45)"}
                      strokeWidth={isConnActive ? "3.5" : "2"}
                      filter="url(#wireGlow)"
                      className="transition-all"
                    />

                    {/* Animated Flow Pulse Particle */}
                    <circle r="4" fill="#00e5ff" filter="url(#wireGlow)">
                      <animateMotion
                        path={pathD}
                        dur={isConnActive ? "0.8s" : "2.4s"}
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Delete button indicator near midpoint on hover */}
                    <circle
                      cx={(sx + tx) / 2}
                      cy={(sy + ty) / 2}
                      r="9"
                      fill="#020d1f"
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteConnection(conn.id)}
                    />
                  </g>
                );
              })}

              {/* Render In-Progress Wiring Draft */}
              {wiringDraft && (
                <path
                  d={`M ${wiringDraft.fromX} ${wiringDraft.fromY} C ${
                    wiringDraft.fromX + Math.max(60, Math.abs(wiringDraft.toX - wiringDraft.fromX) * 0.45)
                  } ${wiringDraft.fromY}, ${
                    wiringDraft.toX - Math.max(60, Math.abs(wiringDraft.toX - wiringDraft.fromX) * 0.45)
                  } ${wiringDraft.toY}, ${wiringDraft.toX} ${wiringDraft.toY}`}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  filter="url(#wireGlow)"
                />
              )}
            </svg>

            {/* Draggable Node Cards */}
            {activeLoop.nodes.map((node, idx) => {
              const isSelected = selectedNodeId === node.id;
              const isStepRunning = activeStepIndex === idx;
              const pos = getNodePos(node, idx);

              // Type Badge Colors & Labels
              let badgeText = `[${node.type.toUpperCase()}]`;
              let badgeColor = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
              if (node.type === "trigger") {
                badgeText = "[المشغل · TRIGGER]";
                badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/40";
              } else if (node.type === "intelligence") {
                badgeText = "[الذاكرة · RAG]";
                badgeColor = "bg-teal-500/20 text-teal-300 border-teal-500/40";
              } else if (node.type === "model") {
                badgeText = "[النموذج · MODEL]";
                badgeColor = "bg-purple-500/20 text-purple-300 border-purple-500/40";
              } else if (node.type === "skill") {
                badgeText = "[المهارة · SKILL]";
                badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
              } else if (node.type === "rule") {
                badgeText = "[الحوكمة · RULE]";
                badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40";
              } else if (node.type === "action") {
                badgeText = "[التنفيذ · ACTION]";
                badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
              } else if (node.type === "review") {
                badgeText = "[المراجعة · REVIEW]";
                badgeColor = "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
              }

              return (
                <div
                  key={node.id}
                  style={{
                    position: "absolute",
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: "240px",
                  }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node, idx)}
                  className={`node-card pointer-events-auto rounded-2xl border transition-shadow duration-200 cursor-move text-right flex flex-col select-none ${
                    isSelected
                      ? "border-cyan-400 bg-[#071d3a] shadow-[0_0_30px_rgba(0,229,255,0.4)] z-30 ring-1 ring-cyan-300"
                      : "border-cyan-500/30 bg-[#030e20]/90 hover:border-cyan-400/60 hover:bg-[#05142b] z-10"
                  } ${isStepRunning ? "ring-2 ring-cyan-300 animate-pulse bg-cyan-950/70" : ""}`}
                >
                  {/* Left Port Handle (Input Connection) */}
                  <div
                    onMouseEnter={() => setHoveredPortNodeId(node.id)}
                    onMouseLeave={() => setHoveredPortNodeId(null)}
                    className={`absolute -left-3 top-12 size-6 rounded-full border-2 flex items-center justify-center transition-all z-20 cursor-crosshair ${
                      hoveredPortNodeId === node.id
                        ? "bg-emerald-400 border-white scale-125 shadow-[0_0_15px_#10b981]"
                        : "bg-[#020b18] border-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.6)]"
                    }`}
                    title="مدخل العقدة (Input Port) - أفلِت السلك هنا للربط"
                  >
                    <div className="size-2 rounded-full bg-cyan-300" />
                  </div>

                  {/* Right Port Handle (Output Connection) */}
                  <div
                    onMouseDown={(e) => handlePortMouseDown(e, node, idx)}
                    className="absolute -right-3 top-12 size-6 rounded-full border-2 border-amber-400 bg-[#020b18] flex items-center justify-center transition-all z-20 cursor-crosshair hover:scale-125 hover:bg-amber-400 hover:border-white shadow-[0_0_10px_rgba(245,158,11,0.7)] group/port"
                    title="مخرج العقدة (Output Port) - اسحب بالماوس للربط بعقدة أخرى"
                  >
                    <Plus size={12} className="text-amber-300 group-hover/port:text-black" />
                  </div>

                  {/* Node Header */}
                  <div className="px-3.5 pt-3 pb-2 border-b border-cyan-500/20 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${badgeColor}`}>
                      {badgeText}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      0{idx + 1} / 0{activeLoop.nodes.length}
                    </span>
                  </div>

                  {/* Node Body */}
                  <div className="p-3.5 flex flex-col gap-1.5">
                    <span className="text-xs font-black text-white leading-tight">{node.title}</span>
                    <span className="text-[10px] text-cyan-400/90 font-mono truncate">{node.subtitle}</span>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {node.details}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-800/80">
                      {node.model && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                          {node.model.split(" ")[0]}
                        </span>
                      )}
                      {node.skills && node.skills[0] && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                          {node.skills[0]}
                        </span>
                      )}
                      {node.rules && node.rules[0] && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono">
                          {node.rules[0].split(":")[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Node Footer */}
                  <div className="px-3 py-1.5 bg-[#020917]/80 rounded-b-2xl border-t border-cyan-500/15 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 size={11} />
                      <span>ONLINE</span>
                    </span>
                    <span className="text-[9px] text-slate-500">X:{pos.x} Y:{pos.y}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        </div>

        {inspectorOpen && (
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-r border-cyan-500/25 bg-[#020b18]/95 backdrop-blur-2xl flex flex-col justify-between shrink-0 h-auto lg:h-full overflow-hidden shadow-2xl transition-all">
            {selectedNode ? (
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-5">
                {/* Inspector Header */}
                <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectorOpen(false)}
                      className="p-1 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"
                      title="إغلاق المفتش الجانبي"
                    >
                      <X size={14} />
                    </button>
                    <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                      <SlidersHorizontal size={15} />
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-black font-mono text-white">
                        مفتش العقدة السيبراني
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      NODE_ID: {selectedNode.id}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteNode(selectedNode.id)}
                  className="p-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:text-white hover:bg-rose-500/30 transition-colors"
                  title="حذف هذه العقدة من المخطط"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Title & Description */}
              <div className="mt-4 flex flex-col gap-1 text-right">
                <span className="text-sm font-black text-white">{selectedNode.title}</span>
                <span className="text-xs text-cyan-300 font-mono">{selectedNode.subtitle}</span>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 p-3 rounded-xl bg-[#031124] border border-cyan-500/20 text-right">
                  {selectedNode.details}
                </p>
              </div>

              {/* Model or Memory Spec */}
              {selectedNode.model && (
                <div className="mt-3 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-right">
                  <span className="text-[10px] font-mono text-purple-300 font-bold block">
                    [النموذج الذكي المعتمد]:
                  </span>
                  <span className="text-xs font-mono text-white mt-1 block">
                    {selectedNode.model}
                  </span>
                </div>
              )}

              {selectedNode.memoryContext && (
                <div className="mt-3 p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 text-right">
                  <span className="text-[10px] font-mono text-teal-300 font-bold block">
                    [سياق الذاكرة الدلالية Qdrant]:
                  </span>
                  <span className="text-xs font-mono text-white mt-1 block">
                    {selectedNode.memoryContext}
                  </span>
                </div>
              )}

              {/* Parameters List */}
              <div className="mt-4 flex flex-col gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 text-right">
                  [معايير وقيم العقدة الحية · Parameters]:
                </span>
                <div className="rounded-xl border border-slate-800 bg-[#030f20] divide-y divide-slate-800/80 overflow-hidden">
                  {Object.entries(selectedNode.parameters).map(([key, val]) => (
                    <div
                      key={key}
                      className="px-3 py-2 flex items-center justify-between text-xs font-mono"
                    >
                      <span className="text-amber-300 font-bold truncate max-w-[180px]">
                        {String(val)}
                      </span>
                      <span className="text-slate-400 text-[11px]">{key}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Node Test Execution Button */}
              <button
                type="button"
                onClick={() => handleTestSingleNode(selectedNode)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/50 hover:bg-cyan-500/25 text-cyan-200 hover:text-white font-mono text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Zap size={14} className="text-cyan-400" />
                <span>[ تشغيل واختبار هذه العقدة منفردة ]</span>
              </button>

              {/* Terminal Logs View */}
              <div className="mt-4 flex flex-col gap-1.5 flex-1 min-h-[140px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">REALTIME LOG STREAM</span>
                  <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1 font-bold">
                    <Terminal size={12} />
                    <span>سجل التيرمنال الحي</span>
                  </span>
                </div>
                <div className="flex-1 p-2.5 rounded-xl bg-black/70 border border-cyan-500/20 font-mono text-[10px] text-slate-300 overflow-y-auto space-y-1 text-right">
                  {executionLogs.length > 0 ? (
                    executionLogs.map((log, i) => (
                      <div key={i} className="leading-tight">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600 text-center py-4">
                      لا توجد سجلات بعد. انقر على تشغيل للبدء.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
              <Crosshair size={32} className="text-cyan-500/40 mb-2 animate-spin" />
              <span className="text-xs font-mono">انقر على أي عقدة على الكانفاس لتفتيشها وتعديلها</span>
            </div>
          )}
        </div>
      )}
      </div>

      <LoopsPanelTray
        showNavPanel={showNavPanel}
        showSetupPanel={showSetupPanel}
        showNodePalette={isNodeLibraryOpen}
        inspectorOpen={inspectorOpen}
        onRestoreNav={() => setShowNavPanel(true)}
        onRestoreSetup={() => setShowSetupPanel(true)}
        onRestorePalette={() => setIsNodeLibraryOpen(true)}
        onRestoreInspector={() => setInspectorOpen(true)}
      />

      {showNavPanel && (
        <CyberFloatingPanel
          id="loops-nav-sidebar"
          title="قطاعات وتدفقات الأتمتة"
          subtitle="اسحب · طي · إخفاء"
          width={300}
          zIndex={STUDIO_Z.floating}
          defaultPosition={{ x: 16, y: 96 }}
          onClose={() => setShowNavPanel(false)}
        >
          {navSidebarBody}
        </CyberFloatingPanel>
      )}

      {/* Enterprise Node Library Drawer (42 categorized nodes: Triggers, AI/DSPy, GDS/Travel, Fintech, Marketing, Logic, MCP) */}
      <EnterpriseNodeLibraryDrawer
        isOpen={isNodeLibraryOpen}
        onClose={() => setIsNodeLibraryOpen(false)}
        onAddNode={handleAddEnterpriseNode}
      />

      {showSetupPanel && (
        <CyberFloatingPanel
          id="loops-automation-setup"
          title="إعداد الأتمتة"
          subtitle={`${activeLoop.name} · اسحب · طي · إخفاء`}
          width={320}
          zIndex={STUDIO_Z.floating}
          defaultPosition={{
            x: typeof window !== "undefined" ? Math.max(16, window.innerWidth - 340) : 720,
            y: 96,
          }}
          onClose={() => setShowSetupPanel(false)}
        >
          <div className="space-y-3 p-3 text-right" dir="rtl">
            <div className="rounded-xl border border-cyan-500/25 bg-[#031124]/80 p-3">
              <div className="text-xs font-mono text-cyan-300">{activeLoop.categoryLabel}</div>
              <div className="mt-1 text-[11px] text-slate-400">
                الجدول: <span className="font-mono text-amber-300">{activeLoop.schedule}</span>
              </div>
              <div className="mt-2 text-[11px] font-mono text-emerald-400">
                {isRunning ? "EXECUTING…" : "ACTIVE_BLUEPRINT"}
              </div>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400">
              حرّك هذه اللوحة فوق الكانفاس. أغلِقها من × ثم استعدها من الشريط الناعم أسفل الشاشة (فوق قائمة الاستوديو).
            </p>
          </div>
        </CyberFloatingPanel>
      )}

      {/* ========================================================================= */}
      {/* 5. Slide-Out Cyber Credentials Vault Assistant Drawer                     */}
      {/* ========================================================================= */}
      {isCredsVaultOpen && (
        <aside
          className="absolute top-0 right-0 z-40 w-full sm:w-[430px] h-full bg-[#020b18]/95 border-l border-amber-500/40 shadow-[-15px_0_50px_rgba(245,158,11,0.25)] flex flex-col text-right select-none animate-in slide-in-from-right duration-200"
          dir="rtl"
        >
          {/* Header */}
          <div className="p-4 border-b border-amber-500/30 flex items-center justify-between bg-[#04162e]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400">
                <Lock size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white font-mono">
                  خزينة مفاتيح الـ API والربط السحابي
                </span>
                <span className="text-[10px] font-mono text-amber-400">
                  PRE-FLIGHT CREDENTIALS VAULT
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCredsVaultOpen(false)}
              className="p-1.5 rounded-lg border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-white"
            >
              <X size={15} />
            </button>
          </div>

          {/* AI Voice Assistant Prompt Banner */}
          <div className="p-3.5 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2.5 text-xs text-slate-200">
            <Bot size={18} className="text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <p className="leading-relaxed">
              <strong className="text-amber-300 block mb-0.5">توجيه الوكيل الذكي:</strong>
              يا سيدي، روتين إعلانات Meta و Google ينقصه توثيق الـ Access Token ومعرف الحساب الإعلاني. الصق المفتاح أدناه للاختبار والربط الفوري.
            </p>
          </div>

          {/* Inputs & Actions */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[11px] text-slate-300 font-bold mb-1">
                Meta Graph API Access Token (System User Token)
              </label>
              <textarea
                value={credsVaultMetaToken}
                onChange={(e) => setCredsVaultMetaToken(e.target.value)}
                placeholder="EAA..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-[#031124] border border-cyan-500/30 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 font-bold mb-1">
                Meta Ad Account ID
              </label>
              <input
                type="text"
                value={credsVaultMetaAccountId}
                onChange={(e) => setCredsVaultMetaAccountId(e.target.value)}
                placeholder="act_123456789"
                className="w-full p-2.5 rounded-xl bg-[#031124] border border-cyan-500/30 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 font-bold mb-1">
                Meta Pixel ID
              </label>
              <input
                type="text"
                value={credsVaultPixelId}
                onChange={(e) => setCredsVaultPixelId(e.target.value)}
                placeholder="987654321..."
                className="w-full p-2.5 rounded-xl bg-[#031124] border border-cyan-500/30 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 font-bold mb-1">
                Google Ads Developer Token (اختياري)
              </label>
              <input
                type="text"
                value={credsVaultGoogleToken}
                onChange={(e) => setCredsVaultGoogleToken(e.target.value)}
                placeholder="G-DEV-..."
                className="w-full p-2.5 rounded-xl bg-[#031124] border border-cyan-500/30 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {credsTestStatus && (
              <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/30 text-[11px] text-cyan-300 leading-relaxed">
                {credsTestStatus}
              </div>
            )}
          </div>

          {/* Footer Save Button */}
          <div className="p-4 border-t border-slate-800 bg-[#020b18] flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                setCredsSaving(true);
                setCredsTestStatus("جاري فحص الاتصال وتوثيق المفاتيح مع Meta Graph API...");
                try {
                  const res = await fetch("/api/admin/ads", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      credentials: {
                        metaAccessToken: credsVaultMetaToken || undefined,
                        metaAdAccountId: credsVaultMetaAccountId || undefined,
                        metaPixelId: credsVaultPixelId || undefined,
                        googleDeveloperToken: credsVaultGoogleToken || undefined,
                      },
                    }),
                  });
                  const data = await res.json();
                  if (data.ok) {
                    setCredsTestStatus("✔ تم توثيق وحفظ المفاتيح بنجاح في قاعدة البيانات وتفعيل اتصال السرب!");
                    setLoops((prev) =>
                      prev.map((l) =>
                        l.id === activeLoop.id
                          ? {
                              ...l,
                              nodes: l.nodes.map((n) =>
                                n.id === "ads-node-4" ? { ...n, status: "completed" as const } : n
                              ),
                            }
                          : l
                      )
                    );
                    const time = new Date().toLocaleTimeString("ar-SA", { hour12: false });
                    setExecutionLogs((prev) => [
                      `[${time}] ✔ تم اعتماد وتخزين مفاتيح Meta Graph API في خزينة النظام السحابية.`,
                      `[${time}] ◈ العقدة [مهارة Meta Graph API & Google Ads] أصبحت جاهزة تماماً للتشغيل.`,
                      ...prev,
                    ]);
                  } else {
                    setCredsTestStatus("حدث خطأ أثناء حفظ المفاتيح.");
                  }
                } catch {
                  setCredsTestStatus("تعذر الاتصال بخادم إعدادات المفاتيح.");
                } finally {
                  setCredsSaving(false);
                }
              }}
              disabled={credsSaving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-mono text-xs font-bold shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all active:scale-95 disabled:opacity-50"
            >
              {credsSaving ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-white" />
                  <span>جاري التحقق والحفظ...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>حفظ المفاتيح واعتماد العقدة فورياً</span>
                </>
              )}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
