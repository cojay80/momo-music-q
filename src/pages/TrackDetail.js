import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Share2, PlusCircle } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function TrackDetail() {
    const { trackId } = useParams();
    const navigate = useNavigate();
    const { tracks, playTrack, addToPlaylist } = useMusic();

    const track = tracks.find((item) => item.id === trackId);

    if (!track) {
        return (
            <div className="p-8 text-white">
                <button onClick={() => navigate(-1)} className="text-slate-300 hover:text-white flex items-center gap-2 mb-6">
                    <ArrowLeft size={18} /> Back
                </button>
                <p className="text-slate-400">Track not found.</p>
            </div>
        );
    }

    const handleShare = async () => {
        const shareText = `${track.title} - ${track.artist}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: track.title, text: shareText });
                return;
            }
            await navigator.clipboard.writeText(shareText);
            alert("Track info copied to clipboard.");
        } catch (error) {
            console.error("Share failed:", error);
            alert("Share failed. Please try again.");
        }
    };

    return (
        <div className="p-8 text-white">
            <button onClick={() => navigate(-1)} className="text-slate-300 hover:text-white flex items-center gap-2 mb-6">
                <ArrowLeft size={18} /> Back
            </button>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1">
                    <h1 className="text-4xl font-black mb-2">{track.title}</h1>
                    <p className="text-slate-400 text-lg mb-6">{track.artist}</p>

                    <div className="flex flex-wrap gap-3 mb-8">
                        <button
                            onClick={() => playTrack(track, tracks)}
                            className="px-6 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            <Play size={18} fill="currentColor" />
                            Play
                        </button>
                        <button
                            onClick={() => addToPlaylist(track)}
                            className="px-6 py-3 border border-white/10 rounded-full font-bold text-slate-200 hover:text-white hover:border-white/30 transition-colors flex items-center gap-2"
                        >
                            <PlusCircle size={18} />
                            Add to playlist
                        </button>
                        <button
                            onClick={handleShare}
                            className="px-6 py-3 border border-white/10 rounded-full font-bold text-slate-200 hover:text-white hover:border-white/30 transition-colors flex items-center gap-2"
                        >
                            <Share2 size={18} />
                            Share
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-300">{track.genre || 'Unknown'}</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-300">{track.duration || 'Unknown length'}</span>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-lg font-bold">Lyrics</h2>
                        {track.lyrics && track.lyrics.length > 0 ? (
                            track.lyrics.map((line, index) => {
                                const lineText = typeof line === 'string' ? line : line?.text || '';
                                return (
                                    <p key={index} className="text-slate-300 text-sm leading-relaxed">
                                        {lineText}
                                    </p>
                                );
                            })
                        ) : (
                            <p className="text-slate-500 text-sm">No lyrics available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
