import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Map, Bell, Globe, Accessibility, User, Shield, Activity, ChevronRight, Check } from 'lucide-react';

function SettingRow({ label, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: value ? '#3B82F6' : 'rgba(255,255,255,0.1)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2 }}
      />
    </motion.button>
  );
}

const SECTIONS = [
  { id: 'theme', icon: Moon, label: 'Appearance' },
  { id: 'map', icon: Map, label: 'Map Settings' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'language', icon: Globe, label: 'Language' },
  { id: 'account', icon: User, label: 'Account' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'api', icon: Activity, label: 'API Status' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('theme');
  const [settings, setSettings] = useState({
    darkMode: true,
    animations: true,
    glassmorphism: true,
    highContrast: false,
    mapStyle: 'dark',
    show3D: true,
    showHeatmap: true,
    showTraffic: true,
    refreshRate: '30',
    criticalAlerts: true,
    aiInsights: true,
    enforcementUpdates: true,
    weatherAlerts: true,
    language: 'en',
    twoFactor: false,
    sessionTimeout: '60',
  });

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const API_STATUS = [
    { name: 'CPCB Sensor Network', status: 'online', latency: '42ms', uptime: '99.8%' },
    { name: 'Weather API (IMD)', status: 'online', latency: '128ms', uptime: '99.2%' },
    { name: 'Satellite Data (Sentinel-5P)', status: 'online', latency: '340ms', uptime: '98.7%' },
    { name: 'AI Prediction Engine', status: 'online', latency: '89ms', uptime: '99.9%' },
    { name: 'Industrial Permit DB', status: 'degraded', latency: '890ms', uptime: '97.1%' },
    { name: 'Traffic Data API', status: 'online', latency: '156ms', uptime: '99.4%' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'theme':
        return (
          <div>
            <SettingRow label="Dark Mode" desc="Premium dark theme optimized for command centers">
              <Toggle value={settings.darkMode} onChange={v => set('darkMode', v)} />
            </SettingRow>
            <SettingRow label="Animations" desc="Framer Motion micro-interactions and transitions">
              <Toggle value={settings.animations} onChange={v => set('animations', v)} />
            </SettingRow>
            <SettingRow label="Glassmorphism" desc="Frosted glass effect on panels and cards">
              <Toggle value={settings.glassmorphism} onChange={v => set('glassmorphism', v)} />
            </SettingRow>
            <SettingRow label="High Contrast" desc="Increase contrast for accessibility">
              <Toggle value={settings.highContrast} onChange={v => set('highContrast', v)} />
            </SettingRow>
          </div>
        );
      case 'map':
        return (
          <div>
            <SettingRow label="Map Style" desc="Base map visual style">
              <select value={settings.mapStyle} onChange={e => set('mapStyle', e.target.value)} style={{ minWidth: 120 }}>
                <option value="dark">Dark</option>
                <option value="satellite">Satellite</option>
                <option value="terrain">Terrain</option>
              </select>
            </SettingRow>
            <SettingRow label="3D Buildings" desc="Show 3D building extrusions on map">
              <Toggle value={settings.show3D} onChange={v => set('show3D', v)} />
            </SettingRow>
            <SettingRow label="AQI Heatmap" desc="Show color-coded AQI heatmap overlay">
              <Toggle value={settings.showHeatmap} onChange={v => set('showHeatmap', v)} />
            </SettingRow>
            <SettingRow label="Traffic Layer" desc="Show real-time traffic congestion">
              <Toggle value={settings.showTraffic} onChange={v => set('showTraffic', v)} />
            </SettingRow>
            <SettingRow label="Data Refresh Rate" desc="How often to fetch new sensor data">
              <select value={settings.refreshRate} onChange={e => set('refreshRate', e.target.value)} style={{ minWidth: 120 }}>
                <option value="10">10 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
              </select>
            </SettingRow>
          </div>
        );
      case 'notifications':
        return (
          <div>
            <SettingRow label="Critical AQI Alerts" desc="Notify when AQI exceeds severe threshold">
              <Toggle value={settings.criticalAlerts} onChange={v => set('criticalAlerts', v)} />
            </SettingRow>
            <SettingRow label="AI Insights" desc="Receive AI-generated predictions and recommendations">
              <Toggle value={settings.aiInsights} onChange={v => set('aiInsights', v)} />
            </SettingRow>
            <SettingRow label="Enforcement Updates" desc="Case status changes and new violations">
              <Toggle value={settings.enforcementUpdates} onChange={v => set('enforcementUpdates', v)} />
            </SettingRow>
            <SettingRow label="Weather Alerts" desc="Meteorological changes affecting air quality">
              <Toggle value={settings.weatherAlerts} onChange={v => set('weatherAlerts', v)} />
            </SettingRow>
          </div>
        );
      case 'api':
        return (
          <div>
            {API_STATUS.map((api, i) => (
              <motion.div
                key={api.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: api.status === 'online' ? '#10B981' : '#F59E0B', animation: 'pulse-dot 2s infinite' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{api.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Uptime: {api.uptime}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: api.status === 'online' ? '#10B981' : '#F59E0B', fontWeight: 600 }}>{api.latency}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'capitalize' }}>{api.status}</div>
                </div>
              </motion.div>
            ))}
          </div>
        );
      default:
        return (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-dim)' }}>
            <Settings size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
            <div>Settings for this section coming soon</div>
          </div>
        );
    }
  };

  return (
    <div style={{ padding: 20, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(100,116,139,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={18} color="#94A3B8" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>Configure VAYU platform preferences</p>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, flex: 1 }}>
        {/* Sidebar */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px', height: 'fit-content' }}>
          {SECTIONS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: activeSection === id ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: activeSection === id ? '#60A5FA' : 'var(--text-muted)',
                fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500,
                marginBottom: 2, textAlign: 'left',
              }}
            >
              <Icon size={15} />
              {label}
              {activeSection === id && <ChevronRight size={13} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            {SECTIONS.find(s => s.id === activeSection)?.label}
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
