import { useState } from 'react';
import type { Round } from '@/types/telemetry';
import type { RoundId } from '@/types/brand';
import { useFilterStore } from '@/store/filter-store';
import { usePlaybackStore } from '@/store/playback-store';
import { Target, ChevronDown, Check } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface RoundSelectorProps {
    rounds: readonly Round[];
}

export function RoundSelector({ rounds }: RoundSelectorProps) {
    const activeRoundId = useFilterStore((s) => s.activeRoundId);
    const setRound = useFilterStore((s) => s.setRound);
    const resetPlayback = usePlaybackStore((s) => s.reset);
    const [isOpen, setIsOpen] = useState(false);

    const activeRound = rounds.find((r) => r.roundId === activeRoundId) || rounds[0];

    const getConditionText = (condition: string) => {
        switch (condition) {
            case 'ELIMINATION':
                return 'ELIM';
            case 'DEFUSER_PLANTED':
                return 'PLANT';
            case 'DEFUSER_DISABLED':
                return 'DEFUSE';
            case 'TIME_EXPIRED':
                return 'TIME';
            default:
                return condition;
        }
    };

    return (
        <div className="flex flex-col gap-1.5 w-full relative z-20">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-400" />
                    Round Select
                </span>
                <span className="text-[10px] text-neutral-500">{rounds.length} Rounds</span>
            </div>

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger render={
                    <button className="flex items-center justify-between w-full p-2.5 rounded-lg border bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-mono transition-all shadow-sm focus:outline-none" />
                }>
                    <div className="flex items-center gap-2 overflow-hidden">
                        <span className="font-bold text-blue-400 shrink-0">R{activeRound.ordinal}</span>
                        <span
                            className={`w-2 h-2 rounded-full shrink-0 ${activeRound.outcome.winner === 'BLUE'
                                    ? 'bg-blue-500 shadow-sm shadow-blue-500/50'
                                    : 'bg-orange-500 shadow-sm shadow-orange-500/50'
                                }`}
                        />
                        <span className="truncate text-neutral-300 font-sans text-xs">
                            {activeRound.site.code}
                        </span>
                        <span className="text-[10px] text-neutral-500 uppercase shrink-0 font-mono">
                            • {getConditionText(activeRound.outcome.condition)}
                        </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </PopoverTrigger>

                <PopoverContent 
                    align="center"
                    side="bottom"
                    sideOffset={4}
                    className="w-[var(--anchor-width)] p-1 flex flex-col gap-1 bg-neutral-900/95 backdrop-blur-md border border-neutral-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
                >
                    {rounds.map((round) => {
                        const isSelected = round.roundId === activeRoundId;
                        const isBlueWinner = round.outcome.winner === 'BLUE';

                        return (
                            <button
                                key={round.roundId}
                                onClick={() => {
                                    setRound(round.roundId as RoundId);
                                    resetPlayback();
                                    setIsOpen(false);
                                }}
                                className={`flex items-center justify-between p-2 rounded-md text-xs font-mono transition-all text-left ${isSelected
                                        ? 'bg-blue-950/80 border border-blue-600 text-white'
                                        : 'hover:bg-neutral-800/80 text-neutral-300 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className={`font-bold ${isSelected ? 'text-blue-400' : 'text-neutral-400'}`}>
                                        R{round.ordinal}
                                    </span>
                                    <span
                                        className={`w-2 h-2 rounded-full shrink-0 ${isBlueWinner ? 'bg-blue-500' : 'bg-orange-500'
                                            }`}
                                    />
                                    <span className="font-sans text-neutral-200 truncate">{round.site.code}</span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] text-neutral-500 uppercase">
                                        {getConditionText(round.outcome.condition)}
                                    </span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                                </div>
                            </button>
                        );
                    })}
                </PopoverContent>
            </Popover>
        </div>
    );
}

