import { useState } from 'react';
import { useGetResidentActivePollsQuery, useGetResidentVotedPollsQuery } from '../../../store/api/pollApi';
import { BarChart2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import VoteModal from '../components/polls/VoteModal';
import PollResultsModal from '../../admin/components/polls/PollResultsModal'; // We can reuse the UI for results

export default function ResidentPollsPage() {
    const { data: activeData, isLoading: activeLoading } = useGetResidentActivePollsQuery();
    const { data: allData, isLoading: allLoading } = useGetResidentVotedPollsQuery();

    const [selectedPoll, setSelectedPoll] = useState(null);
    const [selectedResults, setSelectedResults] = useState(null);

    const activePolls = activeData?.data?.polls || [];
    const allPolls = allData?.data?.polls || [];

    // Filter to show active polls where the user hasn't voted yet (requires logic if we fetch full vote state)
    // Actually, getResidentVotedPolls currently returns ALL polls. 
    // Wait, we need to know if the user has voted. Let's just use `getResidentPollById` dynamically when clicked.
    // Or we show all polls, and when they click "Vote", the modal fetches `getResidentPollById` and handles "Already voted" securely.

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Polls & Elections</h1>
                <p className="text-slate-500">Participate in society decisions and view results.</p>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-700">Active Polls</h2>
                {activeLoading ? (
                    <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : activePolls.length === 0 ? (
                    <div className="bg-white p-8 text-center rounded-xl border border-slate-200">
                        <BarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No active polls at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {activePolls.map(poll => (
                            <div key={poll._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                <h3 className="font-bold text-slate-800 text-lg mb-1">{poll.title}</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{poll.description}</p>
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                        Ends: {new Date(poll.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                    <Button size="sm" onClick={() => setSelectedPoll(poll)}>
                                        Vote Now
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-4 pt-6">
                <h2 className="text-lg font-bold text-slate-700">Past & Closed Polls</h2>
                {allLoading ? (
                    <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {allPolls.filter(p => p.status === 'CLOSED').map(poll => (
                            <div key={poll._id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h3 className="font-bold text-slate-700 mb-2">{poll.title}</h3>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">CLOSED</span>
                                    <Button size="sm" variant="outline" onClick={() => setSelectedResults(poll)}>
                                        View Results
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedPoll && (
                <VoteModal initialPoll={selectedPoll} onClose={() => setSelectedPoll(null)} />
            )}

            {selectedResults && (
                <PollResultsModal initialPoll={selectedResults} role="resident" onClose={() => setSelectedResults(null)} />
            )}
        </div>
    );
}
