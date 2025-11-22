import React from 'react';
import { Bell, Heart, Music, User } from 'lucide-react';

export default function Notifications() {
    const notifications = [
        { id: 1, type: 'like', user: 'User123', content: 'liked your track "Summer Vibes"', time: '2 hours ago', icon: Heart, color: 'text-pink-500' },
        { id: 2, type: 'follow', user: 'MusicLover', content: 'started following you', time: '5 hours ago', icon: User, color: 'text-blue-500' },
        { id: 3, type: 'system', user: 'MomoMusicQ', content: 'New features available! Check out the new Charts page.', time: '1 day ago', icon: Bell, color: 'text-yellow-500' },
        { id: 4, type: 'release', user: 'ArtistXYZ', content: 'released a new track "Nightfall"', time: '2 days ago', icon: Music, color: 'text-green-500' },
    ];

    return (
        <div className="p-8 text-white">
            <h1 className="text-4xl font-bold mb-8">알림</h1>
            <div className="space-y-4 max-w-3xl">
                {notifications.map(notif => (
                    <div key={notif.id} className="flex items-center gap-4 p-4 bg-[#181818] rounded-lg hover:bg-[#282828] transition-colors cursor-pointer">
                        <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${notif.color}`}>
                            <notif.icon size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm">
                                <span className="font-bold">{notif.user}</span> {notif.content}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                        </div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
