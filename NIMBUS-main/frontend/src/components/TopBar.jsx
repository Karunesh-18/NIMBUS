import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Wind, Thermometer, Droplets, Wifi } from 'lucide-react';
import { NOTIFICATIONS } from '../data/mockData';

export default function TopBar({ onNotifOpen, onSearchOpen }) {
  const [time, setTime] = useState(new Date());
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const fmtDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{
      height: 'var(--topbar-h)',
      background: '#FFFFFF',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px 0 80px',
      gap: 12,
      position: 'relative',
      zIndex: 100,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(124,58,237,0.25)',
          flexShrink: 0,
        }}>
          <Wind size={16} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 2, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VAYU</div>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, marginTop: -2 }}>AIR INTELLIGENCE</div>
        </div>
      </div>

      {/* Search */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        onClick={onSearchOpen}
        style={{
          flex: 1, maxWidth: 360, height: 34,
          background: '#F8FAFC',
          border: '1px solid var(--border)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0 12px', cursor: 'pointer', color: 'var(--text-dim)',
          fontSize: 13,
        }}
      >
        <Search size={14} />
        <span>Search wards, industries, officers...</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, background: 'rgba(0,0,0,0.06)', padding: '1px 6px', borderRadius: 4, color: 'var(--text-dim)' }}>⌘K</span>
      </motion.button>

      <div style={{ flex: 1 }} />

      {/* Weather Summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
          <Thermometer size={13} color="#EA580C" />
          <span>28°C</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
          <Droplets size={13} color="#2563EB" />
          <span>62%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
          <Wind size={13} color="#0891B2" />
          <span>NE 12</span>
        </div>
      </div>

      {/* Time */}
      <div style={{ textAlign: 'right', minWidth: 120 }}>
        <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{fmt(time)}</div>
        <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{fmtDate(time)}</div>
      </div>

      {/* AI Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', animation: 'pulse-dot 2s infinite' }} />
        <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600 }}>AI ONLINE</span>
      </div>

      {/* Live */}
      <div style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Wifi size={12} color="#059669" />
        <span>Live</span>
      </div>

      {/* Notifications */}
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={onNotifOpen}
        style={{ position: 'relative', background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: '#DC2626', borderRadius: '50%', fontSize: 9, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
            {unread}
          </div>
        )}
      </motion.button>

      {/* Profile */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'white' }}
      >
        GC
      </motion.div>
    </div>
  );
}
