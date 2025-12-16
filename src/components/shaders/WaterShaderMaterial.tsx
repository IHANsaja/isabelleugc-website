"use client";

import * as THREE from 'three';
import React, { useRef } from 'react';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame, ThreeElements } from '@react-three/fiber';

// 1. Define the Shader Material
const WaterShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uDepthColor: new THREE.Color("#186691"),
        uSurfaceColor: new THREE.Color("#9bd8ff"),
    },
    // Vertex Shader
    `
    varying float vElevation;
    varying vec3 vPos;
    varying vec2 vUv;

    uniform float uTime;

    // Classic Perlin 3D Noise 
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

        // First corner
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;

        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        //   x0 = x0 - 0.0 + 0.0 * C.xxx;
        //   x1 = x0 - i1  + 1.0 * C.xxx;
        //   x2 = x0 - i2  + 2.0 * C.xxx;
        //   x3 = x0 - 1.0 + 3.0 * C.xxx;
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

        // Permutations
        i = mod289(i); 
        vec4 p = permute( permute( permute( 
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );

        //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
        //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*zzww.zzww ;

        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);

        //Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        // Mix final noise value
        vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                     dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
        vec3 pos = position;
        vUv = uv;

        // More organic wave layers
        float elevation = snoise(vec3(pos.x * 3.0, pos.z * 3.0, uTime * 0.4)) * 0.05;
        elevation -= snoise(vec3(pos.x * 6.0 + uTime, pos.z * 6.0, uTime * 0.5)) * 0.02;

        pos.y += elevation;
        vElevation = elevation;
        vPos = (modelViewMatrix * vec4(pos, 1.0)).xyz; // View space position for logic

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
    `,
    // Fragment Shader
    `
    uniform vec3 uDepthColor;
    uniform vec3 uSurfaceColor;
    
    varying float vElevation;
    varying vec3 vPos;

    void main() {
        // Calculate Face Normal using derivatives (flat shading look per face, but works well for water facets)
        vec3 fdx = dFdx(vPos);
        vec3 fdy = dFdy(vPos);
        vec3 normal = normalize(cross(fdx, fdy));

        // Light setup (simple directional)
        vec3 lightParam = vec3(1.0, 2.0, 0.0); // Fake sun position
        vec3 lightDir = normalize(lightParam); 
        vec3 viewDir = normalize(-vPos); // From fragment to camera in view space

        // 1. Color mixing based on elevation
        float mixStrength = (vElevation + 0.05) * 8.0;
        vec3 color = mix(uDepthColor, uSurfaceColor, clamp(mixStrength, 0.0, 1.0));

        // 2. Specular highlight (Blinn-Phong)
        vec3 halfVector = normalize(lightDir + viewDir);
        float NdotH = max(0.0, dot(normal, halfVector));
        float specular = pow(NdotH, 100.0); // High shininess for wet look
        
        // Add specular to color
        color += vec3(specular) * 0.8;

        // 3. Fresnel-ish effect (lighter at glancing angles) which happens naturally with dFdx normals on curved waves
        // or explicitly:
        float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
        color = mix(color, vec3(1.0), fresnel * 0.3);

        gl_FragColor = vec4(color, 0.9);
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
                {/* 
                  Use the custom material logic. 
                  Attach "material" prop if inside a mesh, or just render it as a child.
                */}
                <waterShaderMaterial
                    ref={materialRef}
                    transparent // Important for water transparency
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}
