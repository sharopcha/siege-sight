import { useEffect } from 'react';
import { usePlaybackStore } from '@/store/playback-store';
import { useFilterStore } from '@/store/filter-store';
import type { MatchManifest, FragEvent } from '@/types/telemetry';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Clock } from 'lucide-react';

interface PlaybackScrubberProps {
    manifest: MatchManifest;
}

export function PlaybackScrubber({ manifest }: PlaybackScrubberProps) {
    const activeRoundId = useFilterStore((s) => s.activeRoundId);

    const cursorTick = usePlaybackStore((s) => s.cursorTick);
    const maxTick = usePlaybackStore((s) => s.maxTick);
    const isPlaying = usePlaybackStore((s) => s.isPlaying);
    const speed = usePlaybackStore((s) => s.speed);

    const setCursor = usePlaybackStore((s) => s.setCursor);
    const togglePlay = usePlaybackStore((s) => s.togglePlay);
    const setSpeed = usePlaybackStore((s) => s.setSpeed);
    const stepForward = usePlaybackStore((s) => s.stepForward);
    const stepBackward = usePlaybackStore((s) => s.stepBackward);
    const reset = usePlaybackStore((s) => s.reset);

    const currentRound = manifest.rounds.find((r) => r.roundId === activeRoundId) || manifest.rounds[0];

    // Sync max tick for active round
    useEffect(() => {
        if (currentRound) {
            usePlaybackStore.getState().setMaxTick(currentRound.endTick as any);
        }
    }, [currentRound]);

    // Frags in current round for timeline event tick markers
    const roundFrags = currentRound
        ? currentRound.events.filter((e): e is FragEvent => e.type === 'FRAG')
        : [];

    // High-precision smooth animation frame loop when playing back
    useEffect(() => {
        if (!isPlaying) return;

        let animId: number;
        let lastTime = performance.now();

        const loop = (now: number) => {
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            const state = usePlaybackStore.getState();
            const tickDelta = dt * 4 * speed; // 4 ticks per second at 1x speed

            if (state.cursorTick >= state.maxTick) {
                usePlaybackStore.setState({ isPlaying: false, cursorTick: 0 as any });
            } else {
                const nextTick = Math.min(state.maxTick, state.cursorTick + tickDelta);
                usePlaybackStore.setState({ cursorTick: nextTick as any });
                animId = requestAnimationFrame(loop);
            }
        };

        animId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animId);
    }, [isPlaying, speed]);

    const currentSeconds = (cursorTick / 4).toFixed(1);
    const maxSeconds = (maxTick / 4).toFixed(0);

    return (
        <div className="flex flex-col gap-2 bg-neutral-950/90 p-3 rounded-xl border border-neutral-800 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-bold text-neutral-200 uppercase">Match Telemetry Scrub</span>
                    <span className="text-[10px] text-neutral-500 font-mono">TICK {Math.floor(cursorTick)} / {maxTick}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-neutral-900/80 px-2 py-0.5 rounded border border-neutral-800">
                    <span className="text-emerald-400 font-bold font-mono">{currentSeconds}s</span>
                    <span className="text-neutral-600">/</span>
                    <span className="text-neutral-400 font-mono">{maxSeconds}s</span>
                </div>
            </div>

            {/* Scrub Bar Track with Frag Markers */}
            <div className="relative w-full h-8 flex items-center group">
                <div className="relative w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                    {/* Progress fill */}
                    <div
                        className="h-full bg-blue-500 transition-all duration-75"
                        style={{ width: `${(cursorTick / maxTick) * 100}%` }}
                    />

                    {/* Frag kill markers on timeline */}
                    {roundFrags.map((f, i) => {
                        const leftPct = (f.tick / maxTick) * 100;
                        return (
                            <div
                                key={i}
                                className="absolute top-0 bottom-0 w-1 bg-red-500 hover:w-1.5 z-10 transition-all cursor-pointer"
                                style={{ left: `${leftPct}%` }}
                                title={`Frag at ${f.tick}t (${(f.tick / 4).toFixed(1)}s): ${f.killerId} -> ${f.victimId}`}
                                onClick={() => setCursor(f.tick)}
                            />
                        );
                    })}
                </div>

                {/* Range Slider Overlay */}
                <input
                    type="range"
                    min={0}
                    max={maxTick}
                    value={cursorTick}
                    onChange={(e) => setCursor(Number(e.target.value) as any)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                    <button
                        onClick={reset}
                        className="p-1.5 rounded-md bg-neutral-900 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-all border border-neutral-800"
                        title="Reset to start"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                        onClick={stepBackward}
                        className="p-1.5 rounded-md bg-neutral-900 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-all border border-neutral-800"
                        title="Step back (1s)"
                    >
                        <SkipBack className="w-3.5 h-3.5" />
                    </button>

                    <button
                        onClick={togglePlay}
                        className={`p-2 rounded-md font-mono font-bold text-xs flex items-center gap-1.5 transition-all border ${isPlaying
                                ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                                : 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-950'
                            }`}
                    >
                        {isPlaying ? (
                            <>
                                <Pause className="w-4 h-4 fill-amber-300" />
                                <span>PAUSE</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 fill-white" />
                                <span>PLAY REPLAY</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={stepForward}
                        className="p-1.5 rounded-md bg-neutral-900 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-all border border-neutral-800"
                        title="Step forward (1s)"
                    >
                        <SkipForward className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Speed Selector */}
                <div className="flex items-center gap-1 text-[11px] font-mono">
                    <span className="text-neutral-500 mr-1">SPEED:</span>
                    {[0.5, 1, 2, 4].map((s) => (
                        <button
                            key={s}
                            onClick={() => setSpeed(s)}
                            className={`px-2 py-1 rounded border transition-all ${speed === s
                                    ? 'bg-blue-950 text-blue-300 border-blue-700 font-bold'
                                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                                }`}
                        >
                            {s}x
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
