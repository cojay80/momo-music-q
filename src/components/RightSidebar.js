import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { MoreHorizontal, Share2, MessageSquare, ThumbsUp, ChevronUp, ChevronDown, X } from 'lucide-react';
import { addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function RightSidebar({ lyrics = [], activeLyricIndex = 0 }) {
    const { currentTrack, addToPlaylist, toggleLike, likedTracks, queue, playTrack, moveQueueItem, removeFromQueue, user } = useMusic();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const lyricsBoxRef = useRef(null);
    const activeLineRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        async function loadComments() {
            if (!db || !currentTrack?.id) {
                setComments([]);
                return;
            }
            try {
                const q = query(collection(db, "tracks", currentTrack.id, "comments"), orderBy("createdAt", "asc"));
                const snapshot = await getDocs(q);
                if (!cancelled) {
                    setComments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
                }
            } catch (error) {
                console.error("Load comments failed:", error);
            }
        }
        loadComments();
        return () => {
            cancelled = true;
        };
    }, [currentTrack?.id]);

    useEffect(() => {
        const box = lyricsBoxRef.current;
        const line = activeLineRef.current;
        if (!box || !line) return;

        const targetTop = line.offsetTop - box.offsetTop - (box.clientHeight / 2) + (line.clientHeight / 2);
        box.scrollTo({
            top: Math.max(0, targetTop),
            behavior: 'smooth'
        });
    }, [activeLyricIndex, currentTrack?.id]);

    if (!currentTrack) {
        return (
            <div className="w-80 bg-black border-l border-white/5 hidden xl:flex flex-col p-6 items-center justify-center text-slate-500">
                <p>No track selected.</p>
            </div>
        );
    }

    const isLiked = likedTracks.has(currentTrack.id);
    const shareText = `${currentTrack.title} - ${currentTrack.artist}`;

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ title: currentTrack.title, text: shareText });
                return;
            }
            await navigator.clipboard.writeText(shareText);
            alert("Track info copied to clipboard.");
        } catch (error) {
            console.error("Share failed:", error);
            alert("Share failed. Please try again.");
        }
    };

    const handleCopyInfo = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            alert("Track info copied to clipboard.");
        } catch (error) {
            console.error("Copy failed:", error);
            alert("Copy failed. Please try again.");
        }
    };

    const handleAddComment = async () => {
        const text = window.prompt("Add a comment");
        if (!text) return;
        if (!db || !currentTrack?.id) {
            setComments((prev) => [...prev, { id: Date.now(), text }]);
            return;
        }
        try {
            const payload = {
                text,
                author: user?.email || "Guest",
                userId: user?.uid || "guest",
                createdAt: new Date()
            };
            const docRef = await addDoc(collection(db, "tracks", currentTrack.id, "comments"), payload);
            setComments((prev) => [...prev, { id: docRef.id, ...payload }]);
        } catch (error) {
            console.error("Add comment failed:", error);
            alert("Failed to add comment.");
        }
    };

    return (
        <div className="w-80 h-full hidden xl:flex flex-col border-l border-white/5 bg-black/20 backdrop-blur-xl overflow-y-auto scrollbar-hide">
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
                        Add to playlist
                    </button>
                    <button onClick={handleShare} className="p-2 text-slate-400 hover:text-white border border-white/10 rounded-full" title="Share">
                        <Share2 size={18} />
                    </button>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-400 hover:text-white border border-white/10 rounded-full" title="More">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
                {isMenuOpen && (
                    <div className="mb-6 border border-white/10 rounded-xl overflow-hidden text-sm">
                        <button
                            onClick={handleCopyInfo}
                            className="w-full text-left px-4 py-3 text-slate-200 hover:bg-white/5"
                        >
                            Copy track info
                        </button>
                        <button
                            onClick={() => addToPlaylist(currentTrack)}
                            className="w-full text-left px-4 py-3 text-slate-200 hover:bg-white/5"
                        >
                            Add to playlist
                        </button>
                        <button
                            onClick={() => navigate('/tracks')}
                            className="w-full text-left px-4 py-3 text-slate-200 hover:bg-white/5"
                        >
                            Open in Tracks
                        </button>
                    </div>
                )}

                <div className="mb-6 border-t border-white/5 pt-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Lyrics</h3>
                    </div>

                    <div ref={lyricsBoxRef} className="max-h-56 overflow-y-auto pr-2 scrollbar-hide space-y-3">
                        {lyrics.length > 0 ? (
                            lyrics.map((line, index) => {
                                const lineText = typeof line === 'string' ? line : line?.text || '';
                                const isActive = index === activeLyricIndex;
                                return (
                                    <p
                                        key={index}
                                        ref={isActive ? activeLineRef : null}
                                        className={`text-sm leading-relaxed transition-colors duration-300 ${
                                            isActive
                                                ? 'text-white font-bold'
                                                : 'text-slate-500'
                                        }`}
                                    >
                                        <span>{lineText}</span>
                                    </p>
                                );
                            })
                        ) : (
                            <p className="text-slate-500 text-sm italic">No lyrics available.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-slate-400 text-sm">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex items-center gap-1 cursor-pointer ${isLiked ? 'text-green-500' : 'hover:text-white'}`}
                        onClick={() => toggleLike(currentTrack.id)}
                    >
                        <ThumbsUp size={16} fill={isLiked ? "currentColor" : "none"} />
                        <span>{isLiked ? 1 : 0}</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-white cursor-pointer" onClick={handleAddComment}>
                        <MessageSquare size={16} />
                        <span>{comments.length}</span>
                    </div>
                </div>
                <span>3:45</span>
            </div>

            <div className="px-6 pb-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider py-3">
                    <span>Comments</span>
                    <button onClick={handleAddComment} className="text-slate-300 hover:text-white text-xs">Add</button>
                </div>
                {comments.length ? (
                    <div className="space-y-2">
                        {comments.map((comment) => (
                                <div key={comment.id} className="text-sm text-slate-300 bg-white/5 rounded-lg px-3 py-2">
                                    <p className="mb-1 text-[11px] text-slate-500">{comment.author || "Guest"}</p>
                                    <p>{comment.text}</p>
                                </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">No comments yet.</p>
                )}
            </div>

            <div className="p-6 border-t border-white/5">
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-300 hover:bg-white/10 cursor-pointer">K-Pop</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-300 hover:bg-white/10 cursor-pointer">Ballad</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-300 hover:bg-white/10 cursor-pointer">Healing</span>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-6 border-t border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider py-3">
                    <span>Queue</span>
                    <span>{queue.length}</span>
                </div>
                {queue.length ? (
                    <div className="space-y-2">
                        {queue.map((track, index) => (
                            <div key={track.id} className={`flex items-center gap-2 p-2 rounded-lg ${currentTrack?.id === track.id ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}>
                                <button
                                    onClick={() => playTrack(track, queue)}
                                    className="flex-1 text-left text-sm text-slate-200 truncate"
                                    title={`${track.title} - ${track.artist}`}
                                >
                                    {track.title}
                                </button>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <button onClick={() => moveQueueItem(track.id, -1)} className="p-1 hover:text-white" title="Move up">
                                        <ChevronUp size={14} />
                                    </button>
                                    <button onClick={() => moveQueueItem(track.id, 1)} className="p-1 hover:text-white" title="Move down">
                                        <ChevronDown size={14} />
                                    </button>
                                    <button onClick={() => removeFromQueue(track.id)} className="p-1 hover:text-white" title="Remove">
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">Queue is empty.</p>
                )}
            </div>
        </div>
    );
}
