import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import Header from '../components/Header';
import Player from '../components/Player';
import LyricsOverlay from '../components/LyricsOverlay';
import { Loader } from 'lucide-react';
import { normalizeLyrics, resolveSyncedLyrics } from '../services/srtParser';

export default function MainLayout() {
    const {
        currentTrack,
        isPlaying,
        setIsPlaying,
        isShuffle,
        repeatMode,
        playNext,
        playPrevious,
        toggleShuffle,
        cycleRepeatMode,
        volume,
        setVolume,
        isLoading,
        audioRef
    } = useMusic();

    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showLyrics, setShowLyrics] = useState(false);
    const [activeLyricIndex, setActiveLyricIndex] = useState(0);
    const [syncedLyrics, setSyncedLyrics] = useState([]);
    const activeLyricRef = useRef(null);

    // Audio Logic
    useEffect(() => {
        if (audioRef.current && currentTrack) {
            audioRef.current.src = currentTrack.audioSrc;
            if (isPlaying) audioRef.current.play().catch(() => { });
            setActiveLyricIndex(0);
            setProgress(0);
            setCurrentTime(0);
        }
    }, [audioRef, currentTrack, isPlaying]);

    useEffect(() => {
        let cancelled = false;
        if (!currentTrack) {
            setSyncedLyrics([]);
            return () => {
                cancelled = true;
            };
        }

        resolveSyncedLyrics(currentTrack)
            .then((lyrics) => {
                if (!cancelled) setSyncedLyrics(lyrics);
            })
            .catch((error) => {
                console.error("SRT lyrics load failed:", error);
                if (!cancelled) setSyncedLyrics(normalizeLyrics(currentTrack.lyrics));
            });

        return () => {
            cancelled = true;
        };
    }, [currentTrack]);

    useEffect(() => {
        if (audioRef.current) {
            isPlaying ? audioRef.current.play().catch(() => { }) : audioRef.current.pause();
        }
    }, [audioRef, isPlaying]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [audioRef, volume]);

    const onTimeUpdate = () => {
        if (audioRef.current) {
            const currentTime = audioRef.current.currentTime;
            const duration = audioRef.current.duration;
            const percent = (currentTime / duration) * 100;
            setProgress(percent || 0);
            setCurrentTime(currentTime || 0);
            setDuration(duration || 0);

            if (syncedLyrics && syncedLyrics.length > 0) {
                const firstLine = syncedLyrics[0];
                const hasTimestamps = typeof firstLine === 'object' && firstLine !== null && (typeof firstLine.time === 'number' || typeof firstLine.start === 'number');
                if (hasTimestamps) {
                    const currentIndex = syncedLyrics.findIndex((line, index) => {
                        const start = typeof line.start === 'number' ? line.start : line.time;
                        const nextLine = syncedLyrics[index + 1];
                        const nextTime = typeof line.end === 'number' && Number.isFinite(line.end)
                            ? line.end
                            : nextLine && (typeof nextLine.start === 'number' || typeof nextLine.time === 'number')
                            ? (typeof nextLine.start === 'number' ? nextLine.start : nextLine.time)
                            : Number.POSITIVE_INFINITY;
                        return currentTime >= start && currentTime < nextTime;
                    });
                    setActiveLyricIndex((prevIndex) => currentIndex === -1 ? prevIndex : currentIndex);
                } else if (duration > 0) {
                    const totalLines = syncedLyrics.length;
                    const calculatedIndex = Math.floor((currentTime / duration) * totalLines);
                    setActiveLyricIndex(Math.min(calculatedIndex, totalLines - 1));
                }
            }
        }
    };

    const onLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
        }
    };

    const onEnded = () => {
        if (repeatMode === 'one' && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
            return;
        }
        playNext();
        setProgress(0);
        setCurrentTime(0);
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
            <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#0a0a0a]">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/40 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-900/40 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-900/40 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            <div className="flex-1 flex overflow-hidden z-10">
                {/* Left Sidebar */}
                <Sidebar />

                {/* Center Content Area */}
                <div className="flex-1 flex flex-col relative min-w-0 bg-transparent">
                    {/* Header is now part of the center content flow, sticky at top */}
                    <Header />

                    <div className="flex-1 overflow-y-auto pb-32 scrollbar-hide">
                        <Outlet />
                    </div>
                </div>

                {/* Right Sidebar */}
                <RightSidebar
                    lyrics={syncedLyrics}
                    activeLyricIndex={activeLyricIndex}
                />
            </div>

            {/* Player */}
            <div className="z-20">
                <Player
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                    onNext={playNext}
                    onPrevious={playPrevious}
                    isShuffle={isShuffle}
                    onToggleShuffle={toggleShuffle}
                    repeatMode={repeatMode}
                    onToggleRepeat={cycleRepeatMode}
                    progress={progress}
                    currentTime={currentTime}
                    duration={duration}
                    volume={volume}
                    onVolumeChange={setVolume}
                    showLyrics={showLyrics}
                    onToggleLyrics={() => setShowLyrics(!showLyrics)}
                    audioRef={audioRef}
                    onTimeUpdate={onTimeUpdate}
                    onLoadedMetadata={onLoadedMetadata}
                    onEnded={onEnded}
                />
            </div>

            {showLyrics && (
                <LyricsOverlay
                    track={currentTrack}
                    lyrics={syncedLyrics}
                    activeLyricIndex={activeLyricIndex}
                    onClose={() => setShowLyrics(false)}
                    activeLyricRef={activeLyricRef}
                />
            )}
        </div>
    );
}
