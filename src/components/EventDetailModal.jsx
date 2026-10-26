import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEventDateLabel } from '../features/eventRules';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  Share2,
  Ticket,
  QrCode,
  KeyRound,
  Mail,
  User,
  ExternalLink,
  Award
} from 'lucide-react';

export const EventDetailModal = ({
  event,
  onClose,
  onRegister,
  onOpenVolunteer,
  onOpenAttendance,
  onOpenMessage,
  onOpenFlyer
}) => {
  const { user, registrations } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const isSeminar = event.type === 'seminar';
  const isRegistered = registrations.some(
    (r) => r.eventId === event.id && r.userEmail?.toLowerCase() === user?.email?.toLowerCase()
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out ${event.title} at R. K. Talreja College!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col my-8">
        {/* Banner Area */}
        <div className="relative h-56 sm:h-64 w-full bg-gradient-to-r from-slate-900 to-red-950 flex flex-col justify-between p-6 text-white overflow-hidden">
          {event.selectedFlyerImage || event.image ? (
            <img
              src={event.selectedFlyerImage || event.image}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          ) : null}

          {/* Close button */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                {isSeminar ? (event.programmeType || 'Seminar') : (event.category || 'Event')}
              </span>
              <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                Audience: {event.targetAudience || 'Everyone'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Header Title */}
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              Organized by {event.department}
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {event.title}
            </h2>
            {event.subHeadline && (
              <p className="text-xs text-amber-100 italic">"{event.subHeadline}"</p>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-red-50/50 p-4 rounded-2xl border border-red-100/80 text-xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Date</p>
                <p className="font-bold text-gray-900">{getEventDateLabel(event)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Time</p>
                <p className="font-bold text-gray-900">{event.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Venue</p>
                <p className="font-bold text-gray-900">{event.venue}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Audience</p>
                <p className="font-bold text-gray-900">{event.targetAudience || 'Everyone'}</p>
              </div>
            </div>
          </div>

          {/* Resource Person / Speaker if Seminar */}
          {isSeminar && event.resourcePerson && (
            <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-slate-900 rounded-xl font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                  Honorable Resource Person / Guest Speaker
                </span>
                <span className="text-sm font-bold text-amber-950">{event.resourcePerson}</span>
              </div>
            </div>
          )}

          {/* Prizes if supplied */}
          {event.prizes && (
            <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-slate-900 rounded-xl font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                  Prizes & Awards
                </span>
                <span className="text-sm font-bold text-amber-950">{event.prizes}</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
              {isSeminar ? 'About the Seminar' : 'Event Overview'}
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              {event.description}
            </p>
          </div>

          {/* Entry & Registration Details (ONLY IF REGISTRATION IS ENABLED) */}
          {event.registrationEnabled ? (
            <div className="bg-emerald-50/80 border border-emerald-200 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                    Registration & Entry Details
                  </h4>
                  <p className="text-xs text-emerald-800 font-medium">
                    Fee: <strong>{event.ticketPrice || 'Free'}</strong> • Eligibility: <strong>{event.eligibility || 'Open to All'}</strong>
                  </p>
                </div>

                {isRegistered ? (
                  <span className="bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Registered
                  </span>
                ) : event.externalRegistrationUrl ? (
                  <a
                    href={event.externalRegistrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    Open Registration Link
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={onRegister}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs cursor-pointer"
                  >
                    Register Now
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-xs text-gray-600 font-medium">
              <span className="font-bold text-gray-900">Entry:</span> Open to all eligible students. No prior registration fee or form required.
            </div>
          )}

          {/* Action Bar Footer */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenFlyer}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-red-600" />
                View & Download Official Flyer
              </button>

              <button
                onClick={handleShare}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                {copied ? 'Link Copied!' : 'Share'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {user?.role === 'student' && onOpenVolunteer && (
                <button
                  onClick={onOpenVolunteer}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Apply to Volunteer
                </button>
              )}
              {event.attendanceEnabled && onOpenAttendance && (
                <button
                  onClick={onOpenAttendance}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-slate-950" />
                  Mark Attendance
                </button>
              )}

              {user?.role === 'student' && onOpenMessage && (
                <button
                  onClick={onOpenMessage}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  Message Faculty
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
