import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';
import { useSubmitFeedbackMutation } from '../../../../store/api/facilityApi';
import { DarkModal, DarkButton } from '../profile/DarkUI';

export function RatingModal({ booking, onClose }) {
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [submitFeedback, { isLoading }] = useSubmitFeedbackMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await submitFeedback({ id: booking._id, rating, feedback }).unwrap();
            toast.success('Feedback submitted successfully!');
            onClose(true);
        } catch (e) {
            toast.error(e?.data?.message ?? 'Failed to submit feedback.');
        }
    };

    return (
        <DarkModal isOpen={true} onClose={() => onClose(false)} title="Rate Your Experience">
            <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-slate-400 text-sm text-center">
                    How was your experience at {booking.amenityId?.name}?
                </p>

                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                        <button 
                            key={n} 
                            type="button"
                            onClick={() => setRating(n)} 
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star className={`w-10 h-10 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                        </button>
                    ))}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Comments (Optional)</label>
                    <textarea 
                        value={feedback} 
                        onChange={e => setFeedback(e.target.value)} 
                        rows={3}
                        placeholder="Any feedback to help us improve?" 
                        className="w-full bg-[#151822] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none" 
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                    <DarkButton type="button" variant="secondary" onClick={() => onClose(false)}>Skip</DarkButton>
                    <DarkButton type="submit" variant="primary" isLoading={isLoading}>Submit Rating</DarkButton>
                </div>
            </form>
        </DarkModal>
    );
}
