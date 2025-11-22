import React from 'react';
import { X } from 'lucide-react';

export default function LyricsOverlay({
    track,
    activeLyricIndex,
    onClose,
    activeLyricRef
}) {
    if (!track) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[60] flex flex-col animate-fade-in">
            <div className="p-6 flex justify-end">
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 flex flex-col items-center px-6 pb-32 overflow-y-auto text-center scrollbar-hide">
                <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl mb-8 flex-shrink-0 border border-white/10">
                    <img src={track.cover} className="w-full h-full object-cover" alt="cover" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{track.title}</h2>
                <p className="text-lg text-purple-400 mb-10">{track.artist}</p>

                <div className="space-y-6 max-w-lg w-full">
                    {track.lyrics ? track.lyrics.map((l, i) => (
                        <p
                            key={i}
                            ref={i === activeLyricIndex ? activeLyricRef : null}
                            className={`text-xl sm:text-2xl font-bold transition-all duration-500 cursor-default leading-relaxed ${i === activeLyricIndex
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 scale-110'
                                : 'text-slate-600 hover:text-slate-500'
                                }`}
                        >
                            {l}
                        </p>
                    )) : <p className="text-slate-500">등록된 가사가 없습니다.</p>}
                </div>
            </div>
        </div>
    );
}
