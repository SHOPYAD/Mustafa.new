// ============================================================================
// JARVIS HOLOGRAPHIC AVATAR - MASTER PROCEDURAL SHADER ARCHITECTURE (PRO-MAX)
// Exact mathematical reproduction of the Master 16:9 Reference Image
// ============================================================================

export const COMMON_NOISE_GLSL = `
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * 0.0243902439) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

// ----------------------------------------------------------------------------
// 1. ANATOMICAL HUMAN BUST SCANLINE SHADER (Continuous razor-sharp lines)
// ----------------------------------------------------------------------------
export const AnatomicalBustShader = {
  vertexShader: `
    ${COMMON_NOISE_GLSL}
    attribute float aEdgeFactor; // 0.0 at center, 1.0 at outer silhouette
    attribute float aLineId;
    attribute float aIsShoulder; // 0.0 for head/neck, 1.0 for shoulders
    attribute float aAmberWeight;// Pre-calculated proximity to amber core

    uniform float uTime;
    uniform float uVoiceLevel;
    uniform float uUserAudioLevel;
    uniform float uThinkingIntensity;
    uniform int uState;

    varying float vEdgeFactor;
    varying float vLineId;
    varying float vIsShoulder;
    varying float vAmberWeight;
    varying vec3 vWorldPos;

    void main() {
      vEdgeFactor = aEdgeFactor;
      vLineId = aLineId;
      vIsShoulder = aIsShoulder;
      vAmberWeight = aAmberWeight;

      vec3 pos = position;

      // 1. Horizontal waveform ripple through face scanlines during speech
      if (aIsShoulder < 0.5 && aAmberWeight > 0.05) {
        float wave = sin(pos.x * 0.85 - uTime * 8.0 + aLineId * 0.25);
        float audioPulse = wave * (uVoiceLevel * 0.85 + uUserAudioLevel * 0.5) * aAmberWeight;
        pos.z += audioPulse * 0.65;
      }

      // 2. Gentle breathing cycle in shoulders
      if (aIsShoulder > 0.5) {
        pos.y += sin(uTime * 0.85 + pos.x * 0.03) * 0.25;
      }

      // 3. Subtle neural scan motion during thinking
      if (uState == 2 && aIsShoulder < 0.5) {
        float thinkScan = sin(aLineId * 0.35 - uTime * 3.5) * uThinkingIntensity * 0.3;
        pos.y += thinkScan;
      }

      vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
      vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPos;

      // Calibrated point size: crisp razor-sharp lines with visible dark gaps
      float baseSize = mix(1.75, 1.5, aIsShoulder);
      gl_PointSize = (baseSize + aEdgeFactor * 0.75 + aAmberWeight * 0.45) * (115.0 / -mvPos.z);
    }
  `,

  fragmentShader: `
    uniform vec3 uColorCyanEdge;   // #36F2FF
    uniform vec3 uColorCyanBody;   // #00BDEB
    uniform vec3 uColorCyanDark;   // #003852
    uniform vec3 uColorAmberCore;  // #FF7A00
    uniform vec3 uColorAmberHot;   // #FFB800
    uniform float uTime;
    uniform float uVoiceLevel;
    uniform float uUserAudioLevel;
    uniform int uState;

    varying float vEdgeFactor;
    varying float vLineId;
    varying float vIsShoulder;
    varying float vAmberWeight;
    varying vec3 vWorldPos;

    void main() {
      // Circular point sprite with clean antialiased edge
      vec2 c = gl_PointCoord - vec2(0.5);
      float d = length(c);
      if (d > 0.5) discard;
      float pointAlpha = smoothstep(0.5, 0.08, d);

      // 1. Holographic Cyan Gradient:
      // Translucent cyan interior, intensifying to bright electric cyan at tangent silhouette edge
      vec3 cyanCol = mix(uColorCyanDark, uColorCyanBody, pow(vEdgeFactor, 0.9));
      cyanCol = mix(cyanCol, uColorCyanEdge, pow(vEdgeFactor, 1.75));

      // 2. Amber Core Color Shift:
      // Front scanlines in face turn to incandescent warm amber/gold
      float audioReactive = uVoiceLevel * 1.1 + uUserAudioLevel * 0.5;
      vec3 amberCol = mix(uColorAmberCore, uColorAmberHot, clamp(vAmberWeight * 1.15 + audioReactive * 0.4, 0.0, 1.0));

      // Oscilloscope wave ripple across face scanlines
      float waveHarmonics = 0.9 + 0.2 * sin(vWorldPos.y * 3.5 - uTime * 5.0);
      amberCol *= waveHarmonics;

      // Blend cyan with warm amber in the face core
      // Tangent silhouette rim always preserves electric cyan
      float faceBlend = vAmberWeight * (1.0 - pow(vEdgeFactor, 2.2) * 0.7);
      vec3 finalCol = mix(cyanCol, amberCol, faceBlend * 0.92);

      // 3. Shoulder Attenuation:
      // Shoulders have softer, elegant luminance so they frame the head
      if (vIsShoulder > 0.5) {
        finalCol *= 0.65;
      }

      // 4. Tangent Silhouette Rim Boost (Holographic Fresnel)
      float edgeGlow = 0.88 + pow(vEdgeFactor, 1.7) * 0.85;
      finalCol *= edgeGlow;

      // 5. Clamped output to prevent bloom blowout
      finalCol = clamp(finalCol, 0.0, 1.1);

      gl_FragColor = vec4(finalCol, pointAlpha * 0.92);
    }
  `,
};

// ----------------------------------------------------------------------------
// 2. INCANDESCENT AMBER CORE GLOW (Inside lower face, rich warm gradient)
// ----------------------------------------------------------------------------
export const SoftAmberBackdropShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main() {
      vUv = uv;
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float uTime;
    uniform float uVoiceLevel;
    uniform float uUserAudioLevel;
    varying vec2 vUv;
    varying vec3 vWorldPos;

    void main() {
      vec2 p = (vUv - vec2(0.5)) * 2.0;

      // Elliptical falloff in lower face
      float r = length(vec2(p.x * 1.75, (p.y - 0.05) * 1.35));
      float glow = exp(-r * 2.5);

      if (glow < 0.008) discard;

      // Horizontal wave ripples matching speech
      float waves = 1.0 + 0.22 * sin(p.y * 12.0 - uTime * 5.0);
      float audio = 0.5 + (uVoiceLevel * 1.3 + uUserAudioLevel * 0.65) * 0.5;

      // Fiery amber (#FF5500) to incandescent gold center (#FFA800)
      vec3 colEdge = vec3(1.0, 0.35, 0.02);
      vec3 colCenter = vec3(1.0, 0.68, 0.1);
      vec3 col = mix(colEdge, colCenter, clamp(glow * 1.3, 0.0, 1.0));

      col = clamp(col * (0.95 + audio * 0.3), 0.0, 1.05);
      float alpha = clamp(glow * audio * waves * 0.65, 0.0, 0.7);

      gl_FragColor = vec4(col, alpha);
    }
  `,
};

