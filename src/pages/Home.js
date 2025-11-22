import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star, User } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function Home() {
  const { tracks, playTrack } = useMusic();
  const navigate = useNavigate();


  return (
    <div className="pb-10 px-6 pt-4">
      {/* Hero / Featured Section */}
      {/* Hero / Welcome Section */}
      <div className="relative bg-gradient-to-b from-purple-900/80 to-[#121212] rounded-t-3xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-end text-center md:text-left mb-10 transition-all hover:bg-purple-900/90 group">
        <div className="flex-1">
          <p className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Welcome to</p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">MomoMusicQ</h1>
          <p className="text-white/70 text-lg font-bold mb-8 max-w-2xl mx-auto md:mx-0">
            나만의 AI 음악 스튜디오에 오신 것을 환영합니다. <br />
            다양한 장르의 음악을 감상하고, 나만의 플레이리스트를 만들어보세요.
          </p>
        </div>
      </div>

      {/* Shelf: Popular */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">인기 상승 곡</h2>
          <span className="text-sm font-bold text-slate-400 hover:underline cursor-pointer" onClick={() => navigate('/tracks')}>모두 표시</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {tracks.slice(0, 5).map(track => (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-colors group cursor-pointer"
            >
              <div className="relative w-full aspect-square mb-4 rounded-md overflow-hidden shadow-lg">
                <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                <div className="absolute right-2 bottom-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <Play size={24} fill="currentColor" className="ml-1" />
                </div>
              </div>
              <h3 className="font-bold text-white truncate mb-1">{track.title}</h3>
              <p className="text-sm text-slate-400 truncate">{track.artist}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shelf: New Releases */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">최신 발매</h2>
          <span className="text-sm font-bold text-slate-400 hover:underline cursor-pointer" onClick={() => navigate('/tracks')}>모두 표시</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {tracks.slice(0, 5).reverse().map(track => (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-colors group cursor-pointer"
            >
              <div className="relative w-full aspect-square mb-4 rounded-md overflow-hidden shadow-lg">
                <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                <div className="absolute right-2 bottom-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <Play size={24} fill="currentColor" className="ml-1" />
                </div>
              </div>
              <h3 className="font-bold text-white truncate mb-1">{track.title}</h3>
              <p className="text-sm text-slate-400 truncate">{track.artist}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
