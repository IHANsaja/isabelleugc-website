// Global audio manager for experience-background music
// This allows the music to persist across component unmounts

let experienceBackgroundMusic: HTMLAudioElement | null = null;

export const startExperienceBackgroundMusic = () => {
    if (typeof window !== "undefined" && !experienceBackgroundMusic) {
        experienceBackgroundMusic = new Audio('/sounds/SFX/experience-background.mp3');
        experienceBackgroundMusic.loop = true;
        experienceBackgroundMusic.volume = 0.2;
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

export const getExperienceBackgroundMusic = () => experienceBackgroundMusic;
