// Global audio manager for experience-background music
// This allows the music to persist across component unmounts

let experienceBackgroundMusic: HTMLAudioElement | null = null;
let windGrassSound: HTMLAudioElement | null = null;
let wind1Sound: HTMLAudioElement | null = null;
let landingIntroMusic: HTMLAudioElement | null = null;
let isGlobalMuted: boolean = true;

export const setGlobalMute = (muted: boolean) => {
    isGlobalMuted = muted;
    if (experienceBackgroundMusic) experienceBackgroundMusic.muted = muted;
    if (windGrassSound) windGrassSound.muted = muted;
    if (wind1Sound) wind1Sound.muted = muted;
    if (landingIntroMusic) landingIntroMusic.muted = muted;
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

export const startLandingIntroMusic = () => {
    if (typeof window !== "undefined" && !landingIntroMusic) {
        landingIntroMusic = new Audio('/sounds/SFX/landing_intro.mp3');
        landingIntroMusic.loop = true;
        landingIntroMusic.volume = 0.3;
        landingIntroMusic.muted = isGlobalMuted;

        connectSourceToAnalyser(landingIntroMusic);

        landingIntroMusic.play().catch(() => { });
    } else if (landingIntroMusic && landingIntroMusic.paused) {
        landingIntroMusic.play().catch(() => { });
    }
};

export const pauseLandingIntroMusic = () => {
    if (landingIntroMusic) {
        landingIntroMusic.pause();
    }
};

export const stopLandingIntroMusic = () => {
    if (landingIntroMusic) {
        landingIntroMusic.pause();
        landingIntroMusic.currentTime = 0;
        landingIntroMusic = null;
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

export const startWind1Sound = () => {
    if (typeof window !== "undefined" && !wind1Sound) {
        wind1Sound = new Audio('/sounds/SFX/wind1.mp3');
        wind1Sound.loop = true;
        wind1Sound.volume = 0;
        wind1Sound.muted = isGlobalMuted;

        connectSourceToAnalyser(wind1Sound);

        wind1Sound.play().catch(e => console.warn("Audio: wind1Sound play failed:", e));
    } else if (wind1Sound && wind1Sound.paused) {
        wind1Sound.play().catch(() => { });
    }
};

export const setWind1Volume = (volume: number) => {
    if (wind1Sound) {
        const targetVol = Math.max(0, Math.min(0.4, volume));
        wind1Sound.volume = targetVol;
    }
};

export const getWind1Volume = () => wind1Sound ? wind1Sound.volume : 0;

export const stopWind1Sound = () => {
    if (wind1Sound) {
        wind1Sound.pause();
        wind1Sound.currentTime = 0;
        wind1Sound = null;
    }
};

export const stopAllAudio = () => {
    stopExperienceBackgroundMusic();
    stopWindGrassSound();
    stopWind1Sound();
    stopLandingIntroMusic();
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

