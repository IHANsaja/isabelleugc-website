"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Environment, PointerLockControls, useKeyboardControls, PerspectiveCamera } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { SceneModel } from "@/components/SceneModel";
import { stopWindGrassSound } from "@/utils/audioManager";
import { Physics, RigidBody, CapsuleCollider } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";

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
    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const direction = useRef(new THREE.Vector3())

    // Real-world units (Meters)
    const WALK_SPEED = 4.0; // m/s
    const SPRINT_SPEED = 8.0; // m/s
    const JUMP_FORCE = 2.5; // Impulse strength (reduced for realistic jump)
    const PLAYER_HEIGHT = 1.8; // Total height
    const EYE_OFFSET = 0.7; // Eye level from capsule center

    // Track if player has moved to stop wind-n-grass sound
    const hasMovedRef = useRef(false);
    const canJumpRef = useRef(true);

    // Set initial camera position
    useEffect(() => {
        camera.position.set(0, PLAYER_HEIGHT, 0);
    }, [camera]);

    useFrame(() => {
        if (!rigidBodyRef.current) return;

        const { forward, backward, left, right, sprint, jump } = get()
        const speed = sprint ? SPRINT_SPEED : WALK_SPEED;

        // Get camera's forward direction (ignore Y for horizontal movement)
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        // Get camera's right direction
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
        cameraRight.normalize();

        // Calculate movement direction based on input and camera orientation
        direction.current.set(0, 0, 0);
        if (forward) direction.current.add(cameraDirection);
        if (backward) direction.current.sub(cameraDirection);
        if (right) direction.current.add(cameraRight);
        if (left) direction.current.sub(cameraRight);
        direction.current.normalize();

        // Get current velocity to preserve Y velocity (gravity)
        const currentVel = rigidBodyRef.current.linvel();

        // Apply horizontal movement
        if (forward || backward || left || right) {
            // Stop wind-n-grass sound on first movement
            if (!hasMovedRef.current) {
                stopWindGrassSound();
                hasMovedRef.current = true;
            }

            rigidBodyRef.current.setLinvel({
                x: direction.current.x * speed,
                y: currentVel.y, // Preserve vertical velocity
                z: direction.current.z * speed
            }, true);
        } else {
            // Stop horizontal movement when no input
            rigidBodyRef.current.setLinvel({
                x: 0,
                y: currentVel.y,
                z: 0
            }, true);
        }

        // Jumping - check if on ground (low Y velocity)
        if (jump && canJumpRef.current && Math.abs(currentVel.y) < 0.1) {
            rigidBodyRef.current.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true);
            canJumpRef.current = false;
            setTimeout(() => { canJumpRef.current = true; }, 500); // Cooldown
        }

        // Sync camera position to physics body
        const position = rigidBodyRef.current.translation();
        camera.position.set(position.x, position.y + EYE_OFFSET, position.z);
    })

    return (
        <RigidBody
            ref={rigidBodyRef}
            position={[8, 2, 2.5]}
            enabledRotations={[false, false, false]} // Lock rotation
            mass={1}
            type="dynamic"
            colliders={false}
            lockRotations
        >
            <CapsuleCollider args={[0.5, 0.3]} /> {/* half-height, radius */}
        </RigidBody>
    );
}

export const ExperienceScene = ({ onLock, onUnlock }: { onLock: () => void, onUnlock: () => void }) => {
    return (
        <>
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Environment files="/hdr/skybox.hdr" background />

            {/* Camera starts at human eye level */}
            <PerspectiveCamera makeDefault position={[0, 1.6, 0]} />

            <PointerLockControls
                selector="#experience-canvas"
                onLock={onLock}
                onUnlock={onUnlock}
            />

            {/* Real-world scale (1 unit = 1 meter) */}
            <Physics gravity={[0, -9.81, 0]}>
                <Player />
                <group scale={[1, 1, 1]} position={[0, 0, 0]}>
                    <SceneModel />
                </group>
            </Physics>
        </>
    );
};
