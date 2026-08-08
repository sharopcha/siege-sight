import type { MapManifest } from './types';

export const CLUBHOUSE_MANIFEST: MapManifest = {
    key: 'CLUBHOUSE',
    displayName: 'Clubhouse',
    footprint: { width: 50, depth: 50 },
    origin: { x: 0, y: 0, z: 0 },
    gridDivisions: 20,
    floors: [
        { index: -1, label: 'Basement', shortLabel: 'B', elevation: -3.5, ceiling: -0.5, color: '#06b6d4' },
        { index: 0, label: '1F — Ground', shortLabel: '1F', elevation: 0.0, ceiling: 3.0, color: '#10b981' },
        { index: 1, label: '2F — Executive', shortLabel: '2F', elevation: 3.5, ceiling: 6.5, color: '#f59e0b' },
        { index: 2, label: 'Roof / Sky', shortLabel: 'RF', elevation: 7.0, ceiling: 10.0, color: '#6366f1' },
    ],
    roomLabelsByFloor: {
        [-1]: [
            { name: 'Arsenal Room', x: -8, y: -6 },
            { name: 'Church', x: 6, y: -6 },
            { name: 'Blue Hallway', x: -12, y: 2 },
            { name: 'Utility', x: 2, y: 8 },
        ],
        0: [
            { name: 'Bar', x: -10, y: -8 },
            { name: 'Stock Room', x: -14, y: 2 },
            { name: 'Kitchen', x: -4, y: 6 },
            { name: 'Strip Club', x: 8, y: -8 },
            { name: 'Garage', x: 12, y: 6 },
        ],
        1: [
            { name: 'CCTV Room', x: 8, y: 8 },
            { name: 'Cash Room', x: 12, y: -2 },
            { name: 'Executive Bedroom', x: -8, y: 6 },
            { name: 'Gym', x: -12, y: -4 },
            { name: 'Logistics Office', x: -4, y: -8 },
        ],
        2: [
            { name: 'Main Roof', x: 0, y: 0 },
            { name: 'CCTV Balcony', x: 10, y: 10 },
            { name: 'Gym Balcony', x: -14, y: -4 },
        ],
    },
    wallsByFloor: {
        [-1]: [
            // Arsenal & Church perimeter
            { start: [-16, -12], end: [16, -12], isReinforced: true },
            { start: [16, -12], end: [16, 12], isReinforced: true },
            { start: [16, 12], end: [-16, 12], isReinforced: true },
            { start: [-16, 12], end: [-16, -12], isReinforced: true },
            // Internal dividers
            { start: [0, -12], end: [0, 4], isReinforced: true, name: 'Church Wall' },
            { start: [-16, 0], end: [0, 0], isSoft: true, name: 'Arsenal Soft Wall' },
            { start: [0, 4], end: [16, 4], isSoft: true, name: 'Utility Wall' },
        ],
        0: [
            // Ground Floor perimeter
            { start: [-18, -14], end: [18, -14], isReinforced: true },
            { start: [18, -14], end: [18, 14], isReinforced: true },
            { start: [18, 14], end: [-18, 14], isReinforced: true },
            { start: [-18, 14], end: [-18, -14], isReinforced: true },
            // Dividers: Bar / Stock / Kitchen / Garage
            { start: [-6, -14], end: [-6, 14], isSoft: true, name: 'Bar / Kitchen Wall' },
            { start: [6, -14], end: [6, 14], isReinforced: true, name: 'Garage Main Wall' },
            { start: [-18, 0], end: [6, 0], isSoft: true },
        ],
        1: [
            // 2F Executive perimeter
            { start: [-16, -12], end: [16, -12], isReinforced: true },
            { start: [16, -12], end: [16, 12], isReinforced: true },
            { start: [16, 12], end: [-16, 12], isReinforced: true },
            { start: [-16, 12], end: [-16, -12], isReinforced: true },
            // CCTV & Cash Room Wall
            { start: [4, -12], end: [4, 12], isReinforced: true, name: 'CCTV Wall' },
            { start: [-16, 2], end: [4, 2], isSoft: true, name: 'Gym / Bedroom Wall' },
            { start: [4, 4], end: [16, 4], isSoft: true, name: 'CCTV / Cash Divider' },
        ],
        2: [
            // Roof parapets
            { start: [-18, -14], end: [18, -14] },
            { start: [18, -14], end: [18, 14] },
            { start: [18, 14], end: [-18, 14] },
            { start: [-18, 14], end: [-18, -14] },
        ],
    },
};
