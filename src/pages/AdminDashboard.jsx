import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, FileText, CheckCircle2, TrendingUp, Users, Search, Filter, ChevronDown, RefreshCw } from 'lucide-react';
import './AdminDashboard.css';

const STATUS_COLORS = { new: '#8b5cf6', under_review: '#f59e0b', in_progress: '#3b82f6', resolved: '#10b981', rejected: '#ef4444' };
const CATEGORY_COLORS = { pothole: '#dc2626', lighting: '#f59e0b', water_leak: '#0ea5e9', garbage: '#84cc16', other: '#8b5cf6' };
const STATUSES = ['new', 'under_review', 'in_progress', 'resolved', 'rejected'];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ sort: 'newest', status: '', category: '', search: '' });
  const [statusModal, setStatusModal] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', note: '' });

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadReports(); }, [filters.sort, filters.status, filters.category]);

  const loadStats = async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data.data);
    } catch { /* ignore */ }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = { sort: filters.sort };
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      const { data } = await adminAPI.getReports(params);
      setReports(data.data?.reports || []);
      setPagination(data.data?.pagination || {});
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleStatusChange = async () => {
    if (!statusModal || !statusForm.status) return;
    try {
      await adminAPI.updateStatus(statusModal.id, statusForm);
      setStatusModal(null);
      setStatusForm({ status: '', note: '' });
      loadReports();
      loadStats();
    } catch { /* ignore */ }
  };

  const pieData = stats ? Object.entries(stats.byCategory || {}).map(([name, value]) => ({
    name: t(`report.categories.${name}`), value, color: CATEGORY_COLORS[name] || '#8b5cf6'
  })) : [];

  const barData = stats ? Object.entries(stats.byStatus || {}).map(([name, value]) => ({
    name: t(`report.statuses.${name}`), value, fill: STATUS_COLORS[name] || '#3b82f6'
  })) : [];

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header animate-fade-in-up">
          <div>
            <h1 className="admin-title"><Shield size={24} /> {t('admin.title')}</h1>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { loadStats(); loadReports(); }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="admin-stats animate-fade-in-up delay-1">
            <div className="admin-stat-card">
              <FileText size={22} className="admin-stat-icon" style={{ color: '#3b82f6' }} />
              <span className="admin-stat-num">{stats.totalReports}</span>
              <span className="admin-stat-label">{t('home.stats.totalReports')}</span>
            </div>
            <div className="admin-stat-card">
              <CheckCircle2 size={22} className="admin-stat-icon" style={{ color: '#10b981' }} />
              <span className="admin-stat-num">{stats.byStatus?.resolved || 0}</span>
              <span className="admin-stat-label">{t('home.stats.resolved')}</span>
            </div>
            <div className="admin-stat-card">
              <TrendingUp size={22} className="admin-stat-icon" style={{ color: '#f59e0b' }} />
              <span className="admin-stat-num">{stats.resolutionRate}%</span>
              <span className="admin-stat-label">{t('home.stats.resolutionRate')}</span>
            </div>
            <div className="admin-stat-card">
              <Users size={22} className="admin-stat-icon" style={{ color: '#8b5cf6' }} />
              <span className="admin-stat-num">{stats.totalUsers}</span>
              <span className="admin-stat-label">{t('home.stats.activeUsers')}</span>
            </div>
          </div>
        )}

        {/* Charts */}
        {stats && (
          <div className="admin-charts animate-fade-in-up delay-2">
            <div className="admin-chart card-static">
              <h3 className="chart-title">Reports by Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="admin-chart card-static">
              <h3 className="chart-title">Reports by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Reports Table */}
        <div className="admin-reports card-static animate-fade-in-up delay-3">
          <div className="admin-reports-header">
            <h3>{t('admin.reports')}</h3>
            <div className="admin-filters">
              <div className="filter-search" style={{ minWidth: 180 }}>
                <Search size={14} className="filter-search-icon" />
                <input type="text" className="form-input" style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
                  placeholder={t('home.filters.search')} value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && loadReports()} />
              </div>
              <select className="form-select" style={{ fontSize: '0.8rem', width: 'auto' }} value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="">All Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{t(`report.statuses.${s}`)}</option>)}
              </select>
              <select className="form-select" style={{ fontSize: '0.8rem', width: 'auto' }} value={filters.sort}
                onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}>
                <option value="newest">{t('admin.sort.newest')}</option>
                <option value="oldest">{t('admin.sort.oldest')}</option>
                <option value="priority">{t('admin.sort.priority')}</option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Upvotes</th>
                  <th>Reporter</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    <span className="animate-pulse">{t('common.loading')}</span>
                  </td></tr>
                ) : reports.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                    {t('common.noResults')}
                  </td></tr>
                ) : reports.map(report => (
                  <tr key={report.id}>
                    <td>
                      <Link to={`/reports/${report.id}`} className="admin-report-link">
                        {report.title?.substring(0, 40)}{report.title?.length > 40 ? '...' : ''}
                      </Link>
                    </td>
                    <td><span className="admin-category">{t(`report.categories.${report.category}`)}</span></td>
                    <td><StatusBadge status={report.status} size="sm" /></td>
                    <td><span className={`priority-value priority-${report.priority}`}>{t(`report.priorities.${report.priority}`)}</span></td>
                    <td>{report.upvoteCount}</td>
                    <td className="admin-reporter">{report.user?.name || 'Unknown'}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setStatusModal(report); setStatusForm({ status: report.status, note: '' }); }}>
                        {t('admin.changeStatus')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Change Modal */}
        {statusModal && (
          <div className="modal-overlay" onClick={() => setStatusModal(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>{t('admin.changeStatus')}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {statusModal.title}
              </p>
              <div className="form-group">
                <label className="form-label">{t('report.detail.status')}</label>
                <select className="form-select" value={statusForm.status}
                  onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{t(`report.statuses.${s}`)}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">{t('admin.note')}</label>
                <textarea className="form-textarea" rows={3} value={statusForm.note}
                  onChange={e => setStatusForm(f => ({ ...f, note: e.target.value }))}
                  placeholder={t('admin.noteHint')} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button className="btn btn-secondary" onClick={() => setStatusModal(null)}>{t('common.cancel')}</button>
                <button className="btn btn-primary" onClick={handleStatusChange}>{t('admin.update')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
