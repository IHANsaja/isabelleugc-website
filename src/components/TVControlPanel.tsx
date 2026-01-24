"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTVInteraction } from "@/context/TVInteractionContext";

interface TVControlPanelProps {
    isVisible: boolean;
}

const TVControlPanel: React.FC<TVControlPanelProps> = ({ isVisible }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(isVisible);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const { videoElement, setIsPanelOpen } = useTVInteraction();

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
        }
    }, [isVisible]);

    // Sync with video element
    useEffect(() => {
        if (!videoElement) return;

        const handleTimeUpdate = () => {
            setCurrentTime(videoElement.currentTime);
            setProgress((videoElement.currentTime / videoElement.duration) * 100 || 0);
        };

        const handleLoadedMetadata = () => {
            setDuration(videoElement.duration);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        videoElement.addEventListener('timeupdate', handleTimeUpdate);
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.addEventListener('play', handlePlay);
        videoElement.addEventListener('pause', handlePause);
        videoElement.addEventListener('volumechange', () => setIsMuted(videoElement.muted)); // Sync mute UI

        // Initial sync
        setIsPlaying(!videoElement.paused);
        setIsMuted(videoElement.muted);
        setVolume(videoElement.volume);
        if (videoElement.duration) setDuration(videoElement.duration);

        return () => {
            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
            videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
            videoElement.removeEventListener('play', handlePlay);
            videoElement.removeEventListener('pause', handlePause);
            videoElement.removeEventListener('volumechange', () => setIsMuted(videoElement.muted));
        };
    }, [videoElement]);

    useGSAP(() => {
        if (!containerRef.current) return;

        const tl = gsap.timeline({
            onComplete: () => {
                if (!isVisible) setShouldRender(false);
            }
        });

        if (isVisible && shouldRender) {
            tl.set(".tv-control-element", { opacity: 0, y: 20 })
                .to(".tv-control-element", {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: "power2.out"
                });
        } else if (!isVisible && shouldRender) {
            tl.to(".tv-control-element", {
                opacity: 0,
                y: 20,
                duration: 0.2,
                stagger: 0.02,
                ease: "power2.in"
            });
        }
    }, { scope: containerRef, dependencies: [isVisible, shouldRender] });

    const togglePlay = useCallback(() => {
        if (!videoElement) return;
        if (videoElement.paused) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    }, [videoElement]);

    const toggleMute = useCallback(() => {
        if (!videoElement) return;
        videoElement.muted = !videoElement.muted;
        setIsMuted(videoElement.muted);
    }, [videoElement]);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoElement) return;
        const newVolume = parseFloat(e.target.value);
        videoElement.volume = newVolume;
        setVolume(newVolume);
        if (newVolume === 0) {
            videoElement.muted = true;
            setIsMuted(true);
        } else if (videoElement.muted) {
            videoElement.muted = false;
            setIsMuted(false);
        }
    }, [videoElement]);

    const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoElement || !progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const clickPos = (e.clientX - rect.left) / rect.width;
        videoElement.currentTime = clickPos * videoElement.duration;
    }, [videoElement]);

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleClose = useCallback(() => {
        setIsPanelOpen(false);
    }, [setIsPanelOpen]);

    if (!shouldRender) return null;

    return (
        <div ref={containerRef} className="absolute inset-0 z-50 pointer-events-none flex items-end justify-center pb-24">
            {/* Main Control Panel */}
            <div className="tv-control-element pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-[420px] shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-sec-gold animate-pulse"></div>
                        <span className="text-white/70 font-instrument-sans text-[10px] uppercase tracking-[0.2em]">TV Control</span>
                    </div>
                    <button 
                        onClick={handleClose}
                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        <svg className="w-3 h-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Progress Bar */}
                <div 
                    ref={progressRef}
                    onClick={handleProgressClick}
                    className="tv-control-element relative h-1.5 bg-white/10 rounded-full cursor-pointer mb-4 group"
                >
                    <div 
                        className="absolute h-full bg-gradient-to-r from-sec-gold to-sec-light-gold rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `calc(${progress}% - 6px)` }}
                    />
                </div>

                {/* Time Display */}
                <div className="tv-control-element flex justify-between text-white/40 font-instrument-sans text-[10px] mb-4">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>

                {/* Controls Row */}
                <div className="tv-control-element flex items-center justify-between">
                    {/* Left: Volume */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={toggleMute}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            {isMuted || volume === 0 ? (
                                <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            )}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                        />
                    </div>

                    {/* Center: Play/Pause */}
                    <button 
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-sec-gold to-sec-light-gold hover:from-sec-light-gold hover:to-sec-gold flex items-center justify-center transition-all shadow-lg hover:scale-105"
                    >
                        {isPlaying ? (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    {/* Right: Hint */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                            <div className="w-4 h-4 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white/50 text-[8px] font-bold">E</div>
                            <span className="text-white/30 font-instrument-sans text-[9px] uppercase tracking-wider">Close</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TVControlPanel;
