import React, { useState } from 'react';
import { X, Code2, Server, Database, Cpu, Wrench, Bell, Sparkles, CheckCircle2, Terminal, Download } from 'lucide-react';

export const TechStackModal = ({ isOpen, onClose }) => {
  const [notificationStatus, setNotificationStatus] = useState('');

  if (!isOpen) return null;

  const handleTestBrowserNotification = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('Browser Notification API is not supported in this environment.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('OurCampus Connect Alert', {
          body: 'This is a browser notification test from OurCampus Connect.',
          icon: '/favicon.ico'
        });
        setNotificationStatus('✓ Browser Notification Sent Successfully!');
      } else {
        setNotificationStatus('Permission denied for Browser Notifications.');
      }
    } catch {
      setNotificationStatus('Unable to send a browser notification in this environment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col my-6">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-800 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl font-bold shadow-md">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">System Architecture & Software Stack</h2>
              <p className="text-xs text-red-200 font-medium">
                Official R.K. Talreja College Project Synopsis Specs
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-red-200 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs text-gray-800">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="font-extrabold text-amber-950 block text-sm">Project Synopsis Information</span>
              <span className="text-amber-800 font-medium">
                Developer: <strong>Aryan Kanekar</strong> (Roll #2524020) • BSc CS • R.K. Talreja College
              </span>
            </div>
            <span className="bg-red-600 text-white font-extrabold text-[10px] px-3 py-1 rounded-full uppercase">
              Sem V 2026
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-gray-900 uppercase tracking-wider text-xs border-b pb-1">
              Official Software Requirements Checklist
            </h3>

            {/* Grid of 7 Requirements */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <div className="flex items-center gap-2 text-red-700 font-black">
                  <Terminal className="w-4 h-4" />
                  1. Programming Language
                </div>
                <p className="font-extrabold text-gray-900 text-sm pl-6">• JavaScript / React JSX</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <div className="flex items-center gap-2 text-red-700 font-black">
                  <Code2 className="w-4 h-4" />
                  2. Frontend Stack
                </div>
                <p className="font-extrabold text-gray-900 text-sm pl-6">• React.js (JSX) & Tailwind CSS</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <div className="flex items-center gap-2 text-red-700 font-black">
                  <Server className="w-4 h-4" />
                  3. Backend Services
                </div>
                <p className="font-extrabold text-gray-900 text-sm pl-6">• Node.js & Express.js</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <div className="flex items-center gap-2 text-red-700 font-black">
                  <Database className="w-4 h-4" />
                  4. Database Engine
                </div>
                <p className="font-extrabold text-gray-900 text-sm pl-6">• PostgreSQL (Connected)</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <div className="flex items-center gap-2 text-red-700 font-black">
                  <Wrench className="w-4 h-4" />
                  5. Development Tools
                </div>
                <p className="font-semibold text-gray-800 text-xs pl-6">
                  • Visual Studio Code<br />
                  • Git & GitHub Version Control<br />
                  • Postman API Client
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <div className="flex items-center gap-2 text-red-700 font-black">
                  <Cpu className="w-4 h-4" />
                  6. ML & AI Integration
                </div>
                <p className="font-semibold text-gray-800 text-xs pl-6">
                  • Machine Learning: Python (Recommendation & Analysis Engine)<br />
                  • Gemini AI (Flyer Generation & Sentiment Analysis)
                </p>
              </div>
            </div>

            {/* Additional Services #7 */}
            <div className="p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-red-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-800 font-black">
                  <Bell className="w-4 h-4 text-amber-600" />
                  7. Additional Services: Browser Notification API
                </div>
              </div>
              <p className="text-gray-600 font-medium text-xs">
                Test browser notifications in this browser. OneSignal and Telegram delivery are not configured.
              </p>

              <button
                type="button"
                onClick={handleTestBrowserNotification}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2 rounded-xl shadow-xs cursor-pointer flex items-center gap-2 text-xs"
              >
                <Bell className="w-3.5 h-3.5 text-amber-300" />
                Test Browser Notification API Live
              </button>

              {notificationStatus && (
                <p className="text-xs font-bold text-emerald-700 mt-1 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  {notificationStatus}
                </p>
              )}
            </div>

            {/* VS Code Export & Local Setup Card */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-600 rounded-lg text-white">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Export & Run in Visual Studio Code</h4>
                    <p className="text-[11px] text-slate-400">Download complete project package ready for local execution</p>
                  </div>
                </div>

                <a
                  href="/api/download-project-zip"
                  download="ourcampus-connect-rkt-college.zip"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .ZIP (113 KB)</span>
                </a>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <p className="text-amber-400 font-bold font-sans text-xs">🚀 3-Step Local Quickstart Guide:</p>
                <p><span className="text-slate-500">1.</span> unzip ourcampus-connect-rkt-college.zip && cd ourcampus-connect-rkt-college</p>
                <p><span className="text-slate-500">2.</span> npm install</p>
                <p><span className="text-slate-500">3.</span> npm run dev <span className="text-emerald-400 font-sans">(Runs full-stack on http://localhost:3000)</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
