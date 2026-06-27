import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Phone, Ambulance, Flame, Shield, MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTriggerSOSMutation } from '../../../store/api/emergencyApi';
import { useGetMyProfileQuery } from '../../../store/api/residentApi';

export default function ResidentEmergencyPage() {
    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const timerRef = useRef(null);
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
        e.preventDefault(); // prevent text selection
        if (isLoading) return;
        setIsHolding(true);
        startTimeRef.current = Date.now();
        
        const updateProgress = () => {
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

    // Helper to get icon for contact type
    const getContactIcon = (type) => {
        switch (type) {
            case 'POLICE': return <Shield className="w-5 h-5 text-blue-500" />;
            case 'FIRE': return <Flame className="w-5 h-5 text-orange-500" />;
            case 'AMBULANCE': return <Ambulance className="w-5 h-5 text-red-500" />;
            case 'HOSPITAL': return <MapPin className="w-5 h-5 text-emerald-500" />;
            default: return <Phone className="w-5 h-5 text-slate-500" />;
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-slate-900">Emergency</h1>
                <p className="text-sm text-slate-500">Hold the SOS button for 3 seconds to alert security instantly.</p>
            </div>

            {/* SOS Button Area */}
            <div className="flex justify-center py-8">
                <div 
                    className="relative flex items-center justify-center w-64 h-64 select-none touch-none"
                    onMouseDown={startHold}
                    onMouseUp={cancelHold}
                    onMouseLeave={cancelHold}
                    onTouchStart={startHold}
                    onTouchEnd={cancelHold}
                >
                    {/* Pulsing background rings */}
                    <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute inset-4 bg-red-200 rounded-full animate-pulse"></div>
                    
                    {/* Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-red-100"
                        />
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-red-600 transition-all duration-75 ease-linear"
                            strokeDasharray={2 * Math.PI * 120}
                            strokeDashoffset={2 * Math.PI * 120 * (1 - holdProgress / 100)}
                        />
                    </svg>

                    {/* Actual Button */}
                    <div className={`
                        absolute inset-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 
                        shadow-2xl shadow-red-500/50 flex flex-col items-center justify-center
                        transition-transform duration-200
                        ${isHolding ? 'scale-95' : 'scale-100 hover:scale-105'}
                        ${isLoading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
                    `}>
                        <ShieldAlert className="w-16 h-16 text-white mb-2" />
                        <span className="text-white font-bold text-xl tracking-widest">SOS</span>
                    </div>
                </div>
            </div>

            {/* Hold progress text */}
            <div className="text-center h-6">
                {isHolding && <p className="text-sm font-semibold text-red-600 animate-pulse">Hold to trigger...</p>}
            </div>

            {/* Quick Contacts */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800">Quick Contacts</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {societyContacts.length > 0 ? societyContacts.map((contact, idx) => (
                        <a 
                            key={idx} 
                            href={`tel:${contact.phone}`}
                            className="flex items-center justify-between p-4 hover:bg-slate-50 transition active:bg-slate-100"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                    {getContactIcon(contact.type)}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 flex items-center gap-2">
                                        {contact.name}
                                        {contact.type && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                                                {contact.type.replace('_', ' ')}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-0.5">{contact.phone}</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Phone className="w-4 h-4" />
                            </div>
                        </a>
                    )) : (
                        <div className="p-6 text-center text-slate-500 text-sm">
                            No society emergency contacts configured.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
