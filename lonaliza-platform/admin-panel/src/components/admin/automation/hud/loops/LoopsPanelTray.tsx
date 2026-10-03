"use client";

import React from "react";
import { STUDIO_Z } from "@/lib/studio/tokens";

export type LoopsPanelFlags = {
  showNavPanel: boolean;
  showSetupPanel: boolean;
  showNodePalette: boolean;
  inspectorOpen: boolean;
};

type Props = LoopsPanelFlags & {
  onRestoreNav: () => void;
  onRestoreSetup: () => void;
  onRestorePalette: () => void;
  onRestoreInspector: () => void;
};

/** شريط استعادة لوحات الأتمتة فقط — فوق الدock الثابت، مستقل عن شريط المشرف. */
export function LoopsPanelTray({
  showNavPanel,
  showSetupPanel,
  showNodePalette,
  inspectorOpen,
  onRestoreNav,
  onRestoreSetup,
  onRestorePalette,
  onRestoreInspector,
}: Props) {
  const hasClosed = !showNavPanel || !showSetupPanel || !showNodePalette || !inspectorOpen;
  if (!hasClosed) return null;

  const chip =
    "pointer-events-auto rounded-lg border border-cyan-400/45 bg-cyan-950/80 px-2.5 py-0.5 text-[11px] text-cyan-200 hover:border-cyan-300 hover:text-white";

  return (
    <div
      className="pointer-events-none fixed left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-cyan-500/35 bg-[#020d1c]/92 px-3 py-1.5 shadow-[0_0_20px_rgba(0,229,255,0.2)] backdrop-blur-md"
      style={{ bottom: 88, zIndex: STUDIO_Z.tray }}
      dir="rtl"
    >
      <span className="pointer-events-auto text-[11px] font-mono text-cyan-300/90">استعادة اللوحات:</span>
      {!showNavPanel && (
        <button type="button" onClick={onRestoreNav} className={chip}>
          + القطاعات
        </button>
      )}
      {!showSetupPanel && (
        <button type="button" onClick={onRestoreSetup} className={chip}>
          + إعداد الأتمتة
        </button>
      )}
      {!showNodePalette && (
        <button type="button" onClick={onRestorePalette} className={chip}>
          + مكتبة العقد (42)
        </button>
      )}
      {!inspectorOpen && (
        <button type="button" onClick={onRestoreInspector} className={chip}>
          + المفتش
        </button>
      )}
    </div>
  );
}
