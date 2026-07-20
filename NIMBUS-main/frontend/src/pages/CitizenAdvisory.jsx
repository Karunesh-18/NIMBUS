import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Share2, Download, Copy, Phone, Wind, Thermometer, AlertTriangle, CheckCircle, Info, Users } from 'lucide-react';
import { WARDS, getAQICategory } from '../data/mockData';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'bn', label: 'বাংলা' },
];

const ADVISORY_TEXT = {
  en: {
    title: "Air Quality Advisory",
    risk: "Health Risk",
    today: "Today's Advisory",
    outdoor: "Outdoor Activities",
    outdoorText: "Avoid all strenuous outdoor activities. If going outside, wear N95 mask.",
    mask: "Mask Recommendation",
    maskText: "N95 or equivalent mask strongly recommended for all outdoor activities.",
    children: "Children Advisory",
    childrenText: "Children should remain indoors. Schools advised to cancel outdoor activities.",
    senior: "Senior Citizens",
    seniorText: "High-risk group. Stay indoors. Keep windows closed. Use air purifier if available.",
    emergency: "Emergency Numbers",
    weather: "Current Weather",
    share: "Share Advisory",
    copy: "Copy Text",
    download: "Download PDF",
    whatsapp: "WhatsApp",
  },
  hi: {
    title: "वायु गुणवत्ता सलाह",
    risk: "स्वास्थ्य जोखिम",
    today: "आज की सलाह",
    outdoor: "बाहरी गतिविधियाँ",
    outdoorText: "सभी कठिन बाहरी गतिविधियों से बचें। बाहर जाने पर N95 मास्क पहनें।",
    mask: "मास्क की सिफारिश",
    maskText: "सभी बाहरी गतिविधियों के लिए N95 या समकक्ष मास्क की दृढ़ता से सिफारिश की जाती है।",
    children: "बच्चों के लिए सलाह",
    childrenText: "बच्चों को घर के अंदर रहना चाहिए। स्कूलों को बाहरी गतिविधियाँ रद्द करने की सलाह दी जाती है।",
    senior: "वरिष्ठ नागरिक",
    seniorText: "उच्च जोखिम समूह। घर के अंदर रहें। खिड़कियाँ बंद रखें।",
    emergency: "आपातकालीन नंबर",
    weather: "वर्तमान मौसम",
    share: "सलाह साझा करें",
    copy: "टेक्स्ट कॉपी करें",
    download: "PDF डाउनलोड",
    whatsapp: "व्हाट्सएप",
  },
  kn: {
    title: "ವಾಯು ಗುಣಮಟ್ಟ ಸಲಹೆ",
    risk: "ಆರೋಗ್ಯ ಅಪಾಯ",
    today: "ಇಂದಿನ ಸಲಹೆ",
    outdoor: "ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಗಳು",
    outdoorText: "ಎಲ್ಲಾ ಕಠಿಣ ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಗಳನ್ನು ತಪ್ಪಿಸಿ. ಹೊರಗೆ ಹೋಗುವಾಗ N95 ಮಾಸ್ಕ್ ಧರಿಸಿ.",
    mask: "ಮಾಸ್ಕ್ ಶಿಫಾರಸು",
    maskText: "ಎಲ್ಲಾ ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಗಳಿಗೆ N95 ಮಾಸ್ಕ್ ಅನ್ನು ಬಲವಾಗಿ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",
    children: "ಮಕ್ಕಳ ಸಲಹೆ",
    childrenText: "ಮಕ್ಕಳು ಒಳಗಡೆ ಇರಬೇಕು. ಶಾಲೆಗಳು ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಗಳನ್ನು ರದ್ದುಗೊಳಿಸಬೇಕು.",
    senior: "ಹಿರಿಯ ನಾಗರಿಕರು",
    seniorText: "ಹೆಚ್ಚಿನ ಅಪಾಯದ ಗುಂಪು. ಒಳಗಡೆ ಇರಿ. ಕಿಟಕಿಗಳನ್ನು ಮುಚ್ಚಿ.",
    emergency: "ತುರ್ತು ಸಂಖ್ಯೆಗಳು",
    weather: "ಪ್ರಸ್ತುತ ಹವಾಮಾನ",
    share: "ಸಲಹೆ ಹಂಚಿಕೊಳ್ಳಿ",
    copy: "ಪಠ್ಯ ನಕಲಿಸಿ",
    download: "PDF ಡೌನ್‌ಲೋಡ್",
    whatsapp: "ವಾಟ್ಸ್ಆಪ್",
  },
};

