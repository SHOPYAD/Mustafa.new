"use client";

import React from "react";
import "./nexus-theme.css";

export function NexusReferenceBackdrop() {
  return (
    <div className="nexus-stage pointer-events-none absolute inset-0 z-0">
      <div className="nexus-floor" />
    </div>
  );
}
