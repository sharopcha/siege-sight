import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { MatchManifest, PlayerPositionEvent } from '@/types/telemetry';
import { useFilterStore } from '@/store/filter-store';
import { toWorld } from '@/lib/telemetry/transform';
import { TEAM_HEX } from '@/lib/maps/palette';

interface PlayerTrajectoryLinesProps {
    manifest: MatchManifest;
}

export function PlayerTrajectoryLines({ manifest }: PlayerTrajectoryLinesProps) {
    const activeRoundId = useFilterStore((s) => s.activeRoundId);
    const activeTeam = useFilterStore((s) => s.activeTeam);
    const selectedPlayerIds = useFilterStore((s) => s.selectedPlayerIds);
    const visibleFloors = useFilterStore((s) => s.visibleFloors);
    const showPaths = useFilterStore((s) => s.showPaths);
    const showAllPlayersAndLabels = useFilterStore((s) => s.showAllPlayersAndLabels);

    const groupRef = useRef<THREE.Group>(null);

    const activeRound = useMemo(() => {
        return manifest.rounds.find((r) => r.roundId === activeRoundId) || manifest.rounds[0];
    }, [manifest, activeRoundId]);

    // Group position events by player for active round
    const playerTrajectories = useMemo(() => {
        if (!activeRound) return new Map<string, { teamSlot: 'BLUE' | 'ORANGE'; events: PlayerPositionEvent[] }>();

        const playerTeamMap = new Map<string, 'BLUE' | 'ORANGE'>();
        for (const team of manifest.teams) {
            for (const p of team.roster) {
                playerTeamMap.set(p.playerId, team.slot);
            }
        }

        const map = new Map<string, { teamSlot: 'BLUE' | 'ORANGE'; events: PlayerPositionEvent[] }>();

        for (const event of activeRound.events) {
            if (event.type === 'POSITION') {
                const teamSlot = playerTeamMap.get(event.playerId) || 'BLUE';
                if (!map.has(event.playerId)) {
                    map.set(event.playerId, { teamSlot, events: [] });
                }
                map.get(event.playerId)!.events.push(event);
            }
        }

        map.forEach((val) => {
            val.events.sort((a, b) => a.tick - b.tick);
        });

        return map;
    }, [manifest, activeRound]);

    // Construct line geometry segments for each player trajectory
    const lineData = useMemo(() => {
        const list: { playerId: string; teamSlot: 'BLUE' | 'ORANGE'; geometry: THREE.BufferGeometry }[] = [];

        playerTrajectories.forEach(({ teamSlot, events }, playerId) => {
            if (events.length < 2) return;

            const positions: number[] = [];
            for (let i = 0; i < events.length - 1; i++) {
                const e1 = events[i];
                const e2 = events[i + 1];

                // Skip if floor is not visible or gap is too large
                if (!showAllPlayersAndLabels && !visibleFloors.has(e1.floorIndex) && !visibleFloors.has(e2.floorIndex)) continue;
                if (e2.tick - e1.tick > 25) continue;

                const [x1, y1, z1] = toWorld(e1.position);
                const [x2, y2, z2] = toWorld(e2.position);

                positions.push(x1, y1, z1, x2, y2, z2);
            }

            if (positions.length === 0) return;

            const geom = new THREE.BufferGeometry();
            geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            list.push({ playerId, teamSlot, geometry: geom });
        });

        return list;
    }, [playerTrajectories, visibleFloors, showAllPlayersAndLabels]);

    if (!showPaths) return null;

    return (
        <group ref={groupRef}>
            {lineData.map(({ playerId, teamSlot, geometry }) => {
                if (!(selectedPlayerIds as string[]).includes(playerId)) return null;
                if (activeTeam !== 'BOTH' && activeTeam !== teamSlot) return null;

                const hexColor = TEAM_HEX[teamSlot];

                return (
                    <lineSegments key={playerId} geometry={geometry}>
                        <lineBasicMaterial
                            color={hexColor}
                            transparent
                            opacity={0.7}
                            depthWrite={false}
                        />
                    </lineSegments>
                );
            })}
        </group>
    );
}
