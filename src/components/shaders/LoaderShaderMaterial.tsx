import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend, ReactThreeFiber } from "@react-three/fiber";

const LoaderShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new THREE.Color("#F6F3E8"),
    uColorEnd: new THREE.Color("#EAE7DC"), // Darker cream/goldish
    uMouse: new THREE.Vector2(0, 0),
    uHold: 0, // 0 to 1
    uHoldTime: 0.0,
    uShatter: 0, // 0 to 1
    uGlowFull: 0, // 0 to 1
    solidGlow: new THREE.Color("#FFFFFF") // Bright white for glow
  },
  // Vertex Shader
  `
    attribute vec3 aRandom; // random direction per triangle
    attribute float aDrop; // 1.0 if mesh should drop, 0.0 if fly
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition; // Global Space
    varying vec3 vViewPosition;

    uniform float uShatter;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      // SHATTER LOGIC
      vec3 disp = vec3(0.0);
      float s = uShatter;
      float s2 = s * s;   // Quadratic
      
      if (aDrop > 0.5) {
           // DROP DOWN
           // "go directly down from separating"
           vec3 dropDir = vec3(0.0, -1.0, 0.0);
           // Drop faster and further
           disp = (dropDir * 25.0 + aRandom * 0.5) * s2;
      } else {
           // WIND UP/AWAY (Standard)
           vec3 windDir = vec3(2.0, 1.0, -2.0); 
           vec3 shatterDir = normalize(normal + aRandom); 
           disp = (shatterDir * 3.0 + windDir * 10.0) * s2; 
      }
      
      vec3 pos = position + disp;

      vPosition = pos;
      
      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPos.xyz; // Pass global pos

      vec4 mvPosition = viewMatrix * worldPos;
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    uniform vec2 uMouse;
    uniform float uHold;
    uniform float uHoldTime;
    uniform float uShatter;
    uniform float uGlowFull;
    uniform vec3 solidGlow;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    void main() {
      // Normalization
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // --- FACTORS ---
      
      // 1. Hold Factor (0 to 1)
      float isHolding = smoothstep(0.0, 1.0, uHold);
      
      // 2. Idle Factor
      float idleFactor = 1.0 - smoothstep(0.0, 0.5, isHolding);
      
      // 3. Final Effect Factor (Hold > 10s)
      float finalEffect = smoothstep(10.0, 10.5, uHoldTime);

      // --- VISUALS ---

      // A. Fresnel Base
      float fresnel = dot(normal, viewDir);
      fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
      fresnel = pow(fresnel, 2.0); 

      // B. Scanlines
      // Idle Scan: Multi Sine (Keep Local to allow detail on small parts? No, local y aligns often)
      float scanMulti = sin((vPosition.y * 4.0) - (uTime * 2.0));
      scanMulti = smoothstep(0.4, 0.6, scanMulti); 
      
      // C. Grid / Wireframe
      float gridX = step(0.95, fract(vPosition.x * 2.0));
      float gridY = step(0.95, fract(vPosition.y * 2.0));
      float grid = max(gridX, gridY);

      // D. Mouse Glow
      float dist = distance(vUv, uMouse * 0.5 + 0.5);
      float mouseGlow = 1.0 - smoothstep(0.0, 0.5, dist);


      // E. Camera Direction Scan (Elliptical + Water Dissolve)
      // "Water-like" - Fluid, rippling edges.
      
      float scanSpeed = 0.4;
      float scanZ = 12.0 - fract(uTime * scanSpeed) * 24.0; 
      
      vec3 scanCenter = vec3(0.0, 0.0, scanZ);
      
      // Ellipse Calculation
      // User set to 0.4 recently - preserving this wide shape
      vec3 distVec = vWorldPosition - scanCenter;
      distVec.x *= 0.4; 
      
      // Basic elliptical distance
      float distToScan = length(distVec);
      
      // Water / Ripple Function
      // Using coordinate-based sine waves for fluid motion instead of random static
      float waveFreq = 2.0;
      float waveSpeed = 3.0;
      
      float waterWave = sin(vWorldPosition.x * waveFreq + uTime * waveSpeed) 
                      * cos(vWorldPosition.y * waveFreq + uTime * waveSpeed * 0.8)
                      + sin(vWorldPosition.z * waveFreq * 0.5 + uTime * waveSpeed * 0.5);
      
      // Add wave to distance to ripple the edge
      float distWithWater = distToScan + (waterWave * 0.5); // 0.5 amplitude ripple
      
      float scanRadius = 7.0; 
      float scanEdgeWidth = 1.0; 
      
      // Dissolving Ring
      float scanRing = smoothstep(scanRadius, scanRadius - scanEdgeWidth, distWithWater) 
                     - smoothstep(scanRadius - scanEdgeWidth, scanRadius - scanEdgeWidth * 2.0, distWithWater);
      
      // Highlight the wave peaks on the ring
      scanRing *= (0.8 + 0.4 * waterWave); 
      
      // Inside Volume
      float insideScan = step(distToScan, scanRadius);


      // --- COMBINE ---
      
      // 1. Base Color
      vec3 base = mix(uColorStart, uColorEnd, fresnel);

      // 2. Apply Interaction States
      if (isHolding > 0.5) {
          // HOLD STATE
          // Base: Pure Palette
          base = mix(uColorStart, uColorEnd, fresnel);
          
          // "Too brighter" -> Slight dim to match Idle perceived brightness
          base *= 0.9; 
          
          // Reverting to Light Grid (Same as Idle)
          base += vec3(0.1) * grid; 
          
          // Apply Water Scan Highlight
          if (insideScan > 0.5) {
              base += vec3(0.1); // Reduced ambiance (was 0.15)
          }
          
          // Glowing Ring
          base += vec3(0.6, 0.7, 0.8) * scanRing * 2.0; 

          // Noise
          float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453 + uTime);
          base += noise * 0.05;

      } else {
          // IDLE STATE
          
          // 1. Scanlines
          base *= 0.8 + 0.4 * scanMulti; 
          
          // 2. Grid (Light/Additive)
          base += vec3(0.1) * grid * idleFactor; 
      }

      // Add Mouse Glow
      base += vec3(0.1) * mouseGlow;



      // F. Final Effect: Golden Holographic Ascent (Palette Match + Animation)
      // Triggered after 10s
      
      // 1. Cel Shading (Stepped Lighting)
      float NdotL = dot(normal, vec3(0.5, 0.8, 0.5)); 
      float toon = ceil(NdotL * 3.0) / 3.0; // 3 Bands
      toon = max(toon, 0.3); // Min ambient
      
      // 2. Matched Palette (derived from uniforms)
      // "Match with color palette... recreate effect with more shader animations"
      vec3 finalShadow = uColorEnd * 0.6; // Deep Beige/Gold Shadow
      vec3 finalSun = uColorStart * 1.3;  // Bright Pearl/Cream Highlight
      vec3 finalColor = mix(finalShadow, finalSun, toon);
      
      // 3. Animation: Ascending Shimmer
      // Rising sine bands
      float ascend = sin(vWorldPosition.y * 5.0 - uTime * 3.0);
      ascend = smoothstep(0.0, 1.0, ascend);
      
      // Horizontal Interferece (Hologram feel)
      float hollines = sin(vWorldPosition.y * 50.0 + uTime * 5.0);
      
      // Add Ascension Glow
      finalColor += vec3(0.3, 0.25, 0.1) * ascend * 0.5; // Gold tint shimmer
      
      // Add Sparkle Noise
      float sparkle = fract(sin(dot(vWorldPosition.xy, vec2(12.9898, 78.233))) * 43758.5453 + uTime * 10.0);
      if (sparkle > 0.95) finalColor += vec3(0.5); // Tiny sparkles
      
      // 4. Ink Outline (Adaptive)
      float inkEdge = 1.0 - dot(normal, viewDir); 
      float ink = smoothstep(0.3, 0.35, inkEdge); 
      vec3 inkColor = finalColor * 0.2; // Very dark version of current pixel
      
      // If edge, use ink color, else use final color
      vec3 finalLook = mix(finalColor, inkColor, ink);
      
      // Mix from current Base (Scan) to Final Look based on timer
      base = mix(base, finalLook, finalEffect);
      
      // --- ENDING SEQUENCE: FULL GLOW & SHATTER --- (Override)
      
      if (uGlowFull > 0.0) {
           // Simple mixing toward solid bright color
           base = mix(base, solidGlow, uGlowFull * uGlowFull);
      }
      
      // Fade out broken bits
      if (uShatter > 0.0) {
          float dist = uShatter;
          // Fade alpha or just darken?
          // Let's just fade to white/transparent
          // Discard highly shattered fragments to reduce clutter?
          if (uShatter > 0.95) discard;
      }

      gl_FragColor = vec4(base, 1.0 - uShatter);
    }
  `
);

extend({ LoaderShaderMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      loaderShaderMaterial: ReactThreeFiber.Object3DNode<THREE.ShaderMaterial, typeof LoaderShaderMaterial>;
    }
  }
}

export { LoaderShaderMaterial };
