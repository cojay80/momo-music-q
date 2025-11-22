import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, User, LogOut, Home, Menu, X, Library, BarChart2, Zap, Upload } from 'lucide-react';
import { useState } from 'react';
import { useMusic } from '../context/MusicContext';

export default function Header() {
    const navigate = useNavigate();
    const { searchQuery, setSearchQuery, user, handleLogout } = useMusic();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="h-16 bg-[#121212]/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-4">
            {/* Navigation Controls */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-300 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className="hidden md:flex gap-2">
                    <button onClick={() => navigate('/')} className="p-1 bg-black/50 rounded-full text-slate-300 hover:text-white" title="홈으로"><Home size={24} /></button>
                    <button onClick={() => navigate(-1)} className="p-1 bg-black/50 rounded-full text-slate-300 hover:text-white"><ChevronLeft size={24} /></button>
                    <button onClick={() => navigate(1)} className="p-1 bg-black/50 rounded-full text-slate-300 hover:text-white"><ChevronRight size={24} /></button>
                </div>

                {/* Search Bar */}
                <div className="relative group ml-0 md:ml-4 flex-1 md:flex-none">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-white">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-[#242424] text-white rounded-full py-2 md:py-3 pl-10 pr-4 w-full md:w-80 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white transition-all hover:bg-[#2a2a2a]"
                    />
                </div>
            </div>

            {/* Global Navigation (Green Box Area) */}
            <div className="hidden lg:flex items-center gap-6 mr-auto ml-8">
                <a href="#" className="text-slate-300 font-bold hover:text-white hover:scale-105 transition-transform text-sm">프리미엄</a>
                <a href="#" className="text-slate-300 font-bold hover:text-white hover:scale-105 transition-transform text-sm">지원</a>
                <a href="#" className="text-slate-300 font-bold hover:text-white hover:scale-105 transition-transform text-sm">다운로드</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 md:gap-4">
                {user ? (
                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="hidden md:block px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-full text-white text-sm font-bold transition-colors shadow-lg shadow-purple-900/20"
                        >
                            Upload
                        </button>
                        <span className="text-sm font-bold text-white hidden sm:block">Admin</span>
                        <button
                            onClick={handleLogout}
                            className="p-2 bg-black/50 rounded-full text-white hover:scale-105 transition-transform"
                            title="로그아웃"
                        >
                            <LogOut size={20} />
                        </button>
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-black">
                            <User size={16} />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/signup')}
                            className="text-slate-300 font-bold hover:text-white text-sm hidden sm:block"
                        >
                            가입하기
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-white text-black px-4 md:px-8 py-2 md:py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                        >
                            로그인
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-[#121212] border-b border-white/10 p-4 flex flex-col gap-4 md:hidden animate-fade-in shadow-2xl">
                    <button onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/5">
                        <Home size={20} /> 홈
                    </button>
                    <button onClick={() => { navigate('/library'); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/5">
                        <Library size={20} /> 라이브러리
                    </button>
                    <button onClick={() => { navigate('/charts'); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/5">
                        <BarChart2 size={20} /> 인기 차트
                    </button>
                    <button onClick={() => { navigate('/new-releases'); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/5">
                        <Zap size={20} /> 최신 음악
                    </button>
                    {user && (
                        <button onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-white/5">
                            <Upload size={20} /> 음악 업로드
                        </button>
                    )}
                </div>
            )}
        </header>
    );
}
