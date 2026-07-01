import React, { useState } from 'react';
import { useGetAllVehiclesQuery, useApproveVehicleMutation, useRejectVehicleMutation, useBlockVehicleMutation, useGetVehicleLogsQuery } from '../../../store/api/vehicleApi';
import { useLazyGetDocumentsQuery, useDeleteDocumentMutation } from '../../../store/api/documentApi';
import { Check, X, ShieldAlert, Car, MapPin, Clock, FileText, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';

function ViewVehicleDocsModal({ isOpen, onClose, vehicleId }) {
    const [trigger, { data, isFetching }] = useLazyGetDocumentsQuery();

    React.useEffect(() => {
        if (isOpen && vehicleId) {
            trigger({ vehicleId: vehicleId });
        }
    }, [isOpen, vehicleId, trigger]);

    const [deleteDocument] = useDeleteDocumentMutation();

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

    const docs = data?.data?.documents || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Vehicle Documents">
            <div className="p-4 space-y-4">
                {isFetching ? (
                    <div className="text-center py-4 text-slate-500">Loading documents...</div>
                ) : docs.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No documents linked to this vehicle.</div>
                ) : (
                    <div className="space-y-3">
                        {docs.map(doc => (
                            <div key={doc._id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-indigo-500" />
                                    <div>
                                        <p className="font-semibold text-slate-800">{doc.title}</p>
                                        <p className="text-xs text-slate-500">{doc.documentType.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100" title="Download">
                                        <Download className="h-4 w-4" />
                                    </a>
                                    <button onClick={() => handleDelete(doc._id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Delete">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}

export default function AdminVehiclePage() {
    const [activeTab, setActiveTab] = useState('VEHICLES');
    const [docsModal, setDocsModal] = useState({ open: false, vehicleId: '' });
    
    const { data: vehiclesData, isLoading: isLoadingVehicles } = useGetAllVehiclesQuery(undefined, { skip: activeTab !== 'VEHICLES' });
    const { data: logsData, isLoading: isLoadingLogs } = useGetVehicleLogsQuery(undefined, { skip: activeTab !== 'LOGS' });

    const [approveVehicle] = useApproveVehicleMutation();
    const [rejectVehicle] = useRejectVehicleMutation();
    const [blockVehicle] = useBlockVehicleMutation();

    const vehicles = vehiclesData?.data?.vehicles || [];
    const logs = logsData?.data?.logs || [];

    const handleApprove = async (id) => {
        if (window.confirm('Approve this vehicle registration?')) {
            await approveVehicle(id);
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Reason for rejection:');
        if (reason !== null) {
            await rejectVehicle({ id, reason });
        }
    };

    const handleBlock = async (id) => {
        const reason = window.prompt('Reason for blocking this vehicle:');
        if (reason !== null) {
            await blockVehicle({ id, reason });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Vehicle Management</h1>
                    <p className="text-slate-500">Manage society vehicles, approvals, and logs.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('VEHICLES')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === 'VEHICLES' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Directory & Approvals
                    </button>
                    <button 
                        onClick={() => setActiveTab('LOGS')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === 'LOGS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Entry/Exit Logs
                    </button>
                </div>
            </div>

            {activeTab === 'VEHICLES' && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold">Vehicle</th>
                                <th className="p-4 font-semibold">Resident</th>
                                <th className="p-4 font-semibold">Flat/Unit</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoadingVehicles ? (
                                <tr><td colSpan="5" className="p-8 text-center">Loading...</td></tr>
                            ) : vehicles.map(v => (
                                <tr key={v._id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{v.vehicleNumber}</div>
                                        <div className="text-xs text-slate-500">{v.make} {v.model} ({v.color})</div>
                                    </td>
                                    <td className="p-4 font-medium">{v.residentId?.firstName} {v.residentId?.lastName}</td>
                                    <td className="p-4">{v.unitId?.unitNumber}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold
                                            ${v.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                              v.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                                              v.status === 'BLOCKED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {v.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setDocsModal({ open: true, vehicleId: v._id })}>
                                                Docs
                                            </Button>
                                            {v.status === 'PENDING_APPROVAL' && (
                                                <>
                                                    <button onClick={() => handleApprove(v._id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Approve"><Check className="h-4 w-4" /></button>
                                                    <button onClick={() => handleReject(v._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject"><X className="h-4 w-4" /></button>
                                                </>
                                            )}
                                            {v.status === 'ACTIVE' && (
                                                <button onClick={() => handleBlock(v._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Block"><ShieldAlert className="h-4 w-4" /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'LOGS' && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold">Vehicle No.</th>
                                <th className="p-4 font-semibold">Event Type</th>
                                <th className="p-4 font-semibold">Gate & Guard</th>
                                <th className="p-4 font-semibold">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoadingLogs ? (
                                <tr><td colSpan="4" className="p-8 text-center">Loading...</td></tr>
                            ) : logs.map(log => (
                                <tr key={log._id} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold text-slate-800">{log.vehicleNumber}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${log.status === 'ENTRY' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {log.gateId?.name || 'Gate'}</div>
                                        <div className="text-xs text-slate-500">by {log.guardId?.name || 'Guard'}</div>
                                    </td>
                                    <td className="p-4 text-xs">
                                        <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {log.status === 'ENTRY' ? new Date(log.entryTime).toLocaleString() : new Date(log.exitTime).toLocaleString()}</div>
                                        {log.status === 'EXIT' && log.durationMinutes && <div className="text-slate-500">Duration: {log.durationMinutes} mins</div>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ViewVehicleDocsModal 
                isOpen={docsModal.open} 
                onClose={() => setDocsModal({ open: false, vehicleId: '' })} 
                vehicleId={docsModal.vehicleId} 
            />
        </div>
    );
}
