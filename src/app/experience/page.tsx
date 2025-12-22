"use client";

import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import ExperienceOverlay from "@/components/ExperienceOverlay";
import NavigationHUD from "@/components/NavigationHUD";
import { stopAllAudio } from "@/utils/audioManager";

import { ExperienceScene } from "@/components/ExperienceScene";

// Define controls
enum Controls {
    forward = 'forward',
    backward = 'backward',
    left = 'left',
    right = 'right',
    jump = 'jump',
    sprint = 'sprint',
}

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
    const [isReloading, setIsReloading] = useState(false);
    const [canLock, setCanLock] = useState(true);
    const router = useRouter();

    // Stop all audio when entering experience page
    useEffect(() => {
        stopAllAudio();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                router.push("/");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    // Handle lock with cooldown to prevent double-click freeze
    const handleLock = () => {
        if (!canLock) return;
        setIsLocked(true);
        setCanLock(false);
        // Re-enable after 1 second
        setTimeout(() => setCanLock(true), 1000);
    };

    const handleUnlock = () => {
        setIsLocked(false);
    };

    useEffect(() => {
        window.dispatchEvent(new CustomEvent("cursor:toggle", { detail: { hide: isLocked } }));
    }, [isLocked]);

    return (
        <KeyboardControls map={map}>
            <div className="experience-page" style={{ width: "100vw", height: "100vh", background: "#000" }}>
                <Canvas id="experience-canvas" style={{ width: "100%", height: "100%" }}>
                    <Suspense fallback={null}>
                        <ExperienceScene
                            onLock={handleLock}
                            onUnlock={handleUnlock}
                        />
                    </Suspense>
                </Canvas>

                {/* Navigation Overlay - visible when not locked */}
                <ExperienceOverlay isVisible={!isLocked} />

                {/* Navigation HUD - visible when locked (actively navigating) */}
                <NavigationHUD isVisible={isLocked} />

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
                        <p className="font-instrument-sans text-sm tracking-widest uppercase">Click to start navigation</p>
                    </div>
                )}
            </div>
        </KeyboardControls>
    );
}
