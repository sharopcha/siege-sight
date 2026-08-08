import type { MapManifest } from './types';

export const OREGON_MANIFEST: MapManifest = {
    key: 'OREGON',
    displayName: 'Oregon',
    footprint: { width: 48, depth: 48 },
    origin: { x: 0, y: 0, z: 0 },
    gridDivisions: 20,
    floors: [
        { index: -1, label: 'Basement', shortLabel: 'B', elevation: -3.5, ceiling: -0.5, color: '#06b6d4' },
        { index: 0, label: '1F — Ground', shortLabel: '1F', elevation: 0.0, ceiling: 3.0, color: '#10b981' },
        { index: 1, label: '2F — Dorms', shortLabel: '2F', elevation: 3.5, ceiling: 6.5, color: '#f59e0b' },
        { index: 2, label: 'Big Tower', shortLabel: 'TW', elevation: 7.0, ceiling: 12.0, color: '#6366f1' },
    ],
    roomLabelsByFloor: {
        [-1]: [
            { name: 'Laundry Room', x: -6, y: -4 },
            { name: 'Supply Room', x: 4, y: -4 },
            { name: 'Boiler Room', x: -10, y: 4 },
            { name: 'Blue Bunker', x: 10, y: 6 },
        ],
        0: [
            { name: 'Meeting Hall', x: -8, y: -6 },
            { name: 'Kitchen', x: 6, y: -6 },
            { name: 'Dining Hall', x: -2, y: 4 },
            { name: 'Small Tower', x: -12, y: 8 },
            { name: 'Showers', x: 10, y: 6 },
        ],
        1: [
            { name: 'Kids Dorms', x: -8, y: 6 },
            { name: 'Main Dorms', x: 4, y: 6 },
            { name: 'Armory', x: -6, y: -6 },
            { name: 'Attic', x: 8, y: -6 },
        ],
        2: [
            { name: 'Big Tower Roof', x: 12, y: 10 },
            { name: 'Main Roof', x: 0, y: 0 },
        ],
    },
    wallsByFloor: {
        [-1]: [
            { start: [-14, -10], end: [14, -10], isReinforced: true },
            { start: [14, -10], end: [14, 10], isReinforced: true },
            { start: [14, 10], end: [-14, 10], isReinforced: true },
            { start: [-14, 10], end: [-14, -10], isReinforced: true },
            { start: [0, -10], end: [0, 10], isReinforced: true, name: 'Laundry Hatch Wall' },
        ],
        0: [
            { start: [-16, -12], end: [16, -12], isReinforced: true },
            { start: [16, -12], end: [16, 12], isReinforced: true },
            { start: [16, 12], end: [-16, 12], isReinforced: true },
            { start: [-16, 12], end: [-16, -12], isReinforced: true },
            { start: [-4, -12], end: [-4, 12], isSoft: true, name: 'Meeting Wall' },
        ],
        1: [
            { start: [-14, -10], end: [14, -10], isReinforced: true },
            { start: [14, -10], end: [14, 10], isReinforced: true },
            { start: [14, 10], end: [-14, 10], isReinforced: true },
            { start: [-14, 10], end: [-14, -10], isReinforced: true },
            { start: [-14, 0], end: [14, 0], isSoft: true, name: 'Dorms Corridor' },
        ],
        2: [
            { start: [-16, -12], end: [16, -12] },
            { start: [16, -12], end: [16, 12] },
            { start: [16, 12], end: [-16, 12] },
            { start: [-16, 12], end: [-16, -12] },
        ],
    },
};
