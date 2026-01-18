import React from 'react';
import { useMusic } from '../context/MusicContext';
import TrackCard from '../components/TrackCard';

export default function Charts() {
    const { tracks, playTrack, currentTrack, isPlaying } = useMusic();

    return (
        <div className="p-8 text-white">
            <h1 className="text-4xl font-bold mb-6">Top Charts</h1>
            <div className="space-y-2">
                {tracks.map((track, index) => (
                    <TrackCard
                        key={track.id}
                        track={track}
                        index={index}
                        isActive={currentTrack?.id === track.id}
                        isPlaying={isPlaying}
                        onClick={() => playTrack(track, tracks)}
                        isAdmin={false}
                        metaText={track.duration || "3:45"}
                    />
                ))}
            </div>
        </div>
    );
}
