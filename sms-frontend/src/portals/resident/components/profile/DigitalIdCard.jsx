import React from 'react';
import { Download, Mail, ShieldCheck, RefreshCw, FileText } from 'lucide-react';

export function DigitalIdCard({ user, profile, onEmail, isEmailing }) {
    if (!profile?.idCardUrl) return null;

    // Cloudinary allows converting PDFs to images on the fly by changing the extension to .jpg or .png
    // We can use this to show a high-quality image preview instead of an iframe which is buggy on mobile
    const getImageUrl = (url) => {
        if (!url) return '';
        // If it's a cloudinary URL and ends in .pdf, change it to .png for preview
        if (url.includes('cloudinary.com') && url.endsWith('.pdf')) {
            return url.replace('.pdf', '.png');
        }
        return url;
    };

    const previewUrl = getImageUrl(profile.idCardUrl);

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            {/* The ID Card Visual Preview (Using Cloudinary URL) */}
            <div className="relative shrink-0 w-[240px] h-[380px] rounded-2xl bg-slate-50 shadow-md ring-1 ring-slate-900/5 overflow-hidden flex flex-col mx-auto md:mx-0 group">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 z-0">
                    <RefreshCw className="h-6 w-6 animate-spin opacity-50" />
                </div>
                
                <img 
                    src={previewUrl} 
                    alt="Digital ID Card Preview" 
                    className="absolute inset-0 w-full h-full object-contain z-10 bg-white"
                />
                
                {/* Overlay for interaction prevention on the image (stops dragging) */}
                <div className="absolute inset-0 z-20 bg-transparent"></div>
            </div>

            {/* Actions and Info */}
            <div className="flex-1 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-6 w-6 text-indigo-500" />
                        Your Digital Identity
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                        This is your official society digital ID card. You can use it to verify your identity at the main gate, access clubhouse facilities, and authenticate yourself within the society premises.
                    </p>
                </div>

                <div className="flex flex-col gap-3 max-w-sm">
                    <a
                        href={profile.idCardUrl}
                        download={`ID_Card_${user?.firstName}_${user?.lastName}.pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-md transition-all duration-300 w-full text-left bg-white"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Download className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-slate-800">Download PDF</p>
                                <p className="text-xs text-slate-500">Save to your device for offline use</p>
                            </div>
                        </div>
                    </a>

                    <button
                        onClick={onEmail}
                        disabled={isEmailing}
                        className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-md transition-all duration-300 w-full text-left bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                {isEmailing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-slate-800">Email ID Card</p>
                                <p className="text-xs text-slate-500">Send a copy to {user?.email}</p>
                            </div>
                        </div>
                    </button>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100/50 mt-4">
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                        <strong className="font-bold">Note:</strong> Your physical ID card PDF contains an encrypted secure QR code. Guards scanning it will instantly verify your active residency status. Do not share your ID card on public platforms.
                    </p>
                </div>
            </div>
        </div>
    );
}
