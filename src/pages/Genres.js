import React from 'react';

export default function Genres() {
    const genres = [
        { id: 1, name: 'K-Pop', color: 'bg-pink-500' },
        { id: 2, name: 'Hip Hop', color: 'bg-orange-500' },
        { id: 3, name: 'Pop', color: 'bg-green-500' },
        { id: 4, name: 'Indie', color: 'bg-blue-500' },
        { id: 5, name: 'R&B', color: 'bg-purple-500' },
        { id: 6, name: 'Rock', color: 'bg-red-500' },
        { id: 7, name: 'Jazz', color: 'bg-yellow-500' },
        { id: 8, name: 'Classical', color: 'bg-teal-500' },
    ];

    return (
        <div className="p-8 text-white">
            <h1 className="text-4xl font-bold mb-6">장르 및 무드</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {genres.map(genre => (
                    <div key={genre.id} className={`${genre.color} h-48 rounded-lg p-6 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform`}>
                        <h3 className="text-2xl font-bold">{genre.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}
