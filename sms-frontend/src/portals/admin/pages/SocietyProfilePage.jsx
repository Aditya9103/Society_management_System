/**
 * SocietyProfilePage.jsx — Society settings & profile editor.
 *
 * Allows Society Admin to update:
 *   - Basic info (name, registration, year, currency)
 *   - Address
 *   - Contact details
 *   - Billing & finance settings
 *   - Visitor & resident settings
 *   - Emergency contacts (add / remove / edit inline)
 *
 * Uses global components: Input, Select, Button, Alert, PageHeader, Card.
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Save, Trash2, Plus, Camera, Loader2, RefreshCw } from 'lucide-react';
import { setCredentials } from '../../../store/slices/authSlice';
import {
    useGetSocietyProfileQuery,
    useUpdateSocietyProfileMutation,
    useUpdateSocietyLogoMutation,
    useUpdateMyAvatarMutation,
} from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import Alert from '../../../components/ui/Alert';
import PageHeader from '../../../components/ui/PageHeader';
import Section from '../components/profile/Section';
import Field from '../components/profile/Field';

const EMERGENCY_TYPES = ['POLICE', 'FIRE', 'AMBULANCE', 'HOSPITAL', 'SECURITY_AGENCY', 'OTHER'];


export default function SocietyProfilePage() {
    const { user } = useSelector(s => s.auth);
    const dispatch = useDispatch();
    const { data, isLoading } = useGetSocietyProfileQuery();
    const [updateProfile, { isLoading: isSaving }] = useUpdateSocietyProfileMutation();
    const [updateLogo, { isLoading: isUpdatingLogo }] = useUpdateSocietyLogoMutation();
    const [updateMyAvatar, { isLoading: isUpdatingAvatar }] = useUpdateMyAvatarMutation();
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [emergencyContacts, setEmergencyContacts] = useState([]);
    const [contactsInit, setContactsInit] = useState(false);

    const society = data?.data?.society;
    const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;

    const { register, handleSubmit, reset } = useForm();

    // Populate form fields properly when data loads or updates
    React.useEffect(() => {
        if (society) {
            reset(society);
        }
    }, [society, reset]);

    const handleLogoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setSaveError('');
            const formData = new FormData();
            formData.append('logo', file);
            await updateLogo(formData).unwrap();
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setSaveError(err?.message || err?.data?.message || 'Failed to update logo.');
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await updateMyAvatar(formData).unwrap();
            
            // Instantly update Redux auth state
            if (res?.data?.user) {
                dispatch(setCredentials({ user: res.data.user, accessToken: localStorage.getItem('accessToken') }));
            }
        } catch (error) {
            console.error('Failed to update avatar:', error);
            alert('Failed to update avatar.');
        }
    };

    // Initialize emergency contacts once data arrives
    if (society && !contactsInit) {
        setEmergencyContacts(society.emergencyContacts ?? []);
        setContactsInit(true);
    }

    const onSubmit = async (formData) => {
        setSaveError('');
        setSaveSuccess(false);
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
                    allowResidentDirectoryView: formData.allowResidentDirectoryView === 'true',
                    currency: formData.currency || undefined,
                },
                emergencyContacts: processedEmergencyContacts,
            };
            await updateProfile(payload).unwrap();
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setSaveError(err?.message || err?.data?.message || 'Failed to save. Please try again.');
        }
    };

    const addEmergencyContact = () =>
        setEmergencyContacts((prev) => [...prev, { name: '', phone: '', type: 'POLICE', customContactType: '' }]);

    const removeEmergencyContact = (i) =>
        setEmergencyContacts((prev) => prev.filter((_, idx) => idx !== i));

    const updateContact = (i, field, value) =>
        setEmergencyContacts((prev) =>
            prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
        );

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-100" />
                ))}
            </div>
        );
    }

    const s = society;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <PageHeader
                title="Society Profile"
                subtitle="Update your society's information and configuration"
                actions={
                    <Button type="submit" isLoading={isSaving} className="gap-2">
                        <Save className="h-4 w-4" /> Save Changes
                    </Button>
                }
            />

            {saveSuccess && <Alert type="success">Changes saved successfully!</Alert>}
            {saveError && <Alert type="error">{saveError}</Alert>}

            {/* Admin Personal Profile */}
            <Section title="My Admin Account" description="Manage your personal profile and avatar">
                <div className="flex items-center gap-5">
                    <div className="relative group flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-bold text-white shadow-lg overflow-hidden cursor-pointer">
                        {user?.profilePhotoUrl ? (
                            <img src={user.profilePhotoUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <>{initials}</>
                        )}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Plus className="h-6 w-6 text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUpdatingAvatar} />
                        </label>
                        {isUpdatingAvatar && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                <RefreshCw className="h-5 w-5 animate-spin text-white" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-900">{user?.firstName} {user?.lastName}</h4>
                        <p className="text-sm text-slate-500">{user?.email}</p>
                        <p className="text-xs font-semibold text-indigo-600 mt-1 uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
                    </div>
                </div>
            </Section>

            {/* Basic Info */}
            <Section title="Basic Information" description="General details about your society">
                {/* Logo Upload */}
                <div className="mb-6 flex items-center gap-6">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md">
                        {s?.logoUrl ? (
                            <img src={s.logoUrl} alt="Society Logo" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
                                <Camera className="h-8 w-8 opacity-50" />
                            </div>
                        )}
                        {isUpdatingLogo && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-900">Society Logo</h4>
                        <p className="mt-1 text-xs text-slate-500">
                            Square image recommended. Max 5MB.
                        </p>
                        <div className="mt-3 relative">
                            <input
                                type="file"
                                id="logo-upload"
                                className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={handleLogoChange}
                                disabled={isUpdatingLogo}
                            />
                            <Button type="button" variant="outline" size="sm" className="pointer-events-none gap-2">
                                <Camera className="h-4 w-4" /> Change Logo
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Society Name">
                        <Input defaultValue={s?.name} {...register('name')} placeholder="Society name" />
                    </Field>
                    <Field label="Registration Number">
                        <Input defaultValue={s?.registrationNumber} {...register('registrationNumber')} placeholder="Reg. number (optional)" />
                    </Field>
                    <Field label="Establishment Year">
                        <Input type="number" defaultValue={s?.establishmentYear} {...register('establishmentYear')} placeholder="e.g. 2010" />
                    </Field>
                    <Field label="Currency">
                        <Select defaultValue={s?.settings?.currency ?? 'INR'} {...register('currency')}>
                            <option value="INR">INR — Indian Rupee</option>
                            <option value="USD">USD — US Dollar</option>
                            <option value="EUR">EUR — Euro</option>
                        </Select>
                    </Field>
                </div>
            </Section>

            {/* Address */}
            <Section title="Address" description="Society's physical location">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Field label="Address Line 1">
                            <Input defaultValue={s?.addressLine1} {...register('addressLine1')} placeholder="Street / Locality" />
                        </Field>
                    </div>
                    <Field label="Address Line 2">
                        <Input defaultValue={s?.addressLine2} {...register('addressLine2')} placeholder="Area / Landmark (optional)" />
                    </Field>
                    <Field label="City">
                        <Input defaultValue={s?.city} {...register('city')} placeholder="City" />
                    </Field>
                    <Field label="State">
                        <Input defaultValue={s?.state} {...register('state')} placeholder="State" />
                    </Field>
                    <Field label="Pincode">
                        <Input defaultValue={s?.pincode} {...register('pincode')} placeholder="6-digit pincode" maxLength={6} />
                    </Field>
                </div>
            </Section>

            {/* Contact */}
            <Section title="Contact Details" description="How residents and visitors can reach the society office">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Contact Email">
                        <Input type="email" defaultValue={s?.contactEmail} {...register('contactEmail')} placeholder="office@society.com" />
                    </Field>
                    <Field label="Contact Phone">
                        <Input defaultValue={s?.contactPhone} {...register('contactPhone')} placeholder="+91 XXXXXXXXXX" />
                    </Field>
                </div>
            </Section>

            {/* Billing Settings */}
            <Section title="Billing & Finance Settings" description="Configure billing cycles, late fees, and maintenance">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Billing Date (day of month)">
                        <Input type="number" min={1} max={28} defaultValue={s?.settings?.billingDate ?? 1} {...register('billingDate')} />
                    </Field>
                    <Field label="Grace Period (days)">
                        <Input type="number" min={0} defaultValue={s?.settings?.gracePeriodDays ?? 10} {...register('gracePeriodDays')} />
                    </Field>
                    <Field label="Late Fee Type">
                        <Select defaultValue={s?.settings?.lateFeeType ?? 'PERCENTAGE'} {...register('lateFeeType')}>
                            <option value="PERCENTAGE">Percentage</option>
                            <option value="FIXED">Fixed Amount</option>
                        </Select>
                    </Field>
                    <Field label="Late Fee Percentage (%)">
                        <Input type="number" min={0} step="0.1" defaultValue={s?.settings?.lateFeePercentage ?? 2} {...register('lateFeePercentage')} />
                    </Field>
                    <Field label="Late Fee Fixed Amount (₹)">
                        <Input type="number" min={0} defaultValue={s?.settings?.lateFeeFixedAmount ?? 0} {...register('lateFeeFixedAmount')} />
                    </Field>
                    <Field label="Maintenance Tax (%)">
                        <Input type="number" min={0} max={100} step="0.1" defaultValue={s?.settings?.maintenanceTaxPercentage ?? 0} {...register('maintenanceTaxPercentage')} />
                    </Field>
                </div>
            </Section>

            {/* Visitor & Resident Settings */}
            <Section title="Visitor & Resident Settings" description="Control visitor access and resident directory">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Visitor Approval">
                        <Select defaultValue={s?.settings?.visitorApprovalMode ?? 'REQUIRED'} {...register('visitorApprovalMode')}>
                            <option value="REQUIRED">Approval Required</option>
                            <option value="AUTO_ALLOW">Auto Allow</option>
                        </Select>
                    </Field>
                    <Field label="Max Vehicles per Unit">
                        <Input type="number" min={0} defaultValue={s?.settings?.maxVehiclesPerUnit ?? 2} {...register('maxVehiclesPerUnit')} />
                    </Field>
                    <Field label="Resident Directory Visible">
                        <Select defaultValue={s?.settings?.allowResidentDirectoryView ? 'true' : 'false'} {...register('allowResidentDirectoryView')}>
                            <option value="true">Yes — Residents can view directory</option>
                            <option value="false">No — Directory hidden</option>
                        </Select>
                    </Field>
                </div>
            </Section>

            {/* Emergency Contacts */}
            <Section title="Emergency Contacts" description="Quick-dial numbers for emergencies">
                <div className="space-y-3">
                    {emergencyContacts.map((contact, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200">
                            <div className="grid flex-1 gap-2 sm:grid-cols-3">
                                <Input
                                    value={contact.name}
                                    onChange={(e) => updateContact(i, 'name', e.target.value)}
                                    placeholder="Contact name"
                                />
                                <Input
                                    value={contact.phone}
                                    onChange={(e) => updateContact(i, 'phone', e.target.value)}
                                    placeholder="Phone number"
                                />
                                <Select
                                    value={contact.type}
                                    onChange={(e) => updateContact(i, 'type', e.target.value)}
                                >
                                    {EMERGENCY_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </Select>
                                {contact.type === 'OTHER' && (
                                    <Input
                                        value={contact.customContactType || ''}
                                        onChange={(e) => updateContact(i, 'customContactType', e.target.value)}
                                        placeholder="e.g. Plumber"
                                    />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeEmergencyContact(i)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addEmergencyContact}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600"
                    >
                        <Plus className="h-4 w-4" /> Add Emergency Contact
                    </button>
                </div>
            </Section>
        </form>
    );
}
