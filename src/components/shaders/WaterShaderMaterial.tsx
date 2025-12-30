"use client";

import * as THREE from 'three';
import React, { useRef } from 'react';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame, ThreeElements } from '@react-three/fiber';

// 1. Define the Shader Material
const WaterShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uDeepColor: new THREE.Color("#0f242e"), // Deep, desaturated greenish-blue
        uShallowColor: new THREE.Color("#4a7a8c"), // Muted, lighter teal-grey
        uSkyColor: new THREE.Color("#dbe5eb"), // Soft, non-white sky reflection
        uSunDirection: new THREE.Vector3(1.0, 0.4, 0.5).normalize(),
    },
    // Vertex Shader
    `
    uniform float uTime;
    
    varying vec3 vPos;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vWaveHeight;

    // Gerstner Wave Calculation for Physical Motion
    // Returns (x, y, z) displacement
    vec3 gerstnerWave(vec4 wave, vec3 p, inout vec3 tangent, inout vec3 binormal) {
        float steepness = wave.z; // 0 to 1
        float wavelength = wave.w;
        float k = 2.0 * 3.14159 / wavelength;
        float c = sqrt(9.8 / k);
        vec2 d = normalize(wave.xy);

        // Very slow time factor for "fluid motion"
        float f = k * (dot(d, p.xz) - c * uTime * 0.05);
        float a = steepness / k; // Amplitude

        // Derivatives for normal calculation
        float wa = k * a; // Maximum 1
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
        vec3 gridPoint = position;
        vec3 tangent = vec3(1.0, 0.0, 0.0);
        vec3 binormal = vec3(0.0, 0.0, 1.0);
        vec3 p = gridPoint;

        // Layered Waves:
        // DirX, DirZ, Steepness, Wavelength
        // 1. Swell (Large, slow)
        vec4 waveA = vec4(1.0, 0.2, 0.02, 12.0); 
        // 2. Medium detail (angled)
        vec4 waveB = vec4(0.7, 0.7, 0.03, 5.0);
        // 3. Small ripples (faster, steeper)
        vec4 waveC = vec4(-0.2, 1.0, 0.04, 2.0);

        p += gerstnerWave(waveA, gridPoint, tangent, binormal);
        p += gerstnerWave(waveB, gridPoint, tangent, binormal);
        p += gerstnerWave(waveC, gridPoint, tangent, binormal);

        vec3 normal = normalize(cross(binormal, tangent));
        vNormal = normal;
        vPos = p;
        vWaveHeight = p.y;
        vUv = uv;

        vec4 worldPosition = modelMatrix * vec4(p, 1.0);
        vWorldPosition = worldPosition.xyz;

        gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
    `,
    // Fragment Shader
    `
    // Inputs
    uniform vec3 uDeepColor;
    uniform vec3 uShallowColor;
    uniform vec3 uSkyColor;
    uniform vec3 uSunDirection;
    uniform float uTime;

    varying vec3 vPos;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying float vWaveHeight;
    varying vec2 vUv;

    // Pseudo-random noise
    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    // Gradient Noise 3D for micro-surface detail
    // (Inlined for performance)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
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
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
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
        
        // --- 1. Normal Perturbation ---
        // Combine low-res geometric normal (Gerstner) with high-res procedural noise
        // This simulates micro-ripples without high poly count
        float noiseScale = 5.0;
        float noiseSpeed = 0.1;
        
        // Two layers of noise moving in opposite directions
        float n1 = snoise(vec3(vWorldPosition.xz * noiseScale + uTime * noiseSpeed, uTime * 0.1));
        float n2 = snoise(vec3(vWorldPosition.xz * noiseScale * 2.0 - uTime * noiseSpeed, uTime * 0.1));
        
        // Perturb the geometric normal
        vec3 normal = normalize(vNormal + vec3(n1 + n2) * 0.08); // Keep perturbation subtle (0.08)

        // --- 2. Color Mixing (Absorption) ---
        // Base absorption: darker when looking straight down (normal facing view), 
        // lighter at glancing angles (more light scattering path).
        // Also use wave height for subtle "SSS" feel in peaks.
        float facing = dot(viewDir, normal); // 1.0 = looking straight down, 0.0 = glancing
        
        // Interpolate between deep and shallow based on facing ratio + wave height variability
        float mixFactor = smoothstep(0.2, 1.0, facing); 
        vec3 baseColor = mix(uShallowColor, uDeepColor, mixFactor);
        
        // Add subtle variation from wave height (tips are lighter aka SSS)
        baseColor = mix(baseColor, uShallowColor * 1.2, smoothstep(0.0, 0.15, vWaveHeight) * 0.3);


        // --- 3. Specular / Reflection (PBR-ish) ---
        vec3 lightDir = normalize(uSunDirection);
        vec3 halfVec = normalize(lightDir + viewDir);

        // Blinn-Phong Specular
        float NdotH = max(0.0, dot(normal, halfVec));
        
        // Roughness variation: Break up the highlight using noise
        float roughness = 0.3 + (n1 * 0.5 + 0.5) * 0.2; // 0.3 to 0.5 roughness
        float specularExponent = 2.0 / (roughness * roughness * roughness * roughness) - 2.0;
        specularExponent = clamp(specularExponent, 10.0, 200.0); // Clamp to avoid infinite/zero
        
        float specular = pow(NdotH, specularExponent);
        
        // Energy conservation approximate: rougher = dimmer
        float specularIntensity = 1.0 / (roughness * 50.0);
        
        // Clamp heavily to avoid "blown out" white
        specular = min(specular * specularIntensity * 2.0, 0.6); 


        // --- 4. Fresnel Reflection ---
        // Schlick's approximation
        float F0 = 0.02; // Water is non-metallic, F0 is low (~0.02)
        float fresnel = F0 + (1.0 - F0) * pow(1.0 - clamp(dot(viewDir, normal), 0.0, 1.0), 5.0);
        
        // Reduce Fresnel power slightly to avoid "chrome" look
        fresnel *= 0.8;

        // Reflection color: Mix Sky color with ambient
        vec3 reflectionColor = uSkyColor;


        // --- 5. Final Composition ---
        // Diffuse (base) + Specular + Reflection
        vec3 finalColor = baseColor;
        
        // Add Specular (Sun)
        finalColor += vec3(1.0, 0.95, 0.8) * specular; 
        
        // Add Reflection (Sky)
        // Only valid for upper hemisphere
        if (normal.y > 0.0) {
            finalColor = mix(finalColor, reflectionColor, fresnel);
        }

        // --- 6. Opacity ---
        // More opaque at glancing angles (Fresnel), more transparent looking down
        // But keep water mostly transparent-ish to see through users legs/pool tiles
        float alpha = 0.5 + fresnel * 0.5;
        
        // No gamma correction needed in R3F usually (handled by canvas), but clamping safety
        gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), clamp(alpha, 0.0, 1.0));
    }
    `
);

// 2. Extend/Register it
extend({ WaterShaderMaterial });

// 3. Declare Type for TS
declare module '@react-three/fiber' {
    interface ThreeElements {
        waterShaderMaterial: any;
    }
}

// 4. Create the Component
interface WaterPoolProps {
    geometry: THREE.BufferGeometry;
    [key: string]: any;
}

export function WaterPool({ geometry, ...props }: WaterPoolProps) {
    const materialRef = useRef<any>(null);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
        }
    });

    return (
        <group {...props}>
            <mesh
                geometry={geometry}
                receiveShadow
            >
                <waterShaderMaterial
                    ref={materialRef}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}
