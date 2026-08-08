import { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import type { PointCloudPayload } from '@/types/payload';
import { useFilterStore } from '@/store/filter-store';
import { useTransientSelector } from '@/hooks/use-transient-filter';
import { resolveSliceKey } from '@/lib/telemetry/slice-key';

interface PlayerPointCloudProps {
    payload: PointCloudPayload;
}

const BLUE_IDS = ['p_alemao', 'p_doki', 'p_virtue', 'p_benjamaster', 'p_uuno'];
const ORANGE_IDS = ['p_shaiiko', 'p_brid', 'p_elemzje', 'p_like', 'p_renshiro'];

function computePlayerMask(selectedPlayerIds: readonly string[], activeTeam: string): number {
    if (selectedPlayerIds.length === 0) return 0;

    const selectedSet = new Set(selectedPlayerIds);
    let mask = 0;

    if (activeTeam === 'BOTH' || activeTeam === 'BLUE') {
        BLUE_IDS.forEach((id, idx) => {
            if (selectedSet.has(id)) mask |= (1 << idx);
        });
    }

    if (activeTeam === 'BOTH' || activeTeam === 'ORANGE') {
        ORANGE_IDS.forEach((id, idx) => {
            if (selectedSet.has(id)) mask |= (1 << (idx + 5));
        });
    }

    // Fallback for custom player IDs
    if (mask === 0 && selectedPlayerIds.length > 0) {
        mask = 1023;
    }

    return mask;
}

export function PlayerPointCloud({ payload }: PlayerPointCloudProps) {
    const geometryRef = useRef<THREE.BufferGeometry>(null);
    const pointsRef = useRef<THREE.Points>(null);
    const shaderRef = useRef<{ uniforms: Record<string, { value: number }> } | null>(null);

    useLayoutEffect(() => {
        const geometry = geometryRef.current;
        if (!geometry) return;
        geometry.computeBoundingSphere();
        const initial = payload.slices.all;
        geometry.setDrawRange(initial.start, initial.count);
    }, [payload]);

    // Transient bridge: filter updates directly set draw range, floor mask and player mask without React re-render
    useTransientSelector(
        useFilterStore,
        (s) => ({
            key: resolveSliceKey(s.activeRoundId, s.activeTeam, s.selectedPlayerIds),
            showPaths: s.showPaths,
            visibleFloors: s.visibleFloors,
            showAll: s.showAllPlayersAndLabels,
            selectedPlayerIds: s.selectedPlayerIds,
            activeTeam: s.activeTeam,
        }),
        ({ key, showPaths, visibleFloors, showAll, selectedPlayerIds, activeTeam }) => {
            const geometry = geometryRef.current;
            const points = pointsRef.current;
            if (!geometry || !points) return;

            points.visible = showPaths;
            if (!showPaths) return;

            if (shaderRef.current) {
                let mask = 0;
                visibleFloors.forEach((fIdx) => {
                    mask |= (1 << (fIdx + 1));
                });
                shaderRef.current.uniforms.uVisibleMask.value = mask;
                shaderRef.current.uniforms.uShowAll.value = showAll ? 1 : 0;
                shaderRef.current.uniforms.uPlayerMask.value = computePlayerMask(selectedPlayerIds as string[], activeTeam);
            }

            const slice =
                payload.slices.byRoundTeamPlayer[key] ??
                payload.slices.byRoundTeam[key] ??
                payload.slices.byRound[key] ??
                payload.slices.all;
            geometry.setDrawRange(slice.start, slice.count);
        },
    );

    return (
        <points ref={pointsRef} frustumCulled>
            <bufferGeometry ref={geometryRef}>
                <bufferAttribute
                    attach="attributes-position"
                    args={[payload.positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[payload.colors, 3]}
                />
                <bufferAttribute
                    attach="attributes-aFloorIndex"
                    args={[payload.floorIndices, 1]}
                />
                <bufferAttribute
                    attach="attributes-aPlayerIndex"
                    args={[payload.playerIndices, 1]}
                />
            </bufferGeometry>

            <pointsMaterial
                vertexColors
                size={0.32}
                sizeAttenuation
                transparent
                opacity={0.8}
                depthWrite={false}
                toneMapped={false}
                onBeforeCompile={(shader) => {
                    shader.uniforms.uVisibleMask = { value: 15 };
                    shader.uniforms.uShowAll = { value: 0 };
                    shader.uniforms.uPlayerMask = { value: 1023 };
                    shader.vertexShader = `
            attribute float aFloorIndex;
            attribute float aPlayerIndex;
            uniform float uVisibleMask;
            uniform float uShowAll;
            uniform float uPlayerMask;
            ${shader.vertexShader}
          `.replace(
                        '#include <begin_vertex>',
                        `
            #include <begin_vertex>
            float floorBit = pow(2.0, floor(aFloorIndex + 1.5));
            bool floorVisible = (uShowAll > 0.5) || (mod(floor(uVisibleMask / floorBit), 2.0) >= 0.5);

            float playerBit = pow(2.0, floor(aPlayerIndex + 0.5));
            bool playerVisible = mod(floor(uPlayerMask / playerBit), 2.0) >= 0.5;

            if (!floorVisible || !playerVisible) {
              transformed = vec3(0.0, -9999.0, 0.0);
            }
            `
                    );
                    shaderRef.current = shader;
                }}
            />
        </points>
    );
}
