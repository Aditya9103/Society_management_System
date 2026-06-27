/**
 * ResidentProfilePage.jsx — View/edit profile + manage family members.
 */
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    useGetMyProfileQuery,
    useUpdateMyProfileMutation,
    useAddFamilyMemberMutation,
    useDeleteFamilyMemberMutation,
    useGetMyDomesticStaffQuery,
    useAddDomesticStaffMutation,
    useRemoveDomesticStaffMutation,
} from '../../../store/api/residentApi';
import { setCredentials } from '../../../store/slices/authSlice';
import { residentApi } from '../../../store/api/residentApi';
import {
    User, Phone, Mail, Home, Building2, Edit2, Plus, Trash2,
    CheckCircle2, X, Save, Users, RefreshCw, AlertCircle, Briefcase, QrCode
} from 'lucide-react';

import { FamilyMemberCard } from '../components/profile/FamilyMemberCard';
import { AddMemberModal } from '../components/profile/AddMemberModal';
import { DomesticStaffCard } from '../components/profile/DomesticStaffCard';
import { AddDomesticStaffModal } from '../components/profile/AddDomesticStaffModal';
import { AddEmergencyContactModal } from '../components/profile/AddEmergencyContactModal';
import { EmergencyContactCard } from '../components/profile/EmergencyContactCard';

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ResidentProfilePage() {
    const { user } = useSelector(s => s.auth);
    const dispatch = useDispatch();
    const { data, isLoading } = useGetMyProfileQuery();
    const { data: staffData } = useGetMyDomesticStaffQuery();
    const [updateMyProfile, { isLoading: isSaving }] = useUpdateMyProfileMutation();
    const [addFamilyMember] = useAddFamilyMemberMutation();
    const [deleteFamilyMember] = useDeleteFamilyMemberMutation();
    const [addDomesticStaff] = useAddDomesticStaffMutation();
    const [removeDomesticStaff] = useRemoveDomesticStaffMutation();
    const [addEmergencyContact] = residentApi.endpoints.addEmergencyContact.useMutation();
    const [deleteEmergencyContact] = residentApi.endpoints.deleteEmergencyContact.useMutation();

    const profile = data?.data?.profile;
    const unit = profile?.unitId;
    const society = profile?.societyId;
    const familyMembers = profile?.familyMembers ?? [];
    const emergencyContacts = profile?.emergencyContacts ?? [];
    const domesticStaffList = staffData?.data ?? [];

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
    const [saveMsg, setSaveMsg] = useState('');
    const [showAddMember, setShowAddMember] = useState(false);
    const [showAddContact, setShowAddContact] = useState(false);
    const [showAddStaff, setShowAddStaff] = useState(false);

    const startEdit = () => {
        setForm({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' });
        setEditing(true);
        setSaveMsg('');
    };

    const handleSave = async () => {
        try {
            const res = await updateMyProfile(form).unwrap();
            // Update local auth state so header reflects new name immediately
            dispatch(setCredentials({ user: { ...user, ...form }, accessToken: localStorage.getItem('accessToken') }));
            setEditing(false);
            setSaveMsg('Profile saved!');
            setTimeout(() => setSaveMsg(''), 3000);
        } catch {
            setSaveMsg('Failed to save.');
        }
    };

    const handleAddMember = async (memberData) => {
        await addFamilyMember(memberData).unwrap();
    };

    const handleDeleteMember = async (memberId) => {
        await deleteFamilyMember(memberId).unwrap();
    };

    const handleAddContact = async (contactData) => {
        await addEmergencyContact(contactData).unwrap();
    };

    const handleDeleteContact = async (contactId) => {
        await deleteEmergencyContact(contactId).unwrap();
    };

    const handleAddStaff = async (staffInfo) => {
        const formData = new FormData();
        formData.append('name', staffInfo.name);
        formData.append('role', staffInfo.role);
        if (staffInfo.phone) formData.append('phone', staffInfo.phone);
        if (staffInfo.photoFile) formData.append('photo', staffInfo.photoFile);
        
        await addDomesticStaff(formData).unwrap();
    };

    const handleDeleteStaff = async (staffId) => {
        await removeDomesticStaff(staffId).unwrap();
    };

    if (isLoading) {
        return <div className="flex min-h-[60vh] items-center justify-center"><RefreshCw className="h-7 w-7 animate-spin text-indigo-400" /></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg">
                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white text-2xl font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-indigo-200 text-xs mb-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Verified Resident
                        </div>
                        <h1 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h1>
                        <p className="text-sm text-indigo-200">{user?.email}</p>
                    </div>
                </div>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            </div>

            {saveMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
                    <CheckCircle2 className="h-4 w-4" /> {saveMsg}
                </div>
            )}

            {/* Personal Info */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2"><User className="h-5 w-5 text-indigo-500" /> Personal Info</h2>
                    {!editing
                        ? <button onClick={startEdit} className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition">
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </button>
                        : <div className="flex gap-2">
                            <button onClick={() => setEditing(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={handleSave} disabled={isSaving}
                                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                                {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                            </button>
                          </div>
                    }
                </div>

                {editing ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[['firstName', 'First Name'], ['lastName', 'Last Name']].map(([key, label]) => (
                            <div key={key}>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                            </div>
                        ))}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
                            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600"><Mail className="h-4 w-4 text-slate-400 shrink-0" />{user?.email}</div>
                        {user?.phone && <div className="flex items-center gap-2 text-slate-600"><Phone className="h-4 w-4 text-slate-400 shrink-0" />{user?.phone}</div>}
                        <div className="flex items-center gap-2 text-slate-600"><User className="h-4 w-4 text-slate-400 shrink-0" /><span className="font-mono">{profile?.residentCode ?? '—'}</span></div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${profile?.ownershipType === 'OWNER' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {profile?.ownershipType ?? '—'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Unit & Society (read-only) */}
            {unit && (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                        <div className="flex items-center gap-2 mb-3"><Home className="h-5 w-5 text-violet-500" /><p className="font-semibold text-slate-800">My Unit</p></div>
                        <p className="text-2xl font-bold text-slate-900">{unit.unitNumber}</p>
                        <p className="text-sm text-slate-500 mt-1">{unit.bhkType} · {unit.unitType}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                        <div className="flex items-center gap-2 mb-3"><Building2 className="h-5 w-5 text-blue-500" /><p className="font-semibold text-slate-800">Society</p></div>
                        <p className="font-semibold text-slate-900">{society?.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{society?.city}, {society?.state}</p>
                    </div>
                </div>
            )}

            {/* Family Members */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2"><Users className="h-5 w-5 text-indigo-500" /> Family Members <span className="text-xs font-normal text-slate-400">({familyMembers.length})</span></h2>
                    <button onClick={() => setShowAddMember(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition">
                        <Plus className="h-3.5 w-3.5" /> Add Member
                    </button>
                </div>

                {familyMembers.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-6">No family members added yet.</p>
                ) : (
                    <div className="space-y-2">
                        {familyMembers.filter(m => m.isActive !== false).map(m => (
                            <FamilyMemberCard key={m._id} member={m} onDelete={handleDeleteMember} />
                        ))}
                    </div>
                )}
            </div>

            {showAddMember && (
                <AddMemberModal onClose={() => setShowAddMember(false)} onAdd={handleAddMember} />
            )}

            {/* Emergency Contacts */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" /> Emergency Contacts 
                        <span className="text-xs font-normal text-slate-400">({emergencyContacts.length}/10)</span>
                    </h2>
                    {emergencyContacts.length < 10 && (
                        <button onClick={() => setShowAddContact(true)}
                            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition">
                            <Plus className="h-3.5 w-3.5" /> Add Contact
                        </button>
                    )}
                </div>

                {emergencyContacts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">No emergency contacts</p>
                        <p className="mt-1 text-xs text-slate-400">Add family members to receive SOS alerts via email & phone.</p>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {emergencyContacts.map(c => (
                            <EmergencyContactCard key={c._id} contact={c} onDelete={handleDeleteContact} />
                        ))}
                    </div>
                )}
            </div>

            {showAddContact && (
                <AddEmergencyContactModal onClose={() => setShowAddContact(false)} onAdd={handleAddContact} />
            )}

            {/* Domestic Staff */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2"><Briefcase className="h-5 w-5 text-emerald-500" /> Domestic Staff <span className="text-xs font-normal text-slate-400">({domesticStaffList.length})</span></h2>
                    <button onClick={() => setShowAddStaff(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition">
                        <Plus className="h-3.5 w-3.5" /> Add Staff
                    </button>
                </div>

                {domesticStaffList.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-6">No domestic staff added yet.</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {domesticStaffList.map(s => (
                            <DomesticStaffCard key={s._id} staff={s} onDelete={handleDeleteStaff} />
                        ))}
                    </div>
                )}
            </div>

            {showAddStaff && (
                <AddDomesticStaffModal onClose={() => setShowAddStaff(false)} onAdd={handleAddStaff} />
            )}
        </div>
    );
}
