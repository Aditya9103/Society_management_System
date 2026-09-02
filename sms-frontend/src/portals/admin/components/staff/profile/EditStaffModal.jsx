import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, User, MapPin, Briefcase, Heart } from 'lucide-react';

const TABS = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'contact', label: 'Contact & Address', icon: MapPin },
    { id: 'job', label: 'Job Details', icon: Briefcase },
    { id: 'emergency', label: 'Emergency', icon: Heart },
];

export default function EditStaffModal({ isOpen, onClose, user, profile, updateProfile, isUpdating }) {
    const [activeTab, setActiveTab] = useState('personal');
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            gender: profile?.gender || '',
            dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
            bloodGroup: profile?.bloodGroup || '',
            maritalStatus: profile?.maritalStatus || '',
            
            phone: user?.phone || '',
            alternateNumber: profile?.alternateNumber || '',
            personalEmail: profile?.personalEmail || '',
            addressLine1: profile?.addressLine1 || '',
            addressLine2: profile?.addressLine2 || '',
            city: profile?.city || '',
            state: profile?.state || '',
            pincode: profile?.pincode || '',
            landmark: profile?.landmark || '',
            
            employeeId: profile?.employeeId || '',
            department: profile?.department || '',
            employmentType: profile?.employmentType || '',
            shift: profile?.shift || '',
            salary: profile?.salary || '',
            experience: profile?.experience || '',
            
            emergencyContactName: profile?.emergencyContactName || '',
            emergencyContactRelation: profile?.emergencyContactRelation || '',
            emergencyContactNumber: profile?.emergencyContactNumber || ''
        }
    });

    if (!isOpen) return null;

    const onSubmit = async (data) => {
        // Split data into userUpdates and profileUpdates
        const userUpdates = {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
        };

        const profileUpdates = {
            gender: data.gender,
            dateOfBirth: data.dateOfBirth || null,
            bloodGroup: data.bloodGroup,
            maritalStatus: data.maritalStatus,
            alternateNumber: data.alternateNumber,
            personalEmail: data.personalEmail,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            landmark: data.landmark,
            employeeId: data.employeeId,
            department: data.department,
            employmentType: data.employmentType,
            shift: data.shift,
            salary: data.salary ? Number(data.salary) : null,
            experience: data.experience,
            emergencyContactName: data.emergencyContactName,
            emergencyContactRelation: data.emergencyContactRelation,
            emergencyContactNumber: data.emergencyContactNumber
        };

        try {
            await updateProfile({ id: user._id, data: { userUpdates, profileUpdates } }).unwrap();
            onClose();
        } catch (err) {
            console.error(err);
            alert(err?.data?.message || 'Failed to update profile');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#151921] border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Edit Staff Profile</h2>
                    <button onClick={onClose} className="p-2 text-white font-bold hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col overflow-hidden h-full">
                    {/* Tabs */}
                    <div className="flex px-6 border-b border-white/5 overflow-x-auto hide-scrollbar shrink-0">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                                        isActive ? 'border-[#6338f0] text-[#6338f0]' : 'border-transparent text-white font-bold hover:text-gray-200'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {activeTab === 'personal' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">First Name *</label>
                                    <input {...register('firstName', { required: true })} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Last Name *</label>
                                    <input {...register('lastName', { required: true })} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Gender</label>
                                    <select {...register('gender')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50 appearance-none">
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Date of Birth</label>
                                    <input type="date" {...register('dateOfBirth')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Blood Group</label>
                                    <input {...register('bloodGroup')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" placeholder="e.g. O+" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Marital Status</label>
                                    <select {...register('maritalStatus')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50 appearance-none">
                                        <option value="">Select Status</option>
                                        <option value="SINGLE">Single</option>
                                        <option value="MARRIED">Married</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Phone Number *</label>
                                    <input {...register('phone', { required: true })} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Alternate Number</label>
                                    <input {...register('alternateNumber')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Personal Email</label>
                                    <input type="email" {...register('personalEmail')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">City</label>
                                    <input {...register('city')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Address Line 1</label>
                                    <input {...register('addressLine1')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Address Line 2</label>
                                    <input {...register('addressLine2')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">State</label>
                                    <input {...register('state')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Pincode</label>
                                    <input {...register('pincode')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'job' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Employee ID</label>
                                    <input {...register('employeeId')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Department</label>
                                    <input {...register('department')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Employment Type</label>
                                    <select {...register('employmentType')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50 appearance-none">
                                        <option value="">Select Type</option>
                                        <option value="FULL_TIME">Full Time</option>
                                        <option value="PART_TIME">Part Time</option>
                                        <option value="CONTRACT">Contract</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Shift</label>
                                    <input {...register('shift')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" placeholder="e.g. 9 AM - 5 PM" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Salary (₹)</label>
                                    <input type="number" {...register('salary')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Experience</label>
                                    <input {...register('experience')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" placeholder="e.g. 5 Years" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'emergency' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Contact Name</label>
                                    <input {...register('emergencyContactName')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Relationship</label>
                                    <input {...register('emergencyContactRelation')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white font-bold uppercase tracking-wider">Contact Number</label>
                                    <input {...register('emergencyContactNumber')} className="w-full bg-[#0b0d14] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#6338f0]/50" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/10 bg-[#0b0d14]/50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-white font-bold hover:text-white hover:bg-white/5 transition-colors text-sm">
                            Cancel
                        </button>
                        <button type="submit" disabled={isUpdating} className="px-5 py-2.5 rounded-xl bg-[#6338f0] hover:bg-[#5229db] text-white font-bold text-sm transition-colors shadow-[0_0_15px_rgba(99,56,240,0.3)] disabled:opacity-50">
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
