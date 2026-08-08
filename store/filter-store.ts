import { create } from 'zustand';
import type { RoundId, PlayerId } from '@/types/brand';
import type { TeamSlot } from '@/types/telemetry';

export type CameraPreset = 'ISOMETRIC' | 'TOP_DOWN' | 'FLOOR_FOCUS' | 'SITE_FOCUS';

interface FilterState {
    activeMatchId: string;
    activeRoundId: RoundId | null;
    activeTeam: TeamSlot | 'BOTH';
    selectedPlayerIds: PlayerId[];
    visibleFloors: Set<number>;
    showFrags: boolean;
    showPaths: boolean;
    show3DWalls: boolean;
    showAllPlayersAndLabels: boolean;
    cameraPreset: CameraPreset;
    isLeftDrawerOpen: boolean;
    isRightDrawerOpen: boolean;

    setMatch: (matchId: string) => void;
    setRound: (id: RoundId | null) => void;
    setTeam: (team: TeamSlot | 'BOTH') => void;
    togglePlayer: (id: PlayerId) => void;
    setPlayers: (ids: PlayerId[]) => void;
    selectAllPlayersOfTeam: (teamRosterIds: PlayerId[]) => void;
    deselectAllPlayersOfTeam: (teamRosterIds: PlayerId[]) => void;
    clearPlayers: () => void;
    toggleFloor: (index: number) => void;
    setAllFloors: (floors: number[]) => void;
    toggleFrags: () => void;
    togglePaths: () => void;
    toggle3DWalls: () => void;
    toggleShowAllPlayersAndLabels: () => void;
    setShowAllPlayersAndLabels: (val: boolean) => void;
    setCameraPreset: (preset: CameraPreset) => void;
    setIsLeftDrawerOpen: (open: boolean) => void;
    setIsRightDrawerOpen: (open: boolean) => void;
    closeAllDrawers: () => void;
}

export const useFilterStore = create<FilterState>()((set) => ({
    activeMatchId: 'match_inv_grand_final',
    activeRoundId: 'r_1' as RoundId,
    activeTeam: 'BOTH',
    selectedPlayerIds: [],
    visibleFloors: new Set([-1, 0, 1, 2]),
    showFrags: true,
    showPaths: true,
    show3DWalls: true,
    showAllPlayersAndLabels: false,
    cameraPreset: 'ISOMETRIC',
    isLeftDrawerOpen: false,
    isRightDrawerOpen: false,

    setMatch: (activeMatchId) => set({ activeMatchId, activeRoundId: 'r_1' as RoundId, selectedPlayerIds: [] }),
    setRound: (activeRoundId) => set({ activeRoundId, selectedPlayerIds: [] }),
    setTeam: (activeTeam) => set({ activeTeam, selectedPlayerIds: [] }),

    togglePlayer: (id) =>
        set((s) => {
            const exists = s.selectedPlayerIds.includes(id);
            const next = exists
                ? s.selectedPlayerIds.filter((pId) => pId !== id)
                : [...s.selectedPlayerIds, id];
            return { selectedPlayerIds: next };
        }),

    setPlayers: (selectedPlayerIds) => set({ selectedPlayerIds }),

    selectAllPlayersOfTeam: (teamRosterIds) =>
        set((s) => {
            const setIds = new Set([...s.selectedPlayerIds, ...teamRosterIds]);
            return { selectedPlayerIds: Array.from(setIds) };
        }),

    deselectAllPlayersOfTeam: (teamRosterIds) =>
        set((s) => {
            const setRoster = new Set(teamRosterIds);
            return { selectedPlayerIds: s.selectedPlayerIds.filter((id) => !setRoster.has(id)) };
        }),

    clearPlayers: () => set({ selectedPlayerIds: [] }),

    toggleFloor: (index) =>
        set((s) => {
            const next = new Set(s.visibleFloors);
            if (next.has(index)) {
                if (next.size > 1) next.delete(index); // keep at least 1 floor visible
            } else {
                next.add(index);
            }
            return { visibleFloors: next };
        }),
    setAllFloors: (floors) => set({ visibleFloors: new Set(floors) }),
    toggleFrags: () => set((s) => ({ showFrags: !s.showFrags })),
    togglePaths: () => set((s) => ({ showPaths: !s.showPaths })),
    toggle3DWalls: () => set((s) => ({ show3DWalls: !s.show3DWalls })),
    toggleShowAllPlayersAndLabels: () => set((s) => ({ showAllPlayersAndLabels: !s.showAllPlayersAndLabels })),
    setShowAllPlayersAndLabels: (showAllPlayersAndLabels) => set({ showAllPlayersAndLabels }),
    setCameraPreset: (cameraPreset) => set({ cameraPreset }),
    setIsLeftDrawerOpen: (isLeftDrawerOpen) => set({ isLeftDrawerOpen }),
    setIsRightDrawerOpen: (isRightDrawerOpen) => set({ isRightDrawerOpen }),
    closeAllDrawers: () => set({ isLeftDrawerOpen: false, isRightDrawerOpen: false }),
}));

