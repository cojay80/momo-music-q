import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Library, Music, Bell, Youtube, Instagram, Facebook, Twitter, BarChart2, Zap, Grid, Mic2 } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const menuItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Library, label: 'Library', path: '/library' },
        { icon: BarChart2, label: 'Charts', path: '/charts' },
        { icon: Zap, label: 'New Releases', path: '/new-releases' },
        { icon: Grid, label: 'Genres', path: '/genres' },
        { icon: Mic2, label: 'Artists', path: '/artists' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
    ];

    return (
        <div className="w-64 h-full flex flex-col hidden md:flex text-slate-400 border-r border-white/5 bg-black/40 backdrop-blur-xl relative z-20">
            <Link to="/" className="flex items-center gap-3 text-white px-6 py-8">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                    <Music size={22} className="text-white" />
                </div>
                <span className="font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Momo</span>
            </Link>

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

            <div className="p-6 space-y-6">
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

                <Link to="/about" className="hover:text-purple-400 transition-colors">About</Link>
                <div className="flex flex-wrap gap-x-4 gap-y-2 px-2 text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
                    <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
                    <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
                    <Link to="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
                </div>
            </div>
        </div>
    );
}

