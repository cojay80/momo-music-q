import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from '../services/firebase';

const MusicContext = createContext();

const SAMPLE_TRACKS = [{ id: '1', title: "샘플", artist: "모모", cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400", audioSrc: "", lyrics: ["가사"] }];

export function MusicProvider({ children }) {
    const [tracks, setTracks] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const audioRef = useRef(null);

    // Auth Listener
    useEffect(() => {
        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                setUser(currentUser);
            });
            return () => unsubscribe();
        }
    }, []);

    // Fetch Tracks
    const fetchTracks = async () => {
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
            querySnapshot.forEach((doc) => {
                loadedTracks.push({ id: doc.id, ...doc.data() });
            });

            if (loadedTracks.length > 0) {
                setTracks(loadedTracks);
                if (!currentTrack) setCurrentTrack(loadedTracks[0]);
            } else {
                setTracks([]);
            }
        } catch (error) {
            console.error("데이터 에러:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTracks();
    }, []);

    // Audio Control Logic
    const playTrack = (track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleLogout = async () => {
        if (auth) await signOut(auth);
    };

    const handleDeleteTrack = async (trackId) => {
        if (!user || !db) return;
        if (window.confirm("정말 삭제하시겠습니까? (복구 불가)")) {
            try {
                await deleteDoc(doc(db, "tracks", trackId));
                fetchTracks();
            } catch (error) {
                console.error("삭제 실패:", error);
            }
        }
    };

    // Filtered Tracks based on Search
    const filteredTracks = tracks.filter(track =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [playlists, setPlaylists] = useState([
        { id: 'p1', name: 'My Playlist', tracks: [] },
        { id: 'p2', name: 'Favorites', tracks: [] }
    ]);
    const [likedTracks, setLikedTracks] = useState(new Set());

    const addToPlaylist = (track) => {
        // Simple mock implementation: Add to first playlist
        const updatedPlaylists = [...playlists];
        if (!updatedPlaylists[0].tracks.find(t => t.id === track.id)) {
            updatedPlaylists[0].tracks.push(track);
            setPlaylists(updatedPlaylists);
            alert(`Added to ${updatedPlaylists[0].name}`);
        } else {
            alert('Already in playlist');
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

    const value = {
        tracks,
        filteredTracks,
        currentTrack,
        isPlaying,
        setIsPlaying,
        playTrack,
        togglePlay,
        searchQuery,
        setSearchQuery,
        user,
        isLoading,
        handleLogout,
        handleDeleteTrack,
        fetchTracks,
        audioRef,
        playlists,
        addToPlaylist,
        likedTracks,
        toggleLike
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
