import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Filter, AlertTriangle, ChevronUp, ChevronDown, Eye, Edit, CheckCircle, Clock, MapPin } from 'lucide-react';
import { ENFORCEMENT_CASES } from '../data/mockData';

const PRIORITY_CONFIG = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', label: 'Critical' },
  high: { color: '#F97316', bg: 'rgba(249,115,22,0.12)', label: 'High' },
  medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Medium' },
  low: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Low' },
};

const STATUS_CONFIG = {
  active: { color: '#EF4444', label: 'Active', icon: AlertTriangle },
  investigating: { color: '#F59E0B', label: 'Investigating', icon: Eye },
  notice_issued: { color: '#3B82F6', label: 'Notice Issued', icon: Edit },
  resolved: { color: '#10B981', label: 'Resolved', icon: CheckCircle },
};

export default function Enforcement() {
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('riskScore');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState(null);

  const filtered = ENFORCEMENT_CASES
    .filter(c => {
      const matchSearch = !search || c.ward.toLowerCase().includes(search.toLowerCase()) || c.entity.toLowerCase().includes(search.toLowerCase()) || c.violation.toLowerCase().includes(search.toLowerCase());
      const matchPriority = filterPriority === 'all' || c.priority === filterPriority;
      const matchStatus = filterStatus === 'all' || c.status === filterStatus;
      return matchSearch && matchPriority && matchStatus;
    })
    .sort((a, b) => {
      const v = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'riskScore') return (a.riskScore - b.riskScore) * v;
      return a[sortField]?.localeCompare(b[sortField]) * v;
    });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const stats = {
    total: ENFORCEMENT_CASES.length,
    active: ENFORCEMENT_CASES.filter(c => c.status === 'active').length,
    critical: ENFORCEMENT_CASES.filter(c => c.priority === 'critical').length,
    resolved: ENFORCEMENT_CASES.filter(c => c.status === 'resolved').length,
  };

  return (
    <div style={{ padding: 20, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="#F97316" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Enforcement Center</h1>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>Manage violations, assign officers, track cases</p>
            </div>
          </div>
        </div>
        <button className="btn btn-danger">
          <AlertTriangle size={14} /> Export Cases
        </button>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Total Cases', value: stats.total, color: '#3B82F6' },
          { label: 'Active', value: stats.active, color: '#EF4444' },
          { label: 'Critical Priority', value: stats.critical, color: '#F97316' },
          { label: 'Resolved', value: stats.resolved, color: '#10B981' },
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

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ward, entity, violation..." style={{ width: '100%', paddingLeft: 32 }} />
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ minWidth: 130 }}>
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ minWidth: 150 }}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="investigating">Investigating</option>
          <option value="notice_issued">Notice Issued</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', flex: 1 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                {[
                  { key: 'priority', label: 'Priority' },
                  { key: 'id', label: 'Case ID' },
                  { key: 'ward', label: 'Ward' },
                  { key: 'violation', label: 'Violation' },
                  { key: 'entity', label: 'Entity' },
                  { key: 'riskScore', label: 'Risk Score' },
                  { key: 'officer', label: 'Officer' },
                  { key: 'status', label: 'Status' },
                  { key: 'deadline', label: 'Deadline' },
                  { key: 'actions', label: 'Actions' },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.key !== 'actions' && toggleSort(col.key)}
                    style={{
                      padding: '12px 14px', textAlign: 'left', fontSize: 11,
                      fontWeight: 600, color: 'var(--text-dim)', letterSpacing: 0.5,
                      cursor: col.key !== 'actions' ? 'pointer' : 'default',
                      whiteSpace: 'nowrap', userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {col.label.toUpperCase()}
                      <SortIcon field={col.key} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((c, i) => {
                  const pc = PRIORITY_CONFIG[c.priority];
                  const sc = STATUS_CONFIG[c.status];
                  const StatusIcon = sc.icon;
                  const isSelected = selected === c.id;
                  return (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelected(isSelected ? null : c.id)}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: isSelected ? 'rgba(59,130,246,0.06)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: pc.bg, color: pc.color }}>
                          {pc.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>{c.id}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} color="var(--text-dim)" />
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{c.ward}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1 }}>{c.location}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, maxWidth: 180 }}>
                        <div className="truncate">{c.violation}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-muted)', maxWidth: 160 }}>
                        <div className="truncate">{c.entity}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', minWidth: 50 }}>
                            <div style={{ height: '100%', width: `${c.riskScore}%`, background: c.riskScore >= 90 ? '#EF4444' : c.riskScore >= 70 ? '#F97316' : '#F59E0B', borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: c.riskScore >= 90 ? '#EF4444' : c.riskScore >= 70 ? '#F97316' : '#F59E0B', minWidth: 24 }}>{c.riskScore}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{c.officer}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${sc.color}18`, color: sc.color }}>
                          <StatusIcon size={10} />
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} />
                          {c.deadline}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={e => e.stopPropagation()}>
                            <Eye size={12} />
                          </button>
                          <button className="btn btn-primary btn-sm" style={{ padding: '4px 8px' }} onClick={e => e.stopPropagation()}>
                            <Edit size={12} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>
            <Shield size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
            <div>No cases match your filters</div>
          </div>
        )}
      </div>
    </div>
  );
}
