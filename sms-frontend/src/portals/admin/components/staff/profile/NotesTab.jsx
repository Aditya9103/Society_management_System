import React, { useState } from 'react';
import { FileText, Plus, User } from 'lucide-react';
import Card from '../../../../../components/ui/Card';

export default function NotesTab({ user, profile, updateProfile }) {
    const [newNote, setNewNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const notes = profile?.notes || [];

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        
        setIsSubmitting(true);
        try {
            // Note: Since we are not saving the admin userId here directly in frontend state,
            // we will just append the text. Ideally the backend should handle adding notes with the author's ID.
            const updatedNotes = [...notes, { text: newNote.trim(), createdAt: new Date() }];
            await updateProfile({ id: user._id, data: { profileUpdates: { notes: updatedNotes } } }).unwrap();
            setNewNote('');
        } catch (err) {
            console.error('Failed to add note', err);
            alert('Failed to add note');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="bg-[#151921] border-white/5">
            <Card.Body className="p-6 flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-[#6338f0]" />
                        <h3 className="text-lg font-bold text-white">Staff Notes</h3>
                    </div>
                    
                    {notes.length > 0 ? (
                        <div className="space-y-4">
                            {notes.map((note, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-sm text-gray-200 leading-relaxed mb-3">{note.text}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-200 font-bold">
                                        <User className="w-3.5 h-3.5" />
                                        <span>Added on {new Date(note.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white/[0.02] rounded-xl border border-white/5">
                            <p className="text-sm text-gray-200 font-bold">No notes have been added for this staff member yet.</p>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-80 shrink-0">
                    <form onSubmit={handleAddNote} className="sticky top-6 p-5 rounded-xl bg-[#1a1f2c] border border-white/5 shadow-xl">
                        <h4 className="text-sm font-bold text-white mb-3">Add New Note</h4>
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Write your note here... (only visible to admins)"
                            className="w-full h-32 px-4 py-3 rounded-xl bg-[#0b0d14] border border-white/10 text-white placeholder-gray-300 font-bold focus:outline-none focus:ring-2 focus:ring-[#6338f0] focus:border-transparent text-sm resize-none mb-4 transition-all"
                            disabled={isSubmitting}
                        ></textarea>
                        <button
                            type="submit"
                            disabled={isSubmitting || !newNote.trim()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6338f0] text-white text-sm font-bold shadow-[0_0_15px_rgba(99,56,240,0.3)] hover:bg-[#5229db] transition-colors disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            {isSubmitting ? 'Adding...' : 'Add Note'}
                        </button>
                    </form>
                </div>
            </Card.Body>
        </Card>
    );
}
