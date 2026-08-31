/**
 * ResidentProfilePage.jsx — View/edit profile + manage family members.
 */
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import {
    useGetMyProfileQuery,
    useUpdateMyProfileMutation,
    useUpdateMyAvatarMutation,
    useAddFamilyMemberMutation,
    useDeleteFamilyMemberMutation,
    useGetMyDomesticStaffQuery,
    useAddDomesticStaffMutation,
    useRemoveDomesticStaffMutation,
} from '../../../store/api/residentApi';
import { setCredentials } from '../../../store/slices/authSlice';
import { residentApi } from '../../../store/api/residentApi';
import { useEmailIdCardMutation } from '../../../store/api/idCardApi';
import {
    User, Home, Edit2, Plus, Users, RefreshCw, AlertCircle, Briefcase, FileText, Settings, MoreHorizontal, ChevronLeft
} from 'lucide-react';

import { FamilyMemberCard } from '../components/profile/FamilyMemberCard';
import { AddMemberModal } from '../components/profile/AddMemberModal';
import { DomesticStaffCard } from '../components/profile/DomesticStaffCard';
import { AddDomesticStaffModal } from '../components/profile/AddDomesticStaffModal';
import { AddEmergencyContactModal } from '../components/profile/AddEmergencyContactModal';
import { EmergencyContactCard } from '../components/profile/EmergencyContactCard';

