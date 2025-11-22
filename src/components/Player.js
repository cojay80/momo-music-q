import React from 'react';
import { Play, Pause, SkipForward, SkipBack, ChevronRight, Mic2, Volume2, Repeat, Shuffle } from 'lucide-react';

export default function Player({
    currentTrack,
    isPlaying,
    onPlayPause,
    progress,
    showLyrics,
    onToggleLyrics,
    audioRef,
    onTimeUpdate,
    onEnded
}) {
    if (!currentTrack) return null;

    return (
        <>
            <audio
                ref={audioRef}
                onTimeUpdate={onTimeUpdate}
                onEnded={onEnded}
            />

            <div className="h-24 bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between z-50">
                {/* Track Info (Left) */}
                <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
                    <div className="relative w-14 h-14 rounded-md overflow-hidden group cursor-pointer" onClick={onToggleLyrics}>
                        <img src={currentTrack.cover} className="w-full h-full object-cover" alt="cover" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                            <ChevronRight size={20} className="text-white opacity-0 group-hover:opacity-100 transform -rotate-90" />
                        </div>
                    </div>
                    <div className="overflow-hidden">
                        <h4 className="font-bold text-sm text-white hover:underline cursor-pointer truncate">{currentTrack.title}</h4>
                        <p className="text-xs text-slate-400 hover:text-white hover:underline cursor-pointer truncate">{currentTrack.artist}</p>
                    </div>
                </div>

                {/* Controls (Center) */}
                <div className="flex flex-col items-center w-[40%] max-w-md">
                    <div className="flex items-center gap-6 mb-2">
                        <button className="text-slate-400 hover:text-white transition-colors"><Shuffle size={16} /></button>
                        <button className="text-slate-400 hover:text-white transition-colors"><SkipBack size={20} fill="currentColor" /></button>
                        <button onClick={onPlayPause} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform">
                            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <button className="text-slate-400 hover:text-white transition-colors"><SkipForward size={20} fill="currentColor" /></button>
                        <button className="text-slate-400 hover:text-white transition-colors"><Repeat size={16} /></button>
                    </div>

                    <div className="w-full flex items-center gap-2 text-xs text-slate-400 font-mono">
                        <span>0:00</span>
                        <div className="flex-1 h-1 bg-slate-600 rounded-full group cursor-pointer relative">
                            <div className="absolute h-full bg-white rounded-full group-hover:bg-green-500" style={{ width: `${progress}%` }}></div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100" style={{ left: `${progress}%` }}></div>
                        </div>
                        <span>3:45</span>
                    </div>
                </div>

                {/* Extra Controls (Right) */}
                <div className="flex justify-end items-center w-[30%] gap-3">
                    <button onClick={onToggleLyrics} className={`p-2 rounded-full transition-colors ${showLyrics ? 'text-green-500' : 'text-slate-400 hover:text-white'}`}><Mic2 size={18} /></button>
                    <div className="flex items-center gap-2 w-24">
                        <Volume2 size={18} className="text-slate-400" />
                        <div className="h-1 bg-slate-600 rounded-full flex-1">
                            <div className="h-full bg-slate-400 w-2/3 rounded-full hover:bg-green-500"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
