"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { CyberFloatingPanel } from "@/components/admin/automation/hud/studio/shell/CyberFloatingPanel";
import * as THREE from "three";
import {
  BarChart3,
  Bell,
  Brain,
  Building2,
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  Coins,
  CreditCard,
  Database,
  FileText,
  Gift,
  Globe,
  Hotel,
  Image,
  KeyRound,
  Languages,
  LayoutGrid,
  Link2,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Orbit,
  Package,
  PenTool,
  Percent,
  Plane,
  Plug,
  Receipt,
  RefreshCw,
  Rss,
  Scale,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Ticket,
  Timer,
  Trash2,
  Truck,
  Users,
  Wallet,
  Workflow,
  Zap,
  CheckCircle2,
  Camera,
  CameraOff,
  Maximize2,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  NEXUS_HUB_CARDS,
  NEXUS_CARD_COUNT,
  type NexusHubCard,
  type NexusCardHealth,
} from "@/lib/studio/nexus/nexus-cards.generated";
import { TONES, MONO } from "@/lib/studio/tokens";
import type { DomainIcon } from "@/lib/neural-studio/domain-systems";
import {
  evaluateNexusGesture,
  snapIndexFromRotation,
  useNexusDeckController,
  NEXUS_CENTROID_SMOOTH,
  NEXUS_HAND_ROI_MIN_ROW,
  NEXUS_MOTION_DIFF_THRESHOLD,
} from "./useNexusDeckController";

const DOMAIN_ICONS: Record<DomainIcon, LucideIcon> = {
  plane: Plane,
  hotel: Hotel,
  building: Building2,
  car: Car,
  map: MapPin,
  package: Package,
  file: FileText,
  star: Star,
  users: Users,
  message: MessageCircle,
  shield: ShieldCheck,
  trash: Trash2,
  share: Share2,
  calendar: CalendarDays,
  pen: PenTool,
  image: Image,
  chart: BarChart3,
  rss: Rss,
  sparkles: Sparkles,
  settings: Settings,
  megaphone: Megaphone,
  mail: Mail,
  ticket: Ticket,
  percent: Percent,
  gift: Gift,
  brain: Brain,
  orbit: Orbit,
  timer: Timer,
  plug: Plug,
  link: Link2,
  database: Database,
  languages: Languages,
  credit: CreditCard,
  coins: Coins,
  receipt: Receipt,
  wallet: Wallet,
  store: Store,
  globe: Globe,
  key: KeyRound,
  refresh: RefreshCw,
  truck: Truck,
  scale: Scale,
  lock: Lock,
  smartphone: Smartphone,
  layout: LayoutGrid,
  search: Search,
  bell: Bell,
  workflow: Workflow,
};

export interface HolographicCardSector {
  id: string;
  hubId: string;
  screenId: string;
  stationId: string;
  titleAr: string;
  titleEn: string;
  category: string;
  color: string;
  icon: LucideIcon;
  metricLabel1: string;
  metricValue1: string;
  metricLabel2: string;
  metricValue2: string;
  metricLabel3: string;
  metricValue3: string;
  status: NexusCardHealth;
  description: string;
  quickActionCommand: string;
  features: string[];
}

export type NexusHubMetrics = {
  readinessPct: number | null;
  recordsPct: number | null;
  integrationPct: number | null;
  status: NexusCardHealth;
  labelAr: string;
};

export const NEXUS_SECTOR_CARDS: HolographicCardSector[] = NEXUS_HUB_CARDS.map((c) => ({
  ...c,
  icon: DOMAIN_ICONS[c.domainIcon] ?? Sparkles,
  metricValue1: "—",
  metricValue2: "—",
  metricValue3: "—",
  status: "DEGRADED" as NexusCardHealth,
}));

function metricsForCard(card: NexusHubCard, map: Record<string, NexusHubMetrics>): NexusHubMetrics | undefined {
  return map[card.hubId];
}

function cardWithMetrics(card: NexusHubCard, map: Record<string, NexusHubMetrics>): HolographicCardSector {
  const m = metricsForCard(card, map);
  const pct = (n: number | null | undefined) => (typeof n === "number" ? `${n}%` : "—");
  return {
    ...card,
    icon: DOMAIN_ICONS[card.domainIcon] ?? Sparkles,
    metricValue1: pct(m?.readinessPct),
    metricValue2: pct(m?.recordsPct),
    metricValue3: pct(m?.integrationPct),
    status: m?.status ?? "DEGRADED",
  };
}

