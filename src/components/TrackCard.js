import React from 'react';
import { Play, ChevronRight, Trash2 } from 'lucide-react';

export default function TrackCard({
    track,
    index,
    isActive,
    isPlaying,
    onClick,
    onDelete,
    isAdmin
}) {
    return (
        <div
            onClick={onClick}
            className={`group flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${isActive ? 'bg-white/10 border-purple-500/50 shadow-lg' : 'bg-slate-900/40 border-transparent hover:bg-white/5 hover:border-white/10'}`}
        >
            <div className="w-8 text-center text-slate-500 font-bold text-sm mr-4 group-hover:text-purple-400">
                {isActive && isPlaying ? <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse mx-auto"></div> : index + 1}
            </div>

            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <img src={track.cover} className="w-full h-full object-cover" alt="cover" />
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <Play size={20} fill="currentColor" className="text-white" />
                </div>
            </div>

            <div className="ml-4 flex-1 min-w-0">
                <h3 className={`font-bold text-lg truncate ${isActive ? 'text-purple-400' : 'text-white group-hover:text-purple-200'}`}>{track.title}</h3>
                <p className="text-sm text-slate-400 truncate">{track.artist}</p>
            </div>

            <div className="hidden sm:block text-sm text-slate-500 font-medium px-4">{track.genre}</div>

            {isAdmin && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(track.id); }}
                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={18} />
                </button>
            )}

            <div className="ml-2 text-slate-600 group-hover:text-white"><ChevronRight size={20} /></div>
        </div>
    );
}
