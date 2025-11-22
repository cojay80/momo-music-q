import React from 'react';
import { useMusic } from '../context/MusicContext';
import { Play, Pause } from 'lucide-react';

export default function Charts() {
    const { tracks, playTrack, currentTrack, isPlaying } = useMusic();

    return (
        <div className="p-8 text-white">
            <h1 className="text-4xl font-bold mb-6">인기 차트</h1>
            <div className="space-y-2">
                {tracks.map((track, index) => (
                    <div key={track.id} className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg group">
                        <span className="text-slate-400 font-bold w-6 text-center">{index + 1}</span>
                        <div className="relative w-12 h-12 flex-shrink-0 cursor-pointer" onClick={() => playTrack(track)}>
                            <img src={track.cover} alt={track.title} className="w-full h-full object-cover rounded" />
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${currentTrack?.id === track.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {currentTrack?.id === track.id && isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold">{track.title}</h3>
                            <p className="text-sm text-slate-400">{track.artist}</p>
                        </div>
                        <span className="text-sm text-slate-400">3:45</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
