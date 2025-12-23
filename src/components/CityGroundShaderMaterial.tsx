import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

const CityGroundShaderMaterialImpl = shaderMaterial(
  {
    uColorWater: new THREE.Color("#4fa1d8"), // Blue
    uColorGrass: new THREE.Color("#5e9e58"), // Green
    uColorPavement: new THREE.Color("#d0d0ce"), // Grey
    uColorEdge: new THREE.Color("#e8e8e8"), // Sky match
    uRadiusStart: 200.0,
    uRadiusEnd: 500.0,
    uTime: 0,
  },
  // Vertex Shader
  `
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColorWater;
    uniform vec3 uColorGrass;
    uniform vec3 uColorPavement;
    uniform vec3 uColorEdge;
    uniform float uRadiusStart;
    uniform float uRadiusEnd;

    varying vec3 vWorldPosition;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      float dist = length(vWorldPosition.xz);
      
      // Noise Generation
      // Scale coordinates for large features
      float noiseVal = snoise(vWorldPosition.xz * 0.005); 
      // Detail noise
      float detail = snoise(vWorldPosition.xz * 0.05) * 0.1;
      
      float n = noiseVal + detail;
      
      // Biome Logic
      vec3 groundColor;
      
      // Thresholds
      float waterThreshold = 0.0; // Below this is water
      float grassThreshold = 0.4; // Below this is grass, above is pavement/city
      
      // Smooth mixing
      float grassMix = smoothstep(waterThreshold - 0.05, waterThreshold + 0.05, n);
      float paveMix = smoothstep(grassThreshold - 0.1, grassThreshold + 0.1, n);

      vec3 water = uColorWater;
      // Add some color variation to grass
      vec3 grass = mix(uColorGrass * 0.8, uColorGrass * 1.2, detail * 5.0 + 0.5);
      vec3 pavement = mix(uColorPavement * 0.9, uColorPavement * 1.1, detail * 5.0 + 0.5);

      groundColor = mix(water, grass, grassMix);
      groundColor = mix(groundColor, pavement, paveMix);

      // Distance fading (fog logic)
      float factor = smoothstep(uRadiusStart, uRadiusEnd, dist);
      vec3 finalColor = mix(groundColor, uColorEdge, factor);
      float alpha = 1.0 - factor;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

extend({ CityGroundShaderMaterial: CityGroundShaderMaterialImpl });

declare module '@react-three/fiber' {
  interface ThreeElements {
    cityGroundShaderMaterial: any;
  }
}

export { CityGroundShaderMaterialImpl };
