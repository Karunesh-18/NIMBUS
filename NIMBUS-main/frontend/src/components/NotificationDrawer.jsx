import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, AlertTriangle, Bot, Shield, MessageSquare, FileText, Cloud } from 'lucide-react';
import { NOTIFICATIONS } from '../data/mockData';

const ICONS = { critical: AlertTriangle, ai: Bot, enforcement: Shield, advisory: MessageSquare, report: FileText, weather: Cloud };
const COLORS = { critical: '#DC2626', ai: '#7C3AED', enforcement: '#D97706', advisory: '#2563EB', report: '#059669', weather: '#0891B2' };

export default function NotificationDrawer({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 800 }}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', right: 0, top: 0, bottom: 0, width: 360,
              background: '#FFFFFF',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.08)',
              zIndex: 900,
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={16} color="var(--text-muted)" />
                <span style={{ fontSize: 15, fontWeight: 700 }}>Notifications</span>
                <span style={{ background: '#DC2626', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                  {NOTIFICATIONS.filter(n => !n.read).length}
                </span>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {NOTIFICATIONS.map((n, i) => {
                const Icon = ICONS[n.type] || Bell;
                const color = COLORS[n.type] || '#64748B';
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      display: 'flex', gap: 12, padding: '12px',
                      borderRadius: 10, marginBottom: 6,
                      background: n.read ? 'transparent' : 'rgba(37,99,235,0.04)',
                      border: `1px solid ${n.read ? 'transparent' : 'rgba(37,99,235,0.1)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{n.title}</span>
                        {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{n.time}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
