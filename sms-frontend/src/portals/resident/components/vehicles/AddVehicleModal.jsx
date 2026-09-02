import React, { useState } from 'react';
import toast from 'react-hot-toast';
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
        fuelType: 'PETROL',
        vehicleCategory: 'PERSONAL',
        yearOfManufacture: '',
        registrationState: '',
        insuranceExpiry: '',
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
            return toast.error('Please specify the custom vehicle type');
        }

        onAdd(processedData);
    };

    return (
        <Modal 
            isOpen={true} 
            onClose={onClose} 
            title="Register New Vehicle"
            theme="dark"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input theme="dark" 
                    label="Vehicle Number *" 
                    placeholder="e.g. MH 12 AB 1234" 
                    value={form.vehicleNumber}
                    onChange={e => setForm({...form, vehicleNumber: e.target.value.toUpperCase()})}
                    required
                />
                
                <Select theme="dark"
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
                    <Input theme="dark"
                        label="Specify Vehicle Type *"
                        required
                        placeholder="e.g. Tractor"
                        value={form.customVehicleType}
                        onChange={e => setForm({ ...form, customVehicleType: e.target.value })}
                    />
                )}

                <div className="grid grid-cols-2 gap-4">
                    <Input theme="dark" 
                        label="Make/Brand" 
                        placeholder="e.g. Honda" 
                        value={form.make}
                        onChange={e => setForm({...form, make: e.target.value})}
                    />
                    <Input theme="dark" 
                        label="Model" 
                        placeholder="e.g. City" 
                        value={form.model}
                        onChange={e => setForm({...form, model: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input theme="dark" 
                        label="Color" 
                        placeholder="e.g. White" 
                        value={form.color}
                        onChange={e => setForm({...form, color: e.target.value})}
                    />
                    <Select theme="dark"
                        label="Fuel Type"
                        value={form.fuelType}
                        onChange={e => setForm({...form, fuelType: e.target.value})}
                    >
                        <option value="PETROL">Petrol</option>
                        <option value="DIESEL">Diesel</option>
                        <option value="ELECTRIC">Electric</option>
                        <option value="CNG">CNG</option>
                        <option value="HYBRID">Hybrid</option>
                        <option value="OTHER">Other</option>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select theme="dark"
                        label="Category"
                        value={form.vehicleCategory}
                        onChange={e => setForm({...form, vehicleCategory: e.target.value})}
                    >
                        <option value="PERSONAL">Personal</option>
                        <option value="COMMERCIAL">Commercial</option>
                    </Select>
                    
                    <Input theme="dark" 
                        label="Year of Manufacture" 
                        type="number"
                        placeholder="e.g. 2023" 
                        value={form.yearOfManufacture}
                        onChange={e => setForm({...form, yearOfManufacture: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input theme="dark" 
                        label="Registration State" 
                        placeholder="e.g. Maharashtra" 
                        value={form.registrationState}
                        onChange={e => setForm({...form, registrationState: e.target.value})}
                    />
                    <Input theme="dark" 
                        label="Insurance Expiry" 
                        type="date"
                        value={form.insuranceExpiry}
                        onChange={e => setForm({...form, insuranceExpiry: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-white font-bold mb-1.5">
                            Vehicle Document (Any)
                        </label>
                        <div className="flex flex-col gap-2">
                            <input 
                                type="file" 
                                accept="image/*,.pdf"
                                onChange={handleRcUpload}
                                className="block w-full text-sm text-white font-bold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-white/10 file:text-sm file:font-semibold file:bg-white/5 file:text-indigo-400 hover:file:bg-white/10 transition-all cursor-pointer"
                            />
                            {isUploadingRc && <span className="text-sm text-indigo-400 animate-pulse">Uploading...</span>}
                            {form.rcPhotoUrl && !isUploadingRc && <span className="text-sm text-emerald-400 font-bold">✓ Document Uploaded</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-white font-bold mb-1.5">
                            Vehicle Image
                        </label>
                        <div className="flex flex-col gap-2">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleVehiclePhotoUpload}
                                className="block w-full text-sm text-white font-bold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-white/10 file:text-sm file:font-semibold file:bg-white/5 file:text-indigo-400 hover:file:bg-white/10 transition-all cursor-pointer"
                            />
                            {isUploadingVehicle && <span className="text-sm text-indigo-400 animate-pulse">Uploading...</span>}
                            {form.vehiclePhotoUrl && !isUploadingVehicle && <span className="text-sm text-emerald-400 font-bold">✓ Image Uploaded</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2 pb-2">
                    <input 
                        type="checkbox" 
                        id="isPrimary"
                        checked={form.isPrimary}
                        onChange={e => setForm({...form, isPrimary: e.target.checked})}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 transition-all cursor-pointer"
                    />
                    <label htmlFor="isPrimary" className="text-sm font-bold text-white font-bold cursor-pointer select-none">
                        Set as Primary Vehicle
                    </label>
                </div>

                {/* Read-Only Info Box explaining automatic coupling */}
                <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20 flex gap-3 text-sm text-indigo-200">
                    <div className="mt-0.5 text-indigo-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-semibold mb-1">Vehicle Verification</p>
                        <p className="text-indigo-700">Your vehicle is automatically coupled with your identity and unit. Admin will verify these details and assign your parking slot soon.</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                    <Button type="button" variant="outline" className="border-white/20 text-white font-bold hover:bg-white/5" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 shadow-[0_4px_15px_rgba(99,102,241,0.4)] hover:opacity-90 transition-all text-white font-bold">
                        {isLoading ? 'Registering...' : 'Register Vehicle'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
