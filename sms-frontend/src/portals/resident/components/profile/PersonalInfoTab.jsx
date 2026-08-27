import React from 'react';
import { User, Edit2, Save, RefreshCw, Mail, Phone, Building2, Shield, Calendar, ShieldCheck, CheckCircle2, QrCode, ChevronDown, Copy, Home, ChevronRight } from 'lucide-react';
import { DigitalIdCard } from './DigitalIdCard';

export function PersonalInfoTab({ user, profile, editing, setEditing, startEdit, form, setForm, handleSave, isSaving, society, unit, onEmail, isEmailing }) {
    
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        // Optional: show a small toast here if desired
    };

    return (
        <div className="space-y-4">
            
            <div className="grid gap-4 lg:grid-cols-12">
                {/* Left Column: Personal Information */}
                <div className="lg:col-span-7 rounded-[20px] bg-[#0a0b12] p-6 shadow-sm border border-slate-800/80 hover:border-slate-700 transition-colors max-w-full box-border overflow-hidden">
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-[10px] bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                <User className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-[17px] font-bold text-white tracking-wide">Personal Information</h2>
                        </div>
                        
                        {!editing ? (
                            <button onClick={startEdit} className="flex items-center gap-1.5 rounded-[10px] bg-indigo-600/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600/20 transition-colors">
                                <Edit2 className="h-3.5 w-3.5" /> Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setEditing(false)} className="rounded-[10px] border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700">Cancel</button>
                                <button onClick={handleSave} disabled={isSaving}
                                    className="flex items-center gap-1.5 rounded-[10px] bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 shadow-lg shadow-indigo-600/20">
                                    {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {editing ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[['firstName', 'First Name'], ['lastName', 'Last Name']].map(([key, label]) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">{label}</label>
                                    <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Phone</label>
                                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {/* Full Name */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-800/60 gap-1 sm:gap-0">
                                <div className="flex items-center gap-2 sm:gap-3 text-slate-300 w-full sm:w-1/3"><User className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> <span className="text-xs sm:text-[13px]">Full Name</span></div>
                                <div className="flex items-center justify-between w-full sm:flex-1 sm:pl-4">
                                    <div className="text-white text-sm sm:text-[13px] font-medium">{user?.firstName} {user?.lastName}</div>
                                </div>
                            </div>
                            {/* Email Address */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-800/60 gap-1 sm:gap-0">
                                <div className="flex items-center gap-2 sm:gap-3 text-slate-300 w-full sm:w-1/3"><Mail className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> <span className="text-xs sm:text-[13px]">Email Address</span></div>
                                <div className="flex items-center justify-between w-full sm:flex-1 sm:pl-4">
                                    <div className="text-white text-sm sm:text-[13px] font-medium truncate pr-2">{user?.email}</div>
                                    <button onClick={() => handleCopy(user?.email)} className="text-slate-500 hover:text-white transition-colors shrink-0 p-1 -mr-1"><Copy size={16} /></button>
                                </div>
                            </div>
                            {/* Mobile Number */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-800/60 gap-1 sm:gap-0">
                                <div className="flex items-center gap-2 sm:gap-3 text-slate-300 w-full sm:w-1/3"><Phone className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> <span className="text-xs sm:text-[13px]">Mobile Number</span></div>
                                <div className="flex items-center justify-between w-full sm:flex-1 sm:pl-4">
                                    <div className="text-white text-sm sm:text-[13px] font-medium">{user?.phone}</div>
                                    <button onClick={() => handleCopy(user?.phone)} className="text-slate-500 hover:text-white transition-colors p-1 -mr-1"><Copy size={16} /></button>
                                </div>
                            </div>
                            {/* Resident ID */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-800/60 gap-1 sm:gap-0">
                                <div className="flex items-center gap-2 sm:gap-3 text-slate-300 w-full sm:w-1/3"><Building2 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> <span className="text-xs sm:text-[13px]">Resident ID</span></div>
                                <div className="flex items-center justify-between w-full sm:flex-1 sm:pl-4">
                                    <div className="text-white text-sm sm:text-[13px] font-medium">{profile?.residentCode ?? 'RES-702110-301'}</div>
                                    <button onClick={() => handleCopy(profile?.residentCode ?? 'RES-702110-301')} className="text-slate-500 hover:text-white transition-colors p-1 -mr-1"><Copy size={16} /></button>
                                </div>
                            </div>
                            {/* Role */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-800/60 gap-1 sm:gap-0">
                                <div className="flex items-center gap-2 sm:gap-3 text-slate-300 w-full sm:w-1/3"><Shield className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> <span className="text-xs sm:text-[13px]">Role</span></div>
                                <div className="flex items-center justify-between w-full sm:flex-1 sm:pl-4">
                                    <div className="text-white text-sm sm:text-[13px] font-medium capitalize">{profile?.ownershipType?.toLowerCase() ?? 'Tenant'}</div>
                                </div>
                            </div>
                            {/* Move-in Date */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-1 sm:gap-0">
                                <div className="flex items-center gap-2 sm:gap-3 text-slate-300 w-full sm:w-1/3"><Calendar className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> <span className="text-xs sm:text-[13px]">Move-in Date</span></div>
                                <div className="flex items-center justify-between w-full sm:flex-1 sm:pl-4">
                                    <div className="text-white text-sm sm:text-[13px] font-medium">02 Jul 2024</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Unit & Society */}
                <div className="hidden lg:flex lg:col-span-5 flex-col gap-4">
                    {/* My Unit */}
                    <div className="rounded-[20px] bg-[#0a0b12] p-5 shadow-sm border border-slate-800/80 relative overflow-hidden group flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-[10px] bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                    <Home className="h-4 w-4 text-white" />
                                </div>
                                <p className="text-[15px] font-bold text-white tracking-wide">My Unit</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex items-end justify-between relative z-10 mt-6">
                            <div>
                                <p className="text-[40px] font-bold text-white leading-none tracking-tighter mb-2">{unit?.unitNumber ?? '1008'}</p>
                                <p className="text-[11px] font-bold text-slate-300 tracking-widest uppercase">{unit?.bhkType ?? '2BHK'} · {unit?.unitType ?? 'RESIDENTIAL'}</p>
                            </div>
                            <div className="h-16 w-24 rounded-xl overflow-hidden border border-white/10 opacity-80 mix-blend-luminosity">
                                <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Unit" />
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                    </div>

                    {/* Society */}
                    <div className="rounded-[20px] bg-[#0a0b12] p-5 shadow-sm border border-slate-800/80 relative overflow-hidden group flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-[10px] bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                    <Building2 className="h-4 w-4 text-white" />
                                </div>
                                <p className="text-[15px] font-bold text-white tracking-wide">Society</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex items-end justify-between relative z-10 mt-6">
                            <div>
                                <p className="text-[17px] font-bold text-white leading-tight mb-1">{society?.name ?? 'Green Valley Apartment'}</p>
                                <p className="text-[13px] text-slate-300">{society?.city ?? 'Delhi'}, {society?.state ?? 'Delhi'}</p>
                            </div>
                            <div className="h-16 w-24 rounded-xl overflow-hidden border border-white/10 opacity-80 mix-blend-luminosity">
                                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Society" />
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                    </div>
                </div>
            </div>
            
            {/* Digital ID Card (Shared Mobile/Desktop) */}
            <div className="w-full">
                <DigitalIdCard
                    user={user}
                    profile={profile}
                    society={society}
                    unit={unit}
                    onEmail={onEmail}
                    isEmailing={isEmailing}
                    onUploadSuccess={() => window.location.reload()}
                />
            </div>
        </div>
    );
}
