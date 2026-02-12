"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Play, Pause, FastForward, RotateCcw, Clock } from "lucide-react"
import { SimulationResponse, SimulationLog } from "@/lib/traffic-api"
import { cn } from "@/lib/utils"

interface SimulationPlaybackProps {
    data: SimulationResponse
}

export function SimulationPlayback({ data }: SimulationPlaybackProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [playbackSpeed, setPlaybackSpeed] = useState(1)
    
    // Sort logs by time/episode if needed, assuming they are sequential for now.
    // We need to build a timeline. 
    // The log gives durations. e.g. J1 Phase 0 (34s) -> J1 Phase 1 (5s) ...
    // Since logs might contain multiple junctions interleaved, we need to track state per junction.
    
    const { totalDuration, junctionTimelines } = useMemo(() => {
        let maxTime = 0;
        const timelines: Record<string, { start: number, end: number, phase: number }[]> = {};
        
        // Group logs by junction
        const byJunction: Record<string, SimulationLog[]> = {};
        data.simulation_log.forEach(log => {
             if (!byJunction[log.junction_id]) byJunction[log.junction_id] = [];
             byJunction[log.junction_id].push(log);
        });

        // Calculate absolute start/end times for each phase usage
        Object.keys(byJunction).forEach(jid => {
            timelines[jid] = [];
            let t = 0;
            // Limit to first episode for clarity? Or string them all together?
            // Let's filter to just episode 0 or the first encountered episode for a cleaner demo loop
            // assuming logs might be huge.
            const uniqueEpisodes = Array.from(new Set(byJunction[jid].map(l => l.episode)));
            const targetEpisode = uniqueEpisodes[uniqueEpisodes.length - 1]; // Take last episode (trained)

            const logs = byJunction[jid].filter(l => l.episode === targetEpisode);
            
            logs.forEach(log => {
                timelines[jid].push({
                    start: t,
                    end: t + log.duration,
                    phase: log.phase_id
                });
                t += log.duration;
            });
            if (t > maxTime) maxTime = t;
        });

        return { totalDuration: maxTime, junctionTimelines: timelines };
    }, [data]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentTime(prev => {
                    const next = prev + (0.1 * playbackSpeed);
                    if (next >= totalDuration) {
                        setIsPlaying(false);
                        return totalDuration;
                    }
                    return next;
                });
            }, 100); // Update every 100ms
        }
        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, totalDuration]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentTime(Number(e.target.value));
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Clock className="text-primary" size={20} />
                    Signal Simulation
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                     Episode Loop
                </div>
            </div>

            {/* Junctions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Object.keys(junctionTimelines).map(jid => {
                    // Find active phase
                    const timeline = junctionTimelines[jid];
                    const activeSegment = timeline.find(s => currentTime >= s.start && currentTime < s.end) 
                                          || timeline[timeline.length - 1]; // Fallback to last
                    
                    const phaseId = activeSegment?.phase ?? 0;
                    const phaseDef = data.phase_definitions[jid]?.[phaseId] || "";
                    
                    // Simple progress for current phase
                    const segmentProgress = activeSegment 
                        ? ((currentTime - activeSegment.start) / (activeSegment.end - activeSegment.start)) * 100 
                        : 0;

                    return (
                        <JunctionCard 
                            key={jid} 
                            id={jid} 
                            phaseId={phaseId} 
                            signalString={phaseDef}
                            timeLeft={activeSegment ? Math.max(0, activeSegment.end - currentTime).toFixed(0) : "0"}
                            progress={segmentProgress}
                        />
                    );
                })}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3 bg-muted/20 p-4 rounded-lg">
                <input 
                    type="range" 
                    min={0} 
                    max={totalDuration} 
                    value={currentTime} 
                    onChange={handleSeek}
                    className="w-full accent-primary h-2 bg-border rounded-lg appearance-none cursor-pointer"
                />
                
                <div className="flex items-center justify-between">
                    <div className="font-mono text-sm w-16">
                        {currentTime.toFixed(1)}s
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                             onClick={() => {
                                 setCurrentTime(0);
                                 setIsPlaying(true);
                             }}
                             className="p-2 hover:bg-muted rounded-full text-muted-foreground tooltip"
                             title="Restart"
                        >
                            <RotateCcw size={18} />
                        </button>
                        
                        <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-md active:scale-95"
                        >
                            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                        </button>

                        <button 
                             onClick={() => setPlaybackSpeed(s => s === 1 ? 2 : s === 2 ? 5 : 1)}
                             className="px-2 py-1 hover:bg-muted rounded-md text-xs font-bold text-muted-foreground w-12 text-center"
                        >
                            {playbackSpeed}x
                        </button>
                    </div>
                    
                    <div className="font-mono text-sm text-muted-foreground w-16 text-right">
                        {totalDuration.toFixed(0)}s
                    </div>
                </div>
            </div>
        </div>
    )
}

function JunctionCard({ id, phaseId, signalString, timeLeft, progress }: any) {
    // Parse rrrGGG into circles
    const lights = signalString.split('').map((char: string, i: number) => {
        const c = char.toLowerCase();
        let color = "bg-slate-300";
        if (c === 'r') color = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
        if (c === 'g') color = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]";
        if (c === 'y') color = "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]";
        
        return <div key={i} className={cn("w-3 h-3 rounded-full transition-colors duration-300", color)} />
    });

    return (
        <div className="bg-background border border-border p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                   <div className="text-xs font-mono text-muted-foreground truncate max-w-[150px]" title={id}>ID: ...{id.slice(-8)}</div>
                   <div className="font-semibold text-sm mt-1">Current Phase: {phaseId}</div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold font-mono">{timeLeft}s</span>
                    <span className="text-[10px] text-muted-foreground">REMAINING</span>
                </div>
            </div>
            
            {/* Signal Visual */}
            <div className="bg-slate-900 rounded-lg p-3 flex flex-wrap gap-2 justify-center mb-4 border border-slate-800">
                {lights.length > 0 ? lights : <span className="text-xs text-slate-500">No Signal Data</span>}
            </div>

            {/* Timer Bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                   className="h-full bg-primary transition-all duration-100 ease-linear"
                   style={{ width: `${100 - progress}%` }} 
                />
            </div>
        </div>
    )
}
