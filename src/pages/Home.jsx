import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { reportsAPI, adminAPI } from '../services/api';
import MapView from '../components/MapView';
import ReportCard from '../components/ReportCard';
import { MapPin, Plus, BarChart3, CheckCircle2, Users, FileText, Filter, Search, ChevronRight, ChevronDown, TrendingUp, Zap, Trophy, Award } from 'lucide-react';

const CATEGORIES = ['pothole', 'broken_streetlight', 'water_leak', 'garbage', 'damaged_sidewalk', 'sewage', 'traffic_sign', 'other'];
const STATUSES = ['pending', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed'];

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', status: '', search: '' });
  const [viewMode, setViewMode] = useState('map'); // 'map', 'grid', or 'leaderboard'
  const [leaderboardData, setLeaderboardData] = useState({ neighborhoods: [], users: [] });
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  async function loadLeaderboard() {
    try {
      setLoadingLeaderboard(true);
      const { data } = await reportsAPI.getLeaderboard();
      if (data.success) {
        setLeaderboardData(data.data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  }

  async function loadReports() {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      const { data } = await reportsAPI.getAll(params);
      setReports(data.data?.reports || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data.data);
    } catch {
      // Stats may fail for non-admin users, that's ok
    }
  }

  useEffect(() => {
    loadReports();
    loadStats();
  }, [filters.category, filters.status]);

  useEffect(() => {
    if (viewMode === 'leaderboard') {
      loadLeaderboard();
    }
  }, [viewMode]);

  const filteredReports = reports.filter(r => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return r.title?.toLowerCase().includes(search) || 
             r.description?.toLowerCase().includes(search) ||
             r.neighborhood?.toLowerCase().includes(search);
    }
    return true;
  });

  return (
    <div className="pt-16 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 flex-shrink-0">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="page-container relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 text-center md:text-start animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold text-sm mb-6 border border-primary-500/20 shadow-sm shadow-primary-500/10">
              <Zap size={14} className="text-primary-500" />
              <span>AI-Powered Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] mb-6 leading-tight">
              {t('home.hero.title')}
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto md:mx-0">
              {t('home.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              {isAuthenticated ? (
                <Link to="/create-report" className="btn btn-primary btn-lg w-full sm:w-auto shadow-primary-500/25">
                  <Plus size={18} />
                  {t('home.hero.cta')}
                </Link>
              ) : (
                <Link to="/register" className="btn btn-primary btn-lg w-full sm:w-auto shadow-primary-500/25">
                  {t('nav.register')}
                </Link>
              )}
              <a href="#map-section" className="btn btn-secondary btn-lg w-full sm:w-auto">
                <MapPin size={18} />
                {t('home.hero.viewMap')}
              </a>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="flex-1 w-full grid grid-cols-2 gap-4 animate-fade-in-up delay-2">
            <div className="glass-card-static p-5 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                <FileText size={20} />
              </div>
              <span className="text-3xl font-bold text-[var(--text-primary)] mb-1">{stats?.totalReports || 0}</span>
              <span className="text-sm font-medium text-[var(--text-secondary)]">{t('home.stats.totalReports')}</span>
            </div>
            
            <div className="glass-card-static p-5 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <CheckCircle2 size={20} />
              </div>
              <span className="text-3xl font-bold text-[var(--text-primary)] mb-1">{stats?.byStatus?.resolved || 0}</span>
              <span className="text-sm font-medium text-[var(--text-secondary)]">{t('home.stats.resolved')}</span>
            </div>
            
            <div className="glass-card-static p-5 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <TrendingUp size={20} />
              </div>
              <span className="text-3xl font-bold text-[var(--text-primary)] mb-1">{stats?.resolutionRate || 0}%</span>
              <span className="text-sm font-medium text-[var(--text-secondary)]">{t('home.stats.resolutionRate')}</span>
            </div>
            
            <div className="glass-card-static p-5 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center mb-3">
                <Users size={20} />
              </div>
              <span className="text-3xl font-bold text-[var(--text-primary)] mb-1">{stats?.totalUsers || 0}</span>
              <span className="text-sm font-medium text-[var(--text-secondary)]">{t('home.stats.activeUsers')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section id="map-section" className="flex-grow bg-[var(--bg-body)] py-8 relative">
        <div className="page-container">
          
          {/* Filters Bar */}
          <div className="glass-card-static p-3 mb-6 animate-fade-in z-20 relative">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              
              {/* Search */}
              <div className="relative flex-grow">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-shadow"
                  placeholder={t('home.filters.search')}
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                />
              </div>

              {/* Dropdowns */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex items-center bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg px-3 overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-shadow">
                  <Filter size={14} className="text-[var(--text-tertiary)] flex-shrink-0" />
                  <select
                    className="w-full bg-transparent border-none py-2.5 pl-2 pr-8 text-sm text-[var(--text-primary)] focus:outline-none appearance-none cursor-pointer"
                    value={filters.category}
                    onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">{t('home.filters.all')} {t('home.filters.category')}</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{t(`report.categories.${cat}`)}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
                </div>

                <div className="relative flex items-center bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-shadow">
                  <select
                    className="w-full bg-transparent border-none py-2.5 pl-4 pr-10 text-sm text-[var(--text-primary)] focus:outline-none appearance-none cursor-pointer min-w-[140px]"
                    value={filters.status}
                    onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="">{t('home.filters.all')} {t('home.filters.status')}</option>
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{t(`report.statuses.${s}`)}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex p-1 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg self-start sm:self-auto shrink-0">
                <button 
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'map' ? 'bg-primary-500 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  onClick={() => setViewMode('map')} 
                  title={t('home.hero.viewMap')}
                >
                  <MapPin size={16} />
                </button>
                <button 
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  onClick={() => setViewMode('grid')} 
                  title={t('common.viewAll')}
                >
                  <BarChart3 size={16} />
                </button>
                <button 
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'leaderboard' ? 'bg-primary-500 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  onClick={() => setViewMode('leaderboard')} 
                  title={t('home.filters.leaderboard')}
                >
                  <Trophy size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Map View */}
          {viewMode === 'map' && (
            <div className="glass-card-static p-2 animate-fade-in z-10 relative">
              <MapView reports={filteredReports} height="520px" />
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton h-[320px] w-full" />
                ))
              ) : filteredReports.length === 0 ? (
                <div className="col-span-full empty-state glass-card-static py-20">
                  <MapPin size={48} className="text-[var(--text-tertiary)] mb-4" />
                  <h3 className="text-xl font-semibold text-[var(--text-primary)]">{t('common.noResults')}</h3>
                  <p className="text-[var(--text-secondary)]">Try adjusting your filters or search term.</p>
                </div>
              ) : (
                filteredReports.map(report => (
                  <ReportCard key={report.id} report={report} />
                ))
              )}
            </div>
          )}

          {/* Leaderboard View */}
          {viewMode === 'leaderboard' && (
            <div className="animate-fade-in">
              <div className="mb-8 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mb-4">
                  <Trophy size={24} />
                </div>
                <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{t('home.leaderboard.title')}</h2>
                <p className="text-[var(--text-secondary)]">{t('home.leaderboard.subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Neighborhood Rankings */}
                <div className="glass-card-static p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-light)] pb-4 mb-4">
                    📍 {t('home.leaderboard.neighborhoodRank')}
                  </h3>
                  
                  <div className="flex flex-col gap-3 flex-grow">
                    {loadingLeaderboard ? (
                      [1, 2, 3].map(i => <div key={i} className="skeleton h-16 w-full" />)
                    ) : leaderboardData.neighborhoods.length === 0 ? (
                      <div className="flex-grow flex items-center justify-center text-[var(--text-tertiary)] py-10">
                        {t('common.noResults')}
                      </div>
                    ) : (
                      leaderboardData.neighborhoods.map((n, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors border border-transparent hover:border-[var(--border-light)]">
                          <div className="w-8 h-8 flex items-center justify-center font-bold text-sm rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-sm text-[var(--text-secondary)]">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[var(--text-primary)] truncate">{n.name}</h4>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                              {n.resolvedCount} / {n.totalCount} {t('report.statuses.resolved').toLowerCase()}
                            </p>
                          </div>
                          <div className="w-20 sm:w-24 flex flex-col items-end gap-1.5">
                            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{n.resolutionRate}%</span>
                            <div className="w-full h-1.5 rounded-full bg-[var(--border-light)] overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" style={{ width: `${n.resolutionRate}%` }} />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* User Rankings */}
                <div className="glass-card-static p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-light)] pb-4 mb-4">
                    🏆 {t('home.leaderboard.heroRank')}
                  </h3>
                  
                  <div className="flex flex-col gap-3 flex-grow">
                    {loadingLeaderboard ? (
                      [1, 2, 3].map(i => <div key={i} className="skeleton h-16 w-full" />)
                    ) : leaderboardData.users.length === 0 ? (
                      <div className="flex-grow flex items-center justify-center text-[var(--text-tertiary)] py-10">
                        {t('common.noResults')}
                      </div>
                    ) : (
                      leaderboardData.users.map((u, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-[var(--bg-card)] to-transparent hover:to-[var(--bg-card-hover)] transition-colors border border-[var(--border-light)] shadow-sm">
                          <div className={`w-10 h-10 flex items-center justify-center font-bold text-lg rounded-xl shadow-inner
                            ${i === 0 ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-white shadow-amber-500/30' : 
                              i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-500/30' : 
                              i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-white shadow-orange-700/30' : 
                              'bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)]'}`
                          }>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-[var(--text-primary)] truncate">{u.name}</h4>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1">
                              <MapPin size={10} className="text-accent-500" /> {u.neighborhood}
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-sm">
                              <Award size={14} />
                              <span>{u.trustScore}</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)]">
                              {u.reportsCount} {t('home.leaderboard.reportsCount')}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Reports Preview (below map) */}
          {viewMode === 'map' && filteredReports.length > 0 && (
            <div className="mt-12 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <MapPin className="text-primary-500" />
                    {t('home.filters.all')} {t('admin.reports')}
                  </h2>
                  <p className="text-[var(--text-secondary)] mt-1 text-sm">Recent infrastructure issues in your area.</p>
                </div>
                <button className="btn btn-ghost" onClick={() => setViewMode('grid')}>
                  {t('common.viewAll')} <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredReports.slice(0, 4).map(report => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
