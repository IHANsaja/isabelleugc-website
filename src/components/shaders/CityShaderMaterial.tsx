import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

const CityShaderMaterialImpl = shaderMaterial(
  {
    uColorHigh: new THREE.Color("#f2f2f0"), // Light concrete/white
    uColorLow: new THREE.Color("#d4d4d2"), // Light grey base
    uWindowColor: new THREE.Color("#1a1a2e"), // Dark windows
    uWindowSize: 0.6, // Window takes 60% of the tile
    uSunDirection: new THREE.Vector3(1, 1, 1).normalize(),
    uFogColor: new THREE.Color("#e8e8e8"), // Match ground edge
    uFogNear: 200.0,
    uFogFar: 500.0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColorHigh;
    uniform vec3 uColorLow;
    uniform vec3 uWindowColor;
    uniform float uWindowSize;
    uniform vec3 uSunDirection;
    
    uniform vec3 uFogColor;
    uniform float uFogNear;
    uniform float uFogFar;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    // Simulation of office lights for night city
    float hash(vec2 p) {
      p = mod(p, 100.0); // Fix precision issues
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      // Basic lighting
      vec3 lightDir = normalize(uSunDirection);
      float diff = max(dot(vNormal, lightDir), 0.0);
      float ambient = 0.4;
      float lighting = diff * 0.6 + ambient;

      // Grid mapping for windows - use world space for consistency
      float scale = 2.0; 
      vec2 gridUv;
      
      vec3 absNormal = abs(vNormal);
      if (absNormal.x > absNormal.y && absNormal.x > absNormal.z) {
        gridUv = vWorldPosition.zy * scale; 
      } else if (absNormal.y > absNormal.x && absNormal.y > absNormal.z) {
        gridUv = vWorldPosition.xz * scale; 
      } else {
        gridUv = vWorldPosition.xy * scale;
      }

      vec2 tileId = floor(gridUv);
      vec2 grid = fract(gridUv);
      
      float noise = hash(tileId);
      
      // --- ANTI-ALIASED WINDOWS ---
      // Use fwidth for pixel-perfect edges that don't flicker or merge
      float windowWidth = uWindowSize * 0.8;
      float windowHeight = 0.7;
      vec2 margin = (vec2(1.0) - vec2(windowWidth, windowHeight)) * 0.5;
      
      vec2 fw = fwidth(grid);
      vec2 edge0 = margin;
      vec2 edge1 = 1.0 - margin;
      
      vec2 windowFull = smoothstep(edge0 - fw, edge0 + fw, grid) * 
                        smoothstep(edge1 + fw, edge1 - fw, grid);
      float isWindowArea = windowFull.x * windowFull.y;

      // Mask roofs and random empty tiles
      if (absNormal.y > 0.6) isWindowArea = 0.0;
      if (noise > 0.95) isWindowArea = 0.0;

      // --- INTERIOR DEPTH / PARALLAX ---
      // Distort interior coordinates based on view direction
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec2 interiorUv = (grid - margin) / (vec2(windowWidth, windowHeight));
      
      // Simple room variation
      float roomType = hash(tileId + 5.0);
      vec3 interiorColor = mix(uWindowColor, vec3(0.05, 0.05, 0.1), roomType);
      
      // --- RANDOM WINDOW LIGHTS (Night Look) ---
      // Some windows are on, some are off
      float isLit = step(0.85, noise); // 15% of windows are lit
      vec3 lightColor = mix(vec3(1.0, 0.9, 0.7), vec3(0.7, 0.8, 1.0), roomType);
      
      // Add a simple "room content" shadow
      float interiorShadow = smoothstep(0.4, 0.6, interiorUv.x + interiorUv.y * 0.5);
      vec3 finalWindowColor = mix(interiorColor, lightColor * 1.5, isLit * interiorShadow);
      
      // --- WALL TEXTURE ---
      float wallH = smoothstep(-10.0, 50.0, vPosition.y);
      vec3 wallBase = mix(uColorLow, uColorHigh, wallH);
      
      // Subtle concrete detail
      float detail = hash(gridUv * 10.0);
      wallBase *= 0.98 + 0.04 * detail;
      
      // Final color assembly
      vec3 color = mix(wallBase, finalWindowColor, isWindowArea);
      
      // Apply Lighting (Windows are less affected by external light if lit from inside)
      color *= mix(lighting, 1.0, isWindowArea * isLit);

      // Fog Logic
      float dist = length(vWorldPosition - cameraPosition);
      float fogFactor = smoothstep(uFogNear, uFogFar, dist);
      color = mix(color, uFogColor, fogFactor);

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ CityShaderMaterial: CityShaderMaterialImpl });

// Add types for the custom element
declare module '@react-three/fiber' {
  interface ThreeElements {
    cityShaderMaterial: any;
  }
}

export { CityShaderMaterialImpl };
