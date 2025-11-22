import React from 'react';
import { useMusic } from '../context/MusicContext';
import { User } from 'lucide-react';

export default function About() {
    const { tracks } = useMusic();

    return (
        <div className="relative py-24 border-t border-white/5 overflow-hidden min-h-[80vh] flex items-center">
            <div className="absolute inset-0 bg-slate-900/50"></div>
            <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                <div className="w-28 h-28 mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-purple-600/20 p-1">
                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-4 border-transparent">
                        <User size={40} className="text-white" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold mb-6 text-white">Created by Momo</h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
                    "상상하는 모든 것이 음악이 되는 곳"<br />
                    AI 기술을 활용해 일상에 특별한 BGM을 선물합니다.
                </p>
                <div className="flex justify-center gap-4 sm:gap-8">
                    <div className="px-8 py-6 rounded-2xl bg-slate-800/50 border border-white/5 backdrop-blur-sm w-40">
                        <div className="text-3xl font-bold text-white mb-1">{tracks.length}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tracks</div>
                    </div>
                    <div className="px-8 py-6 rounded-2xl bg-slate-800/50 border border-white/5 backdrop-blur-sm w-40">
                        <div className="text-3xl font-bold text-white mb-1">∞</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Listeners</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
