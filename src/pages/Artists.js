import React from 'react';
import { useMusic } from '../context/MusicContext';

export default function Artists() {
    const { tracks } = useMusic();
    // Extract unique artists
    const artists = [...new Set(tracks.map(t => t.artist))];

    return (
        <div className="p-8 text-white">
            <h1 className="text-4xl font-bold mb-6">아티스트</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {artists.map((artist, index) => (
                    <div key={index} className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-colors cursor-pointer text-center">
                        <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-lg">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${artist}`} alt={artist} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-bold text-white truncate">{artist}</h3>
                        <p className="text-sm text-slate-400">Artist</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
