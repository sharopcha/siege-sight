import { useState } from 'react';
import type { FloorDefinition } from '@/lib/maps/types';
import { useFilterStore } from '@/store/filter-store';
import { Layers, ChevronDown, Check, CheckSquare, Square } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface FloorToggleProps {
    floors: readonly FloorDefinition[];
}

export function FloorToggle({ floors }: FloorToggleProps) {
    const visibleFloors = useFilterStore((s) => s.visibleFloors);
    const toggleFloor = useFilterStore((s) => s.toggleFloor);
    const setAllFloors = useFilterStore((s) => s.setAllFloors);
    const showAllPlayersAndLabels = useFilterStore((s) => s.showAllPlayersAndLabels);
    const toggleShowAllPlayersAndLabels = useFilterStore((s) => s.toggleShowAllPlayersAndLabels);

    const [isOpen, setIsOpen] = useState(false);

    const allFloorIndices = floors.map((f) => f.index);
    const isAllActive = allFloorIndices.every((idx) => visibleFloors.has(idx));

    // Compute trigger label
    let triggerText = 'Select Map Levels';
    if (isAllActive) {
        triggerText = `All Levels (${floors.length} Active)`;
    } else if (visibleFloors.size === 1) {
        const activeIdx = Array.from(visibleFloors)[0];
        const floor = floors.find((f) => f.index === activeIdx);
        if (floor) {
            triggerText = `${floor.shortLabel} — ${floor.label.split('—')[0]}`;
        }
    } else if (visibleFloors.size > 0) {
        const activeShorts = floors
            .filter((f) => visibleFloors.has(f.index))
            .map((f) => f.shortLabel)
            .join(', ');
        triggerText = `${visibleFloors.size} Levels (${activeShorts})`;
    } else {
        triggerText = 'No Levels Selected';
    }

    return (
        <div className="flex flex-col gap-1.5 bg-neutral-950/80 p-3 rounded-lg border border-neutral-800 relative z-10">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 uppercase tracking-wider px-0.5">
                <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    Map Level Planes
                </span>
                <button
                    onClick={() => setAllFloors(allFloorIndices)}
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-all ${isAllActive
                            ? 'bg-blue-950 text-blue-400 border border-blue-800 font-bold'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                >
                    SHOW ALL
                </button>
            </div>

            {/* Dropdown Toggle Button */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger render={
                    <button className="flex items-center justify-between w-full p-2.5 rounded-lg border bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-mono transition-all shadow-sm focus:outline-none" />
                }>
                    <div className="flex items-center gap-2 overflow-hidden">
                        {visibleFloors.size === 1 && (
                            <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{
                                    backgroundColor: floors.find((f) => visibleFloors.has(f.index))?.color || '#3f3f46',
                                }}
                            />
                        )}
                        <span className="truncate text-neutral-200 font-medium">
                            {triggerText}
                        </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </PopoverTrigger>

                <PopoverContent 
                    align="center"
                    side="bottom"
                    sideOffset={4}
                    className="w-[var(--anchor-width)] z-50 bg-neutral-900/95 backdrop-blur-md border border-neutral-700 rounded-lg shadow-2xl p-1 flex flex-col gap-1 animate-in fade-in duration-150 max-h-[300px] overflow-y-auto custom-scrollbar"
                >
                    {/* Show All Option */}
                    <button
                        onClick={() => {
                            setAllFloors(allFloorIndices);
                        }}
                        className={`flex items-center justify-between p-2 rounded-md text-xs font-mono transition-all ${isAllActive
                                ? 'bg-blue-950/80 border border-blue-600 text-white font-bold'
                                : 'hover:bg-neutral-800/80 text-neutral-300 border border-transparent'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            <span>ALL LEVELS (SHOW ALL)</span>
                        </div>
                        {isAllActive && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>

                    <div className="h-px bg-neutral-800 my-0.5" />

                    {/* Individual Floor Options */}
                    {floors.map((floor) => {
                        const isActive = visibleFloors.has(floor.index);

                        return (
                            <button
                                key={floor.index}
                                onClick={() => {
                                    toggleFloor(floor.index);
                                }}
                                className={`flex items-center justify-between p-2 rounded-md text-xs font-mono transition-all text-left ${isActive
                                        ? 'bg-neutral-800/90 text-neutral-100 font-bold border border-neutral-700'
                                        : 'hover:bg-neutral-800/50 text-neutral-400 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {isActive ? (
                                        <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                                    ) : (
                                        <Square className="w-4 h-4 text-neutral-600 shrink-0" />
                                    )}
                                    <div
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{
                                            backgroundColor: isActive ? floor.color : '#3f3f46',
                                            boxShadow: isActive ? `0 0 6px ${floor.color}` : 'none',
                                        }}
                                    />
                                    <span className="font-bold text-neutral-200">{floor.shortLabel}</span>
                                    <span className="text-[10px] text-neutral-400 truncate">{floor.label.split('—')[0]}</span>
                                </div>
                            </button>
                        );
                    })}
                </PopoverContent>
            </Popover>

            {/* Show All Players & Room Labels Overlay Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 mt-1 px-0.5">
                <span className="text-[11px] font-mono text-neutral-400">
                    Players & Labels Overlay
                </span>
                <button
                    onClick={toggleShowAllPlayersAndLabels}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all border flex items-center gap-1.5 ${showAllPlayersAndLabels
                            ? 'bg-blue-950/90 border-blue-500 text-blue-300 shadow-sm shadow-blue-950'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                    title="When OFF, only players and room labels on selected levels are displayed"
                >
                    {showAllPlayersAndLabels ? 'ALL FLOORS' : 'SELECTED LEVEL ONLY'}
                </button>
            </div>
        </div>
    );
}


