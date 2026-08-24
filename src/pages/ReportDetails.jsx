import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import MapView from '../components/MapView';
import StatusBadge from '../components/StatusBadge';
import { ThumbsUp, MapPin, Clock, User, ArrowLeft, Trash2, MessageSquare, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import './ReportDetails.css';

const CATEGORY_ICONS = { pothole: '🕳️', lighting: '💡', water_leak: '💧', garbage: '🗑️', other: '📋' };

export default function ReportDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackForm, setFeedbackForm] = useState({ wasResolved: null, comment: '' });

  useEffect(() => { loadReport(); }, [id]);

  const loadReport = async () => {
    try {
      const { data } = await reportsAPI.getById(id);
      setReport(data.data.report);
      setHasUpvoted(data.data.hasUpvoted);
    } catch { navigate('/'); }
    setLoading(false);
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      const { data } = await reportsAPI.upvote(id);
      setHasUpvoted(data.data.upvoted);
      setReport(r => ({ ...r, upvoteCount: data.data.upvoteCount, priority: data.data.priority }));
    } catch { /* ignore */ }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('report.detail.deleteConfirm'))) return;
    try {
      await reportsAPI.delete(id);
      navigate('/');
    } catch { /* ignore */ }
  };

  const handleFeedback = async () => {
    if (feedbackForm.wasResolved === null) return;
    try {
      await reportsAPI.submitFeedback(id, feedbackForm);
      loadReport();
    } catch { /* ignore */ }
  };

  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  if (loading) return (
    <div className="report-details-page">
      <div className="container"><div className="skeleton" style={{ height: 400, borderRadius: 16 }} /></div>
    </div>
  );

  if (!report) return null;

  const isOwner = user?.id === report.userId;
  const canDelete = isOwner || user?.role === 'admin';

  return (
    <div className="report-details-page">
      <div className="container">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> {t('common.back')}
        </button>

        <div className="report-detail-layout animate-fade-in-up">
          {/* Main Content */}
          <div className="report-detail-main">
            {/* Image */}
            {report.imageUrl && (
              <div className="report-detail-image">
                <img src={report.imageUrl.startsWith('/') ? `http://localhost:5000${report.imageUrl}` : report.imageUrl} alt={report.title} />
              </div>
            )}

            {/* Header */}
            <div className="report-detail-header card-static" style={{ padding: '1.5rem' }}>
              <div className="report-detail-top">
                <span className="report-detail-category">
                  {CATEGORY_ICONS[report.category]} {t(`report.categories.${report.category}`)}
                </span>
                <StatusBadge status={report.status} size="lg" />
              </div>
              <h1 className="report-detail-title">{report.title}</h1>
              <p className="report-detail-desc">{report.description}</p>

              <div className="report-detail-meta">
                <span className="report-meta-item">
                  <User size={14} />
                  {report.isAnonymous ? t('report.detail.anonymous') : report.user?.name || 'Unknown'}
                </span>
                {report.neighborhood && (
                  <span className="report-meta-item">
                    <MapPin size={14} /> {report.neighborhood}
                  </span>
                )}
                <span className="report-meta-item">
                  <Clock size={14} /> {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="report-detail-actions">
                <button className={`btn ${hasUpvoted ? 'btn-primary' : 'btn-secondary'}`} onClick={handleUpvote}>
                  <ThumbsUp size={16} /> {report.upvoteCount} {hasUpvoted ? t('report.detail.upvoted') : t('report.detail.upvote')}
                </button>
                {canDelete && (
                  <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                    <Trash2 size={14} /> {t('report.detail.delete')}
                  </button>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            {report.statusUpdates?.length > 0 && (
              <div className="report-timeline card-static" style={{ padding: '1.5rem' }}>
                <h3 className="report-section-title">{t('report.detail.timeline')}</h3>
                <div className="timeline">
                  {report.statusUpdates.map((update, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <StatusBadge status={update.newStatus} size="sm" />
                          <span className="timeline-time">{timeAgo(update.createdAt)} ago</span>
                        </div>
                        {update.note && <p className="timeline-note">{update.note}</p>}
                        <span className="timeline-admin">by {update.admin?.name || 'System'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback (if resolved) */}
            {report.status === 'resolved' && isAuthenticated && (
              <div className="report-feedback card-static" style={{ padding: '1.5rem' }}>
                <h3 className="report-section-title">{t('report.detail.feedback')}</h3>
                <div className="feedback-buttons">
                  <button className={`feedback-btn ${feedbackForm.wasResolved === true ? 'feedback-yes' : ''}`}
                    onClick={() => setFeedbackForm(f => ({ ...f, wasResolved: true }))}>
                    <CheckCircle size={20} /> {t('report.detail.feedbackYes')}
                  </button>
                  <button className={`feedback-btn ${feedbackForm.wasResolved === false ? 'feedback-no' : ''}`}
                    onClick={() => setFeedbackForm(f => ({ ...f, wasResolved: false }))}>
                    <XCircle size={20} /> {t('report.detail.feedbackNo')}
                  </button>
                </div>
                <textarea className="form-textarea" rows={2} value={feedbackForm.comment}
                  onChange={e => setFeedbackForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder={t('report.detail.feedbackComment')} />
                <button className="btn btn-primary btn-sm" onClick={handleFeedback}
                  disabled={feedbackForm.wasResolved === null}>
                  {t('report.detail.feedbackSubmit')}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Map */}
          <div className="report-detail-sidebar">
            <div className="card-static" style={{ padding: '1rem' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>{t('report.create.location')}</h4>
              <MapView
                reports={[report]}
                center={[report.latitude, report.longitude]}
                zoom={15}
                height="280px"
                interactive={false}
              />
            </div>

            {/* Priority */}
            <div className="card-static priority-card">
              <span className="priority-label">{t('report.detail.priority')}</span>
              <span className={`priority-value priority-${report.priority}`}>
                {t(`report.priorities.${report.priority}`)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
