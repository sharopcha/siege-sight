import { useMemo } from 'react';
import * as THREE from 'three';
import type { FragLinePayload, FragLineMeta } from '@/types/payload';
import { useFilterStore } from '@/store/filter-store';
import { useSelectionStore } from '@/store/selection-store';
import { usePlaybackStore } from '@/store/playback-store';

interface FragLineFieldProps {
    payload: FragLinePayload;
}

interface FragVectorProps {
    frag: FragLineMeta;
    isFocused?: boolean;
    onClick?: () => void;
    onPointerOver?: () => void;
    onPointerOut?: () => void;
}

function FragVector3D({ frag, isFocused = false, onClick, onPointerOver, onPointerOut }: FragVectorProps) {
    const start = useMemo(() => new THREE.Vector3(...frag.killerWorldPos), [frag.killerWorldPos]);
    const end = useMemo(() => new THREE.Vector3(...frag.victimWorldPos), [frag.victimWorldPos]);

    const { midpoint, quaternion, arrowPos, length } = useMemo(() => {
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(end, start);
        const len = dir.length();
        const normDir = len > 0.001 ? dir.clone().normalize() : new THREE.Vector3(0, 1, 0);
        const vecY = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(vecY, normDir);
        const arrPos = new THREE.Vector3().lerpVectors(start, end, 0.75);
        return { midpoint: mid, quaternion: quat, arrowPos: arrPos, length: len };
    }, [start, end]);

    const lineHexColor = frag.crossesFloors
        ? '#c084fc'
        : frag.headshot
            ? '#ef4444'
            : frag.killerTeamSlot === 'BLUE'
                ? '#3b82f6'
                : '#f97316';

    const cylinderRadius = isFocused ? 0.06 : 0.04;
    const opacity = isFocused ? 1.0 : 0.85;

    return (
        <group
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                onPointerOver?.();
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                onPointerOut?.();
            }}
        >
            {/* 3D Line Cylinder */}
            {length > 0.05 && (
                <mesh position={midpoint} quaternion={quaternion}>
                    <cylinderGeometry args={[cylinderRadius, cylinderRadius, length, 8]} />
                    <meshBasicMaterial color={lineHexColor} transparent opacity={opacity} toneMapped={false} />
                </mesh>
            )}

            {/* Killer Origin Marker: Team ring & sphere */}
            <mesh position={[start.x, start.y + 0.02, start.z]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={isFocused ? [0.25, 0.45, 20] : [0.2, 0.35, 16]} />
                <meshBasicMaterial
                    color={frag.killerTeamSlot === 'BLUE' ? '#3b82f6' : '#f97316'}
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.9}
                />
            </mesh>
            <mesh position={[start.x, start.y + 0.08, start.z]}>
                <sphereGeometry args={isFocused ? [0.12, 12, 12] : [0.09, 12, 12]} />
                <meshBasicMaterial color={frag.killerTeamSlot === 'BLUE' ? '#60a5fa' : '#fb923c'} />
            </mesh>

            {/* Victim Death Marker: Red ring & sphere */}
            <mesh position={[end.x, end.y + 0.02, end.z]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={isFocused ? [0.28, 0.52, 20] : [0.22, 0.42, 16]} />
                <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} transparent opacity={0.9} />
            </mesh>
            <mesh position={[end.x, end.y + 0.08, end.z]}>
                <sphereGeometry args={isFocused ? [0.14, 12, 12] : [0.11, 12, 12]} />
                <meshBasicMaterial color="#f87171" />
            </mesh>

            {/* Direction Arrow Head Cone pointing towards Victim */}
            {length > 0.4 && (
                <mesh position={arrowPos} quaternion={quaternion}>
                    <coneGeometry args={isFocused ? [0.28, 0.7, 12] : [0.22, 0.55, 8]} />
                    <meshBasicMaterial color="#ef4444" toneMapped={false} />
                </mesh>
            )}
        </group>
    );
}

export function FragLineField({ payload }: FragLineFieldProps) {
    const activeRoundId = useFilterStore((s) => s.activeRoundId);
    const showFrags = useFilterStore((s) => s.showFrags);
    const visibleFloors = useFilterStore((s) => s.visibleFloors);
    const showAllPlayersAndLabels = useFilterStore((s) => s.showAllPlayersAndLabels);
    const selectedPlayerIds = useFilterStore((s) => s.selectedPlayerIds);
    const activeTeam = useFilterStore((s) => s.activeTeam);

    const selectedFrag = useSelectionStore((s) => s.selectedFrag);
    const hoveredFrag = useSelectionStore((s) => s.hoveredFrag);
    const setSelectedFrag = useSelectionStore((s) => s.setSelectedFrag);
    const setHoveredFrag = useSelectionStore((s) => s.setHoveredFrag);
    const setCursor = usePlaybackStore((s) => s.setCursor);

    // Filter frags based on active round, visible floors, and player/team filters
    const activeFrags = useMemo(() => {
        if (!showFrags) return [];

        return payload.meta.filter((f) => {
            // 1. Round filter
            if (activeRoundId && f.roundId !== activeRoundId) return false;

            // 2. Floor filter
            const floorVis =
                showAllPlayersAndLabels ||
                visibleFloors.has(f.killerFloorIndex) ||
                visibleFloors.has(f.victimFloorIndex);
            if (!floorVis) return false;

            // 3. Player filter
            const selectedSet = new Set(selectedPlayerIds as string[]);

            if (activeTeam === 'BLUE') {
                return f.killerTeamSlot === 'BLUE' && selectedSet.has(f.killerId);
            }
            if (activeTeam === 'ORANGE') {
                return f.killerTeamSlot === 'ORANGE' && selectedSet.has(f.killerId);
            }

            // activeTeam === 'BOTH'
            if (selectedSet.size === 0 || selectedSet.size >= 10) {
                return true;
            }

            return selectedSet.has(f.killerId) || selectedSet.has(f.victimId);
        });
    }, [
        payload.meta,
        activeRoundId,
        showFrags,
        visibleFloors,
        showAllPlayersAndLabels,
        selectedPlayerIds,
        activeTeam,
    ]);

    if (!showFrags) return null;

    const activeFocusFrag = hoveredFrag || selectedFrag;

    return (
        <group>
            {activeFrags.map((frag, idx) => {
                const isSelected =
                    selectedFrag &&
                    selectedFrag.roundId === frag.roundId &&
                    selectedFrag.tick === frag.tick &&
                    selectedFrag.killerId === frag.killerId &&
                    selectedFrag.victimId === frag.victimId;

                const isHovered =
                    hoveredFrag &&
                    hoveredFrag.roundId === frag.roundId &&
                    hoveredFrag.tick === frag.tick &&
                    hoveredFrag.killerId === frag.killerId &&
                    hoveredFrag.victimId === frag.victimId;

                const isMatch = isSelected || isHovered;

                // When a frag item is selected or hovered, only display that focused frag line
                if (activeFocusFrag && !isMatch) {
                    return null;
                }

                return (
                    <FragVector3D
                        key={`${frag.roundId}:${frag.tick}:${frag.killerId}:${frag.victimId}:${idx}`}
                        frag={frag}
                        isFocused={!!isMatch || !activeFocusFrag}
                        onClick={() => {
                            setSelectedFrag(isSelected ? null : frag);
                            setCursor(frag.tick as any);
                        }}
                        onPointerOver={() => setHoveredFrag(frag)}
                        onPointerOut={() => setHoveredFrag(null)}
                    />
                );
            })}
        </group>
    );
}
