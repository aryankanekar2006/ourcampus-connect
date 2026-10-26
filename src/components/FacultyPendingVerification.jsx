import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, RefreshCw, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { CollegeLogo } from './CollegeLogo';

export const FacultyPendingVerification = () => {
  const { user, logout, updateProfile } = useAuth();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');

  const handleCheckStatus = async (event) => {
    event.preventDefault();
    if (!password) {
      setMessage('Enter your current password to verify your account.');
      return;
    }
    setChecking(true);
    setMessage('');
    try {
      const resp = await fetch('/api/db/faculty-verification-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password
        })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        if (data.isVerified) {
          updateProfile({ isVerified: true, verificationStatus: 'approved' });
          setMessage('Your faculty account has been verified by the Principal.');
        } else {
          const status = data.verificationStatus || 'pending';
          updateProfile({ isVerified: false, verificationStatus: status });
          setMessage(`Status: ${status}.`);
        }
      } else {
        setMessage(data.message || 'Unable to verify your account credentials.');
      }
    } catch (err) {
      setMessage('Unable to reach server. Please try again later.');
    } finally {
      setPassword('');
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 text-center space-y-6">
        <div className="flex justify-center">
          <CollegeLogo size="lg" />
        </div>

        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Verification Pending
          </span>
          <h2 className="text-2xl font-black text-gray-900">
            Faculty Access Under Review
          </h2>
          <p className="text-xs text-gray-600 font-medium leading-relaxed">
            Welcome, <strong>{user?.name}</strong> ({user?.facultyId || user?.email}). Your faculty registration request has been submitted to <strong>Principal Dr. R. K. Sharma</strong> for institutional verification.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left text-xs space-y-1.5 text-gray-700">
          <p><strong className="text-gray-900">Department:</strong> {user?.department || 'Computer Science'}</p>
          <p><strong className="text-gray-900">Faculty ID:</strong> {user?.facultyId || 'Submitted'}</p>
          <p><strong className="text-gray-900">Current Status:</strong> <span className="font-bold text-amber-600 uppercase">{user?.verificationStatus || 'Pending Approval'}</span></p>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs font-semibold text-blue-800 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleCheckStatus} className="space-y-3 pt-2">
          <label className="block text-left text-xs font-bold text-gray-700">
            Current password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              maxLength={1024}
              required
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5"
            />
          </label>
          <button
            type="submit"
            disabled={checking}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking Status...' : 'Check Verification Status'}
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
};
