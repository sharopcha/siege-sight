import type { GameVec3 } from '@/types/spatial';
import type { MapKey } from '@/types/telemetry';

export interface FloorDefinition {
    readonly index: number;            // -1 basement, 0 ground/1F, 1 2F, 2 roof
    readonly label: string;
    readonly shortLabel: string;
    readonly elevation: number;        // game-space Z of the floor plane, metres
    readonly ceiling: number;          // game-space Z of the ceiling, metres
    readonly color: string;            // UI color token
}

export interface WallSegment {
    readonly start: readonly [x: number, y: number]; // game-space X, Y
    readonly end: readonly [x: number, y: number];
    readonly name?: string;
    readonly isReinforced?: boolean;
    readonly isSoft?: boolean;
}

export interface MapManifest {
    readonly key: MapKey;
    readonly displayName: string;
    readonly footprint: { readonly width: number; readonly depth: number }; // metres
    readonly origin: GameVec3;         // game-space centre of the footprint
    readonly floors: readonly FloorDefinition[];
    readonly gridDivisions: number;    // procedural grid density per floor
    readonly wallsByFloor: Readonly<Record<number, readonly WallSegment[]>>;
    readonly roomLabelsByFloor: Readonly<Record<number, readonly { name: string; x: number; y: number }[]>>;
}
