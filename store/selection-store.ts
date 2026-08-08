import { create } from 'zustand';
import type { FragLineMeta } from '@/types/payload';
import type { PlayerId } from '@/types/brand';

interface SelectionState {
    hoveredFrag: FragLineMeta | null;
    selectedFrag: FragLineMeta | null;
    hoveredPlayerId: PlayerId | null;
    selectedPlayerId: PlayerId | null;

    setHoveredFrag: (frag: FragLineMeta | null) => void;
    setSelectedFrag: (frag: FragLineMeta | null) => void;
    setHoveredPlayer: (id: PlayerId | null) => void;
    setSelectedPlayer: (id: PlayerId | null) => void;
    clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>()((set) => ({
    hoveredFrag: null,
    selectedFrag: null,
    hoveredPlayerId: null,
    selectedPlayerId: null,

    setHoveredFrag: (hoveredFrag) => set({ hoveredFrag }),
    setSelectedFrag: (selectedFrag) => set({ selectedFrag }),
    setHoveredPlayer: (hoveredPlayerId) => set({ hoveredPlayerId }),
    setSelectedPlayer: (selectedPlayerId) => set({ selectedPlayerId }),
    clearSelection: () =>
        set({
            hoveredFrag: null,
            selectedFrag: null,
            hoveredPlayerId: null,
            selectedPlayerId: null,
        }),
}));
