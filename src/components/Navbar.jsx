import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import {
  Menu, X, Bell, Sun, Moon, Globe, LogOut, User,
  Shield, MapPin, Plus, Home, ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      notificationsAPI.getUnreadCount()
        .then(({ data }) => setUnreadCount(data.data?.count || 0))
        .catch(() => {});
      const interval = setInterval(() => {
        notificationsAPI.getUnreadCount()
          .then(({ data }) => setUnreadCount(data.data?.count || 0))
          .catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Close mobile menu on route change
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleLanguage = () => {
    const newLang = isAr ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'text-primary-500 bg-primary-500/10'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
    }`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[var(--bg-nav)] backdrop-blur-xl border-b border-[var(--border-default)] shadow-sm'
        : 'bg-transparent'
    }`}>
      <div className="page-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-primary-500/20 transition-all duration-300">
            <MapPin size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
            {t('app.name')}
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className={navLinkClass('/')}>
            <Home size={16} />
            {t('nav.home')}
          </Link>
          {isAuthenticated && (
            <Link to="/create-report" className={navLinkClass('/create-report')}>
              <Plus size={16} />
              {t('nav.createReport')}
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className={navLinkClass('/admin')}>
              <Shield size={16} />
              {t('nav.admin')}
            </Link>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all duration-200"
            title="Toggle Language"
          >
            <Globe size={18} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all duration-200"
            title="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          {isAuthenticated && (
            <Link
              to="/notifications"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all duration-200 relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 animate-pulse-glow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Profile / Auth */}
          {isAuthenticated ? (
            <div className="relative ms-1">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[var(--bg-card)] transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium text-[var(--text-primary)]">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} className={`text-[var(--text-tertiary)] transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute end-0 top-full mt-2 w-72 glass-card-static p-2 z-50 animate-fade-in-down">
                    {/* Profile Header */}
                    <div className="flex items-center gap-3 p-3 mb-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-base shadow-md">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.name}</p>
                        <p className="text-xs text-[var(--text-tertiary)] truncate">{user?.email}</p>
                      </div>
                    </div>

                    <div className="h-px bg-[var(--border-light)] my-1" />

                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-all duration-200" onClick={() => setProfileOpen(false)}>
                      <User size={16} /> {t('nav.profile')}
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-all duration-200" onClick={() => setProfileOpen(false)}>
                      <MapPin size={16} /> {t('nav.myReports')}
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-all duration-200" onClick={() => setProfileOpen(false)}>
                        <Shield size={16} /> {t('nav.admin')}
                      </Link>
                    )}

                    <div className="h-px bg-[var(--border-light)] my-1" />

                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-all duration-200" onClick={handleLogout}>
                      <LogOut size={16} /> {t('nav.logout')}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 ms-2">
              <Link to="/login" className="btn btn-ghost btn-sm">{t('nav.login')}</Link>
              <Link to="/register" className="btn btn-primary btn-sm">{t('nav.register')}</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--bg-glass-strong)] backdrop-blur-xl border-t border-[var(--border-default)] animate-fade-in-down">
          <div className="page-container py-3 flex flex-col gap-1">
            <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive('/') ? 'bg-primary-500/10 text-primary-500' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
            }`}>
              <Home size={18} /> {t('nav.home')}
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/create-report" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/create-report') ? 'bg-primary-500/10 text-primary-500' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                }`}>
                  <Plus size={18} /> {t('nav.createReport')}
                </Link>
                <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/profile') ? 'bg-primary-500/10 text-primary-500' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                }`}>
                  <User size={18} /> {t('nav.profile')}
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/admin') ? 'bg-primary-500/10 text-primary-500' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
              }`}>
                <Shield size={18} /> {t('nav.admin')}
              </Link>
            )}
            {!isAuthenticated && (
              <div className="flex gap-2 mt-2 px-2">
                <Link to="/login" className="btn btn-secondary flex-1 justify-center">{t('nav.login')}</Link>
                <Link to="/register" className="btn btn-primary flex-1 justify-center">{t('nav.register')}</Link>
              </div>
            )}
            {isAuthenticated && (
              <>
                <div className="h-px bg-[var(--border-light)] my-1" />
                <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200 w-full" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                  <LogOut size={18} /> {t('nav.logout')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
