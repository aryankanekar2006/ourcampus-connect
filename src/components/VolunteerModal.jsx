import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

export const VolunteerModal = ({
  event,
  onClose,
  onSubmit
}) => {
  const [role, setRole] = useState('Anchor');
  const [note, setNote] = useState('');
  const [skills, setSkills] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  if (!event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError('');
    const result = await onSubmit(role, note, skills);
    if (!result?.success) {
      setSubmissionError(result?.message || 'Unable to submit your application.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Volunteer & Anchor Desk</h3>
              <p className="text-xs text-gray-500 font-medium">Apply to join event organizing team</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-extrabold text-gray-900">Application Submitted!</h4>
            <p className="text-xs text-gray-500">
              Your volunteer application for <strong className="text-red-600">{event.title}</strong> has been sent to faculty organizers.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {submissionError && <p role="alert" className="text-xs font-semibold text-red-700">{submissionError}</p>}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Event
              </label>
              <input
                type="text"
                disabled
                value={event.title}
                className="w-full p-2.5 bg-gray-100 font-bold text-xs text-gray-800 rounded-xl border border-gray-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Requested Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Anchor">Stage Anchor / Master of Ceremonies</option>
                <option value="Volunteer">Volunteer & Registration Desk</option>
                <option value="Technical Staff">Technical / Audio-Visual Support</option>
                <option value="Stage Manager">Stage Manager & Backstage Coordinator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Why should you be selected? (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Mention past anchoring/volunteering experience or enthusiasm..."
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Skills (Optional)
              </label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                rows={2}
                placeholder="List relevant skills..."
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Submit Application
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
