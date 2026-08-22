import React from 'react';
import { Download, Mail, ShieldCheck, RefreshCw, FileText, ChevronRight, AlertCircle } from 'lucide-react';

export function DigitalIdCard({ user, profile, onEmail, isEmailing }) {
    if (!profile?.idCardUrl) return null;

    // Cloudinary allows converting PDFs to images on the fly by changing the extension to .jpg or .png
    // We can use this to show a high-quality image preview instead of an iframe which is buggy on mobile
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.includes('cloudinary.com') && url.endsWith('.pdf')) {
            return url.replace('.pdf', '.png');
        }
        return url;
    };

    const previewUrl = getImageUrl(profile.idCardUrl);

    return (
        <div className="rounded-[20px] bg-[#0a0b12] p-6 shadow-sm border border-slate-800/80 mt-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-[10px] bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
                    <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-[17px] font-bold text-white tracking-wide">Your Digital Identity</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* The ID Card Visual Preview */}
                <div className="relative shrink-0 w-full max-w-[320px] rounded-[16px] bg-[#1a1147] shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30 overflow-hidden flex flex-col mx-auto md:mx-0 group">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 z-0">
                        <RefreshCw className="h-6 w-6 animate-spin opacity-50 text-purple-500" />
                    </div>
                    
                    <img 
                        src={previewUrl} 
                        alt="Digital ID Card Preview" 
                        className="relative w-full h-auto object-contain z-10"
                    />
                </div>

                {/* Actions and Info */}
                <div className="flex-1 space-y-4">
                    <p className="text-[13px] text-slate-400 leading-relaxed max-w-lg mb-2">
                        This is your official society digital ID card. You can use it to verify your identity at the main gate, access clubhouse facilities, and authenticate yourself within the society premises.
                    </p>

                    <div className="flex flex-col gap-3">
                        <a
                            href={profile.idCardUrl}
                            download={`ID_Card_${user?.firstName}_${user?.lastName}.pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center justify-between p-4 rounded-[16px] border border-slate-800/80 bg-[#12131c] hover:border-blue-500/30 hover:bg-blue-500/10 transition-all duration-300 w-full text-left shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors border border-blue-500/20">
                                    <Download className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white">Download PDF</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Save to your device for offline use</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                        </a>

                        <button
                            onClick={onEmail}
                            disabled={isEmailing}
                            className="group flex items-center justify-between p-4 rounded-[16px] border border-slate-800/80 bg-[#12131c] hover:border-purple-500/30 hover:bg-purple-500/10 transition-all duration-300 w-full text-left shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors border border-purple-500/20">
                                    {isEmailing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white">Email ID Card</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Send a copy to {user?.email}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-purple-400 transition-colors" />
                        </button>
                    </div>

                    <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20 mt-4 flex gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />
                        <p className="text-[11px] text-orange-200/80 leading-relaxed">
                            <span className="font-bold text-orange-400">Note:</span> Your physical ID card PDF contains an encrypted secure QR code. Guards scanning it will instantly verify your active residency status. Do not share your ID card on public platforms.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
