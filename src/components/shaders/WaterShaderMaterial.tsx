"use client";

import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

// --- Premium Optimized Water Shader Material ---
const WaterShaderMaterialImpl = shaderMaterial(
    {
        uTime: 0,
        uDeepColor: new THREE.Color("#001e36"), // Deep oceanic blue
        uShallowColor: new THREE.Color("#00d2ff"), // Bright tropical teal
        uSkyColor: new THREE.Color("#ffffff"),
        uPlayerPos: new THREE.Vector3(0, 0, 0),
        uInteractionStrength: 0.05,
        uCausticIntensity: 0.4,
        uSunDirection: new THREE.Vector3(1.0, 1.0, 1.0).normalize(),
    },
    // Vertex Shader (WebGL 1.0 Safe)
    `
    uniform float uTime;
    uniform vec3 uPlayerPos;
    uniform float uInteractionStrength;

    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vWaveHeight;
    varying float vInteraction;

    void main() {
        vec3 p = position;
        
        // Simple Sine waves for basic motion instead of expensive Gerstner
        float wave1 = sin(p.x * 2.0 + uTime * 2.0) * 0.05;
        float wave2 = cos(p.z * 3.0 + uTime * 1.5) * 0.03;
        float wave3 = sin((p.x + p.z) * 1.5 - uTime) * 0.02;
        
        float totalWave = wave1 + wave2 + wave3;
        p.y += totalWave;

        // Interaction Ripples
        vec4 worldP = modelMatrix * vec4(p, 1.0);
        float dist = distance(uPlayerPos.xz, worldP.xz);
        float ripple = sin(dist * 10.0 - uTime * 5.0) * exp(-dist * 1.5);
        
        p.y += ripple * uInteractionStrength;
        vInteraction = ripple * exp(-dist * 0.5);

        // Approximate normal manually
        vec3 n = vec3(-cos(p.x * 2.0 + uTime * 2.0) * 0.1, 1.0, -sin(p.z * 3.0 + uTime * 1.5) * 0.09);
        vNormal = normalize(normalMatrix * n);
        
        vWaveHeight = p.y;
        vUv = uv;
        vWorldPosition = worldP.xyz;

        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
    }
    `,
    // Fragment Shader (WebGL 1.0 Safe)
    `
    uniform float uTime;
    uniform vec3 uDeepColor;
    uniform vec3 uShallowColor;
    uniform vec3 uSkyColor;
    uniform vec3 uSunDirection;
    uniform float uCausticIntensity;

    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vWaveHeight;
    varying float vInteraction;

    void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        
        // Basic ripple noise using fract/sin
        vec2 uvScaled = vWorldPosition.xz * 3.0;
        float n = fract(sin(dot(uvScaled + vec2(uTime * 0.2, uTime * 0.1), vec2(12.9898, 78.233))) * 43758.5453);
        
        vec3 pNormal = normalize(vNormal + vec3(n * 0.05, 0.0, n * 0.05));

        // Fresnel
        float fresnel = pow(1.0 - max(0.0, dot(pNormal, viewDir)), 4.0);
        vec3 reflection = mix(uShallowColor, uSkyColor, fresnel);

        // Depth color mix
        float absorption = smoothstep(-0.1, 0.2, vWaveHeight);
        vec3 baseColor = mix(uDeepColor, uShallowColor, absorption);

        // Caustics
        float c = fract(sin(dot(vWorldPosition.xz * 2.0 - vec2(uTime * 0.5, 0.0), vec2(12.9898, 78.233))) * 43758.5453);
        float caustic = c * c * c;
        baseColor += caustic * uCausticIntensity * uShallowColor;

        // User Interaction
        baseColor += vec3(0.5, 0.8, 1.0) * max(0.0, vInteraction);

        // Final Composition
        vec3 color = mix(baseColor, reflection, fresnel * 0.5);
        
        // Specular
        vec3 lightDir = normalize(uSunDirection);
        vec3 halfVec = normalize(lightDir + viewDir);
        float specular = pow(max(0.0, dot(pNormal, halfVec)), 64.0);
        color += specular * 0.5;

        gl_FragColor = vec4(color, 0.85);
    }
    `
);

extend({ WaterShaderMaterial: WaterShaderMaterialImpl });

declare module '@react-three/fiber' {
  interface ThreeElements {
    waterShaderMaterial: any;
  }
}

export { WaterShaderMaterialImpl };
