import { z } from 'zod';

const gameVec3 = z.object({ x: z.number(), y: z.number(), z: z.number() });

const positionEvent = z.object({
    type: z.literal('POSITION'),
    tick: z.number().int().nonnegative(),
    roundId: z.string().min(1),
    playerId: z.string().min(1),
    position: gameVec3,
    yaw: z.number(),
    pitch: z.number(),
    stance: z.enum(['STAND', 'CROUCH', 'PRONE', 'RAPPEL']),
    floorIndex: z.number().int(),
});

const fragEvent = z.object({
    type: z.literal('FRAG'),
    tick: z.number().int().nonnegative(),
    roundId: z.string().min(1),
    killerId: z.string().min(1),
    victimId: z.string().min(1),
    killerPosition: gameVec3,
    victimPosition: gameVec3,
    killerFloorIndex: z.number().int(),
    victimFloorIndex: z.number().int(),
    weapon: z.string(),
    headshot: z.boolean(),
    throughSurface: z.boolean(),
    distance: z.number(),
});

const gadgetEvent = z.object({
    type: z.literal('GADGET'),
    tick: z.number().int().nonnegative(),
    roundId: z.string().min(1),
    ownerId: z.string().min(1),
    gadget: z.string(),
    action: z.enum(['DEPLOY', 'DESTROY', 'TRIGGER']),
    position: gameVec3,
    floorIndex: z.number().int(),
});

const breachEvent = z.object({
    type: z.literal('BREACH'),
    tick: z.number().int().nonnegative(),
    roundId: z.string().min(1),
    actorId: z.string().min(1),
    surface: z.enum(['SOFT_WALL', 'HATCH', 'REINFORCED_WALL', 'BARRICADE']),
    position: gameVec3,
    floorIndex: z.number().int(),
});

const objectiveEvent = z.object({
    type: z.literal('OBJECTIVE'),
    tick: z.number().int().nonnegative(),
    roundId: z.string().min(1),
    action: z.enum(['PLANT_START', 'PLANT_COMPLETE', 'DEFUSE_START', 'DEFUSE_COMPLETE']),
    actorId: z.string().min(1),
    position: gameVec3,
    floorIndex: z.number().int(),
});

export const telemetryEventSchema = z.discriminatedUnion('type', [
    positionEvent,
    fragEvent,
    gadgetEvent,
    breachEvent,
    objectiveEvent,
]);

export const playerMetaSchema = z.object({
    playerId: z.string(),
    nickname: z.string(),
    teamSlot: z.enum(['BLUE', 'ORANGE']),
    operator: z.string(),
    role: z.enum(['ENTRY', 'SUPPORT', 'FLEX', 'ANCHOR', 'ROAMER']),
});

export const teamMetaSchema = z.object({
    slot: z.enum(['BLUE', 'ORANGE']),
    name: z.string(),
    side: z.enum(['ATTACK', 'DEFENCE']),
    roster: z.array(playerMetaSchema),
});

export const matchManifestSchema = z.object({
    matchId: z.string(),
    schemaVersion: z.literal(2),
    map: z.enum(['CLUBHOUSE', 'OREGON', 'BANK', 'KAFE']),
    tickRate: z.number().positive(),
    event: z.object({ name: z.string(), stage: z.string(), recordedAt: z.string() }),
    teams: z.tuple([teamMetaSchema, teamMetaSchema]),
    rounds: z.array(
        z.object({
            roundId: z.string(),
            ordinal: z.number().int().positive(),
            site: z.object({ name: z.string(), code: z.string(), floorIndex: z.number().int() }),
            startTick: z.number().int().nonnegative(),
            endTick: z.number().int().nonnegative(),
            outcome: z.object({
                winner: z.enum(['BLUE', 'ORANGE']),
                condition: z.enum(['ELIMINATION', 'DEFUSER_PLANTED', 'DEFUSER_DISABLED', 'TIME_EXPIRED']),
            }),
            operatorPicks: z.record(
                z.string(),
                z.object({ operator: z.string(), side: z.enum(['ATTACK', 'DEFENCE']) }),
            ),
            events: z.array(telemetryEventSchema),
        }),
    ).min(1),
});

export type ParsedManifest = z.infer<typeof matchManifestSchema>;
