import Modal from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { useGetAdminPollByIdQuery } from '../../../../store/api/pollApi';
import { useGetResidentPollByIdQuery } from '../../../../store/api/pollApi';

export default function PollResultsModal({ initialPoll, role = 'admin', onClose }) {
    const adminQuery = useGetAdminPollByIdQuery(initialPoll._id, { skip: role !== 'admin' });
    const residentQuery = useGetResidentPollByIdQuery(initialPoll._id, { skip: role !== 'resident' });

    const fetchedPoll = role === 'admin' ? adminQuery.data?.data?.poll : residentQuery.data?.data?.poll;
    
    // Use fetched data if available, otherwise fallback to the initial poll data
    const poll = fetchedPoll || initialPoll;

    if (!poll) return null;

    const totalVotes = poll.totalVotes || 0;

    // Sort options by vote count descending
    const sortedOptions = [...poll.options].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    
    // Find max votes to calculate percentage bar
    const maxVotes = Math.max(...sortedOptions.map(o => o.voteCount || 0), 1);
    
    return (
        <Modal isOpen={true} onClose={onClose} title="Poll Results" size="lg">
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{poll.title}</h3>
                    {poll.description && (
                        <p className="text-slate-500 mt-1">{poll.description}</p>
                    )}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
                    <div className="mt-4 flex items-center justify-center gap-4 text-sm font-semibold text-slate-600 bg-white/50 inline-flex px-4 py-2 rounded-full border border-indigo-100">
                        <span>Status: <span className={`uppercase ${poll.status === 'CLOSED' ? 'text-red-500' : 'text-emerald-500'}`}>{poll.status}</span></span>
                        <span>•</span>
                        <span>Total Votes: <span className="text-indigo-600 font-bold">{totalVotes}</span></span>
                    </div>
                </div>

                <div className="space-y-4">
                    {sortedOptions.map((opt, index) => {
                        const percentage = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                        const isWinner = index === 0 && opt.voteCount > 0 && (sortedOptions.length === 1 || opt.voteCount > sortedOptions[1].voteCount);
                        
                        return (
                            <div key={opt.optionId} className={`relative overflow-hidden bg-white rounded-2xl border transition-all ${isWinner ? 'border-amber-300 shadow-md shadow-amber-100/50' : 'border-slate-200'}`}>
                                {/* Background progress bar */}
                                <div 
                                    className={`absolute inset-0 opacity-10 transition-all duration-1000 ${isWinner ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${percentage}%` }}
                                ></div>

                                <div className="relative p-4 flex items-center gap-4">
                                    {opt.photoUrl && (
                                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100">
                                            <img src={opt.photoUrl} alt={opt.text} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-lg font-bold ${isWinner ? 'text-amber-600' : 'text-slate-800'}`}>
                                                    {opt.text}
                                                </span>
                                                {isWinner && <span className="text-xl" title="Winner">👑</span>}
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-slate-800">{percentage}%</span>
                                            </div>
                                        </div>
                                        
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${isWinner ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-indigo-400 to-blue-500'}`} 
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium mt-2">
                                            {opt.voteCount} {opt.voteCount === 1 ? 'vote' : 'votes'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button onClick={onClose} className="px-8 rounded-xl">Close</Button>
                </div>
            </div>
        </Modal>
    );
}
