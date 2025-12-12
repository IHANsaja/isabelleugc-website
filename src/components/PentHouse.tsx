"use client";

import * as THREE from 'three'
import React, { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    [name: string]: THREE.Mesh
  }
  materials: {
    [name: string]: THREE.Material
  }
}

export function Penthouse(props: any) {
  const { nodes, materials } = useGLTF('/models/penthouse.glb') as unknown as GLTFResult

  useEffect(() => {
    if (nodes) {
      console.log('--- Penthouse Model Nodes ---');
      Object.entries(nodes).forEach(([name, node]) => {
        if ((node as any).isMesh) {
          console.log(`Mesh: ${name}`);
        } else if ((node as any).isBone) {
          console.log(`Bone: ${name}`);
        } else {
          console.log(`Other (${node.type}): ${name}`);
        }
      });
      console.log('--- End Nodes ---');
    }
  }, [nodes]);

  return (
    <group {...props} dispose={null}>
      <group scale={0.025}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line001_01_-_Default_0'].geometry}
          material={materials['01_-_Default']}
          position={[-30.09, 0, 14.839]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Line002_Wall_Paint_0.geometry}
          material={materials.Wall_Paint}
          position={[-30.09, 23.622, 14.839]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line004_05_-_Default_0'].geometry}
          material={materials['05_-_Default']}
          position={[-30.09, 23.622, 14.839]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Line005_Solid_Glass_0.geometry}
          material={materials.Solid_Glass}
          position={[92.436, 153.543, 29.251]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line007_15_-_Glossy_Plastic_0'].geometry}
          material={materials['15_-_Glossy_Plastic']}
          position={[92.436, 271.654, 29.71]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Line008_Wall_Paint_0.geometry}
          material={materials.Wall_Paint}
          position={[92.436, 143.701, 29.71]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line009_03_-_Default_0'].geometry}
          material={materials['03_-_Default']}
          position={[-132.003, 163.037, 319.984]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Rectangle001_03_-_Default_0'].geometry}
          material={materials['03_-_Default']}
          position={[-302.6, 216.375, -41.54]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape001_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-308.818, 216.375, -41.54]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape002_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-317.287, 216.375, -41.54]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape003_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-326.101, 216.375, -41.54]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape004_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-334.809, 216.375, -41.54]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape005_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-343.41, 216.375, -41.54]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape006_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-351.739, 216.375, -41.54]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape007_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-359.535, 216.375, -41.54]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box001_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-259.24, 154.561, 347.144]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box002_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-250.879, 154.561, 347.144]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box003_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-242.833, 154.561, 347.144]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box004_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-234.786, 154.561, 347.144]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box005_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-226.111, 154.561, 347.144]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box006_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-217.435, 154.561, 347.144]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box007_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-209.042, 154.561, 347.144]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box008_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-200.177, 154.561, 347.144]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box009_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[-191.157, 154.561, 347.144]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape008_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[427.812, 216.375, 119.7]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape009_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[438.062, 216.375, 119.7]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape010_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[448.312, 216.375, 119.7]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape011_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[458.562, 216.375, 119.7]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape012_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[468.812, 216.375, 119.7]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line010_03_-_Default_0'].geometry}
          material={materials['03_-_Default']}
          position={[-91.331, 163.037, -220.786]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box010_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 367.457]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box011_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 362.57]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box012_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 357.683]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box013_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 352.796]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box014_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 347.909]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box015_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 343.021]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box016_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 338.134]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box017_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 333.247]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box018_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 328.36]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box019_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 323.473]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box020_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 318.586]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box021_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 313.745]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box022_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 308.904]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box023_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 304.062]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box024_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 299.469]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box025_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[28.794, 154.561, 294.876]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box026_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[215.376, 154.561, -229.195]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box027_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[225.218, 154.561, -229.195]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box028_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[235.06, 154.561, -229.195]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box029_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[244.901, 154.561, -229.195]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box030_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[254.743, 154.561, -229.195]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box031_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[264.585, 154.561, -229.195]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box032_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[274.427, 154.561, -229.195]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box033_02_-_Default_0'].geometry}
          material={materials['02_-_Default']}
          position={[285.337, 154.561, -229.195]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Rectangle002_03_-_Default_0'].geometry}
          material={materials['03_-_Default']}
          position={[-96.133, 119.843, 293.051]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane001_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[-96.133, 117.114, 292.042]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape013_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[-96.133, 117.114, 292.334]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane002_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[-228.368, 205.541, 286.992]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape014_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[-228.368, 205.541, 286.996]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane003_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[56.14, 205.541, 118.899]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape015_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[56.14, 205.541, 118.903]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane004_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[138.869, 205.541, 118.899]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape016_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[138.869, 205.541, 118.903]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane005_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[221.062, 205.541, 118.899]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape017_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[221.062, 205.541, 118.903]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane006_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[303.32, 205.541, 118.899]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape018_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[303.32, 205.541, 118.903]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane007_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[303.582, 74.238, 207.844]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape019_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[303.582, 74.238, 207.848]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane008_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[221.201, 74.238, 207.844]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape020_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[221.201, 74.238, 207.848]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane009_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[138.893, 74.238, 207.844]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape021_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[138.893, 74.238, 207.848]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane010_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[56.788, 74.238, 207.844]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape022_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[56.788, 74.238, 207.848]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane011_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[-250.033, 74.238, 90.478]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape023_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[-250.033, 74.238, 90.482]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane012_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[-336.995, 74.238, 90.478]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape024_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[-336.995, 74.238, 90.482]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane013_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[-336.995, 74.238, -99.042]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape025_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[-336.995, 74.238, -99.047]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane014_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[-250.436, 74.238, -99.042]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape026_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[-250.436, 74.238, -99.047]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane015_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[-144.806, 74.238, -296.503]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape027_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[-144.806, 74.238, -296.507]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane016_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[-53.941, 74.238, -296.503]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape028_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[-53.941, 74.238, -296.507]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane017_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[47.44, 74.238, -296.503]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape029_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[47.44, 74.238, -296.507]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane018_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[148.941, 74.238, -296.503]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape030_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[148.941, 74.238, -296.507]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane019_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[252.192, 74.238, -100.071]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape031_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[252.192, 74.238, -100.075]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane020_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[334.784, 74.238, -100.071]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape032_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[334.784, 74.238, -100.075]}
          rotation={[Math.PI, 0, -Math.PI]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane021_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[-191.9, 74.238, 148.782]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape033_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[-191.904, 74.238, 148.782]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane022_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[-191.9, 74.238, 237.411]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape034_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[-191.904, 74.238, 237.411]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane023_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[-269.769, 205.59, 40.801]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape035_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[-269.774, 205.59, 40.801]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane024_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[-269.769, 205.59, -57.165]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape036_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[-269.774, 205.59, -57.165]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[-1.002, 1.002, 1.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane025_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[149.008, 205.548, -188.329]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape037_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[149.008, 205.548, -188.325]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane026_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[47.43, 205.548, -188.329]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape038_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[47.43, 205.548, -188.325]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane027_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[-53.892, 205.548, -188.329]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape039_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[-53.892, 205.548, -188.325]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane028_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[-155.48, 205.548, -188.329]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Shape040_Ceramic_0.geometry}
          material={materials.Ceramic}
          position={[-155.48, 205.548, -188.325]}
          scale={1.002}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box034_15_-_Glossy_Plastic_0'].geometry}
          material={materials['15_-_Glossy_Plastic']}
          position={[54.197, -8.991, -6.887]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane029_11_-_Default_0'].geometry}
          material={materials['11_-_Default']}
          position={[-85.347, 0.908, 412.427]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Box035_Metal_0.geometry}
          material={materials.Metal}
          position={[-236.308, 0, 290.783]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Box036_Metal_0.geometry}
          material={materials.Metal}
          position={[64.692, 0, 290.783]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line011_12_-_Car_Paint_0'].geometry}
          material={materials['12_-_Car_Paint']}
          position={[-30.09, 1.969, 14.839]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Rectangle003_14_-_Polished_Aluminum_0'].geometry}
          material={materials['14_-_Polished_Aluminum']}
          position={[24.742, 170.646, 44.836]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line012_06_-_Default_0'].geometry}
          material={materials['06_-_Default']}
          position={[92.436, 141.732, 29.71]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape041_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[92.436, 278.651, 29.71]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape042_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[92.436, 284.645, 29.71]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Shape043_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[92.436, 290.638, 29.71]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box038_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[-271.661, 186.345, 288.559]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box039_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[-271.661, 186.345, -190.084]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box040_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[197.722, 186.345, -190.084]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box041_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[197.722, 186.345, -101.722]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box042_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[439.392, 186.345, -101.722]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box043_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[438.641, 186.345, 121.385]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box044_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[0.921, 186.345, 121.385]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box045_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[0.921, 186.345, 288.691]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box046_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[-388.285, 61.998, 88.36]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box047_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[-388.285, 61.998, -132.216]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box048_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[-262.597, 61.998, -263.758]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box049_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[-262.614, 61.998, -297.017]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box050_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[196.824, 61.998, -297.017]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box051_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[196.824, 61.998, -197.42]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box052_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[392.947, 61.998, 208.19]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box053_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[6.563, 61.998, 208.19]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line013_17_-_Old_Copper_#1_0'].geometry}
          material={materials['17_-_Old_Copper_1']}
          position={[-33.146, 158.972, -263.194]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line014_17_-_Old_Copper_#1_0'].geometry}
          material={materials['17_-_Old_Copper_1']}
          position={[-33.146, 163.532, -263.194]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line015_17_-_Old_Copper_#1_0'].geometry}
          material={materials['17_-_Old_Copper_1']}
          position={[-33.146, 168.093, -263.194]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line016_17_-_Old_Copper_#1_0'].geometry}
          material={materials['17_-_Old_Copper_1']}
          position={[-33.146, 172.653, -263.194]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box054_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[-280.189, 61.998, 88.36]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line017_17_-_Old_Copper_#1_0'].geometry}
          material={materials['17_-_Old_Copper_1']}
          position={[-332.139, 159.184, -21.567]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line018_17_-_Old_Copper_#1_0'].geometry}
          material={materials['17_-_Old_Copper_1']}
          position={[-332.139, 163.78, -21.567]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line019_17_-_Old_Copper_#1_0'].geometry}
          material={materials['17_-_Old_Copper_1']}
          position={[-332.139, 168.376, -21.567]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line020_17_-_Old_Copper_#1_0'].geometry}
          material={materials['17_-_Old_Copper_1']}
          position={[-332.139, 172.972, -21.567]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box056_16_-_Matte_Plastic_0'].geometry}
          material={materials['16_-_Matte_Plastic']}
          position={[392.947, 61.998, 131.802]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line021_17_-_Old_Copper_#1_0'].geometry}
          material={materials['17_-_Old_Copper_1']}
          position={[263.323, 158.941, 181.429]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line022_17_-_Old_Copper_#1_0'].geometry}
          material={materials['17_-_Old_Copper_1']}
          position={[263.323, 163.446, 181.429]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line023_17_-_Old_Copper_#1_0'].geometry}
          material={materials['17_-_Old_Copper_1']}
          position={[263.323, 167.951, 181.429]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line024_17_-_Old_Copper_#1_0'].geometry}
          material={materials['17_-_Old_Copper_1']}
          position={[263.323, 172.456, 181.429]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box057_18_-_Rubber_0'].geometry}
          material={materials['18_-_Rubber']}
          position={[-149.113, 281.8, -110.572]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box059_20_-_Polished_Aluminum_0'].geometry}
          material={materials['20_-_Polished_Aluminum']}
          position={[155.766, 11.579, 313.548]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Object001_19_-_Glass_(Thin_wall)_0'].geometry}
          material={materials['19_-_Glass_Thin_wall']}
          position={[155.766, 4.614, 313.548]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Box060_23_-_Default_0'].geometry}
          material={materials['23_-_Default']}
          position={[39.868, -1.233, 59.419]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line025_22_-_Default_0'].geometry}
          material={materials['22_-_Default']}
          position={[-148.837, 0.559, 174.006]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Line026_21_-_Default_0'].geometry}
          material={materials['21_-_Default']}
          position={[267.112, 0.57, -92.791]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/models/penthouse.glb')