import type { MapKey } from '@/types/telemetry';
import type { MapManifest } from './types';
import { CLUBHOUSE_MANIFEST } from './clubhouse';
import { OREGON_MANIFEST } from './oregon';

export const MAP_REGISTRY: Record<MapKey, MapManifest> = {
    CLUBHOUSE: CLUBHOUSE_MANIFEST,
    OREGON: OREGON_MANIFEST,
    BANK: CLUBHOUSE_MANIFEST, // Fallback to Clubhouse schema
    KAFE: OREGON_MANIFEST,     // Fallback to Oregon schema
};

export function getMapManifest(key: MapKey): MapManifest {
    return MAP_REGISTRY[key] ?? CLUBHOUSE_MANIFEST;
}
