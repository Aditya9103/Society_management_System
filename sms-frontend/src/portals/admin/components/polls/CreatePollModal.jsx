import { useState, useRef } from 'react';
import Modal from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Textarea from '../../../../components/ui/Textarea';
import DatePicker from '../../../../components/ui/DatePicker';
import { useCreatePollMutation } from '../../../../store/api/pollApi';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';

export default function CreatePollModal({ onClose }) {
    const [createPoll, { isLoading }] = useCreatePollMutation();
    const fileInputRefs = useRef({});
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        pollType: 'GENERAL_SURVEY',
        customPollType: '',
        votingMethod: 'SINGLE_CHOICE',
        eligibleVoters: 'ALL',
        resultVisibility: 'AFTER_CLOSE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000), // Default to +1 day
        maxChoices: 1,
        options: [
            { optionId: 'opt-1', text: '', photoUrl: null },
            { optionId: 'opt-2', text: '', photoUrl: null }
        ]
    });

    const handleAddOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { optionId: `opt-${Date.now()}`, text: '', photoUrl: null }]
        }));
    };

    const handlePollTypeChange = (e) => {
        const type = e.target.value;
        const updates = { pollType: type };

        // Apply smart defaults based on the selected poll type
        switch (type) {
            case 'COMMITTEE_ELECTION':
                updates.eligibleVoters = 'OWNERS_ONLY'; // Binding election, usually owners only
                updates.resultVisibility = 'AFTER_CLOSE'; // Prevent voter bias
                updates.votingMethod = 'SINGLE_CHOICE';
                break;
            case 'BUDGET_APPROVAL':
                updates.eligibleVoters = 'OWNERS_ONLY'; // Financial decisions are for owners
                updates.resultVisibility = 'AFTER_CLOSE';
                updates.votingMethod = 'SINGLE_CHOICE';
                break;
            case 'GENERAL_SURVEY':
            case 'EVENT_PLANNING':
                updates.eligibleVoters = 'ALL'; // Everyone can participate
                updates.resultVisibility = 'REAL_TIME'; // Fun to see live results
                break;
            case 'RULE_CHANGE':
                updates.eligibleVoters = 'ALL';
                updates.resultVisibility = 'AFTER_CLOSE';
                break;
            default:
                break;
        }

        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleRemoveOption = (index) => {
        if (formData.options.length <= 2) return;
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const handleOptionTextChange = (index, val) => {
        const newOptions = [...formData.options];
        newOptions[index].text = val;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleImageUpload = (index, file) => {
        if (!file) return;

        // Use FileReader and Canvas to compress the image before saving as base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress as JPEG with 70% quality (Massively reduces base64 payload size)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                const newOptions = [...formData.options];
                newOptions[index].photoUrl = dataUrl;
                setFormData(prev => ({ ...prev, options: newOptions }));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (index) => {
        const newOptions = [...formData.options];
        newOptions[index].photoUrl = null;
        setFormData(prev => ({ ...prev, options: newOptions }));
        if (fileInputRefs.current[index]) {
            fileInputRefs.current[index].value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let processedData = { ...formData };
        if (processedData.startDate) processedData.startDate = processedData.startDate.toISOString();
        if (processedData.endDate) processedData.endDate = processedData.endDate.toISOString();

        if (processedData.options.some(o => !o.text.trim())) {
            return toast.error('All options must have text');
        }

        if (new Date(processedData.startDate) >= new Date(processedData.endDate)) {
            return toast.error('End Date must be strictly after the Start Date');
        }

        if (processedData.pollType !== 'OTHER') {
            delete processedData.customPollType;
        } else if (!processedData.customPollType?.trim()) {
            return toast.error('Please specify the custom poll type');
        }

        try {
            await createPoll(processedData).unwrap();
            toast.success('Poll created successfully as DRAFT');
            onClose();
        } catch (err) {
            if (err?.data?.details?.length > 0) {
                toast.error(err.data.details[0].message);
            } else {
                toast.error(err?.data?.message || 'Failed to create poll');
            }
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Create New Poll" size="xl">
            <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 p-6 rounded-2xl border border-indigo-100/50 space-y-5">
                    <Input
                        label="Title *"
                        required
                        placeholder="What would you like to ask the society?"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="bg-white/80 border-indigo-100 focus:bg-white"
                    />
                    
                    <Textarea
                        label="Description"
                        placeholder="Provide details about what residents are voting for..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="bg-white/80 border-indigo-100 focus:bg-white"
                    />

                    <div className="grid grid-cols-2 gap-5">
                        <Select
                            label="Poll Type"
                            value={formData.pollType}
                            onChange={handlePollTypeChange}
                            className="bg-white/80 border-indigo-100"
                        >
                            <option value="GENERAL_SURVEY">General Survey</option>
                            <option value="COMMITTEE_ELECTION">Committee Election</option>
                            <option value="BUDGET_APPROVAL">Budget Approval</option>
                            <option value="RULE_CHANGE">Rule Change</option>
                            <option value="FACILITY_DECISION">Facility Decision</option>
                            <option value="EVENT_PLANNING">Event Planning</option>
                            <option value="OTHER">Other</option>
                        </Select>

                        {formData.pollType === 'OTHER' && (
                            <Input
                                label="Specify Poll Type *"
                                required
                                placeholder="e.g. Renovation Project"
                                value={formData.customPollType}
                                onChange={e => setFormData({ ...formData, customPollType: e.target.value })}
                                className="bg-white/80 border-indigo-100 focus:bg-white"
                            />
                        )}

                        <Select
                            label="Voting Method"
                            value={formData.votingMethod}
                            onChange={e => setFormData({ ...formData, votingMethod: e.target.value })}
                            className="bg-white/80 border-indigo-100"
                        >
                            <option value="SINGLE_CHOICE">Single Choice</option>
                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        </Select>
                    </div>

                    {formData.votingMethod === 'MULTIPLE_CHOICE' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <Input
                                label="Max Choices Allowed"
                                type="number"
                                min="2"
                                max={formData.options.length}
                                value={formData.maxChoices}
                                onChange={e => setFormData({ ...formData, maxChoices: parseInt(e.target.value) || 2 })}
                                className="bg-white/80 border-indigo-100"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="font-bold text-lg text-slate-800">Poll Options</h4>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="h-9 shadow-sm hover:border-indigo-300 hover:text-indigo-600">
                            <Plus className="w-4 h-4 mr-1.5" /> Add Option
                        </Button>
                    </div>
                    
                    <div className="grid gap-4">
                        {formData.options.map((opt, index) => (
                            <div key={opt.optionId} className="group flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                                <div className="pt-2">
                                    <span className="flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold rounded-full w-8 h-8 text-sm">
                                        {index + 1}
                                    </span>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <Input
                                        type="text"
                                        required
                                        placeholder={`Enter option ${index + 1}`}
                                        value={opt.text}
                                        onChange={e => handleOptionTextChange(index, e.target.value)}
                                        className="border-0 bg-slate-50 focus:bg-white text-lg font-medium"
                                    />
                                    
                                    {opt.photoUrl ? (
                                        <div className="relative inline-block mt-2">
                                            <img src={opt.photoUrl} alt={`Option ${index + 1}`} className="h-32 w-48 object-cover rounded-lg border border-slate-200 shadow-sm" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={el => fileInputRefs.current[index] = el}
                                                onChange={e => handleImageUpload(index, e.target.files[0])}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRefs.current[index]?.click()}
                                                className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                                <span>Attach Image (Optional)</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOption(index)}
                                        disabled={formData.options.length <= 2}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full disabled:opacity-30 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5 px-4 py-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <DatePicker
                        label="Start Date *"
                        required
                        selected={formData.startDate}
                        onChange={date => setFormData({ ...formData, startDate: date })}
                    />
                    <DatePicker
                        label="End Date *"
                        required
                        selected={formData.endDate}
                        onChange={date => setFormData({ ...formData, endDate: date })}
                    />
                    <Select
                        label="Eligible Voters"
                        value={formData.eligibleVoters}
                        onChange={e => setFormData({ ...formData, eligibleVoters: e.target.value })}
                    >
                        <option value="ALL">All Residents</option>
                        <option value="OWNERS_ONLY">Owners Only</option>
                        <option value="TENANTS_ONLY">Tenants Only</option>
                    </Select>
                    <Select
                        label="Results Visibility"
                        value={formData.resultVisibility}
                        onChange={e => setFormData({ ...formData, resultVisibility: e.target.value })}
                    >
                        <option value="AFTER_CLOSE">Visible after poll closes</option>
                        <option value="REAL_TIME">Real-time visibility</option>
                        <option value="ADMIN_ONLY">Admin Only</option>
                    </Select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="px-6">Cancel</Button>
                    <Button type="submit" isLoading={isLoading} className="px-8 shadow-lg shadow-indigo-200">Save as Draft</Button>
                </div>
            </form>
        </Modal>
    );
}
