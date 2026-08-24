import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, MapPin } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const { t } = useTranslation();
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    const result = await login(form.email, form.password);
    if (result?.success) {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in-up">
        {/* Left - Branding */}
        <div className="auth-branding">
          <div className="auth-brand-content">
            <div className="auth-brand-icon">
              <MapPin size={32} />
            </div>
            <h2 className="auth-brand-title">{t('app.name')}</h2>
            <p className="auth-brand-desc">{t('app.tagline')}</p>
            <div className="auth-brand-features">
              <div className="auth-feature"><span>📍</span> {t('auth.features.report')}</div>
              <div className="auth-feature"><span>🔍</span> {t('auth.features.track')}</div>
              <div className="auth-feature"><span>🤖</span> {t('auth.features.ai')}</div>
              <div className="auth-feature"><span>🗺️</span> {t('auth.features.map')}</div>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="auth-form-section">
          <div className="auth-form-inner">
            <h1 className="auth-title">{t('auth.login.title')}</h1>
            <p className="auth-subtitle">{t('auth.login.subtitle')}</p>

            {error && <div className="auth-error animate-fade-in">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">{t('auth.login.email')}</label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    className="form-input input-with-icon"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.login.password')}</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input input-with-icon"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? (
                  <span className="btn-loading"><span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /></span>
                ) : (
                  <><LogIn size={18} /> {t('auth.login.submit')}</>
                )}
              </button>
            </form>

            <p className="auth-switch">
              {t('auth.login.noAccount')}{' '}
              <Link to="/register">{t('auth.login.register')}</Link>
            </p>

            {/* Demo credentials */}
            <div className="auth-demo">
              <p className="auth-demo-title">Demo Credentials:</p>
              <code>admin@civic.com / admin123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
