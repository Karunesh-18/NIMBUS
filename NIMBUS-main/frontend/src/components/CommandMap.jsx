import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { WARDS, getAQICategory } from '../data/mockData';
import { Navigation, ZoomIn, ZoomOut } from 'lucide-react';

export default function CommandMap({ onWardSelect, focusWard }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const circlesRef = useRef([]);
  const [activeLayer, setActiveLayer] = useState('heatmap');

  useEffect(() => {
    if (mapInstanceRef.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [12.9716, 77.5946],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
    mapInstanceRef.current = map;

    WARDS.forEach(ward => {
      const cat = getAQICategory(ward.aqi);

      const circle = L.circle([ward.lat, ward.lng], {
        radius: 2200,
        color: cat.color,
        fillColor: cat.color,
        fillOpacity: 0.2,
        weight: 1.5,
        opacity: 0.6,
      }).addTo(map);

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            background: ${cat.color};
            color: white;
            border-radius: 8px;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: 700;
            font-family: Inter, sans-serif;
            box-shadow: 0 4px 12px ${cat.color}55;
            border: 1.5px solid rgba(255,255,255,0.4);
            white-space: nowrap;
            cursor: pointer;
            position: relative;
          ">
            ${ward.aqi}
            <div style="
              position: absolute;
              bottom: -5px;
              left: 50%;
              transform: translateX(-50%);
              width: 0; height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 5px solid ${cat.color};
            "></div>
          </div>
        `,
        iconAnchor: [20, 28],
      });

      const marker = L.marker([ward.lat, ward.lng], { icon })
        .addTo(map)
        .on('click', () => onWardSelect(ward));

      marker.bindPopup(`
        <div style="min-width:200px; padding:4px;">
          <div style="font-size:15px; font-weight:700; color:#0F172A; margin-bottom:6px;">${ward.name}</div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span style="font-size:24px; font-weight:800; color:${cat.color};">${ward.aqi}</span>
            <span style="background:${cat.bg}; color:${cat.color}; padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600;">${cat.label}</span>
          </div>
          <div style="font-size:12px; color:#475569;">PM2.5: ${ward.pm25} μg/m³ &nbsp;|&nbsp; PM10: ${ward.pm10} μg/m³</div>
          <div style="font-size:12px; color:#475569; margin-top:4px;">Pop: ${ward.population.toLocaleString()} &nbsp;|&nbsp; Risk: ${ward.risk}</div>
          <div style="font-size:11px; color:#94A3B8; margin-top:6px;">Primary: ${ward.primarySource}</div>
        </div>
      `, { maxWidth: 260 });

      markersRef.current.push(marker);
      circlesRef.current.push(circle);
    });

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !focusWard) return;
    const ward = WARDS.find(w => w.id === focusWard || w.name === focusWard);
    if (ward) mapInstanceRef.current.flyTo([ward.lat, ward.lng], 14, { duration: 1.5 });
  }, [focusWard]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => mapInstanceRef.current?.flyTo([12.9716, 77.5946], 11, { duration: 1 });

  const overlayStyle = {
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Map Controls */}
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 1000 }}>
        {[
          { icon: ZoomIn, action: handleZoomIn, title: 'Zoom In' },
          { icon: ZoomOut, action: handleZoomOut, title: 'Zoom Out' },
          { icon: Navigation, action: handleReset, title: 'Reset View' },
        ].map(({ icon: Icon, action, title }) => (
          <motion.button
            key={title}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action}
            title={title}
            style={{
              width: 34, height: 34,
              ...overlayStyle,
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            <Icon size={15} />
          </motion.button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 12, left: 12, ...overlayStyle, borderRadius: 10, padding: '10px 14px', zIndex: 1000 }}>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>AQI LEGEND</div>
        {[
          { label: 'Good (0-50)', color: '#059669' },
          { label: 'Moderate (51-150)', color: '#D97706' },
          { label: 'Poor (151-200)', color: '#EA580C' },
          { label: 'Severe (201-300)', color: '#DC2626' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Layer selector */}
      <div style={{ position: 'absolute', bottom: 12, right: 12, ...overlayStyle, borderRadius: 10, padding: '8px', zIndex: 1000, display: 'flex', gap: 4 }}>
        {['heatmap', 'traffic', 'industrial'].map(layer => (
          <button
            key={layer}
            onClick={() => setActiveLayer(layer)}
            style={{
              padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 600,
              background: activeLayer === layer ? 'rgba(37,99,235,0.12)' : 'transparent',
              color: activeLayer === layer ? '#2563EB' : 'var(--text-dim)',
              textTransform: 'capitalize', fontFamily: 'var(--font)',
            }}
          >
            {layer}
          </button>
        ))}
      </div>

      {/* Live indicator */}
      <div style={{ position: 'absolute', top: 12, left: 12, ...overlayStyle, borderRadius: 8, padding: '6px 12px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', animation: 'pulse-dot 2s infinite' }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>LIVE · Bengaluru</span>
      </div>
    </div>
  );
}
