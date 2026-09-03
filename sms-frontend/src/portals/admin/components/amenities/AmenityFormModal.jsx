import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, MapPin, Users, Settings, Clock, Plus, Trash2, CalendarDays, DollarSign, CheckCircle2, ChevronRight } from 'lucide-react';
import { useCreateAmenityMutation, useUpdateAmenityMutation } from '../../../../store/api/facilityApi';
import { toast } from 'react-hot-toast';
import { cn } from '../../../../components/ui/Button';

const FACILITY_TYPES = [
    'CLUBHOUSE', 'SWIMMING_POOL', 'GYM', 'TENNIS_COURT', 'BADMINTON_COURT',
    'CRICKET_NET', 'PARTY_HALL', 'TERRACE', 'LIBRARY', 'KIDS_PLAY_AREA',
    'MEDITATION_ROOM', 'CONFERENCE_ROOM', 'BBQ_AREA', 'OTHER'
];

const DAYS_OF_WEEK = [
    { id: '0', label: 'Sunday' },
    { id: '1', label: 'Monday' },
    { id: '2', label: 'Tuesday' },
    { id: '3', label: 'Wednesday' },
    { id: '4', label: 'Thursday' },
    { id: '5', label: 'Friday' },
    { id: '6', label: 'Saturday' }
];

