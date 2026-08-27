import React, { useState, useEffect, useRef } from 'react';
import { 
    ShieldAlert, Phone, Ambulance, Flame, Shield, MapPin, 
    ShieldCheck, AlertCircle, PhoneCall, Info, Navigation, Users, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTriggerSOSMutation } from '../../../store/api/emergencyApi';
import { useGetMyProfileQuery } from '../../../store/api/residentApi';

export default function ResidentEmergencyPage() {
    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const frameRef = useRef(null);
    const startTimeRef = useRef(null);

    const [triggerSOS, { isLoading }] = useTriggerSOSMutation();
    const { data: profileRes } = useGetMyProfileQuery();
    
    // Configured emergency contacts from society
    const societyContacts = profileRes?.data?.profile?.societyId?.emergencyContacts || [];

    const handleSOS = async () => {
        try {
            await triggerSOS({
                emergencyType: 'PANIC'
            }).unwrap();
            toast.success('SOS Triggered! Security has been notified.', { icon: '🚨' });
        } catch (error) {
            toast.error(error.data?.message || 'Failed to trigger SOS');
        }
    };

    const startHold = (e) => {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }
        if (isLoading) return;
        setIsHolding(true);
        // eslint-disable-next-line react-hooks/purity
        startTimeRef.current = Date.now();
        
        const updateProgress = () => {
            // eslint-disable-next-line react-hooks/purity
            const elapsed = Date.now() - startTimeRef.current;
            const progress = Math.min((elapsed / 3000) * 100, 100);
            setHoldProgress(progress);

            if (progress >= 100) {
                // Triggered!
                cancelHold();
                handleSOS();
            } else {
                frameRef.current = requestAnimationFrame(updateProgress);
            }
        };
        
        frameRef.current = requestAnimationFrame(updateProgress);
    };

    const cancelHold = () => {
        setIsHolding(false);
        setHoldProgress(0);
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }
    };

    useEffect(() => {
        return () => cancelHold();
    }, []);

    // Helper to format contacts for UI mapping
    const getContactIcon = (type) => {
        switch (type) {
            case 'POLICE': return { icon: <Shield className="w-5 h-5 text-indigo-400" />, bg: 'bg-indigo-500/10' };
            case 'FIRE': return { icon: <Flame className="w-5 h-5 text-orange-400" />, bg: 'bg-orange-500/10' };
            case 'AMBULANCE': return { icon: <Ambulance className="w-5 h-5 text-red-400" />, bg: 'bg-red-500/10' };
            case 'HOSPITAL': return { icon: <MapPin className="w-5 h-5 text-emerald-400" />, bg: 'bg-emerald-500/10' };
            default: return { icon: <ShieldCheck className="w-5 h-5 text-blue-400" />, bg: 'bg-blue-500/10' };
        }
    };

    // We fallback to some defaults if societyContacts is empty to match the mockup
    const defaultContacts = [
        { type: 'SECURITY', name: 'Security Office', number: '8000868197' },
        { type: 'FIRE', name: 'Fire Department', number: '8787678798' },
        { type: 'HOSPITAL', name: 'City Hospital', number: '8787987656' },
        { type: 'AMBULANCE', name: 'Ambulance', number: '8798767656' },
        { type: 'POLICE', name: 'Nearby Police Station', number: '878789877' },
    ];
    const displayContacts = societyContacts.length > 0 ? societyContacts : defaultContacts;

    // SVG Circle Math for the SOS button progress ring
    const radius = 130;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white leading-tight">Emergency (SOS)</h1>
                        <p className="text-sm text-slate-400">Instant help when you need it most. We're here to keep you safe.</p>
                    </div>
                </div>
                
                <div className="bg-[#131525] border border-white/5 rounded-2xl p-4 flex items-start gap-4 max-w-sm">
                    <div className="mt-0.5"><ShieldCheck className="w-5 h-5 text-indigo-400" /></div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Your safety is our priority</h4>
                        <p className="text-xs text-slate-400 mt-1">SOS alerts will be shared with security and relevant authorities.</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left: SOS Button Block */}
                <div className="bg-[#131525] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
                    {/* Background glow effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />
                    
                    {/* SOS Interactive Button */}
                    <div className="relative flex-1 flex items-center justify-center w-full mt-4">
                        <div 
                            className="relative flex items-center justify-center w-[288px] h-[288px] select-none touch-none cursor-pointer group"
                            onMouseDown={startHold}
                            onMouseUp={cancelHold}
                            onMouseLeave={cancelHold}
                            onTouchStart={startHold}
                            onTouchEnd={cancelHold}
                        >
                            {/* Inner ambient glow (behind button) */}
                            <div className="absolute inset-4 rounded-full shadow-[0_0_80px_rgba(220,38,38,0.3)] pointer-events-none z-10" />
                            
                            {/* Progress Ring (SVG) */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] z-20">
                                {/* Track */}
                                <circle
                                    cx="144" cy="144" r={radius}
                                    stroke="rgba(239,68,68,0.4)"
                                    strokeWidth="1.5"
                                    strokeDasharray="4 4"
                                    fill="none"
                                />
                                {/* Fill */}
                                <circle
                                    cx="144" cy="144" r={radius}
                                    stroke="#ef4444"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeLinecap="round"
                                    style={{
                                        strokeDasharray: circumference,
                                        strokeDashoffset: strokeDashoffset,
                                        transition: 'stroke-dashoffset 0.1s linear'
                                    }}
                                />
                            </svg>

                            {/* Center Button - 3D Dome Style */}
                            <div className={`absolute inset-[30px] rounded-full bg-gradient-to-b from-[#ff5252] to-[#b91c1c] flex flex-col items-center justify-center transition-transform duration-300 z-30 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_8px_15px_rgba(255,255,255,0.4),inset_0_-8px_15px_rgba(0,0,0,0.5)] border border-[#ff6b6b]/30 ${isHolding ? 'scale-95 shadow-[0_4px_10px_rgba(0,0,0,0.8),inset_0_4px_8px_rgba(255,255,255,0.2),inset_0_-4px_8px_rgba(0,0,0,0.7)]' : 'group-hover:scale-[1.02]'}`}>
                                <ShieldAlert className="w-[60px] h-[60px] text-white mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" strokeWidth={2.5} />
                                <span className="text-[40px] font-black text-white tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">SOS</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-6 z-10">
                        <p className="text-lg font-bold text-white mb-1">Press and hold for 3 seconds</p>
                        <p className="text-sm text-slate-400">Release to cancel</p>
                    </div>

                    {/* Warning Banner inside the card */}
                    <div className="mt-8 bg-red-500/5 border border-red-500/10 rounded-xl p-4 w-full flex items-center gap-4 z-10">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <div>
                            <p className="text-sm text-slate-300">False alarms will be recorded.</p>
                            <p className="text-sm text-slate-400">Use only in genuine emergencies.</p>
                        </div>
                    </div>
                </div>

                {/* Right: Quick Contacts */}
                <div className="bg-[#131525] border border-white/5 rounded-3xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Quick Contacts</h2>
                        <button className="text-sm text-indigo-400 font-medium hover:text-indigo-300 transition-colors">View All</button>
                    </div>

                    <div className="flex-1 space-y-3">
                        {displayContacts.map((contact, idx) => {
                            const { icon, bg } = getContactIcon(contact.type);
                            // Badge colors
                            let badgeClass = "bg-slate-500/10 text-slate-400";
                            if (contact.type === 'SECURITY') badgeClass = "bg-blue-500/10 text-blue-400";
                            else if (contact.type === 'FIRE') badgeClass = "bg-orange-500/10 text-orange-400";
                            else if (contact.type === 'HOSPITAL') badgeClass = "bg-emerald-500/10 text-emerald-400";
                            else if (contact.type === 'AMBULANCE') badgeClass = "bg-red-500/10 text-red-400";
                            else if (contact.type === 'POLICE') badgeClass = "bg-indigo-500/10 text-indigo-400";
                            
                            const phoneNumber = contact.phone || contact.number;

                            return (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#1A1C2A] hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                                            {icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-bold text-white">{contact.name}</h4>
                                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider ${badgeClass}`}>
                                                    {contact.type}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium">{phoneNumber}</p>
                                        </div>
                                    </div>
                                    <a 
                                        href={`tel:${phoneNumber}`}
                                        className="w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center hover:bg-emerald-500/10 hover:border-emerald-500/20 group transition-all"
                                    >
                                        <PhoneCall className="w-4 h-4 text-emerald-500 opacity-70 group-hover:opacity-100" />
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Timeline / What happens */}
                <div className="lg:col-span-2 bg-[#131525] border border-white/5 rounded-3xl p-6">
                    <h2 className="text-lg font-bold text-white mb-8">What happens after you trigger SOS?</h2>
                    
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4 px-4 pb-4">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-6 left-12 right-12 h-[2px] bg-white/5"></div>
                        <div className="hidden md:block absolute top-6 left-12 right-12 h-[2px] bg-gradient-to-r from-red-500/50 via-indigo-500/50 to-emerald-500/50 blur-[2px]"></div>

                        {/* Step 1 */}
                        <div className="relative z-10 flex flex-col items-center text-center w-full md:w-1/4">
                            <div className="w-14 h-14 bg-[#1A1C2A] border border-white/10 rounded-2xl flex items-center justify-center mb-4 relative shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                                <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">1</div>
                                <ShieldAlert className="w-6 h-6 text-red-400" />
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1.5">Alert Sent</h4>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-[150px]">Instant alert is sent to security and emergency contacts.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex flex-col items-center text-center w-full md:w-1/4">
                            <div className="w-14 h-14 bg-[#1A1C2A] border border-white/10 rounded-2xl flex items-center justify-center mb-4 relative shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                                <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">2</div>
                                <Navigation className="w-6 h-6 text-red-400" />
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1.5">Location Shared</h4>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-[150px]">Your location is shared for quick response.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex flex-col items-center text-center w-full md:w-1/4">
                            <div className="w-14 h-14 bg-[#1A1C2A] border border-white/10 rounded-2xl flex items-center justify-center mb-4 relative shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                                <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">3</div>
                                <Users className="w-6 h-6 text-red-400" />
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1.5">Help On The Way</h4>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-[150px]">Our team and authorities will reach you as soon as possible.</p>
                        </div>

                        {/* Step 4 */}
                        <div className="relative z-10 flex flex-col items-center text-center w-full md:w-1/4">
                            <div className="w-14 h-14 bg-[#1A1C2A] border border-white/10 rounded-2xl flex items-center justify-center mb-4 relative shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                                <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">4</div>
                                <ShieldCheck className="w-6 h-6 text-purple-400" />
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1.5">Stay Safe</h4>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-[150px]">We'll stay connected until you're safe.</p>
                        </div>
                    </div>
                </div>

                {/* Safety Tips */}
                <div className="bg-[#131525] border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-bold text-white">Safety Tips</h2>
                    </div>
                    
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-slate-300">Use SOS only in genuine emergencies</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-slate-300">Stay calm and provide accurate information</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-slate-300">Keep your location services enabled</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-slate-300">Save emergency contacts for quick access</span>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
    );
}