// ----------------------------------------------------------------------------
// 3. FRACTAL BRANCHING GOLDEN ELECTRICAL LIGHTNING VEIN
// ----------------------------------------------------------------------------
export const BranchingGoldenVeinShader = {
  vertexShader: `
    attribute float aVeinProgress;
    attribute float aBranchId;
    uniform float uTime;
    uniform float uPulseTime;
    varying float vProgress;
    varying float vBranchId;

    void main() {
      vProgress = aVeinProgress;
      vBranchId = aBranchId;
      vec3 pos = position;

      // Subtle electrical jitter
      float jitter = sin(pos.y * 22.0 + uTime * 18.0) * 0.06;
      pos.x += jitter;

      vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPos;
      gl_PointSize = (2.2 + sin(vProgress * 6.0) * 0.5) * (120.0 / -mvPos.z);
    }
  `,

  fragmentShader: `
    uniform vec3 uColorGold;  // #FFD700
    uniform vec3 uColorAmber; // #FFA500
    uniform float uTime;
    uniform float uPulseTime;

    varying float vProgress;
    varying float vBranchId;

    void main() {
      vec2 c = gl_PointCoord - vec2(0.5);
      float d = length(c);
      if (d > 0.5) discard;

      // Electrical surges traveling up the tree
      float pulse1 = exp(-pow((vProgress - fract(uTime * 1.15)) * 7.5, 2.0));
      float pulse2 = exp(-pow((vProgress - fract(uTime * 0.68 + 0.4)) * 9.0, 2.0));
      float sentencePulse = exp(-pow((vProgress - uPulseTime) * 3.5, 2.0));

      float brightness = 0.9 + pulse1 * 0.85 + pulse2 * 0.65 + sentencePulse * 1.2;
      vec3 col = mix(uColorGold, uColorAmber, vProgress * 0.35);

      col = clamp(col * brightness, 0.0, 1.15);

      gl_FragColor = vec4(col, smoothstep(0.5, 0.08, d) * 0.95);
    }
  `,
};

