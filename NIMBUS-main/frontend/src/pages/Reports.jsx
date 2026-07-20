import { motion } from 'framer-motion';
import { FileText, Download, Calendar, BarChart3, Bot, Building2, TrendingUp, CheckCircle, Clock } from 'lucide-react';

const REPORTS = [
  { id: 1, icon: Calendar, title: 'Daily Air Quality Report', desc: 'Comprehensive daily summary of AQI readings, violations, and advisories across all 10 wards.', date: 'Today, Dec 12 2024', size: '2.4 MB', status: 'ready', color: '#3B82F6', formats: ['PDF', 'Excel', 'CSV'] },
  { id: 2, icon: TrendingUp, title: 'Weekly Trend Analysis', desc: 'Week-over-week AQI trends, pollution source analysis, and enforcement activity summary.', date: 'Dec 6–12, 2024', size: '5.8 MB', status: 'ready', color: '#8B5CF6', formats: ['PDF', 'Excel'] },
  { id: 3, icon: BarChart3, title: 'Monthly Intelligence Report', desc: 'Monthly deep-dive with predictive insights, ward rankings, and policy recommendations.', date: 'November 2024', size: '12.1 MB', status: 'ready', color: '#10B981', formats: ['PDF', 'Excel', 'CSV'] },
  { id: 4, icon: Building2, title: 'Government Compliance Report', desc: 'Official compliance report for CPCB submission with all regulatory metrics and enforcement actions.', date: 'Q4 2024', size: '8.3 MB', status: 'ready', color: '#F59E0B', formats: ['PDF'] },
  { id: 5, icon: Bot, title: 'AI Intelligence Report', desc: 'AI-generated insights including predictions, anomaly detection, and intervention recommendations.', date: 'Auto-generated', size: '3.2 MB', status: 'generating', color: '#A78BFA', formats: ['PDF', 'JSON'] },
  { id: 6, icon: FileText, title: 'Enforcement Action Report', desc: 'Detailed log of all enforcement cases, notices issued, and resolution status.', date: 'Dec 2024', size: '1.9 MB', status: 'ready', color: '#F97316', formats: ['PDF', 'Excel', 'CSV'] },
];

export default function Reports() {
  return (
    <div style={{ padding: 20, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} color="#10B981" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Reports</h1>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>Generate, download, and share air quality reports</p>
          </div>
        </div>
        <button className="btn btn-primary"><Download size={14} /> Download All</button>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Reports Generated', value: '247', color: '#3B82F6' },
          { label: 'This Month', value: '18', color: '#8B5CF6' },
          { label: 'Pending', value: '1', color: '#F59E0B' },
          { label: 'Shared with Govt', value: '34', color: '#10B981' },
        ].map(({ label, value, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Report cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {REPORTS.map((report, i) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2, boxShadow: `0 8px 32px ${report.color}18` }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '18px', position: 'relative', overflow: 'hidden',
                transition: 'box-shadow 0.2s',
              }}
            >
              {/* Top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${report.color}, transparent)` }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${report.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={report.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{report.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{report.desc}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-dim)' }}>
                    <Calendar size={11} />
                    {report.date}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{report.size}</div>
                </div>
                {report.status === 'ready' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10B981', fontWeight: 600 }}>
                    <CheckCircle size={11} />
                    Ready
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>
                    <div style={{ width: 10, height: 10, border: '2px solid #F59E0B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Generating...
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {report.formats.map(fmt => (
                  <button
                    key={fmt}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, padding: '4px 10px' }}
                  >
                    <Download size={11} /> {fmt}
                  </button>
                ))}
                <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto', fontSize: 11 }}>
                  View Report
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
