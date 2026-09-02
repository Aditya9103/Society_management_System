import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, User, Briefcase, Mail, Phone, MapPin, 
    Clock, Shield, FileText, Activity, AlertCircle, Edit2, Trash2, MoreVertical, CheckCircle2, Calendar
} from 'lucide-react';
import { 
    useGetStaffDetailsQuery, 
    useUpdateStaffProfileMutation, 
    useVerifyStaffDocumentMutation,
    useUploadStaffDocumentMutation,
    useDeleteStaffMutation,
    useDeactivateStaffMutation,
    useResetStaffPasswordMutation
} from '../../../store/api/societyAdminApi';
import Card from '../../../components/ui/Card';
import StatusBadge from '../../../components/ui/StatusBadge';

// Tabs Components
import OverviewTab from '../components/staff/profile/OverviewTab';
import PersonalInfoTab from '../components/staff/profile/PersonalInfoTab';
import JobDetailsTab from '../components/staff/profile/JobDetailsTab';
import DocumentsTab from '../components/staff/profile/DocumentsTab';
import PermissionsTab from '../components/staff/profile/PermissionsTab';
import ActivityLogTab from '../components/staff/profile/ActivityLogTab';
import NotesTab from '../components/staff/profile/NotesTab';
import EditStaffModal from '../components/staff/profile/EditStaffModal';

const TABS = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: AlertCircle },
    { id: 'job', label: 'Job Details', icon: Briefcase },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'notes', label: 'Notes', icon: FileText },
];

