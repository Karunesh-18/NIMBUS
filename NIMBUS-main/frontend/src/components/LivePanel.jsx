import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LIVE_ALERTS } from '../data/mockData';
import { RefreshCw } from 'lucide-react';

const TYPE_COLORS = {
  critical: '#DC2626',
  ai: '#7C3AED',
  weather: '#0891B2',
  enforcement: '#D97706',
  advisory: '#2563EB',
  simulation: '#059669',
  info: '#64748B',
};

export default function LivePanel({ onWardFocus }) {
  const [alerts] = useState(LIVE_ALERTS);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#FFFFFF',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.div
            animate={{ scale: pulse ? 1.3 : 1 }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626' }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: 'var(--text)' }}>LIVE ACTIVITY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Auto-refresh</span>
          <RefreshCw size={11} color="var(--text-dim)" style={{ animation: 'spin 3s linear infinite' }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        <AnimatePresence>
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 2, background: 'rgba(0,0,0,0.03)' }}
              onClick={() => onWardFocus && onWardFocus(alert.ward)}
              style={{
                display: 'flex',
                gap: 10,
                padding: '10px 8px',
                borderRadius: 8,
                cursor: 'pointer',
                borderLeft: `2px solid ${TYPE_COLORS[alert.type] || '#64748B'}`,
                marginBottom: 4,
                transition: 'background 0.15s',
              }}
            >
              <div style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{alert.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{alert.title}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', flexShrink: 0, marginLeft: 4 }}>{alert.time}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{alert.message}</div>
                <div style={{ fontSize: 10, color: TYPE_COLORS[alert.type], marginTop: 3, fontWeight: 500 }}>{alert.ward}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
