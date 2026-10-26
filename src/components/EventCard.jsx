import React from 'react';
import { Calendar, MapPin, Users, Award, Sparkles, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getEventDateLabel } from '../features/eventRules';

export const EventCard = ({
  event,
  onSelect,
  onRegister,
  onVolunteer,
  isRegistered = false
}) => {
  const { user } = useAuth();

  const getCategoryColor = (category = '') => {
    switch (category) {
      case 'Technical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Cultural':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Sports':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Academic':
      case 'Workshop':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Banner Image & Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-slate-900 to-red-950">
        {event.image || event.selectedFlyerImage ? (
          <img
            src={event.selectedFlyerImage || event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              {event.department}
            </span>
            <span className="text-sm font-extrabold text-white mt-1 line-clamp-2">
              {event.title}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-xs ${getCategoryColor(event.category)}`}>
            {event.type === 'seminar' ? (event.programmeType || 'Seminar') : (event.category || 'Event')}
          </span>

          <span className="bg-red-600/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md border border-white/20">
            {event.targetAudience || 'Everyone'}
          </span>
        </div>

        {/* Bottom Title snippet on image */}
        <div className="absolute bottom-2.5 left-3 right-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 block mb-0.5">
            {event.department}
          </span>
          <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug line-clamp-1 drop-shadow-sm">
            {event.title}
          </h3>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {event.subHeadline ? (
          <p className="text-xs text-red-800 font-bold italic line-clamp-1">
            "{event.subHeadline}"
          </p>
        ) : (
          <p className="text-xs text-gray-600 line-clamp-2 font-medium">
            {event.description}
          </p>
        )}

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-700 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-800">
            <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">{getEventDateLabel(event)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-800">
            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>

          {event.attendanceEnabled && (
            <div className="col-span-2 flex items-center gap-1 text-[11px] text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              <span>Live Attendance Verification Enabled</span>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-2 flex items-center gap-2 border-t border-gray-100">
          <button
            onClick={() => onSelect(event)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            Details
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {user?.role === 'student' && event.registrationEnabled && (
            <>
              {isRegistered ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Registered
                </span>
              ) : (
                <button
                  onClick={() => onRegister?.(event.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  Register
                </button>
              )}
            </>
          )}

          {user?.role === 'student' && onVolunteer && (
            <button
              onClick={() => onVolunteer(event)}
              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl transition-colors cursor-pointer"
              title="Apply for Volunteer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
