import { useTelemetryStore } from '@/store/telemetry-store';
import { usePlaybackStore } from '@/store/playback-store';
import { Tv } from 'lucide-react';

export function MatchSwitcher() {
    const catalog = useTelemetryStore((s) => s.catalog);
    const activeMatchId = useTelemetryStore((s) => s.activeMatchId);
    const setActiveMatchId = useTelemetryStore((s) => s.setActiveMatchId);
    const resetPlayback = usePlaybackStore((s) => s.reset);

    return (
        <div className="flex items-center gap-1.5 min-w-0 max-w-full">
            <Tv className="w-4 h-4 text-blue-400 shrink-0" />
            <select
                value={activeMatchId}
                onChange={(e) => {
                    setActiveMatchId(e.target.value);
                    resetPlayback();
                }}
                className="bg-neutral-900 text-neutral-100 text-xs font-mono font-bold px-2 py-1.5 rounded-md border border-neutral-700 hover:border-neutral-500 focus:outline-none focus:border-blue-500 transition-all cursor-pointer truncate max-w-full min-w-0"
            >
                {catalog.map((m) => (
                    <option key={m.id} value={m.id}>
                        {m.isCustom ? '📁 ' : ''}{m.title} ({m.map})
                    </option>
                ))}
            </select>
        </div>
    );
}