// Components
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { PersonalInfoTab } from '../components/profile/PersonalInfoTab';
import { UnitInfoTab } from '../components/profile/UnitInfoTab';
import { MobileBottomNav } from '../components/profile/MobileBottomNav';

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ResidentProfilePage() {
    const { user } = useSelector(s => s.auth);
    const dispatch = useDispatch();
    const { data, isLoading } = useGetMyProfileQuery();
    const { data: staffData } = useGetMyDomesticStaffQuery();
    const [updateMyProfile, { isLoading: isSaving }] = useUpdateMyProfileMutation();
    const [updateMyAvatar, { isLoading: isUpdatingAvatar }] = useUpdateMyAvatarMutation();
    const [addFamilyMember] = useAddFamilyMemberMutation();
    const [deleteFamilyMember] = useDeleteFamilyMemberMutation();
    const [addDomesticStaff] = useAddDomesticStaffMutation();
    const [removeDomesticStaff] = useRemoveDomesticStaffMutation();
    const [addEmergencyContact] = residentApi.endpoints.addEmergencyContact.useMutation();
    const [deleteEmergencyContact] = residentApi.endpoints.deleteEmergencyContact.useMutation();
    const [emailIdCard, { isLoading: isEmailingIdCard }] = useEmailIdCardMutation();

    const profile = data?.data?.profile;
    const unit = profile?.unitId;
    const society = profile?.societyId;
    const familyMembers = profile?.familyMembers ?? [];
    const emergencyContacts = profile?.emergencyContacts ?? [];
    const domesticStaffList = staffData?.data ?? [];

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ 
        firstName: '', lastName: '', phone: '', dateOfBirth: '', gender: '', nationality: '',
        occupation: '', bloodGroup: '', panNumber: '', aadhaarNumber: '', maritalStatus: ''
    });
    const [saveMsg, setSaveMsg] = useState('');
    const [showAddMember, setShowAddMember] = useState(false);
    const [showAddContact, setShowAddContact] = useState(false);
    const [showAddStaff, setShowAddStaff] = useState(false);

    const [activeTab, setActiveTab] = useState('personal');

    const startEdit = () => {
        setForm({ 
            firstName: user?.firstName ?? '', 
            lastName: user?.lastName ?? '', 
            phone: user?.phone ?? '',
            dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            gender: user?.gender ?? '',
            nationality: user?.nationality ?? 'Indian',
            occupation: profile?.occupation ?? '',
            bloodGroup: profile?.bloodGroup ?? '',
            panNumber: profile?.panNumber ?? '',
            aadhaarNumber: profile?.aadhaarNumber ?? '',
            maritalStatus: profile?.maritalStatus ?? ''
        });
        setEditing(true);
        setSaveMsg('');
    };

    const handleSave = async () => {
        try {
            const payload = { ...form };
            if (!payload.dateOfBirth) delete payload.dateOfBirth;
            const res = await updateMyProfile(payload).unwrap();
            dispatch(setCredentials({ user: { ...user, ...form }, accessToken: localStorage.getItem('accessToken') }));
            setEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to update profile.');
        }
    };

    const handleAddMember = async (memberData) => { await addFamilyMember(memberData).unwrap(); };
    const handleDeleteMember = async (memberId) => { await deleteFamilyMember(memberId).unwrap(); };
    const handleAddContact = async (contactData) => { await addEmergencyContact(contactData).unwrap(); };
    const handleDeleteContact = async (contactId) => { await deleteEmergencyContact(contactId).unwrap(); };
    const handleAddStaff = async (staffInfo) => {
        const formData = new FormData();
        formData.append('name', staffInfo.name);
        formData.append('role', staffInfo.role);
        if (staffInfo.phone) formData.append('phone', staffInfo.phone);
        if (staffInfo.photoFile) formData.append('photo', staffInfo.photoFile);
        await addDomesticStaff(formData).unwrap();
    };
    const handleDeleteStaff = async (staffId) => { await removeDomesticStaff(staffId).unwrap(); };
    const handleEmailIdCard = async () => {
        try {
            await emailIdCard().unwrap();
            toast.success('ID Card sent to your email successfully!');
        } catch (error) {
            toast.error('Failed to send ID Card to email.');
        }
    };
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await updateMyAvatar(formData).unwrap();
            if (res?.data?.user) {
                dispatch(setCredentials({ user: res.data.user, accessToken: localStorage.getItem('accessToken') }));
            }
        } catch (error) {
            toast.error('Failed to update avatar.');
        }
    };

    if (isLoading) {
        return <div className="flex min-h-[60vh] items-center justify-center"><RefreshCw className="h-7 w-7 animate-spin text-indigo-400" /></div>;
    }

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'unit', label: 'My Unit', icon: Home },
        { id: 'family', label: 'Family Members', icon: Users },
        { id: 'docs', label: 'Documents', icon: FileText },
        { id: 'emergency', label: 'Emergency Contacts', icon: AlertCircle },
        { id: 'preferences', label: 'Preferences', icon: Settings },
    ];
    
    const mobileTabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'unit', label: 'My Unit', icon: Home },
        { id: 'family', label: 'Family', icon: Users },
        { id: 'docs', label: 'Docs', icon: FileText },
        { id: 'emergency', label: 'More', icon: MoreHorizontal },
    ];

    return (
        <div className="pb-24 lg:pb-8 text-white relative z-10 max-w-full overflow-hidden w-full overflow-y-auto"> 
            {/* Mobile Header (Sticky) */}
            <div className="lg:hidden flex items-center justify-between py-4 sticky top-0 z-50 bg-[#0a0b12]/95 backdrop-blur-md mb-2">
                <button className="text-white hover:text-slate-300 transition-colors"><ChevronLeft size={24} /></button>
                <h1 className="text-[17px] font-bold text-white tracking-wide">My Profile</h1>
                <button className="text-white hover:text-slate-300 transition-colors">
                    <Settings size={22} />
                </button>
            </div>

            {/* Desktop Header Text */}
            <div className="hidden lg:flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">My Profile</h1>
                    <p className="text-sm text-slate-400">Manage your account, personal details and preferences.</p>
                </div>
                <button 
                    onClick={startEdit}
                    className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-sm font-bold text-white transition-colors shadow-lg shadow-purple-600/30"
                >
                    <Edit2 size={16} /> Edit Profile
                </button>
            </div>

            {/* Main Profile Header Card */}
            <ProfileHeader 
                user={user} 
                profile={profile} 
                isUpdatingAvatar={isUpdatingAvatar} 
                handleAvatarChange={handleAvatarChange} 
            />

            {/* Desktop Tabs */}
            <div className="hidden lg:flex items-center gap-8 border-b border-slate-800/80 mb-6">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 pb-4 text-sm font-bold transition-colors relative ${activeTab === tab.id ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500 rounded-t-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Mobile Tabs */}
            <div className="lg:hidden w-full overflow-hidden mb-6">
                <div className="flex items-center overflow-x-auto no-scrollbar gap-2 pb-2">
                    {mobileTabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center justify-center gap-1.5 min-w-[70px] flex-1 py-3 rounded-[18px] transition-all border ${activeTab === tab.id ? 'bg-gradient-to-br from-[#1a1147]/50 to-transparent border-purple-500/30' : 'bg-[#0a0b12] border-slate-700/80 hover:bg-slate-800/50'}`}
                        >
                            <tab.icon size={20} className={activeTab === tab.id ? 'text-purple-400' : 'text-slate-300'} />
                            <span className={`text-[11px] font-bold ${activeTab === tab.id ? 'text-purple-400' : 'text-slate-300'}`}>{tab.label}</span>
                            {activeTab === tab.id && (
                                <div className="w-8 h-[2px] bg-purple-500 rounded-full shadow-[0_0_5px_rgba(168,85,247,0.5)] mt-1"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content Wrapper */}
            <div className="w-full">
                {activeTab === 'personal' && (
                    <PersonalInfoTab 
                        user={user}
                        profile={profile}
                        society={society}
                        unit={unit}
                        editing={editing}
                        setEditing={setEditing}
                        startEdit={startEdit}
                        form={form}
                        setForm={setForm}
                        handleSave={handleSave}
                        isSaving={isSaving}
                        onEmail={handleEmailIdCard}
                        isEmailing={isEmailingIdCard}
                    />
                )}

                {activeTab === 'unit' && (
                    <UnitInfoTab unit={unit} society={society} />
                )}

                {activeTab === 'family' && (
                    <div className="rounded-[20px] bg-[#0a0b12] p-5 shadow-sm border border-slate-800/80">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-white flex items-center gap-2"><Users className="h-5 w-5 text-indigo-500" /> Family Members <span className="text-xs font-normal text-slate-400">({familyMembers.length})</span></h2>
                            <button onClick={() => setShowAddMember(true)}
                                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                                <Plus className="h-3.5 w-3.5" /> Add
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
                )}

                {(activeTab === 'emergency' || activeTab === 'more') && (
                    <div className="space-y-4">
                        <div className="rounded-[20px] bg-[#0a0b12] p-5 shadow-sm border border-slate-800/80">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-bold text-white flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-500" /> Emergency Contacts
                                </h2>
                                {emergencyContacts.length < 10 && (
                                    <button onClick={() => setShowAddContact(true)}
                                        className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                                        <Plus className="h-3.5 w-3.5" /> Add
                                    </button>
                                )}
                            </div>
                            {emergencyContacts.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center">
                                    <AlertCircle className="mx-auto mb-2 h-8 w-8 text-slate-500" />
                                    <p className="text-sm font-semibold text-slate-300">No emergency contacts</p>
                                    <p className="mt-1 text-xs text-slate-500">Add family members to receive SOS alerts.</p>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {emergencyContacts.map(c => (
                                        <EmergencyContactCard key={c._id} contact={c} onDelete={handleDeleteContact} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-[20px] bg-[#0a0b12] p-5 shadow-sm border border-slate-800/80">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-bold text-white flex items-center gap-2"><Briefcase className="h-5 w-5 text-emerald-500" /> Domestic Staff</h2>
                                <button onClick={() => setShowAddStaff(true)}
                                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                    <Plus className="h-3.5 w-3.5" /> Add
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
                    </div>
                )}
                
                {(activeTab === 'docs' || activeTab === 'preferences') && (
                    <div className="rounded-[20px] bg-[#0a0b12] p-10 shadow-sm border border-slate-800/80 text-center">
                        <FileText className="mx-auto h-10 w-10 text-slate-600 mb-3" />
                        <h2 className="font-bold text-white text-lg">Coming Soon</h2>
                        <p className="text-sm text-slate-400 mt-1">This section is currently under development.</p>
                    </div>
                )}

            </div>
            
            {/* Mobile Bottom Navigation (Sticky) */}
            <MobileBottomNav />

            {/* Modals */}
            {showAddMember && <AddMemberModal onClose={() => setShowAddMember(false)} onAdd={handleAddMember} />}
            {showAddContact && <AddEmergencyContactModal onClose={() => setShowAddContact(false)} onAdd={handleAddContact} />}
            {showAddStaff && <AddDomesticStaffModal onClose={() => setShowAddStaff(false)} onAdd={handleAddStaff} />}
        </div>
    );
}
