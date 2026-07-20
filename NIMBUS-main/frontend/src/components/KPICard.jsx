import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function useCounter(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const w = 64, h = 24;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} fillOpacity={0.1} stroke="none" />
    </svg>
  );
}

export default function KPICard({ icon: Icon, label, value, unit = '', change, trend, color, sparkData, delay = 0, onClick }) {
  const count = useCounter(typeof value === 'number' ? value : 0);
  const display = typeof value === 'number' ? count.toLocaleString() : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, boxShadow: `0 8px 32px ${color}22` }}
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '14px 16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Glow accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.6 }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} />
        </div>
        {sparkData && <Sparkline data={sparkData} color={color} />}
      </div>

      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1, marginBottom: 4 }}>
        {display}{unit && <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 2 }}>{unit}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 500 }}>{label}</div>
        {change !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 600, color: trend === 'up' ? '#EF4444' : trend === 'down' ? '#10B981' : 'var(--text-dim)' }}>
            {trend === 'up' ? <TrendingUp size={11} /> : trend === 'down' ? <TrendingDown size={11} /> : <Minus size={11} />}
            {change}%
          </div>
        )}
      </div>
    </motion.div>
  );
}
