import React from 'react';
import { Home, Building2, ChevronRight } from 'lucide-react';

export function UnitInfoTab({ unit, society }) {
    if (!unit) return null;
    
    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[20px] bg-[#0a0b12] p-5 shadow-sm border border-slate-800/80 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-2"><Home className="h-5 w-5 text-blue-500" /><p className="font-bold text-white">My Unit</p></div>
                        <ChevronRight size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-[32px] font-bold text-white leading-none tracking-tight mb-2">{unit.unitNumber}</p>
                            <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{unit.bhkType} · {unit.unitType}</p>
                        </div>
                        <div className="h-14 w-20 rounded-xl overflow-hidden border border-white/10 opacity-80 mix-blend-luminosity">
                            <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Unit" />
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                </div>
                <div className="rounded-[20px] bg-[#0a0b12] p-5 shadow-sm border border-slate-800/80 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-500" /><p className="font-bold text-white">Society</p></div>
                        <ChevronRight size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-lg font-bold text-white leading-tight mb-1">{society?.name ?? 'Green Valley Apartment'}</p>
                            <p className="text-xs font-semibold text-slate-400">{society?.city ?? 'Delhi'}, {society?.state ?? 'Delhi'}</p>
                        </div>
                        <div className="h-14 w-20 rounded-xl overflow-hidden border border-white/10 opacity-80 mix-blend-luminosity">
                            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Society" />
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
}
