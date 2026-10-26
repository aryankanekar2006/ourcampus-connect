import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, KeyRound, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const AttendanceModal = ({ event, onClose }) => {
  const { requestAttendance } = useAuth();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 4) {
      setErrorMsg('Please enter a valid 4-digit attendance code.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await requestAttendance(event.id, code);
      if (res.success) {
        setStatusResult(res.message || 'Attendance request submitted successfully! Awaiting faculty approval.');
      } else {
        setErrorMsg(res.message || 'Invalid or expired attendance code. Please check with your faculty.');
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to submit attendance request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-gray-900">Mark Attendance</h2>
          <p className="text-xs text-gray-500 font-medium">
            Event: <strong className="text-gray-800">{event.title}</strong>
          </p>
        </div>

        {statusResult ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-emerald-900 text-sm">Request Submitted</h3>
            <p className="text-xs text-emerald-700 leading-relaxed font-medium">
              {statusResult}
            </p>
            <div className="pt-2">
              <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> Status: Pending Faculty Approval
              </span>
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                Enter the <strong>4-digit code</strong> announced verbally by the faculty. Each code is valid for <strong>15–20 seconds</strong> on the server clock.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 text-center">
                4-Digit Attendance Code
              </label>
              <input
                type="text"
                maxLength={4}
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0000"
                className="w-full text-center text-3xl font-mono font-black tracking-widest py-3 px-4 border-2 border-amber-300 rounded-2xl focus:border-red-600 focus:outline-hidden bg-gray-50 text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || code.length !== 4}
              className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? 'Verifying Code...' : 'Submit Attendance Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
