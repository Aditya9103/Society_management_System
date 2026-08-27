import React, { useState } from 'react';
import { Search, Sun, MessageSquare, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../../components/ui/Button';
import { CommandPaletteModal } from '../../../resident/components/dashboard/CommandPaletteModal';

export default function AdminHeader({ user, societyName }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    
    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', weekday: 'long'
    });

    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-8 w-full mb-6">
            <div className="flex-1">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    Welcome back, {user?.firstName} <span className="text-2xl">👋</span>
                </h1>
                <p className="text-gray-300 mt-1 text-sm">
                    Here's what's happening in <span className="text-gray-200 font-medium">{societyName}</span> today.
                </p>
            </div>

            <div className="flex flex-col items-end gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 justify-end">
                    
                    {/* Search / Command Palette Trigger */}
                    <div 
                        className="relative group min-w-[200px] cursor-pointer"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400" />
                        <input 
                            type="text" 
                            placeholder="Search anything..." 
                            readOnly
                            className="w-full bg-[#13151a] border border-white/5 rounded-xl pl-10 pr-12 py-2 text-sm text-white placeholder-gray-500 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/50 hover:bg-white/5 transition-colors"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-gray-500 font-mono pointer-events-none">
                            ⌘ K
                        </div>
                    </div>

                    {/* Theme Toggle (Visual only for now if dark is forced) */}
                    <button className="shrink-0 p-2 rounded-xl border border-white/5 bg-[#13151a] text-gray-400 hover:text-white hover:border-white/10 transition-colors">
                        <Sun className="w-4 h-4" />
                    </button>
                    
                    {/* Messages / Complaints */}
                    <Link to="/admin/complaints" className="shrink-0 p-2 rounded-xl border border-white/5 bg-[#13151a] text-gray-400 hover:text-white hover:border-white/10 transition-colors relative">
                        <MessageSquare className="w-4 h-4" />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    </Link>
                    
                    {/* User Profile */}
                    <Link to="/admin/profile" className="shrink-0 h-9 w-9 rounded-xl border border-white/10 overflow-hidden ml-2 ring-2 ring-[#0b0c10] shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform">
                        {user?.profilePhotoUrl ? (
                            <img src={user.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                        )}
                    </Link>
                </div>

                {/* Date Display */}
                <div className="hidden xl:flex px-4 py-1.5 rounded-xl bg-[#13151a] border border-white/5 text-xs text-gray-300 items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                    <Bell className="w-3.5 h-3.5 text-gray-400" />
                    {currentDate}
                </div>
            </div>

            {/* Command Palette Modal */}
            <CommandPaletteModal 
                isOpen={isSearchOpen} 
                onClose={() => setIsSearchOpen(false)} 
            />
        </div>
    );
}
