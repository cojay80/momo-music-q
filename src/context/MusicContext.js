import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from '../services/firebase';

const MusicContext = createContext();

const SAMPLE_TRACKS = [
    {
        id: '1',
        title: "Demo Track",
        artist: "Momo",
        cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400",
        audioSrc: "",
        lyrics: ["This is a demo lyric line."]
    }
];

const shuffleList = (list, currentTrack) => {
    const remaining = list.filter((track) => track.id !== currentTrack?.id);
    for (let i = remaining.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    if (currentTrack) {
        return [currentTrack, ...remaining];
    }
    return remaining;
};

export function MusicProvider({ children }) {
    const [tracks, setTracks] = useState([]);
    const [queue, setQueue] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off');
    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem("momo_volume");
        return saved !== null ? Number(saved) : 0.7;
    });
    const [selectedGenre, setSelectedGenre] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [playlists, setPlaylists] = useState([]);
    const [likedTracks, setLikedTracks] = useState(new Set());

    const audioRef = useRef(null);

    useEffect(() => {
        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                setUser(currentUser);
            });
            return () => unsubscribe();
        }
    }, []);

    const fetchTracks = useCallback(async () => {
        if (!db) {
            setTracks(SAMPLE_TRACKS);
            setCurrentTrack(SAMPLE_TRACKS[0]);
            setIsLoading(false);
            return;
        }

        try {
            const q = query(collection(db, "tracks"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const loadedTracks = [];
            querySnapshot.forEach((docSnapshot) => {
                loadedTracks.push({ id: docSnapshot.id, ...docSnapshot.data() });
            });

            if (loadedTracks.length > 0) {
                setTracks(loadedTracks);
                if (!currentTrack) setCurrentTrack(loadedTracks[0]);
            } else {
                setTracks([]);
            }
        } catch (error) {
            console.error("Fetch tracks error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentTrack]);

    useEffect(() => {
        fetchTracks();
    }, [fetchTracks]);

    useEffect(() => {
        localStorage.setItem("momo_volume", String(volume));
    }, [volume]);

    useEffect(() => {
        if (!tracks.length) return;
        if (isShuffle) {
            setQueue(shuffleList(tracks, currentTrack));
        } else {
            setQueue(tracks);
        }
    }, [tracks, isShuffle, currentTrack]);

    const playTrack = (track, list = tracks) => {
        if (Array.isArray(list) && list.length) {
            if (isShuffle) {
                setQueue(shuffleList(list, track));
            } else {
                setQueue(list);
            }
        }
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const toggleShuffle = () => {
        setIsShuffle((prev) => !prev);
    };

    const cycleRepeatMode = () => {
        setRepeatMode((prev) => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            return 'off';
        });
    };

    const playNext = useCallback(() => {
        const list = queue.length ? queue : tracks;
        if (!list.length) return;

        const currentIndex = currentTrack ? list.findIndex((track) => track.id === currentTrack.id) : -1;
        let nextIndex = currentIndex + 1;

        if (nextIndex >= list.length) {
            if (repeatMode === 'all') {
                nextIndex = 0;
            } else {
                setIsPlaying(false);
                return;
            }
        }

        setCurrentTrack(list[nextIndex]);
        setIsPlaying(true);
    }, [currentTrack, queue, tracks, repeatMode]);

    const playPrevious = useCallback(() => {
        const list = queue.length ? queue : tracks;
        if (!list.length) return;

        const currentIndex = currentTrack ? list.findIndex((track) => track.id === currentTrack.id) : -1;
        let prevIndex = currentIndex - 1;

        if (prevIndex < 0) {
            if (repeatMode === 'all') {
                prevIndex = list.length - 1;
            } else {
                prevIndex = 0;
            }
        }

        setCurrentTrack(list[prevIndex]);
        setIsPlaying(true);
    }, [currentTrack, queue, tracks, repeatMode]);

    const handleLogout = async () => {
        if (auth) await signOut(auth);
    };

    const handleDeleteTrack = async (trackId) => {
        if (!user || !db) return;
        if (window.confirm("Delete this track? (This cannot be undone)")) {
            try {
                await deleteDoc(doc(db, "tracks", trackId));
                fetchTracks();
            } catch (error) {
                console.error("Delete failed:", error);
            }
        }
    };

    const filteredTracks = tracks.filter((track) => {
        const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.artist.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGenre = selectedGenre ? track.genre === selectedGenre : true;
        return matchesSearch && matchesGenre;
    });

    const fetchPlaylists = useCallback(async () => {
        if (!db) return;
        try {
            const q = query(collection(db, "playlists"));
            const snapshot = await getDocs(q);
            const list = [];
            snapshot.forEach((docSnapshot) => list.push({ id: docSnapshot.id, ...docSnapshot.data() }));
            setPlaylists(list);
        } catch (error) {
            console.error("Fetch playlists error:", error);
        }
    }, []);

    useEffect(() => {
        fetchPlaylists();
    }, [fetchPlaylists]);

    const createPlaylist = async (name) => {
        if (!db) return;
        try {
            await addDoc(collection(db, "playlists"), {
                name,
                tracks: [],
                createdAt: new Date(),
                userId: user ? user.uid : 'anonymous'
            });
            fetchPlaylists();
        } catch (error) {
            console.error("Create playlist error:", error);
            alert("Failed to create playlist");
        }
    };

    const addToPlaylist = async (track, playlistId) => {
        if (!db) return;
        if (!playlistId && playlists.length > 0) playlistId = playlists[0].id;
        if (!playlistId) {
            alert("Please create a playlist first!");
            return;
        }

        try {
            const playlist = playlists.find((item) => item.id === playlistId);
            if (playlist) {
                if (playlist.tracks.find((item) => item.id === track.id)) {
                    alert("Track already in this playlist");
                    return;
                }
                const newTracks = [...playlist.tracks, track];
                await updateDoc(doc(db, "playlists", playlistId), { tracks: newTracks });
                fetchPlaylists();
                alert(`Added to ${playlist.name}`);
            }
        } catch (error) {
            console.error("Add to playlist error:", error);
            alert("Failed to add to playlist");
        }
    };

    const toggleLike = (trackId) => {
        const newLiked = new Set(likedTracks);
        if (newLiked.has(trackId)) {
            newLiked.delete(trackId);
        } else {
            newLiked.add(trackId);
        }
        setLikedTracks(newLiked);
    };

    const moveQueueItem = (trackId, direction) => {
        const list = queue.length ? [...queue] : [...tracks];
        if (list.length < 2) return;
        const index = list.findIndex((track) => track.id === trackId);
        if (index === -1) return;
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= list.length) return;
        [list[index], list[targetIndex]] = [list[targetIndex], list[index]];
        setQueue(list);
    };

    const removeFromQueue = (trackId) => {
        const list = queue.length ? queue : tracks;
        const index = list.findIndex((track) => track.id === trackId);
        if (index === -1) return;
        const nextQueue = list.filter((track) => track.id !== trackId);
        setQueue(nextQueue);
        if (currentTrack?.id === trackId) {
            if (nextQueue.length) {
                const nextIndex = Math.min(index, nextQueue.length - 1);
                setCurrentTrack(nextQueue[nextIndex]);
                setIsPlaying(true);
            } else {
                setCurrentTrack(null);
                setIsPlaying(false);
            }
        }
    };

    const updatePlaylistName = async (playlistId, name) => {
        if (!db) return;
        try {
            await updateDoc(doc(db, "playlists", playlistId), { name });
            fetchPlaylists();
        } catch (error) {
            console.error("Rename playlist error:", error);
            alert("Failed to rename playlist");
        }
    };

    const removeTrackFromPlaylist = async (playlistId, trackId) => {
        if (!db) return;
        const playlist = playlists.find((item) => item.id === playlistId);
        if (!playlist) return;
        try {
            const nextTracks = (playlist.tracks || []).filter((track) => track.id !== trackId);
            await updateDoc(doc(db, "playlists", playlistId), { tracks: nextTracks });
            fetchPlaylists();
        } catch (error) {
            console.error("Remove track error:", error);
            alert("Failed to remove track");
        }
    };

    const movePlaylistTrack = async (playlistId, fromIndex, toIndex) => {
        if (!db) return;
        const playlist = playlists.find((item) => item.id === playlistId);
        if (!playlist || !Array.isArray(playlist.tracks)) return;
        if (toIndex < 0 || toIndex >= playlist.tracks.length) return;
        const nextTracks = [...playlist.tracks];
        const [moved] = nextTracks.splice(fromIndex, 1);
        nextTracks.splice(toIndex, 0, moved);
        try {
            await updateDoc(doc(db, "playlists", playlistId), { tracks: nextTracks });
            fetchPlaylists();
        } catch (error) {
            console.error("Reorder playlist error:", error);
            alert("Failed to reorder playlist");
        }
    };

    const value = {
        tracks,
        filteredTracks,
        queue,
        setQueue,
        currentTrack,
        isPlaying,
        setIsPlaying,
        playTrack,
        togglePlay,
        isShuffle,
        toggleShuffle,
        repeatMode,
        cycleRepeatMode,
        playNext,
        playPrevious,
        volume,
        setVolume,
        selectedGenre,
        setSelectedGenre,
        searchQuery,
        setSearchQuery,
        user,
        isLoading,
        handleLogout,
        handleDeleteTrack,
        fetchTracks,
        audioRef,
        playlists,
        createPlaylist,
        addToPlaylist,
        likedTracks,
        toggleLike,
        moveQueueItem,
        removeFromQueue,
        updatePlaylistName,
        removeTrackFromPlaylist,
        movePlaylistTrack
    };

    return (
        <MusicContext.Provider value={value}>
            {children}
        </MusicContext.Provider>
    );
}

export function useMusic() {
    return useContext(MusicContext);
}
