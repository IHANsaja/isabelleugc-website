"use client";

import React, { useEffect, useRef } from "react";
import { useSound } from "@/context/SoundContext";
import { getAudioAnalyser, resumeAudioContext } from "@/utils/audioManager";

const SoundButton = () => {
    const { isSoundEnabled, toggleSound, mounted } = useSound();
    // Treat as muted if not yet mounted (avoids hydration mismatch)
    const effectiveSoundEnabled = mounted && isSoundEnabled;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);

    const handleToggle = () => {
        resumeAudioContext();
        toggleSound();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // High-DPI scaling
        const dpr = window.devicePixelRatio || 1;
        const size = 64; // Logical size
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.scale(dpr, dpr);

        // Time tracking for radius growth
        let playbackTime = 0;
        let lastTimestamp = performance.now();

        // Visualizer loop
        const draw = (timestamp: number) => {
            const analyser = getAudioAnalyser();
            const centerX = size / 2;
            const centerY = size / 2;

            // Calculate delta time
            const deltaTime = (timestamp - lastTimestamp) / 1000; // seconds
            lastTimestamp = timestamp;

            // Track playback time when sound is enabled
            if (effectiveSoundEnabled && analyser) {
                playbackTime += deltaTime;
            } else {
                playbackTime = 0; // Reset when muted
            }

            // Dynamic radius growth after 30 seconds
            // Grows from 0 to max 6 pixels over 60 seconds (after the initial 30s threshold)
            const GROWTH_THRESHOLD = 30; // seconds
            const MAX_GROWTH = 6; // max additional pixels
            const GROWTH_DURATION = 60; // seconds to reach max growth

            let radiusGrowth = 0;
            if (playbackTime > GROWTH_THRESHOLD) {
                const growthProgress = Math.min((playbackTime - GROWTH_THRESHOLD) / GROWTH_DURATION, 1);
                radiusGrowth = growthProgress * MAX_GROWTH;
            }

            const baseRadius = 20 + radiusGrowth; // Growing base radius
            const maxRadius = 28 + radiusGrowth; // Growing max radius

            ctx.clearRect(0, 0, size, size);

            const primaryColor = '#F6F3E8';
            const secondaryColor = 'rgba(246, 243, 232, 0.25)';
            const glowColor = 'rgba(246, 243, 232, 0.15)';

            // Draw static inner circle (always visible)
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius - 4, 0, Math.PI * 2);
            ctx.strokeStyle = secondaryColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            if (effectiveSoundEnabled && analyser) {
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyser.getByteTimeDomainData(dataArray);

                // Draw radial waveform
                const drawRadialWave = (color: string, lineWidth: number, amplification: number, radiusOffset: number = 0) => {
                    ctx.beginPath();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = lineWidth;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';

                    // Use fewer points for smoother circle (sample every Nth point)
                    const sampleRate = 4;
                    const points = Math.floor(bufferLength / sampleRate);

                    for (let i = 0; i <= points; i++) {
                        const dataIndex = Math.min(i * sampleRate, bufferLength - 1);
                        const v = dataArray[dataIndex] / 128.0; // 0..2 (1 is center)
                        const deviation = (v - 1) * amplification; // -1..1 amplified

                        const angle = (i / points) * Math.PI * 2 - Math.PI / 2; // Start from top
                        const radius = baseRadius + radiusOffset + deviation * (maxRadius - baseRadius);

                        const x = centerX + Math.cos(angle) * radius;
                        const y = centerY + Math.sin(angle) * radius;

                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }

                    ctx.closePath();
                    ctx.stroke();
                };

                // Outer glow layer - glow intensity also grows slightly
                ctx.shadowColor = glowColor;
                ctx.shadowBlur = 10 + radiusGrowth;

                // Ghost wave (wider, lower opacity)
                drawRadialWave(secondaryColor, 1.5, 2.5, 2);

                // Primary wave (sharp, high visibility)
                ctx.shadowBlur = 5 + radiusGrowth * 0.5;
                drawRadialWave(primaryColor, 2, 4, 0);

                ctx.shadowBlur = 0;

            } else {
                // Static circle when muted
                ctx.beginPath();
                ctx.arc(centerX, centerY, 20, 0, Math.PI * 2); // Fixed 20 for muted state
                ctx.strokeStyle = secondaryColor;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw mute icon (diagonal line through center)
                ctx.beginPath();
                ctx.moveTo(centerX - 8, centerY - 8);
                ctx.lineTo(centerX + 8, centerY + 8);
                ctx.strokeStyle = 'rgba(246, 243, 232, 0.5)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [effectiveSoundEnabled, mounted]);

    return (
        <button
            onClick={handleToggle}
            className="fixed top-6 left-0 right-0 mx-auto w-fit z-[10000] flex flex-col items-center gap-2 group cursor-none pointer-events-auto"
            aria-label={effectiveSoundEnabled ? "Mute sound" : "Unmute sound"}
        >
            <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:bg-black/40 hover:border-white/20 active:scale-95 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                {/* Radial Visualizer Canvas */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0"
                />
            </div>

            {/* Label */}
            <span className="text-[9px] font-bold tracking-[0.2em] text-white mix-blend-difference uppercase">
                {effectiveSoundEnabled ? "Sound" : "Muted"}
            </span>
        </button>
    );
};

export default SoundButton;
