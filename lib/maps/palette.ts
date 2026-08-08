import type { TeamSlot } from '@/types/telemetry';

export type RGBTriplet = readonly [r: number, g: number, b: number];

export const TEAM_RGB: Record<TeamSlot, RGBTriplet> = {
    BLUE: [0.23, 0.51, 0.96],     // High-chroma electric blue #3b82f6
    ORANGE: [0.98, 0.45, 0.09],   // High-chroma tactical orange #f97316
};

export const TEAM_HEX: Record<TeamSlot, string> = {
    BLUE: '#3b82f6',
    ORANGE: '#f97316',
};

export const EVENT_RGB = {
    FRAG_NORMAL: [0.94, 0.27, 0.27] as RGBTriplet,       // Red #ef4444
    FRAG_HEADSHOT: [0.98, 0.45, 0.09] as RGBTriplet,     // Orange #f97316
    FRAG_WALLBANG: [0.92, 0.70, 0.03] as RGBTriplet,     // Yellow #eab308
    FRAG_CROSS_FLOOR: [0.66, 0.33, 0.97] as RGBTriplet,  // Purple #a855f7
    PLANT: [0.16, 0.78, 0.52] as RGBTriplet,             // Emerald #10b981
};

export const EVENT_HEX = {
    FRAG_NORMAL: '#ef4444',
    FRAG_HEADSHOT: '#f97316',
    FRAG_WALLBANG: '#eab308',
    FRAG_CROSS_FLOOR: '#a855f7',
    PLANT: '#10b981',
};

export const FLOOR_COLORS: Record<number, string> = {
    [-1]: '#06b6d4',  // Cyan (Basement)
    0: '#10b981',     // Emerald (Ground / 1F)
    1: '#f59e0b',     // Amber (2F / First Floor)
    2: '#6366f1',     // Indigo (Roof / Sky)
};

export const SURFACE_BASE = '#09090b'; // Dark background for WebGL clear color
