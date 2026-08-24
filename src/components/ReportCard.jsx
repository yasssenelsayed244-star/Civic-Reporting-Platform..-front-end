import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThumbsUp, MapPin, Clock, ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import StatusBadge from './StatusBadge';

const CATEGORY_ICONS = {
  pothole: '🕳️',
  lighting: '💡',
  water_leak: '💧',
  garbage: '🗑️',
  broken_streetlight: '💡',
  damaged_sidewalk: '🧱',
  sewage: '🌊',
  traffic_sign: '🛑',
  other: '📋'
};

const CATEGORY_COLORS = {
  pothole: 'from-red-500 to-rose-600',
  lighting: 'from-amber-400 to-orange-500',
  broken_streetlight: 'from-amber-400 to-orange-500',
  water_leak: 'from-sky-400 to-blue-600',
  garbage: 'from-lime-500 to-green-600',
  damaged_sidewalk: 'from-stone-500 to-neutral-600',
  sewage: 'from-teal-500 to-emerald-600',
  traffic_sign: 'from-yellow-400 to-amber-600',
  other: 'from-violet-500 to-purple-600'
};

export default function ReportCard({ report }) {
  const { t } = useTranslation();
  
  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const imageUrl = report.imageUrl || (report.images && report.images.length > 0 ? report.images[0].url : null);
  const displayImageUrl = imageUrl?.startsWith('/') ? `http://localhost:5000${imageUrl}` : imageUrl;
  const categoryColor = CATEGORY_COLORS[report.category] || CATEGORY_COLORS.other;

  return (
    <Link to={`/reports/${report.id}`} className="glass-card group block overflow-hidden flex flex-col h-full bg-[var(--bg-card)]">
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-[var(--bg-elevated)]">
        {displayImageUrl ? (
          <img 
            src={displayImageUrl} 
            alt={report.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-tertiary)] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-body)]">
            <ImageIcon size={40} className="mb-2 opacity-40 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-sm font-medium">{CATEGORY_ICONS[report.category] || '📋'}</span>
          </div>
        )}
        
        {/* Category Badge overlay */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-gradient-to-r ${categoryColor} text-white text-xs font-bold shadow-md flex items-center gap-1.5`}>
          <span>{CATEGORY_ICONS[report.category]}</span>
          <span className="drop-shadow-sm">{t(`report.categories.${report.category}`)}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-[var(--text-primary)] line-clamp-2 group-hover:text-primary-500 transition-colors">
            {report.title}
          </h3>
          <ArrowUpRight size={18} className="text-[var(--text-tertiary)] group-hover:text-primary-500 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 flex-grow">
          {report.description}
        </p>

        <div className="mt-auto pt-3 border-t border-[var(--border-light)] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <StatusBadge status={report.status} size="sm" />
            <span className="flex items-center gap-1 text-xs font-medium text-[var(--text-tertiary)]">
              <Clock size={12} />
              {timeAgo(report.createdAt)}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xs font-medium text-[var(--text-secondary)]">
            <div className="flex items-center gap-1 bg-[var(--bg-elevated)] px-2 py-1 rounded-md border border-[var(--border-light)]">
              <ThumbsUp size={12} className="text-primary-500" />
              <span>{report.upvoteCount || 0}</span>
            </div>
            {report.neighborhood && (
              <div className="flex items-center gap-1 truncate text-[var(--text-secondary)]">
                <MapPin size={12} className="text-accent-500 flex-shrink-0" />
                <span className="truncate">{report.neighborhood}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
