import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPinned, UserPlus, MapPin } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const { t } = useTranslation();
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', neighborhood: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationError('');
    
    if (form.password !== form.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      neighborhood: form.neighborhood || undefined,
      phone: form.phone || undefined
    });
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
            <div className="auth-brand-icon"><MapPin size={32} /></div>
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
            <h1 className="auth-title">{t('auth.register.title')}</h1>
            <p className="auth-subtitle">{t('auth.register.subtitle')}</p>

            {(error || validationError) && <div className="auth-error animate-fade-in">{error || validationError}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">{t('auth.register.name')}</label>
                <div className="input-icon-wrap">
                  <User size={16} className="input-icon" />
                  <input type="text" className="form-input input-with-icon" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required minLength={2} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.register.email')}</label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input type="email" className="form-input input-with-icon" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required />
                </div>
              </div>

              <div className="auth-form-row">
                <div className="form-group">
                  <label className="form-label">{t('auth.register.password')}</label>
                  <div className="input-icon-wrap">
                    <Lock size={16} className="input-icon" />
                    <input type={showPassword ? 'text' : 'password'} className="form-input input-with-icon" value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••" required minLength={6} />
                    <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('auth.register.confirmPassword')}</label>
                  <div className="input-icon-wrap">
                    <Lock size={16} className="input-icon" />
                    <input type="password" className="form-input input-with-icon" value={form.confirmPassword}
                      onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="••••••" required />
                  </div>
                </div>
              </div>

              <div className="auth-form-row">
                <div className="form-group">
                  <label className="form-label">{t('auth.register.neighborhood')}</label>
                  <div className="input-icon-wrap">
                    <MapPinned size={16} className="input-icon" />
                    <input type="text" className="form-input input-with-icon" value={form.neighborhood}
                      onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} placeholder={t('report.create.neighborhoodPlaceholder')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('auth.register.phone')}</label>
                  <div className="input-icon-wrap">
                    <Phone size={16} className="input-icon" />
                    <input type="tel" className="form-input input-with-icon" value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+20 xxx xxx xxxx" />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? (
                  <span className="btn-loading"><span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /></span>
                ) : (
                  <><UserPlus size={18} /> {t('auth.register.submit')}</>
                )}
              </button>
            </form>

            <p className="auth-switch">
              {t('auth.register.hasAccount')}{' '}
              <Link to="/login">{t('auth.register.login')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
