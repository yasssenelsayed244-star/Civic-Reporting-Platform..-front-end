import { useTranslation } from 'react-i18next';

const STATUS_ICONS = {
  new: '🆕',
  pending: '🆕',
  under_review: '🔍',
  assigned: '👤',
  in_progress: '🔧',
  resolved: '✅',
  rejected: '❌',
  closed: '🔒'
};

const STATUS_COLORS = {
  new: 'bg-violet-500/10 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-500/20',
  pending: 'bg-violet-500/10 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-500/20',
  under_review: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20',
  assigned: 'bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-500/20',
  in_progress: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20',
  closed: 'bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-500/20'
};

export default function StatusBadge({ status, size = 'md' }) {
  const { t } = useTranslation();
  
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  };

  const normalizedStatus = status || 'new';
  
  return (
    <span className={`inline-flex items-center font-semibold rounded-full whitespace-nowrap ${STATUS_COLORS[normalizedStatus] || STATUS_COLORS.new} ${sizeClasses[size]}`}>
      <span className="leading-none">{STATUS_ICONS[normalizedStatus] || '❓'}</span>
      <span>{t(`report.statuses.${normalizedStatus}`)}</span>
    </span>
  );
}
