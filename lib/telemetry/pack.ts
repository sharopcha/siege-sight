// Pack raw telemetry ticks into continuous linear Float32 buffers for WebGL attributes.
import type { MatchManifest, PlayerPositionEvent, FragEvent, TeamSlot } from '@/types/telemetry';
import type { PointCloudPayload, FragLinePayload, FragLineMeta, DrawSlice } from '@/types/payload';
import type { PlayerId } from '@/types/brand';
import { toWorld } from './transform';
import { TEAM_RGB, EVENT_RGB } from '@/lib/maps/palette';

export function teamSlotOf(manifest: MatchManifest, playerId: PlayerId): TeamSlot {
    for (const team of manifest.teams) {
        if (team.roster.some((p) => p.playerId === playerId)) {
            return team.slot;
        }
    }
    return 'BLUE';
}

export function playerLookupMap(manifest: MatchManifest): Map<string, { nickname: string; operator: string; teamSlot: TeamSlot }> {
    const map = new Map();
    for (const team of manifest.teams) {
        for (const player of team.roster) {
            map.set(player.playerId, {
                nickname: player.nickname,
                operator: player.operator,
                teamSlot: team.slot,
            });
        }
    }
    return map;
}

export function packPointCloud(manifest: MatchManifest): PointCloudPayload {
    // 1. Flatten + annotate with composite sort keys
    const rows = manifest.rounds.flatMap((round) =>
        round.events
            .filter((e): e is PlayerPositionEvent => e.type === 'POSITION')
            .map((e) => ({
                event: e,
                roundOrdinal: round.ordinal,
                roundId: round.roundId,
                teamSlot: teamSlotOf(manifest, e.playerId as PlayerId),
            })),
    );

    // 2. Hierarchical sort: round -> team -> player -> tick
    rows.sort(
        (a, b) =>
            a.roundOrdinal - b.roundOrdinal ||
            a.teamSlot.localeCompare(b.teamSlot) ||
            a.event.playerId.localeCompare(b.event.playerId) ||
            a.event.tick - b.event.tick,
    );

    // 3. Map playerIds to contiguous 0-indexed integers
    const playerIndexMap = new Map<string, number>();
    let pIndexCounter = 0;
    for (const team of manifest.teams) {
        for (const p of team.roster) {
            if (!playerIndexMap.has(p.playerId)) {
                playerIndexMap.set(p.playerId, pIndexCounter++);
            }
        }
    }

    // 4. Allocate Float32Arrays ONCE
    const n = rows.length;
    const positions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    const ticks = new Float32Array(n);
    const floorIndices = new Float32Array(n);
    const playerIndices = new Float32Array(n);

    const byRound: Record<string, DrawSlice> = {};
    const byRoundTeam: Record<string, DrawSlice> = {};
    const byRoundTeamPlayer: Record<string, DrawSlice> = {};

    for (let i = 0; i < n; i++) {
        const item = rows[i]!;
        const { event, roundId, teamSlot } = item;
        const [wx, wy, wz] = toWorld(event.position);
        const o = i * 3;

        positions[o] = wx;
        positions[o + 1] = wy;
        positions[o + 2] = wz;

        const rgb = TEAM_RGB[teamSlot];
        colors[o] = rgb[0];
        colors[o + 1] = rgb[1];
        colors[o + 2] = rgb[2];

        ticks[i] = event.tick;
        floorIndices[i] = event.floorIndex;
        playerIndices[i] = playerIndexMap.get(event.playerId) ?? 0;

        // Extend contiguous slice ranges
        extendSlice(byRound, roundId, i);
        extendSlice(byRoundTeam, `${roundId}:${teamSlot}`, i);
        extendSlice(byRoundTeamPlayer, `${roundId}:${teamSlot}:${event.playerId}`, i);
    }

    return {
        positions,
        colors,
        ticks,
        floorIndices,
        playerIndices,
        pointCount: n,
        slices: {
            all: { start: 0, count: n },
            byRound,
            byRoundTeam,
            byRoundTeamPlayer,
        },
    };
}

function extendSlice(index: Record<string, DrawSlice>, key: string, i: number): void {
    const existing = index[key];
    if (existing) {
        index[key] = { start: existing.start, count: i - existing.start + 1 };
    } else {
        index[key] = { start: i, count: 1 };
    }
}

