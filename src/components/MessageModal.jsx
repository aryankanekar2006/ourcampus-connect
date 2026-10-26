import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Send, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export const MessageModal = ({
  isOpen,
  onClose,
  recipientEmail,
  recipientName,
  type = 'student_faculty',
  eventId = null,
  eventTitle = null,
  defaultSubject = ''
}) => {
  const { sendMessage } = useAuth();
  const [subject, setSubject] = useState(defaultSubject || (eventTitle ? `Inquiry regarding "${eventTitle}"` : ''));
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMsg('Message content cannot be empty.');
      return;
    }
    setErrorMsg('');
    setSending(true);

    try {
      const res = await sendMessage({
        type,
        recipientEmail,
        recipientName,
        eventId,
        eventTitle,
        subject: subject || 'Message',
        content
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setContent('');
          onClose();
        }, 1500);
      } else {
        setErrorMsg(res.message || 'Failed to send message.');
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Error sending message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-xs">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">
              {type === 'principal_faculty' ? 'Message from Principal' : 'Message Faculty'}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Recipient: <strong className="text-gray-800">{recipientName || recipientEmail}</strong>
            </p>
          </div>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-emerald-900 text-sm">Message Sent Successfully!</h3>
            <p className="text-xs text-emerald-700">The recipient has been notified in their dashboard inbox.</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            {eventTitle && (
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs text-gray-600">
                <span className="font-bold text-gray-800">Related Activity:</span> {eventTitle}
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Schedule clarification or event guidelines"
                className="w-full text-xs font-medium py-2.5 px-3 border border-gray-300 rounded-xl focus:border-red-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Message Content</label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your message clearly..."
                className="w-full text-xs font-medium py-2.5 px-3 border border-gray-300 rounded-xl focus:border-red-600 focus:outline-hidden resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
