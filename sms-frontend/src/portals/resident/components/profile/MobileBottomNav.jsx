import React from 'react';
import { Home, Bell, MessageCircle, User } from 'lucide-react';

export function MobileBottomNav() {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#07080f]/95 backdrop-blur-xl border-t border-slate-800/80 flex items-center justify-around z-[100] px-2 pb-safe">
            <button className="flex flex-col items-center justify-center w-16 h-full gap-1 text-slate-500 hover:text-white font-bold">
                <Home size={22} strokeWidth={2} />
                <span className="text-[10px] font-bold">Home</span>
            </button>
            <button className="flex flex-col items-center justify-center w-16 h-full gap-1 text-slate-500 hover:text-white font-bold relative">
                <Bell size={22} strokeWidth={2} />
                <span className="text-[10px] font-bold">Notices</span>
                <span className="absolute top-1 right-3 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">3</span>
            </button>
            <button className="flex flex-col items-center justify-center w-16 h-full gap-1 text-slate-500 hover:text-white font-bold">
                <MessageCircle size={22} strokeWidth={2} />
                <span className="text-[10px] font-bold">Complaints</span>
            </button>
            <button className="flex flex-col items-center justify-center w-16 h-full gap-1 text-purple-400">
                <User size={22} strokeWidth={2.5} />
                <span className="text-[10px] font-bold">Profile</span>
            </button>
        </div>
    );
}
