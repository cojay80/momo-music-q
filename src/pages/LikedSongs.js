import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import TrackCard from '../components/TrackCard';

export default function LikedSongs() {
    const { tracks, currentTrack, isPlaying, playTrack, user, handleDeleteTrack } = useMusic();
    const navigate = useNavigate();

    // For now, show all tracks as liked.
    const likedTracks = tracks;

    return (
        <div className="pb-10">
            <div className="bg-gradient-to-b from-purple-800 to-[#121212] p-8 flex flex-col md:flex-row gap-6 items-end">
                <div className="w-52 h-52 bg-gradient-to-br from-purple-700 to-blue-300 shadow-2xl shadow-black/50 flex items-center justify-center rounded-md">
                    <Heart size={80} className="text-white" fill="currentColor" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Playlist</p>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">Liked Songs</h1>
                    <p className="text-white/70 text-sm font-bold flex items-center gap-2">
                        <span className="text-white">{user ? user.email : 'Guest'}</span> ? {likedTracks.length} songs
                    </p>
                </div>
            </div>

            <div className="px-6 py-8">
                <div className="space-y-2">
                    {likedTracks.length > 0 ? likedTracks.map((track, index) => (
                        <TrackCard
                            key={track.id}
                            track={track}
                            index={index}
                            isActive={currentTrack?.id === track.id}
                            isPlaying={isPlaying}
                            onClick={() => playTrack(track)}
                            onDetails={(item) => navigate(`/tracks/${item.id}`)}
                            onDelete={handleDeleteTrack}
                            isAdmin={!!user}
                        />
                    )) : (
                        <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl text-slate-500">
                            <Heart size={40} className="mx-auto mb-4 opacity-20" />
                            <p>No liked songs yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
