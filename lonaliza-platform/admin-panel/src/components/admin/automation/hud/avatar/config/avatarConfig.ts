// ============================================================================
// JARVIS HOLOGRAPHIC AVATAR - MASTER CONFIGURATION
// ============================================================================

export const AVATAR_CONFIG = {
  // Brand Identity Colors
  colors: {
    cyanElectric: "#00D9FF",      // Electric cyan for head, shoulders, particles
    cyanGlow: "#00F0FF",
    deepBlue: "#003366",          // Deep cyber blue
    backgroundSpace: "#020813",   // Pitch dark cyber void
    amberCore: "#FF8A18",         // Radiant amber core inside the face
    amberGlow: "#FFAA22",
    goldVein: "#FFB020",          // Golden energy vein ascending from chest
    goldVeinAccent: "#FFD700",
    errorRedOrange: "#FF3311",    // Reddish orange for error state (not flat red)
    uncertainDimAmber: "#CC6611", // Dimmed amber for uncertainty
  },

  // Geometric Layers Settings
  geometry: {
    faceScanlineCount: 110,       // 80 - 140 curved horizontal lines forming the face mask
    facePointsPerLine: 72,        // Resolution of each curved scanline
    headHeight: 52,
    headWidth: 34,
    headDepth: 28,
    shoulderWidth: 92,
    chestHeight: 46,
    shoulderLinesCount: 36,       // Concentric curved lines for chest & shoulders
    particlesCount: 2800,         // Particle storm above the head
    backgroundMountainGrid: 90,   // Data mountain terrain resolution
  },

  // Animation Speeds & Dynamics
  timing: {
    idleBreathSpeed: 0.8,
    audioAttackMs: 100,           // 80 - 150ms audio smoothing attack
    audioReleaseMs: 350,          // 250 - 500ms audio smoothing release
    assembleDuration: 2.2,        // Initial assembly from space in seconds
    confidentActionPauseMs: 400,
    recoveryWaveDuration: 1.5,
  },

  // Postprocessing & Bloom Calibration (Never blown-out white!)
  bloom: {
    intensity: 1.35,
    luminanceThreshold: 0.18,
    luminanceSmoothing: 0.85,
    kernelSize: 3,
  },

  vignette: {
    offset: 0.25,
    darkness: 0.75,
  },

  chromaticAberration: {
    offset: [0.0008, 0.0008] as [number, number],
  },
};
