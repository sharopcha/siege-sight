import type { RoundId, PlayerId, Tick } from './brand';
import type { TeamSlot } from './telemetry';

/** A contiguous slice of the master buffer, addressable via geometry.setDrawRange. */
export interface DrawSlice {
    readonly start: number;   // vertex offset
    readonly count: number;   // vertex count
}

export interface PointCloudPayload {
    /** Interleaved XYZ in WORLD space. length === pointCount * 3 */
    readonly positions: Float32Array;
    /** Interleaved RGB, 0–1, baked per point from team/player identity. length === pointCount * 3 */
    readonly colors: Float32Array;
    /** Per-point tick, for playback scrubbing. length === pointCount */
    readonly ticks: Float32Array;
    /** Per-point floor index for filtering. length === pointCount */
    readonly floorIndices: Float32Array;
    /** Per-point player 0-indexed ID for shader selection filtering. length === pointCount */
    readonly playerIndices: Float32Array;
    readonly pointCount: number;

    /**
     * Hierarchical range index. Buffer is sorted by (roundOrdinal, teamSlot, playerId, tick),
     * so any PREFIX of that key is a single contiguous slice.
     */
    readonly slices: {
        readonly all: DrawSlice;
        readonly byRound: Readonly<Record<string, DrawSlice>>;
        readonly byRoundTeam: Readonly<Record<string, DrawSlice>>;   // `${roundId}:${teamSlot}`
        readonly byRoundTeamPlayer: Readonly<Record<string, DrawSlice>>;
    };
}

export interface FragLinePayload {
    /** Two vertices per frag: killer then victim, WORLD space. length === fragCount * 6 */
    readonly positions: Float32Array;
    /** Two vertices per frag, RGB. length === fragCount * 6 */
    readonly colors: Float32Array;
    readonly killerFloorIndices: Float32Array;
    readonly victimFloorIndices: Float32Array;
    readonly fragCount: number;
    readonly slices: {
        readonly all: DrawSlice;
        readonly byRound: Readonly<Record<string, DrawSlice>>;
    };
    /** Parallel metadata for hover/inspection. */
    readonly meta: readonly FragLineMeta[];
}

export interface FragLineMeta {
    readonly roundId: RoundId;
    readonly killerId: PlayerId;
    readonly victimId: PlayerId;
    readonly killerTeamSlot: TeamSlot;
    readonly victimTeamSlot: TeamSlot;
    readonly killerNickname: string;
    readonly victimNickname: string;
    readonly killerOperator: string;
    readonly victimOperator: string;
    readonly weapon: string;
    readonly headshot: boolean;
    readonly throughSurface: boolean;
    readonly killerFloorIndex: number;
    readonly victimFloorIndex: number;
    readonly crossesFloors: boolean;
    readonly distance: number;
    readonly tick: Tick;
    readonly killerWorldPos: readonly [number, number, number];
    readonly victimWorldPos: readonly [number, number, number];
}
