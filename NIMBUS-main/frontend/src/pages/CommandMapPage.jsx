import { useState } from 'react';
import { motion } from 'framer-motion';
import CommandMap from '../components/CommandMap';
import WardPanel from '../components/WardPanel';
import SimulatorModal from '../components/SimulatorModal';
import { WARDS, getAQICategory } from '../data/mockData';
import { Map } from 'lucide-react';

export default function CommandMapPage({ onAIOpen, onPageChange }) {
  const [selectedWard, setSelectedWard] = useState(null);
  const [focusWard, setFocusWard] = useState(null);
  const [simOpen, setSimOpen] = useState(false);
  const [simWard, setSimWard] = useState(null);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 12, gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Map size={16} color="#3B82F6" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Command Map</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Live AQI · 10 wards · 47 sensors</div>
          </div>
        </div>
        {/* Ward quick-select */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {WARDS.slice(0, 5).map(w => {
            const cat = getAQICategory(w.aqi);
            return (
              <motion.button
                key={w.id}
                whileHover={{ scale: 1.03 }}
                onClick={() => { setFocusWard(w.id); setSelectedWard(w); }}
                style={{
                  padding: '4px 10px', borderRadius: 20, border: `1px solid ${cat.color}44`,
                  background: `${cat.bg}`, color: cat.color, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}
              >
                {w.name} · {w.aqi}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Full map */}
      <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', minHeight: 0 }}>
        <CommandMap onWardSelect={setSelectedWard} focusWard={focusWard} />
      </div>

      {selectedWard && (
        <WardPanel
          ward={selectedWard}
          onClose={() => setSelectedWard(null)}
          onAskAI={(w) => onAIOpen(`Tell me about air quality in ${w.name}`)}
          onSimulate={(w) => { setSimWard(w); setSimOpen(true); }}
          onAdvisory={() => onPageChange('advisory')}
          onEnforce={() => onPageChange('enforcement')}
        />
      )}

      <SimulatorModal open={simOpen} onClose={() => setSimOpen(false)} defaultWard={simWard} />
    </div>
  );
}
