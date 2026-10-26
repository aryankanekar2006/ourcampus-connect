import React, { useState } from 'react';
import { X, Star, MessageSquare, CheckCircle2 } from 'lucide-react';

export const FeedbackModal = ({
  event,
  onClose,
  onSubmit
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    const result = await onSubmit(event.id, rating, comment);
    setSubmitting(false);
    if (!result?.success) {
      setErrorMessage(result?.message || 'Unable to submit feedback.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-600 text-white rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Event Feedback & Rating</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-extrabold text-gray-900">Thank you for your feedback!</h4>
            <p className="text-xs text-gray-500">Your opinion helps improve future college events.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{errorMessage}</p>}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Rate Event: <span className="text-red-600 font-extrabold">{event.title}</span>
              </label>
              <div className="flex items-center gap-2 justify-center py-2 bg-gray-50 rounded-xl border border-gray-200">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Your Thoughts & Suggestions
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                maxLength={5000}
                rows={3}
                placeholder="What did you enjoy? Any suggestions for the organizers?"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Event Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
