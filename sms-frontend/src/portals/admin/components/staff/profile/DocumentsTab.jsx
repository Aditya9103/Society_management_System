import React, { useState, useRef } from 'react';
import { FileText, Download, CheckCircle, ShieldAlert, Check, Upload } from 'lucide-react';
import Card from '../../../../../components/ui/Card';

export default function DocumentsTab({ user, profile, verifyDocument, isVerifying, uploadDocument, isUploading }) {
    const [verifyingDocId, setVerifyingDocId] = useState(null);
    const [uploadType, setUploadType] = useState('AADHAAR');
    const fileInputRef = useRef(null);

    const handleVerify = async (docId) => {
        if (!window.confirm('Are you sure you want to mark this document as verified?')) return;
        setVerifyingDocId(docId);
        try {
            await verifyDocument({ id: user._id, docId }).unwrap();
        } catch (error) {
            console.error('Failed to verify document', error);
            alert(error?.data?.message || 'Failed to verify document');
        } finally {
            setVerifyingDocId(null);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', uploadType);

        try {
            await uploadDocument({ id: user._id, formData }).unwrap();
            alert('Document uploaded successfully!');
        } catch (error) {
            console.error('Failed to upload document', error);
            alert(error?.data?.message || 'Failed to upload document');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const documents = profile?.documents || [];

    return (
        <div className="space-y-6">
            <Card className="bg-[#151921] border-white/5">
                <Card.Body className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#6338f0]" />
                            <h3 className="text-lg font-bold text-white">Uploaded Documents</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={uploadType}
                                onChange={(e) => setUploadType(e.target.value)}
                                className="bg-white/5 border border-white/10 text-white rounded-lg text-sm px-3 py-2 outline-none focus:border-[#6338f0]"
                            >
                                <option value="AADHAAR">Aadhaar</option>
                                <option value="PAN">PAN Card</option>
                                <option value="ADDRESS_PROOF">Address Proof</option>
                                <option value="PROFILE_PHOTO">Profile Photo</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/*,application/pdf"
                            />
                            <button
                                onClick={handleUploadClick}
                                disabled={isUploading}
                                className="px-4 py-2 bg-[#6338f0] hover:bg-[#5229db] text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(99,56,240,0.3)] disabled:opacity-50"
                            >
                                <Upload className="w-4 h-4" />
                                {isUploading ? 'Uploading...' : 'Upload Document'}
                            </button>
                        </div>
                    </div>

                    {documents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.map((doc) => (
                                <div key={doc._id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#6338f0]/10 flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5 text-[#6338f0]" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-200">{doc.type}</p>
                                                <p className="text-xs text-gray-200 font-bold">
                                                    Uploaded {new Date(doc.createdAt || Date.now()).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                        {doc.verified ? (
                                            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                VERIFIED
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold bg-amber-500/10 px-2.5 py-1 rounded-full">
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                                PENDING VERIFICATION
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            {!doc.verified && (
                                                <button
                                                    onClick={() => handleVerify(doc._id)}
                                                    disabled={isVerifying && verifyingDocId === doc._id}
                                                    className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Mark as Verified"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-white/5 text-white font-bold hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
                                                title="View Document"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-white/[0.02] rounded-xl border border-white/5">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-gray-600" />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">No Documents Found</h4>
                            <p className="text-sm text-white font-bold max-w-sm mb-6">
                                This staff member has not uploaded any documents yet. Upload Aadhaar, PAN, or Address Proof for verification.
                            </p>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}
