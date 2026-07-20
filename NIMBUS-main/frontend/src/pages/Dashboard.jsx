import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Users, Activity, Factory, Building2, Shield, MessageSquare, Target, Zap } from 'lucide-react';
import KPICard from '../components/KPICard';
import CommandMap from '../components/CommandMap';
import WardPanel from '../components/WardPanel';
import LivePanel from '../components/LivePanel';
import SimulatorModal from '../components/SimulatorModal';
import { WARDS } from '../data/mockData';

const SPARK = [120, 135, 128, 142, 156, 148, 162, 158, 171, 168, 178, 187];
const SPARK2 = [210, 225, 218, 234, 228, 241, 234, 238, 231, 242, 238, 234];
const SPARK3 = [67, 72, 69, 74, 71, 68, 65, 70, 67, 64, 68, 67];

export default function Dashboard({ onAIOpen, onPageChange }) {
  const [selectedWard, setSelectedWard] = useState(null);
  const [focusWard, setFocusWard] = useState(null);
  const [simOpen, setSimOpen] = useState(false);
  const [simWard, setSimWard] = useState(null);

  const handleWardFocus = (wardName) => {
    const w = WARDS.find(w => w.name === wardName);
    if (w) { setFocusWard(w.id); setSelectedWard(w); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 12, overflow: 'hidden' }}>
      {/* KPI Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, flexShrink: 0 }}>
        <KPICard icon={Activity} label="City Avg AQI" value={158} change={12} trend="up" color="#EA580C" sparkData={SPARK} delay={0} />
        <KPICard icon={AlertTriangle} label="Critical Alerts" value={3} change={50} trend="up" color="#DC2626" sparkData={[1,2,1,3,2,3,3]} delay={0.05} />
        <KPICard icon={Users} label="Population at Risk" value={421000} change={8} trend="up" color="#7C3AED" sparkData={[380,390,395,400,408,415,421].map(v=>v/1000)} delay={0.1} />
        <KPICard icon={Target} label="Prediction Accuracy" value={94} unit="%" change={2} trend="down" color="#059669" sparkData={[91,92,93,92,94,93,94]} delay={0.15} />
        <KPICard icon={Factory} label="Industries Monitored" value={57} color="#0891B2" sparkData={[50,52,53,55,55,56,57]} delay={0.2} />
      </div>

      {/* KPI Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, flexShrink: 0 }}>
        <KPICard icon={TrendingUp} label="Highest AQI Ward" value={234} change={18} trend="up" color="#DC2626" sparkData={SPARK2} delay={0.05} onClick={() => handleWardFocus('Hebbal')} />
        <KPICard icon={Zap} label="Lowest AQI Ward" value={67} change={3} trend="down" color="#059669" sparkData={SPARK3} delay={0.1} onClick={() => handleWardFocus('Jayanagar')} />
        <KPICard icon={Building2} label="Construction Sites" value={51} change={6} trend="up" color="#D97706" sparkData={[44,46,47,48,49,50,51]} delay={0.15} />
        <KPICard icon={Shield} label="Enforcement Cases" value={7} change={40} trend="up" color="#EA580C" sparkData={[3,4,4,5,5,6,7]} delay={0.2} onClick={() => onPageChange('enforcement')} />
        <KPICard icon={MessageSquare} label="Advisories Sent" value={12} color="#2563EB" sparkData={[5,6,7,8,9,10,12]} delay={0.25} onClick={() => onPageChange('advisory')} />
      </div>

      {/* Map + Live Panel */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12, minHeight: 0 }}>
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <CommandMap onWardSelect={setSelectedWard} focusWard={focusWard} />

          {/* AI Insight floating card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 12,
              padding: '10px 16px', zIndex: 500, minWidth: 320,
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={14} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600 }}>AI INSIGHT</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hebbal AQI rising — industrial emissions up 31% since 8 AM</div>
              </div>
              <button onClick={() => onAIOpen("Why is AQI increasing in Hebbal?")} className="btn btn-purple btn-sm" style={{ fontSize: 11 }}>
                Ask AI
              </button>
            </div>
          </motion.div>
        </div>

        <LivePanel onWardFocus={handleWardFocus} />
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
