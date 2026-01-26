"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { startWind1Sound, stopWind1Sound, setWind1Volume, getWind1Volume } from "@/utils/audioManager";

interface WindEffectProps {
    count?: number;
    enabled?: boolean;
}

export const WindEffect = ({ count = 200, enabled = true }: WindEffectProps) => {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.PointsMaterial>(null);
    const audioStarted = useRef(false);
    const targetOpacity = useRef(0);

    // Initialize audio
    useEffect(() => {
        if (enabled) {
            startWind1Sound();
            audioStarted.current = true;
        }
    }, [enabled]);

    // Particle logic
    const { positions, velocities, sizes } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const vel = new Float32Array(count * 3);
        const sz = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Distribute in a box around the penthouse area
            // Approx penthouse area: X: -10 to 10, Y: 0 to 10, Z: -10 to 10
            pos[i * 3] = (Math.random() - 0.5) * 40;
            pos[i * 3 + 1] = Math.random() * 20;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 40;

            // Mostly blowing in one direction (towards +X)
            vel[i * 3] = 0.5 + Math.random() * 0.5; // X speed
            vel[i * 3 + 1] = (Math.random() - 0.5) * 0.1; // Slight Y variation
            vel[i * 3 + 2] = (Math.random() - 0.5) * 0.2; // Slight Z variation

            sz[i] = 0.05 + Math.random() * 0.1;
        }

        return { positions: pos, velocities: vel, sizes: sz };
    }, [count]);

    useFrame((state, delta) => {
        if (!materialRef.current) return;

        // Smoothly update opacity and volume
        targetOpacity.current = enabled ? 0.3 : 0;
        
        // Visual fading
        materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity.current, delta * 2);

        // Audio fading
        const currentAudioVol = getWind1Volume();
        const targetAudioVol = enabled ? 0.4 : 0;
        
        // Only lerp if we have an active sound or we are fading out
        if (enabled || currentAudioVol > 0.001) {
            const newAudioVol = THREE.MathUtils.lerp(currentAudioVol, targetAudioVol, delta * 2);
            setWind1Volume(newAudioVol);

            // Cleanup audio if fully faded out
            if (!enabled && newAudioVol < 0.005 && audioStarted.current) {
                stopWind1Sound();
                audioStarted.current = false;
            }
        }

        if (pointsRef.current) {
            const posAttr = pointsRef.current.geometry.attributes.position;
            const positions = posAttr.array as Float32Array;

            for (let i = 0; i < count; i++) {
                // Apply velocity
                positions[i * 3] += velocities[i * 3] * delta * 5;
                positions[i * 3 + 1] += velocities[i * 3 + 1] * delta * 5;
                positions[i * 3 + 2] += velocities[i * 3 + 2] * delta * 5;

                // Reset particles that go too far
                if (positions[i * 3] > 20) {
                    positions[i * 3] = -20;
                    positions[i * 3 + 1] = Math.random() * 20;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
                }
            }

            posAttr.needsUpdate = true;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                ref={materialRef}
                size={0.08}
                transparent
                opacity={0}
                color="#ffffff"
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                sizeAttenuation
            />
        </points>
    );
};
