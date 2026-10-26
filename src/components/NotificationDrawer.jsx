import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Bell, Award, Sparkles, Calendar } from 'lucide-react';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const { notifications, notificationError, markNotificationRead } = useAuth();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'certificate':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'volunteer':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Calendar className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Top Bar */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-600 text-white rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold text-gray-900">Notifications & Alerts</h2>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notificationError && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800">
                {notificationError}
              </p>
            )}
            {notifications.length === 0 && !notificationError ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No notifications right now.
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    n.read ? 'bg-gray-50 border-gray-100 opacity-80' : 'bg-red-50/40 border-red-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {getIcon(n.type)}
                      <h4 className="text-xs font-extrabold text-gray-900">{n.title}</h4>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium pl-6">
                    {n.message}
                  </p>
                </div>
              ))
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
