"use client";

import { BuilderShell } from "@/components/builder/builder-shell";

/**
 * Dedicated Full-Page Mobile App Visual Studio Editor.
 * Renders the full multi-section visual builder locked to Mobile App mode
 * with interactive smartphone canvas, real Copilot AI chat, and live inspector.
 */
export default function MobileAppEditorPage() {
  return <BuilderShell appMode={true} />;
}
