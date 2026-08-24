import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import ReportCard from '../components/ReportCard';
import StatusBadge from '../components/StatusBadge';
import { User, MapPin, Mail, Phone, Shield, Edit3, FileText, ThumbsUp, Clock } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reports');

  useEffect(() => { loadMyReports(); }, []);

  const loadMyReports = async () => {
    try {
      const { data } = await reportsAPI.getMyReports();
      setReports(data.data?.reports || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const statsByStatus = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header card-static animate-fade-in-up">
          <div className="profile-avatar-large">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user?.name}</h1>
            <div className="profile-meta">
              <span><Mail size={14} /> {user?.email}</span>
              {user?.neighborhood && <span><MapPin size={14} /> {user?.neighborhood}</span>}
              {user?.phone && <span><Phone size={14} /> {user?.phone}</span>}
              <span className="profile-role-badge">
                <Shield size={12} /> {user?.role}
              </span>
            </div>
          </div>
          <div className="profile-trust">
            <div className="trust-circle">
              <svg viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="var(--border)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="var(--primary)" strokeWidth="3"
                  strokeDasharray={`${user?.trustScore || 50}, 100`} strokeLinecap="round" />
              </svg>
              <span className="trust-value">{user?.trustScore || 50}</span>
            </div>
            <span className="trust-label">Trust Score</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="profile-stats animate-fade-in-up delay-1">
          <div className="profile-stat">
            <FileText size={18} />
            <span className="profile-stat-num">{reports.length}</span>
            <span className="profile-stat-label">Total Reports</span>
          </div>
          <div className="profile-stat">
            <Clock size={18} />
            <span className="profile-stat-num">{statsByStatus.new || 0}</span>
            <span className="profile-stat-label">Pending</span>
          </div>
          <div className="profile-stat">
            <ThumbsUp size={18} />
            <span className="profile-stat-num">{statsByStatus.resolved || 0}</span>
            <span className="profile-stat-label">Resolved</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button className={`profile-tab ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>
            <FileText size={16} /> {t('profile.myReports')}
          </button>
        </div>

        {/* Reports List */}
        <div className="profile-content animate-fade-in">
          {loading ? (
            <div className="reports-grid">
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 16 }} />)}
            </div>
          ) : reports.length === 0 ? (
            <div className="profile-empty">
              <FileText size={48} />
              <p>{t('profile.noReports')}</p>
              <Link to="/create-report" className="btn btn-primary">{t('nav.createReport')}</Link>
            </div>
          ) : (
            <div className="reports-grid">
              {reports.map(report => <ReportCard key={report.id} report={report} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
