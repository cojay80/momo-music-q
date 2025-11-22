import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, User, LogOut, Home } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function Header() {
    const navigate = useNavigate();
    const { searchQuery, setSearchQuery, user, handleLogout } = useMusic();

    return (
        <header className="h-16 bg-[#121212]/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8 py-4">
            {/* Navigation Controls */}
            <div className="flex items-center gap-4">
                <div className="flex gap-2">
                    <button onClick={() => navigate('/')} className="p-1 bg-black/50 rounded-full text-slate-300 hover:text-white" title="홈으로"><Home size={24} /></button>
                    <button onClick={() => navigate(-1)} className="p-1 bg-black/50 rounded-full text-slate-300 hover:text-white"><ChevronLeft size={24} /></button>
                    <button onClick={() => navigate(1)} className="p-1 bg-black/50 rounded-full text-slate-300 hover:text-white"><ChevronRight size={24} /></button>
                </div>

                {/* Search Bar */}
                <div className="relative group ml-4">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-white">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="어떤 콘텐츠를 감상하고 싶으세요?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-[#242424] text-white rounded-full py-3 pl-10 pr-6 w-80 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white transition-all hover:bg-[#2a2a2a]"
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
            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-full text-white text-sm font-bold transition-colors shadow-lg shadow-purple-900/20"
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
                    <>
                        <button
                            onClick={() => navigate('/signup')}
                            className="text-slate-300 font-bold hover:text-white hover:scale-105 transition-transform"
                        >
                            가입하기
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                        >
                            로그인하기
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
