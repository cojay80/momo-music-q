import React from 'react';
import { useMusic } from '../context/MusicContext';
import { MoreHorizontal, Share2, MessageSquare, ThumbsUp } from 'lucide-react';

export default function RightSidebar() {
    const { currentTrack, addToPlaylist, toggleLike, likedTracks } = useMusic();

    if (!currentTrack) {
        return (
            <div className="w-80 bg-black border-l border-white/5 hidden xl:flex flex-col p-6 items-center justify-center text-slate-500">
                <p>재생 중인 곡이 없습니다</p>
            </div>
        );
    }

    const isLiked = likedTracks.has(currentTrack.id);

    return (
        <div className="w-80 bg-black border-l border-white/5 hidden xl:flex flex-col h-full overflow-y-auto scrollbar-hide">
            {/* Top Image Section */}
            <div className="p-6 pb-0">
                <div className="aspect-square w-full bg-slate-800 rounded-lg overflow-hidden mb-6 shadow-2xl relative group">
                    <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                </div>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white leading-tight mb-1">{currentTrack.title}</h2>
                    <p className="text-slate-400 font-medium">{currentTrack.artist}</p>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => addToPlaylist(currentTrack)}
                        className="flex-1 bg-white text-black font-bold py-2 rounded-full hover:scale-105 transition-transform text-sm"
                    >
                        재생목록에 추가
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white border border-white/10 rounded-full">
                        <Share2 size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white border border-white/10 rounded-full">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* Stats / Actions */}
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-slate-400 text-sm">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex items-center gap-1 cursor-pointer ${isLiked ? 'text-green-500' : 'hover:text-white'}`}
                        onClick={() => toggleLike(currentTrack.id)}
                    >
                        <ThumbsUp size={16} fill={isLiked ? "currentColor" : "none"} />
                        <span>{isLiked ? '1.2k' : '1.2k'}</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-white cursor-pointer">
                        <MessageSquare size={16} />
                        <span>42</span>
                    </div>
                </div>
                <span>3:45</span>
            </div>

            {/* Lyrics Section */}
            <div className="p-6 border-t border-white/5 flex-1 overflow-y-auto scrollbar-hide">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Lyrics</h3>
                </div>

                <div className="space-y-4 text-center">
                    {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
                        currentTrack.lyrics.map((line, index) => (
                            <p key={index} className="text-slate-400 text-sm leading-relaxed hover:text-white transition-colors cursor-default">
                                {line}
                            </p>
                        ))
                    ) : (
                        <p className="text-slate-500 text-sm italic">가사가 없습니다.</p>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-300 hover:bg-white/10 cursor-pointer">K-Pop</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-300 hover:bg-white/10 cursor-pointer">Ballad</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-300 hover:bg-white/10 cursor-pointer">Healing</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
