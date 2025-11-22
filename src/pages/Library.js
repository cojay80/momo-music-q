import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { Search, Filter, Play, MoreHorizontal, Share2, MessageSquare, ThumbsUp } from 'lucide-react';

export default function LibraryPage() {
    const { tracks, playTrack, currentTrack, isPlaying, playlists, likedTracks, toggleLike } = useMusic();
    const [activeTab, setActiveTab] = useState('Songs');
    const [filterText, setFilterText] = useState('');

    const tabs = ['Songs', 'Playlists', 'Liked Playlists', 'Following', 'Followers', 'History', 'Personas', 'Hooks', 'Liked Hooks'];

    const getDisplayItems = () => {
        if (activeTab === 'Playlists') {
            return playlists.map(p => ({ ...p, title: p.name, artist: `${p.tracks.length} songs`, cover: 'https://via.placeholder.com/150' }));
        }
        // Default to Songs
        return tracks.filter(track =>
            track.title.toLowerCase().includes(filterText.toLowerCase()) ||
            track.artist.toLowerCase().includes(filterText.toLowerCase())
        );
    };

    const displayItems = getDisplayItems();

    return (
        <div className="p-8 min-h-full text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-4xl font-serif font-medium tracking-tight">Library</h1>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-white/10 mb-6 overflow-x-auto scrollbar-hide">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab
                            ? 'text-white border-b-2 border-white'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 flex-1 max-w-xl">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-bold hover:scale-105 transition-transform">
                        <Filter size={16} />
                        <span>Filters (3)</span>
                    </button>
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by song name or style"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="w-full bg-[#181818] border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Track List */}
            <div className="space-y-2">
                {displayItems.map((item) => (
                    <div
                        key={item.id}
                        className={`group flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors ${currentTrack?.id === item.id ? 'bg-white/10' : ''}`}
                    >
                        {/* Cover & Play */}
                        <div className="relative w-16 h-16 flex-shrink-0 cursor-pointer" onClick={() => activeTab === 'Songs' && playTrack(item)}>
                            <img src={item.cover} alt={item.title} className="w-full h-full object-cover rounded-md" />
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${currentTrack?.id === item.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                <Play size={24} fill="white" className="text-white" />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate mb-1">{item.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="truncate">[Genre: {item.genre || 'K-Pop, Ballad'}]</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-6 mr-4">
                            <div className="flex items-center gap-4 text-slate-400">
                                <button
                                    className={`flex items-center gap-1 hover:text-white text-xs ${likedTracks?.has(item.id) ? 'text-green-500' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }}
                                >
                                    <ThumbsUp size={16} fill={likedTracks?.has(item.id) ? "currentColor" : "none"} />
                                    <span>{Math.floor(Math.random() * 50)}</span>
                                </button>
                                <button className="hover:text-white">
                                    <MessageSquare size={18} />
                                </button>
                                <button className="hover:text-white">
                                    <Share2 size={18} />
                                </button>
                                <button className="hover:text-white">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
