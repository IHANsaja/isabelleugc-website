"use client";

import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF, MeshTransmissionMaterial, useVideoTexture } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { GLTF } from 'three-stdlib'
import { ThreeElements, useFrame, useThree } from '@react-three/fiber'
import './shaders/CityShaderMaterial' // Register the custom shader material
import './shaders/CityGroundShaderMaterial' // Register the custom ground shader material
import './shaders/CloudShaderMaterial' // Register the custom cloud shader material
import { WaterPool } from './shaders/WaterShaderMaterial'
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
    playerRigidBodyRef?: React.RefObject<any>;
    onBoundsLoaded?: (bounds: THREE.Box3) => void;
}) {
    const { nodes, materials } = useGLTF('/models/scene.glb') as unknown as GLTFResult

    // Animation refs for shaders
    const cloudMat = useRef<any>(null);
    const groundMat = useRef<any>(null);
    const tvScreenRef = useRef<THREE.Mesh>(null);
    const raycaster = useRef(new THREE.Raycaster());
    
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

    return (
        <group {...props} dispose={null}>
            {/* Added Cloud Layer */}
            <mesh position={[0, -18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1500, 1500]} />
                <cloudShaderMaterial ref={cloudMat} transparent depthWrite={false} side={THREE.DoubleSide} />
            </mesh>

            <RigidBody type="fixed" colliders="trimesh">
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.City_City_0.geometry}
                >
                    <cityShaderMaterial />
                </mesh>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.City_City_0001.geometry}
                >
                    <cityShaderMaterial />
                </mesh>
            </RigidBody>
            <group>
                <RigidBody type="fixed" colliders="trimesh">
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.floor.geometry}
                        material={materials.carrelage_046_ovcolbfbfbfcolpic12contpic03_Room_Entity_Material}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.floor_sep.geometry}
                        material={materials.gris_001_Room_Entity_Material}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.grass_ground.geometry}
                        material={materials.gazon_007_Room_Entity_Material}
                    />
                </RigidBody>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_11.geometry}
                    material={materials['Wood.121']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_12.geometry}
                    material={materials.buisson___buisson_branche_texture}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_13.geometry}
                    material={materials.buisson___buisson_branche_texture}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_14.geometry}
                    material={materials.buisson___buisson_texture}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_15.geometry}
                    material={materials.carrelage_046_ovcolacacaccolpic12contpic02_Wall_Entity_Material}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_17.geometry}
                    material={materials.carrelage_046_ovcolbfbfbfcolpic12contpic03_Wall_Entity_Material}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_18.geometry}
                    material={materials['Fabric 3']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_19.geometry}
                    material={materials.cuisine_evier_001___mat_verni}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_2.geometry}
                    material={materials['Laminated Wood']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_20.geometry}
                    material={materials.cuisine_ilot_002___mat_verni}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_21.geometry}
                    material={materials.cuisine_meuble_bas_001___mat_microonde}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_22.geometry}
                    material={materials.cuisine_meuble_bas_001___mat_pied}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_23.geometry}
                    material={materials.cuisine_meuble_bas_001___mat_poignet}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_24.geometry}
                    material={materials.cuisine_meuble_bas_001___mat_porte}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_25.geometry}
                    material={materials.cuisine_meuble_bas_001___mat_verni}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_26.geometry}
                    material={
                        materials.cuisine_meuble_bas_003____cuisine_meuble_bas_003_cuisine_meuble_bas_003_cuisine_meuble_bas_003verni
                    }
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_27.geometry}
                    material={materials['Laminated Wood']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_28.geometry}
                    material={materials['Laminated Wood']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_29.geometry}
                    material={
                        materials.cuisine_plaque_cuisson_001____cuisine_plaque_cuisson_001_cuisine_plaque_cuisson_001_cuisine_plaque_cuisson_00108___default
                    }
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_30.geometry}
                    material={
                        materials.cuisine_plaque_cuisson_001____cuisine_plaque_cuisson_001_cuisine_plaque_cuisson_001_cuisine_plaque_cuisson_001metal
                    }
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_31.geometry}
                    material={
                        materials.cuisine_plaque_cuisson_001____cuisine_plaque_cuisson_001_cuisine_plaque_cuisson_001_cuisine_plaque_cuisson_001verni
                    }
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_33.geometry}
                    material={materials.cypres___mat_cypres_tronc}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_34.geometry}
                    material={materials.douche_italienne_002____douche_italienne__verre}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_35.geometry}
                    material={materials.douche_italienne_002____douche_italienne_fond}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_36.geometry}
                    material={materials.douche_italienne_002____douche_italienne_trou_douche}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_37.geometry}
                    material={materials.douche_italienne_002____douche_italienne_trous_douche}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_38.geometry}
                    material={materials.enduit_004_Room_Entity_Material}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_39.geometry}
                    material={materials.enduit_004_Wall_Entity_Material}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_4.geometry}
                    material={materials.baie_vitree_002___verre}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_40.geometry}
                    material={materials.fake_mat_0_0_0_255}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_41.geometry}
                    material={materials['Material.001']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_42.geometry}
                    material={materials['Procedural Wood']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_43.geometry}
                    material={materials.metal2}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_44.geometry}
                    material={materials.fake_mat_165_165_165_255}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_45.geometry}
                    material={materials.fake_mat_204_202_198_255}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_46.geometry}
                    material={materials.fake_mat_229_229_229_255}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_47.geometry}
                    material={materials.fake_mat_248_249_253_255}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_48.geometry}
                    material={materials.light}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_48001.geometry}
                    material={materials.deer_head}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_48002.geometry}
                    material={materials.light}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_48003.geometry}
                    material={materials['Marble Ceramic']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_48004.geometry}
                    material={materials['Marble Ceramic']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_48005.geometry}
                    material={materials.metal2}
                />

                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_49.geometry}
                    material={materials.fake_mat_255_255_255_32}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_5.geometry}
                    material={materials.baie_vitree_002___wood_dormant}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_50.geometry}
                    material={materials['Procedural Wood']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_51.geometry}
                    material={materials.fenetre_002____fenetre_002fenetre_002_d1}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_52.geometry}
                    material={materials.fenetre_002____fenetre_002fenetre_002_p1}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_53.geometry}
                    material={materials.fenetre_002____fenetre_verre}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_54.geometry}
                    material={materials.fenetre_029______phong1sg6}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_56.geometry}
                    material={materials.metal2}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_56001.geometry}
                    material={materials.metal2}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_56002.geometry}
                    material={materials.metal2}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_56003.geometry}
                    material={materials.metal2}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_58.geometry}
                    material={materials.gris_001_Wall_Entity_Material}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_59.geometry}
                    material={materials.horloge_002___bis_mat_horlogesg}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_6.geometry}
                    material={materials.beige_006_Wall_Entity_Material}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_60.geometry}
                    material={materials.hotte_003___mat_hote}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_61.geometry}
                    material={materials.IhanMarble}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_62.geometry}
                    material={materials['Procedural Wood']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_63.geometry}
                    material={materials['Procedural Wood']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_64.geometry}
                    material={materials.metal2}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_65.geometry}
                    material={materials.IhanMarble}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_66.geometry}
                    material={materials.lave_mains_001___lave_mains_001_blinn4sg}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_67.geometry}
                    material={materials.IhanMarble}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_68.geometry}
                    material={materials['mirror.nocompress']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_69.geometry}
                    material={materials.mur_vegetal_off___phong150}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_70.geometry}
                    material={materials.mur_vegetal_off___phong151}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_71.geometry}
                    material={materials.mur_vegetal_off___phong31}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_72.geometry}
                    material={materials.pack_002_sdb_deroule_papier___01___defaulte}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_73.geometry}
                    material={materials.pack_003_salon_television___material__83}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_75.geometry}
                    material={materials.pack_005_salle_de_sport_velo_appartement___nopaint_ecran}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_76.geometry}
                    material={materials.plante_interieur_off___bis_palmier_tronc2}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_78.geometry}
                    material={materials.plante_vase_off_001___phong37}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_79.geometry}
                    material={materials.porte_010___verre}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_8.geometry}
                    material={materials['Laminated Wood']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_8001.geometry}
                    material={materials.flower_pot}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_8002.geometry}
                    material={materials.flower_pot}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_8003.geometry}
                    material={materials['Plaster wall']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_8004.geometry}
                    material={materials['Plaster wall']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_8006.geometry}
                    material={materials['Material.002']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_8007.geometry}
                    material={materials.IhanMarble}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_8008.geometry}
                    material={materials.IhanMarble}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_8009.geometry}
                    material={materials.bathtub}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_8010.geometry}
                    material={materials.light2}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_80.geometry}
                    material={materials.metal2}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_81.geometry}
                    material={materials.prise_01____prise_prise_prisematerial__126}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_82.geometry}
                    material={materials.prise___material__49}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_83.geometry}
                    material={
                        materials.refrigerateur_006____refrigerateur_006_refrigerateur_006_refrigerateur_006glacon
                    }
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_84.geometry}
                    material={
                        materials.refrigerateur_006____refrigerateur_006_refrigerateur_006_refrigerateur_006porte
                    }
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_85.geometry}
                    material={materials['Jute Matting']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_86.geometry}
                    material={materials.table_basse_016___mat_vitresg}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_87.geometry}
                    material={materials.tex_terreau}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_89.geometry}
                    material={materials.tissus_030_ovcol868686colpic12contpic00}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_9.geometry}
                    material={materials.blanc_001_Room_Entity_Material}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_90.geometry}
                    material={materials.tissus_044_ovcolacacaccolpic12contpic02}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_91.geometry}
                    material={materials.tissus_065_ovcol868686colpic12contpic00}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_92.geometry}
                    material={materials.tissus_071_ovcolacacaccolpic12contpic02}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_93.geometry}
                    material={materials.vitrine_004___mat_vitresg}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_94.geometry}
                    material={materials.IhanMarble}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_95.geometry}
                    material={materials.wc_005____couvercle}
                />
                <RigidBody type="fixed" colliders="trimesh">
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.outside_floor.geometry}
                        material={materials.bitume_001_ovcol737373colpic12contpic11_Room_Entity_Material}
                    />
                </RigidBody>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.pine_trees.geometry}
                    material={materials.cypres___mat_cypres_feuille}
                />
                <RigidBody type="fixed" colliders="trimesh">
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.pool.geometry}
                        material={materials.poolTiles}
                    />
                </RigidBody>
                <WaterPool geometry={nodes.pool_water.geometry} playerRigidBodyRef={props.playerRigidBodyRef} />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.tree_pots.geometry}
                    material={materials.plante_interieur_off___phong80}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.tree_pots_thin.geometry}
                    material={materials.pack_004_salon_001_plante___nopaint_feuilles}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.tv_screen_1.geometry}
                    material={materials['mirror.nocompress']}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.tv_screen_2.geometry}
                    material={materials['mirror.nocompress']}
                />
                <RigidBody type="fixed" colliders="trimesh">
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.walls.geometry}
                        material={materials['Dirty Plaster']}
                    />
                </RigidBody>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.tv_screen_screen.geometry}
                    material={materials['mirror.nocompress']}
                    ref={tvScreenRef}
                >
                    {/* Only mount audio and video texture if sound is enabled or we're in the scene to manage resources efficiently */}
                    <meshBasicMaterial map={videoTexture} toneMapped={false} />
                     {props.isSoundEnabled && (
                        <positionalAudio
                            ref={(el) => {
                                // @ts-ignore
                                audioRef.current = el;
                                if (el && videoTexture.image instanceof HTMLVideoElement) {
                                    const video = videoTexture.image as any;
                                    if (!video._audioSource) {
                                        try {
                                            video._audioSource = el.context.createMediaElementSource(video);
                                        } catch (e) { }
                                    }
                                    if (video._audioSource) {
                                        el.setNodeSource(video._audioSource);
                                        el.setRefDistance(1);
                                        el.setRolloffFactor(1);
                                        el.setVolume(0.5);
                                        if (el.context.state === 'suspended') {
                                            el.context.resume();
                                        }
                                    }
                                }
                            }}
                            args={[listener]}
                            position={audioPos}
                            loop
                        />
                    )}
                </mesh>
            </group>
            <RigidBody type="fixed" colliders="trimesh">
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.building_bottom.geometry}
                    material={nodes.building_bottom.material}
                />
            </RigidBody>
            <RigidBody type="fixed" colliders="trimesh">
                {/* Replaced City Ground with Shader */}
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.city_ground.geometry}
                    ref={groundMat} // groundMat ref used for rotation logic?? No, for updating shader uniforms.
                >
                    <cityGroundShaderMaterial ref={groundMat} />
                </mesh>
            </RigidBody>
        </group>
    )
}


useGLTF.preload('/models/scene.glb')
