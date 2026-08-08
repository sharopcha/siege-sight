import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { useTelemetryStore } from '@/store/telemetry-store';
import { usePlaybackStore } from '@/store/playback-store';
import { Upload, FileJson, CheckCircle2, AlertTriangle, Download, RefreshCw, X } from 'lucide-react';

interface TelemetryUploaderProps {
    buttonVariant?: 'header' | 'menu' | 'full';
    className?: string;
}

export function TelemetryUploader({ buttonVariant = 'header', className = '' }: TelemetryUploaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [jsonText, setJsonText] = useState('');

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const importJsonFile = useTelemetryStore((s) => s.importJsonFile);
    const importMatchData = useTelemetryStore((s) => s.importMatchData);
    const resetToDefaults = useTelemetryStore((s) => s.resetToDefaults);
    const resetPlayback = usePlaybackStore((s) => s.reset);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processFile(file);
    };

    const processFile = async (file: File) => {
        setIsProcessing(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!file.name.endsWith('.json')) {
            setErrorMsg('Please upload a valid .json telemetry file.');
            setIsProcessing(false);
            return;
        }

        const res = await importJsonFile(file);
        setIsProcessing(false);

        if (res.success) {
            resetPlayback();
            setSuccessMsg(`Successfully imported ${res.count || 1} match telemetry dataset(s)!`);
            setTimeout(() => {
                setIsOpen(false);
                setSuccessMsg(null);
            }, 1500);
        } else {
            setErrorMsg(res.error || 'Failed to process telemetry JSON file.');
        }
    };

    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const handlePasteSubmit = () => {
        if (!jsonText.trim()) return;
        setIsProcessing(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        const res = importMatchData(jsonText);
        setIsProcessing(false);

        if (res.success) {
            resetPlayback();
            setSuccessMsg(`Successfully imported ${res.count || 1} match telemetry dataset(s)!`);
            setJsonText('');
            setTimeout(() => {
                setIsOpen(false);
                setSuccessMsg(null);
            }, 1500);
        } else {
            setErrorMsg(res.error || 'Invalid JSON syntax or schema.');
        }
    };

    const handleDownloadSample = () => {
        const currentMatches = useTelemetryStore.getState().matches;
        const sample = Object.values(currentMatches)[0];
        if (!sample) return;

        const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `telemetry-sample-${sample.matchId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            {buttonVariant === 'header' ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-neutral-900 border border-neutral-700 hover:border-blue-500 hover:text-blue-400 text-neutral-200 text-xs font-mono font-semibold transition-all shadow-sm whitespace-nowrap shrink-0 ${className}`}
                    title="Upload or paste custom telemetry JSON"
                >
                    <Upload className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="whitespace-nowrap">Import JSON</span>
                </button>
            ) : buttonVariant === 'menu' ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-neutral-300 hover:bg-neutral-900 rounded transition-colors text-left"
                >
                    <FileJson className="w-4 h-4 text-blue-400" />
                    <span>Upload Telemetry JSON</span>
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className={`w-full py-2 px-3 bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${className}`}
                >
                    <Upload className="w-4 h-4" />
                    Upload Match Telemetry JSON
                </button>
            )}

            {/* Modal Dialog */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-lg w-full p-5 shadow-2xl relative text-neutral-100 flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                            <div className="flex items-center gap-2">
                                <FileJson className="w-5 h-5 text-blue-400" />
                                <h3 className="font-mono font-bold text-sm text-neutral-100">Telemetry Data Ingestion</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-neutral-400 hover:text-neutral-200 p-1 rounded hover:bg-neutral-800 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-neutral-400 font-mono">
                            Upload a processed Rainbow Six Siege match telemetry JSON file conforming to Schema v2. All stats, paths, frags, and 3D point clouds will update immediately.
                        </p>

                        {/* Drag & Drop Area */}
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${dragOver ? 'border-blue-500 bg-blue-950/20' : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50'
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Upload className={`w-8 h-8 ${dragOver ? 'text-blue-400 animate-bounce' : 'text-neutral-500'}`} />
                            <div className="text-xs font-mono font-medium text-neutral-300">
                                Click to browse or drop your <span className="text-blue-400 font-bold">.json</span> file here
                            </div>
                            <span className="text-[10px] text-neutral-500 font-mono">Supports single match or seed dataset collections</span>
                        </div>

                        {/* Direct Paste Area */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                                <span>Or Paste Raw JSON:</span>
                                <button
                                    onClick={handleDownloadSample}
                                    className="text-blue-400 hover:underline flex items-center gap-1 text-[10px]"
                                >
                                    <Download className="w-3 h-3" />
                                    Download Sample Schema
                                </button>
                            </label>
                            <textarea
                                value={jsonText}
                                onChange={(e) => setJsonText(e.target.value)}
                                placeholder='{"matchId": "custom_match_1", "schemaVersion": 2, ...}'
                                className="w-full h-24 bg-neutral-900/80 border border-neutral-800 rounded-md p-2.5 font-mono text-[11px] text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-blue-500 resize-none custom-scrollbar"
                            />
                        </div>

                        {/* Messages */}
                        {isProcessing && (
                            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 bg-blue-950/40 border border-blue-900/60 p-2.5 rounded-md">
                                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                                <span>Validating schema & ingesting telemetry streams...</span>
                            </div>
                        )}

                        {errorMsg && (
                            <div className="flex items-start gap-2 text-xs font-mono text-red-400 bg-red-950/40 border border-red-900/60 p-2.5 rounded-md max-h-24 overflow-y-auto custom-scrollbar">
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {successMsg && (
                            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 p-2.5 rounded-md">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>{successMsg}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between border-t border-neutral-800 pt-3 mt-1">
                            <button
                                onClick={() => {
                                    resetToDefaults();
                                    resetPlayback();
                                    setSuccessMsg('Reset store to default seed matches.');
                                    setTimeout(() => setSuccessMsg(null), 1500);
                                }}
                                className="text-[11px] font-mono text-neutral-400 hover:text-neutral-200 flex items-center gap-1.5"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Reset Defaults
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-3 py-1.5 rounded-md text-xs font-mono text-neutral-400 hover:bg-neutral-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePasteSubmit}
                                    disabled={!jsonText.trim() || isProcessing}
                                    className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shadow-md shadow-blue-950"
                                >
                                    Parse & Load
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
