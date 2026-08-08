import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { MatchManifest, PlayerPositionEvent } from '@/types/telemetry';
import { usePlaybackStore } from '@/store/playback-store';
import { useFilterStore } from '@/store/filter-store';
import { toWorld } from '@/lib/telemetry/transform';
import { TEAM_HEX } from '@/lib/maps/palette';

interface PlayerCursorMeshProps {
    manifest: MatchManifest;
}

function lerpAngle(a: number, b: number, t: number) {
    let diff = (b - a) % (2 * Math.PI);
    if (diff < -Math.PI) diff += 2 * Math.PI;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    return a + diff * t;
}

export function PlayerCursorMesh({ manifest }: PlayerCursorMeshProps) {
    const activeRoundId = useFilterStore((s) => s.activeRoundId);
    const activeTeam = useFilterStore((s) => s.activeTeam);
    const selectedPlayerIds = useFilterStore((s) => s.selectedPlayerIds);
    const visibleFloors = useFilterStore((s) => s.visibleFloors);
    const showAllPlayersAndLabels = useFilterStore((s) => s.showAllPlayersAndLabels);

    const groupRef = useRef<THREE.Group>(null);

    // Group events by tick and player for fast frame lookup
    const positionIndex = useMemo(() => {
        const map = new Map<string, PlayerPositionEvent>();
        for (const round of manifest.rounds) {
            for (const event of round.events) {
                if (event.type === 'POSITION') {
                    const key = `${event.roundId}:${event.tick}:${event.playerId}`;
                    map.set(key, event);
                }
            }
        }
        return map;
    }, [manifest]);

    const activeRound = useMemo(() => {
        return manifest.rounds.find((r) => r.roundId === activeRoundId) || manifest.rounds[0];
    }, [manifest, activeRoundId]);

    const players = useMemo(() => {
        const list: { id: string; nickname: string; teamSlot: 'BLUE' | 'ORANGE'; operator: string }[] = [];
        for (const team of manifest.teams) {
            for (const p of team.roster) {
                list.push({
                    id: p.playerId,
                    nickname: p.nickname,
                    teamSlot: team.slot,
                    operator: p.operator,
                });
            }
        }
        return list;
    }, [manifest]);

    // Update animated cursor positions in real time on frame tick
    useFrame(() => {
        if (!activeRound) return;
        const rawTick = usePlaybackStore.getState().cursorTick;
        const filterState = useFilterStore.getState();
        const activeVisibleFloors = filterState.visibleFloors;
        const activeShowAll = filterState.showAllPlayersAndLabels;

        // Events are generated at 4Hz (every 2 ticks: 0, 2, 4...)
        const tickA_even = Math.floor(rawTick / 2) * 2;
        const tickB_even = Math.min(activeRound.endTick, tickA_even + 2);
        const alpha = (rawTick - tickA_even) / 2;

        players.forEach((p) => {
            const keyA = `${activeRound.roundId}:${tickA_even}:${p.id}`;
            const keyB = `${activeRound.roundId}:${tickB_even}:${p.id}`;
            const posA = positionIndex.get(keyA);
            const posB = positionIndex.get(keyB);
            const child = groupRef.current?.getObjectByName(`player_${p.id}`);

            if (child) {
                const isFloorVisible = posA ? (activeShowAll || activeVisibleFloors.has(posA.floorIndex)) : false;

                if (posA && isFloorVisible) {
                    child.visible = true;
                    if (posB && alpha >= 0 && alpha <= 1) {
                        const [wxA, wyA, wzA] = toWorld(posA.position);
                        const [wxB, wyB, wzB] = toWorld(posB.position);
                        child.position.set(
                            wxA + (wxB - wxA) * alpha,
                            wyA + (wyB - wyA) * alpha,
                            wzA + (wzB - wzA) * alpha
                        );
                        child.rotation.y = lerpAngle(posA.yaw, posB.yaw, alpha);
                    } else {
                        const [wx, wy, wz] = toWorld(posA.position);
                        child.position.set(wx, wy, wz);
                        child.rotation.y = posA.yaw;
                    }
                    child.updateMatrix();
                    child.updateMatrixWorld(true);
                } else {
                    // Hide cursor mesh and move position deep offscreen to hide Html label
                    child.visible = false;
                    child.position.set(0, -9999, 0);
                    child.updateMatrix();
                    child.updateMatrixWorld(true);
                }
            }
        });
    });

    return (
        <group ref={groupRef}>
            {players.map((p) => {
                if (!(selectedPlayerIds as string[]).includes(p.id)) return null;
                if (activeTeam !== 'BOTH' && activeTeam !== p.teamSlot) return null;

                const hexColor = TEAM_HEX[p.teamSlot];

                return (
                    <group key={p.id} name={`player_${p.id}`} visible={false}>
                        {/* Player position sphere */}
                        <mesh position={[0, 0, 0]}>
                            <sphereGeometry args={[0.35, 16, 16]} />
                            <meshBasicMaterial color={hexColor} />
                        </mesh>

                        {/* Directional Cone / Yaw pointer */}
                        <mesh position={[0, 0, -0.6]} rotation={[-Math.PI / 2, 0, 0]}>
                            <coneGeometry args={[0.2, 0.5, 8]} />
                            <meshBasicMaterial color={hexColor} />
                        </mesh>

                        {/* Pulsing selection ring */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                            <ringGeometry args={[0.45, 0.55, 24]} />
                            <meshBasicMaterial color={hexColor} transparent opacity={0.6} side={THREE.DoubleSide} />
                        </mesh>

                        {/* Player Label HTML Overlay */}
                        <Html center position={[0, 0.8, 0]} distanceFactor={30} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
                            <div
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border shadow-md whitespace-nowrap"
                                style={{
                                    backgroundColor: 'rgba(9, 9, 11, 0.9)',
                                    borderColor: hexColor,
                                    color: hexColor,
                                }}
                            >
                                <span>{p.nickname}</span>
                                <span className="text-[9px] opacity-75 font-normal">({p.operator})</span>
                            </div>
                        </Html>
                    </group>
                );
            })}
        </group>
    );
}
