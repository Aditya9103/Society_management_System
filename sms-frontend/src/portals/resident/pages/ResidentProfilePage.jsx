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
} from '../../../store/api/residentApi';
import { setCredentials } from '../../../store/slices/authSlice';
import {
    User, Phone, Mail, Home, Building2, Edit2, Plus, Trash2,
    CheckCircle2, X, Save, Users, RefreshCw, AlertCircle,
} from 'lucide-react';

// ── Relation badge colors ─────────────────────────────────────────────────────
const RELATION_COLORS = {
    SPOUSE: 'bg-pink-100 text-pink-700',
    CHILD: 'bg-blue-100 text-blue-700',
    PARENT: 'bg-amber-100 text-amber-700',
    SIBLING: 'bg-purple-100 text-purple-700',
    GRANDPARENT: 'bg-emerald-100 text-emerald-700',
    OTHER: 'bg-slate-100 text-slate-600',
};

// ── Family member card ────────────────────────────────────────────────────────
function FamilyMemberCard({ member, onDelete }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        await onDelete(member._id);
        setDeleting(false);
    };

    return (
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                    {member.name?.[0]?.toUpperCase()}
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RELATION_COLORS[member.relation] ?? RELATION_COLORS.OTHER}`}>
                        {member.relation}
                    </span>
                </div>
            </div>
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
            >
                {deleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
        </div>
    );
}

// ── Add family member modal ────────────────────────────────────────────────────
function AddMemberModal({ onClose, onAdd }) {
    const [form, setForm] = useState({ name: '', relation: 'SPOUSE', phone: '', gender: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return setError('Name is required');
        setLoading(true);
        try {
            await onAdd(form);
            onClose();
        } catch {
            setError('Failed to add family member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-slate-800 text-lg">Add Family Member</h3>
                    <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
                </div>
                {error && <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name *</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="Family member's name" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Relation *</label>
                            <select value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                {['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDPARENT', 'OTHER'].map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Gender</label>
                            <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                <option value="">— Select —</option>
                                {['MALE', 'FEMALE', 'OTHER'].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
                        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="+91 XXXXXXXXXX" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={loading}
                            className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null} Add Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ResidentProfilePage() {
    const { user } = useSelector(s => s.auth);
    const dispatch = useDispatch();
    const { data, isLoading } = useGetMyProfileQuery();
    const [updateMyProfile, { isLoading: isSaving }] = useUpdateMyProfileMutation();
    const [addFamilyMember] = useAddFamilyMemberMutation();
    const [deleteFamilyMember] = useDeleteFamilyMemberMutation();

    const profile = data?.data?.profile;
    const unit = profile?.unitId;
    const society = profile?.societyId;
    const familyMembers = profile?.familyMembers ?? [];

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
    const [saveMsg, setSaveMsg] = useState('');
    const [showAddMember, setShowAddMember] = useState(false);

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
        </div>
    );
}
