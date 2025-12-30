import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

const CloudShaderMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#ffffff"),
    uCloudDensity: 0.7, // Good visibility
    uCloudSpeed: 0.1, // Gentle drift
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uCloudDensity;
    uniform float uCloudSpeed;
    varying vec2 vUv;

    // Fast pseudo-random noise
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    // Value Noise
    float noise(vec2 n) {
        const vec2 d = vec2(0.0, 1.0);
        vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
        return mix(mix(hash(b), hash(b + d.yx), f.x), mix(hash(b + d.xy), hash(b + d.yy), f.x), f.y);
    }

    // FBM with more octaves for detail
    float fbm(vec2 n) {
        float total = 0.0, amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
            total += noise(n) * amplitude;
            n += n * 2.0;
            amplitude *= 0.5;
        }
        return total;
    }

    // Simulation of cloud movement
    void main() {
      // Slow, natural drift
      float time = uTime * uCloudSpeed * 0.1;
      
      // Scale UVs - increased scale for more cloud texturing
      vec2 uv = vUv * 6.0;
      
      // Layer movement
      vec2 move1 = vec2(time * 0.4, time * 0.1); 
      vec2 move2 = vec2(time * 0.2, time * 0.05);

      // FBM layers
      float n1 = fbm(uv + move1);
      float n2 = fbm(uv * 2.0 + move2 + vec2(n1)); // More warping

      float finalNoise = mix(n1, n2, 0.6); // Mix more detail

      // Visibility Thresholds - MUCH wider range to ensure visibility
      // From 0.2 starts fading in, full opaque at 0.7
      float alpha = smoothstep(0.2, 0.7, finalNoise);
      
      // Boost density
      alpha = clamp(alpha * uCloudDensity * 3.0, 0.0, 1.0); 

      // Edges fade - soften the hard square plane edges only
      float distFromCenter = distance(vUv, vec2(0.5));
      // Fade out only at the very edges (0.4 to 0.5)
      alpha *= smoothstep(0.5, 0.4, distFromCenter);

      // Simple fake lighting
      float light = smoothstep(0.4, 0.8, finalNoise);
      vec3 finalColor = mix(uColor * 0.85, uColor, light);

      // Output
      gl_FragColor = vec4(finalColor, alpha * 0.9); // Max 90% opacity
    }
  `
);

extend({ CloudShaderMaterial: CloudShaderMaterialImpl });

declare module '@react-three/fiber' {
  interface ThreeElements {
    cloudShaderMaterial: any;
  }
}

export { CloudShaderMaterialImpl };
