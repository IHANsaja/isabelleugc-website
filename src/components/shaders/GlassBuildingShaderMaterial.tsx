import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

const GlassBuildingShaderMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uWallColor: new THREE.Color("#e8e4dc"), // Cream/white to match penthouse
    uWindowColor: new THREE.Color("#1a1f28"), // Dark blue-gray glass
    uFrameColor: new THREE.Color("#2a2a2a"), // Dark frame
    uFloorHeight: 2.8,
    uWindowScale: 0.8,
    uSunDirection: new THREE.Vector3(0.5, 0.8, 0.3).normalize(),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying vec3 vViewDir;
    varying vec3 vTangent;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vViewDir = normalize(cameraPosition - vWorldPosition);
      
      // Calculate tangent for proper UV mapping
      vec3 absNorm = abs(vNormal);
      if (absNorm.x > absNorm.y && absNorm.x > absNorm.z) {
        vTangent = vec3(0.0, 0.0, 1.0);
      } else if (absNorm.y > absNorm.z) {
        vTangent = vec3(1.0, 0.0, 0.0);
      } else {
        vTangent = vec3(1.0, 0.0, 0.0);
      }

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uWallColor;
    uniform vec3 uWindowColor;
    uniform vec3 uFrameColor;
    uniform float uFloorHeight;
    uniform float uWindowScale;
    uniform vec3 uSunDirection;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying vec3 vViewDir;
    varying vec3 vTangent;

    // High quality hash
    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
    
    // Smooth noise for textures
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // Anti-aliased box
    float boxAA(vec2 p, vec2 b) {
      vec2 d = abs(p) - b;
      vec2 fw = fwidth(p);
      return 1.0 - smoothstep(-fw.x, fw.x, d.x) * smoothstep(-fw.y, fw.y, d.y);
    }

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewDir);
      vec3 absNormal = abs(normal);
      
      // Skip if facing up/down (roof/floor)
      bool isVertical = absNormal.y > 0.8;
      
      // --- UV CALCULATION ---
      vec2 wallUV;
      if (absNormal.x > absNormal.z) {
        wallUV = vec2(vWorldPosition.z, vWorldPosition.y);
      } else {
        wallUV = vec2(vWorldPosition.x, vWorldPosition.y);
      }
      
      // Floor and window grid
      float floorY = wallUV.y / uFloorHeight;
      float floorId = floor(floorY);
      float floorFrac = fract(floorY);
      
      float windowX = wallUV.x * uWindowScale;
      float windowId = floor(windowX);
      float windowFrac = fract(windowX);
      
      vec2 tileId = vec2(windowId, floorId);
      
      // --- WINDOW GEOMETRY ---
      float frameTop = 0.12;
      float frameBottom = 0.18;
      float frameSide = 0.08;
      float dividerH = 0.02;
      float dividerV = 0.015;
      
      // Window bounds
      float inWindowV = step(frameBottom, floorFrac) * step(floorFrac, 1.0 - frameTop);
      float inWindowH = step(frameSide, windowFrac) * step(windowFrac, 1.0 - frameSide);
      float inWindow = inWindowV * inWindowH;
      
      // Horizontal divider (mid-height)
      float midH = 0.55;
      float hDiv = smoothstep(dividerH, 0.0, abs(floorFrac - midH));
      
      // Vertical dividers
      float vDiv = smoothstep(dividerV, 0.0, abs(windowFrac - 0.5));
      
      float frameMask = max(hDiv, vDiv) * inWindow;
      
      if (isVertical) {
        inWindow = 0.0;
        frameMask = 0.0;
      }
      
      // --- INTERIOR (Parallax) ---
      float roomDepth = 0.4;
      vec2 roomUV = vec2(
        (windowFrac - frameSide) / (1.0 - 2.0 * frameSide),
        (floorFrac - frameBottom) / (1.0 - frameBottom - frameTop)
      );
      
      // Parallax offset
      vec3 viewTangent = normalize(viewDir - normal * dot(viewDir, normal));
      vec2 parallax = vec2(
        dot(viewTangent, vTangent),
        viewDir.y
      ) * roomDepth;
      
      vec2 interiorUV = roomUV + parallax * 0.3;
      
      // Room features
      float floorPlane = smoothstep(0.02, 0.0, interiorUV.y);
      float ceilingPlane = smoothstep(0.98, 1.0, interiorUV.y);
      float backWall = smoothstep(0.6, 1.0, length(parallax));
      
      // Furniture hints
      float furniture = step(0.85, hash(tileId + 7.0)) * step(interiorUV.y, 0.25) * step(0.2, interiorUV.x) * step(interiorUV.x, 0.8);
      
      // --- LIGHTING ---
      float roomRand = hash(tileId);
      float isLit = step(0.55, roomRand);
      
      // Time-based flickering for some rooms
      float flicker = 1.0 + 0.05 * sin(uTime * 2.0 + roomRand * 100.0) * step(0.9, roomRand);
      
      vec3 warmLight = vec3(1.0, 0.85, 0.6);
      vec3 coolLight = vec3(0.7, 0.8, 1.0);
      vec3 interiorColor = mix(warmLight, coolLight, step(0.5, hash(tileId + 3.0)));
      
      float lightIntensity = (0.3 + 0.7 * hash(tileId + 5.0)) * flicker;
      interiorColor *= lightIntensity;
      
      // Add depth shading
      float roomAO = 1.0 - backWall * 0.5 - furniture * 0.3;
      vec3 roomFinal = mix(vec3(0.02), interiorColor, isLit) * roomAO;
      
      // --- GLASS ---
      vec3 reflectDir = reflect(-viewDir, normal);
      float dotNV = max(dot(normal, viewDir), 0.0);
      float fresnel = pow(1.0 - dotNV, 4.0);
      
      // Environment reflection (fake HDR-like)
      float skyH = reflectDir.y * 0.5 + 0.5;
      vec3 envColor = mix(
        vec3(0.02, 0.03, 0.05),
        vec3(0.08, 0.12, 0.2),
        skyH
      );
      
      // Sun reflection
      float sunSpec = pow(max(dot(reflectDir, normalize(uSunDirection)), 0.0), 512.0);
      envColor += vec3(1.0, 0.95, 0.9) * sunSpec * 3.0;
      
      vec3 glassFinal = mix(roomFinal, envColor, fresnel * 0.6);
      glassFinal = mix(glassFinal, uWindowColor, 0.3); // Tint
      
      // --- WALL / FRAME ---
      float diff = max(dot(normal, normalize(uSunDirection)), 0.0);
      float ambient = 0.4;
      float lighting = diff * 0.6 + ambient;
      
      // Concrete texture
      float tex = noise(wallUV * 30.0) * 0.08;
      vec3 wallFinal = uWallColor * lighting * (1.0 - tex);
      
      // Ambient occlusion near windows
      float aoWindow = smoothstep(0.0, 0.1, abs(floorFrac - frameBottom)) * 
                       smoothstep(0.0, 0.1, abs(floorFrac - (1.0 - frameTop)));
      wallFinal *= 0.7 + 0.3 * aoWindow;
      
      // Frame color
      vec3 frameFinal = uFrameColor * (lighting * 0.8);
      
      // --- COMPOSITE ---
      vec3 color = wallFinal;
      color = mix(color, glassFinal, inWindow * (1.0 - frameMask));
      color = mix(color, frameFinal, frameMask);
      
      // Floor slab lines
      float slabLine = smoothstep(0.015, 0.0, floorFrac) + smoothstep(0.985, 1.0, floorFrac);
      color = mix(color, uFrameColor * 0.3, slabLine * (1.0 - float(isVertical)));

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

const GlassBuildingShaderMaterial = GlassBuildingShaderMaterialImpl;
extend({ GlassBuildingShaderMaterial });

// Add types for the custom element
declare module '@react-three/fiber' {
  interface ThreeElements {
    glassBuildingShaderMaterial: any;
  }
}

export { GlassBuildingShaderMaterial };
