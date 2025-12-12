"use client";

import { Suspense, useRef, useEffect } from "react";
import { Penthouse } from "./PentHouse";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Animated wrapper component for the Penthouse
const AnimatedPenthouse = (props: any) => {
    const groupRef = useRef<THREE.Group>(null);

    useGSAP(() => {
        if (groupRef.current) {
            // Create a slow shake animation using GSAP
            gsap.to(groupRef.current.rotation, {
                y: 0.05,
                duration: 3,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });

            gsap.to(groupRef.current.rotation, {
                x: 0.02,
                duration: 4,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });

            gsap.to(groupRef.current.position, {
                y: props.position[1] + 0.3,
                duration: 2.5,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });
        }

        return () => {
            if (groupRef.current) {
                gsap.killTweensOf(groupRef.current.rotation);
                gsap.killTweensOf(groupRef.current.position);
            }
        };
    }, [props.position]);

    return (
        <group ref={groupRef} position={props.position}>
            <Penthouse scale={props.scale} />
        </group>
    );
};

const PenthouseWrapper = () => {
    return (
        <Canvas style={{ width: "100vw", height: "100vh" }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 1, 10]} intensity={1} />
            <PerspectiveCamera makeDefault position={[0, 15, 17]} />
            <Environment preset="sunset" />
            <Suspense>
                <AnimatedPenthouse position={[0, 10, -7]} scale={0.4} />
            </Suspense>
        </Canvas>
    );
};

export default PenthouseWrapper;
