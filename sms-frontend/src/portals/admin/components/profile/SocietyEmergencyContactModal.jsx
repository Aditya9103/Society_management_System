import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { X, Phone, Building2, Shield, Plus, Check } from 'lucide-react';

const EMERGENCY_TYPES = [
    { value: 'POLICE', label: 'Police', color: 'blue' },
    { value: 'FIRE', label: 'Fire Dept', color: 'orange' },
    { value: 'AMBULANCE', label: 'Ambulance', color: 'red' },
    { value: 'HOSPITAL', label: 'Hospital', color: 'emerald' },
    { value: 'SECURITY_AGENCY', label: 'Security', color: 'indigo' },
    { value: 'OTHER', label: 'Other', color: 'slate' }
];

export default function SocietyEmergencyContactModal({ isOpen, onClose, onSave, initialData }) {
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: { type: 'POLICE' }
    });

    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const watchType = watch('type');

    useEffect(() => {
        if (isOpen) {
            setIsAnimatingOut(false);
            if (initialData) {
                reset({
                    name: initialData.name || '',
                    phone: initialData.phone || '',
                    type: initialData.type || 'POLICE',
                    customContactType: initialData.customContactType || ''
                });
            } else {
                reset({
                    name: '',
                    phone: '',
                    type: 'POLICE',
                    customContactType: ''
                });
            }
        }
    }, [isOpen, initialData, reset]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') handleClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen]);

    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            setIsAnimatingOut(false);
            onClose();
        }, 300); // match animation duration
    };

    const onSubmit = (data) => {
        if (data.type !== 'OTHER') {
            data.customContactType = '';
        }
        onSave(data);
        handleClose();
    };

    if (!isOpen && !isAnimatingOut) return null;

    const modalContent = (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[99999] sm:p-6">
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isAnimatingOut ? 'opacity-0' : 'opacity-100'}`} 
                onClick={handleClose} 
            />
            
            <div 
                className={`relative z-10 w-full max-w-lg rounded-[24px] bg-[#0c0d14] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transition-all duration-300 transform ${isAnimatingOut ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}`}
            >
                {/* Header Background Glow */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

                <div className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-8 sm:py-6 border-b border-white/5 relative z-10">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            {initialData ? (
                                <>
                                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    Edit Contact
                                </>
                            ) : (
                                <>
                                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    New Contact
                                </>
                            )}
                        </h2>
                        <p className="text-sm text-gray-300 mt-1 font-semibold">
                            {initialData ? 'Update emergency responder details.' : 'Add a quick-dial number for emergencies.'}
                        </p>
                    </div>
                    <button 
                        type="button" 
                        onClick={handleClose} 
                        className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:rotate-90 transition-all duration-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 sm:p-8 relative z-10">
                    <form id="emergency-contact-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">Name / Department</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Shield className={`w-5 h-5 transition-colors ${errors.name ? 'text-red-400' : 'text-gray-300 group-focus-within:text-indigo-400'}`} />
                                </div>
                                <input 
                                    {...register('name', { required: 'Name is required' })}
                                    className={`w-full bg-[#151722] border ${errors.name ? 'border-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:border-indigo-500/50'} rounded-2xl pl-12 pr-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:ring-4 ${errors.name ? 'focus:ring-red-500/10' : 'focus:ring-indigo-500/10'} transition-all`}
                                    placeholder="e.g. City Police Station"
                                />
                            </div>
                            {errors.name && <p className="text-xs font-medium text-red-400 mt-1 pl-1">{errors.name.message}</p>}
                        </div>

                        {/* Phone Input */}
                        <div className="space-y-2">
                            <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">Phone Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className={`w-5 h-5 transition-colors ${errors.phone ? 'text-red-400' : 'text-gray-300 group-focus-within:text-indigo-400'}`} />
                                </div>
                                <input 
                                    {...register('phone', { required: 'Phone number is required' })}
                                    className={`w-full bg-[#151722] border ${errors.phone ? 'border-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:border-indigo-500/50'} rounded-2xl pl-12 pr-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:ring-4 ${errors.phone ? 'focus:ring-red-500/10' : 'focus:ring-indigo-500/10'} transition-all`}
                                    placeholder="e.g. 100 or +91 9999999999"
                                />
                            </div>
                            {errors.phone && <p className="text-xs font-medium text-red-400 mt-1 pl-1">{errors.phone.message}</p>}
                        </div>

                        {/* Custom Radio Button Group for Type */}
                        <div className="space-y-3">
                            <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">Emergency Type</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {EMERGENCY_TYPES.map(type => {
                                    const isSelected = watchType === type.value;
                                    return (
                                        <label key={type.value} className="relative cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                value={type.value} 
                                                {...register('type')}
                                                className="sr-only"
                                            />
                                            <div className={`
                                                flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200
                                                ${isSelected 
                                                    ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                                                    : 'bg-[#151722] border-white/10 text-gray-300 hover:bg-[#1c1f2e] hover:border-white/20 hover:text-white'
                                                }
                                            `}>
                                                <span className="text-[12px] font-black uppercase tracking-wider text-center">{type.label}</span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Custom Type Input (conditionally rendered with animation) */}
                        <div className={`transition-all duration-300 overflow-hidden ${watchType === 'OTHER' ? 'max-h-32 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
                            <div className="space-y-2">
                                <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">Specify Type</label>
                                <input 
                                    {...register('customContactType', { 
                                        required: watchType === 'OTHER' ? 'Custom type is required' : false 
                                    })}
                                    className={`w-full bg-[#151722] border ${errors.customContactType ? 'border-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:border-indigo-500/50'} rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:ring-4 ${errors.customContactType ? 'focus:ring-red-500/10' : 'focus:ring-indigo-500/10'} transition-all`}
                                    placeholder="e.g. Plumber, Electrician"
                                />
                                {errors.customContactType && <p className="text-xs font-medium text-red-400 mt-1 pl-1">{errors.customContactType.message}</p>}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-5 sm:px-8 sm:py-6 border-t border-white/5 bg-[#151722]/50 flex justify-end gap-3 shrink-0">
                    <button 
                        type="button" 
                        onClick={handleClose}
                        className="px-6 py-3 rounded-xl bg-[#1c1f2e] text-sm font-bold text-gray-300 hover:bg-[#25283a] hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="emergency-contact-form"
                        className="px-8 py-3 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        {initialData ? "Save Changes" : "Add Contact"}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
