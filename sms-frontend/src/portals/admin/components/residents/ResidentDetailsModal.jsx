import React, { useState } from 'react';
import { Mail, Phone, Home, FileText, CheckCircle, XCircle, AlertTriangle, Download, RefreshCw, Trash2, Shield } from 'lucide-react';
import Modal from '../../../../components/ui/Modal';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { Button } from '../../../../components/ui/Button';
import TabBar from '../../../../components/ui/TabBar';
import { 
    useGetResidentProfileQuery, 
    useApproveResidentMutation, 
    useRejectResidentMutation, 
    useRevokeResidentMutation,
    useGetSocietyProfileQuery 
} from '../../../../store/api/societyAdminApi';
import { useLazyGetDocumentsQuery, useDeleteDocumentMutation } from '../../../../store/api/documentApi';
import { DigitalIdCardGenerator } from './DigitalIdCardGenerator';

export default function ResidentDetailsModal({ residentId, onClose }) {
    const { data: profileData, isLoading, refetch } = useGetResidentProfileQuery(residentId, { skip: !residentId });
    const profile = profileData?.data;
    const { data: societyData } = useGetSocietyProfileQuery();

    const [activeTab, setActiveTab] = useState('PROFILE');
    const [actionLoading, setActionLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [showReasonInput, setShowReasonInput] = useState(null); // 'REJECT' or 'REVOKE'
    const [triggerGeneration, setTriggerGeneration] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    const [approve] = useApproveResidentMutation();
    const [reject] = useRejectResidentMutation();
    const [revoke] = useRevokeResidentMutation();

    if (!residentId) return null;

    const handleAction = async (actionType) => {
        try {
            setActionLoading(true);
            if (actionType === 'APPROVE') {
                await approve({ id: residentId, adminComments: 'Approved by admin' }).unwrap();
                setIsApproving(true);
                setTriggerGeneration(true); // This triggers the hidden generator
                // We don't onClose here, we wait for onComplete
            } else if (actionType === 'REJECT') {
                if (!reason) return alert('Please provide a reason');
                await reject({ id: residentId, rejectionReason: reason }).unwrap();
                onClose();
            } else if (actionType === 'REVOKE') {
                if (!reason) return alert('Please provide a reason');
                await revoke({ id: residentId, rejectionReason: reason }).unwrap();
                onClose();
            }
        } catch (error) {
            console.error('Action Error:', error);
            alert(error?.data?.message || 'Action failed');
            setActionLoading(false);
        } finally {
            if (actionType !== 'APPROVE') setActionLoading(false);
        }
    };

    const handleGenerationComplete = () => {
        setTriggerGeneration(false);
        if (isApproving) {
            alert('Resident approved and ID Card generated successfully!');
            setIsApproving(false);
            setActionLoading(false);
            onClose();
        } else {
            alert('ID Card generated successfully!');
            refetch();
        }
    };

    const handleGenerationError = () => {
        setTriggerGeneration(false);
        if (isApproving) {
            alert('Resident approved, but ID Card generation failed. You can generate it later.');
            setIsApproving(false);
            setActionLoading(false);
            onClose();
        } else {
            alert('Failed to generate ID Card');
        }
    };

    return (
        <Modal isOpen={!!residentId} onClose={onClose} size="xl" title="Resident Details">
            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                </div>
            ) : profile ? (
                <div className="space-y-6">
                    {/* Hidden Generator Component */}
                    <DigitalIdCardGenerator 
                        user={profile.user}
                        profile={profile.residentDetails}
                        society={societyData?.data?.society}
                        unit={profile.residentDetails?.unitId}
                        triggerGeneration={triggerGeneration}
                        onComplete={handleGenerationComplete}
                        onError={handleGenerationError}
                    />

                    {/* Header Info */}
                    <div className="flex items-start justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white">
                                {profile.user.firstName?.[0]}{profile.user.lastName?.[0]}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">
                                    {profile.user.firstName} {profile.user.lastName}
                                </h3>
                                <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {profile.user.email}</span>
                                    <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {profile.user.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <StatusBadge status={profile.user.registrationStatus} />
                    </div>

                    <TabBar 
                        tabs={[
                            { value: 'PROFILE', label: 'Profile & Unit' },
                            { value: 'DOCUMENTS', label: 'Documents' }
                        ]} 
                        value={activeTab} 
                        onChange={setActiveTab} 
                    />

                    {/* Content */}
                    <div className="min-h-[200px]">
                        {activeTab === 'PROFILE' && (
                            <ProfileTab 
                                profile={profile} 
                                onRefetch={refetch} 
                                onTriggerGeneration={() => setTriggerGeneration(true)}
                                isGenerating={triggerGeneration}
                            />
                        )}
                        {activeTab === 'DOCUMENTS' && <DocumentsTab residentId={residentId} />}
                    </div>

                    {/* Action Bar */}
                    <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                        <div>
                            {showReasonInput && (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text"
                                        placeholder={`Reason for ${showReasonInput.toLowerCase()}...`}
                                        className="text-sm rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        autoFocus
                                    />
                                    <Button 
                                        variant={showReasonInput === 'REVOKE' ? 'danger' : 'outline'} 
                                        onClick={() => handleAction(showReasonInput)}
                                        isLoading={actionLoading}
                                    >
                                        Confirm {showReasonInput === 'REVOKE' ? 'Revoke' : 'Reject'}
                                    </Button>
                                    <Button variant="ghost" onClick={() => setShowReasonInput(null)}>Cancel</Button>
                                </div>
                            )}
                        </div>

                        {!showReasonInput && (
                            <div className="flex items-center gap-3">
                                {profile.user.registrationStatus === 'PENDING_APPROVAL' && (
                                    <>
                                        <Button variant="outline" onClick={() => setShowReasonInput('REJECT')}>
                                            <XCircle className="w-4 h-4 mr-2" /> Reject
                                        </Button>
                                        <Button variant="primary" onClick={() => handleAction('APPROVE')} isLoading={actionLoading || triggerGeneration}>
                                            <CheckCircle className="w-4 h-4 mr-2" /> 
                                            {isApproving ? 'Generating ID...' : 'Approve & Generate ID'}
                                        </Button>
                                    </>
                                )}
                                {profile.user.registrationStatus === 'APPROVED' && (
                                    <Button variant="danger" onClick={() => setShowReasonInput('REVOKE')}>
                                        <AlertTriangle className="w-4 h-4 mr-2" /> Revoke Access
                                    </Button>
                                )}
                                {profile.user.registrationStatus === 'REJECTED' && (
                                    <Button variant="primary" onClick={() => handleAction('APPROVE')} isLoading={actionLoading || triggerGeneration}>
                                        <CheckCircle className="w-4 h-4 mr-2" /> 
                                        {isApproving ? 'Generating ID...' : 'Restore Access & Generate ID'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-10 text-slate-500">Profile not found</div>
            )}
        </Modal>
    );
}

function ProfileTab({ profile, onRefetch, onTriggerGeneration, isGenerating }) {
    const unit = profile.residentDetails?.unitId;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Home className="w-4 h-4 text-indigo-500" /> Unit Details
                    </h4>
                    {unit ? (
                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex justify-between"><span className="text-slate-400">Unit No:</span> <span className="font-medium text-slate-800">{unit.unitNumber}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Type:</span> <span>{unit.unitType}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">BHK:</span> <span>{unit.bhkType}</span></div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No unit assigned yet.</p>
                    )}
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Registration Info</h4>
                    <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between"><span className="text-slate-400">Joined:</span> <span>{new Date(profile.user.createdAt).toLocaleDateString()}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Role:</span> <span>{profile.user.role}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">ID:</span> <span className="text-xs truncate max-w-[120px]" title={profile.user._id}>{profile.user._id}</span></div>
                    </div>
                </div>
            </div>
            
            {profile.residentDetails?.rejectionReason && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <h4 className="text-sm font-semibold text-red-800 mb-1 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Previous Rejection/Revoke Reason
                    </h4>
                    <p className="text-sm text-red-600">{profile.residentDetails.rejectionReason}</p>
                </div>
            )}

            {/* ID Card Management */}
            {profile.user.registrationStatus === 'APPROVED' && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                Digital ID Card
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                                {profile.residentDetails?.idCardGeneratedAt ? 'An ID Card has been generated.' : 'No ID Card has been generated yet.'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {profile.residentDetails?.idCardUrl && (
                                <a 
                                    href={profile.residentDetails.idCardUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                                >
                                    <Download className="w-3.5 h-3.5" /> View Uploaded PDF
                                </a>
                            )}
                            <Button 
                                variant="outline" 
                                onClick={onTriggerGeneration} 
                                isLoading={isGenerating}
                            >
                                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} /> 
                                {profile.residentDetails?.idCardGeneratedAt ? 'Regenerate' : 'Generate'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DocumentsTab({ residentId }) {
    const [fetchDocs, { data, isLoading }] = useLazyGetDocumentsQuery();
    const [deleteDocument] = useDeleteDocumentMutation();

    React.useEffect(() => {
        fetchDocs({ ownerId: residentId });
    }, [residentId, fetchDocs]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await deleteDocument(id).unwrap();
        } catch (error) {
            console.error(error);
            alert('Failed to delete document');
        }
    };

    const docs = data?.data?.documents || [];

    if (isLoading) return <div className="text-center py-8 text-slate-400"><RefreshCw className="h-5 w-5 animate-spin mx-auto" /></div>;

    if (docs.length === 0) {
        return (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No documents uploaded by this resident yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {docs.map(doc => (
                <div key={doc._id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-800">{doc.category.replace('_', ' ')}</p>
                            <p className="text-xs text-slate-500">Status: <span className="font-medium">{doc.status}</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <a 
                            href={doc.fileUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Document"
                        >
                            <Download className="w-4 h-4" />
                        </a>
                        <button 
                            onClick={() => handleDelete(doc._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Document"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
