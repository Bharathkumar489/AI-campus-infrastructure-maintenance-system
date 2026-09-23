import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, AlertTriangle, Info, Wrench } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function NotificationDropdown({ onSelectRequest }) {
  const { currentUser, notificationCount, refreshNotificationCount } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    if (!currentUser?.user_id) return;
    setLoading(true);
    try {
      const list = await api.getNotifications(currentUser.user_id);
      setNotifications(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead(currentUser.user_id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      refreshNotificationCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.is_read) {
      await api.markNotificationRead(notif.notification_id);
      setNotifications(prev => prev.map(n => n.notification_id === notif.notification_id ? { ...n, is_read: 1 } : n));
      refreshNotificationCount();
    }
    if (notif.request_id && onSelectRequest) {
      onSelectRequest(notif.request_id);
      setIsOpen(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ALERT': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'ASSIGNMENT': return <Wrench className="w-4 h-4 text-indigo-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {notificationCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-800">Notifications</span>
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No notifications right now
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.notification_id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 flex gap-3 cursor-pointer hover:bg-slate-50 transition ${!n.is_read ? 'bg-blue-50/40' : ''}`}
                >
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1">
                    <p className={`text-xs ${!n.is_read ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 self-center"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
