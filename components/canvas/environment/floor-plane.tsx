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
    wallThickness?: number;
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
    wallThickness = 0.4,
}: FloorPlaneProps) {
    const worldY = floor.elevation;

    // Build wall polylines geometry
    const { wallPositions, is3D } = useMemo(() => {
        if (!walls || walls.length === 0) return { wallPositions: new Float32Array(0), is3D: false };

        if (wallHeight > 0) {
            const pos = new Float32Array(walls.length * 108); // 12 triangles * 3 vertices * 3 coords
            walls.forEach((w, i) => {
                const [sx, sy, sz] = toWorldTuple(w.start[0], w.start[1], floor.elevation);
                const [ex, ey, ez] = toWorldTuple(w.end[0], w.end[1], floor.elevation);

                const bY = sy + 0.1;
                const tY = bY + wallHeight;

                const dx = ex - sx;
                const dz = ez - sz;
                const len = Math.sqrt(dx * dx + dz * dz);
                const nx = len > 0 ? (dz / len) * (wallThickness / 2) : 0;
                const nz = len > 0 ? (-dx / len) * (wallThickness / 2) : 0;

                // 4 corners at bottom
                const b1x = sx - nx, b1z = sz - nz;
                const b2x = sx + nx, b2z = sz + nz;
                const b3x = ex + nx, b3z = ez + nz;
                const b4x = ex - nx, b4z = ez - nz;

                // 4 corners at top
                const t1x = sx - nx, t1z = sz - nz;
                const t2x = sx + nx, t2z = sz + nz;
                const t3x = ex + nx, t3z = ez + nz;
                const t4x = ex - nx, t4z = ez - nz;

                const idx = i * 108;
                let offset = idx;

                const addQuad = (
                    v1x: number, v1y: number, v1z: number,
                    v2x: number, v2y: number, v2z: number,
                    v3x: number, v3y: number, v3z: number,
                    v4x: number, v4y: number, v4z: number
                ) => {
                    // Triangle 1: v1, v2, v3
                    pos[offset++] = v1x; pos[offset++] = v1y; pos[offset++] = v1z;
                    pos[offset++] = v2x; pos[offset++] = v2y; pos[offset++] = v2z;
                    pos[offset++] = v3x; pos[offset++] = v3y; pos[offset++] = v3z;
                    // Triangle 2: v1, v3, v4
                    pos[offset++] = v1x; pos[offset++] = v1y; pos[offset++] = v1z;
                    pos[offset++] = v3x; pos[offset++] = v3y; pos[offset++] = v3z;
                    pos[offset++] = v4x; pos[offset++] = v4y; pos[offset++] = v4z;
                };

                // Front face
                addQuad(b4x, bY, b4z, b1x, bY, b1z, t1x, tY, t1z, t4x, tY, t4z);
                // Back face
                addQuad(b2x, bY, b2z, b3x, bY, b3z, t3x, tY, t3z, t2x, tY, t2z);
                // Left face
                addQuad(b1x, bY, b1z, b2x, bY, b2z, t2x, tY, t2z, t1x, tY, t1z);
                // Right face
                addQuad(b3x, bY, b3z, b4x, bY, b4z, t4x, tY, t4z, t3x, tY, t3z);
                // Top face
                addQuad(t1x, tY, t1z, t2x, tY, t2z, t3x, tY, t3z, t4x, tY, t4z);
                // Bottom face
                addQuad(b4x, bY, b4z, b3x, bY, b3z, b2x, bY, b2z, b1x, bY, b1z);
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
