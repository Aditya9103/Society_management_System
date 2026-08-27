import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Coffee, FileText, UserCheck, MessageCircle, Megaphone, CheckSquare } from 'lucide-react';
import { createPortal } from 'react-dom';

const SEARCH_LINKS = [
    { id: 'amenities', label: 'Book Amenities', icon: Coffee, path: '/resident/amenities', keywords: ['pool', 'gym', 'clubhouse', 'book', 'amenity'] },
    { id: 'invoices', label: 'View Invoices & Billing', icon: FileText, path: '/resident/invoices', keywords: ['bill', 'pay', 'due', 'maintenance', 'receipt'] },
    { id: 'visitors', label: 'Manage Visitors', icon: UserCheck, path: '/resident/visitors', keywords: ['guest', 'invite', 'pre-approve', 'entry'] },
    { id: 'complaints', label: 'Raise a Complaint', icon: MessageCircle, path: '/resident/complaints', keywords: ['issue', 'ticket', 'help', 'support', 'plumber', 'electrician'] },
    { id: 'polls', label: 'Vote on Polls', icon: CheckSquare, path: '/resident/polls', keywords: ['vote', 'survey', 'opinion', 'election'] },
    { id: 'notices', label: 'Notice Board', icon: Megaphone, path: '/resident/notices', keywords: ['announcement', 'news', 'update', 'circular'] },
];

export function CommandPaletteModal({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    // Filter results
    const results = SEARCH_LINKS.filter(link => {
        if (!query) return true;
        const lowerQ = query.toLowerCase();
        return link.label.toLowerCase().includes(lowerQ) || link.keywords.some(k => k.includes(lowerQ));
    });

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[selectedIndex]) {
                    navigate(results[selectedIndex].path);
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex, navigate, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-start justify-center pt-[10vh] sm:pt-[20vh] px-4 z-[99999]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-[#0B0D17] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
                
                {/* Search Input */}
                <div className="flex items-center px-4 border-b border-white/5">
                    <Search className="w-5 h-5 text-indigo-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search for amenities, invoices, visitors..."
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                        className="w-full bg-transparent border-none text-white px-4 py-5 text-lg focus:outline-none focus:ring-0 placeholder-slate-500 font-medium"
                    />
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-block text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/10">ESC</span>
                        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results List */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {results.length === 0 ? (
                        <div className="py-14 text-center text-slate-500">
                            <p>No results found for "{query}"</p>
                            <p className="text-sm mt-1">Try searching for 'pool', 'bill', or 'guest'</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Links</div>
                            {results.map((result, idx) => {
                                const Icon = result.icon;
                                const isSelected = idx === selectedIndex;
                                return (
                                    <button
                                        key={result.id}
                                        onClick={() => { navigate(result.path); onClose(); }}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-xl transition-all ${isSelected ? 'bg-indigo-600/10 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[#131525] text-slate-400'}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold">{result.label}</span>
                                        </div>
                                        {isSelected && <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded border border-indigo-400/20">↵ ENTER</span>}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                {/* Footer hints */}
                <div className="bg-[#131525] px-4 py-3 border-t border-white/5 flex items-center justify-center sm:justify-between text-xs text-slate-500 font-medium">
                    <div className="hidden sm:flex items-center gap-4">
                        <span className="flex items-center gap-1">Use <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-sans">↑</kbd> <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-sans">↓</kbd> to navigate</span>
                        <span className="flex items-center gap-1"><kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-sans">↵</kbd> to select</span>
                    </div>
                    <div>Society Management Spotlight</div>
                </div>
            </div>
        </div>,
        document.body
    );
}
