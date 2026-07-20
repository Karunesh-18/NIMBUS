import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Wind, Eye, EyeOff, UserPlus } from 'lucide-react'

const ROLES = ['City Official', 'Environmental Officer', 'Data Analyst', 'Field Inspector', 'Administrator']

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', role: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setError('')
    setLoading(true)
    setTimeout(() => navigate('/dashboard'), 1200)
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'border-color 0.15s',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#475569',
    marginBottom: 6,
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #3b82f6, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Wind size={22} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>Join VAYU</h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Air Intelligence Platform</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '36px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <form onSubmit={handleSubmit}>

            {/* Full Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Full name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={set('name')}
                placeholder="e.g. Ramesh Kumar"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="officer@bbmp.gov.in"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Role */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Role</label>
              <select
                required
                value={form.role}
                onChange={set('role')}
                style={{ ...inputStyle, color: form.role ? '#0f172a' : '#94a3b8', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40 }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              >
                <option value="" disabled>Select your role</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 8 characters"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={set('confirm')}
                placeholder="Re-enter your password"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 20 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', padding: '13px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background-color 0.15s' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#1d4ed8' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#2563eb' }}
            >
              {loading
                ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                : <><UserPlus size={16} /> Create Account</>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 24, paddingTop: 20, textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>

        {/* Back link */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#94a3b8' }}>
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>← Back to home</Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
