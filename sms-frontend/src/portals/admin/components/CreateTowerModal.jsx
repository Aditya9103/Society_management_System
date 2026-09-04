import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Layers, Search, Check, X, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { useCreateTowerMutation, useUpdateTowerMutation } from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Alert from '../../../components/ui/Alert';

export default function CreateTowerModal({ isOpen, onClose, initialData = null }) {
    const isEdit = !!initialData;
    const [createTower, { isLoading: isCreating }] = useCreateTowerMutation();
    const [updateTower, { isLoading: isUpdating }] = useUpdateTowerMutation();
    const isLoading = isCreating || isUpdating;

    const [step, setStep] = useState(1);
    const [errorMsg, setErrorMsg] = useState(null);
    const [amenities, setAmenities] = useState([]);
    const [amenityInput, setAmenityInput] = useState('');

    const { register, handleSubmit, reset, watch, formState: { errors }, trigger } = useForm({
        mode: 'onChange',
        defaultValues: {
            name: '',
            code: '',
            description: '',
            buildingType: 'Residential',
            totalFloors: '',
            basementLevels: 0,
            defaultUnitsPerFloor: '',
            autoCreateFloors: true
        }
    });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setErrorMsg(null);
            setAmenityInput('');
            if (initialData) {
                reset({
                    name: initialData.name || '',
                    code: initialData.code || '',
                    description: initialData.description || '',
                    buildingType: initialData.buildingType || 'Residential',
                    totalFloors: initialData.totalFloors || '',
                    basementLevels: initialData.basementLevels || 0,
                    defaultUnitsPerFloor: initialData.defaultUnitsPerFloor || '',
                    autoCreateFloors: false
                });
                setAmenities(initialData.amenities || []);
            } else {
                reset({
                    name: '',
                    code: '',
                    description: '',
                    buildingType: 'Residential',
                    totalFloors: '',
                    basementLevels: 0,
                    defaultUnitsPerFloor: '',
                    autoCreateFloors: true
                });
                setAmenities([]);
            }
        }
    }, [isOpen, initialData, reset]);

    const handleAddAmenity = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            e.preventDefault();
            const val = amenityInput.trim();
            if (val && !amenities.includes(val)) {
                setAmenities([...amenities, val]);
            }
            setAmenityInput('');
        }
    };

    const handleRemoveAmenity = (index) => {
        setAmenities(amenities.filter((_, i) => i !== index));
    };

    const nextStep = async () => {
        const fieldsToValidate = step === 1 ? ['name', 'code', 'description', 'buildingType'] : ['totalFloors', 'basementLevels', 'defaultUnitsPerFloor'];
        const isValid = await trigger(fieldsToValidate);
        if (isValid) setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const onSubmit = async (formData) => {
        setErrorMsg(null);
        try {
            let finalAmenities = [...amenities];
            if (amenityInput.trim() && !finalAmenities.includes(amenityInput.trim())) {
                finalAmenities.push(amenityInput.trim());
                setAmenities(finalAmenities);
                setAmenityInput('');
            }

            const payload = {
                name: formData.name,
                code: formData.code.toUpperCase(),
                description: formData.description,
                buildingType: formData.buildingType,
                totalFloors: Number(formData.totalFloors),
                hasBasement: Number(formData.basementLevels) > 0,
                basementLevels: Number(formData.basementLevels) || 0,
                defaultUnitsPerFloor: Number(formData.defaultUnitsPerFloor) || 0,
                amenities: finalAmenities,
                autoCreateFloors: formData.autoCreateFloors,
            };

            if (isEdit) {
                await updateTower({ id: initialData._id, ...payload }).unwrap();
            } else {
                await createTower(payload).unwrap();
            }
            
            reset();
            onClose();
        } catch (err) {
            setErrorMsg(err?.data?.message ?? `Failed to ${isEdit ? 'update' : 'create'} tower. Please try again.`);
        }
    };

    const handleClose = () => { reset(); setErrorMsg(null); onClose(); };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            title={isEdit ? "Edit Tower" : "Create New Tower"} 
            description={isEdit ? "Update tower metadata." : "Add a new building tower in your society."}
            maxWidth="max-w-2xl"
            theme="dark"
        >
            {/* Stepper */}
            <div className="flex items-center mb-8 bg-[#131525] p-2 rounded-xl">
                {[1, 2, 3].map((s, i) => (
                    <React.Fragment key={s}>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm z-10 transition-colors
                            ${step === s ? 'bg-[#6338f0] text-white' : step > s ? 'bg-emerald-500 text-white' : 'bg-[#1a1c29] text-slate-500 border border-slate-800'}`}>
                            {step > s ? <Check className="w-4 h-4" /> : s}
                        </div>
                        <div className="ml-3 font-semibold text-sm mr-auto" style={{ color: step >= s ? '#fff' : '#64748b' }}>
                            {s === 1 ? 'Tower Details' : s === 2 ? 'Structure' : 'Amenities'}
                        </div>
                        {i < 2 && <div className="flex-1 h-0.5 mx-4 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-[#6338f0] transition-all" style={{ width: step > s ? '100%' : '0%' }} />
                        </div>}
                    </React.Fragment>
                ))}
            </div>

            {errorMsg && <Alert type="error" className="mb-4">{errorMsg}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)}>
                
                {/* Step 1: Details */}
                {step === 1 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Tower Name <span className="text-red-500">*</span></label>
                                <input 
                                    className={`w-full bg-[#131525] border ${errors.name ? 'border-red-500' : 'border-slate-800'} text-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6338f0]`} 
                                    placeholder="e.g. Tower A" 
                                    {...register('name', { required: 'Tower name is required' })} 
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Short Code <span className="text-red-500">*</span></label>
                                <input 
                                    className={`w-full bg-[#131525] border ${errors.code ? 'border-red-500' : 'border-slate-800'} text-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6338f0] uppercase`} 
                                    placeholder="e.g. A or T1" 
                                    {...register('code', { required: 'Code is required' })} 
                                />
                                {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Description</label>
                            <textarea 
                                className="w-full bg-[#131525] border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6338f0] min-h-[100px] resize-none" 
                                placeholder="Brief description of the tower..." 
                                {...register('description')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Building Type</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-[#131525] border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6338f0] appearance-none"
                                    {...register('buildingType')}
                                >
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Mixed">Mixed Use</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Structure */}
                {step === 2 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Total Floors (above ground) <span className="text-red-500">*</span></label>
                                <input 
                                    type="number"
                                    min={1}
                                    className={`w-full bg-[#131525] border ${errors.totalFloors ? 'border-red-500' : 'border-slate-800'} text-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6338f0]`} 
                                    placeholder="e.g. 12" 
                                    {...register('totalFloors', { required: 'Required', min: { value: 1, message: 'Min 1' } })} 
                                />
                                {errors.totalFloors && <p className="text-xs text-red-500 mt-1">{errors.totalFloors.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Basement Levels</label>
                                <input 
                                    type="number"
                                    min={0}
                                    className="w-full bg-[#131525] border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6338f0]" 
                                    placeholder="0" 
                                    {...register('basementLevels')} 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Units per Floor (Default) <span className="text-red-500">*</span></label>
                            <input 
                                type="number"
                                min={1}
                                className={`w-full bg-[#131525] border ${errors.defaultUnitsPerFloor ? 'border-red-500' : 'border-slate-800'} text-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6338f0]`} 
                                placeholder="e.g. 4" 
                                {...register('defaultUnitsPerFloor', { required: 'Required', min: { value: 1, message: 'Min 1' } })} 
                            />
                            {errors.defaultUnitsPerFloor && <p className="text-xs text-red-500 mt-1">{errors.defaultUnitsPerFloor.message}</p>}
                        </div>

                        {!isEdit && (
                            <div className="flex items-start gap-3 rounded-xl bg-[#6338f0]/10 p-4 border border-[#6338f0]/30 mt-6">
                                <input
                                    id="autoFloors"
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 accent-[#6338f0] rounded border-slate-700 bg-[#131525]"
                                    {...register('autoCreateFloors')}
                                />
                                <div>
                                    <label htmlFor="autoFloors" className="cursor-pointer text-sm font-bold text-slate-200">
                                        Auto-generate all floors and units
                                    </label>
                                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                                        This will automatically create the Ground floor, all upper floors, and basement levels with the default number of units per floor. You can modify these later.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Amenities */}
                {step === 3 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Tower Amenities</label>
                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input 
                                        type="text"
                                        value={amenityInput}
                                        onChange={e => setAmenityInput(e.target.value)}
                                        onKeyDown={handleAddAmenity}
                                        className="w-full bg-[#131525] border border-slate-800 text-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#6338f0]" 
                                        placeholder="Type amenity and press Enter..." 
                                    />
                                </div>
                                <Button type="button" onClick={handleAddAmenity} className="bg-slate-800 hover:bg-slate-700 text-white">Add</Button>
                            </div>

                            <div className="min-h-[120px] bg-[#1a1c29] border border-slate-800 rounded-xl p-4 flex flex-wrap gap-2 content-start">
                                {amenities.length === 0 && (
                                    <span className="text-slate-500 text-sm italic w-full text-center mt-8">No amenities added yet.</span>
                                )}
                                {amenities.map((amenity, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6338f0]/10 border border-[#6338f0]/30 text-indigo-300 rounded-lg text-sm font-medium group">
                                        {amenity}
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveAmenity(idx)}
                                            className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-indigo-500 hover:text-white transition-all"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between border-t border-slate-800/50 pt-6 mt-8">
                    {step > 1 ? (
                        <Button type="button" variant="secondary" onClick={prevStep} className="bg-[#131525] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700">
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                    ) : (
                        <Button type="button" variant="secondary" onClick={handleClose} className="bg-transparent border-none text-slate-400 hover:text-white">Cancel</Button>
                    )}

                    {step < 3 ? (
                        <Button type="button" onClick={nextStep} className="bg-[#6338f0] hover:bg-[#5225e2] text-white ml-auto">
                            Next Step <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button type="submit" isLoading={isLoading} className="bg-[#6338f0] hover:bg-[#5225e2] text-white ml-auto shadow-lg shadow-indigo-600/20">
                            {isLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Tower'}
                        </Button>
                    )}
                </div>
            </form>
        </Modal>
    );
}
