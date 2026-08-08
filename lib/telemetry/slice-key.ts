import type { RoundId, PlayerId } from '@/types/brand';
import type { TeamSlot } from '@/types/telemetry';

export function resolveSliceKey(
    roundId: RoundId | null,
    team: TeamSlot | 'BOTH',
    selectedPlayerIds?: PlayerId[] | null,
): string {
    if (!roundId) return 'all';
    if (selectedPlayerIds && selectedPlayerIds.length === 1 && team !== 'BOTH') {
        return `${roundId}:${team}:${selectedPlayerIds[0]}`;
    }
    if (team !== 'BOTH') {
        return `${roundId}:${team}`;
    }
    return roundId;
}

