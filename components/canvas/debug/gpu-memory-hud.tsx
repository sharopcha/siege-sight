import { useState, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Activity } from 'lucide-react';

export function GpuMemoryHud() {
    const gl = useThree((s) => s.gl);
    const [stats, setStats] = useState({
        calls: 0,
        geometries: 0,
        textures: 0,
        triangles: 0,
        points: 0,
        fps: 60,
    });

    const lastTimeRef = useRef(performance.now());
    const frameCountRef = useRef(0);

    useFrame(() => {
        frameCountRef.current++;
        const now = performance.now();
        const elapsed = now - lastTimeRef.current;
        if (elapsed >= 1000) {
            const fps = Math.round((frameCountRef.current * 1000) / elapsed);
            setStats({
                calls: gl.info.render.calls,
                geometries: gl.info.memory.geometries,
                textures: gl.info.memory.textures,
                triangles: gl.info.render.triangles,
                points: gl.info.render.points,
                fps,
            });
            frameCountRef.current = 0;
            lastTimeRef.current = now;
        }
    });

    return (
        <Html fullscreen className="pointer-events-none" zIndexRange={[10, 0]}>
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 sm:gap-2 bg-neutral-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-md border border-neutral-800 text-[10px] sm:text-[11px] font-mono text-neutral-300 shadow-lg pointer-events-auto">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                <span className="text-emerald-400 font-bold">{stats.fps} FPS</span>
                <span className="text-neutral-600">|</span>
                <span className="hidden sm:inline">{stats.calls} calls</span>
                <span className="text-neutral-600 hidden sm:inline">|</span>
                <span className="hidden md:inline">{stats.geometries} geom</span>
                <span className="text-neutral-600 hidden md:inline">|</span>
                <span className="text-blue-400">{stats.points} pts</span>
            </div>
        </Html>
    );
}
