import type { MatchStats } from '@/lib/telemetry/derive';
import { Award, Crosshair, ShieldAlert, Layers, Flame, TrendingUp } from 'lucide-react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';

interface StatsPanelProps {
    stats: MatchStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
    return (
        <div className="flex flex-col gap-3 bg-neutral-950/80 p-3 rounded-lg border border-neutral-800">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-400" />
                    Esports Analytics
                </span>
                <span className="text-[10px] text-neutral-500">TELEMETRY PRO</span>
            </div>

            {/* Key Metric Cards */}
            <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-neutral-900/60 rounded-lg border border-neutral-800/80 flex flex-col gap-1 min-w-0">
                    <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between gap-1">
                        <span className="truncate">HEADSHOT %</span>
                        <Crosshair className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    </div>
                    <div className="text-base font-mono font-extrabold text-orange-400">{stats.headshotRate}%</div>
                </div>

                <div className="p-2.5 bg-neutral-900/60 rounded-lg border border-neutral-800/80 flex flex-col gap-1 min-w-0">
                    <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between gap-1">
                        <span className="truncate">WALLBANG %</span>
                        <ShieldAlert className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    </div>
                    <div className="text-base font-mono font-extrabold text-yellow-400">{stats.wallbangRate}%</div>
                </div>

                <div className="p-2.5 bg-neutral-900/60 rounded-lg border border-neutral-800/80 flex flex-col gap-1 min-w-0">
                    <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between gap-1">
                        <span className="truncate">CROSS-FLOOR %</span>
                        <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    </div>
                    <div className="text-base font-mono font-extrabold text-purple-400">{stats.crossFloorRate}%</div>
                </div>

                <div className="p-2.5 bg-neutral-900/60 rounded-lg border border-neutral-800/80 flex flex-col gap-1 min-w-0">
                    <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between gap-1">
                        <span className="truncate">AVG ENGAGEMENT</span>
                        <TrendingUp className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    </div>
                    <div className="text-base font-mono font-extrabold text-blue-400">{stats.avgEngagementDist}m</div>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="flex flex-col gap-1.5 pt-1">
                <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1 font-bold">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    Player Performance Leaderboard
                </div>

                <Table 
                    containerClassName="custom-scrollbar rounded-lg border border-neutral-800/80 bg-neutral-950/60"
                    className="w-full text-left text-[11px] font-mono border-collapse whitespace-nowrap"
                >
                    <TableHeader className="bg-neutral-900/90 text-neutral-400 uppercase border-b border-neutral-800 text-[10px] [&_tr]:border-none">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="py-2 px-2 font-semibold h-auto text-neutral-400">Player</TableHead>
                            <TableHead className="py-2 px-1.5 font-semibold h-auto text-neutral-400">Op</TableHead>
                            <TableHead className="py-2 px-1.5 text-right font-semibold h-auto text-neutral-400">K</TableHead>
                            <TableHead className="py-2 px-1.5 text-right font-semibold h-auto text-neutral-400">D</TableHead>
                            <TableHead className="py-2 px-1.5 text-right font-semibold h-auto text-neutral-400">K/D</TableHead>
                            <TableHead className="py-2 px-1.5 text-right font-semibold h-auto text-neutral-400">HS</TableHead>
                            <TableHead className="py-2 px-1.5 text-right font-semibold h-auto text-neutral-400">WB</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-neutral-800/50 text-neutral-200 [&_tr:last-child]:border-0">
                        {stats.playerLeaderboard.map((p) => {
                            const isBlue = p.teamSlot === 'BLUE';
                            return (
                                <TableRow key={p.playerId} className="hover:bg-neutral-900/60 transition-colors border-none">
                                    <TableCell className="py-1.5 px-2 font-bold flex items-center gap-1.5 max-w-[100px] min-w-0">
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isBlue ? 'bg-blue-400' : 'bg-orange-400'}`} />
                                        <span className={`truncate ${isBlue ? 'text-blue-300' : 'text-orange-300'}`}>{p.nickname}</span>
                                    </TableCell>
                                    <TableCell className="py-1.5 px-1.5 text-neutral-400 max-w-[65px] truncate">{p.operator}</TableCell>
                                    <TableCell className="py-1.5 px-1.5 text-right font-bold text-emerald-400">{p.kills}</TableCell>
                                    <TableCell className="py-1.5 px-1.5 text-right text-red-400">{p.deaths}</TableCell>
                                    <TableCell className="py-1.5 px-1.5 text-right font-bold">{p.kdRatio}</TableCell>
                                    <TableCell className="py-1.5 px-1.5 text-right text-orange-400">{p.headshots}</TableCell>
                                    <TableCell className="py-1.5 px-1.5 text-right text-yellow-400">{p.wallbangs}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
