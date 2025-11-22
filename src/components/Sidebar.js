import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, Music, Bell, Youtube, Instagram, Facebook, Twitter, BarChart2, Zap, Grid, Mic2 } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const menuItems = [
        { icon: Home, label: '홈', path: '/' },
        { icon: Library, label: '라이브러리', path: '/library' },
        { icon: BarChart2, label: '인기 차트', path: '/charts' },
        { icon: Zap, label: '최신 음악', path: '/new-releases' },
        { icon: Grid, label: '장르 및 무드', path: '/genres' },
        { icon: Mic2, label: '아티스트', path: '/artists' },
        { icon: Bell, label: '알림', path: '/notifications' },
    ];

    return (
        <div className="w-64 bg-black h-full flex flex-col hidden md:flex text-slate-300 border-r border-white/5">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-white px-6 py-6">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <Music size={20} className="text-black" />
                </div>
                <span className="font-bold text-xl tracking-tight">MomoMusicQ</span>
            </Link>

            {/* Main Menu */}
            <div className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.path}
                        className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors font-medium ${isActive(item.path) ? 'text-white bg-white/10' : 'hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="p-4 space-y-4 bg-black">
                {/* Social Links */}
                <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/5">
                    <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors" title="YouTube">
                        <Youtube size={20} />
                    </a>
                    <a href="https://suno.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors" title="Suno">
                        <Music size={20} />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors" title="Instagram">
                        <Instagram size={20} />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors" title="Facebook">
                        <Facebook size={20} />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors" title="X (Twitter)">
                        <Twitter size={20} />
                    </a>
                </div>

                {/* Footer Links */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 px-2 text-[10px] text-slate-500">
                    <Link to="/terms" className="hover:text-slate-300">이용약관</Link>
                    <Link to="/privacy" className="hover:text-slate-300">개인정보처리방침</Link>
                    <Link to="/contact" className="hover:text-slate-300">문의하기</Link>
                </div>
            </div>
        </div>
    );
}
