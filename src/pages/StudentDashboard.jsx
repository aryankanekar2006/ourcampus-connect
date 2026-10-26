import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { EventCard } from '../components/EventCard';
import { EventDetailModal } from '../components/EventDetailModal';
import { VolunteerModal } from '../components/VolunteerModal';
import { FeedbackModal } from '../components/FeedbackModal';
import { NotificationDrawer } from '../components/NotificationDrawer';
import { ProfileModal } from '../components/ProfileModal';
import { AttendanceModal } from '../components/AttendanceModal';
import { MessageModal } from '../components/MessageModal';
import { FlyerCreatorModal } from '../components/FlyerCreatorModal';
import { getEventDateLabel, isEventVisibleToStudent } from '../features/eventRules';
import {
  Calendar,
  Sparkles,
  Filter,
  Search,
  KeyRound,
  Ticket,
  BookOpen,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Share2
} from 'lucide-react';

export const StudentDashboard = () => {
  const {
    user,
    events,
    registrations,
    volunteers,
    messages,
    registerForEvent,
    applyVolunteer,
    submitFeedback
  } = useAuth();

  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'seminars' | 'my-registrations' | 'attendance' | 'messages'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [detailModalEvent, setDetailModalEvent] = useState(null);
  const [volunteerModalEvent, setVolunteerModalEvent] = useState(null);
  const [feedbackModalEvent, setFeedbackModalEvent] = useState(null);
  const [attendanceModalEvent, setAttendanceModalEvent] = useState(null);
  const [messageModalData, setMessageModalData] = useState(null);
  const [flyerPreviewItem, setFlyerPreviewItem] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Filter approved events targeting student's class or Everyone
  const eligibleEvents = events.filter((e) => {
    if (!isEventVisibleToStudent(e, user?.studentClass)) return false;

    // Type filter
    if (activeTab === 'events' && e.type === 'seminar') return false;
    if (activeTab === 'seminars' && (!e.type || e.type === 'event')) return false;

    // Category Filter
    if (selectedCategory !== 'All' && e.category !== selectedCategory) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = e.title.toLowerCase().includes(q);
      const matchesDesc = (e.description || '').toLowerCase().includes(q);
      const matchesVenue = (e.venue || '').toLowerCase().includes(q);
      const matchesDept = (e.department || '').toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc && !matchesVenue && !matchesDept) return false;
    }

    return true;
  });

  const registeredEventIds = registrations.map((r) => r.eventId);
  const myRegistrations = registrations.filter((r) =>
    r.userEmail?.toLowerCase() === user?.email?.toLowerCase()
  );
  const myVolunteerApplications = volunteers.filter((application) =>
    application.userEmail?.toLowerCase() === user?.email?.toLowerCase()
  );

  // Student conversations
  const myMessages = messages.filter(
    (m) => m.type === 'student_faculty' && (m.senderEmail === user?.email || m.recipientEmail === user?.email)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-16">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {/* Main Student Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Welcome Hero Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-red-700 via-rose-700 to-amber-600 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 font-extrabold text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider">
                  STUDENT PORTAL
                </span>
                <span className="bg-white/20 text-white font-bold text-xs px-2.5 py-0.5 rounded-full border border-white/20">
                  {user?.stream} • {user?.studentClass}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome, {user?.name}!
              </h1>
              <p className="text-xs sm:text-sm text-red-100 font-medium max-w-xl leading-relaxed">
                Explore approved college fests, academic seminars, submit live attendance codes, and interact with faculty organizers.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200 text-xs font-bold scrollbar-none">
          {[
            { id: 'events', label: 'College Events', icon: Calendar },
            { id: 'seminars', label: 'Seminars & Workshops', icon: BookOpen },
            { id: 'my-registrations', label: 'My Registrations', icon: Ticket, badge: myRegistrations.length },
            { id: 'attendance', label: 'Mark Attendance', icon: KeyRound },
            { id: 'messages', label: 'My Messages', icon: MessageSquare, badge: myMessages.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-red-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1 & 2: EVENTS & SEMINARS ================= */}
        {(activeTab === 'events' || activeTab === 'seminars') && (
          <div className="space-y-5">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'events' ? 'events' : 'seminars'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-medium pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-red-600 focus:outline-hidden"
                />
              </div>

              {activeTab === 'events' && (
                <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                  {['All', 'Cultural', 'Technical', 'Sports', 'Academic'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* List */}
            {eligibleEvents.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-700">
                  {activeTab === 'events' ? 'No events available yet.' : 'No seminars available yet.'}
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {activeTab === 'events'
                    ? 'No approved events currently match your target audience or category.'
                    : 'No approved seminars or workshops scheduled yet. Check back soon!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {eligibleEvents.map((item) => (
                  <EventCard
                    key={item.id}
                    event={item}
                    onSelect={() => setDetailModalEvent(item)}
                    onRegister={() => registerForEvent(item.id)}
                    onVolunteer={() => setVolunteerModalEvent(item)}
                    isRegistered={registeredEventIds.includes(item.id)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 3: MY REGISTRATIONS ================= */}
        {activeTab === 'my-registrations' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-gray-900">My Registered Activities</h2>

            {myRegistrations.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
                <Ticket className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-700">No active registrations yet.</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Browse the Events tab and register with one click to generate your verified entry pass.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myRegistrations.map((reg) => {
                  const ev = events.find((e) => e.id === reg.eventId);
                  return (
                    <div key={reg.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          CONFIRMED ENTRY PASS
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {new Date(reg.registeredAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-gray-900">
                        {ev?.title || `Event #${reg.eventId}`}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Registered attendee: <strong>{reg.userName}</strong> ({reg.rollNo || user?.rollNo})
                      </p>

                      <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-xs">
                        <button
                          onClick={() => ev && setDetailModalEvent(ev)}
                          className="text-red-700 font-bold hover:underline cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => ev && setFeedbackModalEvent(ev)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Leave Feedback
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <section className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="text-base font-black text-gray-900">My Volunteer Applications</h3>
              {myVolunteerApplications.length === 0 ? (
                <p className="text-xs text-gray-500">You have not applied to volunteer for an event.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {myVolunteerApplications.map((application) => {
                    const event = events.find((item) => item.id === application.eventId);
                    return (
                      <div key={application.id} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-sm text-gray-900">{event?.title || `Event #${application.eventId}`}</strong>
                          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-lg bg-amber-50 text-amber-800">
                            {application.status || 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Requested role: {application.roleApplied}</p>
                        {application.reason && <p className="text-xs text-gray-500">Reason: {application.reason}</p>}
                        {application.skills && <p className="text-xs text-gray-500">Skills: {application.skills}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ================= TAB 4: MARK ATTENDANCE ================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">Submit Attendance</h2>
              <p className="text-xs text-gray-500 font-medium">
                Enter the short-lived 4-digit numeric code announced verbally by your faculty at the venue.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.filter(e => e.attendanceEnabled && isEventVisibleToStudent(e, user?.studentClass)).map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      ATTENDANCE TRACKED
                    </span>
                    <h3 className="font-extrabold text-base text-gray-900">{item.title}</h3>
                    <p className="text-xs text-gray-500">{getEventDateLabel(item)} • {item.venue}</p>
                  </div>

                  <button
                    onClick={() => setAttendanceModalEvent(item)}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-amber-300" />
                    Enter 4-Digit Code
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: STUDENT MESSAGES ================= */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-gray-900">Conversations with Faculty Organizers</h2>

            {myMessages.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-700">No messages yet.</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  When viewing an event or seminar, click "Message Faculty" to ask questions directly.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myMessages.map((m) => (
                  <div key={m.id} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900">{m.senderName}</span>
                        <span className="text-gray-400 mx-2">→</span>
                        <span className="font-semibold text-gray-700">{m.recipientName || m.recipientEmail}</span>
                      </div>
                      <span className="text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                    {m.eventTitle && (
                      <span className="inline-block bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Regarding: {m.eventTitle}
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-gray-900">{m.subject}</h4>
                    <p className="text-xs text-gray-600 font-medium">{m.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* EVENT DETAIL MODAL */}
      {detailModalEvent && (
        <EventDetailModal
          event={detailModalEvent}
          onClose={() => setDetailModalEvent(null)}
          onRegister={() => registerForEvent(detailModalEvent.id)}
          onOpenVolunteer={() => setVolunteerModalEvent(detailModalEvent)}
          onOpenAttendance={() => setAttendanceModalEvent(detailModalEvent)}
          onOpenMessage={() => setMessageModalData({
            recipientEmail: detailModalEvent.creatorEmail || 'a.kanekar@rkt.edu.in',
            recipientName: detailModalEvent.creatorName || detailModalEvent.department || 'Faculty Organizer',
            eventId: detailModalEvent.id,
            eventTitle: detailModalEvent.title
          })}
          onOpenFlyer={() => setFlyerPreviewItem(detailModalEvent)}
        />
      )}

      {/* ATTENDANCE MODAL */}
      {attendanceModalEvent && (
        <AttendanceModal
          event={attendanceModalEvent}
          onClose={() => setAttendanceModalEvent(null)}
        />
      )}

      {/* MESSAGE MODAL */}
      {messageModalData && (
        <MessageModal
          isOpen={!!messageModalData}
          onClose={() => setMessageModalData(null)}
          recipientEmail={messageModalData.recipientEmail}
          recipientName={messageModalData.recipientName}
          eventId={messageModalData.eventId}
          eventTitle={messageModalData.eventTitle}
          type="student_faculty"
        />
      )}

      {/* FLYER PREVIEW */}
      {flyerPreviewItem && (
        <FlyerCreatorModal
          eventData={flyerPreviewItem}
          readOnly
          onClose={() => setFlyerPreviewItem(null)}
        />
      )}

      {volunteerModalEvent && (
        <VolunteerModal
          event={volunteerModalEvent}
          onClose={() => setVolunteerModalEvent(null)}
          onSubmit={(role, reason, skills) => applyVolunteer(volunteerModalEvent.id, role, reason, skills)}
        />
      )}

      {feedbackModalEvent && (
        <FeedbackModal
          event={feedbackModalEvent}
          onClose={() => setFeedbackModalEvent(null)}
          onSubmit={(rating, comments) => submitFeedback(feedbackModalEvent.id, rating, comments)}
        />
      )}

      <NotificationDrawer isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};

export default StudentDashboard;
