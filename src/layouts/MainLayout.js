import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import Header from '../components/Header';
import Player from '../components/Player';
import LyricsOverlay from '../components/LyricsOverlay';
import { Loader } from 'lucide-react';

export default function MainLayout() {
    const {
        currentTrack,
        isPlaying,
        setIsPlaying,
        isLoading,
        audioRef
    } = useMusic();

    const [progress, setProgress] = useState(0);
    const [showLyrics, setShowLyrics] = useState(false);
    const [activeLyricIndex, setActiveLyricIndex] = useState(0);
    const activeLyricRef = useRef(null);

    // Audio Logic
    useEffect(() => {
        if (audioRef.current && currentTrack) {
            audioRef.current.src = currentTrack.audioSrc;
            if (isPlaying) audioRef.current.play().catch(() => { });
            setActiveLyricIndex(0);
        }
    }, [currentTrack]);

    useEffect(() => {
        if (audioRef.current) {
            isPlaying ? audioRef.current.play().catch(() => { }) : audioRef.current.pause();
        }
    }, [isPlaying]);

    const onTimeUpdate = () => {
        if (audioRef.current) {
            const currentTime = audioRef.current.currentTime;
            const duration = audioRef.current.duration;
            const percent = (currentTime / duration) * 100;
            setProgress(percent || 0);

            if (currentTrack?.lyrics && duration > 0) {
                const totalLines = currentTrack.lyrics.length;
                const calculatedIndex = Math.floor((currentTime / duration) * totalLines);
                setActiveLyricIndex(Math.min(calculatedIndex, totalLines - 1));
            }
        }
    };

    // Lyrics Auto Scroll
    useEffect(() => {
        if (showLyrics && activeLyricRef.current) {
            activeLyricRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeLyricIndex, showLyrics]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader className="animate-spin text-green-500 mb-4" size={40} />
                    <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Studio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#121212] text-white font-sans flex flex-col overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="flex-1 flex overflow-hidden z-10">
                {/* Left Sidebar */}
                <Sidebar />

                {/* Center Content Area */}
                <div className="flex-1 flex flex-col relative min-w-0 bg-transparent">
                    {/* Header is now part of the center content flow, sticky at top */}
                    <Header />

                    <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
                        <Outlet />
                    </div>
                </div>

                {/* Right Sidebar */}
                <RightSidebar />
            </div>

            {/* Player */}
            <div className="z-20">
                <Player
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                    progress={progress}
                    showLyrics={showLyrics}
                    onToggleLyrics={() => setShowLyrics(!showLyrics)}
                    audioRef={audioRef}
                    onTimeUpdate={onTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                />
            </div>

            {showLyrics && (
                <LyricsOverlay
                    track={currentTrack}
                    activeLyricIndex={activeLyricIndex}
                    onClose={() => setShowLyrics(false)}
                    activeLyricRef={activeLyricRef}
                />
            )}
        </div>
    );
}