export default function StaffProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

    const { data: response, isLoading, error } = useGetStaffDetailsQuery(id);
    const [deleteStaff, { isLoading: isDeleting }] = useDeleteStaffMutation();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateStaffProfileMutation();
    const [verifyStaffDocument, { isLoading: isVerifying }] = useVerifyStaffDocumentMutation();
    const [uploadStaffDocument, { isLoading: isUploading }] = useUploadStaffDocumentMutation();
    const [deactivateStaff, { isLoading: isDeactivating }] = useDeactivateStaffMutation();
    const [resetStaffPassword, { isLoading: isResetting }] = useResetStaffPasswordMutation();
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-[#6338f0] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !response?.data) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold">Staff Member Not Found</h2>
                <button onClick={() => navigate('/admin/staff')} className="mt-4 text-[#6338f0] hover:underline">
                    Back to Staff List
                </button>
            </div>
        );
    }

    const { user, profile } = response.data;
    const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this staff member permanently?')) {
            try {
                await deleteStaff(id).unwrap();
                navigate('/admin/staff');
            } catch (error) {
                console.error('Failed to delete staff:', error);
                alert(error?.data?.message || 'Failed to delete staff');
            }
        }
    };

    const handleDeactivateToggle = async () => {
        if (window.confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} this staff member?`)) {
            try {
                // If the backend deactivate toggles, it's fine. Wait, the endpoint is only to deactivate.
                // Assuming we can re-activate by updating the user directly.
                if (user.isActive) {
                    await deactivateStaff(id).unwrap();
                } else {
                    await updateProfile({ id, data: { userUpdates: { isActive: true } } }).unwrap();
                }
                setIsQuickActionOpen(false);
            } catch (err) {
                alert(err?.data?.message || 'Failed to update status');
            }
        }
    };

    const handleResetPassword = async () => {
        if (window.confirm('Are you sure you want to reset their password? A new one will be generated.')) {
            try {
                const res = await resetStaffPassword(id).unwrap();
                alert(`Password reset successfully!\nNew Password: ${res.newPassword}\nMake sure to securely share this with the staff member.`);
                setIsQuickActionOpen(false);
            } catch (err) {
                alert(err?.data?.message || 'Failed to reset password');
            }
        }
    };

    return (
        <div className="space-y-6 pb-10 font-sans text-white">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 text-sm">
                    <button 
                        onClick={() => navigate('/admin/staff')}
                        className="text-white font-bold hover:text-white flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Staff
                    </button>
                    <span className="text-gray-600">/</span>
                    <span className="text-gray-200">Staff Details</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs md:text-sm font-semibold"
                    >
                        <Edit2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit Profile</span>
                    </button>
                    <div className="relative">
                        <button 
                            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-[#6338f0] hover:bg-[#5229db] shadow-[0_0_15px_rgba(99,56,240,0.3)] transition-colors text-xs md:text-sm font-semibold"
                        >
                            <span className="hidden sm:inline">Quick Action</span>
                            <span className="inline sm:hidden">Action</span>
                        </button>
                        {isQuickActionOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#151921] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                                <button 
                                    onClick={handleDeactivateToggle}
                                    disabled={isDeactivating || isUpdating}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/5 transition-colors font-bold border-b border-white/5"
                                >
                                    {user.isActive ? 'Deactivate Account' : 'Activate Account'}
                                </button>
                                <button 
                                    onClick={handleResetPassword}
                                    disabled={isResetting}
                                    className="w-full text-left px-4 py-3 text-sm text-amber-500 hover:bg-amber-500/10 transition-colors font-bold"
                                >
                                    Reset Password
                                </button>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={handleDelete}
                        disabled={isDeleting || user.isActive}
                        title={user.isActive ? "Deactivate staff before deleting" : "Permanently delete"}
                        className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Profile Header Card (Like Resident Profile) */}
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-5 lg:px-8 lg:py-6 shadow-xl border border-indigo-400/30 mb-8 max-w-full box-border">
                {/* Background pattern */}
                <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 opacity-20 mix-blend-overlay pointer-events-none bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800')] bg-cover bg-center lg:bg-left"></div>
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-indigo-900/90 via-purple-900/60 to-transparent"></div>

                <div className="relative z-10 w-full">
                    {/* ─── MOBILE ONLY LAYOUT ─── */}
                    <div className="flex flex-col items-center text-center lg:hidden w-full">
                        <div className="relative mb-4 group cursor-pointer">
                            <div className="h-[90px] w-[90px] rounded-full bg-[#fde047] flex items-center justify-center text-purple-900 text-4xl font-bold border-[3px] border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] overflow-hidden">
                                {initials}
                            </div>
                            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border-2 border-purple-900 shadow-sm whitespace-nowrap ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                {user.isActive ? 'Active' : 'Deactivated'}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-white text-[11px] font-bold mb-2 bg-[#6338f0]/30 px-3 py-1 rounded-full border border-[#6338f0]/50">
                            <CheckCircle2 size={14} className="text-white" /> Staff Profile
                        </div>
                        
                        <h1 className="text-2xl font-extrabold text-white mb-0.5 tracking-tight px-4 text-center break-words whitespace-normal">{user.firstName} {user.lastName}</h1>
                        <p className="text-sm text-white font-bold mb-3 px-4 text-center break-all">{user.email}</p>
                        
                        <span className="rounded-full px-4 py-1 text-[12px] font-bold tracking-widest bg-white/10 text-white shadow-sm uppercase border border-white/20">
                            {user.role?.replace('_', ' ')}
                        </span>

                        <div className="w-full mt-6 flex flex-col gap-2">
                            <div className="flex items-center justify-between bg-white/20 border border-white/30 rounded-[14px] p-3.5 backdrop-blur-md shadow-lg">
                                <div className="flex items-center gap-2 text-white text-[13px] font-bold uppercase tracking-wider">
                                    <Calendar size={16} className="text-white" /> Joined
                                </div>
                                <div className="text-white text-[15px] font-bold">{new Date(user.createdAt).toLocaleDateString(undefined, {month:'short', year:'numeric'})}</div>
                            </div>
                            <div className="flex items-center justify-between bg-white/20 border border-white/30 rounded-[14px] p-3.5 backdrop-blur-md shadow-lg">
                                <div className="flex items-center gap-2 text-white text-[13px] font-bold uppercase tracking-wider">
                                    <Clock size={16} className="text-white" /> Shift
                                </div>
                                <div className="text-white text-[15px] font-bold">{profile?.shift || 'Unassigned'}</div>
                            </div>
                        </div>
                    </div>

                    {/* ─── DESKTOP ONLY LAYOUT ─── */}
                    <div className="hidden lg:flex flex-row justify-between items-end gap-5 w-full">
                        {/* Top Section: Avatar & Info */}
                        <div className="flex items-center gap-5 w-auto flex-1">
                            <div className="relative shrink-0 group cursor-pointer">
                                <div className="h-[90px] w-[90px] rounded-full bg-[#fde047] flex items-center justify-center text-purple-900 text-3xl font-bold border-2 border-white shadow-xl overflow-hidden">
                                    {initials}
                                </div>
                            </div>

                            <div className="flex flex-col items-start min-w-0">
                                <div className="flex items-center gap-1.5 text-white text-[12px] font-bold mb-1.5 bg-[#6338f0]/30 px-3 py-1 rounded-full border border-[#6338f0]/50">
                                    <CheckCircle2 size={14} className="text-white shrink-0" /> <span>Staff Profile</span>
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-0.5 tracking-tight break-words whitespace-normal w-full">{user.firstName} {user.lastName}</h1>
                                <p className="text-[15px] text-white font-bold mb-2 break-words whitespace-normal w-full flex flex-wrap items-center gap-2">
                                    <span className="flex items-center gap-1.5 break-all"><Mail size={14} className="shrink-0"/> {user.email}</span> 
                                    {user.phone && <span className="flex items-center gap-1.5"><Phone size={14} className="ml-2 shrink-0"/> {user.phone}</span>}
                                </p>
                                
                                <span className="rounded-full px-3 py-0.5 text-[12px] font-bold tracking-wider bg-white/10 border border-white/20 text-white shadow-sm shrink-0 uppercase">
                                    {user.role?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Right/Bottom Section: Desktop Stats Blocks */}
                        <div className="flex flex-wrap items-center gap-4 justify-end w-auto shrink-0 mt-4 lg:mt-0">
                            <div className="shrink-0 flex flex-col items-start min-w-[140px] bg-white/20 border border-white/30 shadow-lg rounded-[16px] px-4 py-3 backdrop-blur-md">
                                <span className="text-[12px] text-white font-bold uppercase tracking-wider mb-1.5">Joined</span>
                                <div className="flex items-center gap-2 font-bold text-white text-[16px]">
                                    <Calendar size={16} className="text-white" />
                                    {new Date(user.createdAt).toLocaleDateString(undefined, {month:'short', year:'numeric'})}
                                </div>
                            </div>
                            
                            <div className="shrink-0 flex flex-col items-start min-w-[140px] bg-white/20 border border-white/30 shadow-lg rounded-[16px] px-4 py-3 backdrop-blur-md">
                                <span className="text-[12px] text-white font-bold uppercase tracking-wider mb-1.5">Status</span>
                                <div className="flex items-center gap-2 font-bold text-white text-[16px]">
                                    <div className={`h-4 w-4 rounded-full shrink-0 ${user.isActive ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]'}`}></div>
                                    {user.isActive ? 'Active' : 'Deactivated'}
                                </div>
                            </div>
                            
                            <div className="shrink-0 flex flex-col items-start min-w-[140px] bg-white/20 border border-white/30 shadow-lg rounded-[16px] px-4 py-3 backdrop-blur-md">
                                <span className="text-[12px] text-white font-bold uppercase tracking-wider mb-1.5">Shift</span>
                                <div className="flex items-center gap-2 font-bold text-white text-[16px]">
                                    <Clock size={16} className="text-white shrink-0" />
                                    {profile?.shift || 'Unassigned'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 border-b border-white/5 pb-2">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                                isActive 
                                    ? 'bg-[#6338f0]/10 text-[#6338f0]' 
                                    : 'text-white font-bold hover:text-gray-200 hover:bg-white/5'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#6338f0]' : ''}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'overview' && <OverviewTab user={user} profile={profile} updateProfile={updateProfile} />}
                {activeTab === 'personal' && <PersonalInfoTab user={user} profile={profile} updateProfile={updateProfile} />}
                {activeTab === 'job' && <JobDetailsTab user={user} profile={profile} updateProfile={updateProfile} />}
                {activeTab === 'documents' && (
                    <DocumentsTab 
                        user={user} 
                        profile={profile} 
                        verifyDocument={verifyStaffDocument} 
                        isVerifying={isVerifying} 
                        uploadDocument={uploadStaffDocument}
                        isUploading={isUploading}
                    />
                )}
                {activeTab === 'permissions' && <PermissionsTab user={user} profile={profile} updateProfile={updateProfile} />}
                {activeTab === 'activity' && <ActivityLogTab user={user} profile={profile} />}
                {activeTab === 'notes' && <NotesTab user={user} profile={profile} updateProfile={updateProfile} />}
            </div>
            {/* Modals */}
            {isEditModalOpen && (
                <EditStaffModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    user={user} 
                    profile={profile} 
                    updateProfile={updateProfile}
                    isUpdating={isUpdating}
                />
            )}
        </div>
    );
}
