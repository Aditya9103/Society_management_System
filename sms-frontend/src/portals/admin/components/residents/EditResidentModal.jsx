import React, { useState } from 'react';
import { X, User, Phone, MapPin, Briefcase, FileText, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUpdateResidentProfileMutation } from '../../../../store/api/societyAdminApi';

export default function EditResidentModal({ resident, onClose, onSuccess }) {
    const { user, residentDetails } = resident;
    const [updateResident, { isLoading }] = useUpdateResidentProfileMutation();

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user?.gender || '',
        nationality: user?.nationality || 'Indian',
        occupation: residentDetails?.occupation || '',
        bloodGroup: residentDetails?.bloodGroup || '',
        panNumber: residentDetails?.panNumber || '',
        aadhaarNumber: residentDetails?.aadhaarNumber || '',
        maritalStatus: residentDetails?.maritalStatus || ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Clean up empty strings to undefined or keep them if backend supports
            const payload = { ...formData };
            if (!payload.dateOfBirth) delete payload.dateOfBirth;

            await updateResident({ 
                id: user._id, 
                data: payload 
            }).unwrap();
            
            toast.success('Resident details updated successfully!');
            onSuccess();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to update resident details');
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0c0d14] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
                <div className="sticky top-0 z-10 bg-[#0c0d14]/90 backdrop-blur-md border-b border-white/5 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Edit Resident</h2>
                        <p className="text-sm text-white font-bold mt-1">Update personal and contact information.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                        <X className="w-5 h-5 text-white font-bold" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Personal Info */}
                    <section>
                        <h3 className="text-sm font-bold text-white font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-[#6338f0]" /> Personal Info
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-white font-bold mb-1">First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-[#151722] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6338f0] transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs text-white font-bold mb-1">Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-[#151722] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6338f0] transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs text-white font-bold mb-1">Date of Birth</label>
                                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full bg-[#151722] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6338f0] transition-colors [color-scheme:dark]" />
                            </div>
                            <div>
                                <label className="block text-xs text-white font-bold mb-1">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-[#151722] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6338f0] transition-colors">
                                    <option value="">Select Gender</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-white font-bold mb-1">Marital Status</label>
                                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full bg-[#151722] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6338f0] transition-colors">
                                    <option value="">Select Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-white font-bold mb-1">Nationality</label>
                                <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="w-full bg-[#151722] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6338f0] transition-colors" />
                            </div>
                        </div>
                    </section>

                    {/* Contact Info */}
                    <section>
                        <h3 className="text-sm font-bold text-white font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-[#6338f0]" /> Contact Info
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-white font-bold mb-1">Phone Number</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#151722] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6338f0] transition-colors" />
                            </div>
                            <div className="opacity-50 cursor-not-allowed">
                                <label className="block text-xs text-white font-bold mb-1">Email (Immutable)</label>
                                <input type="text" value={user?.email || ''} readOnly className="w-full bg-[#151722] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none cursor-not-allowed" />
                            </div>
                        </div>
                    </section>

                    {/* Additional Details */}
                    <section>
                        <h3 className="text-sm font-bold text-white font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#6338f0]" /> Legal & Extra Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-white font-bold mb-1">Occupation</label>
                                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full bg-[#151722] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6338f0] transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs text-white font-bold mb-1">Blood Group</label>
                                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full bg-[#151722] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6338f0] transition-colors">
                                    <option value="">Select</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-white font-bold mb-1">PAN Number</label>
                                <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} className="w-full bg-[#151722] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6338f0] transition-colors uppercase" />
                            </div>
                            <div>
                                <label className="block text-xs text-white font-bold mb-1">Aadhaar Number</label>
                                <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} className="w-full bg-[#151722] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6338f0] transition-colors" />
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center gap-3 justify-end pt-4 border-t border-white/5">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-white font-bold hover:text-white transition-colors cursor-pointer">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-[#6338f0] text-white text-sm font-bold rounded-xl hover:bg-[#5229db] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
