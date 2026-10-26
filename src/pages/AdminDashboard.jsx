import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { NotificationDrawer } from '../components/NotificationDrawer';
import { ProfileModal } from '../components/ProfileModal';
import { FlyerCreatorModal } from '../components/FlyerCreatorModal';
import { MessageModal } from '../components/MessageModal';
import {
  Calendar,
  Award,
  Users,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Filter,
  Layers,
  Send,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Search,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { AUDIENCE_OPTIONS, TEACHER_DEPARTMENTS } from '../data/authOptions';
import { getEventDateLabel } from '../features/eventRules';

export const AdminDashboard = () => {
  const {
    events,
    registrations,
    volunteers,
    feedbacks,
    messages,
    facultyVerifications,
    facultyVerificationsLoaded,
    facultyVerificationsError,
    updateFacultyVerification,
    setEventStatus,
    reviewEventFlyer,
    deleteEvent
  } = useAuth();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all-events' | 'all-seminars' | 'faculty-verification' | 'messages' | 'reports'
  const [statusFilter, setStatusFilter] = useState('All');
  const [audienceFilter, setAudienceFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Request Changes Modal
  const [reviewingEvent, setReviewingEvent] = useState(null);
  const [reviewMessage, setReviewMessage] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Flyer preview
  const [flyerPreviewItem, setFlyerPreviewItem] = useState(null);

  // Message modal
  const [messageModalData, setMessageModalData] = useState(null);
  const [facultyRecipientEmail, setFacultyRecipientEmail] = useState('');
  const [flyerReviewNote, setFlyerReviewNote] = useState('');
  const [flyerReviewFeedback, setFlyerReviewFeedback] = useState('');

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Calculate Real Statistics from Database
  const totalEvents = events.filter((e) => !e.type || e.type === 'event').length;
  const totalSeminars = events.filter((e) => e.type === 'seminar').length;
  const pendingApprovals = events.filter((e) => !e.status || e.status === 'pending_approval');
  const pendingArtworkReviews = events.filter((event) =>
    (event.flyerReviewStatus === 'pending_review' || event.coverReviewStatus === 'pending_review') &&
    !pendingApprovals.some((pendingEvent) => pendingEvent.id === event.id)
  );
  const pendingReviewItems = [...pendingApprovals, ...pendingArtworkReviews];
  const approvedCount = events.filter((e) => e.status === 'approved').length;
  const changesRequestedCount = events.filter((e) => e.status === 'changes_requested').length;
  const rejectedCount = events.filter((e) => e.status === 'rejected').length;
  const pendingFaculty = facultyVerifications.filter((f) => !f.isVerified || f.verificationStatus === 'pending');

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    if (activeTab === 'all-events' && e.type === 'seminar') return false;
    if (activeTab === 'all-seminars' && (!e.type || e.type === 'event')) return false;

    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    if (audienceFilter !== 'All' && e.targetAudience !== audienceFilter) return false;
    if (departmentFilter !== 'All' && e.department !== departmentFilter) return false;
    return true;
  });

  // Handle Review Action (Approve, Reject, Request Changes)
  const handleReviewAction = async (item, action) => {
    setSubmittingReview(true);
    const result = await setEventStatus(item.id, action, reviewMessage);
    setSubmittingReview(false);
    if (!result.success) {
      setReviewError(result.message || 'Unable to update the event approval status.');
      return;
    }
    setReviewError('');
    setReviewingEvent(null);
    setReviewMessage('');
  };

  const handleFlyerReview = async (item, kind, decision) => {
    const result = await reviewEventFlyer(item.id, kind, decision, flyerReviewNote);
    setFlyerReviewFeedback(result.success
      ? `Flyer review updated for "${item.title}".`
      : result.message || 'Unable to update flyer review.');
    if (result.success) setFlyerReviewNote('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-16">
      <Navbar
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {reviewError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800">
            {reviewError}
          </p>
        )}
        {/* Principal Executive Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-red-950 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider">
                PRINCIPAL EXECUTIVE CONTROL DESK
              </span>
              <span className="bg-white/20 text-white font-bold text-xs px-2.5 py-0.5 rounded-full border border-white/20">
                Dr. R. K. Sharma • Designated Principal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Institutional Administration Portal
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 font-medium max-w-xl leading-relaxed">
              Review and authorize college events, seminars, faculty verification credentials, campus announcements, and access downloadable summary records.
            </p>
          </div>
        </div>

        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Total Events</span>
            <h3 className="text-xl font-black text-gray-900">{totalEvents}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Total Seminars</span>
            <h3 className="text-xl font-black text-indigo-700">{totalSeminars}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/30">
            <span className="text-[10px] font-bold text-amber-700 uppercase">Pending Approvals</span>
            <h3 className="text-xl font-black text-amber-600">{pendingApprovals.length}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Approved Items</span>
            <h3 className="text-xl font-black text-emerald-600">{approvedCount}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs">
            <span className="text-[10px] font-bold text-purple-700 uppercase">Faculty Requests</span>
            <h3 className="text-xl font-black text-purple-700">{pendingFaculty.length}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Registrations</span>
            <h3 className="text-xl font-black text-red-600">{registrations.length}</h3>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200 text-xs font-bold scrollbar-none">
          {[
            { id: 'pending', label: 'Pending Approvals', icon: Clock, badge: pendingApprovals.length },
            { id: 'faculty-verification', label: 'Faculty Verification', icon: ShieldCheck, badge: pendingFaculty.length },
            { id: 'all-events', label: 'All Events', icon: Calendar, badge: totalEvents },
            { id: 'all-seminars', label: 'All Seminars', icon: BookOpen, badge: totalSeminars },
            { id: 'messages', label: 'Messages to Faculty', icon: MessageSquare },
            { id: 'reports', label: 'Summary Reports (.docx)', icon: FileText },
            { id: 'feedback', label: 'Event Feedback', icon: MessageSquare, badge: feedbacks.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-red-100 text-red-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: PENDING APPROVALS ================= */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900">Pending Submissions Review Queue</h2>
                <p className="text-xs text-gray-500 font-medium">Review and authorize submissions before publishing to students</p>
              </div>
            </div>

            {pendingReviewItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-gray-700">No pending approvals.</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  All submitted events and seminars have been reviewed. New proposals from faculty will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReviewItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                            {item.type === 'seminar' ? 'SEMINAR / WORKSHOP' : 'COLLEGE EVENT'}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            Submitted by: <strong className="text-gray-800">{item.creatorName || item.department}</strong>
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-gray-900">{item.title}</h3>
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">{item.description}</p>
                      </div>

                      <span className="bg-amber-100 text-amber-900 font-bold text-xs px-3 py-1 rounded-full border border-amber-300 self-start sm:self-auto">
                        {pendingApprovals.some((event) => event.id === item.id) ? 'Pending Decision' : 'Artwork Review'}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-700">
                      <div><span className="text-[10px] text-gray-400 uppercase font-bold block">Date & Time</span> <strong>{getEventDateLabel(item)} • {item.time}</strong></div>
                      <div><span className="text-[10px] text-gray-400 uppercase font-bold block">Venue</span> <strong>{item.venue}</strong></div>
                      <div><span className="text-[10px] text-gray-400 uppercase font-bold block">Target Audience</span> <strong>{item.targetAudience}</strong></div>
                      <div><span className="text-[10px] text-gray-400 uppercase font-bold block">Attendance</span> <strong>{item.attendanceEnabled ? 'Enabled (OTP)' : 'Disabled'}</strong></div>
                    </div>

                    {(item.proposedFlyerImage || item.proposedCoverImage) && (
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 space-y-3">
                        <input value={flyerReviewNote} onChange={(event) => setFlyerReviewNote(event.target.value)} maxLength={500} placeholder="Optional change request for Faculty" className="w-full rounded-lg border border-indigo-200 bg-white p-2 text-xs" />
                        {item.proposedFlyerImage && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-indigo-900">Proposed flyer • {item.flyerReviewStatus || 'pending_review'}</p>
                            <img src={item.proposedFlyerImage} alt={`Proposed flyer for ${item.title}`} className="max-h-72 rounded-lg object-contain" />
                            {item.flyerReviewStatus === 'pending_review' && <div className="flex flex-wrap gap-2">
                              <button onClick={() => handleFlyerReview(item, 'flyer', 'approved')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Approve Flyer</button>
                              <button onClick={() => handleFlyerReview(item, 'flyer', 'changes_requested')} className="rounded-lg bg-orange-100 px-3 py-2 text-xs font-bold text-orange-900">Request Changes</button>
                              <button onClick={() => handleFlyerReview(item, 'flyer', 'rejected')} className="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-800">Reject Flyer</button>
                            </div>}
                          </div>
                        )}
                        {item.proposedCoverImage && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-indigo-900">Proposed cover • {item.coverReviewStatus || 'pending_review'}</p>
                            <img src={item.proposedCoverImage} alt={`Proposed cover for ${item.title}`} className="max-h-40 w-full rounded-lg object-cover" />
                            {item.coverReviewStatus === 'pending_review' && <div className="flex flex-wrap gap-2">
                              <button onClick={() => handleFlyerReview(item, 'cover', 'approved')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Approve Cover</button>
                              <button onClick={() => handleFlyerReview(item, 'cover', 'changes_requested')} className="rounded-lg bg-orange-100 px-3 py-2 text-xs font-bold text-orange-900">Request Changes</button>
                              <button onClick={() => handleFlyerReview(item, 'cover', 'rejected')} className="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-800">Reject Cover</button>
                            </div>}
                          </div>
                        )}
                        {flyerReviewFeedback && <p role="status" className="text-xs text-indigo-800">{flyerReviewFeedback}</p>}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => setFlyerPreviewItem({
                          ...item,
                          selectedFlyerImage: item.proposedFlyerImage || item.approvedFlyerImage || item.selectedFlyerImage
                        })}
                        className="text-red-700 hover:text-red-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Preview Flyer Artwork
                      </button>

                      {pendingApprovals.some((event) => event.id === item.id) && <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setReviewingEvent(item); setReviewMessage(''); }}
                          className="bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-300 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          Request Changes
                        </button>
                        <button
                          onClick={() => handleReviewAction(item, 'rejected')}
                          className="bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleReviewAction(item, 'approved')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve & Publish
                        </button>
                      </div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: FACULTY VERIFICATION ================= */}
        {activeTab === 'faculty-verification' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">Faculty Access Verification</h2>
              <p className="text-xs text-gray-500 font-medium">
                Authorize or revoke teacher account access for departmental event creation and live attendance privileges.
              </p>
            </div>

            {facultyVerifications.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
                <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-700">No faculty verification requests.</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  New faculty registrations requiring Principal verification will be listed here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
                <table className="w-full text-left text-xs font-medium">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold">
                    <tr>
                      <th className="p-3">Faculty Name</th>
                      <th className="p-3">Email ID</th>
                      <th className="p-3">Faculty ID</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {facultyVerifications.map((fac) => (
                      <tr key={fac.id} className="hover:bg-gray-50/80">
                        <td className="p-3 font-bold text-gray-900">{fac.name}</td>
                        <td className="p-3 text-gray-600">{fac.email}</td>
                        <td className="p-3 font-mono font-semibold text-gray-700">{fac.facultyId || 'N/A'}</td>
                        <td className="p-3 text-gray-800">{fac.department || 'Computer Science'}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            fac.isVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : fac.verificationStatus === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {fac.isVerified ? 'VERIFIED' : (fac.verificationStatus || 'PENDING').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          {!fac.isVerified ? (
                            <>
                              <button
                                onClick={() => updateFacultyVerification(fac.id, 'approved')}
                                className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                              >
                                Approve Access
                              </button>
                              <button
                                onClick={() => updateFacultyVerification(fac.id, 'rejected')}
                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-700 cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => updateFacultyVerification(fac.id, 'revoked')}
                              className="text-gray-400 hover:text-red-600 font-bold text-xs p-1 cursor-pointer"
                            >
                              Revoke Access
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3 & 4: ALL EVENTS & ALL SEMINARS ================= */}
        {(activeTab === 'all-events' || activeTab === 'all-seminars') && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  {activeTab === 'all-events' ? 'All College Events' : 'All Seminars & Workshops'}
                </h2>
                <p className="text-xs text-gray-500 font-medium">Global governance of all department submissions</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 text-xs">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 border border-gray-300 rounded-xl bg-white font-medium"
                >
                  <option value="All">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="changes_requested">Changes Requested</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={audienceFilter}
                  onChange={(e) => setAudienceFilter(e.target.value)}
                  className="p-2 border border-gray-300 rounded-xl bg-white font-medium"
                >
                  <option value="All">All Audiences</option>
                  {AUDIENCE_OPTIONS.map((aud) => <option key={aud} value={aud}>{aud}</option>)}
                </select>

                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="p-2 border border-gray-300 rounded-xl bg-white font-medium"
                >
                  <option value="All">All Departments</option>
                  {TEACHER_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-2">
                <h3 className="text-base font-bold text-gray-700">No matching items found.</h3>
                <p className="text-xs text-gray-400">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-md">
                          {item.type === 'seminar' ? 'Seminar' : item.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status || 'Pending'}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-gray-900 leading-snug">{item.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                    </div>

                    <div className="border-t border-gray-100 pt-3 text-xs space-y-1 text-gray-600">
                      <div>Date: <strong>{getEventDateLabel(item)}</strong> ({item.venue})</div>
                      <div>Target: <strong>{item.targetAudience}</strong></div>
                      <div>Department: <strong>{item.department}</strong></div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => setFlyerPreviewItem(item)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Flyer
                      </button>

                      {item.status === 'approved' && (
                        <a
                          href={`/api/reports/docx/${item.id}`}
                          download
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1"
                          title="Download Word Report"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          .docx
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: MESSAGES TO FACULTY ================= */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900">Communication with Faculty</h2>
                <p className="text-xs text-gray-500 font-medium">Send directives, requested changes, and announcements</p>
              </div>

              <div className="flex items-center gap-2">
                <select value={facultyRecipientEmail} onChange={(event) => setFacultyRecipientEmail(event.target.value)} className="max-w-56 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs">
                  <option value="">{facultyVerificationsLoaded
                    ? facultyVerificationsError ? 'Faculty list unavailable' : facultyVerifications.length ? 'Select a Faculty recipient' : 'No Faculty accounts found'
                    : 'Loading Faculty accounts...'}</option>
                  {facultyVerifications.filter((faculty) => faculty.role === 'teacher').map((faculty) => (
                    <option key={faculty.id} value={faculty.email}>{faculty.name} — {faculty.email}</option>
                  ))}
                </select>
                <button
                  disabled={!facultyRecipientEmail}
                  onClick={() => {
                    const faculty = facultyVerifications.find((member) => member.email === facultyRecipientEmail);
                    if (faculty) setMessageModalData({
                      recipientEmail: faculty.email,
                      recipientName: faculty.name,
                      type: 'principal_faculty'
                    });
                  }}
                  className="bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  New Message to Faculty
                </button>
              </div>
              {facultyVerificationsError && <p role="alert" className="text-xs text-red-700">{facultyVerificationsError}</p>}
            </div>

            {messages.filter(m => m.type === 'principal_faculty').length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-700">No messages yet.</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Direct communication with faculty members will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.filter(m => m.type === 'principal_faculty').map((m) => (
                  <div key={m.id} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900">{m.senderName}</span>
                        <span className="text-gray-400 mx-2">→</span>
                        <span className="font-semibold text-gray-700">{m.recipientName || m.recipientEmail}</span>
                      </div>
                      <span className="text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                    {m.subject && <h4 className="text-xs font-bold text-red-700">{m.subject}</h4>}
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">{m.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 6: SUMMARY REPORTS (.DOCX) ================= */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">Institutional Event & Seminar Reports</h2>
              <p className="text-xs text-gray-500 font-medium">Download official Microsoft Word (.docx) documents for accreditation and college archives</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.filter(e => e.status === 'approved').map((ev) => (
                <div key={ev.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                      {ev.type === 'seminar' ? 'SEMINAR REPORT' : 'EVENT REPORT'}
                    </span>
                    <h3 className="font-extrabold text-base text-gray-900">{ev.title}</h3>
                    <p className="text-xs text-gray-500">{ev.department} • {getEventDateLabel(ev)}</p>
                  </div>

                  <a
                    href={`/api/reports/docx/${ev.id}`}
                    download
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    Download Word Document (.docx)
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">College-wide Event Feedback</h2>
              <p className="text-xs text-gray-500 font-medium">Saved student ratings and comments across college events.</p>
            </div>
            {feedbacks.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-xs text-gray-500">
                No student feedback has been submitted.
              </div>
            ) : feedbacks.map((feedback) => (
              <article key={feedback.id} className="rounded-2xl border border-gray-200 bg-white p-4 space-y-1">
                <h3 className="text-sm font-extrabold text-gray-900">{feedback.eventTitle || `Event #${feedback.eventId}`}</h3>
                <p className="text-xs font-bold text-amber-700">Rating: {feedback.rating} / 5</p>
                <p className="text-xs text-gray-700">{feedback.comment}</p>
                <p className="text-[11px] text-gray-400">By {feedback.userName} • {new Date(feedback.createdAt).toLocaleDateString()}</p>
              </article>
            ))}
          </section>
        )}
      </main>

      {/* REQUEST CHANGES MODAL */}
      {reviewingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-base font-black text-gray-900">
              Request Changes: "{reviewingEvent.title}"
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Explain the required modifications. The responsible faculty member will be notified and can edit the submission.
            </p>

            <textarea
              rows={4}
              required
              value={reviewMessage}
              onChange={(e) => setReviewMessage(e.target.value)}
              placeholder="e.g. Please update the venue to the main auditorium and clarify registration eligibility."
              className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl resize-none focus:border-red-600 focus:outline-hidden"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewingEvent(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingReview || !reviewMessage.trim()}
                onClick={() => handleReviewAction(reviewingEvent, 'changes_requested')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
              >
                {submittingReview ? 'Sending...' : 'Send Request to Faculty'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLYER PREVIEW MODAL */}
      {flyerPreviewItem && (
        <FlyerCreatorModal
          eventData={flyerPreviewItem}
          readOnly
          onClose={() => setFlyerPreviewItem(null)}
        />
      )}

      {/* MESSAGE MODAL */}
      {messageModalData && (
        <MessageModal
          isOpen={!!messageModalData}
          onClose={() => setMessageModalData(null)}
          recipientEmail={messageModalData.recipientEmail}
          recipientName={messageModalData.recipientName}
          type={messageModalData.type}
        />
      )}

      <NotificationDrawer isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};

export default AdminDashboard;
