import type { MatchManifest } from '@/types/telemetry';
import type { PointCloudPayload, FragLinePayload } from '@/types/payload';
import type { MapManifest } from '@/lib/maps/types';
import { Scene } from './scene';

export interface CanvasHostProps {
    manifest: MatchManifest;
    map: MapManifest;
    points: PointCloudPayload;
    frags: FragLinePayload;
}

export function CanvasHost(props: CanvasHostProps) {
    return <Scene {...props} />;
}
