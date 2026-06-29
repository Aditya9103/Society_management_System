import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';

export default function AddVehicleModal({ onClose, onAdd, isLoading }) {
    const [form, setForm] = useState({
        vehicleNumber: '',
        vehicleType: 'TWO_WHEELER',
        customVehicleType: '',
        make: '',
        model: '',
        color: '',
        vehicleCategory: 'PERSONAL',
        yearOfManufacture: '',
        registrationState: '',
        rcPhotoUrl: '',
        vehiclePhotoUrl: '',
        isPrimary: false
    });

    const [isUploadingRc, setIsUploadingRc] = useState(false);
    const [isUploadingVehicle, setIsUploadingVehicle] = useState(false);

    const handleRcUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsUploadingRc(true);
            setTimeout(() => {
                setForm(prev => ({ ...prev, rcPhotoUrl: URL.createObjectURL(file) }));
                setIsUploadingRc(false);
            }, 800);
        }
    };

    const handleVehiclePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsUploadingVehicle(true);
            setTimeout(() => {
                setForm(prev => ({ ...prev, vehiclePhotoUrl: URL.createObjectURL(file) }));
                setIsUploadingVehicle(false);
            }, 800);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let processedData = { ...form };
        if (processedData.vehicleType !== 'OTHER') {
            delete processedData.customVehicleType;
        } else if (!processedData.customVehicleType?.trim()) {
            return alert('Please specify the custom vehicle type');
        }

        onAdd(processedData);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Register New Vehicle">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    label="Vehicle Number *" 
                    placeholder="e.g. MH 12 AB 1234" 
                    value={form.vehicleNumber}
                    onChange={e => setForm({...form, vehicleNumber: e.target.value.toUpperCase()})}
                    required
                />
                
                <Select
                    label="Vehicle Type *"
                    value={form.vehicleType}
                    onChange={e => setForm({...form, vehicleType: e.target.value})}
                >
                    <option value="BICYCLE">Bicycle</option>
                    <option value="TWO_WHEELER">Two Wheeler (Bike/Scooter)</option>
                    <option value="THREE_WHEELER">Three Wheeler</option>
                    <option value="FOUR_WHEELER">Four Wheeler (Car)</option>
                    <option value="ELECTRIC_VEHICLE">Electric Vehicle (EV)</option>
                    <option value="HEAVY_VEHICLE">Heavy Vehicle (Truck/Van)</option>
                    <option value="OTHER">Other</option>
                </Select>

                {form.vehicleType === 'OTHER' && (
                    <Input
                        label="Specify Vehicle Type *"
                        required
                        placeholder="e.g. Tractor"
                        value={form.customVehicleType}
                        onChange={e => setForm({ ...form, customVehicleType: e.target.value })}
                    />
                )}

                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="Make/Brand" 
                        placeholder="e.g. Honda" 
                        value={form.make}
                        onChange={e => setForm({...form, make: e.target.value})}
                    />
                    <Input 
                        label="Model" 
                        placeholder="e.g. City" 
                        value={form.model}
                        onChange={e => setForm({...form, model: e.target.value})}
                    />
                </div>

                <Input 
                    label="Color" 
                    placeholder="e.g. White" 
                    value={form.color}
                    onChange={e => setForm({...form, color: e.target.value})}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Category"
                        value={form.vehicleCategory}
                        onChange={e => setForm({...form, vehicleCategory: e.target.value})}
                    >
                        <option value="PERSONAL">Personal</option>
                        <option value="COMMERCIAL">Commercial</option>
                    </Select>
                    
                    <Input 
                        label="Year of Manufacture" 
                        type="number"
                        placeholder="e.g. 2023" 
                        value={form.yearOfManufacture}
                        onChange={e => setForm({...form, yearOfManufacture: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <Input 
                        label="Registration State" 
                        placeholder="e.g. Maharashtra" 
                        value={form.registrationState}
                        onChange={e => setForm({...form, registrationState: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Vehicle Document (Any)
                        </label>
                        <div className="flex flex-col gap-2">
                            <input 
                                type="file" 
                                accept="image/*,.pdf"
                                onChange={handleRcUpload}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                            />
                            {isUploadingRc && <span className="text-sm text-indigo-600 animate-pulse">Uploading...</span>}
                            {form.rcPhotoUrl && !isUploadingRc && <span className="text-sm text-green-600 font-medium">✓ Document Uploaded</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Vehicle Image
                        </label>
                        <div className="flex flex-col gap-2">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleVehiclePhotoUpload}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                            />
                            {isUploadingVehicle && <span className="text-sm text-indigo-600 animate-pulse">Uploading...</span>}
                            {form.vehiclePhotoUrl && !isUploadingVehicle && <span className="text-sm text-green-600 font-medium">✓ Image Uploaded</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-2 pb-2">
                    <input 
                        type="checkbox" 
                        id="isPrimary"
                        checked={form.isPrimary}
                        onChange={e => setForm({...form, isPrimary: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="isPrimary" className="text-sm font-medium text-slate-700 cursor-pointer">
                        Set as Primary Vehicle
                    </label>
                </div>

                {/* Read-Only Info Box explaining automatic coupling */}
                <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex gap-3 text-sm text-indigo-900">
                    <div className="mt-0.5 text-indigo-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-semibold mb-1">Vehicle Verification</p>
                        <p className="text-indigo-700">Your vehicle is automatically coupled with your identity and unit. Admin will verify these details and assign your parking slot soon.</p>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>Register Vehicle</Button>
                </div>
            </form>
        </Modal>
    );
}
