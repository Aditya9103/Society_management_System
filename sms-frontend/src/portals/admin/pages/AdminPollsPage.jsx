import { useState } from 'react';
import { 
    useGetAdminPollsQuery, 
    usePublishPollMutation, 
    useClosePollMutation, 
    useDeletePollMutation 
} from '../../../store/api/pollApi';
import { Plus, BarChart2, Megaphone, Trash2, StopCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import CreatePollModal from '../components/polls/CreatePollModal';
import PollResultsModal from '../components/polls/PollResultsModal';
import { toast } from 'react-hot-toast';

export default function AdminPollsPage() {
    const { data, isLoading } = useGetAdminPollsQuery();
    const [publishPoll] = usePublishPollMutation();
    const [closePoll] = useClosePollMutation();
    const [deletePoll] = useDeletePollMutation();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPollResults, setSelectedPollResults] = useState(null);

    const polls = data?.data?.polls || [];

    const handlePublish = async (id) => {
        if (!window.confirm('Are you sure you want to publish this poll? Residents will be notified.')) return;
        try {
            await publishPoll(id).unwrap();
            toast.success('Poll published successfully');
        } catch (e) {
            toast.error(e?.data?.message || 'Failed to publish poll');
        }
    };

    const handleClose = async (id) => {
        if (!window.confirm('Are you sure you want to close voting for this poll?')) return;
        try {
            await closePoll(id).unwrap();
            toast.success('Poll closed successfully');
        } catch (e) {
            toast.error(e?.data?.message || 'Failed to close poll');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) return;
        try {
            await deletePoll(id).unwrap();
            toast.success('Poll deleted successfully');
        } catch (e) {
            toast.error(e?.data?.message || 'Failed to delete poll');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'DRAFT': return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">DRAFT</span>;
            case 'ACTIVE': return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold animate-pulse">ACTIVE</span>;
            case 'CLOSED': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">CLOSED</span>;
            default: return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Polls & Voting</h1>
                    <p className="text-slate-500">Create surveys, elections, and gather resident feedback.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Create Poll
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                </div>
            ) : polls.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white">
                    <BarChart2 className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700">No Polls Created</h3>
                    <p className="text-slate-500 mt-1 max-w-sm mx-auto">Create your first poll to gather opinions from residents.</p>
                    <Button onClick={() => setShowCreateModal(true)} className="mt-6" variant="outline">Create Poll</Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {polls.map(poll => (
                        <div key={poll._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    {getStatusBadge(poll.status)}
                                    <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                        {(poll.pollType === 'OTHER' ? poll.customPollType || 'OTHER' : poll.pollType).replace('_', ' ')}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{poll.title}</h3>
                                {poll.description && (
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{poll.description}</p>
                                )}
                                
                                <div className="space-y-2 mt-auto">
                                    <div className="flex justify-between text-sm border-t border-slate-50 pt-2">
                                        <span className="text-slate-500">Votes</span>
                                        <span className="font-bold text-slate-700">{poll.totalVotes}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Ends</span>
                                        <span className="font-medium text-slate-700">
                                            {new Date(poll.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 border-t border-slate-100 flex gap-2">
                                {poll.status === 'DRAFT' && (
                                    <Button variant="primary" className="flex-1 text-sm h-9 bg-emerald-600 hover:bg-emerald-700" onClick={() => handlePublish(poll._id)}>
                                        <Megaphone className="h-4 w-4 mr-2" /> Publish
                                    </Button>
                                )}
                                {poll.status === 'ACTIVE' && (
                                    <Button variant="outline" className="flex-1 text-sm h-9 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => handleClose(poll._id)}>
                                        <StopCircle className="h-4 w-4 mr-2" /> Close
                                    </Button>
                                )}
                                <Button variant="outline" className="flex-1 text-sm h-9" onClick={() => setSelectedPollResults(poll)}>
                                    <BarChart2 className="h-4 w-4 mr-2" /> Results
                                </Button>
                                <Button variant="outline" className="px-3 h-9 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(poll._id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreatePollModal onClose={() => setShowCreateModal(false)} />
            )}

            {selectedPollResults && (
                <PollResultsModal 
                    initialPoll={selectedPollResults} 
                    role="admin"
                    onClose={() => setSelectedPollResults(null)} 
                />
            )}
        </div>
    );
}
