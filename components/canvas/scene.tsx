import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import type { MatchManifest } from '@/types/telemetry';
import type { PointCloudPayload, FragLinePayload } from '@/types/payload';
import type { MapManifest } from '@/lib/maps/types';
import { SURFACE_BASE } from '@/lib/maps/palette';
import { usePlaybackStore } from '@/store/playback-store';

import { Lighting } from './rig/lighting';
import { CameraRig } from './rig/camera-rig';
import { PerfGuard } from './rig/pref-guard';
import { FloorStack } from './environment/floor-stack';
import { PlayerPointCloud } from './telemetry/player-point-cloud';
import { PlayerTrajectoryLines } from './telemetry/player-trajectory-lines';
import { FragLineField } from './telemetry/frag-line-field';
import { PlayerCursorMesh } from './telemetry/player-cursor-mesh';
import { GpuMemoryHud } from './debug/gpu-memory-hud';

export interface SceneProps {
    manifest: MatchManifest;
    map: MapManifest;
    points: PointCloudPayload;
    frags: FragLinePayload;
}

function FrameInvalidator() {
    const cursorTick = usePlaybackStore((s) => s.cursorTick);
    const { invalidate } = useThree();

    useEffect(() => {
        invalidate();
    }, [cursorTick, invalidate]);

    return null;
}

export function Scene({ manifest, map, points, frags }: SceneProps) {
    const isPlaying = usePlaybackStore((s) => s.isPlaying);

    return (
        <div className="relative w-full h-full bg-neutral-950 overflow-hidden select-none">
            <Canvas
                frameloop={isPlaying ? 'always' : 'demand'}
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance',
                }}
                camera={{
                    fov: 45,
                    near: 0.1,
                    far: 500,
                    position: [32, 28, 32],
                }}
                onCreated={({ gl }) => {
                    gl.setClearColor(SURFACE_BASE);
                }}
            >

                <FrameInvalidator />
                <GpuMemoryHud />
                <Lighting />
                <CameraRig />
                <PerfGuard />

                <FloorStack map={map} />
                <PlayerPointCloud payload={points} />
                <PlayerTrajectoryLines manifest={manifest} />
                <FragLineField payload={frags} />
                <PlayerCursorMesh manifest={manifest} />
            </Canvas>
        </div>
    );
}
