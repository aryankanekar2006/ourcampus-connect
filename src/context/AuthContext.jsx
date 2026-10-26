import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(undefined);

const sanitizeClientUser = (user) => {
  if (!user || typeof user !== 'object') return null;
  const { password: _password, passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const apiFetch = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, credentials: 'same-origin' });
    if (response.status === 401 || response.status === 403) {
      try {
        const sessionResponse = await fetch('/api/auth/session', { credentials: 'same-origin' });
        if (sessionResponse.status === 401) {
          setUser(null);
        } else if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setUser(sessionData.success && sessionData.user ? sanitizeClientUser(sessionData.user) : null);
        }
      } catch {
        console.warn('Session refresh is unavailable.');
      }
    }
    return response;
  }, []);

  const [events, setEvents] = useState([]);

  const [registrations, setRegistrations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState('');

  const [feedbacks, setFeedbacks] = useState([]);

  const [messages, setMessages] = useState([]);
  const [facultyVerifications, setFacultyVerifications] = useState([]);
  const [facultyVerificationsLoaded, setFacultyVerificationsLoaded] = useState(false);
  const [facultyVerificationsError, setFacultyVerificationsError] = useState('');

  useEffect(() => {
    localStorage.removeItem('rkt_user');
    let active = true;
    apiFetch('/api/auth/session')
      .then(async (response) => {
        if (response.status === 401) return null;
        if (!response.ok) throw new Error('Session check failed.');
        const data = await response.json();
        return data.success && data.user ? sanitizeClientUser(data.user) : null;
      })
      .then((sessionUser) => {
        if (!active) return;
        setUser(sessionUser);
        setApiUnavailable(false);
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setApiUnavailable(true);
        }
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => { active = false; };
  }, [apiFetch]);

  // Sync events from backend API whenever user changes
  const fetchEvents = useCallback(async (signal) => {
    if (!user) {
      setEvents([]);
      return;
    }
    try {
      const query = new URLSearchParams();
      const resp = await apiFetch(`/api/db/events?${query.toString()}`, { signal });
      if (signal?.aborted) return;
      if (!resp.ok) {
        setEvents([]);
        console.warn('Event service returned an unsuccessful response.');
        return;
      }
      const data = await resp.json();
      setEvents(data.success && Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      if (!signal?.aborted) {
        console.warn('Backend events fetch note:', err);
        setEvents([]);
      }
    }
  }, [apiFetch, user]);

  // Sync messages from backend API
  const fetchMessages = useCallback(async (signal) => {
    if (!user) return;
    try {
      const resp = await apiFetch('/api/db/messages', { signal });
      if (signal?.aborted) return;
      if (resp.ok) {
        const data = await resp.json();
        if (!signal?.aborted && data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      if (!signal?.aborted) console.warn('Backend messages fetch note:', err);
    }
  }, [apiFetch, user]);

  // Sync faculty verification list for Principal
  const fetchFacultyVerifications = useCallback(async (signal) => {
    if (!user || user.role !== 'admin') {
      setFacultyVerifications([]);
      setFacultyVerificationsLoaded(false);
      setFacultyVerificationsError('');
      return;
    }
    setFacultyVerificationsLoaded(false);
    setFacultyVerificationsError('');
    try {
      const resp = await apiFetch('/api/db/faculty-verifications', { signal });
      if (signal?.aborted) return;
      if (!resp.ok) {
        setFacultyVerificationsError('Unable to load Faculty accounts. Please try again.');
        setFacultyVerificationsLoaded(true);
        return;
      }
      const data = await resp.json();
      if (data.success && Array.isArray(data.facultyMembers)) {
        setFacultyVerifications(data.facultyMembers);
        setFacultyVerificationsLoaded(true);
      } else {
        setFacultyVerificationsError(data.message || 'Unable to load Faculty accounts.');
        setFacultyVerificationsLoaded(true);
      }
    } catch (err) {
      if (!signal?.aborted) {
        console.warn('Faculty verification fetch note:', err);
        setFacultyVerificationsError('The Faculty directory is unavailable.');
        setFacultyVerificationsLoaded(true);
      }
    }
  }, [apiFetch, user]);

  const fetchFeedbacks = useCallback(async (signal) => {
    if (!user || !['teacher', 'admin'].includes(user.role)) {
      setFeedbacks([]);
      return;
    }
    try {
      const resp = await apiFetch('/api/db/feedbacks', { signal });
      if (signal?.aborted) return;
      if (!resp.ok) return;
      const data = await resp.json();
      if (!signal?.aborted && data.success && Array.isArray(data.feedbacks)) setFeedbacks(data.feedbacks);
    } catch {
      if (!signal?.aborted) console.warn('Feedback is unavailable.');
    }
  }, [apiFetch, user]);

  // Sync notifications from backend API
  const fetchNotifications = useCallback(async (signal) => {
    if (!user) {
      setNotifications([]);
      setNotificationError('');
      return;
    }
    try {
      const resp = await apiFetch('/api/db/notifications', { signal });
      if (signal?.aborted) return;
      if (!resp.ok) {
        setNotifications([]);
        setNotificationError('Unable to load notifications. Please try again.');
        return;
      }
      const data = await resp.json();
      if (signal?.aborted) return;
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setNotificationError('');
      } else {
        setNotifications([]);
        setNotificationError(data.message || 'Unable to load notifications.');
      }
    } catch {
      if (!signal?.aborted) {
        setNotifications([]);
        setNotificationError('The notification service is unavailable.');
      }
    }
  }, [apiFetch, user]);

  const fetchRegistrations = useCallback(async (signal) => {
    if (!user) return;
    try {
      const resp = await apiFetch('/api/db/registrations', { signal });
      if (!resp.ok) return;
      const data = await resp.json();
      if (!signal?.aborted && data.success && Array.isArray(data.registrations)) {
        setRegistrations(data.registrations);
      }
    } catch {
      if (!signal?.aborted) console.warn('Registrations are unavailable.');
    }
  }, [apiFetch, user]);

  const fetchVolunteers = useCallback(async (signal) => {
    if (!user) return;
    try {
      const resp = await apiFetch('/api/db/volunteers', { signal });
      if (!resp.ok) return;
      const data = await resp.json();
      if (!signal?.aborted && data.success && Array.isArray(data.volunteers)) {
        setVolunteers(data.volunteers);
      }
    } catch {
      if (!signal?.aborted) console.warn('Volunteer applications are unavailable.');
    }
  }, [apiFetch, user]);

  useEffect(() => {
    setEvents([]);
    setRegistrations([]);
    setVolunteers([]);
    setNotifications([]);
    setNotificationError('');
    setFeedbacks([]);
    setMessages([]);
    if (user?.role !== 'admin') {
      setFacultyVerifications([]);
      setFacultyVerificationsLoaded(false);
    }
    if (!user) {
      return;
    }
    const controller = new AbortController();
    fetchRegistrations(controller.signal);
    fetchVolunteers(controller.signal);
    fetchNotifications(controller.signal);
    return () => controller.abort();
  }, [user, fetchRegistrations, fetchVolunteers, fetchNotifications]);

  useEffect(() => {
    if (authLoading || !user) {
      setEvents([]);
      return;
    }
    const controller = new AbortController();
    const { signal } = controller;
    fetchEvents(signal);
    fetchMessages(signal);
    if (user.role === 'admin') {
      fetchFacultyVerifications(signal);
    } else {
      setFacultyVerifications([]);
      setFacultyVerificationsLoaded(false);
    }
    if (user.role === 'teacher' || user.role === 'admin') fetchFeedbacks(signal);
    return () => controller.abort();
  }, [authLoading, user, fetchEvents, fetchMessages, fetchFacultyVerifications, fetchFeedbacks]);

  // Login
  const login = async (role, identifier, password, extraData = {}) => {
    const cleanId = typeof identifier === 'string' ? identifier.trim().toLowerCase() : '';
    const rawPassword = typeof password === 'string' ? password : '';
    const cleanPass = rawPassword.trim();
    if (rawPassword.length > 1024 || cleanPass.length < 6) {
      return { success: false, message: 'Password must be 6 to 1024 characters long.' };
    }
    try {
      const resp = await apiFetch('/api/db/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          identifier: cleanId,
          password: cleanPass,
          studentClass: extraData.studentClass
        })
      });
      const data = await resp.json();
      if (resp.ok && data.success && data.user) {
        const safeUser = sanitizeClientUser(data.user);
        setRegistrations([]);
        setVolunteers([]);
        setNotifications([]);
        setUser(safeUser);
        setApiUnavailable(false);
        return { success: true, user: safeUser };
      }
      if (resp.status === 401) setUser(null);
      return { success: false, message: data.message || 'Invalid login details. Please try again.' };
    } catch (e) {
      setApiUnavailable(true);
      console.warn('Login service is unavailable.');
      return { success: false, message: 'Login service is unavailable. Please try again later.' };
    }
  };

  // Register
  const registerUser = async (newUser) => {
    try {
      const resp = await apiFetch('/api/db/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        return { success: false, message: data.message || 'Registration failed.' };
      }

      return { success: true, message: data.message, user: data.user };
    } catch (e) {
      console.warn('Registration service is unavailable.');
    }

    return { success: false, message: 'Registration service is unavailable. Please try again later.' };
  };

  const logout = () => {
    return apiFetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin'
    }).then((response) => {
      if (!response.ok) throw new Error('Logout request was not accepted.');
      setUser(null);
    }).catch(() => {
      console.warn('Logout service is unavailable; the signed-in state was retained.');
      return false;
    });
  };

  const updateProfile = async (data) => {
    try {
      const response = await apiFetch('/api/db/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok || !result.success || !result.user) {
        return { success: false, message: result.message || 'Unable to update the profile.' };
      }
      const safeUser = sanitizeClientUser(result.user);
      setUser(safeUser);
      return { success: true, user: safeUser, message: 'Profile updated successfully.' };
    } catch {
      return { success: false, message: 'The profile service is unavailable.' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user?.email || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return { success: false, message: 'Current account credentials are required.' };
    }
    try {
      const resp = await apiFetch('/api/db/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await resp.json();
      return { success: resp.ok && data.success, message: data.message || 'Unable to change the password.' };
    } catch (e) {
      console.warn('Password change service is unavailable.');
    }

    return { success: false, message: 'Unable to change the password. Please try again later.' };
  };

  // Principal verifies or revokes faculty access
  const updateFacultyVerification = async (facultyId, status) => {
    try {
      const resp = await apiFetch(`/api/db/faculty-verifications/${facultyId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await resp.json();
      if (data.success) {
        fetchFacultyVerifications();
        return { success: true };
      }
      return { success: false, message: data.message || 'Unable to update faculty verification.' };
    } catch (err) {
      console.warn('Faculty verification update error:', err);
      return { success: false, message: 'Faculty verification service is unavailable.' };
    }
  };

  // Event & Seminar Submissions (Submitted as 'pending_approval')
  const createEventOrSeminar = async (data) => {
    const payload = {
      ...data,
      creatorEmail: user?.email,
      creatorName: user?.name,
      createdBy: user?.name || user?.department,
      status: 'pending_approval'
    };

    try {
      const resp = await apiFetch('/api/db/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await resp.json();
      if (resData.success && resData.event) {
        setEvents((prev) => [resData.event, ...prev]);
        return { success: true, event: resData.event };
      }
      return { success: false, message: resData.message || 'Unable to create the event.' };
    } catch (err) {
      console.warn('Event create backend note:', err);
    }

    return { success: false, message: 'The event service is unavailable.' };
  };

  // Update Event or Seminar (re-submits for approval if modified)
  const updateEventOrSeminar = async (id, updates, reSubmit = false) => {
    try {
      const resp = await apiFetch(`/api/db/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, reSubmit })
      });
      const resData = await resp.json();
      if (resData.success && resData.event) {
        setEvents((prev) => prev.map((e) => (e.id === id ? resData.event : e)));
        return { success: true, event: resData.event };
      }
      return { success: false, message: resData.message || 'Unable to update the event.' };
    } catch (err) {
      console.warn('Event update backend note:', err);
    }

    return { success: false, message: 'The event service is unavailable.' };
  };

  // Principal Reviews Event/Seminar (Approve, Reject, Request Changes)
  const setEventStatus = async (id, status, message = '') => {
    try {
      const resp = await apiFetch(`/api/db/events/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, message })
      });
      const resData = await resp.json();
      if (resData.success && resData.event) {
        setEvents((prev) => prev.map((e) => (e.id === id ? resData.event : e)));
        fetchEvents();
        fetchMessages();
        return { success: true, event: resData.event };
      }
      return { success: false, message: resData.message || 'Unable to update the event status.' };
    } catch (err) {
      console.warn('Set event status error:', err);
    }

    return { success: false, message: 'The approval service is unavailable.' };
  };

  const deleteEvent = async (id) => {
    try {
      const response = await apiFetch(`/api/db/events/${id}`, { method: 'DELETE' });
      if (!response.ok) return;
    } catch (err) {
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Event Registration (Internal)
  const registerForEvent = async (eventId) => {
    if (!user) return { success: false, message: 'Please login first.' };

    try {
      const resp = await apiFetch('/api/db/register-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        return { success: false, message: data.message || 'Registration failed.' };
      }

      setRegistrations((prev) => [data.registration, ...prev]);
      fetchEvents();
      return { success: true, message: data.message };
    } catch (err) {
      console.warn('Event registration fallback note:', err);
    }

    return { success: false, message: 'The registration service is unavailable.' };
  };

  // Volunteer Application
  const applyVolunteer = async (eventId, roleApplied, reason = '', skills = '') => {
    if (!user) return { success: false, message: 'Please login first.' };

    try {
      const resp = await apiFetch('/api/db/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, roleApplied, reason, skills })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setVolunteers((prev) => [data.volunteer, ...prev]);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Volunteer application failed.' };
    } catch (err) {
      console.warn('Volunteer application service is unavailable.');
    }
    return { success: false, message: 'Volunteer application service is unavailable.' };
  };

  // Update Volunteer Status (Teacher)
  const updateVolunteerStatus = async (volunteerId, status) => {
    try {
      const response = await apiFetch('/api/db/volunteer-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: volunteerId, status })
      });
      if (!response.ok) return { success: false };
    } catch (err) {
      return { success: false };
    }
    await fetchVolunteers();
    return { success: true };
  };

  // Messaging Functions
  const sendMessage = async ({ recipientEmail, eventId, subject, content }) => {
    if (!user) return { success: false, message: 'User not authenticated' };

    const payload = {
      recipientEmail,
      eventId,
      subject,
      content
    };

    try {
      const resp = await apiFetch('/api/db/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (data.success && data.message) {
        setMessages((prev) => [data.message, ...prev]);
        return { success: true, message: 'Message sent successfully!' };
      }
      return { success: false, message: data.message || 'Unable to send the message.' };
    } catch {
      console.warn('Message service is unavailable.');
    }
    return { success: false, message: 'The message service is unavailable.' };
  };

  const markMessageRead = async (id) => {
    try {
      const response = await apiFetch(`/api/db/messages/${id}/read`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok || !data.success) return false;
      setMessages((prev) => prev.map((message) =>
        message.id === id ? { ...message, isRead: true } : message
      ));
      return true;
    } catch {
      return false;
    }
  };

  // Attendance Management
  const startAttendance = async (eventId) => {
    try {
      const resp = await apiFetch('/api/db/attendance/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });
      const data = await resp.json();
      if (data.success) {
        return { success: true, session: data.session, expiresInSeconds: data.expiresInSeconds };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.warn('Attendance service is unavailable.');
      return { success: false, message: 'Attendance service is unavailable.' };
    }
  };

  const requestAttendance = async (eventId, code) => {
    if (!user) return { success: false, message: 'Please login first.' };

    try {
      const resp = await apiFetch('/api/db/attendance/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, code })
      });
      const data = await resp.json();
      return data;
    } catch (err) {
      return { success: false, message: err?.message || 'Failed to submit attendance request.' };
    }
  };

  const fetchAttendanceRequests = async (eventId) => {
    try {
      const resp = await apiFetch(`/api/db/attendance/requests/${eventId}`);
      const data = await resp.json();
      if (!resp.ok || !data.success || !Array.isArray(data.requests)) {
        return {
          success: false,
          message: data.message || 'Unable to load attendance requests.'
        };
      }
      return { success: true, requests: data.requests };
    } catch {
      return { success: false, message: 'Attendance requests are unavailable.' };
    }
  };

  const approveAttendance = async ({ requestId, eventId, status = 'Present', approveAll = false }) => {
    try {
      const resp = await apiFetch('/api/db/attendance/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, eventId, status, approveAll })
      });
      const data = await resp.json();
      return data;
    } catch (err) {
      return { success: false, message: err?.message };
    }
  };

  const endAttendance = async (eventId) => {
    try {
      const response = await apiFetch('/api/db/attendance/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, message: data.message || 'Unable to end the attendance session.' };
      }
      return { success: true, message: data.message };
    } catch {
      return { success: false, message: 'Attendance service is unavailable.' };
    }
  };

  // Feedback Submission
  const submitFeedback = async (eventId, rating, comment) => {
    if (!user) return;
    try {
      const resp = await apiFetch('/api/db/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, rating, comment })
      });
      const data = await resp.json();
      if (data.success && data.feedback) {
        return { success: true, feedback: data.feedback };
      }
      return { success: false, message: data.message || 'Unable to submit feedback.' };
    } catch {
      return { success: false, message: 'The feedback service is unavailable.' };
    }
  };

  const saveEventArtwork = async (eventId, artwork) => {
    try {
      const resp = await apiFetch(`/api/db/events/${eventId}/artwork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artwork)
      });
      const data = await resp.json();
      if (!resp.ok || !data.success || !data.event) {
        return { success: false, message: data.message || 'Unable to save event artwork.' };
      }
      setEvents((prev) => prev.map((event) => event.id === eventId ? data.event : event));
      return { success: true, event: data.event };
    } catch {
      return { success: false, message: 'The artwork service is unavailable.' };
    }
  };

  const saveEventCollegeLogo = async (eventId, imageDataUrl) => {
    try {
      const resp = await apiFetch(`/api/db/events/${eventId}/college-logo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl })
      });
      const data = await resp.json();
      if (!resp.ok || !data.success || !data.event) {
        return { success: false, message: data.message || 'Unable to save the college logo.' };
      }
      setEvents((prev) => prev.map((event) => event.id === eventId ? data.event : event));
      return { success: true, event: data.event };
    } catch {
      return { success: false, message: 'The college-logo service is unavailable.' };
    }
  };

  const reviewEventFlyer = async (eventId, kind, decision, message = '') => {
    try {
      const resp = await apiFetch(`/api/db/events/${eventId}/flyer-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, decision, message })
      });
      const data = await resp.json();
      if (!resp.ok || !data.success || !data.event) {
        return { success: false, message: data.message || 'Unable to update flyer review.' };
      }
      setEvents((prev) => prev.map((event) => event.id === eventId ? data.event : event));
      return { success: true, event: data.event };
    } catch {
      return { success: false, message: 'The flyer review service is unavailable.' };
    }
  };

  const markNotificationRead = async (id) => {
    setNotificationError('');
    try {
      const response = await apiFetch(`/api/db/notifications/${id}/read`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setNotificationError(data.message || 'Unable to update notification status.');
        return false;
      }
      setNotifications((prev) => prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ));
      return true;
    } catch {
      setNotificationError('The notification service is unavailable.');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        apiUnavailable,
        login,
        registerUser,
        changePassword,
        logout,
        updateProfile,
        events,
        registrations,
        fetchRegistrations,
        volunteers,
        fetchVolunteers,
        notifications,
        notificationError,
        feedbacks,
        fetchFeedbacks,
        messages,
        facultyVerifications,
        facultyVerificationsLoaded,
        facultyVerificationsError,
        fetchEvents,
        fetchMessages,
        fetchFacultyVerifications,
        updateFacultyVerification,
        createEventOrSeminar,
        updateEventOrSeminar,
        setEventStatus,
        deleteEvent,
        registerForEvent,
        applyVolunteer,
        updateVolunteerStatus,
        sendMessage,
        markMessageRead,
        startAttendance,
        requestAttendance,
        fetchAttendanceRequests,
        approveAttendance,
        endAttendance,
        submitFeedback,
        saveEventArtwork,
        saveEventCollegeLogo,
        reviewEventFlyer,
        markNotificationRead
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
