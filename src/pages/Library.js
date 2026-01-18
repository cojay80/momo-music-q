import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { useNavigate } from 'react-router-dom';
import { Search, Play, MoreHorizontal, Share2, MessageSquare, ThumbsUp, PlusCircle } from 'lucide-react';

export default function LibraryPage() {
    const {
        tracks,
        playTrack,
        currentTrack,
        isPlaying,
        playlists,
        likedTracks,
        toggleLike,
        setSearchQuery,
        createPlaylist,
        addToPlaylist,
        updatePlaylistName,
        removeTrackFromPlaylist,
        movePlaylistTrack
    } = useMusic();
    const [activeTab, setActiveTab] = useState('Songs');
    const [filterText, setFilterText] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const navigate = useNavigate();

    const handleCreatePlaylist = () => {
        const name = newPlaylistName.trim();
        if (!name) return;
        createPlaylist(name);
        setNewPlaylistName("");
        setIsCreateModalOpen(false);
    };

    const tabs = ['Songs', 'Playlists', 'Liked Playlists', 'Following', 'Followers', 'History', 'Personas', 'Hooks', 'Liked Hooks'];

    const getDisplayItems = () => {
        if (activeTab === 'Playlists') {
            return playlists.map((p) => ({ ...p, title: p.name, artist: `${p.tracks.length} songs`, cover: 'https://via.placeholder.com/150' }));
        }
        if (activeTab === 'Songs') {
            return tracks.filter((track) =>
                track.title.toLowerCase().includes(filterText.toLowerCase()) ||
                track.artist.toLowerCase().includes(filterText.toLowerCase())
            );
        }
        return [];
    };

    const displayItems = getDisplayItems();
    const selectedPlaylist = playlists.find((item) => item.id === selectedPlaylistId);

    const handleShare = async (item) => {
        const shareText = `${item.title} - ${item.artist}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: item.title, text: shareText });
                return;
            }
            await navigator.clipboard.writeText(shareText);
            alert("Track info copied to clipboard.");
        } catch (error) {
            console.error("Share failed:", error);
            alert("Share failed. Please try again.");
        }
    };

    const handleCopyInfo = async (item) => {
        try {
            await navigator.clipboard.writeText(`${item.title} - ${item.artist}`);
            alert("Track info copied to clipboard.");
        } catch (error) {
            console.error("Copy failed:", error);
            alert("Copy failed. Please try again.");
        }
    };

    const handleAddNote = () => {
        window.alert("Notes are coming soon.");
    };

    return (
        <div className="p-8 min-h-full text-white">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-4xl font-serif font-medium tracking-tight">Library</h1>
                <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-full text-sm font-bold transition-all text-white shadow-lg"
                >
                    <PlusCircle size={18} />
                    <span>New Playlist</span>
                </button>
            </div>

            <div className="flex items-center gap-6 border-b border-white/10 mb-6 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        type="button"
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

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 flex-1 max-w-xl">
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
                {activeTab === 'Songs' && (
                    <button
                        type="button"
                        onClick={() => { setSearchQuery(filterText); navigate('/tracks'); }}
                        className="ml-4 hidden md:inline-flex items-center gap-2 px-4 py-2 border border-white/10 text-slate-200 rounded-full text-sm font-bold hover:text-white hover:border-white/30 transition-colors"
                    >
                        Open in Tracks
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {displayItems.length > 0 ? (
                    displayItems.map((item) => {
                        const isPlaylistItem = activeTab === 'Playlists';
                        return (
                        <div
                            key={item.id}
                            className={`group flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors ${currentTrack?.id === item.id || selectedPlaylistId === item.id ? 'bg-white/10' : ''}`}
                        >
                            <div
                                className="relative w-16 h-16 flex-shrink-0 cursor-pointer"
                                onClick={() => {
                                    if (isPlaylistItem) {
                                        setSelectedPlaylistId(item.id);
                                    } else {
                                        playTrack(item, displayItems);
                                    }
                                }}
                            >
                                <img src={item.cover} alt={item.title} className="w-full h-full object-cover rounded-md" />
                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${currentTrack?.id === item.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                    <Play size={24} fill="white" className="text-white" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white truncate mb-1">{item.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="truncate">{isPlaylistItem ? item.artist : `[Genre: ${item.genre || 'Unknown'}]`}</span>
                                </div>
                            </div>

                            {activeTab === 'Songs' && (
                                <div className="flex items-center gap-6 mr-4 relative">
                                    <div className="flex items-center gap-4 text-slate-400">
                                        <button
                                            type="button"
                                            className={`flex items-center gap-1 hover:text-white text-xs ${likedTracks?.has(item.id) ? 'text-green-500' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }}
                                        >
                                            <ThumbsUp size={16} fill={likedTracks?.has(item.id) ? "currentColor" : "none"} />
                                            <span>{likedTracks?.has(item.id) ? 1 : 0}</span>
                                        </button>
                                        <button type="button" className="hover:text-white" onClick={handleAddNote}>
                                            <MessageSquare size={18} />
                                        </button>
                                        <button type="button" className="hover:text-white" onClick={() => handleShare(item)}>
                                            <Share2 size={18} />
                                        </button>
                                        <button type="button" className="hover:text-white" onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}>
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                    {openMenuId === item.id && (
                                        <div className="absolute right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-hidden text-sm z-10">
                                            <button
                                                type="button"
                                                onClick={() => handleCopyInfo(item)}
                                                className="block w-full text-left px-4 py-2 text-slate-200 hover:bg-white/5"
                                            >
                                                Copy track info
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addToPlaylist(item)}
                                                className="block w-full text-left px-4 py-2 text-slate-200 hover:bg-white/5"
                                            >
                                                Add to playlist
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )})
                ) : (
                    <p className="text-slate-400">No items available for this tab yet.</p>
                )}
            </div>

            {activeTab === 'Playlists' && (
                <div className="mt-10 border-t border-white/10 pt-6">
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-xl font-bold">Playlist Details</h2>
                        {selectedPlaylist && (
                            <button
                                type="button"
                                onClick={() => {
                                    const name = prompt("Rename playlist", selectedPlaylist.name);
                                    if (name) updatePlaylistName(selectedPlaylist.id, name);
                                }}
                                className="text-xs text-slate-300 border border-white/10 px-3 py-1 rounded-full hover:text-white hover:border-white/30 transition-colors"
                            >
                                Rename
                            </button>
                        )}
                    </div>
                    {selectedPlaylist ? (
                        <div className="space-y-2">
                            {selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0 ? (
                                selectedPlaylist.tracks.map((track, index) => (
                                    <div key={track.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10">
                                        <button
                                            type="button"
                                            className="flex-1 text-left text-sm text-slate-200 truncate"
                                            onClick={() => playTrack(track, selectedPlaylist.tracks)}
                                        >
                                            {track.title}
                                        </button>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                                            <button
                                                type="button"
                                                onClick={() => movePlaylistTrack(selectedPlaylist.id, index, index - 1)}
                                                className="px-2 py-1 rounded-full border border-white/10 hover:text-white hover:border-white/30"
                                            >
                                                Up
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => movePlaylistTrack(selectedPlaylist.id, index, index + 1)}
                                                className="px-2 py-1 rounded-full border border-white/10 hover:text-white hover:border-white/30"
                                            >
                                                Down
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeTrackFromPlaylist(selectedPlaylist.id, track.id)}
                                                className="px-2 py-1 rounded-full border border-white/10 hover:text-white hover:border-white/30"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400">No tracks in this playlist yet.</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-slate-400">Select a playlist to manage its tracks.</p>
                    )}
                </div>
            )}

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Create playlist</h2>
                        <input
                            type="text"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            placeholder="Playlist name"
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:outline-none focus:border-white/30"
                        />
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => { setIsCreateModalOpen(false); setNewPlaylistName(""); }}
                                className="px-4 py-2 rounded-full border border-white/10 text-slate-200 hover:text-white hover:border-white/30"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreatePlaylist}
                                className="px-4 py-2 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-500"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
