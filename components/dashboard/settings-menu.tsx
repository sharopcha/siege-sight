import { useState, useRef, useEffect } from 'react';
import { useFilterStore, CameraPreset } from '@/store/filter-store';
import { TelemetryUploader } from './telemetry-uploader';
import {
    Settings,
    Camera,
    Footprints,
    Crosshair,
    Layers,
    X,
    Check,
    RotateCcw,
    Sliders,
    Eye,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function SettingsMenu() {
    const [isOpen, setIsOpen] = useState(false);

    const showFrags = useFilterStore((s) => s.showFrags);
    const toggleFrags = useFilterStore((s) => s.toggleFrags);
    const showPaths = useFilterStore((s) => s.showPaths);
    const togglePaths = useFilterStore((s) => s.togglePaths);
    const showAllPlayersAndLabels = useFilterStore((s) => s.showAllPlayersAndLabels);
    const toggleShowAllPlayersAndLabels = useFilterStore((s) => s.toggleShowAllPlayersAndLabels);
    const cameraPreset = useFilterStore((s) => s.cameraPreset);
    const setCameraPreset = useFilterStore((s) => s.setCameraPreset);

    const cameraOptions: { id: CameraPreset; label: string; desc: string }[] = [
        { id: 'ISOMETRIC', label: '3D Isometric', desc: 'Free 3D spatial orbit view' },
        { id: 'TOP_DOWN', label: '2D Top-Down', desc: 'Direct top orthographic view' },
        { id: 'FLOOR_FOCUS', label: 'Level Focus', desc: 'Tight angle on active floor' },
    ];

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger render={
                <button
                    className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-mono font-bold ${
                        isOpen
                          ? 'bg-blue-950 border-blue-500 text-blue-300 shadow-lg shadow-blue-950'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                    }`}
                    title="Telemetry & Viewport Settings"
                />
            }>
                <Settings className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-90 text-blue-400' : ''}`} />
                <span className="hidden sm:inline">SETTINGS</span>
            </PopoverTrigger>

            <PopoverContent 
                sideOffset={8} 
                align="end" 
                className="w-80 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden text-neutral-100 p-0 flex flex-col gap-0"
            >
                {/* Header */}
                <div className="px-4 py-3 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-400" />
                        <span className="font-mono font-bold text-xs tracking-wider uppercase text-neutral-200">
                            Viewport Settings
                        </span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 text-neutral-400 hover:text-neutral-100 rounded-md hover:bg-neutral-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 space-y-5 text-xs">
                    {/* Camera Presets Section */}
                    <div className="space-y-2">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-blue-400" />
                            Camera Perspective
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                            {cameraOptions.map((opt) => {
                                const isSelected = cameraPreset === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => setCameraPreset(opt.id)}
                                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                                            isSelected
                                            ? 'bg-blue-950/90 border-blue-500 text-blue-200 font-bold'
                                            : 'bg-neutral-900/50 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                                        }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs">{opt.label}</span>
                                            <span className="text-[10px] text-neutral-400 font-sans font-normal">{opt.desc}</span>
                                        </div>
                                        {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Telemetry Overlays Section */}
                    <div className="space-y-2.5 pt-2 border-t border-neutral-900">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            Telemetry Layers
                        </div>

                        {/* Trajectories Switch */}
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-md ${showPaths ? 'bg-blue-950 text-blue-400' : 'bg-neutral-800 text-neutral-500'}`}>
                                    <Footprints className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-mono text-xs font-semibold">Player Trajectories</span>
                                    <span className="text-[10px] text-neutral-400">Movement lines & movement paths</span>
                                </div>
                            </div>

                            <button
                                onClick={togglePaths}
                                className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                                    showPaths ? 'bg-blue-600 justify-end' : 'bg-neutral-800 justify-start'
                                }`}
                            >
                                <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
                            </button>
                        </div>

                        {/* Frag Vectors Switch */}
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-md ${showFrags ? 'bg-red-950 text-red-400' : 'bg-neutral-800 text-neutral-500'}`}>
                                    <Crosshair className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-mono text-xs font-semibold">Frag Lines (Kills)</span>
                                    <span className="text-[10px] text-neutral-400">3D combat vectors & kill locations</span>
                                </div>
                            </div>

                            <button
                                onClick={toggleFrags}
                                className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                                    showFrags ? 'bg-red-600 justify-end' : 'bg-neutral-800 justify-start'
                                }`}
                            >
                                <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
                            </button>
                        </div>

                        {/* All Floors Overlay Switch */}
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-md ${showAllPlayersAndLabels ? 'bg-purple-950 text-purple-400' : 'bg-neutral-800 text-neutral-500'}`}>
                                    <Layers className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-mono text-xs font-semibold">All Floors Overlay</span>
                                    <span className="text-[10px] text-neutral-400">Show data across all map levels</span>
                                </div>
                            </div>

                            <button
                                onClick={toggleShowAllPlayersAndLabels}
                                className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                                    showAllPlayersAndLabels ? 'bg-purple-600 justify-end' : 'bg-neutral-800 justify-start'
                                }`}
                            >
                                <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Custom Telemetry Upload */}
                    <div className="pt-2 border-t border-neutral-800">
                        <TelemetryUploader buttonVariant="full" />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 font-mono mt-auto">
                    <span>R6 SIEGESIGHT 3D</span>
                    <button
                        onClick={() => {
                            setCameraPreset('ISOMETRIC');
                            if (!showFrags) toggleFrags();
                            if (!showPaths) togglePaths();
                            if (showAllPlayersAndLabels) toggleShowAllPlayersAndLabels();
                        }}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                        <RotateCcw className="w-3 h-3" /> Reset View
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
