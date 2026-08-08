import { useState, useRef, useEffect } from 'react';
import type { TeamMeta } from '@/types/telemetry';
import type { PlayerId } from '@/types/brand';
import { useFilterStore } from '@/store/filter-store';
import { Users, User, ChevronDown, Check, X, CheckSquare, Square } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface TeamFilterProps {
    teams: readonly [TeamMeta, TeamMeta];
    blueScore: number;
    orangeScore: number;
}

export function TeamFilter({ teams, blueScore, orangeScore }: TeamFilterProps) {
    const activeTeam = useFilterStore((s) => s.activeTeam);
    const setTeam = useFilterStore((s) => s.setTeam);
    const activeRoundId = useFilterStore((s) => s.activeRoundId);
    const activeMatchId = useFilterStore((s) => s.activeMatchId);
    const selectedPlayerIds = useFilterStore((s) => s.selectedPlayerIds);
    const togglePlayer = useFilterStore((s) => s.togglePlayer);
    const setPlayers = useFilterStore((s) => s.setPlayers);
    const selectAllPlayersOfTeam = useFilterStore((s) => s.selectAllPlayersOfTeam);
    const deselectAllPlayersOfTeam = useFilterStore((s) => s.deselectAllPlayersOfTeam);

    const [blueTeam, orangeTeam] = teams;

    const [blueOpen, setBlueOpen] = useState(false);
    const [orangeOpen, setOrangeOpen] = useState(false);

    const blueRosterIds = blueTeam.roster.map((p) => p.playerId as PlayerId);
    const orangeRosterIds = orangeTeam.roster.map((p) => p.playerId as PlayerId);
    const allRosterIds = [...blueRosterIds, ...orangeRosterIds];

    const prevRoundRef = useRef<string | null>(null);

    // Initialize selected player IDs to all roster IDs on mount or when round/match changes
    useEffect(() => {
        const roundKey = `${activeMatchId}:${activeRoundId}`;
        if (prevRoundRef.current !== roundKey) {
            prevRoundRef.current = roundKey;
            setPlayers(allRosterIds);
        }
    }, [activeMatchId, activeRoundId, allRosterIds, setPlayers]);

    // Helper to determine if a player is currently active/visible
    const isPlayerChecked = (playerId: PlayerId) => {
        return selectedPlayerIds.includes(playerId);
    };

    const blueCheckedCount = blueRosterIds.filter(isPlayerChecked).length;
    const orangeCheckedCount = orangeRosterIds.filter(isPlayerChecked).length;

    const handleTogglePlayerItem = (playerId: PlayerId) => {
        togglePlayer(playerId);
    };

    const handleResetFilter = () => {
        setTeam('BOTH');
        setPlayers(allRosterIds);
    };

    const isFilterActive = selectedPlayerIds.length !== allRosterIds.length || activeTeam !== 'BOTH';

    return (
        <div className="flex flex-col gap-2 bg-neutral-950/80 p-3 rounded-lg border border-neutral-800">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    Teams & Score
                </span>
                <span className="text-[10px] text-neutral-500 font-bold">MATCH SCORE</span>
            </div>

            {/* Score Header */}
            <div className="flex items-center justify-between bg-neutral-900/90 p-2 rounded-md border border-neutral-800 gap-1.5 overflow-hidden">
                {/* Blue Team Info */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500 shrink-0" />
                    <span className="font-bold text-xs text-neutral-100 truncate" title={blueTeam.name}>
                        {blueTeam.name}
                    </span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-900/50 uppercase shrink-0">
                        {blueTeam.side === 'ATTACK' ? 'ATK' : 'DEF'}
                    </span>
                </div>

                {/* Score Display */}
                <div className="flex items-center gap-1 font-mono text-base font-extrabold tracking-wider text-neutral-100 shrink-0 px-1">
                    <span className="text-blue-400">{blueScore}</span>
                    <span className="text-neutral-600">:</span>
                    <span className="text-orange-400">{orangeScore}</span>
                </div>

                {/* Orange Team Info */}
                <div className="flex items-center justify-end gap-1.5 min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-orange-400 bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-900/50 uppercase shrink-0">
                        {orangeTeam.side === 'ATTACK' ? 'ATK' : 'DEF'}
                    </span>
                    <span className="font-bold text-xs text-neutral-100 truncate text-right" title={orangeTeam.name}>
                        {orangeTeam.name}
                    </span>
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500 shrink-0" />
                </div>
            </div>

            {/* Team Filter Toggle Buttons */}
            <div className="grid grid-cols-3 gap-1 text-[11px] font-mono pt-0.5">
                <button
                    onClick={() => {
                        setTeam('BOTH');
                        setPlayers(allRosterIds);
                    }}
                    className={`py-1.5 px-1 rounded-md border text-center transition-all truncate ${activeTeam === 'BOTH' && selectedPlayerIds.length === allRosterIds.length
                            ? 'bg-neutral-800 border-neutral-600 text-neutral-100 font-bold shadow'
                            : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                    title="All Teams"
                >
                    ALL TEAMS
                </button>

                <button
                    onClick={() => {
                        setTeam('BLUE');
                        setPlayers(blueRosterIds);
                    }}
                    className={`py-1.5 px-1 rounded-md border text-center transition-all truncate ${activeTeam === 'BLUE' && selectedPlayerIds.length === blueRosterIds.length
                            ? 'bg-blue-950/90 border-blue-500 text-blue-300 font-bold shadow shadow-blue-950'
                            : 'bg-neutral-900/50 border-neutral-800 text-blue-400/80 hover:text-blue-300'
                        }`}
                    title={blueTeam.name}
                >
                    {blueTeam.name.toUpperCase()}
                </button>

                <button
                    onClick={() => {
                        setTeam('ORANGE');
                        setPlayers(orangeRosterIds);
                    }}
                    className={`py-1.5 px-1 rounded-md border text-center transition-all truncate ${activeTeam === 'ORANGE' && selectedPlayerIds.length === orangeRosterIds.length
                            ? 'bg-orange-950/90 border-orange-500 text-orange-300 font-bold shadow shadow-orange-950'
                            : 'bg-neutral-900/50 border-neutral-800 text-orange-400/80 hover:text-orange-300'
                        }`}
                    title={orangeTeam.name}
                >
                    {orangeTeam.name.toUpperCase()}
                </button>
            </div>

            {/* Player Focus Dropdowns Section (Stacked Vertically) */}
            <div className="flex flex-col gap-2 pt-1 border-t border-neutral-800/80 mt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 px-0.5">
                    <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        Individual Player Filters
                    </span>
                    {isFilterActive && (
                        <button
                            onClick={handleResetFilter}
                            className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 font-mono uppercase transition-colors"
                        >
                            <X className="w-3 h-3" /> Reset Filter
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-2 text-xs font-mono">
                    {/* Blue Team Player Selector (Stacked - Full Width) */}
                    <div className="relative z-20">
                        <Popover open={blueOpen} onOpenChange={(open) => {
                            setBlueOpen(open);
                            if (open) setOrangeOpen(false);
                        }}>
                            <PopoverTrigger render={
                                <button
                                    className={`flex items-center justify-between w-full p-2.5 rounded-lg border transition-all text-left overflow-hidden ${blueCheckedCount < 5
                                            ? 'bg-blue-950/90 border-blue-500 text-blue-200 font-bold shadow-sm shadow-blue-950'
                                            : 'bg-neutral-900/90 border-neutral-800 text-neutral-200 hover:border-neutral-700'
                                        }`}
                                />
                            }>
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                                    <span className="truncate font-bold text-xs">{blueTeam.name} Roster</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-900 text-blue-400">
                                        {blueCheckedCount === 5 ? 'All Players' : `${blueCheckedCount}/5 Active`}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-blue-400 shrink-0 transition-transform ${blueOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </PopoverTrigger>

                            <PopoverContent
                                align="center"
                                side="bottom"
                                sideOffset={4}
                                className="w-[var(--anchor-width)] z-50 bg-neutral-900/95 backdrop-blur-md border border-neutral-700 rounded-lg shadow-2xl p-1.5 flex flex-col gap-1 max-h-64 overflow-y-auto custom-scrollbar"
                            >
                                {/* Action Bar */}
                                <div className="flex items-center justify-between px-1 py-1 text-[10px] font-mono border-b border-neutral-800 pb-1.5">
                                    <span className="text-neutral-400 uppercase font-bold">{blueTeam.name}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => selectAllPlayersOfTeam(blueRosterIds)}
                                            className="text-blue-400 hover:text-blue-300 font-bold uppercase transition-colors"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-neutral-600">•</span>
                                        <button
                                            onClick={() => deselectAllPlayersOfTeam(blueRosterIds)}
                                            className="text-neutral-400 hover:text-neutral-200 uppercase transition-colors"
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                </div>

                                {/* Player List */}
                                {blueTeam.roster.map((player) => {
                                    const pId = player.playerId as PlayerId;
                                    const isChecked = isPlayerChecked(pId);
                                    return (
                                        <button
                                            key={pId}
                                            onClick={() => handleTogglePlayerItem(pId)}
                                            className={`flex items-center justify-between p-2 rounded-md text-xs transition-all text-left ${isChecked
                                                    ? 'bg-blue-950/70 border border-blue-600/80 text-blue-100 font-bold'
                                                    : 'hover:bg-neutral-800/60 text-neutral-400 border border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                {isChecked ? (
                                                    <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-neutral-600 shrink-0" />
                                                )}
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold truncate text-neutral-100">{player.nickname}</span>
                                                    <span className="text-[10px] text-blue-400/80 uppercase font-mono">{player.operator} • {player.role}</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Orange Team Player Selector (Stacked - Full Width) */}
                    <div className="relative z-10">
                        <Popover open={orangeOpen} onOpenChange={(open) => {
                            setOrangeOpen(open);
                            if (open) setBlueOpen(false);
                        }}>
                            <PopoverTrigger render={
                                <button
                                    className={`flex items-center justify-between w-full p-2.5 rounded-lg border transition-all text-left overflow-hidden ${orangeCheckedCount < 5
                                            ? 'bg-orange-950/90 border-orange-500 text-orange-200 font-bold shadow-sm shadow-orange-950'
                                            : 'bg-neutral-900/90 border-neutral-800 text-neutral-200 hover:border-neutral-700'
                                        }`}
                                />
                            }>
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                                    <span className="truncate font-bold text-xs">{orangeTeam.name} Roster</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-950/80 border border-orange-900 text-orange-400">
                                        {orangeCheckedCount === 5 ? 'All Players' : `${orangeCheckedCount}/5 Active`}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-orange-400 shrink-0 transition-transform ${orangeOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </PopoverTrigger>

                            <PopoverContent
                                align="center"
                                side="bottom"
                                sideOffset={4}
                                className="w-[var(--anchor-width)] z-50 bg-neutral-900/95 backdrop-blur-md border border-neutral-700 rounded-lg shadow-2xl p-1.5 flex flex-col gap-1 max-h-64 overflow-y-auto custom-scrollbar"
                            >
                                {/* Action Bar */}
                                <div className="flex items-center justify-between px-1 py-1 text-[10px] font-mono border-b border-neutral-800 pb-1.5">
                                    <span className="text-neutral-400 uppercase font-bold">{orangeTeam.name}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => selectAllPlayersOfTeam(orangeRosterIds)}
                                            className="text-orange-400 hover:text-orange-300 font-bold uppercase transition-colors"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-neutral-600">•</span>
                                        <button
                                            onClick={() => deselectAllPlayersOfTeam(orangeRosterIds)}
                                            className="text-neutral-400 hover:text-neutral-200 uppercase transition-colors"
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                </div>

                                {/* Player List */}
                                {orangeTeam.roster.map((player) => {
                                    const pId = player.playerId as PlayerId;
                                    const isChecked = isPlayerChecked(pId);
                                    return (
                                        <button
                                            key={pId}
                                            onClick={() => handleTogglePlayerItem(pId)}
                                            className={`flex items-center justify-between p-2 rounded-md text-xs transition-all text-left ${isChecked
                                                    ? 'bg-orange-950/70 border border-orange-600/80 text-orange-100 font-bold'
                                                    : 'hover:bg-neutral-800/60 text-neutral-400 border border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                {isChecked ? (
                                                    <CheckSquare className="w-4 h-4 text-orange-400 shrink-0" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-neutral-600 shrink-0" />
                                                )}
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold truncate text-neutral-100">{player.nickname}</span>
                                                    <span className="text-[10px] text-orange-400/80 uppercase font-mono">{player.operator} • {player.role}</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>
        </div>
    );
}


