"use client";

import * as THREE from 'three'
import React, { useRef, useMemo } from 'react'
import { useGLTF, MeshTransmissionMaterial, useVideoTexture } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { GLTF } from 'three-stdlib'
import { ThreeElements, useFrame, useThree } from '@react-three/fiber'
import './shaders/CityShaderMaterial' // Register the custom shader material
import './shaders/CityGroundShaderMaterial' // Register the custom ground shader material
import './shaders/CloudShaderMaterial' // Register the custom cloud shader material
import './shaders/WaterShaderMaterial' // Register the custom water shader material
import { useTVInteraction } from '@/context/TVInteractionContext'

type GLTFResult = GLTF & {
    nodes: {
        [name: string]: THREE.Mesh
    }
    materials: {
        [name: string]: THREE.Material
    }
}

export function SceneModel(props: ThreeElements['group'] & { 
    isSoundEnabled: boolean; 
    isMobile?: boolean;
    playerRigidBodyRef?: React.RefObject<any>;
    onBoundsLoaded?: (bounds: THREE.Box3) => void;
}) {
    const { nodes, materials } = useGLTF('/models/scene.glb') as unknown as GLTFResult

    // Animation refs for shaders
    const cloudMat = useRef<any>(null);
    const groundMat = useRef<any>(null);
    const tvScreenRef = useRef<THREE.Mesh>(null);
    const raycaster = useRef(new THREE.Raycaster());
    const waterMat = useRef<any>(null);
    
    // TV Interaction context
    const { setIsLookingAtTV, setVideoElement } = useTVInteraction();

    React.useEffect(() => {
        // useFrame is not available inside the component body directly usually if not careful? 
        // No, it's fine.
    }, [])

    useFrame((state, delta) => {
        if (cloudMat.current) {
            cloudMat.current.uTime = state.clock.elapsedTime;
        }
        if (groundMat.current) {
            // Updated ground shader also has uTime
            groundMat.current.uTime = state.clock.elapsedTime;
        }

        if (waterMat.current && waterMat.current.uTime !== undefined) {
            waterMat.current.uTime = state.clock.elapsedTime;
            if (props.playerRigidBodyRef?.current) {
                const pos = props.playerRigidBodyRef.current.translation();
                waterMat.current.uPlayerPos.set(pos.x, pos.y, pos.z);
            }
        }
        
        // TV Raycasting detection
        if (tvScreenRef.current) {
            raycaster.current.setFromCamera(new THREE.Vector2(0, 0), state.camera);
            const intersects = raycaster.current.intersectObject(tvScreenRef.current);
            setIsLookingAtTV(intersects.length > 0 && intersects[0].distance < 8);
        }
    });

    const [audioPos, setAudioPos] = React.useState<[number, number, number]>([0, 0, 0])

    React.useLayoutEffect(() => {
        if (nodes.tv_screen_screen && nodes.tv_screen_screen.geometry) {
            const geometry = nodes.tv_screen_screen.geometry;
            geometry.computeBoundingBox();
            const bbox = geometry.boundingBox;
            if (bbox) {
                const size = new THREE.Vector3();
                bbox.getSize(size);

                const axes = [
                    { idx: 0, size: size.x },
                    { idx: 1, size: size.y },
                    { idx: 2, size: size.z }
                ].sort((a, b) => b.size - a.size);

                const uAxis = axes[0].idx;
                const vAxis = axes[1].idx;

                const minU = uAxis === 0 ? bbox.min.x : uAxis === 1 ? bbox.min.y : bbox.min.z;
                const rangeU = uAxis === 0 ? size.x : uAxis === 1 ? size.y : size.z;

                const minV = vAxis === 0 ? bbox.min.x : vAxis === 1 ? bbox.min.y : bbox.min.z;
                const rangeV = vAxis === 0 ? size.x : vAxis === 1 ? size.y : size.z;

                const posAttribute = geometry.attributes.position;
                const uvs = new Float32Array(posAttribute.count * 2);

                for (let i = 0; i < posAttribute.count; i++) {
                    const uVal = posAttribute.getComponent(i, uAxis);
                    const vVal = posAttribute.getComponent(i, vAxis);

                    uvs[i * 2] = (uVal - minU) / rangeU;
                    uvs[i * 2 + 1] = (vVal - minV) / rangeV;
                }

                geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
                geometry.attributes.uv.needsUpdate = true;

                const center = new THREE.Vector3();
                bbox.getCenter(center);
                setAudioPos([center.x, center.y, center.z]);
            }
        }

        // Get indoor floor bounds for spatial wind logic - use world coordinates
        if (nodes.floor && nodes.floor.geometry) {
            nodes.floor.geometry.computeBoundingBox();
            const bbox = nodes.floor.geometry.boundingBox;
            if (bbox) {
                // Ensure world matrix is up to date
                nodes.floor.updateMatrixWorld(true);
                const worldBox = bbox.clone().applyMatrix4(nodes.floor.matrixWorld);
                if (props.onBoundsLoaded) {
                    props.onBoundsLoaded(worldBox);
                }
            }
        }
    }, [nodes, props.onBoundsLoaded]);

    const videoTexture = useVideoTexture('/videos/T.mp4', {
        unsuspend: 'canplay',
        muted: false,
        loop: true,
        start: true,
        playsInline: true,
    })
    videoTexture.flipY = true
    // flipX does not exist on VideoTexture, using repeat and offset to flip horizontally
    videoTexture.repeat.x = -1
    videoTexture.offset.x = 1

    const audioRef = useRef<THREE.PositionalAudio>(null!)
    const { camera } = useThree()
    const [listener] = React.useState(() => new THREE.AudioListener())

    React.useEffect(() => {
        camera.add(listener)
        return () => {
            camera.remove(listener)
        }
    }, [camera, listener])

    React.useEffect(() => {
        if (props.isSoundEnabled && audioRef.current && videoTexture.image instanceof HTMLVideoElement) {
            const video = videoTexture.image as any

            // Check if source already exists on the video element
            if (!video._audioSource) {
                try {
                    // Create MediaElementSource only once per video element
                    video._audioSource = audioRef.current.context.createMediaElementSource(video)
                } catch (e) {
                    console.warn("Failed to create media element source:", e)
                }
            }

            // If we have a source, connect it using setNodeSource
            if (video._audioSource) {
                audioRef.current.setNodeSource(video._audioSource)
                audioRef.current.setRefDistance(1) // Reduced distance for faster falloff
                audioRef.current.setRolloffFactor(1) // Gentler rolloff
                audioRef.current.setVolume(0.5) // Reduced volume
                
                // Ensure audio context is running
                if (audioRef.current.context.state === 'suspended') {
                    audioRef.current.context.resume();
                }
            }
        }
    }, [videoTexture, props.isSoundEnabled])

    // Expose video element to context and sync mute state
    React.useEffect(() => {
        if (videoTexture.image instanceof HTMLVideoElement) {
            setVideoElement(videoTexture.image);
            videoTexture.image.muted = !props.isSoundEnabled;
        }
        return () => setVideoElement(null);
    }, [videoTexture, setVideoElement, props.isSoundEnabled]);

    // Filter out nodes that are handled specially or are invisible/meta
    const standardMeshes = useMemo(() => {
        const special = new Set([
            'City_City_0', 'City_City_0001', 'floor', 'floor_sep', 'grass_ground',
            'outside_floor', 'pool', 'pool_water', 'walls', 'building_bottom', 
            'city_ground', 'tv_screen_screen', 'tv_screen_1', 'tv_screen_2'
        ]);
        
        return Object.entries(nodes).filter(([name, node]) => {
            return node.type === 'Mesh' && !special.has(name) && !name.includes('Helper');
        });
    }, [nodes]);

    return (
        <group {...props} dispose={null}>
            {/* Added Cloud Layer */}
            <mesh position={[0, -18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1500, 1500]} />
                <cloudShaderMaterial ref={cloudMat} transparent depthWrite={false} side={THREE.DoubleSide} />
            </mesh>

            {/* City Geometry - Grouped RigidBody */}
            <RigidBody type="fixed" colliders="trimesh">
                <mesh castShadow receiveShadow geometry={nodes.City_City_0.geometry}>
                    <cityShaderMaterial />
                </mesh>
                <mesh castShadow receiveShadow geometry={nodes.City_City_0001.geometry}>
                    <cityShaderMaterial />
                </mesh>
            </RigidBody>

            <group>
                {/* Main Floor & Ground - Combined RigidBody */}
                <RigidBody type="fixed" colliders="trimesh">
                    <mesh castShadow receiveShadow geometry={nodes.floor.geometry} material={materials.carrelage_046_ovcolbfbfbfcolpic12contpic03_Room_Entity_Material} />
                    <mesh castShadow receiveShadow geometry={nodes.floor_sep.geometry} material={materials.gris_001_Room_Entity_Material} />
                    <mesh castShadow receiveShadow geometry={nodes.grass_ground.geometry} material={materials.gazon_007_Room_Entity_Material} />
                    <mesh castShadow receiveShadow geometry={nodes.outside_floor.geometry} material={materials.bitume_001_ovcol737373colpic12contpic11_Room_Entity_Material} />
                    <mesh castShadow receiveShadow geometry={nodes.walls.geometry} material={materials['Dirty Plaster']} />
                    <mesh castShadow receiveShadow geometry={nodes.building_bottom.geometry} material={nodes.building_bottom.material} />
                </RigidBody>

                {/* Pool & Water */}
                <RigidBody type="fixed" colliders="trimesh">
                                    <mesh
                                        castShadow
                                        receiveShadow
                                        geometry={nodes.pool.geometry}
                                        material={materials.poolTiles}
                                    />
                                </RigidBody>
                                
                                {/* Fixed Water Shader Implementation */}
                                <mesh geometry={nodes.pool_water.geometry} receiveShadow frustumCulled={false} renderOrder={1}>
                                    <waterShaderMaterial ref={waterMat} transparent depthWrite={false} side={THREE.DoubleSide} />
                                </mesh>

                {/* TV Setup */}
                <mesh castShadow receiveShadow geometry={nodes.tv_screen_1.geometry} material={materials['mirror.nocompress']} />
                <mesh castShadow receiveShadow geometry={nodes.tv_screen_2.geometry} material={materials['mirror.nocompress']} />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.tv_screen_screen.geometry}
                    material={materials['mirror.nocompress']}
                    ref={tvScreenRef}
                >
                    <meshBasicMaterial map={videoTexture} toneMapped={false} />
                     {props.isSoundEnabled && (
                        <positionalAudio
                            ref={audioRef}
                            args={[listener]}
                            position={audioPos}
                            loop
                        />
                    )}
                </mesh>

                {/* Ground Plane */}
                <mesh castShadow receiveShadow geometry={nodes.city_ground.geometry}>
                    <cityGroundShaderMaterial ref={groundMat} />
                </mesh>

                {/* Dynamic render of all other meshes (Props, Furniture, etc.) */}
                {standardMeshes.map(([name, node]: [string, any]) => (
                    <mesh
                        key={name}
                        castShadow={!props.isMobile}
                        receiveShadow
                        geometry={node.geometry}
                        material={node.material}
                    />
                ))}
            </group>
        </group>
    )
}

useGLTF.preload('/models/scene.glb')
