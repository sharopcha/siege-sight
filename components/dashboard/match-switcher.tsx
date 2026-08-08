import { useTelemetryStore } from '@/store/telemetry-store';
import { usePlaybackStore } from '@/store/playback-store';
import { Tv } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function MatchSwitcher() {
    const catalog = useTelemetryStore((s) => s.catalog);
    const activeMatchId = useTelemetryStore((s) => s.activeMatchId);
    const setActiveMatchId = useTelemetryStore((s) => s.setActiveMatchId);
    const resetPlayback = usePlaybackStore((s) => s.reset);

    return (
        <div className="flex items-center gap-1.5 min-w-0 max-w-full">
            <Tv className="w-4 h-4 text-blue-400 shrink-0" />
            <Select
                value={activeMatchId}
                onValueChange={(val) => {
                    setActiveMatchId(val || '');
                    resetPlayback();
                }}
            >
                <SelectTrigger className="bg-neutral-900 text-neutral-100 text-xs font-mono font-bold px-2 py-1.5 h-auto rounded-md border border-neutral-700 hover:border-neutral-500 focus:outline-none focus:border-blue-500 transition-all cursor-pointer truncate max-w-full min-w-0 gap-2">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-700 text-neutral-100">
                    {catalog.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-xs font-mono focus:bg-neutral-800 focus:text-neutral-100 cursor-pointer">
                            {m.isCustom ? '📁 ' : ''}{m.title} ({m.map})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
