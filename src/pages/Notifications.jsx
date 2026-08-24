import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { notificationsAPI } from '../services/api';
import { Bell, CheckCheck, Clock, ArrowUpRight, FileText, ThumbsUp, MessageSquare } from 'lucide-react';
import './Notifications.css';

const ICON_MAP = {
  status_change: <FileText size={18} />,
  upvote: <ThumbsUp size={18} />,
  feedback_request: <MessageSquare size={18} />,
  report_created: <FileText size={18} />,
  report_reopened: <Bell size={18} />,
  system: <Bell size={18} />
};

const COLOR_MAP = {
  status_change: '#3b82f6',
  upvote: '#f59e0b',
  feedback_request: '#8b5cf6',
  report_created: '#10b981',
  report_reopened: '#ef4444',
  system: '#64748b'
};

export default function Notifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await notificationsAPI.getAll({ limit: 50 });
      setNotifications(data.data?.notifications || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  };

  const markRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
  };

  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="notif-header animate-fade-in-up">
          <h1 className="notif-title"><Bell size={22} /> {t('nav.notifications')}</h1>
          {notifications.some(n => !n.isRead) && (
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        <div className="notif-list">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12, marginBottom: 8 }} />
            ))
          ) : notifications.length === 0 ? (
            <div className="notif-empty">
              <Bell size={40} />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif, i) => (
              <div key={notif.id}
                className={`notif-item card-static ${!notif.isRead ? 'notif-unread' : ''} animate-fade-in delay-${Math.min(i + 1, 5)}`}
                onClick={() => markRead(notif.id)}
              >
                <div className="notif-icon" style={{ background: `${COLOR_MAP[notif.type]}15`, color: COLOR_MAP[notif.type] }}>
                  {ICON_MAP[notif.type] || <Bell size={18} />}
                </div>
                <div className="notif-content">
                  <h4 className="notif-item-title">{notif.title}</h4>
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time"><Clock size={12} /> {timeAgo(notif.createdAt)}</span>
                </div>
                {notif.payload?.reportId && (
                  <Link to={`/reports/${notif.payload.reportId}`} className="notif-link" onClick={e => e.stopPropagation()}>
                    <ArrowUpRight size={16} />
                  </Link>
                )}
                {!notif.isRead && <div className="notif-dot" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
