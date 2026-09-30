"use client";

import {
  Bell, Brain, Building2, CalendarDays, Car, ChartLine, Circle, Coins, CreditCard, Database, FileText, Gift, Globe, Hotel, Image, KeyRound, Languages,
  LayoutDashboard, Link2, Lock, Mail, Map, Megaphone, MessageSquare, Orbit, Package, PenLine, Percent, Plane, Plug, Receipt, RefreshCw, Rss, Scale, Search,
  Settings, Share2, Shield, Smartphone, Sparkles, Star, Store, Ticket, Timer, Trash2, Truck, Users, Wallet, Workflow, type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  bell: Bell, brain: Brain, building: Building2, calendar: CalendarDays, car: Car, chart: ChartLine, coins: Coins, credit: CreditCard, database: Database,
  file: FileText, gift: Gift, globe: Globe, hotel: Hotel, image: Image, key: KeyRound, languages: Languages, layout: LayoutDashboard, link: Link2, lock: Lock,
  mail: Mail, map: Map, megaphone: Megaphone, message: MessageSquare, orbit: Orbit, package: Package, pen: PenLine, percent: Percent, plane: Plane, plug: Plug,
  receipt: Receipt, refresh: RefreshCw, rss: Rss, scale: Scale, search: Search, settings: Settings, share: Share2, shield: Shield, smartphone: Smartphone,
  sparkles: Sparkles, star: Star, store: Store, ticket: Ticket, timer: Timer, trash: Trash2, truck: Truck, users: Users, wallet: Wallet, workflow: Workflow,
};

export function NodeIcon({ name, size, color }: { name?: string; size: number; color: string }) {
  const I = (name && ICONS[name]) || Circle;
  return <I size={size} color={color} strokeWidth={1.7} />;
}
