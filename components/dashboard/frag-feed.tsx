import type { FragLinePayload, FragLineMeta } from '@/types/payload';
import { useFilterStore } from '@/store/filter-store';
import { useSelectionStore } from '@/store/selection-store';
import { usePlaybackStore } from '@/store/playback-store';
import { Skull, Layers, ShieldAlert, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FragFeedProps {
    payload: FragLinePayload;
}

export function FragFeed({ payload }: FragFeedProps) {
    const activeRoundId = useFilterStore((s) => s.activeRoundId);
    const activeTeam = useFilterStore((s) => s.activeTeam);
    const selectedFrag = useSelectionStore((s) => s.selectedFrag);
    const setSelectedFrag = useSelectionStore((s) => s.setSelectedFrag);
    const setHoveredFrag = useSelectionStore((s) => s.setHoveredFrag);
    const setCursor = usePlaybackStore((s) => s.setCursor);

    // Filter frags by active round and team
    const frags: readonly FragLineMeta[] = payload.meta.filter((f) => {
        if (activeRoundId && f.roundId !== activeRoundId) return false;

        if (activeTeam === 'BLUE' && f.killerTeamSlot !== 'BLUE') return false;
        if (activeTeam === 'ORANGE' && f.killerTeamSlot !== 'ORANGE') return false;

        return true;
    });

    return (
        <div className="flex flex-col gap-2 bg-neutral-950/80 p-3 rounded-lg border border-neutral-800 h-full max-h-[400px]">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                    <Skull className="w-3.5 h-3.5 text-red-400" />
                    Kill Feed ({frags.length})
                </span>
                <span className="text-[10px] text-neutral-500">3D VECTOR LOG</span>
            </div>

            <ScrollArea className="flex-1 -mr-2 pr-3">
                <div className="flex flex-col gap-1.5">
                    {frags.length === 0 ? (
                        <div className="p-4 text-center text-xs font-mono text-neutral-500 bg-neutral-900/40 rounded border border-neutral-800">
                            No frags recorded in this round filter.
                        </div>
                    ) : (
                        frags.map((frag, idx) => {
                            const isSelected =
                                selectedFrag &&
                                selectedFrag.roundId === frag.roundId &&
                                selectedFrag.tick === frag.tick &&
                                selectedFrag.killerId === frag.killerId &&
                                selectedFrag.victimId === frag.victimId;

                            return (
                                <div
                                    key={idx}
                                    onMouseEnter={() => setHoveredFrag(frag)}
                                    onMouseLeave={() => setHoveredFrag(null)}
                                    onClick={() => {
                                        if (activeRoundId !== frag.roundId) {
                                            useFilterStore.getState().setRound(frag.roundId);
                                        }
                                        setSelectedFrag(isSelected ? null : frag);
                                        setCursor(frag.tick as any);
                                    }}
                                    className={`p-2 rounded-md border transition-all cursor-pointer flex flex-col gap-1 ${isSelected
                                        ? 'bg-neutral-900 border-red-500 shadow-md shadow-red-950/40'
                                        : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80'
                                        }`}
                                >
                                    {/* Killer -> Victim Row */}
                                    <div className="flex items-center justify-between text-xs font-mono font-bold gap-1 min-w-0">
                                        <div className="flex items-center gap-1 text-blue-400 min-w-0 truncate">
                                            <span className="truncate">{frag.killerNickname}</span>
                                            <span className="text-[10px] text-neutral-500 font-normal shrink-0">({frag.killerOperator})</span>
                                        </div>

                                        <span className="text-neutral-600 font-normal text-[10px] shrink-0 px-0.5">➔</span>

                                        <div className="flex items-center gap-1 text-orange-400 min-w-0 truncate justify-end">
                                            <span className="truncate">{frag.victimNickname}</span>
                                            <span className="text-[10px] text-neutral-500 font-normal shrink-0">({frag.victimOperator})</span>
                                        </div>
                                    </div>

                                    {/* Details Badges */}
                                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1 border-t border-neutral-800/60 mt-0.5 min-w-0 gap-1">
                                        <div className="flex items-center gap-1.5 min-w-0 truncate">
                                            <span className="text-neutral-300 font-medium truncate">{frag.weapon}</span>
                                            <span className="text-neutral-500 shrink-0">{frag.distance}m</span>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                                            {frag.headshot && (
                                                <span className="px-1 py-0.5 bg-orange-950/80 text-orange-400 border border-orange-800/80 rounded text-[9px] font-bold flex items-center gap-0.5">
                                                    <Sparkles className="w-2.5 h-2.5" />
                                                    HS
                                                </span>
                                            )}

                                            {frag.throughSurface && (
                                                <span className="px-1 py-0.5 bg-yellow-950/80 text-yellow-400 border border-yellow-800/80 rounded text-[9px] font-bold flex items-center gap-0.5">
                                                    <ShieldAlert className="w-2.5 h-2.5" />
                                                    WB
                                                </span>
                                            )}

                                            {frag.crossesFloors && (
                                                <span className="px-1 py-0.5 bg-purple-950/80 text-purple-400 border border-purple-800/80 rounded text-[9px] font-bold flex items-center gap-0.5">
                                                    <Layers className="w-2.5 h-2.5" />
                                                    FLOOR
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
