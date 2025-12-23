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

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      // Basic lighting
      vec3 lightDir = normalize(uSunDirection);
      float diff = max(dot(vNormal, lightDir), 0.0);
      float ambient = 0.65;
      float lighting = diff * 0.5 + ambient;

      // Grid mapping for windows
      float scale = 4.0; 
      vec2 gridUv;
      
      vec3 absNormal = abs(vNormal);
      if (absNormal.x > absNormal.y && absNormal.x > absNormal.z) {
        gridUv = vWorldPosition.zy * scale; 
      } else if (absNormal.y > absNormal.x && absNormal.y > absNormal.z) {
        gridUv = vWorldPosition.xz * scale; 
        // Roof - no windows usually
      } else {
        gridUv = vWorldPosition.xy * scale;
      }

      vec2 tileId = floor(gridUv);
      vec2 grid = fract(gridUv);
      
      float noise = hash(tileId);
      
      // Window logic
      float windowWidth = uWindowSize * 0.8;
      float windowHeight = 0.7; // Taller windows for city look
      
      vec2 margin = (vec2(1.0) - vec2(windowWidth, windowHeight)) * 0.5;
      vec2 windowRect = step(margin, grid) * step(grid, 1.0 - margin);
      float isWindow = windowRect.x * windowRect.y;

      // Mask roofs (strict upward facing check) and random empty tiles
      // Use absolute normal Y for safety, though usually roof is +Y
      if (absNormal.y > 0.6 || noise > 0.8) {
        isWindow = 0.0;
      }

      // Height gradient
      float h = smoothstep(-10.0, 50.0, vPosition.y);
      vec3 wallColor = mix(uColorLow, uColorHigh, h);
      
      // Add slight tile variation
      wallColor *= 0.95 + 0.1 * hash(tileId + 1.0);

      // Mix wall and window
      // For windows, add a slight reflection/tint
      vec3 finalWindowColor = mix(uWindowColor, vec3(0.5, 0.6, 0.7), 0.2); 
      vec3 color = mix(wallColor, finalWindowColor, isWindow);
      
      // Apply Lighting
      color *= lighting;

      // Fog Logic
      float dist = length(vWorldPosition - cameraPosition);
      // COMMENT: uFogNear and uFogFar control when the buildings disappear into the fog.
      // Increase uFogFar (e.g. to 800) to make the city visible at further distances.
      float fogFactor = smoothstep(uFogNear, uFogFar, dist);
      
      // Mix with fog color
      // COMMENT: If the "white out" is too strong, make uFogColor darker or slightly transparent.
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
