"use client";

import * as THREE from 'three';
import React, { useRef, useMemo } from 'react';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame, ThreeElements } from '@react-three/fiber';

// --- Premium Water Shader Material ---
const WaterShaderMaterial = shaderMaterial(
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
    // Vertex Shader
    `
    uniform float uTime;
    uniform vec3 uPlayerPos;
    uniform float uInteractionStrength;

    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vWaveHeight;
    varying float vInteraction;

    // Gerstner Wave for realistic surface motion (Modified to accept time)
    vec3 gerstner(vec4 wave, vec3 p, inout vec3 tangent, inout vec3 binormal, float time) {
        float steepness = wave.z;
        float wavelength = wave.w;
        float k = 2.0 * 3.14159 / wavelength;
        float c = sqrt(9.81 / k);
        vec2 d = normalize(wave.xy);
        float f = k * (dot(d, p.xz) - c * time);
        float a = steepness / k;

        float s = sin(f);
        float c_w = cos(f);

        tangent += vec3(
            -d.x * d.x * (steepness * s),
            d.x * (steepness * c_w),
            -d.x * d.y * (steepness * s)
        );
        binormal += vec3(
            -d.x * d.y * (steepness * s),
            d.y * (steepness * c_w),
            -d.y * d.y * (steepness * s)
        );

        return vec3(
            d.x * (a * c_w),
            a * s,
            d.y * (a * c_w)
        );
    }

    void main() {
        vec3 p = position;
        vec3 tangent = vec3(1.0, 0.0, 0.0);
        vec3 binormal = vec3(0.0, 0.0, 1.0);

        // Layered Gerstner Waves (Calmer for a pool)
        float timeScale = uTime * 0.5; 
        
        // Small, subtle ripples instead of ocean waves
        // DirX, DirZ, Steepness (0..1), Wavelength
        p += gerstner(vec4(1.0, 0.1, 0.02, 8.0), position, tangent, binormal, timeScale);
        p += gerstner(vec4(0.1, 1.0, 0.03, 4.0), position, tangent, binormal, timeScale);
        p += gerstner(vec4(1.1, 0.7, 0.02, 2.0), position, tangent, binormal, timeScale);

        // Interaction Ripples
        float dist = distance(uPlayerPos.xz, (modelMatrix * vec4(position, 1.0)).xz);
        float ripple = sin(dist * 10.0 - uTime * 5.0) * exp(-dist * 1.5);
        p.y += ripple * uInteractionStrength;
        vInteraction = ripple * exp(-dist * 0.5);

        vec3 normal = normalize(cross(binormal, tangent));
        vNormal = normal;
        vWaveHeight = p.y;
        vUv = uv;

        vec4 worldPos = modelMatrix * vec4(p, 1.0);
        vWorldPosition = worldPos.xyz;

        gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
    `,
    // Fragment Shader
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

    // Simplex Noise for procedural detail
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + vec4(1.0)) * x); }
    vec4 taylorInvSqrt(vec4 r) { return vec4(1.79284291400159) - vec4(0.85373472095314) * r; }
    float snoise(vec3 v) {
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute( permute( permute( 
                  vec4(i.z) + vec4(0.0, i1.z, i2.z, 1.0 ))
                + vec4(i.y) + vec4(0.0, i1.y, i2.y, 1.0 )) 
                + vec4(i.x) + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - vec4(49.0) * floor(p * vec4(ns.z * ns.z));
        vec4 x_ = floor(j * vec4(ns.z));
        vec4 y_ = floor(j - vec4(7.0) * x_ );
        vec4 x = x_ * vec4(ns.x) + ns.yyyy;
        vec4 y = y_ * vec4(ns.x) + ns.yyyy;
        vec4 h = vec4(1.0) - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        
        // 1. Procedural Normals (Micro-ripples)
        float noise = snoise(vec3(vWorldPosition.xz * 4.0 + vec2(uTime * 0.2), uTime * 0.1));
        vec3 normal = normalize(vNormal + vec3(noise * 0.1));

        // 2. Fresnel & Reflections
        float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 5.0);
        vec3 reflection = mix(uShallowColor, uSkyColor, fresnel);

        // 3. Depth-Aware Color
        // Simulate absorption: peaks are lighter, valleys are darker
        float absorption = smoothstep(-0.2, 0.5, vWaveHeight);
        vec3 baseColor = mix(uDeepColor, uShallowColor, absorption);

        // 4. Procedural Caustics
        float caustic = snoise(vec3(vWorldPosition.xz * 2.0 - vec2(uTime * 0.5), uTime * 0.2)) * 0.5 + 0.5;
        caustic = pow(caustic, 4.0);
        baseColor += caustic * uCausticIntensity * uShallowColor;

        // 5. User Interaction Highlight
        baseColor += vec3(0.5, 0.8, 1.0) * max(0.0, vInteraction) * 0.5;

        // 6. Final Composition
        vec3 color = mix(baseColor, reflection, fresnel * 0.7);
        
        // Specular highlight
        vec3 lightDir = normalize(uSunDirection);
        vec3 halfVec = normalize(lightDir + viewDir);
        float specular = pow(max(0.0, dot(normal, halfVec)), 128.0);
        color += specular * 0.8;

        gl_FragColor = vec4(color, 0.8);
    }
    `
);

extend({ WaterShaderMaterial });

declare module '@react-three/fiber' {
    interface ThreeElements {
        waterShaderMaterial: any;
    }
}

interface WaterPoolProps {
    geometry: THREE.BufferGeometry;
    playerRigidBodyRef?: React.RefObject<any>;
    [key: string]: any;
}

export function WaterPool({ geometry, playerRigidBodyRef, ...props }: WaterPoolProps) {
    const materialRef = useRef<any>(null);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
            
            if (playerRigidBodyRef?.current) {
                const pos = playerRigidBodyRef.current.translation();
                materialRef.current.uPlayerPos.set(pos.x, pos.y, pos.z);
            }
        }
    });

    return (
        <group {...props}>
            <mesh geometry={geometry} receiveShadow>
                <waterShaderMaterial
                    ref={materialRef}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}
