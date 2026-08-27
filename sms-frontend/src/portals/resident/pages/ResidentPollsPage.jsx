import React, { useState, useEffect } from 'react';
import { 
    useGetResidentActivePollsQuery, 
    useGetResidentVotedPollsQuery 
} from '../../../store/api/pollApi';
import { 
    Search, ChevronDown, List, LayoutGrid, 
    Users, Activity, ShieldCheck, ArrowRight, Calendar, User, 
    BarChart2, Clock, CheckCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import VoteModal from '../components/polls/VoteModal';
import PollResultsModal from '../../admin/components/polls/PollResultsModal';

export default function ResidentPollsPage() {
    const { data: activeData, isLoading: activeLoading } = useGetResidentActivePollsQuery();
    const { data: allData, isLoading: allLoading } = useGetResidentVotedPollsQuery();

    const [selectedPoll, setSelectedPoll] = useState(null);
    const [selectedResults, setSelectedResults] = useState(null);
    
    // UI State
    const [activeTab, setActiveTab] = useState('ACTIVE');
    const [viewMode, setViewMode] = useState('LIST');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    // Data Processing
    const activePolls = activeData?.data?.polls || [];
    const allPolls = allData?.data?.polls || [];

    // Combine for stats
    const totalActivePolls = activePolls.length;
    
    // Calculate total participants (unique votes) & votes cast from all polls
    let totalParticipants = 0;
    let totalVotesCast = 0;
    
    const allCombinedPolls = [...activePolls, ...allPolls.filter(p => !activePolls.find(ap => ap._id === p._id))];
    
    allCombinedPolls.forEach(poll => {
        totalVotesCast += (poll.totalVotes || 0);
        // Approximation: totalVotes is number of participants if it's single choice, 
        // but let's use totalVotes for both to avoid complexity.
        totalParticipants += (poll.totalVotes || 0); 
    });

    // Participation rate is hard to calculate accurately without knowing total residents, 
    // let's use a mock percentage for the UI visualization or calculate if we have `totalEligible`
    let totalEligible = 0;
    allCombinedPolls.forEach(poll => totalEligible += (poll.totalEligible || 0));
    const participationRate = totalEligible > 0 ? Math.round((totalVotesCast / totalEligible) * 100) : 0;

    // Filter Logic
    const pollsToShow = activeTab === 'ACTIVE' ? activePolls : allPolls.filter(p => p.status === 'CLOSED' || p.status === 'RESULTS_PUBLISHED');
    
    const filteredPolls = pollsToShow.filter(poll => {
        const matchesSearch = poll.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (poll.description && poll.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = categoryFilter === 'ALL' || poll.pollType === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Countdown Timer Helper
    const getTimeRemaining = (endTime) => {
        const total = Date.parse(endTime) - Date.parse(new Date());
        if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        return { days, hours, minutes, seconds };
    };

    // Live Timer component
    const LiveTimer = ({ endDate }) => {
        const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endDate));
        useEffect(() => {
            const timer = setInterval(() => setTimeLeft(getTimeRemaining(endDate)), 1000);
            return () => clearInterval(timer);
        }, [endDate]);

        return (
            <div className="flex items-center gap-4 mt-2">
                <div className="text-center">
                    <span className="block text-xl font-bold text-white leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Days</span>
                </div>
                <span className="text-xl font-bold text-slate-600 leading-none mb-4">:</span>
                <div className="text-center">
                    <span className="block text-xl font-bold text-white leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Hrs</span>
                </div>
                <span className="text-xl font-bold text-slate-600 leading-none mb-4">:</span>
                <div className="text-center">
                    <span className="block text-xl font-bold text-white leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Mins</span>
                </div>
                <span className="text-xl font-bold text-slate-600 leading-none mb-4">:</span>
                <div className="text-center">
                    <span className="block text-xl font-bold text-white leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Secs</span>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header & 3D Graphic */}
            <div className="flex justify-between items-center bg-[#0B0D17] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <div className="relative z-10 max-w-[80%] md:max-w-none">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Polls & Voting</h1>
                    <p className="text-slate-400 text-sm pr-2 md:pr-0">Participate in surveys, elections and help shape our community.</p>
                </div>
                <div className="absolute top-4 right-4 md:relative md:top-auto md:right-auto z-10 w-16 h-16 md:w-[120px] md:h-[120px] opacity-80 md:opacity-100">
                    <img src="/pollbox.png" alt="Poll Box Graphic" className="w-full h-full object-contain" />
                </div>
                {/* Subtle Background Glow */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[80px] pointer-events-none rounded-full" />
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#131525] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <BarChart2 className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">Active Polls</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-white">{totalActivePolls}</h3>
                            <span className="text-[10px] text-slate-500">Currently open</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#131525] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">Total Participants</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-white">{totalParticipants}</h3>
                            <span className="text-[10px] text-slate-500">Across all polls</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#131525] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">Total Votes Cast</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-white">{totalVotesCast}</h3>
                            <span className="text-[10px] text-slate-500">Total votes received</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#131525] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">Participation Rate</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-white">{participationRate}%</h3>
                            <span className="text-[10px] text-slate-500">Active residents</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex gap-6">
                    <button 
                        onClick={() => setActiveTab('ACTIVE')}
                        className={`text-sm font-semibold transition-all relative ${activeTab === 'ACTIVE' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'}`}
                    >
                        Active Polls
                        {activeTab === 'ACTIVE' && <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('PAST')}
                        className={`text-sm font-semibold transition-all relative ${activeTab === 'PAST' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'}`}
                    >
                        Past Polls
                        {activeTab === 'PAST' && <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full"></div>}
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-[250px]">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search polls..." 
                            className="w-full bg-[#131525] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div className="relative min-w-[150px] hidden sm:block">
                        <select 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="appearance-none w-full bg-[#131525] border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm font-medium text-slate-300 focus:outline-none hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <option value="ALL">All Categories</option>
                            <option value="FACILITY_DECISION">Facility Decision</option>
                            <option value="COMMITTEE_ELECTION">Committee Election</option>
                            <option value="GENERAL_SURVEY">General Survey</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="flex items-center gap-1 bg-[#131525] border border-white/10 p-1 rounded-xl shrink-0">
                        <button 
                            onClick={() => setViewMode('GRID')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'GRID' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button 
                            onClick={() => setViewMode('LIST')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'LIST' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Polls List */}
            <div className={`grid gap-4 ${viewMode === 'GRID' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                {(activeTab === 'ACTIVE' ? activeLoading : allLoading) ? (
                    <div className="col-span-full py-12 flex justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredPolls.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-[#131525] border border-white/5 rounded-2xl">
                        <BarChart2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No polls found.</p>
                    </div>
                ) : (
                    filteredPolls.map(poll => {
                        const isElection = poll.pollType === 'COMMITTEE_ELECTION';
                        const isClosed = poll.status === 'CLOSED' || poll.status === 'RESULTS_PUBLISHED';
                        
                        return (
                            <div key={poll._id} className="bg-[#131525] border border-white/5 rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 hover:border-white/10 transition-colors">
                                {/* Left Section: Info */}
                                <div className="flex-1 min-w-[300px]">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                            ${isElection ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                            {isElection ? <User size={20} /> : <Activity size={20} />}
                                        </div>
                                        <div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border
                                                ${isElection ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                                                {poll.pollType.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 leading-snug">{poll.title}</h3>
                                    <p className="text-xs text-slate-400 mb-6 leading-relaxed line-clamp-2">{poll.description}</p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-500 mt-auto">
                                        <div className="flex items-center gap-1.5"><User size={12}/> Posted by Committee</div>
                                        <div className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(poll.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                        <div className="flex items-center gap-1.5"><Users size={12}/> {poll.totalVotes || 0} Participants</div>
                                    </div>
                                </div>

                                {/* Middle Section: Live Results (If REAL_TIME or Closed) */}
                                <div className="flex-1 border-y md:border-y-0 md:border-l border-white/10 py-5 md:py-0 md:pl-6 min-w-[250px] flex flex-col justify-center gap-4">
                                    {(poll.resultVisibility === 'REAL_TIME' || isClosed) ? (
                                        poll.options.map((opt, i) => {
                                            const percent = poll.totalVotes > 0 ? Math.round(((opt.voteCount || 0) / poll.totalVotes) * 100) : 0;
                                            // Colors: Primary (emerald/indigo), Secondary (amber), Tertiary (purple/slate)
                                            const barColors = ['bg-emerald-400', 'bg-amber-400', 'bg-purple-500', 'bg-blue-400'];
                                            const barColor = barColors[i % barColors.length];
                                            const textColors = ['text-emerald-400', 'text-amber-400', 'text-purple-400', 'text-blue-400'];
                                            const textColor = textColors[i % textColors.length];

                                            return (
                                                <div key={opt.optionId} className="flex items-center gap-4">
                                                    {isElection && (
                                                        <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                                                            {opt.photoUrl ? (
                                                                <img src={opt.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase">
                                                                    {opt.text.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className={`text-lg font-bold w-12 ${textColor}`}>{percent}%</div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-end mb-1.5">
                                                            <span className="text-xs font-bold text-slate-200 truncate">{opt.text}</span>
                                                            <span className="text-[10px] text-slate-500">{opt.voteCount || 0} votes</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                            <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                                <ShieldCheck className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-300">Results are hidden</p>
                                            <p className="text-xs text-slate-500 mt-1">Votes will be revealed after closing.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Section: Timer & Action */}
                                <div className="md:w-[220px] md:border-l border-white/10 md:pl-6 flex flex-col items-start md:items-end justify-center relative">
                                    <div className="absolute top-0 right-0">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded bg-[#0B0D17] border
                                            ${isClosed ? 'text-red-400 border-red-500/20' : 'text-emerald-400 border-emerald-500/20'}`}>
                                            {isClosed ? 'CLOSED' : 'ACTIVE'}
                                        </span>
                                    </div>
                                    
                                    {!isClosed ? (
                                        <>
                                            <div className="mb-4 w-full pt-4 md:pt-0">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                                    <Clock size={12} /> Ends in
                                                </div>
                                                <LiveTimer endDate={poll.endDate} />
                                            </div>
                                            <Button 
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-900/20 flex items-center justify-between"
                                                onClick={() => setSelectedPoll(poll)}
                                            >
                                                Vote Now <ArrowRight size={16} />
                                            </Button>
                                            <p className="text-[10px] text-slate-500 mt-2 text-center w-full">Your vote is required</p>
                                        </>
                                    ) : (
                                        <div className="w-full pt-6 md:pt-0">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                                                <CheckCircle size={12} className="text-emerald-500" /> Poll Concluded
                                            </div>
                                            <Button 
                                                className="w-full bg-white/10 hover:bg-white/20 text-white border-0 flex items-center justify-center gap-2"
                                                onClick={() => setSelectedResults(poll)}
                                            >
                                                View Results
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Bottom Banner */}
            <div className="bg-gradient-to-r from-[#131525] to-[#1E1933] border border-purple-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-lg">Your vote matters!</h4>
                        <p className="text-slate-400 text-sm">Every vote helps us build a better community for everyone.</p>
                    </div>
                </div>
                <Button 
                    variant="outline" 
                    className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 whitespace-nowrap"
                    onClick={() => setActiveTab('PAST')}
                >
                    View Past Polls <ArrowRight size={16} className="ml-2 inline" />
                </Button>
            </div>

            {/* Modals */}
            {selectedPoll && (
                <VoteModal initialPoll={selectedPoll} onClose={() => setSelectedPoll(null)} />
            )}
            {selectedResults && (
                <PollResultsModal initialPoll={selectedResults} role="resident" onClose={() => setSelectedResults(null)} />
            )}
        </div>
    );
}
