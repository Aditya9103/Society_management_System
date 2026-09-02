import React from 'react';
import { Clock } from 'lucide-react';

export function AmenityCard({ amenity, onBook }) {
    // Determine image based on type or use placeholder
    let imageSrc = 'https://images.unsplash.com/photo-1542314831-c6a4d14eff43?auto=format&fit=crop&q=80&w=400';
    if (amenity.facilityType === 'SWIMMING_POOL') imageSrc = 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=400';
    if (amenity.facilityType === 'GYM') imageSrc = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400';
    if (amenity.facilityType === 'BADMINTON_COURT') imageSrc = 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=400';
    if (amenity.facilityType === 'TENNIS_COURT') imageSrc = 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=400';
    if (amenity.facilityType === 'MEDITATION_ROOM' || amenity.name?.toLowerCase().includes('yoga')) imageSrc = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400';
    if (amenity.facilityType === 'CLUBHOUSE') imageSrc = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=400';
    if (amenity.facilityType === 'PARTY_HALL') imageSrc = 'https://images.unsplash.com/photo-1519167758481-83f50403d6d5?auto=format&fit=crop&q=80&w=400';
    if (amenity.facilityType === 'LIBRARY') imageSrc = 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=400';
    
    // Icon
    const getIcon = (type) => {
        switch(type) {
            case 'CLUBHOUSE': return '🏛️';
            case 'SWIMMING_POOL': return '🏊';
            case 'GYM': return '💪';
            case 'BADMINTON_COURT': return '🏸';
            default: return '🏢';
        }
    };
    
    const iconBg = (type) => {
        switch(type) {
            case 'CLUBHOUSE': return 'bg-purple-500/20 text-purple-400';
            case 'SWIMMING_POOL': return 'bg-blue-500/20 text-blue-400';
            case 'GYM': return 'bg-orange-500/20 text-orange-400';
            case 'BADMINTON_COURT': return 'bg-emerald-500/20 text-emerald-400';
            default: return 'bg-slate-500/20 text-white font-bold';
        }
    }

    return (
        <div className="bg-[#131525] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative">
            <div className="h-40 w-full overflow-hidden relative">
                <img src={imageSrc} alt={amenity.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131525] via-transparent to-transparent"></div>
                <div className={`absolute left-4 bottom-4 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${iconBg(amenity.facilityType)} backdrop-blur-md border border-white/10 shadow-lg`}>
                    {getIcon(amenity.facilityType)}
                </div>
            </div>
            
            <div className="p-5 flex flex-col flex-1">
                <h4 className="text-white font-bold text-base mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">{amenity.name}</h4>
                
                <div className="flex items-center gap-2 text-white font-bold text-xs mb-4 font-bold">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>06:00 AM - 11:00 PM</span>
                </div>
                
                <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                    <div className="text-white font-black text-base lg:text-lg break-words whitespace-normal">
                        ₹{amenity.pricing?.amount || 0} <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">/ hr</span>
                    </div>
                    <button 
                        onClick={() => onBook(amenity)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 lg:px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] whitespace-nowrap shrink-0"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
}
