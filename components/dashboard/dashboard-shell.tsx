"use client";
import { useMemo } from 'react';
import { useActiveMatch } from '@/store/telemetry-store';
import { packPointCloud, packFragLines } from '@/lib/telemetry/pack';
import { deriveMatchStats } from '@/lib/telemetry/derive';
import { getMapManifest } from '@/lib/maps/registry';
import { useFilterStore } from '@/store/filter-store';
import type { CameraPreset } from '@/store/filter-store';

import { CanvasHost } from '../canvas/canvas-host';
import { RoundSelector } from './round-selector';
import { TeamFilter } from './team-filter';
import { FloorToggle } from './floor-toggle';
import { FragFeed } from './frag-feed';
import { StatsPanel } from './stats-panel';
import { SelectionDrawer } from './selection-drawer';
import { MatchSwitcher } from './match-switcher';
import { TelemetryUploader } from './telemetry-uploader';
import { SettingsMenu } from './settings-menu';

import {
    Camera,
    Crosshair,
    Footprints,
    SlidersHorizontal,
    BarChart2,
    X,
    PanelLeftOpen,
    PanelRightOpen,
} from 'lucide-react';

export function DashboardShell() {
    const activeMatchId = useFilterStore<string>((s) => s.activeMatchId);
    const showFrags = useFilterStore<boolean>((s) => s.showFrags);
    const toggleFrags = useFilterStore<() => void>((s) => s.toggleFrags);
    const showPaths = useFilterStore<boolean>((s) => s.showPaths);
    const togglePaths = useFilterStore<() => void>((s) => s.togglePaths);
    const cameraPreset = useFilterStore<string>((s) => s.cameraPreset);
    const setCameraPreset = useFilterStore<(preset: CameraPreset) => void>((s) => s.setCameraPreset);
    const isLeftDrawerOpen = useFilterStore<boolean>((s) => s.isLeftDrawerOpen);
    const setIsLeftDrawerOpen = useFilterStore<(isOpen: boolean) => void>((s) => s.setIsLeftDrawerOpen);
    const isRightDrawerOpen = useFilterStore<boolean>((s) => s.isRightDrawerOpen);
    const setIsRightDrawerOpen = useFilterStore<(isOpen: boolean) => void>((s) => s.setIsRightDrawerOpen);

    // Active match telemetry from global store
    const manifest = useActiveMatch();
    const map = useMemo(() => getMapManifest(manifest.map), [manifest]);
    const points = useMemo(() => packPointCloud(manifest), [manifest]);
    const frags = useMemo(() => packFragLines(manifest), [manifest]);
    const stats = useMemo(() => deriveMatchStats(manifest), [manifest]);

    return (
        <div className="flex flex-col w-full h-screen bg-neutral-950 text-neutral-100 font-sans overflow-hidden select-none">
            {/* Industrial Header Bar */}
            <header className="h-14 bg-neutral-950 border-b border-neutral-800 px-3 sm:px-4 flex items-center justify-between shrink-0 z-30 gap-2">
                {/* Left Section: Branding & Match Selector */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center font-mono font-black text-white text-base shadow-lg shadow-blue-950 border border-blue-400">
                            S
                        </div>
                        <div className="flex flex-col">
                            <span className="font-mono font-black tracking-wider text-sm text-neutral-100 flex items-center gap-1.5 whitespace-nowrap">
                                SIEGESIGHT
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-normal hidden md:inline-block">
                                    3D TELEMETRY
                                </span>
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono hidden lg:inline-block truncate max-w-[200px]">
                                {manifest.event.name} • {map.displayName}
                            </span>
                        </div>
                    </div>

                    <div className="h-6 w-px bg-neutral-800 mx-0.5 hidden sm:block shrink-0" />

                    <div className="shrink-0 min-w-0 max-w-[220px] sm:max-w-[320px] lg:max-w-[400px] flex items-center gap-1.5">
                        <MatchSwitcher />
                        <TelemetryUploader buttonVariant="header" />
                    </div>
                </div>

                {/* Right Section: Quick Controls & Settings Cog */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Quick Bar Toggles on XL Screens */}
                    <div className="hidden xl:flex items-center gap-2">
                        {/* Camera Presets Segment */}
                        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs font-mono">
                            <span className="text-[10px] text-neutral-500 px-1 flex items-center gap-1">
                                <Camera className="w-3 h-3" /> CAM:
                            </span>

                            <button
                                onClick={() => setCameraPreset('ISOMETRIC')}
                                className={`px-2 py-1 rounded transition-all ${cameraPreset === 'ISOMETRIC'
                                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                                    : 'text-neutral-400 hover:text-neutral-200'
                                    }`}
                            >
                                3D ISO
                            </button>

                            <button
                                onClick={() => setCameraPreset('TOP_DOWN')}
                                className={`px-2 py-1 rounded transition-all ${cameraPreset === 'TOP_DOWN'
                                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                                    : 'text-neutral-400 hover:text-neutral-200'
                                    }`}
                            >
                                2D TOP
                            </button>

                            <button
                                onClick={() => setCameraPreset('FLOOR_FOCUS')}
                                className={`px-2 py-1 rounded transition-all ${cameraPreset === 'FLOOR_FOCUS'
                                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                                    : 'text-neutral-400 hover:text-neutral-200'
                                    }`}
                            >
                                LEVEL
                            </button>
                        </div>

                        {/* Trajectories Toggle */}
                        <button
                            onClick={togglePaths}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${showPaths
                                ? 'bg-blue-950/80 border-blue-600 text-blue-300 shadow-sm shadow-blue-950'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                                }`}
                        >
                            <Footprints className="w-3.5 h-3.5" />
                            <span>TRAJECTORIES</span>
                        </button>

                        {/* Frag Vectors Toggle */}
                        <button
                            onClick={toggleFrags}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${showFrags
                                ? 'bg-red-950/80 border-red-600 text-red-300 shadow-sm shadow-red-950'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                                }`}
                        >
                            <Crosshair className="w-3.5 h-3.5" />
                            <span>FRAG LINES</span>
                        </button>
                    </div>

                    {/* Settings Cog Icon Menu Button */}
                    <SettingsMenu />
                </div>
            </header>

            {/* Main Responsive Layout Workspace */}
            <div className="relative flex-1 min-h-0 bg-neutral-950 overflow-hidden flex">
                {/* Left Control Rail (Hidden on screens < 2xl, shown on 2xl+) */}
                <div className="hidden 2xl:flex w-80 p-3 flex-col gap-3 border-r border-neutral-800 overflow-y-auto custom-scrollbar bg-neutral-950/50 shrink-0">
                    <RoundSelector rounds={manifest.rounds} />
                    <TeamFilter
                        teams={manifest.teams}
                        blueScore={stats.blueScore}
                        orangeScore={stats.orangeScore}
                    />
                    <FloorToggle floors={map.floors} />
                </div>

                {/* Center 3D Canvas Stage */}
                <div className="flex-1 relative flex flex-col h-full bg-neutral-950 overflow-hidden min-w-0">
                    <SelectionDrawer />

                    {/* Overlay Action Buttons when Sidebars are Collapsed */}
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                        {/* Toggle Left Sidebar Button (visible when left sidebar is collapsed on < 2xl) */}
                        <button
                            onClick={() => setIsLeftDrawerOpen(true)}
                            className="2xl:hidden flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 shadow-xl backdrop-blur-md transition-all text-xs font-mono font-bold active:scale-95"
                        >
                            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                            <span>MATCH FILTERS</span>
                        </button>
                    </div>

                    <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                        {/* Toggle Right Sidebar Button (visible when right sidebar is collapsed on < lg) */}
                        <button
                            onClick={() => setIsRightDrawerOpen(true)}
                            className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 shadow-xl backdrop-blur-md transition-all text-xs font-mono font-bold active:scale-95"
                        >
                            <BarChart2 className="w-4 h-4 text-orange-400" />
                            <span>FEED & STATS</span>
                        </button>
                    </div>

                    <div className="flex-1 w-full relative min-h-0">
                        <CanvasHost
                            manifest={manifest}
                            map={map}
                            points={points}
                            frags={frags}
                        />
                    </div>

                </div>

                {/* Right Analytics Rail (Hidden on screens < lg, shown on lg+) */}
                <div className="hidden lg:flex w-80 xl:w-88 p-3 flex-col gap-3 border-l border-neutral-800 overflow-y-auto custom-scrollbar bg-neutral-950/50 shrink-0">
                    <FragFeed payload={frags} />
                    <StatsPanel stats={stats} />
                </div>

                {/* Slide-over Drawer for Left Controls (< 2xl screens) */}
                {isLeftDrawerOpen && (
                    <div className="2xl:hidden fixed inset-0 z-50 flex">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsLeftDrawerOpen(false)}
                        />

                        {/* Sidebar Content */}
                        <div className="relative w-80 sm:w-96 max-w-[85vw] bg-neutral-950 border-r border-neutral-800 h-full p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar shadow-2xl z-10">
                            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                                <div className="flex items-center gap-2 font-mono font-bold text-xs text-blue-400">
                                    <PanelLeftOpen className="w-4 h-4" />
                                    <span>MATCH FILTERS & MAP LEVELS</span>
                                </div>
                                <button
                                    onClick={() => setIsLeftDrawerOpen(false)}
                                    className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <RoundSelector rounds={manifest.rounds} />
                            <TeamFilter
                                teams={manifest.teams}
                                blueScore={stats.blueScore}
                                orangeScore={stats.orangeScore}
                            />
                            <FloorToggle floors={map.floors} />
                        </div>
                    </div>
                )}

                {/* Slide-over Drawer for Right Analytics (< lg screens) */}
                {isRightDrawerOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsRightDrawerOpen(false)}
                        />

                        {/* Sidebar Content */}
                        <div className="relative w-80 sm:w-96 max-w-[85vw] bg-neutral-950 border-l border-neutral-800 h-full p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar shadow-2xl z-10">
                            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                                <div className="flex items-center gap-2 font-mono font-bold text-xs text-orange-400">
                                    <PanelRightOpen className="w-4 h-4" />
                                    <span>KILL FEED & STATS</span>
                                </div>
                                <button
                                    onClick={() => setIsRightDrawerOpen(false)}
                                    className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <FragFeed payload={frags} />
                            <StatsPanel stats={stats} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