export default function AmenityFormModal({ existing, onClose }) {
    const [createAmenity, { isLoading: creating }] = useCreateAmenityMutation();
    const [updateAmenity, { isLoading: updating }] = useUpdateAmenityMutation();
    const isEditMode = !!existing;

    const [step, setStep] = useState(1);
    
    const [form, setForm] = useState({
        name: existing?.name || '',
        facilityType: existing?.facilityType || 'CLUBHOUSE',
        customAmenityType: existing?.customAmenityType || '',
        description: existing?.description || '',
        location: existing?.location || '',
        capacity: existing?.capacity || '',
        isPaid: existing?.isPaid || false,
        hourlyRate: existing?.hourlyRate || 0,
        fullDayRate: existing?.fullDayRate || 0,
        refundableDeposit: existing?.refundableDeposit || 0,
        autoApproval: existing?.autoApproval ?? true,
        advanceBookingDays: existing?.advanceBookingDays || 30,
        minDurationHours: existing?.minDurationHours || 1,
        maxDurationHours: existing?.maxDurationHours || '',
        cancellationDeadlineHours: existing?.cancellationDeadlineHours || 24,
        isActive: existing?.isActive ?? true,
    });

    const [availableSlots, setAvailableSlots] = useState(() => {
        const defaultSlots = { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] };
        if (existing?.availableSlots) {
            return { ...defaultSlots, ...existing.availableSlots };
        }
        return defaultSlots;
    });

    const [activeDay, setActiveDay] = useState('0'); // Default to Sunday
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(existing?.image || null);

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddSlot = () => {
        setAvailableSlots(prev => ({
            ...prev,
            [activeDay]: [...prev[activeDay], { startTime: '09:00', endTime: '10:00', maxBookings: 1 }]
        }));
    };

    const handleUpdateSlot = (index, field, value) => {
        setAvailableSlots(prev => {
            const newSlots = [...prev[activeDay]];
            newSlots[index] = { ...newSlots[index], [field]: value };
            return { ...prev, [activeDay]: newSlots };
        });
    };

    const handleRemoveSlot = (index) => {
        setAvailableSlots(prev => {
            const newSlots = [...prev[activeDay]];
            newSlots.splice(index, 1);
            return { ...prev, [activeDay]: newSlots };
        });
    };

    const handleCopyToAllDays = () => {
        const slotsToCopy = [...availableSlots[activeDay]];
        setAvailableSlots({
            "0": [...slotsToCopy], "1": [...slotsToCopy], "2": [...slotsToCopy],
            "3": [...slotsToCopy], "4": [...slotsToCopy], "5": [...slotsToCopy], "6": [...slotsToCopy]
        });
        toast.success(`Slots copied to all days!`);
    };

    const handleNext = () => {
        if (step === 1) {
            if (!form.name || !form.facilityType || (form.facilityType === 'OTHER' && !form.customAmenityType)) {
                return toast.error('Please fill all required fields in Step 1');
            }
        }
        setStep(s => Math.min(4, s + 1));
    };

    const handleBack = () => setStep(s => Math.max(1, s - 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.name || !form.facilityType || (form.facilityType === 'OTHER' && !form.customAmenityType)) {
            return toast.error('Name and Category are required.');
        }

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('facilityType', form.facilityType);
        if (form.customAmenityType) formData.append('customAmenityType', form.customAmenityType);
        if (form.description) formData.append('description', form.description);
        if (form.location) formData.append('location', form.location);
        if (form.capacity) formData.append('capacity', Number(form.capacity));
        formData.append('isPaid', form.isPaid);
        if (form.isPaid) {
            formData.append('hourlyRate', Number(form.hourlyRate));
            formData.append('fullDayRate', Number(form.fullDayRate));
            formData.append('refundableDeposit', Number(form.refundableDeposit));
        }
        formData.append('autoApproval', form.autoApproval);
        formData.append('advanceBookingDays', Number(form.advanceBookingDays));
        formData.append('minDurationHours', Number(form.minDurationHours));
        if (form.maxDurationHours) formData.append('maxDurationHours', Number(form.maxDurationHours));
        formData.append('cancellationDeadlineHours', Number(form.cancellationDeadlineHours));
        formData.append('isActive', form.isActive);
        
        // Append slots
        formData.append('availableSlots', JSON.stringify(availableSlots));

        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            if (existing) {
                await updateAmenity({ id: existing._id, data: formData }).unwrap();
                toast.success('Amenity updated successfully!');
            } else {
                await createAmenity(formData).unwrap();
                toast.success('Amenity created successfully!');
            }
            onClose(true);
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to save amenity');
        }
    };

    const isLoading = creating || updating;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center lg:p-6 bg-black/90 backdrop-blur-md">
            <div className="bg-[#10121a] w-full h-[100dvh] lg:h-[90vh] lg:max-w-[1200px] lg:rounded-3xl flex flex-col lg:flex-row shadow-[0_0_80px_rgba(0,0,0,0.8)] lg:border border-white/10 relative overflow-hidden">
                
                {/* Close Button (Desktop) */}
                <button 
                    onClick={onClose} 
                    className="hidden lg:block absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-30"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* MOBILE NAV BAR */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#151722] shrink-0 z-30">
                    <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-[13px] font-bold text-white tracking-widest uppercase absolute left-1/2 -translate-x-1/2">
                        {existing ? 'Edit Amenity' : 'New Amenity'}
                    </h2>
                </div>

                {/* Left Side - Hero / Info */}
                <div className="hidden lg:flex flex-col w-[30%] bg-gradient-to-b from-[#1a1c29] to-[#151722] border-r border-white/5 p-10 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#6338f0]/5" />
                    
                    {/* Illustration Container */}
                    <div className="w-48 h-48 mx-auto mb-10 relative z-10 mt-10">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl" />
                        <div className="relative w-full h-full flex items-center justify-center">
                            <CalendarDays className="w-24 h-24 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,56,240,0.5)] transform -rotate-6" />
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-500/20 rounded-2xl border border-purple-500/30 flex items-center justify-center backdrop-blur-md animate-bounce" style={{ animationDelay: '0.2s' }}>
                                <Clock className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 flex items-center justify-center backdrop-blur-md animate-bounce" style={{ animationDelay: '0.5s' }}>
                                <Users className="w-6 h-6 text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-center mb-10">
                        <h2 className="text-2xl font-bold text-white mb-3">{isEditMode ? 'Edit Amenity' : 'Add Amenity'}</h2>
                        <p className="text-gray-400 text-[14px] leading-relaxed">Configure world-class facilities and define booking rules, capacities, and time slots.</p>
                    </div>

                    <div className="space-y-6 relative z-10 mt-auto">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="text-[13px] font-bold text-white mb-1">Flexible Slots</h4>
                                <p className="text-[12px] text-gray-500 font-medium">Define custom booking slots per day</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <DollarSign className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-[13px] font-bold text-white mb-1">Pricing Rules</h4>
                                <p className="text-[12px] text-gray-500 font-medium">Configure hourly, full-day, and deposits</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 flex flex-col h-full bg-[#151722] relative z-20">
                    
                    {/* Progress Bar Header */}
                    <div className="px-4 lg:px-10 py-4 lg:py-6 border-b border-white/10 shrink-0 bg-[#151722] flex items-center justify-between">
                        <div className="flex items-center justify-between overflow-x-auto custom-scrollbar flex-1 lg:mr-4 gap-4 lg:gap-0 pb-1 lg:pb-0 snap-x snap-mandatory">
                            {[
                                { num: 1, title: 'Basic' },
                                { num: 2, title: 'Rules' },
                                { num: 3, title: 'Slots' },
                                { num: 4, title: 'Review' }
                            ].map((s, i, arr) => (
                                <React.Fragment key={s.num}>
                                    <button 
                                        type="button"
                                        disabled={!isEditMode && step < s.num}
                                        onClick={() => setStep(s.num)}
                                        className="flex items-center gap-3 shrink-0 group focus:outline-none disabled:cursor-not-allowed"
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors",
                                            step === s.num ? "bg-[#6338f0] text-white border-[#6338f0]" : 
                                            step > s.num ? "bg-emerald-500 text-white border-emerald-500" : 
                                            "bg-white/5 text-gray-500 border-white/10"
                                        )}>
                                            {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-bold transition-colors",
                                            step === s.num ? "text-white" : step > s.num ? "text-emerald-400" : "text-gray-500",
                                            (!isEditMode && step < s.num) ? "" : "group-hover:text-indigo-300"
                                        )}>
                                            {s.title}
                                        </span>
                                    </button>
                                    {i < arr.length - 1 && (
                                        <div className={cn(
                                            "flex-1 h-[2px] mx-4 min-w-[20px] transition-colors",
                                            step > s.num ? "bg-emerald-500/50" : "bg-white/5"
                                        )} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <button onClick={() => onClose(false)} className="hidden lg:block p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Form Content */}
                    <div className="flex-1 p-8 md:p-10 overflow-y-auto custom-scrollbar">
                        
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
                                <h3 className="text-xl font-bold text-white mb-6">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-white flex items-center gap-1">Amenity Name <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            value={form.name}
                                            onChange={set('name')}
                                            placeholder="e.g., Grand Clubhouse"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white font-bold placeholder-gray-500 focus:outline-none focus:border-[#6338f0]/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-white flex items-center gap-1">Category <span className="text-red-500">*</span></label>
                                        <select
                                            value={form.facilityType}
                                            onChange={set('facilityType')}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white font-bold appearance-none focus:outline-none focus:border-[#6338f0]/50"
                                        >
                                            {FACILITY_TYPES.map(t => <option key={t} value={t} className="bg-[#151722]">{t.replace(/_/g, ' ')}</option>)}
                                        </select>
                                    </div>

                                    {form.facilityType === 'OTHER' && (
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[13px] font-bold text-white flex items-center gap-1">Custom Category <span className="text-red-500">*</span></label>
                                            <input
                                                required
                                                value={form.customAmenityType}
                                                onChange={set('customAmenityType')}
                                                placeholder="e.g. Yoga Studio"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white font-bold placeholder-gray-500 focus:outline-none focus:border-[#6338f0]/50"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-white flex items-center gap-1">Location / Floor</label>
                                        <input
                                            value={form.location}
                                            onChange={set('location')}
                                            placeholder="e.g., Tower A, Ground Floor"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white font-bold placeholder-gray-500 focus:outline-none focus:border-[#6338f0]/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-white flex items-center gap-1">Max Capacity (People)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={form.capacity}
                                            onChange={set('capacity')}
                                            placeholder="Max limit"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white font-bold placeholder-gray-500 focus:outline-none focus:border-[#6338f0]/50"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[13px] font-bold text-white flex items-center gap-1">Description</label>
                                        <textarea
                                            value={form.description}
                                            onChange={set('description')}
                                            rows={2}
                                            placeholder="Provide a brief description..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white font-bold placeholder-gray-500 focus:outline-none focus:border-[#6338f0]/50 resize-none"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[13px] font-bold text-white flex items-center gap-1">Amenity Image</label>
                                        <div className="border-2 border-dashed border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative overflow-hidden group">
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                            <div className="p-6 flex flex-col items-center justify-center text-center">
                                                {imagePreview ? (
                                                    <div className="absolute inset-0">
                                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ImageIcon className="w-8 h-8 text-white mb-2 drop-shadow-lg" />
                                                            <span className="text-white font-bold bg-black/60 px-3 py-1 rounded-lg backdrop-blur-sm text-sm">Change Image</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                                                            <Upload className="w-5 h-5 text-indigo-400" />
                                                        </div>
                                                        <p className="text-white font-bold text-sm mb-1">Click to upload image</p>
                                                        <p className="text-[12px] text-gray-500">PNG, JPG or WEBP</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
                                <h3 className="text-xl font-bold text-white mb-6">Booking Rules & Pricing</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-indigo-500/50 transition">
                                        <input type="checkbox" checked={form.isPaid} onChange={set('isPaid')} className="w-5 h-5 rounded border-gray-600 bg-transparent accent-[#6338f0]" />
                                        <div>
                                            <span className="block text-[14px] font-bold text-white">Paid Amenity</span>
                                            <span className="text-[12px] text-gray-400">Requires payment</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-emerald-500/50 transition">
                                        <input type="checkbox" checked={form.autoApproval} onChange={set('autoApproval')} className="w-5 h-5 rounded border-gray-600 bg-transparent accent-emerald-500" />
                                        <div>
                                            <span className="block text-[14px] font-bold text-white">Auto Approval</span>
                                            <span className="text-[12px] text-gray-400">No manual review</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-blue-500/50 transition">
                                        <input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="w-5 h-5 rounded border-gray-600 bg-transparent accent-blue-500" />
                                        <div>
                                            <span className="block text-[14px] font-bold text-white">Active</span>
                                            <span className="text-[12px] text-gray-400">Visible to residents</span>
                                        </div>
                                    </label>
                                </div>

                                {form.isPaid && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-[#6338f0]/10 border border-[#6338f0]/30 rounded-xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#6338f0]" />
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-indigo-300">Hourly Rate (₹)</label>
                                            <input type="number" min={0} value={form.hourlyRate} onChange={set('hourlyRate')} className="w-full bg-[#151722]/80 border border-[#6338f0]/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-indigo-300">Full Day Rate (₹)</label>
                                            <input type="number" min={0} value={form.fullDayRate} onChange={set('fullDayRate')} className="w-full bg-[#151722]/80 border border-[#6338f0]/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-indigo-300">Deposit (₹)</label>
                                            <input type="number" min={0} value={form.refundableDeposit} onChange={set('refundableDeposit')} className="w-full bg-[#151722]/80 border border-[#6338f0]/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none" />
                                        </div>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-gray-400">Advance Booking (Days)</label>
                                        <input type="number" min={1} max={365} value={form.advanceBookingDays} onChange={set('advanceBookingDays')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[14px] text-white focus:outline-none focus:border-[#6338f0]/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-gray-400">Min Duration (Hrs)</label>
                                        <input type="number" min={0.5} step={0.5} value={form.minDurationHours} onChange={set('minDurationHours')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[14px] text-white focus:outline-none focus:border-[#6338f0]/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-gray-400">Max Duration (Hrs)</label>
                                        <input type="number" min={0.5} step={0.5} value={form.maxDurationHours} onChange={set('maxDurationHours')} placeholder="No limit" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[14px] text-white focus:outline-none focus:border-[#6338f0]/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-gray-400">Cancellation Limit (Hrs)</label>
                                        <input type="number" min={0} value={form.cancellationDeadlineHours} onChange={set('cancellationDeadlineHours')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[14px] text-white focus:outline-none focus:border-[#6338f0]/50" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Slot Management</h3>
                                    <button type="button" onClick={handleCopyToAllDays} className="text-[13px] font-bold text-indigo-400 hover:text-indigo-300 transition px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl">
                                        Copy to all days
                                    </button>
                                </div>

                                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day.id}
                                            type="button"
                                            onClick={() => setActiveDay(day.id)}
                                            className={`px-4 py-2.5 rounded-xl text-[13px] font-bold shrink-0 transition-all ${
                                                activeDay === day.id 
                                                ? 'bg-[#6338f0] text-white shadow-[0_0_15px_rgba(99,56,240,0.3)]' 
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {day.label}
                                            {availableSlots[day.id]?.length > 0 && (
                                                <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${activeDay === day.id ? 'bg-white/20' : 'bg-white/10'}`}>
                                                    {availableSlots[day.id].length}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-[15px] font-bold text-white">
                                            {DAYS_OF_WEEK.find(d => d.id === activeDay)?.label} Slots
                                        </h4>
                                        <button 
                                            type="button" 
                                            onClick={handleAddSlot}
                                            className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-400 hover:text-emerald-300 transition bg-emerald-500/10 px-4 py-2 rounded-xl"
                                        >
                                            <Plus className="w-4 h-4" /> Add Slot
                                        </button>
                                    </div>

                                    {availableSlots[activeDay].length === 0 ? (
                                        <div className="text-center py-12 text-gray-500 text-[14px] font-medium border-2 border-dashed border-white/10 rounded-xl">
                                            No slots configured for this day.<br/><span className="text-[12px] mt-1 block">Click "Add Slot" to define available booking times.</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {availableSlots[activeDay].map((slot, index) => (
                                                <div key={index} className="flex flex-col sm:flex-row items-center gap-4 bg-[#151722] p-4 rounded-xl border border-white/5 group relative">
                                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                                        <span className="text-gray-500 text-[13px] font-bold w-12">Starts</span>
                                                        <input 
                                                            type="time" 
                                                            value={slot.startTime} 
                                                            onChange={(e) => handleUpdateSlot(index, 'startTime', e.target.value)}
                                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[14px] text-white font-bold focus:border-[#6338f0] focus:outline-none w-full sm:w-36"
                                                            style={{ colorScheme: 'dark' }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                                        <span className="text-gray-500 text-[13px] font-bold w-12 sm:w-10 text-left sm:text-center">Ends</span>
                                                        <input 
                                                            type="time" 
                                                            value={slot.endTime} 
                                                            onChange={(e) => handleUpdateSlot(index, 'endTime', e.target.value)}
                                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[14px] text-white font-bold focus:border-[#6338f0] focus:outline-none w-full sm:w-36"
                                                            style={{ colorScheme: 'dark' }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                                                        <span className="text-gray-500 text-[13px] font-bold whitespace-nowrap">Max Capacity</span>
                                                        <input 
                                                            type="number" 
                                                            min="1"
                                                            value={slot.maxBookings || 1} 
                                                            onChange={(e) => handleUpdateSlot(index, 'maxBookings', parseInt(e.target.value) || 1)}
                                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[14px] text-white font-bold focus:border-[#6338f0] focus:outline-none w-full sm:w-24"
                                                        />
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveSlot(index)}
                                                        className="w-11 h-11 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center shrink-0 transition"
                                                        title="Remove slot"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
                                <h3 className="text-xl font-bold text-white mb-6">Review & Publish</h3>
                                <div className="bg-[#1e2030] rounded-2xl p-8 border border-white/10">
                                    <div className="grid grid-cols-2 gap-6 text-sm">
                                        <div>
                                            <span className="block text-gray-500 mb-1">Name</span>
                                            <span className="font-bold text-white text-base">{form.name}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 mb-1">Category</span>
                                            <span className="font-bold text-white capitalize text-base">{form.facilityType.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 mb-1">Location</span>
                                            <span className="font-bold text-white text-base">{form.location || 'Not set'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 mb-1">Capacity</span>
                                            <span className="font-bold text-white text-base">{form.capacity ? `${form.capacity} People` : 'Not set'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 mb-1">Pricing</span>
                                            <span className="font-bold text-emerald-400 text-base">{form.isPaid ? `₹${form.hourlyRate}/hr` : 'Free Amenity'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 mb-1">Approval Type</span>
                                            <span className="font-bold text-blue-400 text-base">{form.autoApproval ? 'Auto-approved' : 'Manual Approval'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex items-start gap-4">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-[15px] font-bold text-emerald-400">Ready to Publish</h4>
                                        <p className="text-[13px] text-emerald-500/80 mt-1">Please confirm that all details and slot configurations are correct. You can edit these settings later.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-4 lg:px-10 py-4 lg:py-6 border-t border-white/10 bg-[#10121a] shrink-0 flex items-center justify-between mt-auto z-40 pb-safe">
                        <button 
                            type="button" 
                            onClick={step === 1 ? () => onClose(false) : handleBack} 
                            disabled={isLoading}
                            className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-[14px] hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>
                        
                        {step < 4 ? (
                            <button 
                                type="button" 
                                onClick={handleNext}
                                className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[14px] transition-colors flex items-center gap-2"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button 
                                type="button" 
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-8 py-3 rounded-xl bg-[#6338f0] hover:bg-[#5b32e6] text-white font-bold text-[14px] shadow-[0_0_15px_rgba(99,56,240,0.4)] transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isLoading ? 'Processing...' : (isEditMode ? 'Update Amenity' : 'Create Amenity')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
