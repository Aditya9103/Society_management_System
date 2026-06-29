import React, { useState } from 'react';
import { useGetMyVehiclesQuery, useRegisterVehicleMutation, useDeleteMyVehicleMutation, useRegenerateVehicleQrMutation } from '../../../store/api/vehicleApi';
import { Car, Plus, QrCode, Trash2, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import QRCode from 'react-qr-code';
import { toast } from 'react-hot-toast';
import AddVehicleModal from '../components/vehicles/AddVehicleModal';

export default function ResidentVehiclePage() {
    const { data, isLoading } = useGetMyVehiclesQuery();
    const [registerVehicle, { isLoading: isRegistering }] = useRegisterVehicleMutation();
    const [deleteVehicle] = useDeleteMyVehicleMutation();
    const [regenerateQr, { isLoading: isRegenerating }] = useRegenerateVehicleQrMutation();

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedVehicleQR, setSelectedVehicleQR] = useState(null);

    const vehicles = data?.data?.vehicles || [];

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this vehicle?')) return;
        try {
            await deleteVehicle(id).unwrap();
            toast.success('Vehicle removed successfully');
        } catch (e) {
            toast.error(e?.data?.message || 'Failed to delete vehicle. It may be currently inside the society.');
        }
    };

    const handleRegenerate = async (id) => {
        if (!window.confirm('Generate a new QR Code? The old one will instantly become invalid.')) return;
        try {
            const res = await regenerateQr(id).unwrap();
            if (selectedVehicleQR?._id === id) {
                setSelectedVehicleQR(res.data.vehicle);
            }
            toast.success('QR Code regenerated successfully');
        } catch (e) {
            toast.error(e?.data?.message || 'Failed to regenerate QR');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Vehicles</h1>
                    <p className="text-slate-500">Manage your vehicles and access parking QR codes.</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Register Vehicle
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                </div>
            ) : vehicles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white">
                    <Car className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700">No Vehicles Registered</h3>
                    <p className="text-slate-500 mt-1 max-w-sm mx-auto">You haven't registered any vehicles yet. Add a vehicle to get your parking QR code.</p>
                    <Button onClick={() => setShowAddModal(true)} className="mt-6" variant="outline">Register First Vehicle</Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {vehicles.map(v => (
                        <div key={v._id} className="relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                                        <Car className="h-6 w-6" />
                                    </div>
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold
                                        ${v.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' :
                                          v.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-700' :
                                          v.status === 'BLOCKED' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {v.status === 'ACTIVE' && <CheckCircle2 className="h-3.5 w-3.5" />}
                                        {v.status === 'PENDING_APPROVAL' && <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />}
                                        {v.status === 'BLOCKED' && <ShieldAlert className="h-3.5 w-3.5" />}
                                        {v.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wide">{v.vehicleNumber}</h3>
                                <p className="text-sm font-medium text-slate-500 mb-4">{v.make || 'Unknown'} {v.model}</p>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b border-slate-50 pb-2">
                                        <span className="text-slate-500">Type</span>
                                        <span className="font-medium text-slate-700">{(v.vehicleType === 'OTHER' ? v.customVehicleType || 'OTHER' : v.vehicleType).replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-50 pb-2">
                                        <span className="text-slate-500">Color</span>
                                        <span className="font-medium text-slate-700">{v.color || '-'}</span>
                                    </div>
                                    <div className="flex justify-between pb-2">
                                        <span className="text-slate-500">Parking Slot</span>
                                        <span className="font-bold text-indigo-600">{v.parkingSlotId ? v.parkingSlotId.slotNumber : 'Unassigned'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 border-t border-slate-100 p-3 flex gap-2">
                                <Button 
                                    variant="primary" 
                                    className="flex-1 text-sm h-9" 
                                    disabled={v.status !== 'ACTIVE'}
                                    onClick={() => setSelectedVehicleQR(v)}
                                >
                                    <QrCode className="h-4 w-4 mr-1.5" /> View QR
                                </Button>
                                <Button variant="outline" className="px-3 h-9 text-red-600 hover:bg-red-50 border-red-200" onClick={() => handleDelete(v._id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* QR Code Modal */}
            {selectedVehicleQR && (
                <Modal isOpen={true} onClose={() => setSelectedVehicleQR(null)} title="Vehicle QR Pass">
                    <div className="flex flex-col items-center py-6 text-center">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 inline-block">
                            <QRCode value={selectedVehicleQR.qrToken} size={200} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 uppercase">{selectedVehicleQR.vehicleNumber}</h3>
                        <p className="text-slate-500 mb-6">Scan at the gate for automated entry & exit.</p>
                        
                        <div className="w-full flex gap-3">
                            <Button 
                                variant="outline" 
                                className="flex-1" 
                                onClick={() => handleRegenerate(selectedVehicleQR._id)}
                                isLoading={isRegenerating}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
                            </Button>
                            <Button className="flex-1" onClick={() => window.print()}>Print Pass</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Add Vehicle Modal */}
            {showAddModal && (
                <AddVehicleModal 
                    onClose={() => setShowAddModal(false)} 
                    onAdd={async (data) => {
                        try {
                            await registerVehicle(data).unwrap();
                            toast.success('Vehicle registered successfully!');
                            setShowAddModal(false);
                        } catch (err) {
                            toast.error(err?.data?.message || 'Failed to register vehicle');
                        }
                    }}
                    isLoading={isRegistering}
                />
            )}
        </div>
    );
}


