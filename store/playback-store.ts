import { create } from 'zustand';
import type { Tick } from '@/types/brand';

interface PlaybackState {
    cursorTick: Tick;
    maxTick: Tick;
    isPlaying: boolean;
    speed: number;

    setCursor: (t: Tick) => void;
    setMaxTick: (t: Tick) => void;
    togglePlay: () => void;
    setPlaying: (playing: boolean) => void;
    setSpeed: (speed: number) => void;
    stepForward: () => void;
    stepBackward: () => void;
    reset: () => void;
}

export const usePlaybackStore = create<PlaybackState>()((set, get) => ({
    cursorTick: 0 as Tick,
    maxTick: 360 as Tick,
    isPlaying: false,
    speed: 1,

    setCursor: (cursorTick) => set({ cursorTick }),
    setMaxTick: (maxTick) => set({ maxTick }),
    togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
    setPlaying: (isPlaying) => set({ isPlaying }),
    setSpeed: (speed) => set({ speed }),
    stepForward: () => {
        const { cursorTick, maxTick } = get();
        const next = Math.min(maxTick, cursorTick + 4);
        set({ cursorTick: next as Tick });
    },
    stepBackward: () => {
        const { cursorTick } = get();
        const prev = Math.max(0, cursorTick - 4);
        set({ cursorTick: prev as Tick });
    },
    reset: () => set({ cursorTick: 0 as Tick, isPlaying: false }),
}));
