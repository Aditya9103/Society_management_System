import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, UserPlus, Info } from 'lucide-react';
import { useCreateStaffMutation } from '../../../store/api/societyAdminApi';

const ROLE_OPTIONS = [
    { value: 'COMMITTEE_MEMBER', label: 'Committee Member' },
    { value: 'ACCOUNTANT', label: 'Accountant' },
    { value: 'FACILITY_MANAGER', label: 'Facility Manager' },
    { value: 'HELP_DESK', label: 'Help Desk' },
    { value: 'SECURITY_GUARD', label: 'Security Guard' },
];

export default function CreateStaffModal({ isOpen, onClose }) {
    const [createStaff, { isLoading }] = useCreateStaffMutation();
    const [errorMsg, setErrorMsg] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    if (!isOpen) return null;

    const onSubmit = async (formData) => {
        setErrorMsg(null);
        try {
            await createStaff(formData).unwrap();
            reset();
            onClose();
        } catch (err) {
            setErrorMsg(err?.data?.message ?? 'Failed to create staff member.');
        }
    };

    const handleClose = () => { reset(); setErrorMsg(null); onClose(); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
            <div className="bg-[#151921] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center gap-3 p-6 border-b border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-[#6338f0]/20 flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-[#6338f0]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Add Staff Member</h2>
                        <p className="text-sm text-gray-400">Create a new staff account with access.</p>
                    </div>
                    <button onClick={handleClose} className="p-2 ml-auto text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6 space-y-5 overflow-y-auto flex-1">
                    {errorMsg && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm font-semibold">
                            <Info className="w-4 h-4" />
                            {errorMsg}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">First Name *</label>
                            <input 
                                {...register('firstName', { required: true })} 
                                placeholder="First Name"
                                className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Name *</label>
                            <input 
                                {...register('lastName', { required: true })} 
                                placeholder="Last Name"
                                className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address *</label>
                        <input 
                            type="email"
                            {...register('email', { required: true })} 
                            placeholder="staff@example.com"
                            className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" 
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number *</label>
                            <input 
                                {...register('phone', { required: true })} 
                                placeholder="+91 00000 00000"
                                className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role *</label>
                            <select 
                                {...register('role', { required: true })}
                                className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50 appearance-none"
                            >
                                <option value="">Select Role</option>
                                {ROLE_OPTIONS.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-amber-500/90 text-xs font-medium">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>A secure temporary password will be auto-generated and emailed to the new staff member upon creation.</p>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={handleClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="px-5 py-2.5 rounded-xl bg-[#6338f0] hover:bg-[#5229db] text-white font-bold text-sm transition-colors shadow-[0_0_15px_rgba(99,56,240,0.3)] disabled:opacity-50 flex items-center gap-2">
                            {isLoading ? 'Creating...' : 'Create Staff Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
