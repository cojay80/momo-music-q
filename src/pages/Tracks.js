import React from 'react';
import { Disc, Music } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import TrackCard from '../components/TrackCard';

export default function Tracks() {
    const { filteredTracks, currentTrack, isPlaying, playTrack, user, handleDeleteTrack } = useMusic();

    return (
        <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                    <div className="p-2 bg-purple-500/20 rounded-lg"><Disc className="text-purple-400" size={24} /></div>
                    All Tracks <span className="text-slate-500 text-lg font-normal ml-2">{filteredTracks.length} songs</span>
                </h2>
            </div>

            <div className="space-y-2">
                {filteredTracks.length > 0 ? filteredTracks.map((track, index) => (
                    <TrackCard
                        key={track.id}
                        track={track}
                        index={index}
                        isActive={currentTrack?.id === track.id}
                        isPlaying={isPlaying}
                        onClick={() => playTrack(track)}
                        onDelete={handleDeleteTrack}
                        isAdmin={!!user}
                    />
                )) : (
                    <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl text-slate-500">
                        <Music size={40} className="mx-auto mb-4 opacity-20" />
                        <p>검색 결과가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
