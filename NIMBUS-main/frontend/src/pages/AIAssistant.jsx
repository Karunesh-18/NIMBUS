import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Send, Bot, User, Copy, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { AI_CHAT_RESPONSES } from '../data/mockData';

const SUGGESTED = [
  "Why is AQI increasing in Hebbal?",
  "Which ward needs urgent attention?",
  "Predict tomorrow's AQI forecast",
  "Recommend government actions now",
  "Which construction sites contribute most?",
  "Generate citizen advisory for Koramangala",
  "Compare today's AQI with yesterday",
  "What interventions reduce AQI fastest?",
  "Explain the pollution sources in detail",
  "What's the health impact in Electronic City?",
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, boxShadow: '0 4px 12px rgba(124,58,237,0.2)' }}>
        <Bot size={18} color="white" />
      </div>
      <div style={{ flex: 1, maxWidth: 720 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED' }}>VAYU AI</span>
          <span className="badge badge-ai" style={{ fontSize: 9 }}>AI</span>
          {msg.confidence && <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>Confidence: {msg.confidence}%</span>}
        </div>

        {msg.summary && (
          <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.6 }}>{msg.summary}</div>
          </div>
        )}

        {msg.detail && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 10 }}>
            {msg.detail.split('**').map((part, i) =>
              i % 2 === 1 ? <strong key={i} style={{ color: 'var(--text)', fontWeight: 600 }}>{part}</strong> : part
            )}
          </div>
        )}

        {msg.govRecommendations && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: '#D97706', fontWeight: 700, marginBottom: 6 }}>🏛️ GOVERNMENT ACTIONS</div>
            {msg.govRecommendations.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <ChevronRight size={13} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r}</span>
              </div>
            ))}
          </div>
        )}

        {msg.citizenRecommendations && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: '#2563EB', fontWeight: 700, marginBottom: 6 }}>👥 CITIZEN RECOMMENDATIONS</div>
            {msg.citizenRecommendations.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <ChevronRight size={13} color="#2563EB" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r}</span>
              </div>
            ))}
          </div>
        )}

        {msg.healthAdvisory && (
          <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 700, marginBottom: 3 }}>⚕️ HEALTH ADVISORY</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{msg.healthAdvisory}</div>
          </div>
        )}

        {msg.affectedPopulation && (
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 10 }}>
            👥 Affected Population: <strong style={{ color: '#EA580C' }}>{msg.affectedPopulation.toLocaleString()}</strong> residents
          </div>
        )}

        {msg.sources && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {msg.sources.map((s, i) => (
              <span key={i} style={{ fontSize: 11, background: 'rgba(0,0,0,0.05)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', color: 'var(--text-dim)' }}>{s}</span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={copy} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
            <Copy size={11} /> {copied ? 'Copied!' : 'Copy'}
          </button>
          {msg.ward && onMapFocus && (
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 12, marginBottom: 20, justifyContent: 'flex-end' }}>
      <div style={{ maxWidth: '65%', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: '14px 14px 4px 14px', padding: '12px 16px' }}>
        <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{msg.text}</div>
      </div>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <User size={18} color="#2563EB" />
      </div>
    </motion.div>
  );
}

export default function AIAssistant({ onMapFocus }) {
  const [messages, setMessages] = useState([{
    id: 0, role: 'ai',
    summary: "Hello! I'm VAYU AI, your intelligent air quality command assistant powered by advanced ML models.",
    detail: "I have real-time access to **47 sensor stations** across Bengaluru, satellite imagery, weather data, industrial permits, and 3 years of historical AQI data. I can help you **analyze pollution patterns**, **predict AQI trends**, **identify violation sources**, **simulate interventions**, and **generate citizen advisories**.",
    confidence: 100,
    sources: ["CPCB Sensor Network", "Sentinel-5P Satellite", "IMD Weather API", "Industrial Permit DB"],
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const buildResponse = (query) => {
    const q = query.toLowerCase();
    const base = AI_CHAT_RESPONSES.default;
    if (q.includes('hebbal') || q.includes('urgent') || q.includes('attention')) {
      return { ...base, summary: "Hebbal ward requires IMMEDIATE intervention — AQI 234 (Severe), vulnerability score 91/100.", detail: "Hebbal has the highest AQI reading of **234** (Severe category) with PM2.5 at **118 μg/m³** — 4.7x the safe limit. The ward has **87,000 residents** with a vulnerability score of 91/100. Key risk factors: 8 active industrial units, 11 construction sites, heavy traffic on NH-44.", ward: "Hebbal", affectedPopulation: 87000, confidence: 97, govRecommendations: base.govRecommendations, citizenRecommendations: base.citizenRecommendations, healthAdvisory: "SEVERE health risk. All residents advised to stay indoors. Hospitals on alert for respiratory emergencies.", sources: base.sources };
    }
    if (q.includes('predict') || q.includes('tomorrow') || q.includes('forecast')) {
      return { ...base, summary: "Tomorrow's AQI forecast shows continued deterioration in northern wards.", detail: "ML model predicts: Morning (6-10 AM): AQI **220-250** in Hebbal, Electronic City. Afternoon: Slight improvement to **190-220**. Evening: Deterioration to **240-260** as temperature inversion strengthens. Model accuracy: **94.2%**.", confidence: 89, affectedPopulation: 321000, govRecommendations: ["Pre-position enforcement teams for morning rush hour", "Schedule water sprinkling trucks for 5 AM deployment", "Issue preventive advisory tonight"], citizenRecommendations: base.citizenRecommendations, healthAdvisory: "Pre-emptive health advisory recommended for northern wards.", sources: base.sources };
    }
    if (q.includes('construction')) {
      return { ...base, summary: "Construction sites contribute 22% of total PM2.5 — 3 sites are critical violators.", detail: "Top violators: (1) **80 Feet Road Site, Koramangala** — dust suppression failure, (2) **Hebbal Flyover Extension** — 11 active sites, no water sprinkling, (3) **BTM Layout Metro Phase 3** — 9 sites, inadequate barriers.", confidence: 91, ward: "Koramangala", affectedPopulation: 309000, govRecommendations: ["Issue stop-work orders to top 3 violating sites", "Mandate dust suppression systems on all sites", "Deploy CCTV monitoring at high-risk sites"], citizenRecommendations: ["Wear N95 masks near construction zones"], healthAdvisory: "Residents near active construction zones should wear N95 masks.", sources: base.sources };
    }
    if (q.includes('intervention') || q.includes('reduce') || q.includes('fastest')) {
      return { ...base, summary: "Top 3 interventions can reduce city-wide AQI by up to 34% within 6 hours.", detail: "Ranked by impact: (1) **Close High-Risk Industries** — 34% AQI reduction, (2) **Stop Construction** — 22% reduction, (3) **Reduce Traffic 50%** — 18% reduction. Combined effect: **~58% reduction** in PM2.5 within 8 hours.", confidence: 88, affectedPopulation: 421000, govRecommendations: ["Issue emergency industrial shutdown for Category A industries", "Deploy traffic police for alternate routing", "Issue stop-work orders to top 10 construction sites"], citizenRecommendations: base.citizenRecommendations, healthAdvisory: "Immediate action can prevent 62,000 health incidents.", sources: base.sources };
    }
    if (q.includes('advisory') || q.includes('citizen')) {
      return { ...base, summary: "Citizen advisory generated for current air quality conditions across Bengaluru.", detail: "**Hebbal, Electronic City, Koramangala, BTM Layout** — Avoid all outdoor activities. Wear N95 masks. **Whitefield, Rajajinagar** — Limit outdoor exposure. **Jayanagar, Indiranagar** — Air quality acceptable.", confidence: 95, affectedPopulation: 1259000, govRecommendations: ["Send SMS advisory to all registered residents", "Post advisories on BBMP digital boards"], citizenRecommendations: base.citizenRecommendations, healthAdvisory: "Children, elderly, and respiratory patients in Severe/Poor wards must remain indoors.", sources: base.sources };
    }
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
    }, 1400 + Math.random() * 800);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 20, gap: 0, background: '#F8FAFC' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexShrink: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}>
          <Brain size={22} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>VAYU AI Assistant</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Online · GPT-4 Powered · 47 sensors · Real-time data</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span className="badge badge-ai"><Sparkles size={10} /> AI Powered</span>
          <span className="badge badge-good">94.2% Accuracy</span>
        </div>
      </motion.div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginBottom: 16, flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>SUGGESTED QUESTIONS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SUGGESTED.map((q, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => sendMessage(q)}
                style={{ padding: '6px 14px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 20, cursor: 'pointer', color: '#7C3AED', fontSize: 12, fontFamily: 'var(--font)', fontWeight: 500 }}
              >
                {q}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {messages.map(msg =>
          msg.role === 'ai'
            ? <AIMessage key={msg.id} msg={msg} onMapFocus={onMapFocus} />
            : <UserMessage key={msg.id} msg={msg} />
        )}
        {typing && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={18} color="white" />
            </div>
            <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '14px 14px 14px 4px', padding: '12px 16px' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ flexShrink: 0, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about air quality, predictions, interventions, advisories..."
            style={{ flex: 1, background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 14 }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || typing}
            style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: (!input.trim() || typing) ? 0.5 : 1, boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}
          >
            <Send size={18} color="white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
