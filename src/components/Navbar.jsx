import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CollegeLogo } from './CollegeLogo';
import { TechStackModal } from './TechStackModal';
import {
  Bell,
  LogOut,
  Calendar,
  Award,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  Menu,
  X,
  Code2
} from 'lucide-react';

export const Navbar = ({
  activeTab = 'events',
  setActiveTab,
  onOpenNotifications,
  onOpenProfile
}) => {
  const { user, logout, notifications } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [techStackOpen, setTechStackOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Logo Section */}
            <div className="flex items-center gap-6">
              <div className="cursor-pointer flex items-center gap-3" onClick={() => setActiveTab?.('events')}>
                <CollegeLogo size="md" showText={true} />
              </div>

              {/* Role Badge */}
              {user && (
                <span className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  user.role === 'teacher'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : user.role === 'admin'
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {user.role === 'teacher' ? 'Faculty / Organizer' : user.role === 'admin' ? 'College Admin' : `${user.stream} • ${user.studentClass}`}
                </span>
              )}
            </div>

            {/* Center Navigation Tabs (Desktop) */}
            {user && setActiveTab && (
              <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
                <button
                  onClick={() => setActiveTab('events')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'events'
                      ? 'bg-white text-red-600 shadow-xs font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Events Hub
                </button>

                {user.role === 'student' && (
                  <button
                    onClick={() => setActiveTab('registered')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'registered'
                        ? 'bg-white text-red-600 shadow-xs font-semibold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    My Tickets
                  </button>
                )}

                {(user.role === 'teacher' || user.role === 'admin') && (
                  <>
                    <button
                      onClick={() => setActiveTab('manage')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'manage'
                          ? 'bg-white text-red-600 shadow-xs font-semibold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Create & Manage
                    </button>
                    <button
                      onClick={() => setActiveTab('volunteers')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'volunteers'
                          ? 'bg-white text-red-600 shadow-xs font-semibold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      Volunteer Desk
                    </button>
                  </>
                )}
              </nav>
            )}

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Tech Stack Specs Trigger */}
              <button
                onClick={() => setTechStackOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                title="System Tech Stack & Software Specs"
              >
                <Code2 className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Software Specs</span>
              </button>

              {/* Notification Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Trigger */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                    alt={user?.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-red-500/30"
                  />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-gray-900 leading-tight">
                      {user?.name || 'Guest User'}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {user?.role === 'student' ? `Roll #${user.rollNo}` : user?.department || 'Faculty'}
                    </span>
                  </div>
                </button>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-2">
            <button
              onClick={() => { setActiveTab?.('events'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'events' ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700'}`}
            >
              Events Hub
            </button>

            {user?.role === 'student' && (
              <button
                onClick={() => { setActiveTab?.('registered'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'registered' ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700'}`}
              >
                My Registered Tickets
              </button>
            )}

            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <>
                <button
                  onClick={() => { setActiveTab?.('manage'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'manage' ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700'}`}
                >
                  Create & Manage Events
                </button>
                <button
                  onClick={() => { setActiveTab?.('volunteers'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'volunteers' ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700'}`}
                >
                  Volunteer Desk
                </button>
              </>
            )}
          </div>
        )}
      </header>

      <TechStackModal isOpen={techStackOpen} onClose={() => setTechStackOpen(false)} />
    </>
  );
};
