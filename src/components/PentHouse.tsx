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
      <group position={[-2.442, 2.975, 7.418]}>
        <mesh
          name="penthouse_door_left"
          castShadow
          receiveShadow
          geometry={nodes.penthouse_door_left.geometry}
          material={materials['04_-_Default']}
          position={[-0.657, -1.178, 0.025]}
        />
        <mesh
          name="penthouse_door_right"
          castShadow
          receiveShadow
          geometry={nodes.penthouse_door_right.geometry}
          material={materials['04_-_Default']}
          position={[0.657, -1.178, 0.025]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Plane001_04_-_Default_0'].geometry}
          material={materials['04_-_Default']}
          position={[0.657, -1.178, 0.025]}
        />
      </group>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box001_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-6.585, 3.926, 8.817]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box002_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-6.372, 3.926, 8.817]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box003_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-6.168, 3.926, 8.817]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box004_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-5.964, 3.926, 8.817]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box005_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-5.743, 3.926, 8.817]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box006_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-5.523, 3.926, 8.817]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box007_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-5.31, 3.926, 8.817]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box008_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-5.084, 3.926, 8.817]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box009_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-4.855, 3.926, 8.817]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box010_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 9.333]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box011_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 9.209]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box012_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 9.085]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box013_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 8.961]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box014_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 8.837]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box015_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 8.713]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box016_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 8.589]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box017_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 8.464]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box018_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 8.34]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box019_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 8.216]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box020_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 8.092]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box021_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 7.969]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box022_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 7.846]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box023_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 7.723]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box024_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 7.607]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box025_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[0.731, 3.926, 7.49]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box026_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[5.471, 3.926, -5.822]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box027_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[5.721, 3.926, -5.822]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box028_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[5.971, 3.926, -5.822]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box029_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[6.22, 3.926, -5.822]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box030_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[6.47, 3.926, -5.822]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box031_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[6.72, 3.926, -5.822]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box032_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[6.97, 3.926, -5.822]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box033_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[7.248, 3.926, -5.822]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box034_15_-_Glossy_Plastic_0'].geometry}
        material={materials['15_-_Glossy_Plastic']}
        position={[1.377, -0.228, -0.175]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Box035_Metal_0.geometry}
        material={materials.Metal}
        position={[-6.002, 0, 7.386]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Box036_Metal_0.geometry}
        material={materials.Metal}
        position={[1.643, 0, 7.386]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box038_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[-6.9, 4.733, 7.329]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box039_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[-6.9, 4.733, -4.828]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box040_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[5.022, 4.733, -4.828]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box041_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[5.022, 4.733, -2.584]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box042_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[11.161, 4.733, -2.584]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box043_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[11.141, 4.733, 3.083]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box044_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[0.023, 4.733, 3.083]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box045_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[0.023, 4.733, 7.333]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box046_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[-9.862, 1.575, 2.244]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box047_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[-9.862, 1.575, -3.358]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box048_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[-6.67, 1.575, -6.699]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box049_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[-6.67, 1.575, -7.544]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box050_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[4.999, 1.575, -7.544]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box051_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[4.999, 1.575, -5.014]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box052_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[9.981, 1.575, 5.288]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box053_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[0.167, 1.575, 5.288]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box054_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[-7.117, 1.575, 2.244]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box056_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[9.981, 1.575, 3.348]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box057_18_-_Rubber_0'].geometry}
        material={materials['18_-_Rubber']}
        position={[-3.787, 7.158, -2.809]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box059_20_-_Polished_Aluminum_0'].geometry}
        material={materials['20_-_Polished_Aluminum']}
        position={[3.956, 0.294, 7.964]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Box060_23_-_Default_0'].geometry}
        material={materials['23_-_Default']}
        position={[1.013, -0.031, 1.509]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line001_01_-_Default_0'].geometry}
        material={materials['01_-_Default']}
        position={[-0.764, 0, 0.377]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Line002_Wall_Paint_0.geometry}
        material={materials.Wall_Paint}
        position={[-0.764, 0.6, 0.377]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line004_05_-_Default_0'].geometry}
        material={materials['05_-_Default']}
        position={[-0.764, 0.6, 0.377]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Line005_Solid_Glass_0.geometry}
        material={materials.Solid_Glass}
        position={[2.348, 3.9, 0.743]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line007_15_-_Glossy_Plastic_0'].geometry}
        material={materials['15_-_Glossy_Plastic']}
        position={[2.348, 6.9, 0.755]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Line008_Wall_Paint_0.geometry}
        material={materials.Wall_Paint}
        position={[2.348, 3.65, 0.755]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line009_03_-_Default_0'].geometry}
        material={materials['03_-_Default']}
        position={[-3.353, 4.141, 8.128]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line010_03_-_Default_0'].geometry}
        material={materials['03_-_Default']}
        position={[-2.32, 4.141, -5.608]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line011_12_-_Car_Paint_0'].geometry}
        material={materials['12_-_Car_Paint']}
        position={[-0.764, 0.05, 0.377]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line012_06_-_Default_0'].geometry}
        material={materials['06_-_Default']}
        position={[2.348, 3.6, 0.755]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line013_17_-_Old_Copper_#1_0'].geometry}
        material={materials['17_-_Old_Copper_1']}
        position={[-0.842, 4.038, -6.685]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line014_17_-_Old_Copper_#1_0'].geometry}
        material={materials['17_-_Old_Copper_1']}
        position={[-0.842, 4.154, -6.685]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line015_17_-_Old_Copper_#1_0'].geometry}
        material={materials['17_-_Old_Copper_1']}
        position={[-0.842, 4.27, -6.685]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line016_17_-_Old_Copper_#1_0'].geometry}
        material={materials['17_-_Old_Copper_1']}
        position={[-0.842, 4.385, -6.685]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line017_17_-_Old_Copper_#1_0'].geometry}
        material={materials['17_-_Old_Copper_1']}
        position={[-8.436, 4.043, -0.548]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line018_17_-_Old_Copper_#1_0'].geometry}
        material={materials['17_-_Old_Copper_1']}
        position={[-8.436, 4.16, -0.548]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line019_17_-_Old_Copper_#1_0'].geometry}
        material={materials['17_-_Old_Copper_1']}
        position={[-8.436, 4.277, -0.548]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line020_17_-_Old_Copper_#1_0'].geometry}
        material={materials['17_-_Old_Copper_1']}
        position={[-8.436, 4.393, -0.548]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line021_17_-_Old_Copper_#1_0'].geometry}
        material={materials['17_-_Old_Copper_1']}
        position={[6.688, 4.037, 4.608]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line022_17_-_Old_Copper_#1_0'].geometry}
        material={materials['17_-_Old_Copper_1']}
        position={[6.688, 4.152, 4.608]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line023_17_-_Old_Copper_#1_0'].geometry}
        material={materials['17_-_Old_Copper_1']}
        position={[6.688, 4.266, 4.608]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line024_17_-_Old_Copper_#1_0'].geometry}
        material={materials['17_-_Old_Copper_1']}
        position={[6.688, 4.38, 4.608]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line025_22_-_Default_0'].geometry}
        material={materials['22_-_Default']}
        position={[-3.78, 0.014, 4.42]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Line026_21_-_Default_0'].geometry}
        material={materials['21_-_Default']}
        position={[6.785, 0.014, -2.357]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Object001_19_-_Glass_(Thin_wall)_0'].geometry}
        material={materials['19_-_Glass_Thin_wall']}
        position={[3.956, 0.117, 7.964]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane002_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[-5.801, 5.221, 7.29]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane003_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[1.426, 5.221, 3.02]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane004_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[3.527, 5.221, 3.02]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane005_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[5.615, 5.221, 3.02]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane006_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[7.704, 5.221, 3.02]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane007_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[7.711, 1.886, 5.279]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane008_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[5.619, 1.886, 5.279]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane009_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[3.528, 1.886, 5.279]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane010_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[1.442, 1.886, 5.279]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane011_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[-6.351, 1.886, 2.298]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane012_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[-8.56, 1.886, 2.298]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane013_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[-8.56, 1.886, -2.516]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane014_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[-6.361, 1.886, -2.516]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane015_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[-3.678, 1.886, -7.531]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane016_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[-1.37, 1.886, -7.531]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane017_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[1.205, 1.886, -7.531]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane018_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[3.783, 1.886, -7.531]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane019_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[6.406, 1.886, -2.542]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane020_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[8.504, 1.886, -2.542]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane021_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[-4.874, 1.886, 3.779]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane022_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[-4.874, 1.886, 6.03]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane023_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[-6.852, 5.222, 1.036]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane024_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[-6.852, 5.222, -1.452]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane025_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[3.785, 5.221, -4.784]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane026_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[1.205, 5.221, -4.784]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane027_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[-1.369, 5.221, -4.784]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane028_04_-_Default_0'].geometry}
        material={materials['04_-_Default']}
        position={[-3.949, 5.221, -4.784]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Plane029_11_-_Default_0'].geometry}
        material={materials['11_-_Default']}
        position={[-2.168, 0.023, 10.476]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Rectangle001_03_-_Default_0'].geometry}
        material={materials['03_-_Default']}
        position={[-7.686, 5.496, -1.055]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Rectangle002_03_-_Default_0'].geometry}
        material={materials['03_-_Default']}
        position={[-2.442, 3.044, 7.444]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Rectangle003_14_-_Polished_Aluminum_0'].geometry}
        material={materials['14_-_Polished_Aluminum']}
        position={[0.628, 4.334, 1.139]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape001_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-7.844, 5.496, -1.055]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape002_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-8.059, 5.496, -1.055]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape003_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-8.283, 5.496, -1.055]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape004_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-8.504, 5.496, -1.055]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape005_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-8.723, 5.496, -1.055]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape006_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-8.934, 5.496, -1.055]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape007_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[-9.132, 5.496, -1.055]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape008_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[10.866, 5.496, 3.04]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape009_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[11.127, 5.496, 3.04]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape010_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[11.387, 5.496, 3.04]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape011_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[11.647, 5.496, 3.04]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape012_02_-_Default_0'].geometry}
        material={materials['02_-_Default']}
        position={[11.908, 5.496, 3.04]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape014_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[-5.801, 5.221, 7.29]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape015_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[1.426, 5.221, 3.02]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape016_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[3.527, 5.221, 3.02]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape017_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[5.615, 5.221, 3.02]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape018_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[7.704, 5.221, 3.02]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape019_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[7.711, 1.886, 5.279]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape020_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[5.619, 1.886, 5.279]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape021_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[3.528, 1.886, 5.279]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape022_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[1.442, 1.886, 5.279]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape023_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[-6.351, 1.886, 2.298]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape024_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[-8.56, 1.886, 2.298]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape025_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[-8.56, 1.886, -2.516]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape026_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[-6.361, 1.886, -2.516]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape027_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[-3.678, 1.886, -7.531]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape028_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[-1.37, 1.886, -7.531]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape029_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[1.205, 1.886, -7.531]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape030_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[3.783, 1.886, -7.531]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape031_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[6.406, 1.886, -2.542]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape032_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[8.504, 1.886, -2.542]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape033_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[-4.874, 1.886, 3.779]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape034_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[-4.874, 1.886, 6.03]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape035_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[-6.852, 5.222, 1.036]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape036_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[-6.852, 5.222, -1.452]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape037_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[3.785, 5.221, -4.783]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape038_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[1.205, 5.221, -4.783]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape039_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[-1.369, 5.221, -4.783]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Shape040_Ceramic_0.geometry}
        material={materials.Ceramic}
        position={[-3.949, 5.221, -4.783]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape041_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[2.348, 7.078, 0.755]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape042_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[2.348, 7.23, 0.755]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Shape043_16_-_Matte_Plastic_0'].geometry}
        material={materials['16_-_Matte_Plastic']}
        position={[2.348, 7.382, 0.755]}
      />
    </group>
  )
}

useGLTF.preload('/models/penthouse.glb')