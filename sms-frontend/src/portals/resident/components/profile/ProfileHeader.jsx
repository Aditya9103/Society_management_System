import React from 'react';
import { Camera, RefreshCw, ShieldCheck, Mail, Phone, Calendar, User, CheckCircle2 } from 'lucide-react';

export function ProfileHeader({ user, profile, isUpdatingAvatar, handleAvatarChange }) {
    return (
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-5 lg:px-8 lg:py-6 shadow-xl border border-indigo-500/30 mb-6 max-w-full box-border">
            {/* Background pattern */}
            <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 opacity-20 mix-blend-overlay pointer-events-none bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800')] bg-cover bg-center lg:bg-left"></div>
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-indigo-900 via-indigo-900/80 to-transparent"></div>

            <div className="relative z-10 w-full">
                
                {/* ─── MOBILE ONLY LAYOUT ─── */}
                <div className="flex flex-col items-center text-center lg:hidden w-full">
                    <div className="relative mb-4 group cursor-pointer">
                        <div className="h-[90px] w-[90px] rounded-full bg-[#dfd099] flex items-center justify-center text-indigo-900 text-4xl font-bold border-[3px] border-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.4)] overflow-hidden">
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
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border-2 border-indigo-900 shadow-sm whitespace-nowrap">
                            Active
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-white text-[11px] font-bold mb-2 bg-indigo-500/30 px-3 py-1 rounded-full border border-indigo-400/50">
                        <CheckCircle2 size={14} className="text-white" /> Verified Resident
                    </div>
                    
                    <h1 className="text-2xl font-extrabold text-white mb-0.5 tracking-tight">{user?.firstName} {user?.lastName}</h1>
                    <p className="text-sm text-white font-bold font-bold mb-3">{profile?.residentCode ?? 'RES-702110-301'}</p>
                    
                    <span className="rounded-full px-4 py-1 text-[12px] font-bold tracking-widest bg-[#ffe082] text-amber-900 shadow-sm uppercase">
                        {profile?.ownershipType ?? 'TENANT'}
                    </span>

                    {/* Stats List (Vertical Stack) */}
                    <div className="w-full mt-6 flex flex-col gap-2">
                        <div className="flex items-center justify-between bg-white/10 border border-white/10 rounded-[14px] p-3.5 backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-white font-bold text-[13px] font-semibold">
                                <Calendar size={16} className="text-indigo-200" /> Member Since
                            </div>
                            <div className="text-white text-[15px] font-bold">Jul 2024</div>
                        </div>
                        <div className="flex items-center justify-between bg-white/10 border border-white/10 rounded-[14px] p-3.5 backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-white font-bold text-[13px] font-semibold">
                                <User size={16} className="text-indigo-200" /> Account Type
                            </div>
                            <div className="text-white text-[15px] font-bold">Resident</div>
                        </div>
                    </div>
                </div>

                {/* ─── DESKTOP ONLY LAYOUT ─── */}
                <div className="hidden lg:flex flex-row justify-between items-end gap-5 w-full">
                    {/* Top Section: Avatar & Info */}
                    <div className="flex items-center gap-5 w-auto flex-1">
                        <div className="relative shrink-0 group cursor-pointer">
                            <div className="h-[90px] w-[90px] rounded-full bg-[#dfd099] flex items-center justify-center text-indigo-900 text-3xl font-bold border-2 border-indigo-300 shadow-xl overflow-hidden">
                                {user?.profilePhotoUrl ? (
                                    <img src={user.profilePhotoUrl} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <>{user?.firstName?.[0]}{user?.lastName?.[0]}</>
                                )}
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="h-6 w-6 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUpdatingAvatar} />
                                </label>
                            </div>
                            <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 border-[3px] border-indigo-900 items-center justify-center shadow-lg flex pointer-events-none">
                                <Camera size={14} className="text-white" />
                            </div>
                        </div>

                        <div className="flex flex-col items-start min-w-0">
                            <div className="flex items-center gap-1.5 text-white text-[12px] font-bold mb-1.5 bg-indigo-500/30 px-3 py-1 rounded-full border border-indigo-400/50">
                                <CheckCircle2 size={14} className="text-white shrink-0" /> <span>Verified Resident</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-0.5 tracking-tight break-words whitespace-normal w-full">{user?.firstName} {user?.lastName}</h1>
                            <p className="text-[15px] text-white font-bold font-bold mb-2 break-words whitespace-normal w-full">{profile?.residentCode ?? 'RES-702110-301'}</p>
                            
                            <span className="rounded-full px-3 py-0.5 text-[12px] font-bold tracking-wider bg-[#ffe082] text-amber-900 shadow-sm shrink-0 uppercase">
                                {profile?.ownershipType ?? 'TENANT'}
                            </span>
                        </div>
                    </div>

                    {/* Right/Bottom Section: Desktop Stats Blocks */}
                    <div className="flex items-center gap-4 justify-end w-auto shrink-0">
                        <div className="shrink-0 flex flex-col items-start min-w-[140px] bg-white/10 border border-white/10 rounded-[16px] px-4 py-3 backdrop-blur-md">
                            <span className="text-[12px] text-white font-bold font-semibold mb-1.5">Member Since</span>
                            <div className="flex items-center gap-2 font-bold text-white text-[16px]">
                                <Calendar size={16} className="text-indigo-200" />
                                Jul 2024
                            </div>
                        </div>
                        
                        <div className="shrink-0 flex flex-col items-start min-w-[140px] bg-white/10 border border-white/10 rounded-[16px] px-4 py-3 backdrop-blur-md">
                            <span className="text-[12px] text-white font-bold font-semibold mb-1.5">Status</span>
                            <div className="flex items-center gap-2 font-bold text-white text-[16px]">
                                <div className="h-4 w-4 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                                Active
                            </div>
                        </div>
                        
                        <div className="shrink-0 flex flex-col items-start min-w-[140px] bg-white/10 border border-white/10 rounded-[16px] px-4 py-3 backdrop-blur-md">
                            <span className="text-[12px] text-white font-bold font-semibold mb-1.5">Account Type</span>
                            <div className="flex items-center gap-2 font-bold text-white text-[16px]">
                                <User size={16} className="text-indigo-200 shrink-0" />
                                Resident
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