interface HolographicCylinderStageProps {
  frequencies?: number[];
  onSelectSector?: (stationId: string) => void;
  onSendDirective?: (directive: string) => void;
  onOpenHub?: (card: NexusHubCard) => void;
  onCloseHub?: (hubId: string) => void;
  className?: string;
}

export default function HolographicCylinderStage({
  frequencies = [],
  onSelectSector,
  onSendDirective,
  onOpenHub,
  onCloseHub,
  className = "",
}: HolographicCylinderStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const CARD_COUNT = NEXUS_CARD_COUNT;
  const deck = useNexusDeckController(CARD_COUNT);
  const {
    activeCardIndex,
    activeCardIndexRef,
    rotateTo,
    rotateByDelta,
    cylinderVelocityRef,
    palmStableFramesRef,
    gestureCooldownRef,
    beginPointerDrag,
    recordPointerDelta,
    endPointerDrag,
    shouldSuppressClick,
  } = deck;

  const [metricsByHub, setMetricsByHub] = useState<Record<string, NexusHubMetrics>>({});
  const metricsByHubRef = useRef(metricsByHub);
  metricsByHubRef.current = metricsByHub;
  const metricsPaintVersionRef = useRef(0);

  const displayCards = useMemo(
    () => NEXUS_HUB_CARDS.map((c) => cardWithMetrics(c, metricsByHub)),
    [metricsByHub]
  );

  const [isHandTrackingActive, setIsHandTrackingActive] = useState<boolean>(false);
  const isHandTrackingActiveRef = useRef(isHandTrackingActive);
  isHandTrackingActiveRef.current = isHandTrackingActive;
  const pointerDragActiveRef = useRef(false);

  const [gestureFeedback, setGestureFeedback] = useState<string>("تحكم الماوس واللمس: نشط");
  const [activeGestureType, setActiveGestureType] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState<boolean>(false);
  const inspectModalOpenRef = useRef(inspectModalOpen);
  inspectModalOpenRef.current = inspectModalOpen;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const openHubRef = useRef(onOpenHub);
  openHubRef.current = onOpenHub;
  const closeHubRef = useRef(onCloseHub);
  closeHubRef.current = onCloseHub;

  const ANGLE_STEP = (2 * Math.PI) / CARD_COUNT;
  /** نصف قطر معقول حتى تبقى البطاقات أمام الكاميرا (92 بطاقة) */
  const CYLINDER_RADIUS = Math.min(420, 340 + Math.max(0, CARD_COUNT - 6) * 4);

  const activeCard = displayCards[activeCardIndex] ?? displayCards[0];

  const refreshMetrics = useCallback(async () => {
    try {
      const results = await Promise.all(
        NEXUS_HUB_CARDS.map(async (card) => {
          const res = await fetch(`/api/admin/studio/nexus/metrics?hubId=${encodeURIComponent(card.hubId)}`, {
            credentials: "include",
          });
          if (!res.ok) return null;
          const json = (await res.json()) as {
            ok?: boolean;
            readinessPct?: number;
            recordsPct?: number | null;
            integrationPct?: number;
            status?: NexusCardHealth;
            labelAr?: string;
          };
          if (!json.ok) return null;
          return [
            card.hubId,
            {
              readinessPct: json.readinessPct ?? null,
              recordsPct: json.recordsPct ?? null,
              integrationPct: json.integrationPct ?? null,
              status: json.status ?? "DEGRADED",
              labelAr: json.labelAr ?? card.titleAr,
            },
          ] as const;
        })
      );
      const next: Record<string, NexusHubMetrics> = {};
      for (const row of results) if (row) next[row[0]] = row[1];
      setMetricsByHub(next);
      metricsPaintVersionRef.current += 1;
    } catch {
      /* keep prior metrics */
    }
  }, []);

  useEffect(() => {
    void refreshMetrics();
    const timer = window.setInterval(() => void refreshMetrics(), 60_000);
    const onRefresh = () => void refreshMetrics();
    window.addEventListener("studio:refresh", onRefresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("studio:refresh", onRefresh);
    };
  }, [refreshMetrics]);

  const openActiveHub = useCallback(() => {
    const card = NEXUS_HUB_CARDS[activeCardIndexRef.current];
    if (!card) return;
    setInspectModalOpen(true);
    openHubRef.current?.(card);
    onSelectSector?.(card.stationId);
  }, [onSelectSector]);

  const toggleCameraRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    const onRotate = (ev: Event) => {
      const delta = (ev as CustomEvent<{ delta?: number }>).detail?.delta ?? 0;
      if (delta) rotateByDelta(delta);
    };
    const onOpenSector = () => openActiveHub();
    const onToggleCam = () => {
      void toggleCameraRef.current();
    };
    const onSelectSectorEv = (ev: Event) => {
      const d = (ev as CustomEvent<{ stationId?: string; sectorId?: string; hubId?: string }>).detail;
      const key = d?.hubId || d?.stationId || d?.sectorId;
      if (!key) return;
      const idx = NEXUS_HUB_CARDS.findIndex((c) => c.hubId === key || c.stationId === key || c.id === key);
      if (idx >= 0) rotateTo(idx);
    };
    const onRunSectorCommand = (ev: Event) => {
      const d = (ev as CustomEvent<{ command?: string; sectorId?: string; stationId?: string; hubId?: string }>).detail;
      if (d?.command && onSendDirective) {
        onSendDirective(d.command);
        return;
      }
      const key = d?.hubId || d?.stationId || d?.sectorId;
      if (!key || !onSendDirective) return;
      const card = NEXUS_HUB_CARDS.find((c) => c.hubId === key || c.stationId === key || c.id === key);
      if (card?.quickActionCommand) onSendDirective(card.quickActionCommand);
    };
    window.addEventListener("studio:nexus-rotate", onRotate);
    window.addEventListener("studio:nexus-open-sector", onOpenSector);
    window.addEventListener("studio:nexus-toggle-camera", onToggleCam);
    window.addEventListener("studio:nexus-select-sector", onSelectSectorEv);
    window.addEventListener("studio:nexus-run-sector-command", onRunSectorCommand);
    return () => {
      window.removeEventListener("studio:nexus-rotate", onRotate);
      window.removeEventListener("studio:nexus-open-sector", onOpenSector);
      window.removeEventListener("studio:nexus-toggle-camera", onToggleCam);
      window.removeEventListener("studio:nexus-select-sector", onSelectSectorEv);
      window.removeEventListener("studio:nexus-run-sector-command", onRunSectorCommand);
    };
  }, [openActiveHub, onSendDirective, rotateByDelta, rotateTo]);

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

  const createCardTexture = (card: HolographicCardSector, index: number, isHighlighted: boolean) => {
    const canvas = document.createElement("canvas");
    canvas.width = 860;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, 860, 240);
    const toneKey = (["gold", "cyan", "magenta", "green"] as const).find((t) => TONES[t].line.toLowerCase() === card.color.toLowerCase());
    const accent = isHighlighted ? TONES.cyan.line : toneKey ? TONES[toneKey].line : card.color;
    const alt = toneKey === "magenta" ? TONES.cyan.line : TONES.magenta.line;

    const glass = ctx.createLinearGradient(0, 0, 860, 240);
    glass.addColorStop(0, "rgba(4,18,32,0.55)");
    glass.addColorStop(0.5, "rgba(8,28,48,0.42)");
    glass.addColorStop(1, "rgba(2,12,24,0.62)");
    ctx.fillStyle = glass;
    ctx.fillRect(12, 12, 836, 216);

    for (let n = 0; n < 900; n++) {
      const nx = 12 + Math.random() * 836;
      const ny = 12 + Math.random() * 216;
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
      ctx.fillRect(nx, ny, 1, 1);
    }

    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 18;
    ctx.strokeRect(12, 12, 836, 216);
    ctx.strokeStyle = alt;
    ctx.globalAlpha = 0.45;
    ctx.strokeRect(18, 18, 824, 204);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    ctx.fillStyle = accent;
    ctx.font = `600 20px ${MONO}`;
    ctx.textAlign = "left";
    ctx.fillText(`${card.titleAr.slice(0, 36)} · ${card.screenId}`, 36, 52);

    ctx.fillStyle = "#e8f2f6";
    ctx.font = `700 28px ${MONO}`;
    ctx.fillText(`${card.metricLabel1}: ${card.metricValue1}`, 36, 98);
    ctx.fillStyle = alt;
    ctx.font = `600 22px ${MONO}`;
    ctx.fillText(`${card.metricLabel2}: ${card.metricValue2}  ·  ${card.metricLabel3}: ${card.metricValue3}`, 36, 136);

    ctx.fillStyle = card.status === "OPTIMAL" ? TONES.green.line : card.status === "OFFLINE" ? TONES.magenta.line : TONES.gold.line;
    ctx.font = `600 18px ${MONO}`;
    ctx.fillText(`[${card.status}] ${card.category}`, 36, 178);
    ctx.fillStyle = "rgba(147,168,179,0.95)";
    ctx.font = `500 16px ${MONO}`;
    ctx.fillText(`#${index + 1}/${CARD_COUNT} · ${card.titleEn}`, 36, 208);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

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
  toggleCameraRef.current = toggleCamera;

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
      const prevData = prevFrameDataRef.current;

      for (let i = 0; i < data.length; i += 4) {
        const diffR = Math.abs(data[i] - prevData[i]);
        const diffG = Math.abs(data[i + 1] - prevData[i + 1]);
        const diffB = Math.abs(data[i + 2] - prevData[i + 2]);
        const totalDiff = (diffR + diffG + diffB) / 3;

        if (totalDiff > NEXUS_MOTION_DIFF_THRESHOLD) {
          const pixelIndex = i / 4;
          const py = Math.floor(pixelIndex / 64);
          if (py > NEXUS_HAND_ROI_MIN_ROW) {
            motionPixels++;
            sumX += pixelIndex % 64;
          }
        }
      }

      prevFrameDataRef.current.set(data);

      const rawCentroid = motionPixels > 0 ? sumX / motionPixels : prevCentroidX;
      const centroidX =
        motionPixels > 0 ? prevCentroidX * (1 - NEXUS_CENTROID_SMOOTH) + rawCentroid * NEXUS_CENTROID_SMOOTH : prevCentroidX;
      const deltaX = motionPixels > 0 ? centroidX - prevCentroidX : 0;
      if (motionPixels > 0) prevCentroidX = centroidX;

      if (pointerDragActiveRef.current) return;

      const fsm = evaluateNexusGesture({
        modalOpen: inspectModalOpenRef.current,
        motionPixels,
        centroidDeltaX: deltaX,
        palmStableFrames: palmStableFramesRef.current,
        handVelocity: cylinderVelocityRef.current,
        now,
        cooldownUntil: gestureCooldownRef.current,
      });

      palmStableFramesRef.current = fsm.nextPalmStableFrames;
      gestureCooldownRef.current = fsm.nextCooldownUntil;

      if (fsm.swipeTorque) {
        cylinderVelocityRef.current += fsm.swipeTorque;
        setActiveGestureType(fsm.gesture);
        setGestureFeedback(fsm.gesture === "SWIPE_RIGHT" ? "👉 تمرير لليمين" : "👈 تمرير لليسار");
        setTimeout(() => setActiveGestureType((prev) => (prev?.startsWith("SWIPE") ? null : prev)), 300);
      }

      if (fsm.closeModal) {
        setActiveGestureType("FIST_CLOSED");
        setGestureFeedback("✊ قبضة مغلقة: إغلاق النافذة");
        setInspectModalOpen(false);
        const hub = NEXUS_HUB_CARDS[activeCardIndexRef.current];
        if (hub) closeHubRef.current?.(hub.hubId);
        setTimeout(() => setActiveGestureType(null), 1000);
      }

      if (fsm.openModal) {
        setActiveGestureType("PALM_OPEN");
        setGestureFeedback("✋ كف مستقر: فتح القسم");
        openHubRef.current?.(NEXUS_HUB_CARDS[activeCardIndexRef.current]!);
        setInspectModalOpen(true);
        setTimeout(() => setActiveGestureType(null), 1000);
      }
    }, 80);

    return () => {
      clearInterval(motionInterval);
    };
  }, [isHandTrackingActive, cylinderVelocityRef, gestureCooldownRef, palmStableFramesRef]);

  // Main Three.js Scene Setup & Animation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    const w = container.clientWidth || 1280;
    const h = container.clientHeight || 720;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010712, 0.00045);

    const camera = new THREE.PerspectiveCamera(45, w / h, 1, 8000);
    const camZ = CYLINDER_RADIUS + 480;
    camera.position.set(0, 28, camZ);
    camera.lookAt(0, 0, 0);

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

    const cardMeshes: THREE.Mesh[] = [];
    const cardTextures: THREE.CanvasTexture[] = [];
    let lastPaintVersion = metricsPaintVersionRef.current;

    const cardsSnapshot = () =>
      NEXUS_HUB_CARDS.map((c) => cardWithMetrics(c, metricsByHubRef.current));

    const rebuildTextures = () => {
      const cards = cardsSnapshot();
      cards.forEach((card, idx) => {
        const isHighlighted = idx === activeCardIndexRef.current;
        const next = createCardTexture(card, idx, isHighlighted);
        if (!next) return;
        const mat = cardMeshes[idx]?.material as THREE.MeshStandardMaterial | undefined;
        if (mat?.map) mat.map.dispose();
        if (mat) mat.map = next;
        if (cardTextures[idx]) cardTextures[idx].dispose();
        cardTextures[idx] = next;
        if (mat) mat.needsUpdate = true;
      });
      lastPaintVersion = metricsPaintVersionRef.current;
    };

    cardsSnapshot().forEach((card, idx) => {
      const isHighlighted = idx === activeCardIndexRef.current;
      const texture = createCardTexture(card, idx, isHighlighted)!;
      cardTextures.push(texture);

      const cardGeo = createCurvedCardGeometry(CYLINDER_RADIUS, 192, 72, 28);

      const cardMat = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        roughness: 0.28,
        metalness: 0.12,
        emissive: new THREE.Color(0x001822),
        emissiveIntensity: 0.35,
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

    let targetRotationY = -activeCardIndexRef.current * ANGLE_STEP;
    let isDragging = false;
    let isTouchDragging = false;
    let previousPointerX = 0;

    const domEl = renderer.domElement;
    domEl.style.touchAction = "none";

    const snapFromRotation = () => {
      const actualIndex = snapIndexFromRotation(cylinderGroup.rotation.y, CARD_COUNT);
      targetRotationY = -actualIndex * ANGLE_STEP;
      activeCardIndexRef.current = actualIndex;
      rotateTo(actualIndex);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (isHandTrackingActiveRef.current) return;
      isDragging = true;
      pointerDragActiveRef.current = true;
      beginPointerDrag();
      previousPointerX = e.clientX;
      domEl.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || isHandTrackingActiveRef.current) return;
      const deltaX = e.clientX - previousPointerX;
      previousPointerX = e.clientX;
      recordPointerDelta(deltaX);
      cylinderGroup.rotation.y += deltaX * 0.005;
      targetRotationY = cylinderGroup.rotation.y;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (domEl.hasPointerCapture(e.pointerId)) domEl.releasePointerCapture(e.pointerId);
      if (!isDragging) return;
      isDragging = false;
      pointerDragActiveRef.current = false;
      endPointerDrag();
      snapFromRotation();
    };

    domEl.addEventListener("pointerdown", handlePointerDown);
    domEl.addEventListener("pointermove", handlePointerMove);
    domEl.addEventListener("pointerup", handlePointerUp);
    domEl.addEventListener("pointercancel", handlePointerUp);

    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isTouchDragging = true;
        pointerDragActiveRef.current = true;
        beginPointerDrag();
        touchStartX = e.touches[0].clientX;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouchDragging || e.touches.length === 0) return;
      e.preventDefault();
      const deltaX = e.touches[0].clientX - touchStartX;
      touchStartX = e.touches[0].clientX;
      recordPointerDelta(deltaX);
      cylinderGroup.rotation.y += deltaX * 0.005;
      targetRotationY = cylinderGroup.rotation.y;
    };
    const handleTouchEnd = () => {
      if (!isTouchDragging) return;
      isTouchDragging = false;
      pointerDragActiveRef.current = false;
      endPointerDrag();
      snapFromRotation();
    };

    domEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    domEl.addEventListener("touchmove", handleTouchMove, { passive: false });
    domEl.addEventListener("touchend", handleTouchEnd);

    const handleWheel = (e: WheelEvent) => {
      if (isHandTrackingActiveRef.current || pointerDragActiveRef.current) return;
      e.preventDefault();
      rotateByDelta(e.deltaY > 0 ? 1 : -1);
      targetRotationY = -activeCardIndexRef.current * ANGLE_STEP;
    };
    container.addEventListener("wheel", handleWheel, { passive: false });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      if (shouldSuppressClick()) return;
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
          rotateTo(idx);
          openActiveHub();
        }
      }
    };

    domEl.addEventListener("click", handleClick);

    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (metricsPaintVersionRef.current !== lastPaintVersion) rebuildTextures();

      if (isHandTrackingActiveRef.current) {
        if (cylinderVelocityRef.current !== 0) {
          cylinderGroup.rotation.y += cylinderVelocityRef.current;
          cylinderVelocityRef.current *= 0.92;
          const actualIndex = snapIndexFromRotation(cylinderGroup.rotation.y, CARD_COUNT);
          if (actualIndex !== activeCardIndexRef.current) rotateTo(actualIndex);
          targetRotationY = cylinderGroup.rotation.y;
          if (Math.abs(cylinderVelocityRef.current) < 0.001) cylinderVelocityRef.current = 0;
        } else if (!isDragging && !isTouchDragging) {
          targetRotationY = -activeCardIndexRef.current * ANGLE_STEP;
          cylinderGroup.rotation.y += (targetRotationY - cylinderGroup.rotation.y) * 0.08;
        }
      } else if (!isDragging && !isTouchDragging) {
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
      const nextCamZ = CYLINDER_RADIUS + 480;
      camera.position.set(0, 28, nextCamZ);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    const ro = new ResizeObserver(() => handleResize());
    ro.observe(container);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener("pointerdown", handlePointerDown);
      domEl.removeEventListener("pointermove", handlePointerMove);
      domEl.removeEventListener("pointerup", handlePointerUp);
      domEl.removeEventListener("pointercancel", handlePointerUp);
      domEl.removeEventListener("touchstart", handleTouchStart);
      domEl.removeEventListener("touchmove", handleTouchMove);
      domEl.removeEventListener("touchend", handleTouchEnd);
      domEl.removeEventListener("click", handleClick);
      container.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
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
  }, [
    ANGLE_STEP,
    CARD_COUNT,
    CYLINDER_RADIUS,
    activeCardIndexRef,
    beginPointerDrag,
    endPointerDrag,
    recordPointerDelta,
    rotateByDelta,
    rotateTo,
    shouldSuppressClick,
    openActiveHub,
  ]);

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

      {/* كاميرا اليد — ثابتة كما كانت (بدون لوحة مكررة) */}
      <div className="absolute top-[72px] left-4 z-20 pointer-events-auto flex flex-col gap-2 max-w-[12rem]">
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
                  {activeGestureType === "FIST_CLOSED" && "✊ قبضة"}
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

        <div className="w-48 px-2.5 py-1.5 rounded-xl bg-[#020b18]/85 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 text-center truncate">
          {gestureFeedback}
        </div>
      </div>

      <div className="absolute top-[72px] right-4 z-20 pointer-events-auto flex items-center gap-2 bg-[#020b18]/90 px-3 py-1.5 rounded-2xl border border-cyan-500/30 backdrop-blur-xl shadow-lg">
        <button type="button" onClick={() => rotateTo(activeCardIndex - 1)} className="p-1 rounded-lg hover:bg-cyan-500/20 text-cyan-400" title="السابق">
          <ChevronRight size={18} />
        </button>
        <span className="text-xs font-mono font-bold text-white min-w-[88px] text-center">
          {String(activeCardIndex + 1).padStart(2, "0")} / {String(CARD_COUNT).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => rotateTo(activeCardIndex + 1)} className="p-1 rounded-lg hover:bg-cyan-500/20 text-cyan-400" title="التالي">
          <ChevronLeft size={18} />
        </button>
      </div>

      <CyberFloatingPanel
        id="nexus-sector-actions"
        title={activeCard.titleAr}
        subtitle="إجراءات القطاع النشط · اسحب · طي · إخفاء"
        width={420}
        fitContent
        anchor="bottom-center"
        defaultPosition={{ x: 24, y: typeof window !== "undefined" ? window.innerHeight - 200 : 520 }}
      >
        <div className="p-3 space-y-3 text-right">
          <p className="text-[11px] text-slate-400 leading-relaxed">{activeCard.description}</p>
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={openActiveHub}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 text-xs font-mono"
            >
              <Maximize2 size={13} />
              <span>فتح القسم</span>
            </button>
            <button
              type="button"
              onClick={handleQuickDirective}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-mono border border-amber-400/40"
            >
              <Zap size={13} className="fill-white" />
              <span>توجيه فوري</span>
            </button>
          </div>
        </div>
      </CyberFloatingPanel>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-[#03142e] border border-cyan-500/30 flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-sans">{activeCard.metricLabel1}</span>
                <span className="text-2xl font-black font-mono text-cyan-400">{activeCard.metricValue1}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#03142e] border border-amber-500/30 flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-sans">{activeCard.metricLabel2}</span>
                <span className="text-2xl font-black font-mono text-amber-400">{activeCard.metricValue2}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#03142e] border border-fuchsia-500/30 flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-sans">{activeCard.metricLabel3}</span>
                <span className="text-2xl font-black font-mono text-fuchsia-400">{activeCard.metricValue3}</span>
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
