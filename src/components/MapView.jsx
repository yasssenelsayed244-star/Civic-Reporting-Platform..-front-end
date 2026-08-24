import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Crosshair } from 'lucide-react';
import L from 'leaflet';
import StatusBadge from './StatusBadge';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CATEGORY_COLORS = {
  pothole: '#dc2626',
  lighting: '#f59e0b',
  broken_streetlight: '#f59e0b',
  water_leak: '#0ea5e9',
  garbage: '#84cc16',
  damaged_sidewalk: '#78716c',
  sewage: '#14b8a6',
  traffic_sign: '#fbbf24',
  other: '#8b5cf6'
};

const CATEGORY_ICONS = {
  pothole: '🕳️',
  lighting: '💡',
  broken_streetlight: '💡',
  water_leak: '💧',
  garbage: '🗑️',
  damaged_sidewalk: '🧱',
  sewage: '🌊',
  traffic_sign: '🛑',
  other: '📋'
};

function createCategoryIcon(category) {
  const color = CATEGORY_COLORS[category] || '#8b5cf6';
  return L.divIcon({
    className: '!bg-transparent !border-none',
    html: `<div style="
      width: 32px; height: 32px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s ease;
    "><span style="transform:rotate(45deg);font-size:14px">${CATEGORY_ICONS[category] || '📋'}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

// Light & Dark tile layers
const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
};

function ThemeAwareTiles() {
  const [isDark, setIsDark] = useState(document.documentElement.getAttribute('data-theme') === 'dark');

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <TileLayer
      attribution='&copy; <a href="https://carto.com/">Carto</a>'
      url={isDark ? TILES.dark : TILES.light}
    />
  );
}

// Component to fly to location
function FlyToLocation({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 13, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

function LocateControl({ onLocationDetected }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!navigator.geolocation) return;
    
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        map.flyTo(latlng, 18);
        if (onLocationDetected) {
          onLocationDetected({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }
        setLocating(false);
      },
      (err) => {
        console.error('Location error:', err);
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: '20px', marginRight: '10px' }}>
      <div className="leaflet-control leaflet-bar border-none shadow-md rounded-lg overflow-hidden">
        <a 
          href="#"
          onClick={handleLocate}
          title="Detect My Location"
          className="w-9 h-9 flex items-center justify-center bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors"
          style={{ color: locating ? 'var(--primary)' : 'var(--text-secondary)' }}
        >
          <Crosshair size={18} className={locating ? 'animate-pulse' : ''} />
        </a>
      </div>
    </div>
  );
}

export default function MapView({ reports = [], center, zoom = 12, height = '500px', onMapClick, interactive = true, selectedPosition }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const defaultCenter = center || [30.0444, 31.2357]; // Cairo default

  function MapClickHandler() {
    const map = useMap();
    useEffect(() => {
      if (!onMapClick) return;
      const handler = (e) => onMapClick(e.latlng);
      map.on('click', handler);
      return () => map.off('click', handler);
    }, [map]);
    return null;
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-inner border border-[var(--border-default)]" style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
      >
        <ThemeAwareTiles />
        {onMapClick && <MapClickHandler />}
        {center && <FlyToLocation center={center} zoom={zoom} />}
        {interactive && <LocateControl onLocationDetected={onMapClick} />}

        {/* Report markers */}
        {reports.map(report => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createCategoryIcon(report.category)}
            eventHandlers={{
              click: () => navigate(`/reports/${report.id}`)
            }}
          >
            <Popup className="custom-popup">
              <div className="flex flex-col gap-1.5 min-w-[180px] font-sans">
                <h4 className="text-sm font-bold text-gray-900 m-0 leading-tight">{report.title}</h4>
                <div className="mt-1">
                  <StatusBadge status={report.status} size="sm" />
                </div>
                <p className="text-xs text-gray-600 m-0 leading-relaxed line-clamp-2 mt-1">
                  {report.description}
                </p>
                <span className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                  {CATEGORY_ICONS[report.category]} {t(`report.categories.${report.category}`)}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Selected position marker (for create report) */}
        {selectedPosition && (
          <Marker position={[selectedPosition.lat, selectedPosition.lng]}>
            <Popup>{t('report.create.locationHint')}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
