import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

const CloudShaderMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#ffffff"),
    uCloudDensity: 0.001,
    uCloudSpeed: 0.1,
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

    // Fractal Brownian Motion for fluffy clouds
    float fbm(vec2 n) {
        float total = 0.0, amplitude = 1.0;
        for (int i = 0; i < 4; i++) {
            total += noise(n) * amplitude;
            n += n;
            amplitude *= 0.5;
        }
        return total;
    }

    void main() {
      // Moving cloud coordinates
      vec2 uv = vUv * 3.0 + vec2(uTime * uCloudSpeed * 0.2, uTime * uCloudSpeed * 0.1);
      
      // Generate noise pattern
      float n = fbm(uv + fbm(uv + vec2(0.0, uTime * 0.01)));
      
      // Soften edges and create cloud shapes
      // COMMENT: If the scene is too white, increase the first parameter of smoothstep (e.g., to 0.6) 
      // to make the clouds thinner and reveal more of the city gaps.
      float alpha = smoothstep(0.6, 1.2, n);
      
      // Make it wispy
      // COMMENT: uCloudDensity controls the overall opacity. 0.0005 is very low; check if the 
      // "Blur Layer" in SceneModel.tsx is actually what's causing the white-out.
      alpha *= uCloudDensity;

      // Distance fade at edges of the plane so it doesn't look like a square
      float distFromCenter = distance(vUv, vec2(0.5));
      alpha *= smoothstep(0.4, 0.35, distFromCenter);

      gl_FragColor = vec4(uColor, alpha);
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
