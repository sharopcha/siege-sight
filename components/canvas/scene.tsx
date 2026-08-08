import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import type { MatchManifest } from '@/types/telemetry';
import type { PointCloudPayload, FragLinePayload } from '@/types/payload';
import type { MapManifest } from '@/lib/maps/types';
import { SURFACE_BASE } from '@/lib/maps/palette';
import { usePlaybackStore } from '@/store/playback-store';


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
            </Canvas>
        </div>
    );
}
