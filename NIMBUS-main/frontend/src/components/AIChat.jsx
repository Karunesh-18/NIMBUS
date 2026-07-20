import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Bot, User, Copy, MapPin, Brain, ChevronRight } from 'lucide-react';
import { AI_CHAT_RESPONSES } from '../data/mockData';

const SUGGESTED = [
  "Why is AQI increasing in Hebbal?",
  "Which ward needs urgent attention?",
  "Predict tomorrow's AQI forecast",
  "Recommend government actions now",
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED' }} />
      ))}
    </div>
  );
}

function AIMessage({ msg, onMapFocus }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(msg.summary || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <Bot size={16} color="white" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#7C3AED' }}>VAYU AI</span>
          <span className="badge badge-ai" style={{ fontSize: 9 }}>AI</span>
          {msg.confidence && <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Confidence: {msg.confidence}%</span>}
        </div>
        {msg.summary && (
          <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>{msg.summary}</div>
          </div>
        )}
        {msg.detail && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 8 }}>
            {msg.detail.split('**').map((part, i) =>
              i % 2 === 1 ? <strong key={i} style={{ color: 'var(--text)', fontWeight: 600 }}>{part}</strong> : part
            )}
          </div>
        )}
        {msg.govRecommendations && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#D97706', fontWeight: 600, marginBottom: 4 }}>🏛️ GOVERNMENT ACTIONS</div>
            {msg.govRecommendations.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                <ChevronRight size={12} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r}</span>
              </div>
            ))}
          </div>
        )}
        {msg.healthAdvisory && (
          <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, marginBottom: 2 }}>⚕️ HEALTH ADVISORY</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{msg.healthAdvisory}</div>
          </div>
        )}
        {msg.affectedPopulation && (
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
            👥 Affected: <strong style={{ color: '#EA580C' }}>{msg.affectedPopulation.toLocaleString()}</strong> residents
          </div>
        )}
        {msg.sources && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {msg.sources.map((s, i) => (
              <span key={i} style={{ fontSize: 10, background: 'rgba(0,0,0,0.05)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', color: 'var(--text-dim)' }}>{s}</span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={copy} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
            <Copy size={11} /> {copied ? 'Copied!' : 'Copy'}
          </button>
          {msg.ward && (
            <button onClick={() => onMapFocus(msg.ward)} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
              <MapPin size={11} /> Focus Map
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function UserMessage({ msg }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 10, marginBottom: 16, justifyContent: 'flex-end' }}>
      <div style={{ maxWidth: '75%', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '12px 12px 4px 12px', padding: '10px 14px' }}>
        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{msg.text}</div>
      </div>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <User size={16} color="#2563EB" />
      </div>
    </motion.div>
  );
}

export default function AIChat({ open, onClose, onMapFocus, initialQuery }) {
  const [messages, setMessages] = useState([{
    id: 0, role: 'ai',
    summary: "Hello! I'm VAYU AI, your intelligent air quality assistant with real-time access to 47 monitoring stations across Bengaluru.",
    detail: "I can help you **analyze pollution patterns**, **predict AQI trends**, **identify violation sources**, and **generate citizen advisories**.",
    confidence: 100,
    sources: ["CPCB Sensor Network", "Satellite Data", "Weather API"],
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const didInit = useRef(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  useEffect(() => {
    if (open && initialQuery && !didInit.current) {
      didInit.current = true;
      sendMessage(initialQuery);
    }
    if (!open) didInit.current = false;
  }, [open, initialQuery]);

  const buildResponse = (query) => {
    const q = query.toLowerCase();
    const base = AI_CHAT_RESPONSES.default;
    if (q.includes('hebbal') || q.includes('urgent')) return { ...base, summary: "Hebbal ward requires IMMEDIATE intervention — AQI 234 (Severe).", detail: "Hebbal has AQI **234** with PM2.5 at **118 μg/m³** — 4.7x the safe limit. **87,000 residents** at risk.", ward: "Hebbal", affectedPopulation: 87000, confidence: 97, govRecommendations: base.govRecommendations, healthAdvisory: "SEVERE health risk. All residents advised to stay indoors.", sources: base.sources };
    if (q.includes('predict') || q.includes('tomorrow')) return { ...base, summary: "Tomorrow's AQI forecast shows continued deterioration in northern wards.", detail: "ML model predicts AQI **220-250** in Hebbal and Electronic City by morning. Model accuracy: **94.2%**.", confidence: 89, affectedPopulation: 321000, govRecommendations: ["Pre-position enforcement teams", "Schedule water sprinkling for 5 AM"], healthAdvisory: "Pre-emptive advisory recommended for northern wards.", sources: base.sources };
    if (q.includes('construction')) return { ...base, summary: "Construction sites contribute 22% of total PM2.5 — 3 sites are critical violators.", detail: "Top violators: **80 Feet Road Site, Koramangala** and **Hebbal Flyover Extension** — no dust suppression.", confidence: 91, ward: "Koramangala", affectedPopulation: 309000, govRecommendations: ["Issue stop-work orders to top 3 violating sites"], healthAdvisory: "Wear N95 masks near construction zones.", sources: base.sources };
    return { ...base, confidence: 92 };
  };

  const sendMessage = (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: q }]);
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', ...buildResponse(q) }]);
      setTyping(false);
    }, 1400 + Math.random() * 600);
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 20 }}
      style={{
        position: 'fixed', bottom: 80, right: 20,
        width: 480, height: 620,
        background: '#FFFFFF',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 16, zIndex: 700,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
      }}
    >
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, background: 'rgba(124,58,237,0.04)', borderRadius: '16px 16px 0 0' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}>
          <Brain size={18} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>VAYU AI Assistant</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Online · 47 sensors active</span>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map(msg =>
          msg.role === 'ai'
            ? <AIMessage key={msg.id} msg={msg} onMapFocus={onMapFocus} />
            : <UserMessage key={msg.id} msg={msg} />
        )}
        {typing && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={16} color="white" />
            </div>
            <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '12px 12px 12px 4px', padding: '10px 14px' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SUGGESTED.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)}
              style={{ fontSize: 11, padding: '4px 10px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 20, cursor: 'pointer', color: '#7C3AED', fontFamily: 'var(--font)', whiteSpace: 'nowrap' }}>
              {q}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(124,58,237,0.1)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about air quality, predictions, actions..."
          style={{ flex: 1, background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => sendMessage()}
          disabled={!input.trim() || typing}
          style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: (!input.trim() || typing) ? 0.5 : 1 }}
        >
          <Send size={16} color="white" />
        </motion.button>
      </div>
    </motion.div>
  );
}
