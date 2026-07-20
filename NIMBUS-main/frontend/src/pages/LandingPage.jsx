import { useNavigate } from 'react-router-dom'
import { Wind, Shield, Brain, BarChart3, MapPin, Bell, ArrowRight, Zap, Globe } from 'lucide-react'

const STATS = [
  { value: '10+',   label: 'Wards Monitored' },
  { value: '99.9%', label: 'System Uptime' },
  { value: '421K',  label: 'Citizens Protected' },
  { value: '89%',   label: 'AI Accuracy' },
]

const FEATURES = [
  { icon: Brain,     title: 'AI-Powered Predictions', desc: 'Forecast AQI 24 hours ahead with 89% accuracy using weather, traffic, and industrial data.',        iconColor: '#9333ea', cardBg: '#faf5ff', cardBorder: '#e9d5ff' },
  { icon: MapPin,    title: 'Real-Time Ward Mapping',  desc: 'Live AQI heatmaps across all Bengaluru wards with drill-down analytics and source attribution.',   iconColor: '#2563eb', cardBg: '#eff6ff', cardBorder: '#bfdbfe' },
  { icon: Shield,    title: 'Enforcement Engine',      desc: 'Automated violation detection, risk scoring, and officer dispatch for industrial polluters.',        iconColor: '#dc2626', cardBg: '#fff1f2', cardBorder: '#fecdd3' },
  { icon: Bell,      title: 'Citizen Advisories',      desc: 'Hyper-local health alerts sent to residents based on real-time AQI and vulnerability scores.',       iconColor: '#d97706', cardBg: '#fffbeb', cardBorder: '#fde68a' },
  { icon: BarChart3, title: 'Advanced Analytics',      desc: 'Trend analysis, source attribution, and comparative ward performance with exportable reports.',      iconColor: '#0891b2', cardBg: '#ecfeff', cardBorder: '#a5f3fc' },
  { icon: Zap,       title: 'Scenario Simulator',      desc: 'Model the impact of traffic restrictions and industrial shutdowns before rolling out policy changes.',iconColor: '#059669', cardBg: '#f0fdf4', cardBorder: '#bbf7d0' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wind size={15} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>VAYU</span>
            <span style={{ fontSize: 11, color: '#94a3b8', borderLeft: '1px solid #e2e8f0', paddingLeft: 10, marginLeft: 2 }}>Air Intelligence</span>
          </div>
          {/* Nav buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => navigate('/login')} style={{ fontSize: 13, color: '#64748b', background: 'none', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
              onMouseEnter={e => e.target.style.backgroundColor = '#f8fafc'}
              onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}>
              Sign In
            </button>
            <button onClick={() => navigate('/signup')} style={{ fontSize: 13, color: '#fff', background: '#2563eb', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              onMouseEnter={e => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={e => e.target.style.backgroundColor = '#2563eb'}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', padding: '96px 24px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 999, padding: '6px 16px', fontSize: 12, color: '#2563eb', fontWeight: 500, marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, background: '#3b82f6', borderRadius: '50%', display: 'inline-block' }} />
            Live monitoring across Bengaluru
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 60px)', fontWeight: 900, lineHeight: 1.1, color: '#0f172a', margin: '0 0 20px', letterSpacing: '-1px' }}>
            Smart City<br />
            <span style={{ background: 'linear-gradient(90deg, #2563eb, #06b6d4, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Air Intelligence
            </span>
          </h1>

          {/* Subtext */}
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, maxWidth: 520, margin: '0 0 40px' }}>
            VAYU is an AI-powered command center for city officials to monitor, predict, and act on air quality threats across all urban wards — in real time.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/signup')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.25)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563eb'}>
              Launch Command Center <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/login')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', color: '#475569', border: '1px solid #e2e8f0', padding: '14px 28px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#0f172a' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569' }}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '48px 24px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '96px 24px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>Everything you need to fight air pollution</h2>
            <p style={{ fontSize: 14, color: '#64748b', maxWidth: 400, margin: '0 auto' }}>A unified platform for monitoring, enforcement, and citizen protection.</p>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ padding: 24, borderRadius: 16, border: `1px solid ${f.cardBorder}`, backgroundColor: f.cardBg, transition: 'transform 0.15s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#fff', border: `1px solid ${f.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <f.icon size={18} color={f.iconColor} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '80px 24px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 24, padding: '56px 40px', boxShadow: '0 24px 64px rgba(37,99,235,0.2)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Globe size={22} color="#fff" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>Ready to protect your city?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: '0 0 32px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
            Join city officials using VAYU to make data-driven decisions for cleaner air.
          </p>
          <button onClick={() => navigate('/signup')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#fff', color: '#2563eb', border: 'none', padding: '14px 28px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}>
            Create Free Account <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #f1f5f9', padding: '32px 24px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #3b82f6, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wind size={11} color="#fff" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>VAYU</span>
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>© 2024 VAYU Air Intelligence Platform. Built for smarter cities.</p>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <button key={l} style={{ fontSize: 11, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.color = '#475569'}
                onMouseLeave={e => e.target.style.color = '#94a3b8'}>{l}</button>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
