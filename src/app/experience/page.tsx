"use client";

import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PointerLockControls, KeyboardControls, useKeyboardControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useRef, useEffect, useState } from "react";
import { Penthouse } from "@/components/PentHouse";
import * as THREE from "three";

// Define controls
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
    const WALK_SPEED = 5;
    const SPRINT_SPEED = 10;
    const JUMP_FORCE = 5;
    const GRAVITY = 15;
    
    // Y-velocity for jumping
    const velocityY = useRef(0);
    const isJumping = useRef(false);

    useFrame((state, delta) => {
        const { forward, backward, left, right, sprint, jump } = get()
        
        const speed = sprint ? SPRINT_SPEED : WALK_SPEED;

        direction.current.x = Number(Boolean(right)) - Number(Boolean(left))
        direction.current.z = Number(Boolean(forward)) - Number(Boolean(backward))
        direction.current.normalize()

        // Movement (X/Z)
        if (forward || backward || left || right) {
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
        if (camera.position.y < 4) {
            camera.position.y = 4;
            velocityY.current = 0;
            isJumping.current = false;
        }
    })
    return null;
}

const ExperienceScene = ({ onLock, onUnlock }: { onLock: () => void, onUnlock: () => void }) => {
    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Environment preset="city" />

            {/* Camera starts inside the penthouse */}
            <PerspectiveCamera makeDefault position={[0, 2, 0]} />
            
            <PointerLockControls 
                selector="#experience-canvas" 
                onLock={onLock}
                onUnlock={onUnlock}
            />
            <Player />

            <group scale={[3, 3, 3]} position={[0, -2, 0]}>
                 <Penthouse /> 
            </group>
        </>
    );
};

export default function ExperiencePage() {
    const map = [
        { name: Controls.forward, keys: ['ArrowUp', 'w', 'W'] },
        { name: Controls.backward, keys: ['ArrowDown', 's', 'S'] },
        { name: Controls.left, keys: ['ArrowLeft', 'a', 'A'] },
        { name: Controls.right, keys: ['ArrowRight', 'd', 'D'] },
        { name: Controls.jump, keys: ['Space'] },
        { name: Controls.sprint, keys: ['Shift'] },
      ]

    const [isLocked, setIsLocked] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                router.push("/");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    return (
        <KeyboardControls map={map}>
            <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
                <Canvas id="experience-canvas" style={{ width: "100%", height: "100%" }}>
                    <Suspense fallback={null}>
                        <ExperienceScene 
                            onLock={() => setIsLocked(true)} 
                            onUnlock={() => setIsLocked(false)} 
                        />
                    </Suspense>
                </Canvas>
                {!isLocked && (
                    <div style={{
                        position: "absolute", 
                        top: "50%", 
                        left: "50%", 
                        transform: "translate(-50%, -50%)", 
                        color: "white", 
                        pointerEvents: "none",
                        textAlign: "center"
                    }}>
                        <p>Click to start navigation</p>
                        <p style={{fontSize: "0.8em", opacity: 0.7}}>WASD to move, Mouse to look</p>
                    </div>
                )}
            </div>
        </KeyboardControls>
    );
}
