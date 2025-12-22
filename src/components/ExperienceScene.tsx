"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Environment, PointerLockControls, useKeyboardControls, PerspectiveCamera } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { Penthouse } from "@/components/PentHouse";
import { stopWindGrassSound } from "@/utils/audioManager";

enum Controls {
    forward = 'forward',
    backward = 'backward',
    left = 'left',
    right = 'right',
    jump = 'jump',
    sprint = 'sprint',
}

const Player = () => {
    const [, get] = useKeyboardControls<Controls>()
    const { camera } = useThree();
    const velocity = useRef(new THREE.Vector3())
    const direction = useRef(new THREE.Vector3())

    // Real-world units (Meters)
    const WALK_SPEED = 1.5; // ~5.4 km/h
    const SPRINT_SPEED = 4.0; // ~14.4 km/h
    const JUMP_FORCE = 5.0; // Moderate jump
    const GRAVITY = 9.81; // Earth gravity
    const EYE_LEVEL = 1.6; // Average eye level

    // Y-velocity for jumping
    const velocityY = useRef(0);
    const isJumping = useRef(false);

    // Track if player has moved to stop wind-n-grass sound
    const hasMovedRef = useRef(false);

    useFrame((state, delta) => {
        const { forward, backward, left, right, sprint, jump } = get()

        const speed = sprint ? SPRINT_SPEED : WALK_SPEED;

        direction.current.x = Number(Boolean(right)) - Number(Boolean(left))
        direction.current.z = Number(Boolean(forward)) - Number(Boolean(backward))
        direction.current.normalize()

        // Movement (X/Z)
        if (forward || backward || left || right) {
            // Stop wind-n-grass sound on first movement
            if (!hasMovedRef.current) {
                stopWindGrassSound();
                hasMovedRef.current = true;
            }

            const moveX = direction.current.x * speed * delta;
            const moveZ = direction.current.z * speed * delta;
            camera.translateX(moveX);
            camera.translateZ(-moveZ);
        }

        // Jumping (Y)
        if (jump && !isJumping.current) {
            velocityY.current = JUMP_FORCE;
            isJumping.current = true;
        }

        // Apply Gravity
        velocityY.current -= GRAVITY * delta;
        camera.position.y += velocityY.current * delta;

        // Floor Collision
        if (camera.position.y < EYE_LEVEL) {
            camera.position.y = EYE_LEVEL;
            velocityY.current = 0;
            isJumping.current = false;
        }
    })
    return null;
}

export const ExperienceScene = ({ onLock, onUnlock }: { onLock: () => void, onUnlock: () => void }) => {
    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Environment files="/hdr/shanghai_night.hdr" background />

            {/* Camera starts at human eye level */}
            <PerspectiveCamera makeDefault position={[0, 1.6, 0]} />

            <PointerLockControls
                selector="#experience-canvas"
                onLock={onLock}
                onUnlock={onUnlock}
            />
            <Player />

            {/* Real-world scale (1 unit = 1 meter) */}
            <group scale={[1, 1, 1]} position={[0, 0, 0]}>
                <Penthouse />
            </group>
        </>
    );
};
