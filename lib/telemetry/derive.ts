import type { MatchManifest, FragEvent } from '@/types/telemetry';
import type { PlayerId, RoundId } from '@/types/brand';

export interface PlayerStats {
    playerId: PlayerId;
    nickname: string;
    operator: string;
    teamSlot: 'BLUE' | 'ORANGE';
    role: string;
    kills: number;
    deaths: number;
    kdRatio: number;
    headshots: number;
    wallbangs: number;
    crossFloorKills: number;
    avgKillDistance: number; // meters
    entryKills: number;
}

export interface MatchStats {
    totalRounds: number;
    blueScore: number;
    orangeScore: number;
    totalFrags: number;
    headshotRate: number;     // percentage 0-100
    wallbangRate: number;     // percentage 0-100
    crossFloorRate: number;   // percentage 0-100
    avgEngagementDist: number;
    playerLeaderboard: PlayerStats[];
    floorFragDistribution: Record<number, number>;
}

export function deriveMatchStats(manifest: MatchManifest): MatchStats {
    const allFrags: FragEvent[] = manifest.rounds.flatMap((r) =>
        r.events.filter((e): e is FragEvent => e.type === 'FRAG'),
    );

    let blueScore = 0;
    let orangeScore = 0;
    for (const round of manifest.rounds) {
        if (round.outcome.winner === 'BLUE') blueScore++;
        else if (round.outcome.winner === 'ORANGE') orangeScore++;
    }

    const totalFrags = allFrags.length;
    let headshots = 0;
    let wallbangs = 0;
    let crossFloorCount = 0;
    let totalDistance = 0;

    const floorFragDistribution: Record<number, number> = { [-1]: 0, 0: 0, 1: 0, 2: 0 };

    const playerMap = new Map<string, {
        nickname: string;
        operator: string;
        teamSlot: 'BLUE' | 'ORANGE';
        role: string;
        kills: number;
        deaths: number;
        headshots: number;
        wallbangs: number;
        crossFloorKills: number;
        distances: number[];
        entryKills: number;
    }>();

    // Initialize player map
    for (const team of manifest.teams) {
        for (const p of team.roster) {
            playerMap.set(p.playerId, {
                nickname: p.nickname,
                operator: p.operator,
                teamSlot: team.slot,
                role: p.role,
                kills: 0,
                deaths: 0,
                headshots: 0,
                wallbangs: 0,
                crossFloorKills: 0,
                distances: [],
                entryKills: 0,
            });
        }
    }

    // Track entry kills per round (first kill in round)
    const roundFirstKill = new Set<RoundId>();

    for (const frag of allFrags) {
        if (frag.headshot) headshots++;
        if (frag.throughSurface) wallbangs++;
        if (frag.killerFloorIndex !== frag.victimFloorIndex) crossFloorCount++;
        totalDistance += frag.distance;

        floorFragDistribution[frag.victimFloorIndex] = (floorFragDistribution[frag.victimFloorIndex] || 0) + 1;

        // Killer stats
        const killer = playerMap.get(frag.killerId);
        if (killer) {
            killer.kills++;
            if (frag.headshot) killer.headshots++;
            if (frag.throughSurface) killer.wallbangs++;
            if (frag.killerFloorIndex !== frag.victimFloorIndex) killer.crossFloorKills++;
            killer.distances.push(frag.distance);

            if (!roundFirstKill.has(frag.roundId)) {
                roundFirstKill.add(frag.roundId);
                killer.entryKills++;
            }
        }

        // Victim stats
        const victim = playerMap.get(frag.victimId);
        if (victim) {
            victim.deaths++;
        }
    }

    const playerLeaderboard: PlayerStats[] = Array.from(playerMap.entries()).map(([playerId, p]) => {
        const avgDist = p.distances.length > 0
            ? p.distances.reduce((a, b) => a + b, 0) / p.distances.length
            : 0;
        const kd = p.deaths === 0 ? p.kills : Number((p.kills / p.deaths).toFixed(2));
        return {
            playerId: playerId as PlayerId,
            nickname: p.nickname,
            operator: p.operator,
            teamSlot: p.teamSlot,
            role: p.role,
            kills: p.kills,
            deaths: p.deaths,
            kdRatio: kd,
            headshots: p.headshots,
            wallbangs: p.wallbangs,
            crossFloorKills: p.crossFloorKills,
            avgKillDistance: Number(avgDist.toFixed(1)),
            entryKills: p.entryKills,
        };
    });

    // Sort leaderboard by kills desc, then KD ratio
    playerLeaderboard.sort((a, b) => b.kills - a.kills || b.kdRatio - a.kdRatio);

    return {
        totalRounds: manifest.rounds.length,
        blueScore,
        orangeScore,
        totalFrags,
        headshotRate: totalFrags > 0 ? Number(((headshots / totalFrags) * 100).toFixed(1)) : 0,
        wallbangRate: totalFrags > 0 ? Number(((wallbangs / totalFrags) * 100).toFixed(1)) : 0,
        crossFloorRate: totalFrags > 0 ? Number(((crossFloorCount / totalFrags) * 100).toFixed(1)) : 0,
        avgEngagementDist: totalFrags > 0 ? Number((totalDistance / totalFrags).toFixed(1)) : 0,
        playerLeaderboard,
        floorFragDistribution,
    };
}
