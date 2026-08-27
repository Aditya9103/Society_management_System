import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Save, Trash2, Plus, Camera, Loader2, RefreshCw, Calendar, FileText, IndianRupee, MapPin, Phone, CreditCard, Users, Edit3 } from 'lucide-react';
import { setCredentials } from '../../../store/slices/authSlice';
import {
    useGetSocietyProfileQuery,
    useUpdateSocietyProfileMutation,
    useUpdateSocietyLogoMutation,
} from '../../../store/api/societyAdminApi';
import { cn } from '../../../components/ui/Button';

const EMERGENCY_TYPES = ['POLICE', 'FIRE', 'AMBULANCE', 'HOSPITAL', 'SECURITY_AGENCY', 'OTHER'];

export default function SocietyProfilePage() {
    const { user } = useSelector(s => s.auth);
    const dispatch = useDispatch();
    const { data, isLoading } = useGetSocietyProfileQuery();
    const [updateProfile, { isLoading: isSaving }] = useUpdateSocietyProfileMutation();
    const [updateLogo, { isLoading: isUpdatingLogo }] = useUpdateSocietyLogoMutation();
    const [emergencyContacts, setEmergencyContacts] = useState([]);
    const [contactsInit, setContactsInit] = useState(false);

    const society = data?.data?.society;

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (society) {
            reset(society);
        }
    }, [society, reset]);

    if (society && !contactsInit) {
        setEmergencyContacts(society.emergencyContacts ?? []);
        setContactsInit(true);
    }

    const handleLogoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('logo', file);
            await updateLogo(formData).unwrap();
            toast.success('Logo updated successfully!');
        } catch (err) {
            toast.error(err?.message || err?.data?.message || 'Failed to update logo.');
        }
    };

    const onSubmit = async (formData) => {
        try {
            const processedEmergencyContacts = emergencyContacts.map(c => {
                const copy = { ...c };
                if (copy.type !== 'OTHER') {
                    delete copy.customContactType;
                } else if (!copy.customContactType?.trim()) {
                    throw new Error('Please specify the custom contact type for all OTHER emergency contacts.');
                }
                return copy;
            });

            const payload = {
                name: formData.name || undefined,
                addressLine1: formData.addressLine1 || undefined,
                addressLine2: formData.addressLine2 || undefined,
                city: formData.city || undefined,
                state: formData.state || undefined,
                pincode: formData.pincode || undefined,
                contactEmail: formData.contactEmail || undefined,
                contactPhone: formData.contactPhone || undefined,
                establishmentYear: formData.establishmentYear ? Number(formData.establishmentYear) : undefined,
                registrationNumber: formData.registrationNumber || undefined,
                settings: {
                    billingDate: formData.billingDate ? Number(formData.billingDate) : undefined,
                    gracePeriodDays: formData.gracePeriodDays ? Number(formData.gracePeriodDays) : undefined,
                    lateFeeType: formData.lateFeeType || undefined,
                    lateFeePercentage: formData.lateFeePercentage ? Number(formData.lateFeePercentage) : undefined,
                    lateFeeFixedAmount: formData.lateFeeFixedAmount ? Number(formData.lateFeeFixedAmount) : undefined,
                    visitorApprovalMode: formData.visitorApprovalMode || undefined,
                    maxVehiclesPerUnit: formData.maxVehiclesPerUnit ? Number(formData.maxVehiclesPerUnit) : undefined,
                    maintenanceTaxPercentage: formData.maintenanceTaxPercentage ? Number(formData.maintenanceTaxPercentage) : undefined,
                    allowResidentDirectoryView: formData.allowResidentDirectoryView === 'true' || formData.allowResidentDirectoryView === true,
                    currency: formData.currency || undefined,
                },
                emergencyContacts: processedEmergencyContacts,
            };
            
            await updateProfile(payload).unwrap();
            toast.success('Changes saved successfully!');
        } catch (err) {
            toast.error(err?.message || err?.data?.message || 'Failed to save. Please try again.');
        }
    };

    const addEmergencyContact = () => setEmergencyContacts((prev) => [...prev, { name: '', phone: '', type: 'POLICE', customContactType: '' }]);
    const removeEmergencyContact = (i) => setEmergencyContacts((prev) => prev.filter((_, idx) => idx !== i));
    const updateContact = (i, field, value) => setEmergencyContacts((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    const inputClasses = "w-full bg-[#0b0c10] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
    const selectClasses = "w-full bg-[#0b0c10] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer appearance-none";
    const labelClasses = "block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5 font-medium";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="text-gray-100 space-y-4 lg:space-y-6 font-sans relative pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-white">Society Profile</h1>
                    <p className="text-gray-400 text-sm mt-1">Update your society's information and configuration</p>
                </div>
                <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            {/* Hero Banner */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-white/5 bg-[#13151a] p-5 lg:p-6 flex flex-col lg:flex-row gap-5 lg:gap-6 items-center lg:items-center group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-900/40 via-[#13151a] to-[#13151a] opacity-80 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/10 bg-[#0b0c10] shadow-2xl relative">
                        {society?.logoUrl ? (
                            <img src={society.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 bg-[#0b0c10]">
                                <Camera className="w-6 h-6 opacity-50" />
                            </div>
                        )}
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                            <Camera className="w-5 h-5 text-white" />
                            <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" disabled={isUpdatingLogo} />
                        </label>
                        {isUpdatingLogo && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-white" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start w-full">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
                        <input 
                            {...register('name')}
                            className="text-2xl font-bold text-white bg-transparent border-b border-transparent focus:border-white/20 focus:outline-none focus:ring-0 px-0 py-1 text-center lg:text-left min-w-[280px]"
                            placeholder="Society Name"
                            defaultValue={society?.name}
                        />
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-medium border border-indigo-500/30 whitespace-nowrap">
                            Registered Society
                        </span>
                    </div>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-2 w-full">
                        <div className="flex items-center gap-2.5 bg-white/5 border border-white/5 rounded-xl px-3 py-2 shrink-0">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                            <div>
                                <p className="text-[9px] text-gray-400 uppercase tracking-wide">Est. Year</p>
                                <input 
                                    {...register('establishmentYear')}
                                    className="bg-transparent text-xs font-medium text-white focus:outline-none w-12"
                                    placeholder="2010"
                                    defaultValue={society?.establishmentYear}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 bg-white/5 border border-white/5 rounded-xl px-3 py-2 shrink-0">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <div>
                                <p className="text-[9px] text-gray-400 uppercase tracking-wide">Registration No.</p>
                                <input 
                                    {...register('registrationNumber')}
                                    className="bg-transparent text-xs font-medium text-white focus:outline-none w-28"
                                    placeholder="REG-0000"
                                    defaultValue={society?.registrationNumber}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 bg-white/5 border border-white/5 rounded-xl px-3 py-2 shrink-0">
                            <IndianRupee className="w-4 h-4 text-emerald-400" />
                            <div>
                                <p className="text-[9px] text-gray-400 uppercase tracking-wide">Currency</p>
                                <select 
                                    {...register('currency')}
                                    className="bg-transparent text-xs font-medium text-white focus:outline-none appearance-none cursor-pointer"
                                    defaultValue={society?.settings?.currency ?? 'INR'}
                                >
                                    <option value="INR" className="bg-[#1a1d24]">INR - Indian Rupee</option>
                                    <option value="USD" className="bg-[#1a1d24]">USD - US Dollar</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 bg-white/5 border border-white/5 rounded-xl px-3 py-2 shrink-0">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden border border-white/10 shrink-0">
                                {user?.profilePhotoUrl ? <img src={user.profilePhotoUrl} className="w-full h-full object-cover" alt="" /> : user?.firstName?.[0]}
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-400 uppercase tracking-wide">Society Admin</p>
                                <p className="text-xs font-medium text-white">{user?.firstName} {user?.lastName}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Layout for Configuration Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                
                {/* Address Card */}
                <div className="bg-[#13151a] border border-white/5 rounded-2xl p-5 lg:p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-indigo-500/10">
                            <MapPin className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Address</h3>
                            <p className="text-xs text-gray-400">Society's physical location</p>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div>
                            <label className={labelClasses}>Address Line 1</label>
                            <input {...register('addressLine1')} className={inputClasses} placeholder="Street / Locality" defaultValue={society?.addressLine1} />
                        </div>
                        <div>
                            <label className={labelClasses}>Address Line 2 (Area / Landmark)</label>
                            <input {...register('addressLine2')} className={inputClasses} placeholder="Area / Landmark" defaultValue={society?.addressLine2} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>City</label>
                                <input {...register('city')} className={inputClasses} placeholder="City" defaultValue={society?.city} />
                            </div>
                            <div>
                                <label className={labelClasses}>State</label>
                                <input {...register('state')} className={inputClasses} placeholder="State" defaultValue={society?.state} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Pincode</label>
                            <input {...register('pincode')} className={inputClasses} placeholder="Pincode" maxLength={6} defaultValue={society?.pincode} />
                        </div>
                    </div>
                </div>

                {/* Contact Details Card */}
                <div className="bg-[#13151a] border border-white/5 rounded-2xl p-5 lg:p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Phone className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Contact Details</h3>
                            <p className="text-xs text-gray-400">How residents and visitors can reach the society</p>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div>
                            <label className={labelClasses}>Contact Email</label>
                            <input type="email" {...register('contactEmail')} className={inputClasses} placeholder="office@society.com" defaultValue={society?.contactEmail} />
                        </div>
                        <div>
                            <label className={labelClasses}>Contact Phone</label>
                            <input {...register('contactPhone')} className={inputClasses} placeholder="Phone Number" defaultValue={society?.contactPhone} />
                        </div>
                    </div>

                    <div className="mt-6 flex items-start gap-3 bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                        <div className="mt-0.5 shrink-0">
                            <Phone className="w-4 h-4 text-violet-400" />
                        </div>
                        <p className="text-xs text-violet-300 leading-relaxed">
                            These contact details will be visible to all residents and used for important communications.
                        </p>
                    </div>
                </div>

                {/* Billing & Finance Settings */}
                <div className="bg-[#13151a] border border-white/5 rounded-2xl p-5 lg:p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-rose-500/10">
                            <CreditCard className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Billing & Finance Settings</h3>
                            <p className="text-xs text-gray-400">Configure billing cycles, late fees, and maintenance</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <div>
                            <label className={labelClasses}>Billing Date (Day of Month)</label>
                            <input type="number" min={1} max={28} {...register('billingDate')} className={inputClasses} defaultValue={society?.settings?.billingDate ?? 1} />
                        </div>
                        <div>
                            <label className={labelClasses}>Grace Period (Days)</label>
                            <input type="number" min={0} {...register('gracePeriodDays')} className={inputClasses} defaultValue={society?.settings?.gracePeriodDays ?? 10} />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className={labelClasses}>Late Fee Type</label>
                            <select {...register('lateFeeType')} className={selectClasses} defaultValue={society?.settings?.lateFeeType ?? 'PERCENTAGE'}>
                                <option value="PERCENTAGE">Percentage</option>
                                <option value="FIXED">Fixed Amount</option>
                            </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className={labelClasses}>Late Fee Percentage (%)</label>
                            <input type="number" step="0.1" min={0} {...register('lateFeePercentage')} className={inputClasses} defaultValue={society?.settings?.lateFeePercentage ?? 2} />
                        </div>
                        <div>
                            <label className={labelClasses}>Late Fee Fixed Amount (₹)</label>
                            <input type="number" min={0} {...register('lateFeeFixedAmount')} className={inputClasses} defaultValue={society?.settings?.lateFeeFixedAmount ?? 0} />
                        </div>
                        <div>
                            <label className={labelClasses}>Maintenance Tax (%)</label>
                            <input type="number" step="0.1" min={0} max={100} {...register('maintenanceTaxPercentage')} className={inputClasses} defaultValue={society?.settings?.maintenanceTaxPercentage ?? 0} />
                        </div>
                    </div>

                    <div className="mt-6 flex items-start gap-3 bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                        <div className="mt-0.5 shrink-0">
                            <CreditCard className="w-4 h-4 text-violet-400" />
                        </div>
                        <p className="text-xs text-violet-300 leading-relaxed">
                            These settings will be applied to all billing cycles and invoices.
                        </p>
                    </div>
                </div>

                {/* Visitor & Resident Settings */}
                <div className="bg-[#13151a] border border-white/5 rounded-2xl p-5 lg:p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Visitor & Resident Settings</h3>
                            <p className="text-xs text-gray-400">Control visitor access and resident directory</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="col-span-2 sm:col-span-1">
                            <label className={labelClasses}>Visitor Approval</label>
                            <select {...register('visitorApprovalMode')} className={selectClasses} defaultValue={society?.settings?.visitorApprovalMode ?? 'REQUIRED'}>
                                <option value="REQUIRED">Approval Required</option>
                                <option value="AUTO_ALLOW">Auto Allow</option>
                            </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className={labelClasses}>Max Vehicles Per Unit</label>
                            <input type="number" min={0} {...register('maxVehiclesPerUnit')} className={inputClasses} defaultValue={society?.settings?.maxVehiclesPerUnit ?? 2} />
                        </div>
                        <div className="col-span-2">
                            <label className={labelClasses}>Resident Directory Visible</label>
                            <select {...register('allowResidentDirectoryView')} className={selectClasses} defaultValue={society?.settings?.allowResidentDirectoryView ? 'true' : 'false'}>
                                <option value="true">Yes — Residents can view directory</option>
                                <option value="false">No — Directory hidden</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="mt-0.5 shrink-0">
                            <Users className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-xs text-blue-300 leading-relaxed">
                            These settings help manage security and privacy within the society.
                        </p>
                    </div>
                </div>

                {/* Emergency Contacts - Full Width */}
                <div className="lg:col-span-2 bg-[#13151a] border border-white/5 rounded-2xl p-5 lg:p-6 flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Phone className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Emergency Contacts</h3>
                                <p className="text-xs text-gray-400">Quick-dial numbers for emergencies</p>
                            </div>
                        </div>
                        <button 
                            type="button" 
                            onClick={addEmergencyContact}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-sm font-medium hover:bg-white/10 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Contact
                        </button>
                    </div>

                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="text-[10px] uppercase tracking-wider text-gray-500 bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-4 py-3 font-medium rounded-tl-lg">Name / Department</th>
                                    <th className="px-4 py-3 font-medium">Phone Number</th>
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium rounded-tr-lg w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emergencyContacts.map((contact, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 group transition-colors">
                                        <td className="px-4 py-3">
                                            <input 
                                                value={contact.name}
                                                onChange={(e) => updateContact(i, 'name', e.target.value)}
                                                className="bg-transparent text-gray-200 placeholder-gray-600 focus:outline-none w-full font-medium"
                                                placeholder="Name..."
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input 
                                                value={contact.phone}
                                                onChange={(e) => updateContact(i, 'phone', e.target.value)}
                                                className="bg-transparent text-gray-300 placeholder-gray-600 focus:outline-none w-full"
                                                placeholder="Number..."
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-2">
                                                <select
                                                    value={contact.type}
                                                    onChange={(e) => updateContact(i, 'type', e.target.value)}
                                                    className="bg-[#0b0c10] border border-white/10 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none cursor-pointer"
                                                >
                                                    {EMERGENCY_TYPES.map((t) => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                                {contact.type === 'OTHER' && (
                                                    <input
                                                        value={contact.customContactType || ''}
                                                        onChange={(e) => updateContact(i, 'customContactType', e.target.value)}
                                                        className="bg-[#0b0c10] border border-white/10 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none"
                                                        placeholder="Specify..."
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center text-gray-400 cursor-not-allowed">
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeEmergencyContact(i)}
                                                    className="w-7 h-7 rounded bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {emergencyContacts.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                            No emergency contacts configured yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </form>
    );
}
