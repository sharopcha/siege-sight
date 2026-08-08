import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { FloorDefinition, WallSegment } from '@/lib/maps/types';
import { toWorldTuple } from '@/lib/telemetry/transform';

interface FloorPlaneProps {
    floor: FloorDefinition;
    width: number;
    depth: number;
    divisions: number;
    walls: readonly WallSegment[];
    roomLabels: readonly { name: string; x: number; y: number }[];
    isVisible: boolean;
    showRoomLabels?: boolean;
    wallHeight?: number;
}

export function FloorPlane({
    floor,
    width,
    depth,
    divisions,
    walls,
    roomLabels,
    isVisible,
    showRoomLabels = true,
    wallHeight = 0,
}: FloorPlaneProps) {
    const worldY = floor.elevation;

    // Build wall polylines geometry
    const { wallPositions, is3D } = useMemo(() => {
        if (!walls || walls.length === 0) return { wallPositions: new Float32Array(0), is3D: false };

        if (wallHeight > 0) {
            const pos = new Float32Array(walls.length * 18);
            walls.forEach((w, i) => {
                const [sx, sy, sz] = toWorldTuple(w.start[0], w.start[1], floor.elevation);
                const [ex, ey, ez] = toWorldTuple(w.end[0], w.end[1], floor.elevation);

                const bSy = sy + 0.1;
                const bEy = ey + 0.1;
                const tSy = bSy + wallHeight;
                const tEy = bEy + wallHeight;

                const idx = i * 18;
                // Triangle 1: StartBottom, EndBottom, StartTop
                pos[idx] = sx; pos[idx + 1] = bSy; pos[idx + 2] = sz;
                pos[idx + 3] = ex; pos[idx + 4] = bEy; pos[idx + 5] = ez;
                pos[idx + 6] = sx; pos[idx + 7] = tSy; pos[idx + 8] = sz;

                // Triangle 2: StartTop, EndBottom, EndTop
                pos[idx + 9] = sx; pos[idx + 10] = tSy; pos[idx + 11] = sz;
                pos[idx + 12] = ex; pos[idx + 13] = bEy; pos[idx + 14] = ez;
                pos[idx + 15] = ex; pos[idx + 16] = tEy; pos[idx + 17] = ez;
            });
            return { wallPositions: pos, is3D: true };
        } else {
            const pos = new Float32Array(walls.length * 6);
            walls.forEach((w, i) => {
                const [sx, sy, sz] = toWorldTuple(w.start[0], w.start[1], floor.elevation);
                const [ex, ey, ez] = toWorldTuple(w.end[0], w.end[1], floor.elevation);
                const idx = i * 6;
                pos[idx] = sx;
                pos[idx + 1] = sy + 0.1; // Slight offset above floor
                pos[idx + 2] = sz;
                pos[idx + 3] = ex;
                pos[idx + 4] = ey + 0.1;
                pos[idx + 5] = ez;
            });
            return { wallPositions: pos, is3D: false };
        }
    }, [walls, floor.elevation, wallHeight]);

    if (!isVisible && !showRoomLabels) return null;

    return (
        <group position={[0, worldY, 0]}>
            {isVisible && (
                <>
                    {/* Transparent floor plane */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false}>
                        <planeGeometry args={[width, depth]} />
                        <meshBasicMaterial
                            color={floor.color}
                            transparent
                            opacity={0.07}
                            depthWrite={false}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Grid overlay */}
                    <gridHelper
                        args={[width, divisions, floor.color, '#27272a']}
                        position={[0, 0.02, 0]}
                    />

                    {/* Wall outline segments */}
                    {wallPositions.length > 0 && is3D ? (
                        <mesh position={[0, -worldY, 0]}>
                            <bufferGeometry>
                                <bufferAttribute
                                    attach="attributes-position"
                                    args={[wallPositions, 3]}
                                />
                            </bufferGeometry>
                            <meshBasicMaterial
                                color={floor.color}
                                transparent
                                opacity={0.3}
                                depthWrite={false}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    ) : wallPositions.length > 0 ? (
                        <lineSegments position={[0, -worldY, 0]}>
                            <bufferGeometry>
                                <bufferAttribute
                                    attach="attributes-position"
                                    args={[wallPositions, 3]}
                                />
                            </bufferGeometry>
                            <lineBasicMaterial
                                color={floor.color}
                                transparent
                                opacity={0.7}
                                depthWrite={false}
                            />
                        </lineSegments>
                    ) : null}
                </>
            )}

            {/* Room labels */}
            {showRoomLabels &&
                roomLabels.map((lbl, idx) => {
                    const [wx, wy, wz] = toWorldTuple(lbl.x, lbl.y, floor.elevation);
                    return (
                        <group key={idx} position={[wx, 0.15, wz]}>
                            <Html
                                center
                                distanceFactor={35}
                                zIndexRange={[10, 0]}
                                style={{
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                }}
                            >
                                <div className="px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold uppercase bg-neutral-950/80 text-neutral-300 border border-neutral-800 whitespace-nowrap shadow-sm">
                                    {lbl.name}
                                </div>
                            </Html>
                        </group>
                    );
                })}
        </group>
    );
}
