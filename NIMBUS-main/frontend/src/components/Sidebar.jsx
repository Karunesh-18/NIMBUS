import { motion } from 'framer-motion';
import { LayoutDashboard, Map, Shield, MessageSquare, BarChart3, FileText, Bot, Settings, HelpCircle, Wind } from 'lucide-react';

const NAV = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'map', icon: Map, label: 'Command Map' },
  { id: 'enforcement', icon: Shield, label: 'Enforcement' },
  { id: 'advisory', icon: MessageSquare, label: 'Advisory' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'reports', icon: FileText, label: 'Reports' },
  { id: 'ai', icon: Bot, label: 'AI Assistant' },
];

const BOTTOM_NAV = [
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'help', icon: HelpCircle, label: 'Help' },
];

export default function Sidebar({ active, onChange }) {
  return (
    <div style={{
      width: 'var(--sidebar-w)',
      background: '#FFFFFF',
      borderRight: '1px solid var(--border)',
      boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px 0',
      gap: 2,
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 200,
    }}>
      {/* Logo mark */}
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, boxShadow: '0 4px 12px rgba(124,58,237,0.25)', flexShrink: 0 }}>
        <Wind size={18} color="white" />
      </div>

      <div style={{ width: '100%', height: 1, background: 'var(--border)', margin: '4px 0' }} />

      {/* Main nav */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, width: '100%', padding: '0 8px' }}>
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(item.id)}
              title={item.label}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? 'rgba(37,99,235,0.1)' : 'transparent',
                color: isActive ? '#2563EB' : '#94A3B8',
                position: 'relative',
                transition: 'all 0.2s',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 20,
                    background: '#2563EB',
                    borderRadius: '0 2px 2px 0',
                  }}
                />
              )}
              <Icon size={18} />
            </motion.button>
          );
        })}
      </div>

      <div style={{ width: '100%', height: 1, background: 'var(--border)', margin: '4px 0' }} />

      {/* Bottom nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', padding: '0 8px 8px' }}>
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(item.id)}
              title={item.label}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? 'rgba(37,99,235,0.1)' : 'transparent',
                color: isActive ? '#2563EB' : '#94A3B8',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={18} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
