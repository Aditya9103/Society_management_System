import React from 'react';
import { Calendar, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

export function QuickInfoWidget() {
    return (
        <div className="bg-[#151822] border border-slate-800 rounded-3xl p-6">
            <h3 className="text-white font-bold mb-6">Quick Info</h3>
            
            <div className="space-y-6">
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-200 mb-0.5">Advance Booking</p>
                        <p className="text-xs text-slate-500 leading-relaxed">Book up to 7 days in advance</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-200 mb-0.5">Cancellation Policy</p>
                        <p className="text-xs text-slate-500 leading-relaxed">Free cancellation up to 2 hours before slot</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-200 mb-0.5">Timing</p>
                        <p className="text-xs text-slate-500 leading-relaxed">Follow the timing strictly</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-200 mb-0.5">Rules</p>
                        <p className="text-xs text-slate-500 leading-relaxed">Keep the amenities clean and safe</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
