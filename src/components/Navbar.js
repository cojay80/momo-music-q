import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Music, LogOut, Lock, Menu, X } from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenLogin }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { name: 'HOME', path: '/' },
        { name: 'TRACKS', path: '/tracks' },
        { name: 'ABOUT', path: '/about' }
    ];

    const isActive = (path) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* 로고 */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity blur-[2px]"></div>
                            <div className="relative w-full h-full bg-slate-900/50 rounded-xl flex items-center justify-center border border-white/10">
                                <Music size={20} className="text-white" />
                            </div>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white group-hover:text-purple-200 transition-colors">
                            모모뮤직<span className="text-purple-500">Q</span>
                        </span>
                    </div>

                    {/* PC 메뉴 */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`px-5 py-2 text-sm font-bold rounded-full transition-all ${isActive(item.path)
                                        ? 'text-white bg-white/10'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}

                        <div className="w-px h-6 bg-white/10 mx-4"></div>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-purple-400 px-2 py-1 bg-purple-500/10 rounded border border-purple-500/20 tracking-wider">ADMIN</span>
                                <button onClick={onLogout} className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="로그아웃"><LogOut size={18} /></button>
                            </div>
                        ) : (
                            <button onClick={onOpenLogin} className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Lock size={18} /></button>
                        )}
                    </div>

                    {/* 모바일 메뉴 버튼 */}
                    <div className="md:hidden flex items-center gap-2">
                        {user ? (
                            <button onClick={onLogout} className="p-2 text-purple-400 bg-purple-500/10 rounded-full"><LogOut size={20} /></button>
                        ) : (
                            <button onClick={onOpenLogin} className="p-2 text-slate-400 hover:text-white"><Lock size={20} /></button>
                        )}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-white">
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* 모바일 드롭다운 메뉴 */}
            {isMenuOpen && (
                <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/10 animate-fade-in">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block w-full text-left px-4 py-3 text-lg font-medium rounded-xl transition-colors ${isActive(item.path)
                                        ? 'text-white bg-white/10'
                                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
