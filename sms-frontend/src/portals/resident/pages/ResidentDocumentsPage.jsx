import { useState } from 'react';
import { Download, Upload, X, Trash2 } from 'lucide-react';
import { 
    useGetDocumentsQuery, 
    useUploadDocumentMutation, 
    useLazyDownloadDocumentQuery,
    useDeleteDocumentMutation
} from '../../../store/api/documentApi';
import { useGetMyVehiclesQuery } from '../../../store/api/vehicleApi';
import { useSelector } from 'react-redux';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

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
        const ownerId = user.residentId || user._id || user.id;
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

    const userId = user?._id || user?.id;
    
    const myDocs = documents.filter(d => {
        const upId = d.uploadedBy?._id || d.uploadedBy?.id || d.uploadedBy;
        return upId && userId && String(upId) === String(userId);
    });
    
    const societyDocs = documents.filter(d => {
        const upId = d.uploadedBy?._id || d.uploadedBy?.id || d.uploadedBy;
        return upId && userId && String(upId) !== String(userId) && d.category === 'SOCIETY';
    });

    const renderTable = (data) => (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto mt-4">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 whitespace-nowrap">
                    <tr>
                        <th className="p-4 font-semibold">Title</th>
                        <th className="p-4 font-semibold">Category</th>
                        <th className="p-4 font-semibold">Type</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {isLoadingDocs && data.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center">Loading...</td></tr>
                    ) : data.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center">No documents found.</td></tr>
                    ) : data.map(d => (
                        <tr key={d._id} className="hover:bg-slate-50">
                            <td className="p-4 font-bold text-slate-800">{d.title}</td>
                            <td className="p-4"><span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">{d.category}</span></td>
                            <td className="p-4">{d.documentType === 'OTHER' && d.customDocumentType ? d.customDocumentType : d.documentType}</td>
                            <td className="p-4">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold
                                    ${d.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                      d.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                      d.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {d.status}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleDownload(d._id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Download"><Download className="h-4 w-4" /></button>
                                    <button onClick={() => handleDelete(d._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Documents</h1>
                    <p className="text-slate-500">Manage your personal and society documents.</p>
                </div>
                <Button onClick={() => setUploadModalVisible(true)} className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Document
                </Button>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                <button 
                    onClick={() => setActiveTab('MY_DOCS')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === 'MY_DOCS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    My Documents
                </button>
                <button 
                    onClick={() => setActiveTab('SOCIETY')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === 'SOCIETY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Society Documents
                </button>
            </div>

            {activeTab === 'MY_DOCS' ? renderTable(myDocs) : renderTable(societyDocs)}

            {/* Modal Replacement using native Tailwind classes */}
            {uploadModalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Upload Personal Document</h2>
                            <button type="button" onClick={() => setUploadModalVisible(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
                                <input required value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="e.g. My Driving License" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="IDENTITY">Identity Proof</option>
                                    <option value="RESIDENTIAL">Property / Residential</option>
                                    <option value="VEHICLE">Vehicle Document</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                                <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="AADHAAR">Aadhaar Card</option>
                                    <option value="PAN">PAN Card</option>
                                    <option value="DRIVING_LICENSE">Driving License</option>
                                    <option value="RENT_AGREEMENT">Rent Agreement</option>
                                    <option value="RC_BOOK">RC Book</option>
                                    <option value="EMISSION_CERTIFICATE">Emission Certificate</option>
                                    <option value="INSURANCE">Insurance</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            {category === 'VEHICLE' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Vehicle</label>
                                    <select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        <option value="">-- Select a Vehicle --</option>
                                        {vehicles.map(v => (
                                            <option key={v._id} value={v._id}>{v.vehicleNumber}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {documentType === 'OTHER' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Specify Document Type</label>
                                    <input required value={customDocumentType} onChange={(e) => setCustomDocumentType(e.target.value)} type="text" className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Enter document type" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
                                <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="PRIVATE">Private (Only Me)</option>
                                    <option value="MANAGEMENT">Management (Committee)</option>
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
