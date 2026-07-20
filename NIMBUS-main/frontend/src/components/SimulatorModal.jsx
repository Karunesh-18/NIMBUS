import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Zap, TrendingDown, Users, DollarSign, Clock, Brain } from 'lucide-react';
import { WARDS, getAQICategory } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

const INTERVENTIONS = [
  { id: 'stop_construction', label: 'Stop All Construction', icon: '🏗️', reduction: 22 },
  { id: 'reduce_traffic', label: 'Reduce Traffic 50%', icon: '🚗', reduction: 18 },
  { id: 'close_industry', label: 'Close High-Risk Industries', icon: '🏭', reduction: 34 },
  { id: 'water_sprinkling', label: 'Increase Water Sprinkling', icon: '💧', reduction: 12 },
  { id: 'ban_burning', label: 'Ban Waste Burning', icon: '🔥', reduction: 9 },
  { id: 'green_cover', label: 'Increase Green Cover', icon: '🌳', reduction: 6 },
];

export default function SimulatorModal({ open, onClose, defaultWard }) {
  const [selectedWard, setSelectedWard] = useState(defaultWard?.name || WARDS[2].name);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const ward = WARDS.find(w => w.name === selectedWard) || WARDS[2];
  const intervention = INTERVENTIONS.find(i => i.id === selectedIntervention);

  const runSimulation = () => {
    if (!intervention) return;
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      const reduction = intervention.reduction;
      const afterAqi = Math.max(ward.aqi - Math.round(ward.aqi * reduction / 100), 20);
      setResult({
        before: ward.aqi,
        after: afterAqi,
        diff: ward.aqi - afterAqi,
        pct: reduction,
        beforeCat: getAQICategory(ward.aqi),
        afterCat: getAQICategory(afterAqi),
        healthImpact: Math.round(ward.population * 0.15 * reduction / 100),
        economicSavings: Math.round(ward.population * 0.8 * reduction / 100),
        timeToImprove: `${Math.round(reduction / 3)}–${Math.round(reduction / 2)} hours`,
        confidence: 87 + Math.floor(Math.random() * 8),
      });
      setRunning(false);
    }, 2200);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 800, backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 680, maxHeight: '88vh',
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 16, zIndex: 900,
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <Zap size={18} color="#7C3AED" />
                  <span style={{ fontSize: 18, fontWeight: 700 }}>What-If Simulation</span>
                  <span className="badge badge-ai">AI Powered</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Model intervention scenarios and predict AQI outcomes</div>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {/* Ward selector */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, display: 'block', marginBottom: 8 }}>SELECT WARD</label>
                <select value={selectedWard} onChange={e => { setSelectedWard(e.target.value); setResult(null); }} style={{ width: '100%' }}>
                  {WARDS.map(w => <option key={w.id} value={w.name}>{w.name} — AQI {w.aqi}</option>)}
                </select>
              </div>

              {/* Intervention selector */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, display: 'block', marginBottom: 8 }}>SELECT INTERVENTION</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {INTERVENTIONS.map(item => (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedIntervention(item.id); setResult(null); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                        background: selectedIntervention === item.id ? 'rgba(124,58,237,0.08)' : '#F8FAFC',
                        border: `1px solid ${selectedIntervention === item.id ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
                        color: 'var(--text)', fontFamily: 'var(--font)', textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: '#059669' }}>~{item.reduction}% reduction</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Run button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={runSimulation}
                disabled={!selectedIntervention || running}
                className="btn btn-purple btn-lg"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 20, opacity: (!selectedIntervention || running) ? 0.6 : 1 }}
              >
                {running ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Running AI Simulation...
                  </>
                ) : (
                  <><Play size={16} /> Run Simulation</>
                )}
              </motion.button>

              {/* Results */}
              <AnimatePresence>
                {result && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {/* Before / After */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ background: result.beforeCat.bg, border: `1px solid ${result.beforeCat.color}33`, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: result.beforeCat.color, fontWeight: 600, marginBottom: 4 }}>BEFORE</div>
                        <div style={{ fontSize: 40, fontWeight: 900, color: result.beforeCat.color }}>{result.before}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{result.beforeCat.label}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <TrendingDown size={24} color="#059669" />
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>-{result.pct}%</div>
                      </div>
                      <div style={{ background: result.afterCat.bg, border: `1px solid ${result.afterCat.color}33`, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: result.afterCat.color, fontWeight: 600, marginBottom: 4 }}>AFTER</div>
                        <div style={{ fontSize: 40, fontWeight: 900, color: result.afterCat.color }}>{result.after}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{result.afterCat.label}</div>
                      </div>
                    </div>

                    {/* Chart */}
                    <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 10, padding: '12px', marginBottom: 16, height: 120 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[{ name: 'Before', aqi: result.before }, { name: 'After', aqi: result.after }]} barSize={48}>
                          <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, fontSize: 12 }} />
                          <Bar dataKey="aqi" radius={[6, 6, 0, 0]}>
                            <Cell fill={result.beforeCat.color} />
                            <Cell fill={result.afterCat.color} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Impact metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                      {[
                        { icon: Users, label: 'People Protected', value: result.healthImpact.toLocaleString(), color: '#059669' },
                        { icon: DollarSign, label: 'Economic Savings', value: `₹${result.economicSavings.toLocaleString()}`, color: '#2563EB' },
                        { icon: Clock, label: 'Time to Improve', value: result.timeToImprove, color: '#D97706' },
                      ].map(({ icon: Icon, label, value, color }) => (
                        <div key={label} style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                          <Icon size={16} color={color} style={{ marginBottom: 4 }} />
                          <div style={{ fontSize: 13, fontWeight: 700, color }}>{value}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* AI Explanation */}
                    <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 10, padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Brain size={14} color="#7C3AED" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#7C3AED' }}>AI Analysis</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#059669', fontWeight: 600 }}>Confidence: {result.confidence}%</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                        Implementing <strong style={{ color: 'var(--text)' }}>{intervention?.label}</strong> in {selectedWard} is projected to reduce AQI by <strong style={{ color: '#059669' }}>{result.diff} points ({result.pct}%)</strong>, improving air quality from <strong style={{ color: result.beforeCat.color }}>{result.beforeCat.label}</strong> to <strong style={{ color: result.afterCat.color }}>{result.afterCat.label}</strong>. This would protect approximately <strong style={{ color: '#059669' }}>{result.healthImpact.toLocaleString()} residents</strong> within {result.timeToImprove}.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
