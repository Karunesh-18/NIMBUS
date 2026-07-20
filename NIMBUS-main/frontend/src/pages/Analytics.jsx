import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AQI_HISTORY, POLLUTION_SOURCES, MONTHLY_AQI, WARDS } from '../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <div style={{ color: '#64748B', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

function ChartCard({ title, subtitle, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </motion.div>
  );
}

export default function Analytics() {
  const wardBarData = WARDS.map(w => ({ name: w.name.split(' ')[0], aqi: w.aqi, pm25: w.pm25 }));

  return (
    <div style={{ padding: 20, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart3 size={18} color="#2563EB" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Analytics</h1>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>Enterprise air quality intelligence dashboard</p>
        </div>
      </motion.div>

      {/* Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <ChartCard title="24-Hour AQI Trend" subtitle="All major wards — real-time sensor data" delay={0.05}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={AQI_HISTORY}>
              <defs>
                {[
                  { id: 'hebbal', color: '#DC2626' },
                  { id: 'electronic', color: '#EA580C' },
                  { id: 'koramangala', color: '#D97706' },
                  { id: 'btm', color: '#7C3AED' },
                  { id: 'whitefield', color: '#2563EB' },
                ].map(({ id, color }) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#64748B' }} />
              <Area type="monotone" dataKey="hebbal" name="Hebbal" stroke="#DC2626" strokeWidth={2} fill="url(#hebbal)" dot={false} />
              <Area type="monotone" dataKey="electronic" name="Electronic City" stroke="#EA580C" strokeWidth={2} fill="url(#electronic)" dot={false} />
              <Area type="monotone" dataKey="koramangala" name="Koramangala" stroke="#D97706" strokeWidth={2} fill="url(#koramangala)" dot={false} />
              <Area type="monotone" dataKey="btm" name="BTM Layout" stroke="#7C3AED" strokeWidth={2} fill="url(#btm)" dot={false} />
              <Area type="monotone" dataKey="whitefield" name="Whitefield" stroke="#2563EB" strokeWidth={2} fill="url(#whitefield)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pollution Sources" subtitle="Contribution breakdown" delay={0.1}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={POLLUTION_SOURCES} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {POLLUTION_SOURCES.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {POLLUTION_SOURCES.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.name}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ChartCard title="Ward AQI Comparison" subtitle="Current readings across all wards" delay={0.15}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={wardBarData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="aqi" name="AQI" radius={[4, 4, 0, 0]}>
                {wardBarData.map((entry, i) => (
                  <Cell key={i} fill={entry.aqi >= 200 ? '#DC2626' : entry.aqi >= 150 ? '#EA580C' : entry.aqi >= 100 ? '#D97706' : '#059669'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly AQI Trend" subtitle="6-month historical average, min, max" delay={0.2}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_AQI} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#64748B' }} />
              <Bar dataKey="max" name="Max AQI" fill="#DC2626" radius={[3, 3, 0, 0]} opacity={0.7} />
              <Bar dataKey="avg" name="Avg AQI" fill="#D97706" radius={[3, 3, 0, 0]} />
              <Bar dataKey="min" name="Min AQI" fill="#059669" radius={[3, 3, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3 */}
      <ChartCard title="PM2.5 Levels by Ward" subtitle="Particulate matter 2.5 μg/m³ — WHO safe limit: 15 μg/m³" delay={0.25}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={wardBarData} layout="vertical" barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pm25" name="PM2.5 (μg/m³)" radius={[0, 4, 4, 0]}>
              {wardBarData.map((entry, i) => (
                <Cell key={i} fill={entry.pm25 >= 100 ? '#DC2626' : entry.pm25 >= 60 ? '#EA580C' : entry.pm25 >= 35 ? '#D97706' : '#059669'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