// ----------------------------------------------------------------------------
// 4. DISTANT DATA MOUNTAIN TERRAIN (Dense Cyan Ridges & Golden Lightning Veins)
// ----------------------------------------------------------------------------
export const DistantMountainParticleShader = {
  vertexShader: `
    ${COMMON_NOISE_GLSL}
    attribute float aIsGoldVein;
    attribute float aElevationNorm;

    uniform float uTime;
    uniform float uThinkingIntensity;
    varying float vIsGold;
    varying float vDepthFade;
    varying float vElevation;

    void main() {
      vIsGold = aIsGoldVein;
      vElevation = aElevationNorm;

      vec3 pos = position;

      // Gentle undulating mountain wave
      pos.y += sin(pos.x * 0.045 + uTime * 0.35 + pos.z * 0.02) * 1.2;

      vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPos;

      vDepthFade = smoothstep(-240.0, -40.0, mvPos.z);
      float ptSize = mix(1.8, 2.4, aIsGoldVein);
      gl_PointSize = ptSize * (125.0 / -mvPos.z);
    }
  `,

  fragmentShader: `
    uniform vec3 uColorCyan;    // #00D9FF
    uniform vec3 uColorCyanDark;// #004566
    uniform vec3 uColorGold;    // #FFB800
    uniform vec3 uColorGoldHot; // #FFD700
    uniform float uTime;

    varying float vIsGold;
    varying float vDepthFade;
    varying float vElevation;

    void main() {
      vec2 c = gl_PointCoord - vec2(0.5);
      float d = length(c);
      if (d > 0.5) discard;

      // Cyan ridge peaks vs deep slopes
      vec3 ridgeCol = mix(uColorCyanDark, uColorCyan, vElevation);

      // Golden lightning streams in the valleys
      float goldPulse = 0.88 + 0.32 * sin(uTime * 2.2 + vElevation * 10.0);
      vec3 goldCol = mix(uColorGold, uColorGoldHot, goldPulse * 0.6) * (1.1 * goldPulse);

      vec3 col = mix(ridgeCol, goldCol, vIsGold);
      col = clamp(col, 0.0, 1.15);

      float alpha = smoothstep(0.5, 0.06, d) * vDepthFade * (0.7 + vIsGold * 0.28);
      gl_FragColor = vec4(col, alpha);
    }
  `,
};

// ----------------------------------------------------------------------------
// 5. CROWN DUST SPARK SHADER
// ----------------------------------------------------------------------------
export const CrownDustSparkShader = {
  vertexShader: `
    ${COMMON_NOISE_GLSL}
    attribute float aRandom;
    uniform float uTime;
    uniform float uThinkingIntensity;
    varying float vAlpha;
    varying vec3 vColor;

    void main() {
      vec3 pos = position;

      float speed = 1.0 + uThinkingIntensity * 2.0;
      float drift = mod(uTime * speed * 1.8 + aRandom * 14.0, 14.0);
      pos.y += drift;

      float ang = uTime * 0.5 + aRandom * 6.28;
      pos.x += cos(ang) * (0.6 + uThinkingIntensity * 1.0);
      pos.z += sin(ang) * (0.6 + uThinkingIntensity * 1.0);

      vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPos;

      vAlpha = (1.0 - drift / 14.0) * smoothstep(0.0, 1.2, drift);
      vColor = (aRandom > 0.8) ? vec3(1.0, 0.76, 0.22) : vec3(0.12, 0.92, 1.0);
      gl_PointSize = (1.5 + uThinkingIntensity * 0.9) * (120.0 / -mvPos.z);
    }
  `,

  fragmentShader: `
    varying float vAlpha;
    varying vec3 vColor;

    void main() {
      vec2 c = gl_PointCoord - vec2(0.5);
      float d = length(c);
      if (d > 0.5) discard;
      gl_FragColor = vec4(vColor, smoothstep(0.5, 0.08, d) * vAlpha * 0.85);
    }
  `,
};
