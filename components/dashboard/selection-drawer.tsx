import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelectionStore } from '@/store/selection-store';
import { usePlaybackStore } from '@/store/playback-store';
import { useFilterStore } from '@/store/filter-store';
import type { PlayerId } from '@/types/brand';
import { X, Crosshair, Play, Layers, Skull, UserCheck, Eye } from 'lucide-react';

function getFloorName(idx: number): string {
    switch (idx) {
        case -1: return 'Basement (-1)';
        case 0: return 'Ground Floor (0)';
        case 1: return '1st Floor (1)';
        case 2: return 'Roof (2)';
        default: return `Floor ${idx}`;
    }
}

export function SelectionDrawer() {
    const selectedFrag = useSelectionStore((s) => s.selectedFrag);
    const setSelectedFrag = useSelectionStore((s) => s.setSelectedFrag);
    const setCursor = usePlaybackStore((s) => s.setCursor);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedFrag(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setSelectedFrag]);

    if (!selectedFrag) return null;

    const handleJumpToReplay = () => {
        if (!selectedFrag) return;

        const filterStore = useFilterStore.getState();

        // 1. Ensure round matches
        if (filterStore.activeRoundId !== selectedFrag.roundId) {
            filterStore.setRound(selectedFrag.roundId);
        }

        // 2. Filter/isolate the 2 players involved (Killer & Victim)
        filterStore.setPlayers([
            selectedFrag.killerId as PlayerId,
            selectedFrag.victimId as PlayerId,
        ]);

        // 3. Set visible floor levels to the floors where both players were located
        const requiredFloors = Array.from(
            new Set([selectedFrag.killerFloorIndex, selectedFrag.victimFloorIndex])
        );
        filterStore.setAllFloors(requiredFloors);

        // 4. Close any open sidebar drawers (e.g. mobile/tablet kill feed & stats panel)
        filterStore.closeAllDrawers();

        // 5. Jump playback time cursor to exact frag tick
        setCursor(selectedFrag.tick as any);

        // 6. Close dialog
        setSelectedFrag(null);
    };

    const killerFloorName = getFloorName(selectedFrag.killerFloorIndex);
    const victimFloorName = getFloorName(selectedFrag.victimFloorIndex);
    const isSameFloor = selectedFrag.killerFloorIndex === selectedFrag.victimFloorIndex;

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
            onClick={() => setSelectedFrag(null)}
        >
            <div
                className="relative w-full max-w-md bg-neutral-950 border border-blue-500/80 shadow-2xl shadow-blue-950/60 rounded-2xl p-5 text-xs font-mono text-neutral-200 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-sm">
                        <Crosshair className="w-5 h-5 text-red-500" />
                        <span>Kill Vector Telemetry</span>
                    </div>
                    <button
                        onClick={() => setSelectedFrag(null)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                        title="Close (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                    {/* Engagement Summary */}
                    <div className="flex items-center justify-between bg-neutral-900/90 p-3.5 rounded-xl border border-neutral-800 shadow-inner">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-blue-400/80 font-bold uppercase tracking-wide">ELIMINATOR</span>
                            <span className="text-base font-bold text-blue-400 truncate">{selectedFrag.killerNickname}</span>
                            <span className="text-[10px] text-neutral-400 truncate">{selectedFrag.killerOperator}</span>
                            <span className="text-[9px] text-blue-300/70 font-semibold mt-0.5">{killerFloorName}</span>
                        </div>

                        <div className="flex flex-col items-center px-2 shrink-0">
                            <Skull className="w-4 h-4 text-red-500 mb-1" />
                            <span className="text-xs font-bold text-red-400">{selectedFrag.distance}m</span>
                            <span className="text-[9px] text-neutral-500 uppercase">{selectedFrag.weapon}</span>
                        </div>

                        <div className="flex flex-col items-end min-w-0">
                            <span className="text-[10px] text-orange-400/80 font-bold uppercase tracking-wide">VICTIM</span>
                            <span className="text-base font-bold text-orange-400 truncate">{selectedFrag.victimNickname}</span>
                            <span className="text-[10px] text-neutral-400 truncate">{selectedFrag.victimOperator}</span>
                            <span className="text-[9px] text-orange-300/70 font-semibold mt-0.5">{victimFloorName}</span>
                        </div>
                    </div>

                    {/* Tactical Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2.5 bg-neutral-900/70 rounded-lg border border-neutral-800 flex flex-col gap-0.5">
                            <span className="text-neutral-500 uppercase">HEADSHOT</span>
                            <span className={`font-bold text-xs ${selectedFrag.headshot ? 'text-orange-400' : 'text-neutral-400'}`}>
                                {selectedFrag.headshot ? 'CONFIRMED' : 'BODY HIT'}
                            </span>
                        </div>

                        <div className="p-2.5 bg-neutral-900/70 rounded-lg border border-neutral-800 flex flex-col gap-0.5">
                            <span className="text-neutral-500 uppercase">PENETRATION</span>
                            <span className={`font-bold text-xs ${selectedFrag.throughSurface ? 'text-yellow-400' : 'text-neutral-400'}`}>
                                {selectedFrag.throughSurface ? 'SOFT BREACH / WALL' : 'DIRECT LINE'}
                            </span>
                        </div>

                        <div className="p-2.5 bg-neutral-900/70 rounded-lg border border-neutral-800 flex flex-col gap-0.5">
                            <span className="text-neutral-500 uppercase">KILLER LEVEL</span>
                            <span className="font-bold text-xs text-blue-400">{killerFloorName}</span>
                        </div>

                        <div className="p-2.5 bg-neutral-900/70 rounded-lg border border-neutral-800 flex flex-col gap-0.5">
                            <span className="text-neutral-500 uppercase">VICTIM LEVEL</span>
                            <span className="font-bold text-xs text-orange-400">{victimFloorName}</span>
                        </div>
                    </div>

                    {/* Spatial Line-of-sight status */}
                    {selectedFrag.crossesFloors && (
                        <div className="p-2.5 bg-purple-950/60 border border-purple-800/80 rounded-lg flex items-center gap-2 text-purple-300">
                            <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                            <span className="text-[10px]">Cross-floor engagement (vertical hatch / soft ceiling penetration)</span>
                        </div>
                    )}

                    {/* Replay Display Focus Context Callout */}
                    <div className="p-2.5 bg-blue-950/40 border border-blue-900/60 rounded-lg flex flex-col gap-1.5 text-[10px]">
                        <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                            <Eye className="w-3.5 h-3.5 shrink-0" />
                            <span>Target Replay Focus View</span>
                        </div>
                        <div className="flex items-center justify-between text-neutral-300">
                            <span className="flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-blue-400" />
                                Players: <strong className="text-blue-300">{selectedFrag.killerNickname}</strong> & <strong className="text-orange-300">{selectedFrag.victimNickname}</strong>
                            </span>
                            <span className="text-neutral-400">
                                Floor: {isSameFloor ? killerFloorName : `${killerFloorName} + ${victimFloorName}`}
                            </span>
                        </div>
                    </div>

                    {/* Jump to Replay Action */}
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                        <span className="text-[10px] text-neutral-500">TICK {selectedFrag.tick}</span>
                        <button
                            onClick={handleJumpToReplay}
                            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 transition-all text-xs shadow-md shadow-blue-950"
                        >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Jump to Replay Moment</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}


