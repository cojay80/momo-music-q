import React from 'react';
import { Play, Pause, SkipForward, SkipBack, ChevronRight, Mic2, Volume2, Repeat, Shuffle } from 'lucide-react';

export default function Player({
    currentTrack,
    isPlaying,
    onPlayPause,
    onNext,
    onPrevious,
    isShuffle,
    onToggleShuffle,
    repeatMode,
    onToggleRepeat,
    progress,
    currentTime,
    duration,
    volume,
    onVolumeChange,
    showLyrics,
    onToggleLyrics,
    audioRef,
    onTimeUpdate,
    onLoadedMetadata,
    onEnded
}) {
    if (!currentTrack) return null;

    const formatTime = (timeSeconds) => {
        if (!Number.isFinite(timeSeconds) || timeSeconds < 0) return "0:00";
        const minutes = Math.floor(timeSeconds / 60);
        const seconds = Math.floor(timeSeconds % 60);
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    };

    const handleSeek = (event) => {
        if (!audioRef.current || !Number.isFinite(duration) || duration <= 0) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
        audioRef.current.currentTime = percent * duration;
    };

    const handleVolumeChange = (event) => {
        const nextVolume = Number(event.target.value);
        if (Number.isFinite(nextVolume)) {
            onVolumeChange(nextVolume);
        }
    };

    const handlePrevious = () => {
        if (audioRef.current && currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }
        onPrevious();
    };

    return (
        <>
            <audio
                ref={audioRef}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={onEnded}
            />

            {/* Floating Glass Player */}
            <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
                <div className="w-full md:w-[80%] max-w-screen-xl mx-auto pointer-events-auto">
                    <div className="h-[88px] bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-between px-6 shadow-2xl shadow-black/50 relative overflow-hidden hover:border-white/20 transition-colors duration-300">
                        
                        {/* Track Info (Left) */}
                        <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden group cursor-pointer shadow-lg" onClick={onToggleLyrics}>
                                <img src={currentTrack.cover} className="w-full h-full object-cover" alt="cover" />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                                    <ChevronRight size={20} className="text-white opacity-0 group-hover:opacity-100 transform -rotate-90" />
                                </div>
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="font-bold text-base text-white hover:text-purple-400 transition-colors cursor-pointer truncate">{currentTrack.title}</h4>
                                <p className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer truncate">{currentTrack.artist}</p>
                            </div>
                        </div>

                        {/* Controls (Center) */}
                        <div className="flex flex-col items-center w-[40%] max-w-md">
                            <div className="flex items-center gap-6 mb-2">
                                <button onClick={onToggleShuffle} className={`transition-all hover:scale-110 ${isShuffle ? 'text-purple-500' : 'text-slate-400 hover:text-white'}`}>
                                    <Shuffle size={18} />
                                </button>
                                <button onClick={handlePrevious} className="text-slate-400 hover:text-white transition-all hover:scale-110">
                                    <SkipBack size={22} fill="currentColor" />
                                </button>
                                <button onClick={onPlayPause} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-lg shadow-white/20">
                                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                                </button>
                                <button onClick={onNext} className="text-slate-400 hover:text-white transition-all hover:scale-110">
                                    <SkipForward size={22} fill="currentColor" />
                                </button>
                                <button onClick={onToggleRepeat} className={`relative transition-all hover:scale-110 ${repeatMode !== 'off' ? 'text-purple-500' : 'text-slate-400 hover:text-white'}`}>
                                    <Repeat size={18} />
                                    {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[10px] font-bold text-purple-500">1</span>}
                                </button>
                            </div>
                            
                            <div className="w-full flex items-center gap-3 text-xs text-slate-400 font-medium tracking-wide">
                                <span className="w-10 text-right">{formatTime(currentTime)}</span>
                                <div className="flex-1 h-1.5 bg-white/10 rounded-full group cursor-pointer relative overflow-hidden" onClick={handleSeek}>
                                    <div className="absolute h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full group-hover:from-purple-400 group-hover:to-blue-400" style={{ width: `${progress}%` }}></div>
                                </div>
                                <span className="w-10">{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Volume & Extras (Right) */}
                        <div className="flex justify-end items-center w-[30%] gap-4">
                            <button onClick={onToggleLyrics} className={`p-2 rounded-full transition-colors ${showLyrics ? 'text-purple-500 bg-white/10' : 'text-slate-400 hover:text-white'}`}>
                                <Mic2 size={20} />
                            </button>
                            <div className="flex items-center gap-3 w-32 group">
                                <Volume2 size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                                <div className="flex-1 h-1 bg-white/10 rounded-full relative">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="h-full bg-slate-500 rounded-full group-hover:bg-white transition-colors" style={{ width: `${volume * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
