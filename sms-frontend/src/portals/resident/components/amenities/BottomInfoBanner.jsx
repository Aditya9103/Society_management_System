import React from 'react';
import { Calendar, ShieldCheck, CheckCircle2, Star } from 'lucide-react';

export function BottomInfoBanner() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 bg-[#151822] border border-slate-800 rounded-2xl p-4 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 mb-0.5 truncate">Easy Booking</p>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug">Book your favorite amenities in just a few clicks</p>
                </div>
            </div>

            <div className="flex items-start sm:items-center gap-3 sm:gap-4 bg-[#151822] border border-slate-800 rounded-2xl p-4 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 mb-0.5 truncate">Secure Payment</p>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug">Safe and secure online payments</p>
                </div>
            </div>

            <div className="flex items-start sm:items-center gap-3 sm:gap-4 bg-[#151822] border border-slate-800 rounded-2xl p-4 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 mb-0.5 truncate">Instant Confirmation</p>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug">Get immediate confirmation for your bookings</p>
                </div>
            </div>

            <div className="flex items-start sm:items-center gap-3 sm:gap-4 bg-[#151822] border border-slate-800 rounded-2xl p-4 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 mb-0.5 truncate">Best Experience</p>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug">Enjoy premium facilities with great experience</p>
                </div>
            </div>
        </div>
    );
}
