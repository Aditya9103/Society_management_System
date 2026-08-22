import React from 'react';
import { Camera, RefreshCw, ShieldCheck, Mail, Phone, Calendar, User, CheckCircle2 } from 'lucide-react';

export function ProfileHeader({ user, profile, isUpdatingAvatar, handleAvatarChange }) {
    return (
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 p-4 lg:px-6 lg:py-5 shadow-lg border border-indigo-500/20 mb-6 mx-4 lg:mx-0">
            {/* Background building silhouette (placeholder using css patterns or blend) */}
            <div className="absolute inset-y-0 right-0 w-1/2 opacity-30 mix-blend-overlay pointer-events-none bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800')] bg-cover bg-left">
                {/* A gradient mask to fade the image into the background color smoothly */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-transparent"></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5">
                
                {/* Top Section: Avatar & Info */}
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="h-[76px] w-[76px] lg:h-[90px] lg:w-[90px] rounded-full bg-[#dfd099] flex items-center justify-center text-indigo-900 text-3xl font-bold border-2 border-indigo-300 shadow-xl overflow-hidden cursor-pointer group">
                            {user?.profilePhotoUrl ? (
                                <img src={user.profilePhotoUrl} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <>{user?.firstName?.[0]}{user?.lastName?.[0]}</>
                            )}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="h-6 w-6 text-white" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUpdatingAvatar} />
                            </label>
                            {isUpdatingAvatar && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                    <RefreshCw className="h-5 w-5 animate-spin text-white" />
                                </div>
                            )}
                        </div>
                        
                        {/* Desktop Camera Icon Overlay */}
                        <div className="hidden lg:flex absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 border-[3px] border-indigo-600 items-center justify-center shadow-lg">
                            <Camera size={14} className="text-white" />
                        </div>
                        
                        {/* Mobile Status Dot Overlay */}
                        <div className="lg:hidden absolute bottom-1 right-1 h-6 w-6 rounded-full bg-[#1a1a2e] flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-1.5 text-white text-[11px] font-medium mb-1.5 bg-indigo-500/30 px-3 py-1 rounded-full border border-indigo-400/50">
                            <CheckCircle2 size={14} className="text-white" /> Verified Resident
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-0.5 tracking-tight">{user?.firstName} {user?.lastName}</h1>
                        <p className="text-[13px] lg:text-sm text-indigo-200 font-medium mb-2">{profile?.residentCode ?? 'RES-702110-301'}</p>
                        
                        <span className="rounded-full px-3 py-0.5 text-[11px] font-bold tracking-wider bg-[#ffe082] text-amber-900 shadow-sm">
                            {profile?.ownershipType ?? 'TENANT'}
                        </span>
                    </div>
                </div>

                {/* Right/Bottom Section: 3 Stats Blocks */}
                <div className="flex items-center gap-2 lg:gap-4 justify-between lg:justify-end w-full lg:w-auto mt-2 lg:mt-0">
                    {/* Block 1 */}
                    <div className="flex-1 lg:flex-none flex flex-col items-start lg:min-w-[150px] bg-[#0f1123]/50 border border-white/5 rounded-[16px] p-2.5 lg:px-4 lg:py-3 backdrop-blur-md">
                        <span className="text-[10px] lg:text-[11px] text-indigo-200 font-medium mb-1.5">Member Since</span>
                        <div className="flex items-center gap-2 font-bold text-white text-[13px] lg:text-[15px]">
                            <Calendar size={16} className="text-indigo-300" />
                            Jul 2024
                        </div>
                    </div>
                    
                    {/* Block 2 */}
                    <div className="flex-1 lg:flex-none flex flex-col items-start lg:min-w-[150px] bg-[#0f1123]/50 border border-white/5 rounded-[16px] p-2.5 lg:px-4 lg:py-3 backdrop-blur-md">
                        <span className="text-[10px] lg:text-[11px] text-indigo-200 font-medium mb-1.5">Status</span>
                        <div className="flex items-center gap-2 font-bold text-white text-[13px] lg:text-[15px]">
                            <div className="h-4 w-4 rounded-full bg-emerald-400 shrink-0"></div>
                            Active
                        </div>
                    </div>
                    
                    {/* Block 3 */}
                    <div className="flex-1 lg:flex-none flex flex-col items-start lg:min-w-[150px] bg-[#0f1123]/50 border border-white/5 rounded-[16px] p-2.5 lg:px-4 lg:py-3 backdrop-blur-md">
                        <span className="text-[10px] lg:text-[11px] text-indigo-200 font-medium mb-1.5">Account Type</span>
                        <div className="flex items-center gap-2 font-bold text-white text-[13px] lg:text-[15px] whitespace-nowrap">
                            <User size={16} className="text-indigo-300 shrink-0" />
                            Resident
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
}