export function packFragLines(manifest: MatchManifest): FragLinePayload {
    const players = playerLookupMap(manifest);
    const frags: FragEvent[] = manifest.rounds.flatMap((r) =>
        r.events.filter((e): e is FragEvent => e.type === 'FRAG'),
    );

    // Sort by round, tick
    frags.sort((a, b) => a.roundId.localeCompare(b.roundId) || a.tick - b.tick);

    const fragCount = frags.length;
    // 2 vertices per frag = 6 floats
    const positions = new Float32Array(fragCount * 6);
    const colors = new Float32Array(fragCount * 6);
    const killerFloorIndices = new Float32Array(fragCount * 2);
    const victimFloorIndices = new Float32Array(fragCount * 2);
    const meta: FragLineMeta[] = [];

    const byRound: Record<string, DrawSlice> = {};

    for (let i = 0; i < fragCount; i++) {
        const f = frags[i]!;
        const [kx, ky, kz] = toWorld(f.killerPosition);
        const [vx, vy, vz] = toWorld(f.victimPosition);

        const baseIdx = i * 6;
        // Vertex 0: Killer
        positions[baseIdx] = kx;
        positions[baseIdx + 1] = ky;
        positions[baseIdx + 2] = kz;
        // Vertex 1: Victim
        positions[baseIdx + 3] = vx;
        positions[baseIdx + 4] = vy;
        positions[baseIdx + 5] = vz;

        const killerData = players.get(f.killerId) || { nickname: f.killerId, operator: 'Recruit', teamSlot: 'BLUE' as TeamSlot };
        const victimData = players.get(f.victimId) || { nickname: f.victimId, operator: 'Recruit', teamSlot: 'ORANGE' as TeamSlot };
        const crossesFloors = f.killerFloorIndex !== f.victimFloorIndex;

        // Determine directional line color (Vertex 0 = Killer origin, Vertex 1 = Victim impact)
        const killerColor = TEAM_RGB[killerData.teamSlot] || [0.23, 0.51, 0.96];
        // Victim end: Crimson Red for standard kill, Orange/Yellow/Purple for special types
        let victimColor = EVENT_RGB.FRAG_NORMAL;
        if (f.headshot) victimColor = [0.98, 0.25, 0.25]; // Bright headshot red
        else if (f.throughSurface) victimColor = EVENT_RGB.FRAG_WALLBANG;
        else if (crossesFloors) victimColor = EVENT_RGB.FRAG_CROSS_FLOOR;

        // Apply directional gradient: Vertex 0 (Killer), Vertex 1 (Victim)
        colors[baseIdx] = killerColor[0];
        colors[baseIdx + 1] = killerColor[1];
        colors[baseIdx + 2] = killerColor[2];
        colors[baseIdx + 3] = victimColor[0];
        colors[baseIdx + 4] = victimColor[1];
        colors[baseIdx + 5] = victimColor[2];

        // Apply floor indices to both vertices
        killerFloorIndices[i * 2] = f.killerFloorIndex;
        killerFloorIndices[i * 2 + 1] = f.killerFloorIndex;
        victimFloorIndices[i * 2] = f.victimFloorIndex;
        victimFloorIndices[i * 2 + 1] = f.victimFloorIndex;

        meta.push({
            roundId: f.roundId,
            killerId: f.killerId,
            victimId: f.victimId,
            killerTeamSlot: killerData.teamSlot,
            victimTeamSlot: victimData.teamSlot,
            killerNickname: killerData.nickname,
            victimNickname: victimData.nickname,
            killerOperator: killerData.operator,
            victimOperator: victimData.operator,
            weapon: f.weapon,
            headshot: f.headshot,
            throughSurface: f.throughSurface,
            killerFloorIndex: f.killerFloorIndex,
            victimFloorIndex: f.victimFloorIndex,
            crossesFloors,
            distance: f.distance,
            tick: f.tick,
            killerWorldPos: [kx, ky, kz],
            victimWorldPos: [vx, vy, vz],
        });

        // Each frag is 2 vertices
        const vertStart = i * 2;
        const existingSlice = byRound[f.roundId];
        if (existingSlice) {
            byRound[f.roundId] = { start: existingSlice.start, count: existingSlice.count + 2 };
        } else {
            byRound[f.roundId] = { start: vertStart, count: 2 };
        }
    }

    return {
        positions,
        colors,
        killerFloorIndices,
        victimFloorIndices,
        fragCount,
        slices: {
            all: { start: 0, count: fragCount * 2 },
            byRound,
        },
        meta,
    };
}
