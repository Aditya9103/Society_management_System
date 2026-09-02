import { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { useGetResidentPollByIdQuery, useSubmitVoteMutation } from '../../../../store/api/pollApi';
import { toast } from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';
import PollResultsModal from '../../../admin/components/polls/PollResultsModal';

export default function VoteModal({ initialPoll, onClose }) {
    const { data } = useGetResidentPollByIdQuery(initialPoll._id);
    const [submitVote, { isLoading }] = useSubmitVoteMutation();
    const [selectedOptions, setSelectedOptions] = useState([]);

    const poll = data?.data?.poll || initialPoll;
    if (!poll) return null;

    const handleVote = (optionId) => {
        if (poll.votingMethod === 'SINGLE_CHOICE') {
            setSelectedOptions([optionId]);
        } else {
            if (selectedOptions.includes(optionId)) {
                setSelectedOptions(selectedOptions.filter(id => id !== optionId));
            } else {
                if (selectedOptions.length >= poll.maxChoices) return;
                setSelectedOptions([...selectedOptions, optionId]);
            }
        }
    };

    const handleSubmit = async () => {
        if (!selectedOptions.length) {
            return toast.error('Please select an option');
        }

        try {
            await submitVote({ id: poll._id, optionIds: selectedOptions }).unwrap();
            toast.success('Vote submitted successfully');
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to submit vote');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Cast Your Vote" size="lg" theme="dark" className="border border-white/10 shadow-2xl">
            <div className="space-y-6">
                <div className="bg-[#131525] p-6 rounded-2xl border border-white/5 text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">{poll.title}</h3>
                    {poll.description && (
                        <p className="text-white font-bold font-bold text-sm lg:text-base">{poll.description}</p>
                    )}
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                            {poll.votingMethod === 'SINGLE_CHOICE' ? 'Select One' : `Select up to ${poll.maxChoices}`}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {poll.options.map(opt => {
                        const isSelected = selectedOptions.includes(opt.optionId);
                        return (
                            <button
                                key={opt.optionId}
                                onClick={() => handleVote(opt.optionId)}
                                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all overflow-hidden ${isSelected
                                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-900/20 scale-[1.02]'
                                    : 'border-white/10 bg-[#0B0D17]/50 hover:border-indigo-500/50 hover:bg-white/5'
                                    }`}
                            >
                                {opt.photoUrl && (
                                    <div className="w-24 h-24 mb-4 rounded-full object-cover border border-white/10 overflow-hidden shadow-sm">
                                        <img src={opt.photoUrl} alt={opt.text} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    </div>
                                )}
                                <span className={`text-xl font-bold transition-colors ${isSelected ? 'text-indigo-400' : 'text-white font-bold'}`}>
                                    {opt.text}
                                </span>

                                {isSelected && (
                                    <div className="absolute top-4 right-4 animate-in zoom-in duration-200">
                                        <CheckCircle2 className="w-6 h-6 text-indigo-500" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                    <Button variant="outline" onClick={onClose} className="px-6 rounded-xl border-white/10 text-white font-bold hover:text-white hover:bg-white/5">Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        disabled={selectedOptions.length === 0}
                        className="px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-900/20"
                    >
                        Submit Vote
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
