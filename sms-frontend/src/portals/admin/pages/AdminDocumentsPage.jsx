import React, { useState } from 'react';
import { Download, Check, X, Upload, Folder, User, Car, Clock, Trash2 } from 'lucide-react';
import {
    useGetDocumentsQuery,
    useUploadDocumentMutation,
    useApproveDocumentMutation,
    useLazyDownloadDocumentQuery,
    useDeleteDocumentMutation
} from '../../../store/api/documentApi';
import { useSelector } from 'react-redux';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

export default function AdminDocumentsPage() {
    const user = useSelector((state) => state.auth.user);
    const { data: documentsData, isLoading: isLoadingDocs } = useGetDocumentsQuery();
    const documents = documentsData?.data?.documents || [];

    const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();
    const [approveDocument] = useApproveDocumentMutation();
    const [downloadDocument] = useLazyDownloadDocumentQuery();
    const [deleteDocument] = useDeleteDocumentMutation();

    const [activeTab, setActiveTab] = useState('SOCIETY');
    const [uploadModalVisible, setUploadModalVisible] = useState(false);

    // form state
    const [fileList, setFileList] = useState([]);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('SOCIETY');
    const [documentType, setDocumentType] = useState('SOCIETY_BYLAW');
    const [customDocumentType, setCustomDocumentType] = useState('');
    const [visibility, setVisibility] = useState('SOCIETY');
    const [expiryDate, setExpiryDate] = useState('');

    const handleUpload = async (e) => {
        e.preventDefault();
        if (fileList.length === 0) {
            toast.error('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileList[0]);
        formData.append('title', title);
        formData.append('category', category);
        formData.append('documentType', documentType);
        if (documentType === 'OTHER' && customDocumentType) {
            formData.append('customDocumentType', customDocumentType);
        }
        formData.append('ownerType', 'SOCIETY');
        formData.append('visibility', visibility || 'SOCIETY');
        if (expiryDate) formData.append('expiryDate', expiryDate);

        try {
            await uploadDocument(formData).unwrap();
            toast.success('Document uploaded successfully');
            setUploadModalVisible(false);
            setFileList([]);
            setTitle('');
            setCategory('SOCIETY');
            setDocumentType('SOCIETY_BYLAW');
            setExpiryDate('');
        } catch (error) {
            console.error(error);
            if (error.data?.error === 'VALIDATION_ERROR' && error.data?.details?.length > 0) {
                toast.error(error.data.details[0].message);
            } else {
                toast.error(error.data?.message || 'Failed to upload document');
            }
        }
    };

    const handleDownload = async (id) => {
        try {
            const res = await downloadDocument(id).unwrap();
            window.open(res.data.url, '_blank');
        } catch (error) {
            console.error(error);
            toast.error('Failed to download document');
        }
    };

    const handleApprove = async (id, status) => {
        try {
            await approveDocument({ id, status }).unwrap();
            toast.success(`Document ${status.toLowerCase()} successfully`);
        } catch (error) {
            console.error(error);
            toast.error(`Failed to ${status.toLowerCase()} document`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await deleteDocument(id).unwrap();
            toast.success('Document deleted successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete document');
        }
    };

    // Filter documents based on active tab
    const getFilteredDocs = () => {
        if (activeTab === 'SOCIETY') {
            return documents.filter(d => ['SOCIETY', 'LEGAL', 'MAINTENANCE'].includes(d.category));
        }
        if (activeTab === 'RESIDENTS') {
            return documents.filter(d => ['IDENTITY', 'RESIDENTIAL'].includes(d.category) || d.ownerType === 'RESIDENT');
        }
        if (activeTab === 'VEHICLES') {
            return documents.filter(d => d.category === 'VEHICLE' || d.vehicleId);
        }
        return documents;
    };

    const filteredDocs = getFilteredDocs();

    // Helper for rendering Expiry visually
    const renderExpiry = (dateStr) => {
        if (!dateStr) return <span className="text-slate-400">-</span>;

        const expDate = new Date(dateStr);
        const today = new Date();
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return <span className="text-red-600 font-semibold flex items-center gap-1"><Clock className="h-3 w-3" /> Expired</span>;
        if (diffDays <= 30) return <span className="text-amber-600 font-semibold flex items-center gap-1"><Clock className="h-3 w-3" /> Expiring Soon</span>;
        return <span className="text-slate-600">{expDate.toLocaleDateString()}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Document Management</h1>
                    <p className="text-slate-500">Manage society, resident, and vehicle documents.</p>
                </div>
                <Button onClick={() => setUploadModalVisible(true)} className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Document
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                <button onClick={() => setActiveTab('SOCIETY')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'SOCIETY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Folder className="h-4 w-4" /> Society Records
                </button>
                <button onClick={() => setActiveTab('RESIDENTS')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'RESIDENTS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <User className="h-4 w-4" /> Resident Documents
                </button>
                <button onClick={() => setActiveTab('VEHICLES')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'VEHICLES' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Car className="h-4 w-4" /> Vehicle Documents
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 whitespace-nowrap">
                        <tr>
                            <th className="p-4 font-semibold">Title</th>
                            {activeTab === 'RESIDENTS' && <th className="p-4 font-semibold">Resident</th>}
                            {activeTab === 'VEHICLES' && <th className="p-4 font-semibold">Vehicle</th>}
                            <th className="p-4 font-semibold hidden sm:table-cell">Type</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold hidden md:table-cell">Expiry</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoadingDocs ? (
                            <tr><td colSpan="7" className="p-8 text-center">Loading...</td></tr>
                        ) : filteredDocs.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-slate-500">No documents found in this category.</td></tr>
                        ) : filteredDocs.map(d => (
                            <tr key={d._id} className="hover:bg-slate-50">
                                <td className="p-4">
                                    <div className="font-bold text-slate-800">{d.title}</div>
                                    <div className="text-xs text-slate-500 mt-1">By: {d.uploadedBy ? d.uploadedBy.name : 'Unknown'}</div>
                                    <div className="text-xs text-slate-500 mt-0.5 sm:hidden">
                                        Type: {d.documentType === 'OTHER' && d.customDocumentType ? d.customDocumentType : d.documentType.replace(/_/g, ' ')}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5 md:hidden">
                                        Expires: {d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                </td>

                                {activeTab === 'RESIDENTS' && (
                                    <td className="p-4 font-medium text-slate-700">
                                        {d.ownerId?.name || (d.uploadedBy ? d.uploadedBy.name : 'Unknown')}
                                    </td>
                                )}

                                {activeTab === 'VEHICLES' && (
                                    <td className="p-4 font-medium text-slate-700">
                                        {d.vehicleId ? d.vehicleId.vehicleNumber : 'Unlinked'}
                                    </td>
                                )}

                                <td className="p-4 hidden sm:table-cell">
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                                        {d.documentType === 'OTHER' && d.customDocumentType ? d.customDocumentType : d.documentType.replace(/_/g, ' ')}
                                    </span>
                                </td>

                                <td className="p-4">
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold
                                        ${d.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                            d.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                d.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {d.status}
                                    </span>
                                </td>

                                <td className="p-4 hidden md:table-cell">
                                    {renderExpiry(d.expiryDate)}
                                </td>

                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleDownload(d._id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors" title="Download"><Download className="h-4 w-4" /></button>
                                        {d.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => handleApprove(d._id, 'APPROVED')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200 transition-colors" title="Approve"><Check className="h-4 w-4" /></button>
                                                <button onClick={() => handleApprove(d._id, 'REJECTED')} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded border border-transparent hover:border-amber-200 transition-colors" title="Reject"><X className="h-4 w-4" /></button>
                                            </>
                                        )}
                                        <button onClick={() => handleDelete(d._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Replacement using native Tailwind classes */}
            {uploadModalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Upload Document</h2>
                            <button type="button" onClick={() => setUploadModalVisible(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
                                <input required value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Annual Audit Report 2025" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="SOCIETY">Society Records</option>
                                    <option value="LEGAL">Legal / Compliance</option>
                                    <option value="MAINTENANCE">Maintenance / Vendor</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                                <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="SOCIETY_BYLAW">Society Bylaw</option>
                                    <option value="MEETING_MINUTES">Meeting Minutes</option>
                                    <option value="AUDIT_REPORT">Audit Report</option>
                                    <option value="MAINTENANCE_NOTICE">Maintenance Notice</option>
                                    <option value="VENDOR_CONTRACT">Vendor Contract</option>
                                    <option value="VENDOR_INVOICE">Vendor Invoice</option>
                                    <option value="AMC">AMC</option>
                                    <option value="SERVICE_REPORT">Service Report</option>
                                    <option value="WARRANTY_CARD">Warranty Card</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            {documentType === 'OTHER' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Specify Document Type</label>
                                    <input required value={customDocumentType} onChange={(e) => setCustomDocumentType(e.target.value)} type="text" className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Enter document type" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date (Optional)</label>
                                <input value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} type="date" className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
                                <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="PRIVATE">Private (Admins Only)</option>
                                    <option value="MANAGEMENT">Management</option>
                                    <option value="SOCIETY">Society (All Residents)</option>
                                    <option value="PUBLIC">Public</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">File (Max 10MB)</label>
                                <input required onChange={(e) => setFileList(e.target.files)} type="file" className="w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100" />
                            </div>
                            <Button disabled={isUploading} type="submit" className="w-full">
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