function PhoneMockup({ ward, lang }) {
  const cat = getAQICategory(ward.aqi);
  const t = ADVISORY_TEXT[lang] || ADVISORY_TEXT.en;

  return (
    <div style={{
      width: 280,
      background: '#0A0A0A',
      borderRadius: 40,
      padding: '12px',
      boxShadow: '0 40px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.1)',
      position: 'relative',
    }}>
      {/* Notch */}
      <div style={{ width: 100, height: 24, background: '#0A0A0A', borderRadius: 12, margin: '0 auto 8px', position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a1a1a', border: '1px solid #333' }} />
        <div style={{ width: 40, height: 6, borderRadius: 3, background: '#1a1a1a' }} />
      </div>

      {/* Screen */}
      <div style={{ background: '#08111F', borderRadius: 28, overflow: 'hidden', minHeight: 520 }}>
        {/* Status bar */}
        <div style={{ background: cat.color, padding: '12px 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>VAYU</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>9:41 AM</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>{ward.name} · {t.title}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: 'white', lineHeight: 1 }}>{ward.aqi}</div>
            <div style={{ paddingBottom: 6 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>AQI</div>
              <div style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>{cat.label}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px' }}>
          {/* Risk badge */}
          <div style={{ background: `${cat.bg}`, border: `1px solid ${cat.color}44`, borderRadius: 8, padding: '8px 10px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} color={cat.color} />
            <span style={{ fontSize: 12, color: cat.color, fontWeight: 600 }}>{t.risk}: {ward.risk}</span>
          </div>

          {/* Advisory items */}
          {[
            { icon: Wind, title: t.outdoor, text: t.outdoorText, color: '#F97316' },
            { icon: CheckCircle, title: t.mask, text: t.maskText, color: '#8B5CF6' },
            { icon: Users, title: t.children, text: t.childrenText, color: '#3B82F6' },
            { icon: Info, title: t.senior, text: t.seniorText, color: '#EF4444' },
          ].map(({ icon: Icon, title, text, color }) => (
            <div key={title} style={{ marginBottom: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, borderLeft: `2px solid ${color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                <Icon size={11} color={color} />
                <span style={{ fontSize: 10, fontWeight: 700, color }}>{title}</span>
              </div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>{text}</p>
            </div>
          ))}

          {/* Weather */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{ward.temp}°C</div>
              <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>Temp</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{ward.humidity}%</div>
              <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>Humidity</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{ward.wind.split(' ')[1]}</div>
              <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>Wind</div>
            </div>
          </div>

          {/* Emergency */}
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 700, marginBottom: 4 }}>📞 {t.emergency}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>BBMP: 1533 &nbsp;|&nbsp; Ambulance: 108</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>VAYU Helpline: 1800-XXX-XXXX</div>
          </div>
        </div>
      </div>

      {/* Home indicator */}
      <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '8px auto 0' }} />
    </div>
  );
}

export default function CitizenAdvisory() {
  const [selectedWard, setSelectedWard] = useState(WARDS[2]);
  const [selectedLang, setSelectedLang] = useState('en');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: 20, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={18} color="#3B82F6" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Citizen Advisory</h1>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>Generate and distribute health advisories to citizens</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost"><Share2 size={14} /> Share All</button>
          <button className="btn btn-primary"><Download size={14} /> Download PDF</button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Ward selector */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>SELECT WARD</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {WARDS.map(ward => {
                const cat = getAQICategory(ward.aqi);
                return (
                  <motion.button
                    key={ward.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedWard(ward)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                      background: selectedWard.id === ward.id ? `${cat.bg}` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${selectedWard.id === ward.id ? cat.color + '44' : 'var(--border)'}`,
                      color: 'var(--text)', fontFamily: 'var(--font)',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{ward.name}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: cat.color }}>{ward.aqi}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Language selector */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>LANGUAGE</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => setSelectedLang(l.code)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                    background: selectedLang === l.code ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selectedLang === l.code ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
                    color: selectedLang === l.code ? '#60A5FA' : 'var(--text-muted)',
                    fontSize: 13, fontFamily: 'var(--font)', fontWeight: 500,
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>DISTRIBUTE ADVISORY</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button className="btn btn-primary" style={{ justifyContent: 'center' }}>
                <Phone size={14} /> Send SMS
              </button>
              <button className="btn btn-green" style={{ justifyContent: 'center' }}>
                <Share2 size={14} /> WhatsApp
              </button>
              <button className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={handleCopy}>
                <Copy size={14} /> {copied ? 'Copied!' : 'Copy Text'}
              </button>
              <button className="btn btn-ghost" style={{ justifyContent: 'center' }}>
                <Download size={14} /> Download PDF
              </button>
            </div>
            <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>📊 Reach Estimate</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {selectedWard.population.toLocaleString()} residents · {Math.round(selectedWard.population * 0.72).toLocaleString()} registered mobile numbers
              </div>
            </div>
          </div>
        </div>

        {/* Phone mockup */}
        <motion.div
          key={`${selectedWard.id}-${selectedLang}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}
        >
          <PhoneMockup ward={selectedWard} lang={selectedLang} />
        </motion.div>
      </div>
    </div>
  );
}
