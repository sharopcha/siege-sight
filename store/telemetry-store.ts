import { create } from 'zustand';
import type { MatchManifest, MapKey } from '@/types/telemetry';
import { matchManifestSchema } from '@/lib/telemetry/schema';
import seedDataRaw from '@/data/seed-telemetry.json';
import { useFilterStore } from './filter-store';

export interface MatchCatalogItem {
    id: string;
    title: string;
    map: MapKey;
    event: string;
    isCustom?: boolean;
}

export interface SeedDataPayload {
    catalog: MatchCatalogItem[];
    matches: MatchManifest[];
}

// Convert raw seed data into matches map and catalog
function loadInitialSeed(): { catalog: MatchCatalogItem[]; matches: Record<string, MatchManifest> } {
    const seed = seedDataRaw as unknown as SeedDataPayload;
    const matchesMap: Record<string, MatchManifest> = {};

    if (Array.isArray(seed.matches)) {
        for (const m of seed.matches) {
            matchesMap[m.matchId] = m;
        }
    }

    const catalog: MatchCatalogItem[] = Array.isArray(seed.catalog) ? [...seed.catalog] : [];

    return { catalog, matches: matchesMap };
}

interface TelemetryStoreState {
    catalog: MatchCatalogItem[];
    matches: Record<string, MatchManifest>;
    activeMatchId: string;

    // Actions
    setActiveMatchId: (matchId: string) => void;
    getActiveMatch: () => MatchManifest;
    importMatchData: (input: unknown) => { success: boolean; matchId?: string; count?: number; error?: string };
    importJsonFile: (file: File) => Promise<{ success: boolean; matchId?: string; count?: number; error?: string }>;
    resetToDefaults: () => void;
}

const initialSeed = loadInitialSeed();
const defaultActiveMatchId = initialSeed.catalog[0]?.id || 'match_inv_grand_final';

export const useTelemetryStore = create<TelemetryStoreState>()((set, get) => ({
    catalog: initialSeed.catalog,
    matches: initialSeed.matches,
    activeMatchId: defaultActiveMatchId,

    setActiveMatchId: (activeMatchId: string) => {
        set({ activeMatchId });
        // Keep filterStore in sync
        useFilterStore.getState().setMatch(activeMatchId);
    },

    getActiveMatch: () => {
        const { matches, activeMatchId, catalog } = get();
        if (matches[activeMatchId]) {
            return matches[activeMatchId]!;
        }
        // Fallback if activeMatchId not found
        const firstKey = catalog[0]?.id || Object.keys(matches)[0];
        if (firstKey && matches[firstKey]) {
            return matches[firstKey]!;
        }
        // Emergency empty structure
        throw new Error(`No match found in telemetry store for ID: ${activeMatchId}`);
    },

    importMatchData: (input: unknown) => {
        try {
            let rawData = input;
            if (typeof input === 'string') {
                rawData = JSON.parse(input);
            }

            if (!rawData || typeof rawData !== 'object') {
                return { success: false, error: 'Invalid JSON payload. Must be an object or array.' };
            }

            const candidateManifests: MatchManifest[] = [];

            // Case A: { catalog: [...], matches: [...] }
            if ('matches' in rawData && Array.isArray((rawData as { matches: unknown }).matches)) {
                for (const item of (rawData as { matches: unknown[] }).matches) {
                    const parsed = matchManifestSchema.parse(item);
                    candidateManifests.push((parsed as unknown) as MatchManifest);
                }
            }
            // Case B: Array of match manifests
            else if (Array.isArray(rawData)) {
                for (const item of rawData) {
                    const parsed = matchManifestSchema.parse(item);
                    candidateManifests.push((parsed as unknown) as MatchManifest);
                }
            }
            // Case C: Single match manifest object
            else {
                const parsed = matchManifestSchema.parse(rawData);
                candidateManifests.push((parsed as unknown) as MatchManifest);
            }

            if (candidateManifests.length === 0) {
                return { success: false, error: 'No valid telemetry match manifests found in JSON.' };
            }

            const { matches: currentMatches, catalog: currentCatalog } = get();
            const updatedMatches = { ...currentMatches };
            const updatedCatalog = [...currentCatalog];

            for (const manifest of candidateManifests) {
                updatedMatches[manifest.matchId] = manifest;

                // Build catalog item
                const title = manifest.teams && manifest.teams.length >= 2
                    ? `${manifest.teams[0].name} vs ${manifest.teams[1].name}`
                    : `Custom Match (${manifest.matchId})`;

                const existingCatalogIdx = updatedCatalog.findIndex((c) => c.id === manifest.matchId);
                const newItem: MatchCatalogItem = {
                    id: manifest.matchId,
                    title,
                    map: manifest.map,
                    event: manifest.event?.name || 'Custom Telemetry Import',
                    isCustom: true,
                };

                if (existingCatalogIdx >= 0) {
                    updatedCatalog[existingCatalogIdx] = newItem;
                } else {
                    updatedCatalog.push(newItem);
                }
            }

            const firstNewMatchId = candidateManifests[0]!.matchId;

            set({
                matches: updatedMatches,
                catalog: updatedCatalog,
                activeMatchId: firstNewMatchId,
            });

            useFilterStore.getState().setMatch(firstNewMatchId);

            return {
                success: true,
                matchId: firstNewMatchId,
                count: candidateManifests.length,
            };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown parsing error';
            return { success: false, error: `Telemetry JSON Validation Failed: ${message}` };
        }
    },

    importJsonFile: async (file: File) => {
        try {
            const text = await file.text();
            return get().importMatchData(text);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'File read error';
            return { success: false, error: `Failed to read JSON file: ${message}` };
        }
    },

    resetToDefaults: () => {
        const seed = loadInitialSeed();
        const defaultId = seed.catalog[0]?.id || 'match_inv_grand_final';
        set({
            catalog: seed.catalog,
            matches: seed.matches,
            activeMatchId: defaultId,
        });
        useFilterStore.getState().setMatch(defaultId);
    },
}));

// Convenient custom hooks
export function useActiveMatch(): MatchManifest {
    return useTelemetryStore((s) => s.getActiveMatch());
}

export function useMatchCatalog(): MatchCatalogItem[] {
    return useTelemetryStore((s) => s.catalog);
}
