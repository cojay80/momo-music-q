import React from 'react';
import { useMusic } from '../context/MusicContext';
import { useNavigate } from 'react-router-dom';

export default function Genres() {
    const { tracks, setSelectedGenre } = useMusic();
    const navigate = useNavigate();
    const colorPool = ['bg-pink-500', 'bg-orange-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'];
    const genreMap = tracks.reduce((acc, track) => {
        const name = track.genre || 'Unknown';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});
    const genres = Object.entries(genreMap).map(([name, count], index) => ({
        id: name,
        name,
        count,
        color: colorPool[index % colorPool.length]
    }));

    return (
        <div className="p-8 text-white">
            <h1 className="text-4xl font-bold mb-6">Genres</h1>
            {genres.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {genres.map(genre => (
                        <div
                            key={genre.id}
                            onClick={() => { setSelectedGenre(genre.name); navigate('/tracks'); }}
                            className={`${genre.color} h-48 rounded-lg p-6 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform`}
                        >
                            <h3 className="text-2xl font-bold">{genre.name}</h3>
                            <p className="text-sm mt-2 text-white/80">{genre.count} tracks</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-400">No genre data available yet.</p>
            )}
        </div>
    );
}
