import React from 'react';
import { useMusic } from '../context/MusicContext';
import { Play } from 'lucide-react';

export default function NewReleases() {
    const { tracks, playTrack } = useMusic();

    return (
        <div className="p-8 text-white">
            <h1 className="text-4xl font-bold mb-6">최신 음악</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {tracks.slice().reverse().map(track => (
                    <div key={track.id} onClick={() => playTrack(track)} className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-colors group cursor-pointer">
                        <div className="relative w-full aspect-square mb-4 rounded-md overflow-hidden shadow-lg">
                            <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                            <div className="absolute right-2 bottom-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                <Play size={24} fill="currentColor" className="ml-1" />
                            </div>
                        </div>
                        <h3 className="font-bold text-white truncate mb-1">{track.title}</h3>
                        <p className="text-sm text-slate-400 truncate">{track.artist}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
