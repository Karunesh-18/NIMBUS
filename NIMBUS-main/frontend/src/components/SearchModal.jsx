import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Factory, Building2, User, AlertTriangle } from 'lucide-react';
import { WARDS, getAQICategory } from '../data/mockData';

const QUICK = [
  { icon: AlertTriangle, label: 'Hebbal — AQI 234 (Severe)', type: 'ward', color: '#DC2626' },
  { icon: AlertTriangle, label: 'Electronic City — AQI 201 (Severe)', type: 'ward', color: '#DC2626' },
  { icon: Factory, label: 'Sunrise Chemicals — Violation Active', type: 'industry', color: '#EA580C' },
  { icon: Building2, label: 'BuildRight Contractors — Notice Issued', type: 'construction', color: '#D97706' },
  { icon: User, label: 'Insp. Ramesh Kumar — 2 Active Cases', type: 'officer', color: '#2563EB' },
];

export default function SearchModal({ open, onClose, onWardSelect }) {
  const [query, setQuery] = useState('');

  const filtered = query.length > 1
    ? WARDS.filter(w => w.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000, backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
              width: 560, background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 16, zIndex: 1001, overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <Search size={18} color="var(--text-dim)" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search wards, industries, officers, violations..."
                style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 15, color: 'var(--text)', outline: 'none', padding: 0 }}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
                  <X size={16} />
                </button>
              )}
              <kbd style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', fontSize: 11, color: 'var(--text-dim)' }}>ESC</kbd>
            </div>

            <div style={{ padding: '12px', maxHeight: 400, overflowY: 'auto' }}>
              {filtered.length > 0 ? (
                <>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, padding: '0 8px', marginBottom: 6 }}>WARDS</div>
                  {filtered.map(ward => {
                    const cat = getAQICategory(ward.aqi);
                    return (
                      <motion.div
                        key={ward.id}
                        whileHover={{ background: 'rgba(0,0,0,0.03)' }}
                        onClick={() => { onWardSelect(ward); onClose(); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, cursor: 'pointer' }}
                      >
                        <MapPin size={16} color={cat.color} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{ward.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Population: {ward.population.toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: cat.color }}>{ward.aqi}</div>
                          <div className={`badge badge-${cat.badgeClass?.replace('badge-', '')}`} style={{ fontSize: 10 }}>{cat.label}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </>
              ) : (
                <>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, padding: '0 8px', marginBottom: 6 }}>QUICK ACCESS</div>
                  {QUICK.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ background: 'rgba(0,0,0,0.03)' }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, cursor: 'pointer' }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={15} color={item.color} />
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: 4 }}>{item.type}</span>
                      </motion.div>
                    );
                  })}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
