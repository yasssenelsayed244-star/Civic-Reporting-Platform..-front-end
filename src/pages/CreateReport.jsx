import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { reportsAPI } from '../services/api';
import MapView from '../components/MapView';
import { Upload, MapPin, Crosshair, Sparkles, AlertTriangle, Send, Image, X } from 'lucide-react';
import './CreateReport.css';

const CATEGORIES = [
  { id: 'pothole', icon: '🕳️', color: '#dc2626' },
  { id: 'lighting', icon: '💡', color: '#f59e0b' },
  { id: 'water_leak', icon: '💧', color: '#0ea5e9' },
  { id: 'garbage', icon: '🗑️', color: '#84cc16' },
  { id: 'other', icon: '📋', color: '#8b5cf6' }
];

export default function CreateReport() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: '', neighborhood: '', isAnonymous: false
  });
  const [position, setPosition] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [step, setStep] = useState(1); // 1: info, 2: location, 3: review

  async function checkDuplicates() {
    try {
      const { data } = await reportsAPI.getAll({
        category: form.category,
        lat: position.lat,
        lng: position.lng,
        radius: 0.5 // 500 meters
      });
      if (data.success) {
        // filter active issues (not resolved, not rejected)
        const active = (data.data?.reports || []).filter(
          r => r.status !== 'resolved' && r.status !== 'rejected'
        );
        setDuplicates(active);
      }
    } catch (err) {
      console.error('Failed to fetch duplicates:', err);
    }
  }

  async function handleUpvoteDuplicate(dupId) {
    try {
      const { data } = await reportsAPI.upvote(dupId);
      if (data.success) {
        // Update local duplicates upvote count and hasUpvoted flag
        setDuplicates(prev => prev.map(d => {
          if (d.id === dupId) {
            return {
              ...d,
              upvoteCount: data.data.upvoteCount,
              hasUpvoted: data.data.upvoted
            };
          }
          return d;
        }));
      }
    } catch (err) {
      console.error('Failed to upvote duplicate:', err);
    }
  }

  async function classifyDescription() {
    try {
      const { data } = await reportsAPI.classify(form.description);
      if (data.success) {
        setAiSuggestion(data.data);
      }
    } catch { /* ignore */ }
  }

  // Auto-classify when description changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.description.length > 20) {
        classifyDescription();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [form.description]);

  // Fetch potential duplicates when position or category changes
  useEffect(() => {
    if (position && form.category) {
      checkDuplicates();
    } else {
      setDuplicates([]);
    }
  }, [position, form.category]);

  const handleLocationSelect = async (latlng) => {
    setPosition({ lat: latlng.lat, lng: latlng.lng });
    
    // Auto-fetch the address (Reverse Geocoding)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const neighborhood = addr.neighbourhood || addr.suburb || addr.village || addr.city_district || addr.town || addr.city;
        const road = addr.road || '';
        const detailedAddress = [road, neighborhood].filter(Boolean).join('، ');
        
        if (detailedAddress) {
          setForm(f => ({ ...f, neighborhood: detailedAddress }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch address details:', err);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => handleLocationSelect({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setError('Unable to detect location. Please choose on the map.'),
        { enableHighAccuracy: true }
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image too large. Maximum 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const acceptAiSuggestion = () => {
    if (aiSuggestion) {
      setForm(f => ({
        ...f,
        category: aiSuggestion.category,
        title: aiSuggestion.title || f.title
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!position) { setError('Please select a location on the map.'); return; }
    if (!form.category) { setError('Please select a category.'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('latitude', position.lat);
      formData.append('longitude', position.lng);
      formData.append('neighborhood', form.neighborhood);
      formData.append('isAnonymous', form.isAnonymous);
      if (imageFile) formData.append('image', imageFile);

      const { data } = await reportsAPI.create(formData);
      if (data.success) {
        navigate(`/reports/${data.data.report.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create report.');
    }
    setLoading(false);
  };

  return (
    <div className="create-report-page">
      <div className="container">
        <div className="create-report-layout animate-fade-in-up">
          <div className="create-report-form card-static">
            <h1 className="create-report-title">
              <Send size={22} />
              {t('report.create.title')}
            </h1>

            {/* Progress Steps */}
            <div className="steps-bar">
              {[1, 2, 3].map(s => (
                <div key={s} className={`step ${step >= s ? 'step-active' : ''} ${step === s ? 'step-current' : ''}`}>
                  <div className="step-dot">{s}</div>
                  <span className="step-label">{s === 1 ? 'Info' : s === 2 ? 'Location' : 'Review'}</span>
                </div>
              ))}
              <div className="step-line" style={{ width: `${((step - 1) / 2) * 100}%` }} />
            </div>

            {error && <div className="auth-error animate-fade-in">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Info */}
              {step === 1 && (
                <div className="form-step animate-fade-in">
                  <div className="form-group">
                    <label className="form-label">{t('report.create.description')} *</label>
                    <textarea className="form-textarea" rows={4} value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder={t('report.create.descPlaceholder')} required minLength={10} />
                  </div>

                  {/* AI Suggestion */}
                  {aiSuggestion && (
                    <div className="ai-suggestion animate-scale-in">
                      <div className="ai-suggestion-header">
                        <Sparkles size={16} /> {t('report.create.aiSuggestion')}
                      </div>
                      <div className="ai-suggestion-body">
                        <span>{t('report.create.aiSuggestCategory')}: <strong>{t(`report.categories.${aiSuggestion.category}`)}</strong></span>
                        {aiSuggestion.title && <span>Title: <strong>{aiSuggestion.title}</strong></span>}
                      </div>
                      <button type="button" className="btn btn-sm btn-primary" onClick={acceptAiSuggestion}>
                        Accept Suggestion
                      </button>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">{t('report.create.reportTitle')} *</label>
                    <input type="text" className="form-input" value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder={t('report.create.titlePlaceholder')} required minLength={3} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('report.create.category')} *</label>
                    <div className="category-picker">
                      {CATEGORIES.map(cat => (
                        <button key={cat.id} type="button"
                          className={`category-option ${form.category === cat.id ? 'selected' : ''}`}
                          style={{ '--cat-color': cat.color }}
                          onClick={() => setForm(f => ({ ...f, category: cat.id }))}>
                          <span className="category-icon">{cat.icon}</span>
                          <span>{t(`report.categories.${cat.id}`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="form-group">
                    <label className="form-label">{t('report.create.image')}</label>
                    {imagePreview ? (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button type="button" className="image-remove" onClick={removeImage}><X size={16} /></button>
                      </div>
                    ) : (
                      <label className="image-upload-area">
                        <Image size={28} />
                        <span>{t('report.create.imageHint')}</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} hidden />
                      </label>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-primary" onClick={() => {
                      if (form.description.length >= 10 && form.title.length >= 3 && form.category) setStep(2);
                      else setError('Please fill in all required fields.');
                    }}>{t('common.next')}</button>
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {step === 2 && (
                <div className="form-step animate-fade-in">
                  <div className="form-group">
                    <label className="form-label">{t('report.create.location')} *</label>
                    <p className="form-hint">{t('report.create.locationHint')}</p>
                    <div className="location-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={detectLocation}>
                        <Crosshair size={14} /> {t('report.create.detectLocation')}
                      </button>
                    </div>
                  </div>
                  <div className="create-map-wrap">
                    <MapView
                      height="350px"
                      center={position ? [position.lat, position.lng] : undefined}
                      zoom={position ? 16 : 12}
                      onMapClick={handleLocationSelect}
                      selectedPosition={position}
                      reports={[]}
                    />
                  </div>
                  {position && (
                    <p className="location-coords">
                      <MapPin size={14} /> {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                    </p>
                  )}

                  {duplicates.length > 0 && (
                    <div className="duplicates-warning animate-scale-in">
                      <div className="duplicates-warning-header">
                        <AlertTriangle size={16} />
                        <span>{t('report.create.duplicateWarning')}</span>
                      </div>
                      <p className="duplicates-warning-msg">
                        {t('report.create.duplicateMessage')}
                      </p>
                      <div className="duplicates-list">
                        {duplicates.map(dup => (
                          <div key={dup.id} className="duplicate-card">
                            <div className="duplicate-card-info">
                              <h4 className="duplicate-card-title">{dup.title}</h4>
                              <p className="duplicate-card-desc">{dup.description?.substring(0, 80)}...</p>
                              <div className="duplicate-card-meta">
                                <span className="duplicate-meta-item">👍 {dup.upvoteCount}</span>
                                <span className="duplicate-meta-item">📍 {dup.neighborhood || 'Unknown'}</span>
                                <span className="duplicate-meta-item">{t('report.detail.status')}: {t(`report.statuses.${dup.status}`)}</span>
                              </div>
                            </div>
                            <div className="duplicate-card-actions">
                              <button
                                type="button"
                                className={`btn btn-sm ${dup.hasUpvoted ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleUpvoteDuplicate(dup.id)}
                              >
                                {dup.hasUpvoted ? t('report.detail.upvoted') : t('report.detail.upvote')}
                              </button>
                              <a
                                href={`/reports/${dup.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-ghost"
                              >
                                {t('common.viewAll')}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">{t('report.create.neighborhood')}</label>
                    <input type="text" className="form-input" value={form.neighborhood}
                      onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                      placeholder={t('report.create.neighborhoodPlaceholder')} />
                  </div>

                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.isAnonymous}
                      onChange={e => setForm(f => ({ ...f, isAnonymous: e.target.checked }))} />
                    {t('report.create.anonymous')}
                  </label>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>{t('common.back')}</button>
                    <button type="button" className="btn btn-primary" onClick={() => {
                      if (position) setStep(3);
                      else setError('Please select a location.');
                    }}>{t('common.next')}</button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="form-step animate-fade-in">
                  <div className="review-summary">
                    <h3>Review Your Report</h3>
                    <div className="review-item"><strong>{t('report.create.reportTitle')}:</strong> {form.title}</div>
                    <div className="review-item"><strong>{t('report.create.category')}:</strong> {CATEGORIES.find(c => c.id === form.category)?.icon} {t(`report.categories.${form.category}`)}</div>
                    <div className="review-item"><strong>{t('report.create.description')}:</strong> {form.description.substring(0, 100)}...</div>
                    <div className="review-item"><strong>{t('report.create.location')}:</strong> {position?.lat.toFixed(4)}, {position?.lng.toFixed(4)}</div>
                    {form.neighborhood && <div className="review-item"><strong>{t('report.create.neighborhood')}:</strong> {form.neighborhood}</div>}
                    {form.isAnonymous && <div className="review-item">🔒 {t('report.create.anonymous')}</div>}
                    {imagePreview && <div className="review-image"><img src={imagePreview} alt="Preview" /></div>}
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>{t('common.back')}</button>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                      {loading ? t('report.create.submitting') : <><Send size={16} /> {t('report.create.submit')}</>}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
