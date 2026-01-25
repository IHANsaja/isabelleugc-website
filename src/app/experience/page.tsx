"use client";

import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import ExperienceOverlay from "@/components/ExperienceOverlay";
import ExperienceTransitionLoader from "@/components/ExperienceTransitionLoader";
import { useProgress } from "@react-three/drei";
import NavigationHUD from "@/components/NavigationHUD";
import TVControlPanel from "@/components/TVControlPanel";
import MobileJoystick from "@/components/MobileJoystick";
import MobileActionButtons from "@/components/MobileActionButtons";
import MobileLookControls from "@/components/MobileLookControls";
import { stopAllAudio } from "@/utils/audioManager";
import { TVInteractionProvider, useTVInteraction } from "@/context/TVInteractionContext";
import { MobileControlsProvider, useMobileControls } from "@/context/MobileControlsContext";
import { useSound } from "@/context/SoundContext";

import { ExperienceScene } from "@/components/ExperienceScene";

// Define controls
enum Controls {
    forward = 'forward',
    backward = 'backward',
    left = 'left',
    right = 'right',
    jump = 'jump',
    sprint = 'sprint',
    interact = 'interact',
}

// Inner component that uses TV context
function ExperienceContent({ isLocked }: { isLocked: boolean }) {
    const { isLookingAtTV, isPanelOpen, togglePanel, setIsPanelOpen } = useTVInteraction();
    const { isMobile } = useMobileControls();

    // Exit pointer lock when panel opens so user can interact with UI
    useEffect(() => {
        if (isPanelOpen && document.pointerLockElement) {
            document.exitPointerLock();
        }
        // Toggle cursor visibility (only on desktop)
        if (!isMobile) {
            window.dispatchEvent(new CustomEvent("cursor:toggle", { detail: { hide: !isPanelOpen && isLocked } }));
        }
    }, [isPanelOpen, isLocked, isMobile]);

    // Handle E key for TV interaction
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // When panel is open, E closes it (works even when pointer is unlocked)
            if ((e.key === 'e' || e.key === 'E')) {
                if (isPanelOpen) {
                    setIsPanelOpen(false);
                } else if (isLocked && isLookingAtTV) {
                    togglePanel();
                }
            }
        };

        // Handle left click for TV interaction (only when locked and looking at TV)
        const handleClick = (e: MouseEvent) => {
            if (e.button === 0 && isLocked && isLookingAtTV && !isPanelOpen) {
                togglePanel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('click', handleClick);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('click', handleClick);
        };
    }, [isLookingAtTV, isPanelOpen, togglePanel, isLocked, setIsPanelOpen]);

    return (
        <>
            {/* Navigation HUD - visible when locked (actively navigating) - desktop only */}
            {!isMobile && (
                <NavigationHUD isVisible={isLocked && !isPanelOpen} isLookingAtTV={isLookingAtTV && !isPanelOpen} />
            )}

            {/* TV Control Panel - visible when panel is open */}
            <TVControlPanel isVisible={isPanelOpen} />

            {/* Mobile Controls */}
            <MobileJoystick />
            <MobileActionButtons />
            <MobileLookControls isActive={isLocked && !isPanelOpen} />
        </>
    );
}

export default function ExperiencePage() {
    const map = [
        { name: Controls.forward, keys: ['ArrowUp', 'w', 'W'] },
        { name: Controls.backward, keys: ['ArrowDown', 's', 'S'] },
        { name: Controls.left, keys: ['ArrowLeft', 'a', 'A'] },
        { name: Controls.right, keys: ['ArrowRight', 'd', 'D'] },
        { name: Controls.jump, keys: ['Space'] },
        { name: Controls.sprint, keys: ['Shift'] },
        { name: Controls.interact, keys: ['e', 'E'] },
    ]

    const [isLocked, setIsLocked] = useState(false);
    const [canLock, setCanLock] = useState(true);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const router = useRouter();

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth <= 1024;
            setIsMobileDevice(isTouchDevice && isSmallScreen);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-lock for mobile (no pointer lock needed)
    useEffect(() => {
        if (isMobileDevice) {
            setIsLocked(true);
        }
    }, [isMobileDevice]);

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

    // Asset Loading State
    const { progress } = useProgress();
    const [isSceneReady, setIsSceneReady] = useState(false);
    const [showLoader, setShowLoader] = useState(true);

    const { isSoundEnabled } = useSound();

    // Track when loading is finished
    useEffect(() => {
        if (progress === 100) {
            // Small buffer to ensure render and prevent flickering
            const timer = setTimeout(() => setIsSceneReady(true), 500);
            return () => clearTimeout(timer);
        }
    }, [progress]);

    // Handle lock with cooldown to prevent double-click freeze
    const handleLock = () => {
        if (!canLock) return;
        setIsLocked(true);
        setCanLock(false);
        setTimeout(() => setCanLock(true), 1000);
    };

    const handleUnlock = () => {
        // Don't unlock on mobile
        if (!isMobileDevice) {
            setIsLocked(false);
        }
    };

    useEffect(() => {
        if (!isMobileDevice) {
            window.dispatchEvent(new CustomEvent("cursor:toggle", { detail: { hide: isLocked } }));
        }
    }, [isLocked, isMobileDevice]);

    return (
        <MobileControlsProvider>
            <TVInteractionProvider>
                <KeyboardControls map={map}>
                    <div className="experience-page" style={{ width: "100vw", height: "100vh", background: "#000" }}>
                        <Canvas
                            id="experience-canvas"
                            style={{ width: "100%", height: "100%" }}
                            dpr={isMobileDevice ? [0.5, 1] : [1, 2]}
                            performance={{ min: 0.5 }}
                            gl={{
                                powerPreference: "high-performance",
                                antialias: !isMobileDevice,
                                stencil: false,
                                depth: true,
                            }}
                        >
                            <Suspense fallback={null}>
                                <ExperienceScene
                                    onLock={handleLock}
                                    onUnlock={handleUnlock}
                                    isMobile={isMobileDevice}
                                    isSoundEnabled={isSoundEnabled}
                                />
                            </Suspense>
                        </Canvas>

                        {/* Navigation Overlay - visible when not locked (desktop only) */}
                        {!isMobileDevice && <ExperienceOverlay isVisible={!isLocked} />}

                        {/* TV-aware content & Mobile controls */}
                        <ExperienceContent isLocked={isLocked} />

                        {/* Desktop: Click to start prompt */}
                        {!isLocked && !isMobileDevice && (
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

                        {/* Mobile: Back button */}
                        {isMobileDevice && (
                            <button
                                onClick={() => router.push("/")}
                                className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/40 border border-white/20 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}

                        {/* Loading Transition Overlay (Persistent from Home) */}
                        {showLoader && (
                            <ExperienceTransitionLoader 
                                initialState="visible" 
                                isFinished={isSceneReady}
                                progress={progress}
                                onComplete={() => setShowLoader(false)}
                            />
                        )}
                    </div>
                </KeyboardControls>
            </TVInteractionProvider>
        </MobileControlsProvider>
    );
}
