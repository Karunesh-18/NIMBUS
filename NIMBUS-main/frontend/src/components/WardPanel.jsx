import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, Thermometer, Droplets, Users, Factory, Car, Brain, Play, MessageSquare, Shield, TrendingDown } from 'lucide-react';
import { getAQICategory } from '../data/mockData';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const FORECAST = [
  { h: 'Now', aqi: 0 }, { h: '+2h', aqi: 5 }, { h: '+4h', aqi: 8 }, { h: '+6h', aqi: 12 },
  { h: '+8h', aqi: 6 }, { h: '+10h', aqi: -4 }, { h: '+12h', aqi: -8 },
];

function PollutantBar({ label, value, max, color }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color }}>{value} μg/m³</span>
      </div>
      <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ height: '100%', background: color, borderRadius: 2 }}
        />
      </div>
    </div>
  );
}

export default function WardPanel({ ward, onClose, onAskAI, onSimulate, onAdvisory, onEnforce }) {
  if (!ward) return null;
  const cat = getAQICategory(ward.aqi);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{
          position: 'fixed',
          right: 0,
          top: 'var(--topbar-h)',
          bottom: 0,
          width: 380,
          background: '#FFFFFF',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.1)',
          zIndex: 500,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{ward.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Bengaluru Urban District</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          {/* AQI Hero */}
          <div style={{ background: `${cat.bg}`, border: `1px solid ${cat.color}33`, borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: cat.color, lineHeight: 1 }}>{ward.aqi}</div>
              <div style={{ fontSize: 11, color: cat.color, fontWeight: 600, marginTop: 2 }}>AQI INDEX</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className={`badge badge-${cat.badgeClass?.replace('badge-', '')}`} style={{ marginBottom: 6 }}>{cat.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Risk Level: <span style={{ color: ward.risk === 'Critical' ? '#DC2626' : ward.risk === 'High' ? '#EA580C' : '#D97706', fontWeight: 600 }}>{ward.risk}</span></div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Vulnerability: <span style={{ color: cat.color, fontWeight: 600 }}>{ward.vulnerabilityScore}/100</span></div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px', flex: 1 }}>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { icon: Users, label: 'Population', value: ward.population.toLocaleString(), color: '#2563EB' },
              { icon: Thermometer, label: 'Temperature', value: `${ward.temp}°C`, color: '#EA580C' },
              { icon: Droplets, label: 'Humidity', value: `${ward.humidity}%`, color: '#0891B2' },
              { icon: Wind, label: 'Wind', value: ward.wind, color: '#7C3AED' },
              { icon: Factory, label: 'Industries', value: ward.industry, color: '#DC2626' },
              { icon: Car, label: 'Traffic', value: ward.traffic, color: '#D97706' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Icon size={12} color={color} />
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600 }}>{label.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Pollutants */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>POLLUTANT LEVELS</div>
            <PollutantBar label="PM2.5" value={ward.pm25} max={200} color="#DC2626" />
            <PollutantBar label="PM10" value={ward.pm10} max={300} color="#EA580C" />
            <PollutantBar label="NO₂" value={ward.no2} max={150} color="#D97706" />
            <PollutantBar label="SO₂" value={ward.so2} max={80} color="#7C3AED" />
            <PollutantBar label="O₃" value={ward.o3} max={100} color="#0891B2" />
          </div>

          {/* Sources */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>POLLUTION SOURCES</div>
            <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 8, padding: '8px 12px', marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: '#DC2626', fontWeight: 600, marginBottom: 2 }}>PRIMARY SOURCE</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{ward.primarySource}</div>
            </div>
            <div style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.15)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 10, color: '#D97706', fontWeight: 600, marginBottom: 2 }}>SECONDARY SOURCE</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{ward.secondarySource}</div>
            </div>
          </div>

          {/* Forecast mini chart */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>AQI FORECAST (12H)</div>
            <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 8, padding: '8px', height: 80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={FORECAST.map(f => ({ ...f, aqi: ward.aqi + f.aqi }))}>
                  <defs>
                    <linearGradient id="fcGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={cat.color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={cat.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="aqi" stroke={cat.color} strokeWidth={2} fill="url(#fcGrad)" dot={false} />
                  <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, fontSize: 11 }} labelStyle={{ color: '#64748B' }} itemStyle={{ color: cat.color }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button className="btn btn-purple btn-sm" onClick={() => onAskAI(ward)} style={{ justifyContent: 'center' }}>
              <Brain size={13} /> Ask AI
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onSimulate(ward)} style={{ justifyContent: 'center' }}>
              <Play size={13} /> Simulate
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => onAdvisory(ward)} style={{ justifyContent: 'center' }}>
              <MessageSquare size={13} /> Advisory
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onEnforce(ward)} style={{ justifyContent: 'center' }}>
              <Shield size={13} /> Enforce
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
