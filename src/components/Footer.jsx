import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Heart, Globe, ExternalLink, Globe2 } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border-light)] bg-[var(--bg-card)]">
      <div className="page-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & About */}
          <div className="md:col-span-5 lg:col-span-4">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group inline-flex">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                <MapPin size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                {t('app.name')}
              </span>
            </Link>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
              {t('footer.aboutText')}
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)] hover:text-primary-500 hover:bg-primary-500/10 transition-colors border border-[var(--border-default)]">
                <Globe size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)] hover:text-blue-500 hover:bg-blue-500/10 transition-colors border border-[var(--border-default)]">
                <Globe2 size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors border border-[var(--border-default)]">
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Spacer for layout */}
          <div className="hidden lg:block lg:col-span-2"></div>

          {/* Quick Links */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="font-bold text-[var(--text-primary)] mb-5 uppercase tracking-wider text-xs">{t('footer.links')}</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link to="/" className="text-sm text-[var(--text-secondary)] hover:text-primary-500 transition-colors inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[var(--border-default)] group-hover:bg-primary-500"></span>
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/create-report" className="text-sm text-[var(--text-secondary)] hover:text-primary-500 transition-colors inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[var(--border-default)] group-hover:bg-primary-500"></span>
                  {t('nav.createReport')}
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-[var(--text-secondary)] hover:text-primary-500 transition-colors inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[var(--border-default)] group-hover:bg-primary-500"></span>
                  {t('nav.myReports')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="font-bold text-[var(--text-primary)] mb-5 uppercase tracking-wider text-xs">{t('footer.contact')}</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="mailto:info@civicreport.com" className="text-sm text-[var(--text-secondary)] hover:text-primary-500 transition-colors inline-flex items-center gap-2.5">
                  <Mail size={16} className="text-[var(--text-tertiary)]" /> 
                  info@civicreport.com
                </a>
              </li>
            </ul>
            
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-primary-500/5 to-accent-500/5 border border-primary-500/10">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Empowering citizens to build better communities through technology and collaboration.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border-light)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-tertiary)]">
            &copy; {year} {t('app.name')}. {t('footer.rights')}
          </p>
          <p className="text-sm text-[var(--text-tertiary)] flex items-center gap-1.5">
            Made with <Heart size={14} className="text-red-500 animate-pulse-glow" /> for the community
          </p>
        </div>
      </div>
    </footer>
  );
}
