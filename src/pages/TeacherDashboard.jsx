import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { FlyerCreatorModal } from '../components/FlyerCreatorModal';
import { NotificationDrawer } from '../components/NotificationDrawer';
import { ProfileModal } from '../components/ProfileModal';
import { MessageModal } from '../components/MessageModal';
import {
  Calendar,
  Award,
  Users,
  Sparkles,
  Trash2,
  BarChart3,
  Check,
  X,
  FileText,
  Clock,
  Send,
  MessageSquare,
  QrCode,
  AlertCircle,
  Eye,
  Edit,
  Download,
  BookOpen,
  PlusCircle,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  Layers,
  GraduationCap
} from 'lucide-react';
import { AUDIENCE_OPTIONS, PROGRAMME_TYPES, TEACHER_DEPARTMENTS } from '../data/authOptions';
import { getEventDateLabel, parseEventDates } from '../features/eventRules';

export const TeacherDashboard = () => {
  const {
    user,
    events,
    registrations,
    volunteers,
    feedbacks,
    messages,
    createEventOrSeminar,
    updateEventOrSeminar,
    deleteEvent,
    updateVolunteerStatus,
    startAttendance,
    fetchAttendanceRequests,
    approveAttendance,
    endAttendance,
    markMessageRead
  } = useAuth();

  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'seminars' | 'create-event' | 'create-seminar' | 'submissions' | 'attendance' | 'principal-messages' | 'student-messages' | 'reports'

  // Form States: CREATE EVENT
  const [eventTitle, setEventTitle] = useState('');
  const [eventSubHeadline, setEventSubHeadline] = useState('');
  const [eventCategory, setEventCategory] = useState('Cultural');
  const [eventDepartment, setEventDepartment] = useState(user?.department || 'Computer Science');
  const [eventDateMode, setEventDateMode] = useState('single');
  const [eventDate, setEventDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventAdditionalDates, setEventAdditionalDates] = useState([]);
  const [additionalEventDate, setAdditionalEventDate] = useState('');
  const [eventTime, setEventTime] = useState('10:00 AM - 04:00 PM');
  const [eventVenue, setEventVenue] = useState('College Main Auditorium');
  const [eventHighlight1, setEventHighlight1] = useState('');
  const [eventHighlight2, setEventHighlight2] = useState('');
  const [eventHighlight3, setEventHighlight3] = useState('');
  const [eventPrizes, setEventPrizes] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventRegEnabled, setEventRegEnabled] = useState(false);
  const [eventTicketPrice, setEventTicketPrice] = useState('Free');
  const [eventEligibility, setEventEligibility] = useState('Open for All RKT Students');
  const [eventRegDeadline, setEventRegDeadline] = useState('');
  const [eventRegUrl, setEventRegUrl] = useState('');
  const [eventTargetAudience, setEventTargetAudience] = useState('Everyone');
  const [eventContact, setEventContact] = useState(user?.phone || '+91 98200 11223');
  const [eventSocialHandle, setEventSocialHandle] = useState('@rktcollege_official');
  const [eventAttendanceEnabled, setEventAttendanceEnabled] = useState(false);
  const [eventFlyerData, setEventFlyerData] = useState(null);

  // Form States: CREATE SEMINAR / WORKSHOP
  const [semTitle, setSemTitle] = useState('');
  const [semTagline, setSemTagline] = useState('');
  const [semProgrammeType, setSemProgrammeType] = useState('Seminar');
  const [semDepartment, setSemDepartment] = useState(user?.department || 'Computer Science');
  const [semAbout, setSemAbout] = useState('');
  const [semDate, setSemDate] = useState('');
  const [semTime, setSemTime] = useState('11:00 AM - 02:00 PM');
  const [semVenue, setSemVenue] = useState('Audio-Visual Seminar Hall 201');
  const [semResourcePerson, setSemResourcePerson] = useState('');
  const [semForWhom, setSemForWhom] = useState('Undergraduate & Postgraduate Students');
  const [semHighlights, setSemHighlights] = useState('');
  const [semContact, setSemContact] = useState(user?.phone || '+91 98200 11223');
  const [semTargetAudience, setSemTargetAudience] = useState('Everyone');
  const [semAttendanceEnabled, setSemAttendanceEnabled] = useState(true); // default true for seminars
  const [semFlyerData, setSemFlyerData] = useState(null);

  // Modals & Popups
  const [flyerModalData, setFlyerModalData] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [messageModalData, setMessageModalData] = useState(null);
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Attendance Session States
  const [selectedAttendanceEvent, setSelectedAttendanceEvent] = useState(null);
  const [activeAttendanceCode, setActiveAttendanceCode] = useState('');
  const [attendanceCountdown, setAttendanceCountdown] = useState(0);
  const [attendanceRequestsList, setAttendanceRequestsList] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [attendanceActionError, setAttendanceActionError] = useState('');

  // Editing Submission State
  const [editingItem, setEditingItem] = useState(null);

  // Attendance countdown timer
  useEffect(() => {
    let interval = null;
    if (attendanceCountdown > 0) {
      interval = setInterval(() => {
        setAttendanceCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [attendanceCountdown]);

  // Poll attendance requests when active session
  useEffect(() => {
    let poller = null;
    if (selectedAttendanceEvent && activeAttendanceCode) {
      const poll = async () => {
        const result = await fetchAttendanceRequests(selectedAttendanceEvent.id);
        if (result.success) {
          setAttendanceRequestsList(result.requests);
          setAttendanceActionError('');
        } else {
          setAttendanceActionError(result.message);
        }
      };
      poll();
      poller = setInterval(poll, 3000);
    }
    return () => {
      if (poller) clearInterval(poller);
    };
  }, [selectedAttendanceEvent, activeAttendanceCode, fetchAttendanceRequests]);

  // Separate Events and Seminars
  const eventsList = events.filter((e) => !e.type || e.type === 'event');
  const seminarsList = events.filter((e) => e.type === 'seminar');
  const canManageAttendanceEvent = (item) =>
    user?.role === 'admin' ||
    item.creatorEmail?.toLowerCase() === user?.email?.toLowerCase();

  // Faculty submissions (all items authored by this teacher)
  const mySubmissions = events.filter((e) =>
    e.creatorEmail?.toLowerCase() === user?.email?.toLowerCase() ||
    e.createdBy === user?.name
  );

  // Principal messages & Student messages segregation
  const principalMessages = messages.filter(
    (m) => m.type === 'principal_faculty' && (m.recipientEmail === user?.email || m.senderEmail === user?.email)
  );

  const studentMessages = messages.filter(
    (m) => m.type === 'student_faculty' && (m.recipientEmail === user?.email || m.senderEmail === user?.email)
  );

  // Handle Event Submit
  const handleEventFormSubmit = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    if (eventDateMode === 'multiple' && eventAdditionalDates.length === 0) {
      setFormSuccessMessage('Add at least one additional date for a multiple-date event.');
      return;
    }

    const payload = {
      type: 'event',
      title: eventTitle,
      subHeadline: eventSubHeadline,
      category: eventCategory,
      department: eventDepartment,
      dateMode: eventDateMode,
      date: eventDate,
      endDate: eventDateMode === 'range' ? eventEndDate : null,
      multipleDates: eventDateMode === 'multiple'
        ? JSON.stringify([eventDate, ...eventAdditionalDates].filter((date, index, dates) => date && dates.indexOf(date) === index))
        : null,
      time: eventTime,
      venue: eventVenue,
      highlights: JSON.stringify([eventHighlight1, eventHighlight2, eventHighlight3].filter(Boolean)),
      prizes: eventPrizes,
      description: eventDescription || `${eventTitle} organized by ${eventDepartment}`,
      registrationEnabled: eventRegEnabled,
      ticketPrice: eventRegEnabled ? eventTicketPrice : null,
      eligibility: eventRegEnabled ? eventEligibility : null,
      registrationDeadline: eventRegEnabled ? eventRegDeadline : null,
      externalRegistrationUrl: eventRegEnabled ? eventRegUrl : null,
      targetAudience: eventTargetAudience,
      contact: eventContact,
      socialHandle: eventSocialHandle,
      attendanceEnabled: eventAttendanceEnabled,
      flyerData: eventFlyerData?.flyerData || null,
      selectedFlyerImage: eventFlyerData?.selectedFlyerImage || null,
      flyerVersions: eventFlyerData?.flyerVersions || null
    };

    if (editingItem) {
      const result = await updateEventOrSeminar(editingItem.id, payload, true);
      if (!result.success) {
        setFormSuccessMessage(result.message || 'Unable to update the event.');
        return;
      }
      setEditingItem(null);
      setFormSuccessMessage('Event updated and resubmitted to Principal for review!');
    } else {
      const result = await createEventOrSeminar(payload);
      if (!result.success) {
        setFormSuccessMessage(result.message || 'Unable to submit the event.');
        return;
      }
      setFormSuccessMessage('Event submitted to Principal for review!');
    }

    // Reset Form
    setEventTitle('');
    setEventSubHeadline('');
    setEventDescription('');
    setEventPrizes('');
    setEventHighlight1('');
    setEventHighlight2('');
    setEventHighlight3('');
    setEventFlyerData(null);
    setEventAdditionalDates([]);
    setAdditionalEventDate('');
    setEventDateMode('single');
    setEventEndDate('');
    setTimeout(() => {
      setFormSuccessMessage('');
      setActiveTab('submissions');
    }, 1500);
  };

  // Handle Seminar Submit
  const handleSeminarFormSubmit = async (e) => {
    e.preventDefault();
    if (!semTitle.trim()) return;

    const payload = {
      type: 'seminar',
      programmeType: semProgrammeType,
      title: semTitle,
      subHeadline: semTagline,
      category: 'Academic',
      department: semDepartment,
      description: semAbout || `${semProgrammeType} on ${semTitle}`,
      date: semDate,
      time: semTime,
      venue: semVenue,
      resourcePerson: semResourcePerson,
      forWhom: semForWhom,
      highlights: JSON.stringify(semHighlights ? semHighlights.split(',').map((s) => s.trim()) : []),
      targetAudience: semTargetAudience,
      contact: semContact,
      attendanceEnabled: semAttendanceEnabled,
      registrationEnabled: false,
      flyerData: semFlyerData?.flyerData || null,
      selectedFlyerImage: semFlyerData?.selectedFlyerImage || null,
      flyerVersions: semFlyerData?.flyerVersions || null
    };

    if (editingItem) {
      const result = await updateEventOrSeminar(editingItem.id, payload, true);
      if (!result.success) {
        setFormSuccessMessage(result.message || 'Unable to update the seminar.');
        return;
      }
      setEditingItem(null);
      setFormSuccessMessage('Seminar updated and resubmitted to Principal for review!');
    } else {
      const result = await createEventOrSeminar(payload);
      if (!result.success) {
        setFormSuccessMessage(result.message || 'Unable to submit the seminar.');
        return;
      }
      setFormSuccessMessage('Seminar submitted to Principal for review!');
    }

    setSemTitle('');
    setSemTagline('');
    setSemAbout('');
    setSemResourcePerson('');
    setSemFlyerData(null);
    setTimeout(() => {
      setFormSuccessMessage('');
      setActiveTab('submissions');
    }, 1500);
  };

  // Start Attendance
  const handleStartAttendanceSession = async (item) => {
    setAttendanceActionError('');
    setSelectedAttendanceEvent(item);
    setActiveAttendanceCode('');
    setAttendanceCountdown(0);
    setAttendanceRequestsList([]);
    setLoadingRequests(true);
    const res = await startAttendance(item.id);
    if (res.success && res.session) {
      setActiveAttendanceCode(res.session.code);
      setAttendanceCountdown(res.expiresInSeconds || 20);
      const result = await fetchAttendanceRequests(item.id);
      if (result.success) {
        setAttendanceRequestsList(result.requests);
      } else {
        setAttendanceActionError(result.message);
      }
    } else {
      setAttendanceActionError(res.message || 'Unable to start the attendance session.');
    }
    setLoadingRequests(false);
  };

  // End Attendance
  const handleEndAttendanceSession = async () => {
    if (selectedAttendanceEvent) {
      setAttendanceActionError('');
      const result = await endAttendance(selectedAttendanceEvent.id);
      if (result.success) {
        setActiveAttendanceCode('');
        setAttendanceCountdown(0);
      } else {
        setAttendanceActionError(result.message || 'Unable to end the attendance session.');
      }
    }
  };

  // Approve single request or All
  const handleApproveAttendanceAction = async (requestId = null, approveAll = false) => {
    if (!selectedAttendanceEvent) return;
    setAttendanceActionError('');
    const result = await approveAttendance({
      requestId,
      eventId: selectedAttendanceEvent.id,
      status: 'Present',
      approveAll
    });
    if (!result.success) {
      setAttendanceActionError(result.message || 'Unable to update attendance requests.');
      return;
    }
    const refreshed = await fetchAttendanceRequests(selectedAttendanceEvent.id);
    if (refreshed.success) {
      setAttendanceRequestsList(refreshed.requests);
    } else {
      setAttendanceActionError(refreshed.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-16">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Faculty Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-red-800 via-rose-800 to-amber-700 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider">
                VERIFIED FACULTY PORTAL
              </span>
              <span className="bg-white/20 text-white font-bold text-xs px-2.5 py-0.5 rounded-full border border-white/20">
                {user?.department || 'Department of Computer Science'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Faculty Command Center
            </h1>
            <p className="text-xs sm:text-sm text-red-100 font-medium max-w-xl leading-relaxed">
              Plan and publish college events & academic seminars, generate AI flyers, conduct live attendance sessions with 4-digit verification, and download Word summary reports.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setEditingItem(null); setActiveTab('create-event'); }}
              className="bg-white hover:bg-amber-50 text-red-700 font-black py-3 px-5 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center gap-2 border-2 border-amber-300 text-xs shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-red-600" />
              Create Event
            </button>
            <button
              onClick={() => { setEditingItem(null); setActiveTab('create-seminar'); }}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 px-5 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center gap-2 text-xs shrink-0"
            >
              <GraduationCap className="w-4 h-4 text-slate-950" />
              Create Seminar
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200 text-xs font-bold scrollbar-none">
          {[
            { id: 'events', label: 'College Events', icon: Calendar, badge: eventsList.length },
            { id: 'seminars', label: 'Seminars & Workshops', icon: BookOpen, badge: seminarsList.length },
            { id: 'create-event', label: 'Create Event', icon: PlusCircle },
            { id: 'create-seminar', label: 'Create Seminar', icon: GraduationCap },
            { id: 'submissions', label: 'My Submissions', icon: Layers, badge: mySubmissions.length },
            { id: 'volunteers', label: 'Volunteer Desk', icon: Users, badge: volunteers.filter((application) => application.status === 'Pending').length },
            { id: 'attendance', label: 'Attendance Management', icon: KeyRound },
            { id: 'reports', label: 'Summary Reports', icon: FileText },
            { id: 'feedback', label: 'Event Feedback', icon: MessageSquare, badge: feedbacks.length },
            { id: 'principal-messages', label: 'Messages from Principal', icon: MessageSquare, badge: principalMessages.filter(m => !m.isRead).length },
            { id: 'student-messages', label: 'Student Messages', icon: Users, badge: studentMessages.filter(m => !m.isRead).length }
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

        {activeTab === 'volunteers' && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">Volunteer Desk</h2>
              <p className="text-xs text-gray-500 font-medium">Applications for events you manage</p>
            </div>
            {volunteers.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 text-xs text-gray-500">
                No volunteer applications are available for your events.
              </div>
            ) : (
              <div className="space-y-3">
                {volunteers.map((application) => {
                  const event = events.find((item) => item.id === application.eventId);
                  return (
                    <article key={application.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-sm font-extrabold text-gray-900">{application.userName} - {application.roleApplied}</h3>
                        <p className="text-xs text-gray-600">{event?.title || `Event #${application.eventId}`}</p>
                        {application.reason && <p className="text-xs text-gray-500">Reason: {application.reason}</p>}
                        {application.skills && <p className="text-xs text-gray-500">Skills: {application.skills}</p>}
                        <p className="text-[11px] font-bold text-amber-800">Status: {application.status || 'Pending'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={application.status === 'Approved'}
                          onClick={() => updateVolunteerStatus(application.id, 'Approved')}
                          className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={application.status === 'Rejected'}
                          onClick={() => updateVolunteerStatus(application.id, 'Rejected')}
                          className="px-3 py-2 text-xs font-bold rounded-lg bg-red-50 text-red-700 border border-red-200 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {activeTab === 'feedback' && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Feedback for Your Events</h2>
                  <p className="text-xs text-gray-500 font-medium">Student comments and ratings for events you manage.</p>
                </div>
                {feedbacks.length === 0 ? (
                  <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-xs text-gray-500">
                    No feedback is available for your events yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {feedbacks.map((feedback) => {
                      const event = events.find((item) => item.id === feedback.eventId);
                      return (
                        <article key={feedback.id} className="rounded-2xl border border-gray-200 bg-white p-4 space-y-1">
                          <h3 className="text-sm font-extrabold text-gray-900">{event?.title || feedback.eventTitle}</h3>
                          <p className="text-xs font-bold text-amber-700">Rating: {feedback.rating} / 5</p>
                          <p className="text-xs text-gray-700">{feedback.comment}</p>
                          <p className="text-[11px] text-gray-400">By {feedback.userName} • {new Date(feedback.createdAt).toLocaleDateString()}</p>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </section>
        )}

        {/* ================= TAB 1: ALL COLLEGE EVENTS ================= */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900">College Events</h2>
                <p className="text-xs text-gray-500 font-medium">All approved events published across departments</p>
              </div>
              <button
                onClick={() => setActiveTab('create-event')}
                className="bg-red-600 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Event
              </button>
            </div>

            {eventsList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3 shadow-xs">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-700">No events available yet.</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  No college events have been published yet. Click "Create Event" to propose a new event for Principal approval.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventsList.map((e) => (
                  <div key={e.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-md border border-red-200">
                          {e.category || 'Event'}
                        </span>
                        <span className="text-gray-400 font-medium text-[11px]">{e.targetAudience}</span>
                      </div>
                      <h3 className="font-extrabold text-base text-gray-900 leading-snug">{e.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{e.description}</p>
                    </div>

                    <div className="border-t border-gray-100 pt-3 text-xs space-y-1.5 text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-red-600" /> {getEventDateLabel(e)} • {e.time}</div>
                      <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-amber-500" /> {e.department}</div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => setFlyerModalData(e)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        {e.creatorEmail?.toLowerCase() === user?.email?.toLowerCase() ? 'Edit Flyer' : 'View Flyer'}
                      </button>
                      {e.attendanceEnabled && canManageAttendanceEvent(e) && (
                        <button
                          onClick={() => { setSelectedAttendanceEvent(e); setActiveTab('attendance'); }}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                          Attendance
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: SEMINARS & WORKSHOPS ================= */}
        {activeTab === 'seminars' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900">Academic Seminars & Workshops</h2>
                <p className="text-xs text-gray-500 font-medium">Research talks, masterclasses, and awareness programmes</p>
              </div>
              <button
                onClick={() => setActiveTab('create-seminar')}
                className="bg-amber-500 text-slate-950 font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Seminar
              </button>
            </div>

            {seminarsList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3 shadow-xs">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-700">No seminars available yet.</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  No academic seminars or workshops have been created yet. Submit one using the "Create Seminar" form.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seminarsList.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md border border-amber-300">
                          {s.programmeType || 'Seminar'}
                        </span>
                        <span className="text-gray-400 font-medium text-[11px]">{s.targetAudience}</span>
                      </div>
                      <h3 className="font-extrabold text-base text-gray-900 leading-snug">{s.title}</h3>
                      {s.resourcePerson && (
                        <p className="text-xs font-semibold text-red-700">Speaker: {s.resourcePerson}</p>
                      )}
                      <p className="text-xs text-gray-500 line-clamp-2">{s.description}</p>
                    </div>

                    <div className="border-t border-gray-100 pt-3 text-xs space-y-1.5 text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-red-600" /> {getEventDateLabel(s)} • {s.time}</div>
                      <div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-amber-600" /> {s.department}</div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => setFlyerModalData(s)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        {s.creatorEmail?.toLowerCase() === user?.email?.toLowerCase() ? 'Edit Flyer' : 'View Flyer'}
                      </button>
                      <button
                        onClick={() => { setSelectedAttendanceEvent(s); setActiveTab('attendance'); }}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                        Attendance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: CREATE EVENT FORM ================= */}
        {activeTab === 'create-event' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-black text-gray-900">
                {editingItem ? 'Edit & Resubmit Event' : 'Create New College Event'}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Submissions will be sent to Principal Dr. R. K. Sharma for review and approval before being published to students.
              </p>
            </div>

            {formSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{formSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleEventFormSubmit} className="space-y-6">
              {/* A. Event Information */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">A. Event Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Catchy Event / Fest Name *</label>
                    <input
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="e.g. TechVista 2026: National Hackathon"
                      className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl focus:border-red-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Theme Tagline / Sub-Headline *</label>
                    <input
                      type="text"
                      required
                      value={eventSubHeadline}
                      onChange={(e) => setEventSubHeadline(e.target.value)}
                      placeholder="e.g. Build, Innovate & Win Big at RKT College!"
                      className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl focus:border-red-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* B. When & Where */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">B. When & Where</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Date Selection Mode</label>
                    <select
                      value={eventDateMode}
                      onChange={(e) => setEventDateMode(e.target.value)}
                      className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl focus:border-red-600 focus:outline-hidden bg-white"
                    >
                      <option value="single">Single Date</option>
                      <option value="range">Date Range</option>
                      <option value="multiple">Multiple Individual Dates</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Event Date / Start Date *</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => {
                        setEventDate(e.target.value);
                        if (eventDateMode === 'multiple') {
                          setEventAdditionalDates((dates) => dates.filter((date) => date >= e.target.value));
                        }
                      }}
                      className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl focus:border-red-600 focus:outline-hidden"
                    />
                  </div>
                  {eventDateMode === 'range' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">End Date *</label>
                      <input
                        type="date"
                        required
                        value={eventEndDate}
                        min={eventDate || undefined}
                        onChange={(e) => setEventEndDate(e.target.value)}
                        className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl focus:border-red-600 focus:outline-hidden"
                      />
                    </div>
                  )}
                  {eventDateMode === 'multiple' && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Additional Event Dates</label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={additionalEventDate}
                          min={eventDate || undefined}
                          onChange={(e) => setAdditionalEventDate(e.target.value)}
                          className="min-w-0 flex-1 text-xs font-medium p-3 border border-gray-300 rounded-xl focus:border-red-600 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          disabled={!additionalEventDate || additionalEventDate === eventDate || eventAdditionalDates.includes(additionalEventDate)}
                          onClick={() => {
                            setEventAdditionalDates((dates) => [...dates, additionalEventDate].sort());
                            setAdditionalEventDate('');
                          }}
                          className="px-3 text-xs font-bold text-red-700 border border-red-200 rounded-xl disabled:opacity-50"
                        >
                          Add date
                        </button>
                      </div>
                      {eventAdditionalDates.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {eventAdditionalDates.map((date) => (
                            <button
                              type="button"
                              key={date}
                              onClick={() => setEventAdditionalDates((dates) => dates.filter((item) => item !== date))}
                              className="text-[11px] font-semibold text-gray-700 bg-gray-100 rounded-lg px-2 py-1"
                              aria-label={`Remove event date ${date}`}
                            >
                              {date} ×
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Time Schedule *</label>
                    <input
                      type="text"
                      required
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      placeholder="e.g. 09:30 AM - 04:30 PM"
                      className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl focus:border-red-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Venue / Location *</label>
                    <input
                      type="text"
                      required
                      value={eventVenue}
                      onChange={(e) => setEventVenue(e.target.value)}
                      placeholder="e.g. Main Auditorium & CS Labs"
                      className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl focus:border-red-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* C. Event Highlights */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">C. Event Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Highlight 1: Main Attraction</label>
                    <input
                      type="text"
                      value={eventHighlight1}
                      onChange={(e) => setEventHighlight1(e.target.value)}
                      placeholder="e.g. 24-Hour Live Coding Battle"
                      className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Highlight 2: Performance / Activity</label>
                    <input
                      type="text"
                      value={eventHighlight2}
                      onChange={(e) => setEventHighlight2(e.target.value)}
                      placeholder="e.g. AI Prompt Challenge"
                      className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Highlight 3: Side Attraction</label>
                    <input
                      type="text"
                      value={eventHighlight3}
                      onChange={(e) => setEventHighlight3(e.target.value)}
                      placeholder="e.g. Industry Mentors & Swag Bags"
                      className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* D. What You Can Win (Optional) */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">D. What You Can Win (Optional)</h3>
                <input
                  type="text"
                  value={eventPrizes}
                  onChange={(e) => setEventPrizes(e.target.value)}
                  placeholder="e.g. ₹25,000 Cash Pool, Winner Trophies & Participation Certificates"
                  className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl"
                />
              </div>

              {/* E. Entry & Registration Toggle */}
              <div className="space-y-3 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">E. Entry & Registration System</h3>
                    <p className="text-[11px] text-gray-500 font-medium">When turned ON, registration fields and capacity checks are activated.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventRegEnabled}
                      onChange={(e) => setEventRegEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                {eventRegEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Ticket Price / Entry Fee</label>
                      <input
                        type="text"
                        value={eventTicketPrice}
                        onChange={(e) => setEventTicketPrice(e.target.value)}
                        placeholder="Free or ₹50"
                        className="w-full text-xs font-medium p-2.5 border border-gray-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Eligibility Criteria</label>
                      <input
                        type="text"
                        value={eventEligibility}
                        onChange={(e) => setEventEligibility(e.target.value)}
                        placeholder="e.g. All CS/IT Students"
                        className="w-full text-xs font-medium p-2.5 border border-gray-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Registration Deadline</label>
                      <input
                        type="date"
                        value={eventRegDeadline}
                        onChange={(e) => setEventRegDeadline(e.target.value)}
                        className="w-full text-xs font-medium p-2.5 border border-gray-300 rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Optional External Registration URL</label>
                      <input
                        type="url"
                        value={eventRegUrl}
                        onChange={(e) => setEventRegUrl(e.target.value)}
                        placeholder="https://forms.gle/... (Generates real QR code automatically)"
                        className="w-full text-xs font-medium p-2.5 border border-gray-300 rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* F. Target Audience & Attendance Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Audience *</label>
                  <select
                    value={eventTargetAudience}
                    onChange={(e) => setEventTargetAudience(e.target.value)}
                    className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl bg-white focus:border-red-600 focus:outline-hidden"
                  >
                    {AUDIENCE_OPTIONS.map((aud) => (
                      <option key={aud} value={aud}>{aud}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Organizing Department *</label>
                  <select
                    value={eventDepartment}
                    onChange={(e) => setEventDepartment(e.target.value)}
                    className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl bg-white focus:border-red-600 focus:outline-hidden"
                  >
                    {TEACHER_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col justify-center bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-950 block">Attendance Tracking</span>
                      <span className="text-[10px] text-amber-800">Enables 4-digit OTP session</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={eventAttendanceEnabled}
                      onChange={(e) => setEventAttendanceEnabled(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Flyer Creator Action */}
              <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-red-950">AI Event Poster & Flyer Artwork</h4>
                  <p className="text-[11px] text-red-800">
                    {eventFlyerData ? 'Flyer customized and attached!' : 'Generate a high-res themed poster using Gemini AI.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFlyerModalData({
                    type: 'event',
                    title: eventTitle || 'Campus Event',
                    subHeadline: eventSubHeadline,
                    department: eventDepartment,
                    category: eventCategory,
                    date: getEventDateLabel({
                      date: eventDate || '2026-09-15',
                      dateMode: eventDateMode,
                      endDate: eventEndDate,
                      multipleDates: JSON.stringify([eventDate, ...eventAdditionalDates])
                    }),
                    time: eventTime,
                    venue: eventVenue,
                    prizes: eventPrizes,
                    targetAudience: eventTargetAudience,
                    registrationEnabled: eventRegEnabled,
                    externalRegistrationUrl: eventRegUrl
                  })}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {eventFlyerData ? 'Edit Flyer' : 'Generate AI Flyer'}
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('events')}
                  className="px-5 py-3 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-black text-xs py-3 px-8 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {editingItem ? 'Update & Resubmit' : 'Submit Event for Principal Review'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 4: CREATE SEMINAR / WORKSHOP FORM ================= */}
        {activeTab === 'create-seminar' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-black text-gray-900">
                {editingItem ? 'Edit & Resubmit Seminar' : 'Create Academic Seminar / Workshop'}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Submit academic workshops, guest lectures, and research awareness programmes for institutional review.
              </p>
            </div>

            {formSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{formSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSeminarFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Programme Type *</label>
                  <select
                    value={semProgrammeType}
                    onChange={(e) => setSemProgrammeType(e.target.value)}
                    className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl bg-white"
                  >
                    {PROGRAMME_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Seminar Title / Main Topic *</label>
                  <input
                    type="text"
                    required
                    value={semTitle}
                    onChange={(e) => setSemTitle(e.target.value)}
                    placeholder="e.g. National Seminar on AI & Quantum Computing in 2026"
                    className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Theme / Academic Tagline *</label>
                  <input
                    type="text"
                    required
                    value={semTagline}
                    onChange={(e) => setSemTagline(e.target.value)}
                    placeholder="e.g. Advancing Scientific Inquiry & Industry Synergy"
                    className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Resource Person / Guest Speaker *</label>
                  <input
                    type="text"
                    required
                    value={semResourcePerson}
                    onChange={(e) => setSemResourcePerson(e.target.value)}
                    placeholder="e.g. Dr. S. K. Kulkarni (Chief Scientist, BARC / TIFR)"
                    className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={semDate}
                    onChange={(e) => setSemDate(e.target.value)}
                    className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Time Schedule *</label>
                  <input
                    type="text"
                    required
                    value={semTime}
                    onChange={(e) => setSemTime(e.target.value)}
                    placeholder="11:00 AM - 02:00 PM"
                    className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    value={semVenue}
                    onChange={(e) => setSemVenue(e.target.value)}
                    placeholder="AV Seminar Hall 201"
                    className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Organizing Department *</label>
                  <select
                    value={semDepartment}
                    onChange={(e) => setSemDepartment(e.target.value)}
                    className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl bg-white"
                  >
                    {TEACHER_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Class / Stream *</label>
                  <select
                    value={semTargetAudience}
                    onChange={(e) => setSemTargetAudience(e.target.value)}
                    className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl bg-white"
                  >
                    {AUDIENCE_OPTIONS.map((aud) => (
                      <option key={aud} value={aud}>{aud}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">For Whom</label>
                  <input
                    type="text"
                    value={semForWhom}
                    onChange={(e) => setSemForWhom(e.target.value)}
                    placeholder="All Science & IT Scholars"
                    className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Key Highlights (Comma separated)</label>
                <input
                  type="text"
                  value={semHighlights}
                  onChange={(e) => setSemHighlights(e.target.value)}
                  placeholder="Keynote Speech, Research Paper Reviews, Q&A Session, Institutional Certificates"
                  className="w-full text-xs font-medium p-3 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Attendance Tracking</span>
                  <span className="text-[11px] text-gray-500">Requires students to enter 4-digit code at the venue (Active by default for seminars).</span>
                </div>
                <input
                  type="checkbox"
                  checked={semAttendanceEnabled}
                  onChange={(e) => setSemAttendanceEnabled(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
              </div>

              {/* Seminar Flyer Generator */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-amber-950">AI Seminar Poster & Flyer</h4>
                  <p className="text-[11px] text-amber-800">
                    {semFlyerData ? 'Seminar flyer ready!' : 'Generate distinguished academic poster with guest speaker spotlight.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFlyerModalData({
                    type: 'seminar',
                    title: semTitle || 'Academic Seminar',
                    subHeadline: semTagline,
                    programmeType: semProgrammeType,
                    department: semDepartment,
                    category: 'Academic',
                    date: semDate || '2026-09-18',
                    time: semTime,
                    venue: semVenue,
                    resourcePerson: semResourcePerson,
                    targetAudience: semTargetAudience
                  })}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {semFlyerData ? 'Edit Flyer' : 'Generate Seminar Flyer'}
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('seminars')}
                  className="px-5 py-3 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 px-8 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {editingItem ? 'Update & Resubmit' : 'Submit Seminar for Principal Review'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 5: MY SUBMISSIONS (APPROVAL WORKFLOW) ================= */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900">My Submissions & Approval Status</h2>
                <p className="text-xs text-gray-500 font-medium">Track submissions reviewed by Principal Dr. R. K. Sharma</p>
              </div>
            </div>

            {mySubmissions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3 shadow-xs">
                <Layers className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-700">No submissions yet.</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Use "Create Event" or "Create Seminar" to propose activities to the Principal.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {mySubmissions.map((sub) => {
                  const status = sub.status || 'pending_approval';
                  let statusBadge = (
                    <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-3 py-1 rounded-full border border-amber-300">
                      PENDING PRINCIPAL APPROVAL
                    </span>
                  );
                  if (status === 'approved') {
                    statusBadge = (
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-3 py-1 rounded-full border border-emerald-300">
                        APPROVED & PUBLISHED
                      </span>
                    );
                  } else if (status === 'changes_requested') {
                    statusBadge = (
                      <span className="bg-orange-100 text-orange-900 text-[11px] font-black px-3 py-1 rounded-full border border-orange-300">
                        CHANGES REQUESTED
                      </span>
                    );
                  } else if (status === 'rejected') {
                    statusBadge = (
                      <span className="bg-red-100 text-red-800 text-[11px] font-black px-3 py-1 rounded-full border border-red-300">
                        SUBMISSION REJECTED
                      </span>
                    );
                  }

                  return (
                    <div key={sub.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {sub.type === 'seminar' ? 'SEMINAR' : 'EVENT'}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs font-semibold text-gray-600">{sub.department}</span>
                          </div>
                          <h3 className="font-extrabold text-base text-gray-900">{sub.title}</h3>
                          <p className="text-xs text-gray-500 font-medium">
                            Scheduled on <strong>{getEventDateLabel(sub)}</strong> at <strong>{sub.venue}</strong> • Audience: <strong>{sub.targetAudience}</strong>
                          </p>
                        </div>
                        <div className="shrink-0">{statusBadge}</div>
                      </div>

                      {/* Principal feedback message if changes requested */}
                      {status === 'changes_requested' && sub.principalMessage && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-900 space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-orange-950">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            Principal Note:
                          </div>
                          <p className="pl-5 leading-relaxed font-medium">"{sub.principalMessage}"</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setFlyerModalData(sub)}
                            className="text-red-700 hover:text-red-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Edit Flyer
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {status === 'changes_requested' && (
                            <button
                              onClick={() => {
                                setEditingItem(sub);
                                if (sub.type === 'seminar') {
                                  setSemTitle(sub.title);
                                  setSemTagline(sub.subHeadline || '');
                                  setSemDate(sub.date);
                                  setSemTime(sub.time);
                                  setSemVenue(sub.venue);
                                  setSemResourcePerson(sub.resourcePerson || '');
                                  setActiveTab('create-seminar');
                                } else {
                                  setEventTitle(sub.title);
                                  setEventSubHeadline(sub.subHeadline || '');
                                  setEventDate(sub.date);
                                  setEventDateMode(sub.dateMode || 'single');
                                  setEventEndDate(sub.endDate || '');
                                  setEventAdditionalDates(parseEventDates(sub.multipleDates).filter((date) => date !== sub.date));
                                  setEventTime(sub.time);
                                  setEventVenue(sub.venue);
                                  setActiveTab('create-event');
                                }
                              }}
                              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Edit & Resubmit
                            </button>
                          )}

                          <button
                            onClick={() => deleteEvent(sub.id)}
                            className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Delete Submission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 6: ATTENDANCE MANAGEMENT (4-DIGIT OTP SYSTEM) ================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-gray-900">Live Attendance Management</h2>
              <p className="text-xs text-gray-500 font-medium">
                Faculty-controlled short-lived 4-digit codes (15–20s expiry) with manual or bulk acceptance
              </p>
            </div>

            {/* Event Selector for Attendance */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Select Active Event / Seminar for Attendance:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {events.filter(e => e.attendanceEnabled && canManageAttendanceEvent(e)).map((item) => {
                  const isSelected = selectedAttendanceEvent?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (selectedAttendanceEvent?.id !== item.id) {
                          setActiveAttendanceCode('');
                          setAttendanceCountdown(0);
                          setAttendanceRequestsList([]);
                          setAttendanceActionError('');
                        }
                        setSelectedAttendanceEvent(item);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-red-600 bg-red-50/50 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/60'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase text-red-600">{item.type || 'Event'}</span>
                        <h4 className="font-extrabold text-sm text-gray-900">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{getEventDateLabel(item)} • {item.venue}</p>
                      </div>
                      <div className="mt-3 text-right">
                        <span className="text-[11px] font-bold text-gray-600">
                          Audience: {item.targetAudience}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attendance Session Controls */}
            {selectedAttendanceEvent ? (
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">
                      Selected Session:
                    </span>
                    <h3 className="text-lg font-black text-gray-900">{selectedAttendanceEvent.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartAttendanceSession(selectedAttendanceEvent)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {activeAttendanceCode ? 'Regenerate 4-Digit Code' : 'Start Attendance Session'}
                    </button>

                    {activeAttendanceCode && (
                      <button
                        onClick={handleEndAttendanceSession}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                      >
                        End Session
                      </button>
                    )}
                  </div>
                </div>

                {attendanceActionError && (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800">
                    {attendanceActionError}
                  </p>
                )}

                {/* ACTIVE CODE DISPLAY */}
                {activeAttendanceCode ? (
                  <div className="bg-gradient-to-r from-slate-900 to-red-950 rounded-2xl p-6 text-white text-center space-y-3 shadow-md">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                      Announce this code verbally to physical attendees
                    </span>
                    <div className="text-5xl sm:text-6xl font-mono font-black tracking-widest text-amber-400 drop-shadow-sm">
                      {activeAttendanceCode}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-300">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Code validity expires in: <strong className="text-white text-sm">{attendanceCountdown}s</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center gap-3 font-medium">
                    <KeyRound className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Click <strong>"Start Attendance Session"</strong> to generate a temporary server-validated 4-digit code.</span>
                  </div>
                )}

                {/* Attendance Requests Approval Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-gray-900">Attendance Requests Received</h4>
                      <p className="text-xs text-gray-500 font-medium">Students who submitted the valid 4-digit code</p>
                    </div>

                    {attendanceRequestsList.some(r => r.status === 'Pending') && (
                      <button
                        onClick={() => handleApproveAttendanceAction(null, true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept All / Mark Present All
                      </button>
                    )}
                  </div>

                  {attendanceRequestsList.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                      No attendance requests received yet for this session.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-gray-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold">
                          <tr>
                            <th className="p-3">Student Name</th>
                            <th className="p-3">Roll No</th>
                            <th className="p-3">Class</th>
                            <th className="p-3">Time</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {attendanceRequestsList.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50/80">
                              <td className="p-3 font-bold text-gray-900">{req.userName}</td>
                              <td className="p-3 text-gray-600 font-mono">{req.rollNo || 'N/A'}</td>
                              <td className="p-3 font-semibold text-red-600">{req.studentClass || 'N/A'}</td>
                              <td className="p-3 text-gray-500">
                                {req.submittedAt ? new Date(req.submittedAt).toLocaleTimeString() : 'Just now'}
                              </td>
                              <td className="p-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  req.status === 'Present'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : req.status === 'Rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="p-3 text-right space-x-1.5">
                                {req.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveAttendanceAction(req.id)}
                                      className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleApproveAttendanceAction(req.id, false)}
                                      className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center text-xs text-gray-400 border border-gray-200">
                Please select an event or seminar from above to start live attendance.
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 7: SUMMARY REPORTS (WORD .DOCX) ================= */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">Event & Seminar Summary Reports</h2>
              <p className="text-xs text-gray-500 font-medium">
                Official Microsoft Word (.docx) document generator containing flyer, schedule, registrations, and confirmed attendance metrics.
              </p>
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

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-700 space-y-1">
                    <div className="flex justify-between"><span>Registrations:</span> <strong>{registrations.filter(r => r.eventId === ev.id).length}</strong></div>
                    <div className="flex justify-between"><span>Attendance Tracking:</span> <strong>{ev.attendanceEnabled ? 'Enabled' : 'Disabled'}</strong></div>
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

        {/* ================= TAB 8: MESSAGES FROM PRINCIPAL ================= */}
        {activeTab === 'principal-messages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900">Messages from Principal</h2>
                <p className="text-xs text-gray-500 font-medium">Two-way communication regarding approvals, instructions, and queries</p>
              </div>
              <button
                onClick={() => setMessageModalData({
                  recipientEmail: 'principal@rkt.edu.in',
                  recipientName: 'Dr. R. K. Sharma (Principal)',
                  type: 'principal_faculty'
                })}
                className="bg-red-600 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Message Principal
              </button>
            </div>

            {principalMessages.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-700">No messages yet.</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Direct communication from Principal Dr. R. K. Sharma will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {principalMessages.map((m) => (
                  <div key={m.id} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900">{m.senderName}</span>
                      <span className="text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                    {m.subject && <h4 className="text-sm font-bold text-red-700">{m.subject}</h4>}
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">{m.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 9: STUDENT MESSAGES ================= */}
        {activeTab === 'student-messages' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">Student Inquiries & Messages</h2>
              <p className="text-xs text-gray-500 font-medium">Inquiries regarding upcoming events and academic workshops</p>
            </div>

            {studentMessages.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
                <Users className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-700">No student messages yet.</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Queries sent by students for your departmental activities will show up here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentMessages.map((m) => (
                  <div key={m.id} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900">{m.senderName}</span>
                        <span className="text-gray-400 ml-2">({m.senderEmail})</span>
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

                    <div className="pt-2 text-right">
                      <button
                        onClick={() => setMessageModalData({
                          recipientEmail: m.senderEmail,
                          recipientName: m.senderName,
                          type: 'student_faculty',
                          eventTitle: m.eventTitle,
                          defaultSubject: `Re: ${m.subject}`
                        })}
                        className="text-red-700 font-bold text-xs hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Reply to Student
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FLYER CREATOR MODAL */}
      {flyerModalData && (
        <FlyerCreatorModal
          eventData={flyerModalData}
          onSaveFlyer={(savedFlyer) => {
            if (activeTab === 'create-event') setEventFlyerData(savedFlyer);
            if (activeTab === 'create-seminar') setSemFlyerData(savedFlyer);
          }}
          onClose={() => setFlyerModalData(null)}
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
          eventTitle={messageModalData.eventTitle}
          defaultSubject={messageModalData.defaultSubject}
        />
      )}

      <NotificationDrawer isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};

export default TeacherDashboard;
