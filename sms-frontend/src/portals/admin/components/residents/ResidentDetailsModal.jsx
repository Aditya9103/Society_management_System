import React, { useState } from 'react';
import { Mail, Phone, ArrowLeft, Download, RefreshCw, Calendar, User as UserIcon, CheckCircle, ShieldAlert, Edit2, AlertTriangle, Briefcase, Droplet, Hash, FileText, Lock, Eye, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
    useGetResidentProfileQuery, 
    useApproveResidentMutation, 
    useRejectResidentMutation, 
    useRevokeResidentMutation,
    useGetSocietyProfileQuery,
    useResetResidentPasswordMutation
} from '../../../../store/api/societyAdminApi';
import { DigitalIdCardGenerator } from './DigitalIdCardGenerator';
import EditResidentModal from './EditResidentModal';

export default function ResidentDetailsModal({ residentId, onClose }) {
    const { data: profileData, isLoading, refetch } = useGetResidentProfileQuery(residentId, { skip: !residentId });
    const profile = profileData?.data;
    const { data: societyData } = useGetSocietyProfileQuery();

    const [activeTab, setActiveTab] = useState('OVERVIEW');
    const [actionLoading, setActionLoading] = useState(false);
    const [triggerGeneration, setTriggerGeneration] = useState(false);
    const [isGeneratingIdCard, setIsGeneratingIdCard] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    
    const [approve] = useApproveResidentMutation();
    const [revoke] = useRevokeResidentMutation();
    const [resetResidentPassword] = useResetResidentPasswordMutation();

    if (!residentId) return null;

    const handleAction = async (actionType) => {
        try {
            setActionLoading(true);
            if (actionType === 'APPROVE') {
                await approve({ id: residentId, adminComments: 'Approved by admin' }).unwrap();
                setIsApproving(true);
                setIsGeneratingIdCard(true);
                setTriggerGeneration(true);
            } else if (actionType === 'REVOKE') {
                const reason = window.prompt("Reason for revoking access:");
                if (!reason) return;
                await revoke({ id: residentId, rejectionReason: reason }).unwrap();
                toast.success("Access revoked");
            }
        } catch (error) {
            toast.error(error?.data?.message || 'Action failed');
        } finally {
            if (actionType !== 'APPROVE') setActionLoading(false);
        }
    };

    const handleResetPassword = async () => {
        const newPassword = window.prompt("Enter new password for the resident (minimum 6 characters):");
        if (!newPassword || newPassword.length < 6) {
            if (newPassword) toast.error("Password must be at least 6 characters");
            return;
        }
        
        try {
            setActionLoading(true);
            await resetResidentPassword({ id: residentId, newPassword }).unwrap();
            toast.success("Password reset successfully!");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to reset password");
        } finally {
            setActionLoading(false);
        }
    };

    const handleGenerateIdCard = () => {
        if (rd?.idCardUrl) {
            if (!window.confirm("Are you sure you want to regenerate this ID card?")) return;
        }
        setIsGeneratingIdCard(true);
        setTriggerGeneration(true);
    };

    const handleGenerationComplete = () => {
        setTriggerGeneration(false);
        setIsGeneratingIdCard(false);
        toast.success('ID Card generated successfully!');
        setIsApproving(false);
        setActionLoading(false);
        refetch();
    };

    const handleGenerationError = () => {
        setTriggerGeneration(false);
        setIsGeneratingIdCard(false);
        toast.error('Failed to generate ID Card');
        setIsApproving(false);
        setActionLoading(false);
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#0c0d14] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-[#6338f0]" />
            </div>
        );
    }

    if (!profile) return null;

    const { user, residentDetails: rd } = profile;
    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;

    const TABS = [
        { id: 'OVERVIEW', label: 'Overview', icon: <HomeIcon /> },
        { id: 'FAMILY', label: 'Family Members', badge: rd.familyMembers?.length || 0, icon: <UsersIcon /> },
        { id: 'DOCUMENTS', label: 'Documents', badge: rd.uploadedDocuments?.length || 0, icon: <FileText className="w-4 h-4" /> },
        { id: 'ACTIVITY', label: 'Activity Log', icon: <ActivityIcon /> },
        { id: 'ACCESS', label: 'Access & Permissions', icon: <Lock className="w-4 h-4" /> },
        { id: 'NOTES', label: 'Notes', badge: 0, icon: <FileText className="w-4 h-4" /> },
    ];

    return (
        <div className="fixed inset-0 z-[9999] bg-[#0c0d14] overflow-y-auto custom-scrollbar font-sans">
            {showEditModal && (
                <EditResidentModal 
                    resident={profile} 
                    onClose={() => setShowEditModal(false)} 
                    onSuccess={() => {
                        setShowEditModal(false);
                        refetch();
                    }} 
                />
            )}
            
            {/* Hidden ID Generator */}
            <DigitalIdCardGenerator 
                user={user}
                profile={rd}
                society={societyData?.data?.society}
                unit={rd?.unitId}
                triggerGeneration={triggerGeneration}
                onComplete={handleGenerationComplete}
                onError={handleGenerationError}
            />

            <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
                
                {/* Top Nav & Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button 
                        onClick={onClose}
                        className="flex items-center gap-2 text-white font-bold hover:text-white transition-colors text-sm font-semibold w-fit cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Residents
                    </button>
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => setShowEditModal(true)} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6338f0] text-white text-sm font-bold shadow-[0_0_20px_rgba(99,56,240,0.4)] hover:bg-[#5229db] transition-colors cursor-pointer">
                            <Edit2 className="w-4 h-4" /> Edit Resident
                        </button>
                        {user.registrationStatus === 'APPROVED' ? (
                            <button onClick={() => handleAction('REVOKE')} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4a1216] text-[#f87171] text-sm font-bold border border-[#701c22] hover:bg-[#5c161b] transition-colors">
                                <ShieldAlert className="w-4 h-4" /> Revoke Access
                            </button>
                        ) : (
                            <button onClick={() => handleAction('APPROVE')} disabled={actionLoading} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-xl bg-[#143261] text-[#60a5fa] text-sm font-bold border border-[#1d488c] hover:bg-[#1a417a] transition-colors">
                                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} 
                                Approve
                            </button>
                        )}
                    </div>
                </div>

                {/* Page Title */}
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Resident Details</h1>
                    <p className="text-white font-bold text-sm mt-1 font-bold">Complete resident information and management</p>
                </div>

                {/* Profile Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1c1439] to-[#11131c] border border-white/5 p-6 md:p-8 flex flex-col lg:flex-row justify-between gap-8">
                    {/* Abstract Bg */}
                    <div className="absolute right-0 top-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#6338f0]/20 via-transparent to-transparent opacity-50 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="relative mx-auto md:mx-0">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#6338f0] to-[#9333ea] flex items-center justify-center text-3xl font-black text-white shadow-xl">
                                {initials}
                            </div>
                            {user.registrationStatus === 'APPROVED' && (
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#4ade80] rounded-full border-2 border-[#1c1439] flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-[#052e16]" />
                                </div>
                            )}
                        </div>
                        <div className="text-center md:text-left w-full md:w-auto">
                            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-2">
                                <h2 className="text-xl md:text-2xl font-bold text-white">{user.firstName} {user.lastName}</h2>
                                {user.registrationStatus === 'APPROVED' ? (
                                    <span className="px-2 py-0.5 rounded text-[12px] font-bold bg-[#052e16] text-[#4ade80] tracking-wider border border-[#166534]">APPROVED</span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded text-[12px] font-bold bg-[#422006] text-[#fbbf24] tracking-wider border border-[#713f12]">{user.registrationStatus}</span>
                                )}
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-sm text-white font-bold font-bold mb-5">
                                <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#b388ff]" /> <span className="break-words whitespace-normal max-w-[200px] md:max-w-none">{user.email}</span></span>
                                <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#b388ff]" /> {user.phone || 'N/A'}</span>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 text-sm w-full">
                                <div className="bg-[#0c0d14]/50 border border-white/5 rounded-lg px-3 md:px-4 py-2 flex-1 md:flex-none min-w-[45%] md:min-w-0">
                                    <span className="text-white font-bold text-xs block mb-0.5 text-center md:text-left">Resident ID</span>
                                    <span className="text-white font-bold block text-center md:text-left">{rd.residentCode || 'RES-' + user._id.slice(-6).toUpperCase()}</span>
                                </div>
                                <div className="bg-[#0c0d14]/50 border border-white/5 rounded-lg px-3 md:px-4 py-2 flex-1 md:flex-none min-w-[45%] md:min-w-0">
                                    <span className="text-white font-bold text-xs block mb-0.5 text-center md:text-left">Unit No.</span>
                                    <span className="text-white font-bold block text-center md:text-left">{rd.unitId?.unitNumber || 'N/A'}</span>
                                </div>
                                <div className="bg-[#0c0d14]/50 border border-white/5 rounded-lg px-3 md:px-4 py-2 flex-1 md:flex-none min-w-[45%] md:min-w-0">
                                    <span className="text-white font-bold text-xs block mb-0.5 text-center md:text-left">Tower / Floor</span>
                                    <span className="text-white font-bold block text-center md:text-left">T{rd.unitId?.towerId?.name || 'N/A'} / F{rd.unitId?.floorId?.floorNumber || rd.unitId?.floorId?.floorName || 'N/A'}</span>
                                </div>
                                <div className="bg-[#0c0d14]/50 border border-white/5 rounded-lg px-3 md:px-4 py-2 flex-1 md:flex-none min-w-[45%] md:min-w-0">
                                    <span className="text-white font-bold text-xs block mb-0.5 text-center md:text-left">Type</span>
                                    <span className="text-white font-bold uppercase block text-center md:text-left">{rd.ownershipType || 'RESIDENTIAL'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col gap-4 min-w-[200px]">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <Calendar className="w-4 h-4" /> Joined On
                            </div>
                            <div className="text-white text-sm font-semibold">
                                {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <UserIcon className="w-4 h-4" /> Role
                            </div>
                            <div className="text-white text-sm font-semibold uppercase">{rd.ownershipType || 'OWNER'}</div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <CheckCircle className="w-4 h-4" /> Status
                            </div>
                            <div className="text-[#4ade80] text-sm font-semibold">{user.registrationStatus === 'APPROVED' ? 'Active Resident' : 'Pending'}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/5 pb-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                activeTab === tab.id 
                                    ? 'bg-[#2e1d5e]/30 text-[#b388ff] border border-[#6338f0]/30 shadow-[0_0_15px_rgba(99,56,240,0.15)]' 
                                    : 'text-white font-bold hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.badge !== undefined && (
                                <span className={`px-2 py-0.5 rounded-full text-[12px] ${activeTab === tab.id ? 'bg-[#6338f0] text-white' : 'bg-[#151722] text-white font-bold'}`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'OVERVIEW' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Left Column (Info Cards) */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            
                            {/* Unit Information */}
                            <InfoCard title="Unit Information" icon={<HomeIcon className="w-5 h-5 text-[#b388ff]" />}>
                                <InfoRow label="Unit Number" value={rd.unitId?.unitNumber || 'N/A'} />
                                <InfoRow label="Tower / Floor" value={`Tower ${rd.unitId?.towerId?.name || 'N/A'} / Floor ${rd.unitId?.floorId?.floorNumber || rd.unitId?.floorId?.floorName || 'N/A'}`} />
                                <InfoRow label="Type" value="RESIDENTIAL" />
                                <InfoRow label="BHK" value={rd.unitId?.bhkType || 'N/A'} />
                                <InfoRow label="Area" value={`${rd.unitId?.builtUpAreaSqft || 0} sq ft`} />
                                <InfoRow label="Ownership" value={rd.ownershipType || 'Owner'} />
                                <InfoRow label="Parking Slot" value="N/A" />
                                <InfoRow label="Monthly Maintenance" value={`₹ ${rd.unitId?.maintenanceAmount || '0'}`} />
                            </InfoCard>

                            {/* Personal Information */}
                            <InfoCard title="Personal Information" icon={<UserIcon className="w-5 h-5 text-[#b388ff]" />}>
                                <InfoRow label="Full Name" value={`${user.firstName} ${user.lastName}`} />
                                <InfoRow label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'} />
                                <InfoRow label="Gender" value={user.gender || 'Not provided'} />
                                <InfoRow label="Occupation" value={rd.occupation || 'Not provided'} />
                                <InfoRow label="Aadhaar No." value={rd.aadhaarNumber ? `XXXX XXXX ${rd.aadhaarNumber.slice(-4)}` : 'Not provided'} />
                                <InfoRow label="PAN No." value={rd.panNumber || 'Not provided'} />
                                <InfoRow label="Blood Group" value={rd.bloodGroup || 'Not provided'} />
                                <InfoRow label="Marital Status" value={rd.maritalStatus || 'Not provided'} />
                                <InfoRow label="Nationality" value={user.nationality || 'Indian'} />
                            </InfoCard>

                            {/* Contact Information */}
                            <InfoCard title="Contact Information" icon={<Phone className="w-5 h-5 text-[#b388ff]" />}>
                                <InfoRow label="Email Address" value={user.email} />
                                <InfoRow label="Mobile Number" value={user.phone || 'Not provided'} />
                                <InfoRow label="Alternate Number" value="N/A" />
                                <InfoRow label="Emergency Contact" value={rd.emergencyContacts?.[0]?.name || 'Not provided'} />
                                <InfoRow label="Emergency Number" value={rd.emergencyContacts?.[0]?.phone || 'Not provided'} />
                                <InfoRow label="Address" value="Not provided" />
                            </InfoCard>

                            {/* Account & Access */}
                            <InfoCard title="Account & Access" icon={<ShieldAlert className="w-5 h-5 text-[#b388ff]" />}>
                                <InfoRow label="Account Status" value={<span className="text-[#4ade80] font-bold">Approved</span>} />
                                <InfoRow label="Resident ID" value={rd.residentCode || `RES-${user._id.slice(-6).toUpperCase()}`} />
                                <InfoRow label="Joined On" value={new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
                                <InfoRow label="Last Login" value="Not tracked yet" />
                                <InfoRow label="Access Type" value="Full Access" />
                                <InfoRow label="ID Card Status" value={<span className="text-[#4ade80] font-bold">Active</span>} />
                                <InfoRow label="Gate Access" value={<span className="text-[#4ade80] font-bold">Enabled</span>} />
                            </InfoCard>

                            {/* Footer Note */}
                            <div className="flex items-center gap-2 p-4 rounded-xl bg-[#143261]/20 border border-[#1d488c]/30 text-[#60a5fa] text-xs font-semibold">
                                <AlertTriangle className="w-4 h-4" />
                                Note: All times are displayed in Asia/Kolkata (IST)
                            </div>
                        </div>

                        {/* Right Column (Cards) */}
                        <div className="flex flex-col gap-6">
                            
                            {/* Digital ID Card */}
                            <div className="bg-[#11131c] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#151722]/50">
                                    <div className="flex items-center gap-2 text-gray-200 font-bold text-sm">
                                        <div className="w-6 h-6 rounded-md bg-[#6338f0]/20 flex items-center justify-center">
                                            <ShieldAlert className="w-3.5 h-3.5 text-[#b388ff]" />
                                        </div>
                                        Digital ID Card
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={handleGenerateIdCard}
                                            disabled={isGeneratingIdCard}
                                            className="text-[#6338f0] hover:text-white transition-colors text-xs font-bold disabled:opacity-50 cursor-pointer"
                                        >
                                            {rd.idCardUrl ? 'Regenerate' : 'Generate'}
                                        </button>
                                        {rd.idCardUrl && (
                                            <a href={rd.idCardUrl} download={`Resident_ID_${user.firstName}.png`} target="_blank" rel="noreferrer" className="text-white font-bold hover:text-white transition-colors cursor-pointer">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-center bg-[#0c0d14] relative flex-1 min-h-[300px]">
                                    {isGeneratingIdCard && (
                                        <div className="absolute inset-0 z-20 bg-[#0c0d14]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                                            <RefreshCw className="w-8 h-8 text-[#6338f0] animate-spin" />
                                            <p className="text-white text-xs font-bold animate-pulse">Generating ID Card...</p>
                                        </div>
                                    )}
                                    {rd.idCardUrl ? (
                                        <div className="w-full relative group">
                                            <img src={rd.idCardUrl} alt="ID Card" className="w-full h-auto block" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                                <a href={rd.idCardUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-lg border border-white/20 hover:bg-white/20 transition-colors flex items-center gap-2 cursor-pointer">
                                                    <Eye className="w-3.5 h-3.5" /> View Full Size
                                                </a>
                                                <button onClick={handleGenerateIdCard} className="px-4 py-2 bg-[#6338f0] text-white text-xs font-bold rounded-lg shadow-lg hover:bg-[#5229db] transition-colors flex items-center gap-2 cursor-pointer">
                                                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-[0.63] bg-[#151722] relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                                            <ShieldAlert className="w-12 h-12 text-gray-600 mb-4" />
                                            <h3 className="text-white font-bold font-bold mb-1">No ID Card</h3>
                                            <p className="text-xs text-white font-bold mb-6">Digital ID Card has not been generated for this resident yet.</p>
                                            <button onClick={handleGenerateIdCard} className="px-5 py-2.5 bg-[#6338f0]/10 text-[#b388ff] text-xs font-bold rounded-xl hover:bg-[#6338f0]/20 transition-colors border border-[#6338f0]/30 w-full cursor-pointer">
                                                Generate ID Card Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-[#11131c] border border-white/5 rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-white/5 flex items-center gap-2 text-gray-200 font-bold text-sm bg-[#151722]/50">
                                    <div className="w-6 h-6 rounded-md bg-[#3b82f6]/20 flex items-center justify-center">
                                        <ActivityIcon className="w-3.5 h-3.5 text-[#60a5fa]" />
                                    </div>
                                    Quick Actions
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-3">
                                    <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 p-3 rounded-xl bg-[#151722] border border-white/5 hover:bg-white/5 transition-colors text-xs font-semibold text-white font-bold cursor-pointer">
                                        <Edit2 className="w-4 h-4 text-white font-bold" /> Edit Resident
                                    </button>
                                    <button onClick={handleResetPassword} className="flex items-center gap-2 p-3 rounded-xl bg-[#151722] border border-white/5 hover:bg-white/5 transition-colors text-xs font-semibold text-white font-bold cursor-pointer">
                                        <Lock className="w-4 h-4 text-white font-bold" /> Reset Password
                                    </button>
                                    <button onClick={() => setActiveTab('DOCUMENTS')} className="flex items-center gap-2 p-3 rounded-xl bg-[#151722] border border-white/5 hover:bg-white/5 transition-colors text-xs font-semibold text-white font-bold cursor-pointer">
                                        <FileText className="w-4 h-4 text-white font-bold" /> View Documents
                                    </button>
                                    <button onClick={() => setActiveTab('ACTIVITY')} className="flex items-center gap-2 p-3 rounded-xl bg-[#151722] border border-white/5 hover:bg-white/5 transition-colors text-xs font-semibold text-white font-bold cursor-pointer">
                                        <ActivityIcon className="w-4 h-4 text-white font-bold" /> View Activity Log
                                    </button>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-[#11131c] border border-white/5 rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#151722]/50">
                                    <div className="flex items-center gap-2 text-gray-200 font-bold text-sm">
                                        <div className="w-6 h-6 rounded-md bg-[#f59e0b]/20 flex items-center justify-center">
                                            <Clock className="w-3.5 h-3.5 text-[#fbbf24]" />
                                        </div>
                                        Recent Activity
                                    </div>
                                    <button onClick={() => setActiveTab('ACTIVITY')} className="text-[#6338f0] text-xs font-bold hover:text-white transition-colors">
                                        View All
                                    </button>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="flex gap-3">
                                        <div className="mt-1"><CheckCircle className="w-5 h-5 text-[#4ade80]" /></div>
                                        <div>
                                            <div className="text-gray-200 text-sm font-semibold">Resident Approved</div>
                                            <div className="text-white font-bold text-xs mt-0.5">Resident account was approved by admin</div>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <div className="text-white font-bold text-xs font-bold">{new Date(user.createdAt).toLocaleDateString()}</div>
                                            <div className="text-white font-bold text-[12px] mt-0.5">Admin</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="mt-1"><FileText className="w-5 h-5 text-[#b388ff]" /></div>
                                        <div>
                                            <div className="text-gray-200 text-sm font-semibold">ID Card Generated</div>
                                            <div className="text-white font-bold text-xs mt-0.5">Digital ID card was generated</div>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <div className="text-white font-bold text-xs font-bold">{new Date().toLocaleDateString()}</div>
                                            <div className="text-white font-bold text-[12px] mt-0.5">System</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
                
                {/* Tab Content */}
                {activeTab === 'FAMILY' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rd.familyMembers && rd.familyMembers.length > 0 ? rd.familyMembers.map((member, idx) => (
                            <div key={idx} className="bg-[#11131c] border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-[#1c1439] flex items-center justify-center border border-[#2e1d5e]">
                                        <UsersIcon className="w-6 h-6 text-[#b388ff]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-base">{member.name}</h3>
                                        <div className="text-white font-bold text-xs font-semibold uppercase">{member.relation}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                                    {member.phone && (
                                        <div>
                                            <div className="text-white font-bold text-xs uppercase tracking-wider mb-0.5">Phone</div>
                                            <div className="text-white text-sm font-semibold">{member.phone}</div>
                                        </div>
                                    )}
                                    {member.gender && (
                                        <div>
                                            <div className="text-white font-bold text-xs uppercase tracking-wider mb-0.5">Gender</div>
                                            <div className="text-white text-sm font-semibold">{member.gender}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#11131c] rounded-2xl border border-white/5">
                                <UsersIcon className="w-12 h-12 text-white font-bold mb-4" />
                                <h3 className="text-lg font-bold text-white font-bold">No Family Members</h3>
                                <p className="text-sm text-white font-bold mt-2">No family members have been added to this profile.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'DOCUMENTS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rd.uploadedDocuments && rd.uploadedDocuments.length > 0 ? rd.uploadedDocuments.map((doc, idx) => (
                            <div key={idx} className="bg-[#11131c] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#1a4d35]/30 flex items-center justify-center border border-[#166534]">
                                        <FileText className="w-5 h-5 text-[#4ade80]" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-gray-200 font-bold text-sm">{doc.documentType}</h3>
                                        <div className="text-white font-bold text-xs mt-0.5">Verified Document</div>
                                    </div>
                                </div>
                                <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#151722] text-[#6338f0] text-xs font-bold hover:bg-[#6338f0]/10 transition-colors border border-white/5 cursor-pointer">
                                    <Eye className="w-4 h-4" /> View Document
                                </a>
                            </div>
                        )) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#11131c] rounded-2xl border border-white/5">
                                <FileText className="w-12 h-12 text-white font-bold mb-4" />
                                <h3 className="text-lg font-bold text-white font-bold">No Documents</h3>
                                <p className="text-sm text-white font-bold mt-2">No documents have been uploaded.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ACTIVITY' && (
                    <div className="bg-[#11131c] border border-white/5 rounded-2xl p-6">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1"><UserIcon className="w-5 h-5 text-[#3b82f6]" /></div>
                                <div>
                                    <div className="text-gray-200 text-sm font-semibold">Account Created</div>
                                    <div className="text-white font-bold text-xs mt-0.5">Resident completed registration</div>
                                    <div className="text-white font-bold text-xs font-bold mt-1">{new Date(user.createdAt).toLocaleString()}</div>
                                </div>
                            </div>
                            {rd.approvedAt && (
                                <div className="flex gap-4 border-t border-white/5 pt-6">
                                    <div className="mt-1"><CheckCircle className="w-5 h-5 text-[#4ade80]" /></div>
                                    <div>
                                        <div className="text-gray-200 text-sm font-semibold">Profile Approved</div>
                                        <div className="text-white font-bold text-xs mt-0.5">Admin verified and approved this profile</div>
                                        <div className="text-white font-bold text-xs font-bold mt-1">{new Date(rd.approvedAt).toLocaleString()}</div>
                                    </div>
                                </div>
                            )}
                            {rd.idCardGeneratedAt && (
                                <div className="flex gap-4 border-t border-white/5 pt-6">
                                    <div className="mt-1"><FileText className="w-5 h-5 text-[#b388ff]" /></div>
                                    <div>
                                        <div className="text-gray-200 text-sm font-semibold">ID Card Generated</div>
                                        <div className="text-white font-bold text-xs mt-0.5">Digital Identity Card was successfully generated</div>
                                        <div className="text-white font-bold text-xs font-bold mt-1">{new Date(rd.idCardGeneratedAt).toLocaleString()}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty states for ACCESS and NOTES tabs */}
                {(activeTab === 'ACCESS' || activeTab === 'NOTES') && (
                    <div className="flex flex-col items-center justify-center py-20 bg-[#11131c] rounded-2xl border border-white/5">
                        <div className="w-16 h-16 rounded-full bg-[#151722] flex items-center justify-center mb-4 border border-white/5">
                            {activeTab === 'ACCESS' && <Lock className="w-8 h-8 text-white font-bold" />}
                            {activeTab === 'NOTES' && <FileText className="w-8 h-8 text-white font-bold" />}
                        </div>
                        <h3 className="text-lg font-bold text-white font-bold">Coming Soon</h3>
                        <p className="text-sm text-white font-bold mt-2 max-w-sm text-center">
                            This section is under development and will be available soon.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helpers
function InfoCard({ title, icon, children }) {
    return (
        <div className="bg-[#11131c] border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-[#151722]/50">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    {icon}
                </div>
                <h3 className="text-gray-200 font-bold text-sm tracking-wide">{title}</h3>
            </div>
            <div className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-white/5">
                    {children}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="p-4 flex flex-row items-center justify-between border-b border-white/5 last:border-b-0 md:border-b-0 md:odd:border-r md:odd:border-white/5 md:[&:nth-child(n+3)]:border-t md:[&:nth-child(n+3)]:border-white/5">
            <span className="text-white font-bold text-sm font-bold max-w-[50%]">{label}</span>
            <span className="text-white text-base font-bold text-right break-words whitespace-normal max-w-[50%]">{value}</span>
        </div>
    );
}

function HomeIcon() {
    return <svg className="w-5 h-5 text-[#b388ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
}
function UsersIcon({className="w-4 h-4"}) {
    return <Users className={className} />;
}
function ActivityIcon({className="w-4 h-4"}) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
}
function Users({className}) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
