import React, { useState } from 'react';
import {
    Download, Upload, X, Trash2, Folder, ShieldCheck,
    Clock, FileWarning, Search, ChevronDown, List, LayoutGrid,
    MoreVertical, FileText
} from 'lucide-react';
import {
    useGetDocumentsQuery,
    useUploadDocumentMutation,
    useLazyDownloadDocumentQuery,
    useDeleteDocumentMutation
} from '../../../store/api/documentApi';
import { useGetMyVehiclesQuery } from '../../../store/api/vehicleApi';
import { useSelector } from 'react-redux';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, title, value, subtitle, iconBg, iconColor, gradient, onClick }) => (
    <div 
        onClick={onClick}
        className={`relative overflow-hidden rounded-[20px] bg-gradient-to-br ${gradient} border border-white/5 p-5 flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
    >
        {/* Abstract Background Waves (CSS based) */}
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 80C30 50 60 80 120 20L120 80H0Z" fill="currentColor" className="text-white" />
                <path d="M20 80C50 40 80 70 120 0L120 80H20Z" fill="currentColor" className="text-white opacity-50" />
            </svg>
        </div>
        
        <div className="relative z-10 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} shrink-0 backdrop-blur-md`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
                <p className="text-[12px] font-semibold text-white font-bold mb-0.5 tracking-wide">{title}</p>
                <div className="text-2xl font-bold text-white tracking-tight mb-1">{value}</div>
                <p className="text-[10px] text-white font-bold font-bold">{subtitle}</p>
            </div>
        </div>
    </div>
);

export default function ResidentDocumentsPage() {
    const user = useSelector((state) => state.auth.user);
    const { data: documentsData, isLoading: isLoadingDocs } = useGetDocumentsQuery();
    const documents = documentsData?.data?.documents || [];
    const { data: vehiclesData } = useGetMyVehiclesQuery();
    const vehicles = vehiclesData?.data?.vehicles || [];

    const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();
    const [downloadDocument] = useLazyDownloadDocumentQuery();
    const [deleteDocument] = useDeleteDocumentMutation();

    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [activeTab, setActiveTab] = useState('MY_DOCS');

    // Filters & View
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('NEWEST');
    const [viewMode, setViewMode] = useState('LIST');

    // form state
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('IDENTITY');
    const [documentType, setDocumentType] = useState('AADHAAR');
    const [customDocumentType, setCustomDocumentType] = useState('');
    const [visibility, setVisibility] = useState('PRIVATE');
    const [selectedVehicleId, setSelectedVehicleId] = useState('');

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
        formData.append('ownerType', 'RESIDENT');
        const ownerId = user.residentId || user._id || user.id || user.sub;
        if (ownerId) {
            formData.append('ownerId', ownerId);
        }
        if (category === 'VEHICLE' && selectedVehicleId) {
            formData.append('vehicleId', selectedVehicleId);
        }
        formData.append('visibility', visibility || 'PRIVATE');

        try {
            await uploadDocument(formData).unwrap();
            toast.success('Document uploaded successfully');
            setUploadModalVisible(false);
            setFileList([]);
            setTitle('');
            setCategory('IDENTITY');
            setDocumentType('AADHAAR');
            setSelectedVehicleId('');
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

    const userId = user?._id || user?.id || user?.sub;

    const myDocs = documents.filter(d => {
        const upId = d.uploadedBy?._id || d.uploadedBy?.id || d.uploadedBy;
        return upId && userId && String(upId) === String(userId);
    });

    const societyDocs = documents.filter(d => {
        const upId = d.uploadedBy?._id || d.uploadedBy?.id || d.uploadedBy;
        return upId && userId && String(upId) !== String(userId) && d.category === 'SOCIETY';
    });

    const activeDocs = activeTab === 'MY_DOCS' ? myDocs : societyDocs;

    // Determine visual status
    const getDocStatus = (doc) => {
        if (doc.expiryDate && new Date(doc.expiryDate) < new Date()) return 'EXPIRED';
        if (doc.isVerified) return 'VERIFIED';
        if (doc.status === 'PENDING') return 'PENDING';
        return 'VERIFIED'; // Default to verified if active for UI purposes if not explicitly pending
    };

    // Stats
    const totalDocsCount = activeDocs.length;
    const verifiedCount = activeDocs.filter(d => getDocStatus(d) === 'VERIFIED').length;
    const pendingCount = activeDocs.filter(d => getDocStatus(d) === 'PENDING').length;
    const expiredCount = activeDocs.filter(d => getDocStatus(d) === 'EXPIRED').length;

    // Filters and Sorting
    const filteredDocs = activeDocs.filter(d => {
        const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.documentType.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = categoryFilter === 'ALL' || d.category === categoryFilter;
        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        if (sortOrder === 'NEWEST') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortOrder === 'OLDEST') return new Date(a.createdAt) - new Date(b.createdAt);
        return 0;
    });

    const getFileExtension = (url) => {
        if (!url) return 'PDF';
        const parts = url.split('.');
        return parts[parts.length - 1].toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-indigo-400" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">My Documents</h1>
                        <p className="text-white font-bold text-sm mt-1">Store and manage all your personal and society documents securely.</p>
                    </div>
                </div>
                <Button
                    onClick={() => setUploadModalVisible(true)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 shadow-[0_4px_15px_rgba(99,102,241,0.4)] flex items-center gap-2 hover:opacity-90 transition-all font-semibold"
                >
                    <Upload className="w-4 h-4" /> Upload Document
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard 
                    icon={Folder}
                    title="Total Documents"
                    value={totalDocsCount}
                    subtitle="All uploaded documents"
                    iconBg="bg-[#3e248a]/50"
                    iconColor="text-[#b388ff]"
                    gradient="from-[#2e1d5e]/80 to-[#1c1439]"
                    onClick={() => setActiveTab('MY_DOCS')}
                />
                <StatCard 
                    icon={ShieldCheck}
                    title="Verified"
                    value={verifiedCount}
                    subtitle="Documents verified"
                    iconBg="bg-[#1a4d35]/50"
                    iconColor="text-[#4ade80]"
                    gradient="from-[#123625]/80 to-[#0a1f15]"
                />
                <StatCard 
                    icon={Clock}
                    title="Pending Review"
                    value={pendingCount}
                    subtitle="Awaiting verification"
                    iconBg="bg-[#6b4819]/50"
                    iconColor="text-[#f59e0b]"
                    gradient="from-[#4a3212]/80 to-[#261909]"
                />
                <StatCard 
                    icon={FileWarning}
                    title="Expired"
                    value={expiredCount}
                    subtitle="Requires attention"
                    iconBg="bg-[#6b1e28]/50"
                    iconColor="text-[#f87171]"
                    gradient="from-[#4a1216]/80 to-[#2b0a0d]"
                />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 mt-6 gap-6">
                <button
                    onClick={() => setActiveTab('MY_DOCS')}
                    className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === 'MY_DOCS' ? 'text-indigo-400' : 'text-white font-bold hover:text-white font-bold'}`}
                >
                    My Documents
                    {activeTab === 'MY_DOCS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('SOCIETY')}
                    className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === 'SOCIETY' ? 'text-indigo-400' : 'text-white font-bold hover:text-white font-bold'}`}
                >
                    Society Documents
                    {activeTab === 'SOCIETY' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full"></div>}
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="relative w-full lg:w-[400px]">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search documents by name or category..."
                        className="w-full bg-[#131525] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:flex-none min-w-[160px]">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="appearance-none w-full bg-[#131525] border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold text-white font-bold focus:outline-none hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <option value="ALL">All Categories</option>
                            <option value="IDENTITY">Identity Proof</option>
                            <option value="RESIDENTIAL">Property / Residential</option>
                            <option value="VEHICLE">Vehicle Document</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative flex-1 sm:flex-none min-w-[160px]">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="appearance-none w-full bg-[#131525] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm font-bold text-white font-bold focus:outline-none hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <option value="NEWEST">Sort By: Newest</option>
                            <option value="OLDEST">Sort By: Oldest</option>
                        </select>
                        <List className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="flex items-center gap-1 bg-[#131525] border border-white/10 p-1 rounded-xl shrink-0">
                        <button
                            onClick={() => setViewMode('GRID')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'GRID' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-white font-bold'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'LIST' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-white font-bold'}`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Table (List View) */}
            {viewMode === 'LIST' && (
                <div className="bg-[#131525] border border-white/5 rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="px-6 py-4 text-[11px] font-bold text-white font-bold uppercase tracking-wider">Document</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-white font-bold uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-white font-bold uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-white font-bold uppercase tracking-wider">Uploaded On</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-white font-bold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-white font-bold uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoadingDocs ? (
                                    <tr><td colSpan="6" className="py-12 text-center text-slate-500 font-bold"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div></td></tr>
                                ) : filteredDocs.length === 0 ? (
                                    <tr><td colSpan="6" className="py-16 text-center text-white font-bold font-bold">No documents found.</td></tr>
                                ) : filteredDocs.map(d => {
                                    const docStatus = getDocStatus(d);
                                    const ext = getFileExtension(d.fileUrl);
                                    return (
                                        <tr key={d._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-10 rounded shadow-sm flex items-center justify-center shrink-0 border relative overflow-hidden
                                                        ${ext === 'PDF' ? 'bg-red-500/10 border-red-500/20' : ext === 'JPG' || ext === 'PNG' || ext === 'JPEG' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-indigo-500/10 border-indigo-500/20'}`}
                                                    >
                                                        <span className={`text-[10px] font-bold tracking-wider relative z-10 
                                                            ${ext === 'PDF' ? 'text-red-400' : ext === 'JPG' || ext === 'PNG' || ext === 'JPEG' ? 'text-blue-400' : 'text-indigo-400'}`}>
                                                            {ext}
                                                        </span>
                                                        <div className={`absolute bottom-0 left-0 right-0 h-1/3 opacity-20
                                                            ${ext === 'PDF' ? 'bg-red-500' : ext === 'JPG' || ext === 'PNG' || ext === 'JPEG' ? 'bg-blue-500' : 'bg-indigo-500'}`}>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm leading-tight">{d.title}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{d.title.toLowerCase().replace(/\s+/g, '_')}.{ext.toLowerCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 text-xs font-semibold text-indigo-400">
                                                    {d.category.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-white font-bold">
                                                {(d.documentType === 'OTHER' && d.customDocumentType) ? d.customDocumentType : d.documentType.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-white font-bold">
                                                {new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                <br />
                                                <span className="text-slate-500">{new Date(d.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold
                                                    ${docStatus === 'VERIFIED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                        docStatus === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                            'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                                    {docStatus === 'VERIFIED' ? <ShieldCheck size={12} /> : docStatus === 'PENDING' ? <Clock size={12} /> : <FileWarning size={12} />}
                                                    {docStatus === 'VERIFIED' ? 'Verified' : docStatus === 'PENDING' ? 'Pending Review' : 'Expired'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleDownload(d._id)} className="p-1.5 text-white font-bold hover:text-indigo-400 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10">
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(d._id)} className="p-1.5 text-white font-bold hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 bg-white/[0.01]">
                            <span>Showing 1 to {filteredDocs.length} of {activeDocs.length} documents</span>
                            <div className="flex gap-1">
                                <button className="w-6 h-6 rounded border border-white/10 flex items-center justify-center hover:bg-white/5">«</button>
                                <button className="w-6 h-6 rounded border border-indigo-500 bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center">1</button>
                                <button className="w-6 h-6 rounded border border-white/10 flex items-center justify-center hover:bg-white/5">2</button>
                                <button className="w-6 h-6 rounded border border-white/10 flex items-center justify-center hover:bg-white/5">3</button>
                                <button className="w-6 h-6 rounded border border-white/10 flex items-center justify-center hover:bg-white/5">»</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid View */}
            {viewMode === 'GRID' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {isLoadingDocs ? (
                        <div className="col-span-full py-12 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : filteredDocs.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-white font-bold font-bold">No documents found.</div>
                    ) : filteredDocs.map(d => {
                        const docStatus = getDocStatus(d);
                        const ext = getFileExtension(d.fileUrl);
                        return (
                            <div key={d._id} className="bg-[#131525] border border-white/5 rounded-2xl p-5 flex flex-col shadow-lg hover:border-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-14 rounded shadow-sm flex items-center justify-center shrink-0 border relative overflow-hidden
                                        ${ext === 'PDF' ? 'bg-red-500/10 border-red-500/20' : ext === 'JPG' || ext === 'PNG' || ext === 'JPEG' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-indigo-500/10 border-indigo-500/20'}`}
                                    >
                                        <span className={`text-[12px] font-bold tracking-wider relative z-10 
                                            ${ext === 'PDF' ? 'text-red-400' : ext === 'JPG' || ext === 'PNG' || ext === 'JPEG' ? 'text-blue-400' : 'text-indigo-400'}`}>
                                            {ext}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleDownload(d._id)} className="p-1.5 text-white font-bold hover:text-indigo-400 bg-white/5 rounded-lg transition-colors"><Download className="h-3.5 w-3.5" /></button>
                                        <button onClick={() => handleDelete(d._id)} className="p-1.5 text-white font-bold hover:text-red-400 bg-white/5 rounded-lg transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-white text-base break-words whitespace-normal">{d.title}</h3>
                                <p className="text-xs text-white font-bold mt-1 break-words whitespace-normal">{(d.documentType === 'OTHER' && d.customDocumentType) ? d.customDocumentType : d.documentType.replace('_', ' ')} • {d.category.replace('_', ' ')}</p>

                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-500">{new Date(d.createdAt).toLocaleDateString('en-GB')}</span>
                                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide
                                        ${docStatus === 'VERIFIED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                            docStatus === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                        {docStatus === 'VERIFIED' ? 'Verified' : docStatus === 'PENDING' ? 'Pending' : 'Expired'}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Upload Modal */}
            {uploadModalVisible && (
                <Modal
                    isOpen={true}
                    onClose={() => setUploadModalVisible(false)}
                    title="Upload Document"
                    theme="dark"
                    className="max-w-lg border border-white/10 shadow-2xl"
                >
                    <form onSubmit={handleUpload} className="space-y-4">
                        <Input
                            theme="dark"
                            label="Document Title"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. My Driving License"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                theme="dark"
                                label="Category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="IDENTITY">Identity Proof</option>
                                <option value="RESIDENTIAL">Property / Residential</option>
                                <option value="VEHICLE">Vehicle Document</option>
                            </Select>

                            <Select
                                theme="dark"
                                label="Document Type"
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                            >
                                <option value="AADHAAR">Aadhaar Card</option>
                                <option value="PAN">PAN Card</option>
                                <option value="DRIVING_LICENSE">Driving License</option>
                                <option value="RENT_AGREEMENT">Rent Agreement</option>
                                <option value="RC_BOOK">RC Book</option>
                                <option value="EMISSION_CERTIFICATE">Emission Certificate</option>
                                <option value="INSURANCE">Insurance</option>
                                <option value="OTHER">Other</option>
                            </Select>
                        </div>

                        {category === 'VEHICLE' && (
                            <Select
                                theme="dark"
                                label="Select Vehicle"
                                value={selectedVehicleId}
                                onChange={(e) => setSelectedVehicleId(e.target.value)}
                            >
                                <option value="">-- Select a Vehicle --</option>
                                {vehicles.map(v => (
                                    <option key={v._id} value={v._id}>{v.vehicleNumber}</option>
                                ))}
                            </Select>
                        )}

                        {documentType === 'OTHER' && (
                            <Input
                                theme="dark"
                                label="Specify Document Type"
                                required
                                value={customDocumentType}
                                onChange={(e) => setCustomDocumentType(e.target.value)}
                                placeholder="Enter document type"
                            />
                        )}

                        <Select
                            theme="dark"
                            label="Visibility"
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                        >
                            <option value="PRIVATE">Private (Only Me)</option>
                            <option value="MANAGEMENT">Management (Committee)</option>
                        </Select>

                        <div>
                            <label className="block text-sm font-semibold text-white font-bold mb-1.5">File (Max 10MB)</label>
                            <input
                                required
                                onChange={(e) => setFileList(e.target.files)}
                                type="file"
                                className="block w-full text-sm text-white font-bold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-white/10 file:text-sm file:font-semibold file:bg-white/5 file:text-indigo-400 hover:file:bg-white/10 transition-all cursor-pointer"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                            <Button type="button" variant="outline" className="border-white/20 text-white font-bold hover:bg-white/5" onClick={() => setUploadModalVisible(false)} disabled={isUploading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUploading} className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 shadow-[0_4px_15px_rgba(99,102,241,0.4)] hover:opacity-90 transition-all text-white font-bold">
                                {isUploading ? 'Uploading...' : 'Upload Document'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
