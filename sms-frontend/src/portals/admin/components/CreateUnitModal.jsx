/**
 * CreateUnitModal.jsx — Modal to create a new unit in a floor or edit an existing one.
 * Uses global components from src/components/ui/.
 */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    useCreateUnitMutation,
    useUpdateUnitMutation,
    useListTowersQuery,
    useListFloorsQuery,
} from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import Alert from '../../../components/ui/Alert';

const BHK_TYPES = ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'VILLA', 'DUPLEX', 'PENTHOUSE'];
const UNIT_TYPES = ['RESIDENTIAL', 'COMMERCIAL', 'SHOP', 'OFFICE'];

export default function CreateUnitModal({ isOpen, onClose, initialData = null }) {
    const isEdit = !!initialData;
    const [createUnit, { isLoading: isCreating }] = useCreateUnitMutation();
    const [updateUnit, { isLoading: isUpdating }] = useUpdateUnitMutation();
    const isLoading = isCreating || isUpdating;

    const [errorMsg, setErrorMsg] = useState(null);
    const [selectedTowerId, setSelectedTowerId] = useState('');
    const [isBulk, setIsBulk] = useState(false);

    const { data: towersData } = useListTowersQuery();
    const towers = Array.isArray(towersData?.data) ? towersData.data : [];

    const { data: floorsData } = useListFloorsQuery(selectedTowerId, { skip: !selectedTowerId });
    const floors = Array.isArray(floorsData?.data) ? floorsData.data : [];

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setSelectedTowerId(initialData.towerId?._id || initialData.towerId);
                reset({
                    towerId: initialData.towerId?._id || initialData.towerId,
                    floorId: initialData.floorId?._id || initialData.floorId,
                    unitNumber: initialData.unitNumber,
                    unitType: initialData.unitType || 'RESIDENTIAL',
                    bhkType: initialData.bhkType || '',
                    carpetAreaSqft: initialData.carpetAreaSqft || 0,
                    builtUpAreaSqft: initialData.builtUpAreaSqft || 0,
                    maintenanceAmount: initialData.maintenanceAmount || 0,
                    parkingSlots: initialData.parkingSlots || 0,
                });
                setIsBulk(false);
            } else {
                setSelectedTowerId('');
                reset({
                    towerId: '',
                    floorId: '',
                    unitNumber: '',
                    unitType: 'RESIDENTIAL',
                    bhkType: '',
                    carpetAreaSqft: '',
                    builtUpAreaSqft: '',
                    maintenanceAmount: '',
                    parkingSlots: '',
                });
            }
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = async (formData) => {
        setErrorMsg(null);
        try {
            const createSingleUnit = (unitNum) => {
                return createUnit({
                    towerId: formData.towerId,
                    floorId: formData.floorId,
                    unitNumber: unitNum,
                    unitType: formData.unitType,
                    bhkType: formData.bhkType || null,
                    carpetAreaSqft: Number(formData.carpetAreaSqft) || 0,
                    builtUpAreaSqft: Number(formData.builtUpAreaSqft) || 0,
                    maintenanceAmount: Number(formData.maintenanceAmount) || 0,
                    parkingSlots: Number(formData.parkingSlots) || 0,
                }).unwrap();
            };

            if (isEdit) {
                await updateUnit({
                    id: initialData._id,
                    towerId: formData.towerId,
                    floorId: formData.floorId,
                    unitNumber: formData.unitNumber,
                    unitType: formData.unitType,
                    bhkType: formData.bhkType || null,
                    carpetAreaSqft: Number(formData.carpetAreaSqft) || 0,
                    builtUpAreaSqft: Number(formData.builtUpAreaSqft) || 0,
                    maintenanceAmount: Number(formData.maintenanceAmount) || 0,
                    parkingSlots: Number(formData.parkingSlots) || 0,
                }).unwrap();
            } else {
                if (isBulk) {
                    const start = parseInt(formData.startNumber, 10);
                    const end = parseInt(formData.endNumber, 10);

                    if (isNaN(start) || isNaN(end)) {
                        setErrorMsg('Start and End numbers must be valid integers.');
                        return;
                    }
                    if (start > end) {
                        setErrorMsg('Start number must be less than or equal to end number.');
                        return;
                    }
                    if (end - start >= 50) {
                        setErrorMsg('You can create up to 50 units at a time to prevent timeout.');
                        return;
                    }

                    const prefix = formData.unitPrefix || '';

                    // We'll run them sequentially to avoid overwhelming the server or DB constraints in parallel
                    for (let i = start; i <= end; i++) {
                        const numStr = i.toString().padStart(formData.startNumber.length, '0');
                        await createSingleUnit(`${prefix}${numStr}`);
                    }
                } else {
                    await createSingleUnit(formData.unitNumber);
                }
            }

            reset();
            setSelectedTowerId('');
            setIsBulk(false);
            onClose();
        } catch (err) {
            setErrorMsg(err?.data?.message ?? `Failed to ${isEdit ? 'update' : 'create'} unit(s). Please try again.`);
        }
    };

    const handleClose = () => {
        reset();
        setErrorMsg(null);
        setSelectedTowerId('');
        setIsBulk(false);
        onClose();
    };

    return (
        <div className={`fixed inset-0 flex items-center justify-center p-4 z-[99999] sm:p-6 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
                onClick={handleClose} 
            />
            
            <div 
                className={`relative z-10 w-full max-w-2xl rounded-[24px] bg-[#0c0d14] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
            >
                {/* Header Background Glow */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />

                <div className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-8 sm:py-6 border-b border-white/5 relative z-10">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            {isEdit ? 'Edit Unit' : 'Create New Unit(s)'}
                        </h2>
                        <p className="text-sm text-gray-300 mt-1 font-semibold">
                            {isEdit ? "Update unit details." : "Add one or multiple flats/units to a floor."}
                        </p>
                    </div>
                    <button 
                        type="button" 
                        onClick={handleClose} 
                        className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:rotate-90 transition-all duration-300"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto p-6 sm:p-8 relative z-10 custom-scrollbar">
                    <form id="create-unit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {errorMsg && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                {errorMsg}
                            </div>
                        )}

                        {/* Location Section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest border-b border-white/5 pb-2">Location</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">Tower</label>
                                    <select
                                        {...register('towerId', {
                                            required: 'Select a tower',
                                            onChange: (e) => setSelectedTowerId(e.target.value),
                                        })}
                                        className={`w-full bg-[#151722] border ${errors.towerId ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:border-violet-500/50 transition-all`}
                                    >
                                        <option value="">Select tower</option>
                                        {towers.map((t) => (
                                            <option key={t._id} value={t._id}>{t.name} ({t.code})</option>
                                        ))}
                                    </select>
                                    {errors.towerId && <p className="text-xs font-medium text-red-400 mt-1 pl-1">{errors.towerId.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">Floor</label>
                                    <select
                                        {...register('floorId', { required: 'Select a floor' })}
                                        disabled={!selectedTowerId}
                                        className={`w-full bg-[#151722] border ${errors.floorId ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:border-violet-500/50 transition-all disabled:opacity-50`}
                                    >
                                        <option value="">Select floor</option>
                                        {floors.map((f) => (
                                            <option key={f._id} value={f._id}>{f.floorName}</option>
                                        ))}
                                    </select>
                                    {errors.floorId && <p className="text-xs font-medium text-red-400 mt-1 pl-1">{errors.floorId.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Unit Details Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest">Unit Details</h3>
                                {!isEdit && (
                                    <label className="flex items-center gap-2 cursor-pointer text-[13px] font-bold text-gray-300 hover:text-white transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={isBulk}
                                            onChange={(e) => setIsBulk(e.target.checked)}
                                            className="w-4 h-4 rounded-md border-white/10 bg-[#151722] text-violet-600 focus:ring-violet-500/20 focus:ring-offset-[#151722]"
                                        />
                                        Bulk Creation (Range)
                                    </label>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {!isBulk ? (
                                    <div className="space-y-2">
                                        <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">Unit Number</label>
                                        <input
                                            {...register('unitNumber', { required: !isBulk ? 'Unit number is required' : false })}
                                            className={`w-full bg-[#151722] border ${errors.unitNumber ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:border-violet-500/50 transition-all`}
                                            placeholder="e.g. 101, A-201"
                                        />
                                        {errors.unitNumber && <p className="text-xs font-medium text-red-400 mt-1 pl-1">{errors.unitNumber.message}</p>}
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">Prefix (Optional)</label>
                                            <input
                                                {...register('unitPrefix')}
                                                className="w-full bg-[#151722] border border-white/10 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:border-violet-500/50 transition-all"
                                                placeholder="e.g. A-"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">Start Number</label>
                                            <input
                                                {...register('startNumber', { required: isBulk ? 'Start number is required' : false })}
                                                className={`w-full bg-[#151722] border ${errors.startNumber ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:border-violet-500/50 transition-all`}
                                                placeholder="e.g. 101"
                                            />
                                            {errors.startNumber && <p className="text-xs font-medium text-red-400 mt-1 pl-1">{errors.startNumber.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">End Number</label>
                                            <input
                                                {...register('endNumber', { required: isBulk ? 'End number is required' : false })}
                                                className={`w-full bg-[#151722] border ${errors.endNumber ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:border-violet-500/50 transition-all`}
                                                placeholder="e.g. 105"
                                            />
                                            {errors.endNumber && <p className="text-xs font-medium text-red-400 mt-1 pl-1">{errors.endNumber.message}</p>}
                                        </div>
                                    </>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">Unit Type</label>
                                    <select
                                        {...register('unitType')}
                                        className="w-full bg-[#151722] border border-white/10 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:border-violet-500/50 transition-all"
                                    >
                                        {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">BHK Type</label>
                                    <select
                                        {...register('bhkType')}
                                        className="w-full bg-[#151722] border border-white/10 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:border-violet-500/50 transition-all"
                                    >
                                        <option value="">None / N.A.</option>
                                        {BHK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">Maintenance Amount (₹)</label>
                                    <input
                                        type="number" min={0}
                                        {...register('maintenanceAmount')}
                                        className="w-full bg-[#151722] border border-white/10 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:border-violet-500/50 transition-all"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">Carpet Area (sqft)</label>
                                    <input
                                        type="number" min={0}
                                        {...register('carpetAreaSqft')}
                                        className="w-full bg-[#151722] border border-white/10 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:border-violet-500/50 transition-all"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">Built-up Area (sqft)</label>
                                    <input
                                        type="number" min={0}
                                        {...register('builtUpAreaSqft')}
                                        className="w-full bg-[#151722] border border-white/10 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:border-violet-500/50 transition-all"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-black text-gray-200 uppercase tracking-widest">Parking Slots</label>
                                    <input
                                        type="number" min={0}
                                        {...register('parkingSlots')}
                                        className="w-full bg-[#151722] border border-white/10 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-white placeholder-gray-300 font-bold focus:outline-none focus:border-violet-500/50 transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-5 sm:px-8 sm:py-6 border-t border-white/5 bg-[#151722]/50 flex justify-end gap-3 shrink-0">
                    <button 
                        type="button" 
                        onClick={handleClose}
                        className="px-6 py-3 rounded-xl bg-[#1c1f2e] text-sm font-bold text-gray-300 hover:bg-[#25283a] hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="create-unit-form"
                        disabled={isLoading}
                        className="px-8 py-3 rounded-xl bg-violet-600 text-sm font-bold text-white hover:bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : isBulk ? 'Create Units' : 'Create Unit'}
                    </button>
                </div>
            </div>
        </div>
    );
}
