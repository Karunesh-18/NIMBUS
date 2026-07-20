import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import {
  Wind, LayoutDashboard, Map, BarChart3, Shield, Bell, FileText,
  Settings, MessageSquare, LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { WARDS, LIVE_ALERTS, AQI_HISTORY, POLLUTION_SOURCES, ENFORCEMENT_CASES, getAQICategory } from '../data/mockData'
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const NAV = [
  { path: 'overview', label: 'Overview', icon: LayoutDashboard },
  { path: 'map', label: 'Live Map', icon: Map },
  { path: 'analytics', label: 'Analytics', icon: BarChart3 },
  { path: 'enforcement', label: 'Enforcement', icon: Shield },
  { path: 'alerts', label: 'Alerts', icon: Bell },
  { path: 'reports', label: 'Reports', icon: FileText },
  { path: 'ai', label: 'AI Assistant', icon: MessageSquare },
  { path: 'settings', label: 'Settings', icon: Settings },
]

function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const active = location.pathname.split('/').pop()

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-56 bg-[#0D1B2E] border-r border-white/8 z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Wind size={15} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">VAYU</div>
            <div className="text-[10px] text-slate-500">Command Center</div>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-slate-500 hover:text-white"><X size={16} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ path, label, icon: Icon }) => {
            const isActive = active === path || (active === 'dashboard' && path === 'overview')
            return (
              <button
                key={path}
                onClick={() => { navigate(`/dashboard/${path}`); onClose() }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
                {isActive && <ChevronRight size={12} className="ml-auto" />}
              </button>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">RK</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">Ramesh Kumar</div>
              <div className="text-[10px] text-slate-500 truncate">City Official</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

function TopBar({ onMenuClick }) {
  const location = useLocation()
  const active = location.pathname.split('/').pop()
  const page = NAV.find(n => n.path === active)
  return (
    <header className="h-14 flex items-center gap-4 px-5 border-b border-white/8 bg-[#08111F]/80 backdrop-blur-xl">
      <button onClick={onMenuClick} className="lg:hidden text-slate-400 hover:text-white"><Menu size={20} /></button>
      <div>
        <h1 className="text-sm font-semibold text-white">{page?.label || 'Overview'}</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Live
        </div>
      </div>
    </header>
  )
}

/* ── Sub-pages ── */

function Overview() {
  const cityAqi = Math.round(WARDS.reduce((s, w) => s + w.aqi, 0) / WARDS.length)
  const cat = getAQICategory(cityAqi)
  const critical = WARDS.filter(w => w.aqi > 200).length

  return (
    <div className="p-5 space-y-5 overflow-y-auto h-full">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'City AQI', value: cityAqi, sub: cat.label, color: cat.color },
          { label: 'Critical Wards', value: critical, sub: 'AQI > 200', color: '#EF4444' },
          { label: 'Active Cases', value: ENFORCEMENT_CASES.filter(c => c.status === 'active').length, sub: 'Enforcement', color: '#F97316' },
          { label: 'Citizens at Risk', value: '421K', sub: 'Advisories sent', color: '#8B5CF6' },
        ].map((k) => (
          <div key={k.label} className="bg-[#0D1B2E] border border-white/8 rounded-2xl p-5">
            <div className="text-xs text-slate-500 mb-2">{k.label}</div>
            <div className="text-3xl font-black" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-slate-500 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart + Wards */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-[#0D1B2E] border border-white/8 rounded-2xl p-5">
          <div className="text-sm font-semibold text-white mb-4">AQI Trend (24h)</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={AQI_HISTORY}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0D1B2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="hebbal" stroke="#EF4444" fill="none" strokeWidth={2} name="Hebbal" />
              <Area type="monotone" dataKey="electronic" stroke="#F97316" fill="none" strokeWidth={2} name="Electronic City" />
              <Area type="monotone" dataKey="koramangala" stroke="#3B82F6" fill="url(#g1)" strokeWidth={2} name="Koramangala" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0D1B2E] border border-white/8 rounded-2xl p-5">
          <div className="text-sm font-semibold text-white mb-4">Pollution Sources</div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={POLLUTION_SOURCES} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {POLLUTION_SOURCES.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {POLLUTION_SOURCES.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-slate-400">{s.name}</span>
                  </div>
                  <span className="text-white font-medium">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ward list */}
      <div className="bg-[#0D1B2E] border border-white/8 rounded-2xl p-5">
        <div className="text-sm font-semibold text-white mb-4">Ward Status</div>
        <div className="space-y-2">
          {WARDS.sort((a, b) => b.aqi - a.aqi).map((w) => {
            const c = getAQICategory(w.aqi)
            return (
              <div key={w.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <span className="text-sm text-slate-300 flex-1">{w.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: c.color, background: c.bg }}>{c.label}</span>
                <span className="text-sm font-bold w-10 text-right" style={{ color: c.color }}>{w.aqi}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function LiveMap() {
  return (
    <div className="p-5 h-full overflow-y-auto">
      <div className="bg-[#0D1B2E] border border-white/8 rounded-2xl p-5 h-full min-h-[500px] flex flex-col">
        <div className="text-sm font-semibold text-white mb-4">Bengaluru AQI Map</div>
        <div className="flex-1 rounded-xl overflow-hidden relative bg-[#08111F] min-h-[400px]">
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-slate-600">
            <Map size={40} />
            <span className="text-sm">Interactive map — Leaflet integration</span>
          </div>
          {/* Ward pins overlay */}
          <div className="absolute inset-0 p-4 grid grid-cols-3 sm:grid-cols-5 gap-2 content-start pointer-events-none">
            {WARDS.map((w) => {
              const c = getAQICategory(w.aqi)
              return (
                <div key={w.id} className="flex flex-col items-center gap-1 pointer-events-auto cursor-pointer group">
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110" style={{ borderColor: c.color, background: c.bg, color: c.color }}>
                    {w.aqi}
                  </div>
                  <span className="text-[9px] text-slate-500 text-center leading-tight">{w.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function Analytics() {
  return (
    <div className="p-5 space-y-4 overflow-y-auto h-full">
      <div className="bg-[#0D1B2E] border border-white/8 rounded-2xl p-5">
        <div className="text-sm font-semibold text-white mb-4">AQI Comparison — All Wards</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={AQI_HISTORY}>
            <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#0D1B2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
            {['hebbal', 'electronic', 'koramangala', 'btm', 'whitefield'].map((k, i) => (
              <Area key={k} type="monotone" dataKey={k} stroke={['#EF4444','#F97316','#3B82F6','#8B5CF6','#10B981'][i]} fill="none" strokeWidth={1.5} name={k} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {WARDS.slice(0, 6).map((w) => {
          const c = getAQICategory(w.aqi)
          return (
            <div key={w.id} className="bg-[#0D1B2E] border border-white/8 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">{w.name}</span>
                <span className="text-lg font-black" style={{ color: c.color }}>{w.aqi}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[['PM2.5', w.pm25], ['PM10', w.pm10], ['NO₂', w.no2]].map(([l, v]) => (
                  <div key={l} className="bg-[#08111F] rounded-lg p-2 text-center">
                    <div className="text-slate-500 mb-0.5">{l}</div>
                    <div className="text-white font-semibold">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Enforcement() {
  const priorityColor = { critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#10B981' }
  const statusLabel = { active: 'Active', investigating: 'Investigating', notice_issued: 'Notice Issued', resolved: 'Resolved' }

  return (
    <div className="p-5 overflow-y-auto h-full">
      <div className="bg-[#0D1B2E] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="text-sm font-semibold text-white">Enforcement Cases</div>
          <div className="text-xs text-slate-500">{ENFORCEMENT_CASES.length} total</div>
        </div>
        <div className="space-y-3">
          {ENFORCEMENT_CASES.map((c) => (
            <div key={c.id} className="bg-[#08111F] border border-white/5 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">{c.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ color: priorityColor[c.priority], background: `${priorityColor[c.priority]}18` }}>{c.priority}</span>
                  </div>
                  <div className="text-sm font-medium text-white">{c.violation}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{c.entity} · {c.ward}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-black" style={{ color: priorityColor[c.priority] }}>{c.riskScore}</div>
                  <div className="text-[10px] text-slate-600">risk score</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{c.officer}</span>
                <span className="px-2 py-0.5 bg-white/5 rounded-full">{statusLabel[c.status]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Alerts() {
  return (
    <div className="p-5 overflow-y-auto h-full">
      <div className="bg-[#0D1B2E] border border-white/8 rounded-2xl p-5">
        <div className="text-sm font-semibold text-white mb-4">Live Alerts</div>
        <div className="space-y-3">
          {LIVE_ALERTS.map((a) => (
            <div key={a.id} className={`p-4 rounded-xl border ${a.type === 'critical' ? 'bg-red-500/8 border-red-500/20' : 'bg-white/3 border-white/8'}`}>
              <div className="flex items-start gap-3">
                <div className="text-lg">{a.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{a.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{a.message}</div>
                  <div className="text-[10px] text-slate-600 mt-1.5">{a.time} · {a.ward}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Reports() {
  const reports = [
    { title: 'Weekly AQI Summary', date: 'Dec 15, 2024', type: 'PDF', size: '2.4 MB' },
    { title: 'Enforcement Action Report', date: 'Dec 14, 2024', type: 'PDF', size: '1.8 MB' },
    { title: 'Pollution Source Analysis', date: 'Dec 13, 2024', type: 'XLSX', size: '3.1 MB' },
    { title: 'Citizen Advisory Log', date: 'Dec 12, 2024', type: 'PDF', size: '0.9 MB' },
    { title: 'Monthly Trend Report', date: 'Dec 01, 2024', type: 'PDF', size: '5.2 MB' },
  ]
  return (
    <div className="p-5 overflow-y-auto h-full">
      <div className="bg-[#0D1B2E] border border-white/8 rounded-2xl p-5">
        <div className="text-sm font-semibold text-white mb-4">Generated Reports</div>
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.title} className="flex items-center gap-4 p-4 bg-[#08111F] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <FileText size={16} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{r.title}</div>
                <div className="text-xs text-slate-500">{r.date} · {r.size}</div>
              </div>
              <span className="text-xs px-2 py-1 bg-white/5 rounded-lg text-slate-400">{r.type}</span>
              <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Download</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I\'m VAYU AI. Ask me about air quality trends, enforcement recommendations, or predictive analysis for any ward.' }
  ])
  const [input, setInput] = useState('')

  const send = () => {
    if (!input.trim()) return
    const q = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q }])
    setTimeout(() => {
      setMessages(m => [...m, { role: 'ai', text: `Analyzing "${q}"... Based on current data, Hebbal has the highest AQI at 234 (Severe). I recommend immediate enforcement action and citizen advisories for that ward.` }])
    }, 800)
  }

  return (
    <div className="p-5 h-full flex flex-col">
      <div className="bg-[#0D1B2E] border border-white/8 rounded-2xl flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-white/8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <MessageSquare size={14} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">VAYU AI Assistant</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />Online</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#08111F] border border-white/8 text-slate-300'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/8 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about AQI, enforcement, predictions..."
            className="flex-1 bg-[#08111F] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
          />
          <button onClick={send} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">Send</button>
        </div>
      </div>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="p-5 overflow-y-auto h-full">
      <div className="max-w-lg space-y-4">
        {[
          { title: 'Profile', fields: [{ label: 'Full Name', value: 'Ramesh Kumar' }, { label: 'Email', value: 'ramesh@bbmp.gov.in' }, { label: 'Role', value: 'City Official' }] },
          { title: 'Notifications', fields: [{ label: 'AQI Threshold Alert', value: '150' }, { label: 'Email Alerts', value: 'Enabled' }] },
        ].map((section) => (
          <div key={section.title} className="bg-[#0D1B2E] border border-white/8 rounded-2xl p-5">
            <div className="text-sm font-semibold text-white mb-4">{section.title}</div>
            <div className="space-y-3">
              {section.fields.map((f) => (
                <div key={f.label}>
                  <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                  <input defaultValue={f.value} className="w-full bg-[#08111F] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors">Save Changes</button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main CommandCenter ── */
export default function CommandCenter() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#08111F] overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-56 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="map" element={<LiveMap />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="enforcement" element={<Enforcement />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="ai" element={<AIAssistant />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
