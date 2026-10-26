import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { STUDENT_CLASSES, STUDENT_STREAMS } from '../data/authOptions';
import { X, User, Save } from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile, changePassword } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [stream, setStream] = useState(user?.stream || '');
  const [studentClass, setStudentClass] = useState(user?.studentClass || '');
  const [rollNo, setRollNo] = useState(user?.rollNo || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saved, setSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setStream(user?.stream || '');
    setStudentClass(user?.studentClass || '');
    setRollNo(user?.rollNo || '');
    setPhone(user?.phone || '');
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    if (!name.trim() || name.trim().length > 120 || phone.trim().length > 40 ||
      (user.role === 'student' && stream && !STUDENT_STREAMS.includes(stream))) {
      setProfileError('Enter a valid name, phone number, and stream.');
      return;
    }
    setSavingProfile(true);
    const profile = { name: name.trim(), phone: phone.trim() || null };
    if (user.role === 'student') profile.stream = stream;
    const result = await updateProfile(profile);
    setSavingProfile(false);
    if (!result.success) {
      setProfileError(result.message || 'Unable to update the profile.');
      return;
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleCancel = () => {
    setName(user.name || '');
    setStream(user.stream || '');
    setStudentClass(user.studentClass || '');
    setRollNo(user.rollNo || '');
    setPhone(user.phone || '');
    setProfileError('');
    setSaved(false);
    setCurrentPassword('');
    setNewPassword('');
    setPasswordMessage('');
    onClose();
  };

  const handlePasswordChange = async () => {
    setPasswordMessage('');
    const normalizedNewPassword = newPassword.trim();
    if (newPassword.length > 1024 || normalizedNewPassword.length < 6) {
      setPasswordMessage('New password must be 6 to 1024 characters after trimming.');
      return;
    }

    setChangingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setPasswordMessage(result.message);
    setCurrentPassword('');
    setNewPassword('');
    setChangingPassword(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-600 text-white rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">User Profile Settings</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {user.role === 'student' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Stream</label>
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 font-bold outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select stream</option>
                    {STUDENT_STREAMS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Class (managed by college)</label>
                  <select
                    value={studentClass}
                    disabled
                    className="w-full rounded-xl border border-gray-300 bg-gray-100 p-2.5 font-bold outline-none"
                  >
                    <option value="">Not set</option>
                    {STUDENT_CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Roll / College ID</label>
                <input
                  type="text"
                  value={rollNo}
                  readOnly
                  className="w-full rounded-xl border border-gray-300 bg-gray-100 p-2.5 font-mono font-bold text-gray-900 outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Contact Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={40}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <section className="space-y-2 border-t border-gray-200 pt-3">
            <h4 className="font-extrabold text-gray-900">Change password</h4>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              maxLength={1024}
              placeholder="Current password"
              aria-label="Current password"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5"
            />
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              maxLength={1024}
              placeholder="New password (6-1024 characters)"
              aria-label="New password"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5"
            />
            {passwordMessage && <p role="status" className="text-xs font-bold text-gray-700">{passwordMessage}</p>}
            <button
              type="button"
              disabled={changingPassword || !currentPassword || !newPassword}
              onClick={handlePasswordChange}
              className="w-full rounded-xl border border-red-600 px-4 py-2.5 font-extrabold text-red-700 disabled:opacity-50"
            >
              {changingPassword ? 'Changing password...' : 'Change Password'}
            </button>
          </section>

          {saved && (
            <p className="text-center font-bold text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              ✓ Profile updated successfully.
            </p>
          )}
          {profileError && <p role="alert" className="text-center font-bold text-red-700 bg-red-50 p-2 rounded-xl border border-red-200">{profileError}</p>}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCancel}
              disabled={savingProfile}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-extrabold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingProfile}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-extrabold text-white shadow-md transition hover:bg-red-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
