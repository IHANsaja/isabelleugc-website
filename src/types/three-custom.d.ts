import { LoaderShaderMaterial } from "../components/shaders/LoaderShaderMaterial";

declare module "@react-three/fiber" {
  interface ThreeElements {
    loaderShaderMaterial: any;
  }
}
