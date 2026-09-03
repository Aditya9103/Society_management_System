import React, { useState } from 'react';
import { X, ShieldAlert, User, AlertCircle, IndianRupee, Image as ImageIcon } from 'lucide-react';
import { useCreateViolationMutation, useListResidentProfilesQuery } from '../../../../store/api/societyAdminApi';
import { toast } from 'react-hot-toast';

const VIOLATION_TYPES = [
    { value: 'WRONG_PARKING', label: 'Wrong Parking' },
    { value: 'SPEEDING', label: 'Speeding' },
    { value: 'OVERNIGHT_PARKING', label: 'Overnight Parking' },
    { value: 'NO_STICKER', label: 'No Sticker' },
    { value: 'NOISE', label: 'Noise Complaint' },
    { value: 'LITTERING', label: 'Littering' },
    { value: 'DAMAGE', label: 'Property Damage' },
    { value: 'PET_ISSUE', label: 'Pet Issue' },
    { value: 'UNAUTHORIZED_MODIFICATION', label: 'Unauthorized Modification' },
    { value: 'OTHER', label: 'Other' }
];

export default function CreateViolationModal({ isOpen, onClose }) {
    const [createViolation, { isLoading }] = useCreateViolationMutation();
    const { data: residentsData, isLoading: isLoadingResidents } = useListResidentProfilesQuery();
    const residents = residentsData?.data?.residents || [];

    const [formData, setFormData] = useState({
        residentId: '',
        type: 'NOISE',
        fineAmount: '',
        description: '',
        photoUrl: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createViolation({
                ...formData,
                fineAmount: formData.fineAmount ? Number(formData.fineAmount) : 0
            }).unwrap();
            
            toast.success('Violation logged successfully');
            setFormData({
                residentId: '',
                type: 'NOISE',
                fineAmount: '',
                description: '',
                photoUrl: ''
            });
            onClose();
        } catch (error) {
            toast.error(error.data?.message || 'Failed to log violation');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0f111a]/80 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-2xl bg-[#1a1c29] border border-slate-700/50 rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-[#1a1c29]/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Log Violation</h2>
                            <p className="text-sm font-medium text-slate-400">Issue a warning or fine to a resident</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Resident Selection */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <User className="w-3.5 h-3.5" />
                                Select Resident
                            </label>
                            <select
                                required
                                value={formData.residentId}
                                onChange={(e) => setFormData({ ...formData, residentId: e.target.value })}
                                className="w-full bg-[#1a1c29]/50 border border-slate-700/50 rounded-[12px] px-4 py-3 text-slate-200 focus:outline-none focus:border-[#6338f0] focus:ring-1 focus:ring-[#6338f0] transition-all"
                            >
                                <option value="">Select a resident...</option>
                                {residents.map(r => (
                                    <option key={r._id} value={r._id}>
                                        {r.userId?.firstName} {r.userId?.lastName} ({r.tower}-{r.flatNumber})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Violation Type */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Violation Type
                            </label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-[#1a1c29]/50 border border-slate-700/50 rounded-[12px] px-4 py-3 text-slate-200 focus:outline-none focus:border-[#6338f0] focus:ring-1 focus:ring-[#6338f0] transition-all"
                            >
                                {VIOLATION_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Fine Amount */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <IndianRupee className="w-3.5 h-3.5" />
                                Fine Amount (Optional)
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="0.00"
                                value={formData.fineAmount}
                                onChange={(e) => setFormData({ ...formData, fineAmount: e.target.value })}
                                className="w-full bg-[#1a1c29]/50 border border-slate-700/50 rounded-[12px] px-4 py-3 text-slate-200 focus:outline-none focus:border-[#6338f0] focus:ring-1 focus:ring-[#6338f0] transition-all"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Description
                            </label>
                            <textarea
                                required
                                rows={3}
                                placeholder="Provide details about the violation..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-[#1a1c29]/50 border border-slate-700/50 rounded-[12px] px-4 py-3 text-slate-200 focus:outline-none focus:border-[#6338f0] focus:ring-1 focus:ring-[#6338f0] transition-all resize-none"
                            />
                        </div>

                        {/* Photo URL */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <ImageIcon className="w-3.5 h-3.5" />
                                Evidence Photo URL (Optional)
                            </label>
                            <input
                                type="url"
                                placeholder="https://..."
                                value={formData.photoUrl}
                                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                                className="w-full bg-[#1a1c29]/50 border border-slate-700/50 rounded-[12px] px-4 py-3 text-slate-200 focus:outline-none focus:border-[#6338f0] focus:ring-1 focus:ring-[#6338f0] transition-all"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-[12px] font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-rose-500 text-white rounded-[12px] font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                            Log Violation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
