// Global audio manager for experience-background music
// This allows the music to persist across component unmounts

let experienceBackgroundMusic: HTMLAudioElement | null = null;
let windGrassSound: HTMLAudioElement | null = null;
let isGlobalMuted: boolean = false;

export const setGlobalMute = (muted: boolean) => {
    isGlobalMuted = muted;
    if (experienceBackgroundMusic) experienceBackgroundMusic.muted = muted;
    if (windGrassSound) windGrassSound.muted = muted;
};

export const getGlobalMute = () => isGlobalMuted;

// Web Audio API context and analyser for visualization
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;

// Track connected sources to prevent double-connection errors
const connectedSources = new WeakSet<HTMLAudioElement>();

// Initialize Web Audio API
const initAudioContext = () => {
    if (typeof window !== "undefined" && !audioContext) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256; // Smaller FFT size for smoother waveform
            analyser.smoothingTimeConstant = 0.8;
        }
    }
    return audioContext;
};

// Helper: Connect an audio element to the analyser (exported for use in other components)
export const connectSourceToAnalyser = (audioElement: HTMLAudioElement) => {
    const ctx = initAudioContext();
    if (ctx && analyser && !connectedSources.has(audioElement)) {
        try {
            const source = ctx.createMediaElementSource(audioElement);
            source.connect(analyser);
            analyser.connect(ctx.destination);
            connectedSources.add(audioElement);
        } catch (e) {
            console.warn("Audio source connection failed (likely CORS or already connected):", e);
        }
    }
};

export const getAudioAnalyser = () => {
    return analyser;
};

export const resumeAudioContext = () => {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
};

export const startExperienceBackgroundMusic = () => {
    if (typeof window !== "undefined" && !experienceBackgroundMusic) {
        experienceBackgroundMusic = new Audio('/sounds/SFX/experience-background.mp3');
        experienceBackgroundMusic.loop = true;
        experienceBackgroundMusic.volume = 0.2;
        experienceBackgroundMusic.muted = isGlobalMuted;

        connectSourceToAnalyser(experienceBackgroundMusic);

        experienceBackgroundMusic.play().catch(() => { });
    }
};

export const stopExperienceBackgroundMusic = () => {
    if (experienceBackgroundMusic) {
        experienceBackgroundMusic.pause();
        experienceBackgroundMusic.currentTime = 0;
        experienceBackgroundMusic = null;
    }
};

export const startWindGrassSound = () => {
    if (typeof window !== "undefined" && !windGrassSound) {
        windGrassSound = new Audio('/sounds/SFX/wind-n-grass.mp3');
        windGrassSound.loop = true;
        windGrassSound.volume = 0.3;
        windGrassSound.muted = isGlobalMuted;
        
        connectSourceToAnalyser(windGrassSound);
        
        windGrassSound.play().catch(() => { });
    }
};

export const stopWindGrassSound = () => {
    if (windGrassSound) {
        windGrassSound.pause();
        windGrassSound.currentTime = 0;
        windGrassSound = null;
    }
};

export const stopAllAudio = () => {
    stopExperienceBackgroundMusic();
    stopWindGrassSound();
};

export const playClickSound = () => {
    if (typeof window !== "undefined") {
        const clickSound = new Audio('/sounds/SFX/click.mp3');
        clickSound.volume = 0.4;
        clickSound.muted = isGlobalMuted;
        
        connectSourceToAnalyser(clickSound);

        clickSound.play().catch(() => { });
    }
};

export const getExperienceBackgroundMusic = () => experienceBackgroundMusic;
export const getWindGrassSound = () => windGrassSound;

