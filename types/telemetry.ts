import type { MatchId, RoundId, PlayerId, Tick } from './brand';
import type { GameVec3 } from './spatial';

export type Side = 'ATTACK' | 'DEFENCE';
export type TeamSlot = 'BLUE' | 'ORANGE';
export type MapKey = 'CLUBHOUSE' | 'OREGON' | 'BANK' | 'KAFE';

export interface MatchManifest {
    readonly matchId: MatchId;
    readonly schemaVersion: 2;
    readonly map: MapKey;                 // 'CLUBHOUSE' | 'OREGON' | ...
    readonly tickRate: number;            // Hz — divides ticks into seconds (default 4Hz)
    readonly event: { name: string; stage: string; recordedAt: string }; // ISO 8601
    readonly teams: readonly [TeamMeta, TeamMeta];
    readonly rounds: readonly Round[];
}

export interface TeamMeta {
    readonly slot: TeamSlot;
    readonly name: string;
    readonly side: Side;
    readonly roster: readonly PlayerMeta[];
}

export interface PlayerMeta {
    readonly playerId: PlayerId;
    readonly nickname: string;
    readonly teamSlot: TeamSlot;
    readonly operator: string;
    readonly role: 'ENTRY' | 'SUPPORT' | 'FLEX' | 'ANCHOR' | 'ROAMER';
}

export interface Round {
    readonly roundId: RoundId;
    readonly ordinal: number;             // 1-indexed
    readonly site: BombSite;
    readonly startTick: Tick;
    readonly endTick: Tick;
    readonly outcome: RoundOutcome;
    readonly operatorPicks: Readonly<Record<PlayerId, OperatorPick>>;
    readonly events: readonly TelemetryEvent[];  // sorted ascending by tick
}

export interface RoundOutcome {
    readonly winner: TeamSlot;
    readonly condition: 'ELIMINATION' | 'DEFUSER_PLANTED' | 'DEFUSER_DISABLED' | 'TIME_EXPIRED';
}

export interface OperatorPick {
    readonly operator: string;
    readonly side: Side;
}

export interface BombSite {
    readonly name: string;
    readonly code: string;
    readonly floorIndex: number;
}

interface TelemetryEventBase {
    readonly tick: Tick;
    readonly roundId: RoundId;
}

export interface PlayerPositionEvent extends TelemetryEventBase {
    readonly type: 'POSITION';
    readonly playerId: PlayerId;
    readonly position: GameVec3;
    readonly yaw: number;                 // radians, 0 = +X
    readonly pitch: number;               // radians
    readonly stance: 'STAND' | 'CROUCH' | 'PRONE' | 'RAPPEL';
    readonly floorIndex: number;          // pre-bucketed server-side
}

export interface FragEvent extends TelemetryEventBase {
    readonly type: 'FRAG';
    readonly killerId: PlayerId;
    readonly victimId: PlayerId;
    readonly killerPosition: GameVec3;
    readonly victimPosition: GameVec3;
    readonly killerFloorIndex: number;
    readonly victimFloorIndex: number;
    readonly weapon: string;
    readonly headshot: boolean;
    readonly throughSurface: boolean;     // wallbang / soft-breach penetration
    readonly distance: number;            // metres, precomputed
}

export interface GadgetEvent extends TelemetryEventBase {
    readonly type: 'GADGET';
    readonly ownerId: PlayerId;
    readonly gadget: string;
    readonly action: 'DEPLOY' | 'DESTROY' | 'TRIGGER';
    readonly position: GameVec3;
    readonly floorIndex: number;
}

export interface BreachEvent extends TelemetryEventBase {
    readonly type: 'BREACH';
    readonly actorId: PlayerId;
    readonly surface: 'SOFT_WALL' | 'HATCH' | 'REINFORCED_WALL' | 'BARRICADE';
    readonly position: GameVec3;
    readonly floorIndex: number;
}

export interface ObjectiveEvent extends TelemetryEventBase {
    readonly type: 'OBJECTIVE';
    readonly action: 'PLANT_START' | 'PLANT_COMPLETE' | 'DEFUSE_START' | 'DEFUSE_COMPLETE';
    readonly actorId: PlayerId;
    readonly position: GameVec3;
    readonly floorIndex: number;
}

export type TelemetryEvent =
    | PlayerPositionEvent
    | FragEvent
    | GadgetEvent
    | BreachEvent
    | ObjectiveEvent;
