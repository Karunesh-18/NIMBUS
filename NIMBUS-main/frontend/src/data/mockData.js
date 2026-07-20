export const WARDS = [
  { id: 1, name: "Koramangala", lat: 12.9352, lng: 77.6245, aqi: 187, population: 142000, risk: "High", industry: 3, construction: 7, traffic: "Heavy", temp: 28, humidity: 62, wind: "NE 12 km/h", pm25: 89, pm10: 134, no2: 67, so2: 23, co: 1.8, o3: 45, primarySource: "Construction Dust", secondarySource: "Vehicle Emissions", vulnerabilityScore: 78 },
  { id: 2, name: "Whitefield", lat: 12.9698, lng: 77.7499, aqi: 156, population: 198000, risk: "Medium", industry: 12, construction: 4, traffic: "Moderate", temp: 27, humidity: 58, wind: "SW 8 km/h", pm25: 72, pm10: 108, no2: 54, so2: 18, co: 1.4, o3: 38, primarySource: "Industrial Emissions", secondarySource: "Construction Dust", vulnerabilityScore: 62 },
  { id: 3, name: "Hebbal", lat: 13.0358, lng: 77.5970, aqi: 234, population: 87000, risk: "Critical", industry: 8, construction: 11, traffic: "Heavy", temp: 29, humidity: 55, wind: "N 15 km/h", pm25: 118, pm10: 178, no2: 89, so2: 34, co: 2.4, o3: 62, primarySource: "Industrial Emissions", secondarySource: "Traffic Congestion", vulnerabilityScore: 91 },
  { id: 4, name: "Indiranagar", lat: 12.9784, lng: 77.6408, aqi: 98, population: 112000, risk: "Low", industry: 1, construction: 2, traffic: "Moderate", temp: 27, humidity: 64, wind: "E 6 km/h", pm25: 44, pm10: 72, no2: 38, so2: 12, co: 0.9, o3: 28, primarySource: "Vehicle Emissions", secondarySource: "Dust", vulnerabilityScore: 41 },
  { id: 5, name: "Jayanagar", lat: 12.9250, lng: 77.5938, aqi: 67, population: 156000, risk: "Low", industry: 0, construction: 1, traffic: "Light", temp: 26, humidity: 68, wind: "SW 5 km/h", pm25: 28, pm10: 45, no2: 22, so2: 8, co: 0.6, o3: 18, primarySource: "Vehicle Emissions", secondarySource: "Biomass Burning", vulnerabilityScore: 22 },
  { id: 6, name: "Electronic City", lat: 12.8399, lng: 77.6770, aqi: 201, population: 234000, risk: "High", industry: 24, construction: 6, traffic: "Heavy", temp: 30, humidity: 52, wind: "SE 10 km/h", pm25: 98, pm10: 152, no2: 76, so2: 41, co: 2.1, o3: 55, primarySource: "Industrial Emissions", secondarySource: "Construction Dust", vulnerabilityScore: 84 },
  { id: 7, name: "Rajajinagar", lat: 12.9916, lng: 77.5530, aqi: 143, population: 98000, risk: "Medium", industry: 5, construction: 3, traffic: "Moderate", temp: 28, humidity: 60, wind: "W 7 km/h", pm25: 65, pm10: 98, no2: 48, so2: 16, co: 1.2, o3: 34, primarySource: "Traffic Congestion", secondarySource: "Industrial Emissions", vulnerabilityScore: 55 },
  { id: 8, name: "Yelahanka", lat: 13.1007, lng: 77.5963, aqi: 112, population: 76000, risk: "Medium", industry: 2, construction: 8, traffic: "Light", temp: 27, humidity: 65, wind: "N 9 km/h", pm25: 52, pm10: 84, no2: 41, so2: 14, co: 1.0, o3: 31, primarySource: "Construction Dust", secondarySource: "Vehicle Emissions", vulnerabilityScore: 48 },
  { id: 9, name: "BTM Layout", lat: 12.9166, lng: 77.6101, aqi: 178, population: 167000, risk: "High", industry: 2, construction: 9, traffic: "Heavy", temp: 29, humidity: 57, wind: "SE 11 km/h", pm25: 84, pm10: 128, no2: 63, so2: 21, co: 1.7, o3: 42, primarySource: "Construction Dust", secondarySource: "Traffic Congestion", vulnerabilityScore: 72 },
  { id: 10, name: "Marathahalli", lat: 12.9591, lng: 77.6974, aqi: 165, population: 189000, risk: "High", industry: 6, construction: 5, traffic: "Heavy", temp: 28, humidity: 59, wind: "E 8 km/h", pm25: 78, pm10: 118, no2: 58, so2: 19, co: 1.5, o3: 40, primarySource: "Traffic Congestion", secondarySource: "Industrial Emissions", vulnerabilityScore: 67 },
]

export const getAQICategory = (aqi) => {
  if (aqi <= 50) return { label: "Good", color: "#10B981", bg: "rgba(16,185,129,0.15)", textClass: "text-emerald-400" }
  if (aqi <= 100) return { label: "Satisfactory", color: "#84CC16", bg: "rgba(132,204,22,0.15)", textClass: "text-lime-400" }
  if (aqi <= 150) return { label: "Moderate", color: "#F59E0B", bg: "rgba(245,158,11,0.15)", textClass: "text-amber-400" }
  if (aqi <= 200) return { label: "Poor", color: "#F97316", bg: "rgba(249,115,22,0.15)", textClass: "text-orange-400" }
  if (aqi <= 300) return { label: "Severe", color: "#EF4444", bg: "rgba(239,68,68,0.15)", textClass: "text-red-400" }
  return { label: "Hazardous", color: "#C084FC", bg: "rgba(192,132,252,0.15)", textClass: "text-purple-400" }
}

export const ENFORCEMENT_CASES = [
  { id: "ENF-001", priority: "critical", ward: "Hebbal", location: "KIADB Industrial Area, Sector 4", violation: "Illegal Waste Burning", entity: "Sunrise Chemicals Pvt Ltd", riskScore: 94, officer: "Insp. Ramesh Kumar", status: "active", deadline: "2024-12-20" },
  { id: "ENF-002", priority: "high", ward: "Electronic City", location: "Phase 2, Plot 47", violation: "Excess Industrial Emissions", entity: "TechFab Industries", riskScore: 87, officer: "Insp. Priya Sharma", status: "investigating", deadline: "2024-12-22" },
  { id: "ENF-003", priority: "high", ward: "Koramangala", location: "80 Feet Road Construction Site", violation: "Dust Suppression Violation", entity: "BuildRight Contractors", riskScore: 81, officer: "Insp. Arun Nair", status: "notice_issued", deadline: "2024-12-18" },
  { id: "ENF-004", priority: "medium", ward: "BTM Layout", location: "Outer Ring Road, Km 14", violation: "Overloaded Trucks", entity: "Aggregate Transport Co.", riskScore: 68, officer: "Insp. Sunita Rao", status: "active", deadline: "2024-12-25" },
  { id: "ENF-005", priority: "medium", ward: "Whitefield", location: "ITPL Road Industrial Zone", violation: "Stack Emission Violation", entity: "Precision Metals Ltd", riskScore: 72, officer: "Insp. Vikram Singh", status: "resolved", deadline: "2024-12-15" },
  { id: "ENF-006", priority: "low", ward: "Rajajinagar", location: "Chord Road, Near Market", violation: "Open Waste Burning", entity: "BBMP Ward 42", riskScore: 45, officer: "Insp. Meena Pillai", status: "notice_issued", deadline: "2024-12-28" },
  { id: "ENF-007", priority: "critical", ward: "Electronic City", location: "Phase 1, Chemical Storage", violation: "Unauthorized Chemical Disposal", entity: "ChemTech Solutions", riskScore: 96, officer: "Insp. Ramesh Kumar", status: "active", deadline: "2024-12-19" },
]

export const LIVE_ALERTS = [
  { id: 1, type: "critical", icon: "🚨", title: "AQI Spike Detected", message: "Hebbal ward AQI crossed 230 — immediate action required", time: "2 min ago", ward: "Hebbal" },
  { id: 2, type: "ai", icon: "🤖", title: "AI Prediction Alert", message: "Electronic City AQI predicted to reach 250 by 6 PM today", time: "8 min ago", ward: "Electronic City" },
  { id: 3, type: "weather", icon: "🌬️", title: "Wind Pattern Change", message: "Wind direction shifted NE — pollution may spread to Yelahanka", time: "15 min ago", ward: "Yelahanka" },
  { id: 4, type: "enforcement", icon: "⚖️", title: "Enforcement Update", message: "Notice issued to BuildRight Contractors, Koramangala", time: "22 min ago", ward: "Koramangala" },
  { id: 5, type: "advisory", icon: "📢", title: "Citizen Advisory Sent", message: "Health advisory dispatched to 234,000 residents in Electronic City", time: "35 min ago", ward: "Electronic City" },
  { id: 6, type: "simulation", icon: "🔬", title: "Simulation Complete", message: "Traffic reduction scenario shows 18% AQI improvement in BTM Layout", time: "48 min ago", ward: "BTM Layout" },
]

export const AQI_HISTORY = [
  { time: "00:00", hebbal: 198, electronic: 178, koramangala: 156, btm: 145, whitefield: 132 },
  { time: "04:00", hebbal: 176, electronic: 165, koramangala: 142, btm: 132, whitefield: 122 },
  { time: "08:00", hebbal: 224, electronic: 198, koramangala: 178, btm: 168, whitefield: 152 },
  { time: "12:00", hebbal: 234, electronic: 201, koramangala: 187, btm: 178, whitefield: 156 },
  { time: "16:00", hebbal: 238, electronic: 208, koramangala: 191, btm: 181, whitefield: 162 },
  { time: "20:00", hebbal: 236, electronic: 209, koramangala: 189, btm: 180, whitefield: 161 },
  { time: "Now", hebbal: 234, electronic: 201, koramangala: 187, btm: 178, whitefield: 156 },
]

export const POLLUTION_SOURCES = [
  { name: "Industrial", value: 34, color: "#EF4444" },
  { name: "Vehicles", value: 28, color: "#F97316" },
  { name: "Construction", value: 22, color: "#F59E0B" },
  { name: "Waste Burning", value: 9, color: "#8B5CF6" },
  { name: "Biomass", value: 4, color: "#10B981" },
  { name: "Other", value: 3, color: "#64748B" },
]

export const NOTIFICATIONS = [
  { id: 1, type: "critical", title: "Critical AQI Alert", message: "Hebbal AQI reached 234 — Severe category", time: "2 min ago", read: false },
  { id: 2, type: "ai", title: "AI Prediction Ready", message: "Tomorrow's forecast generated with 89% confidence", time: "10 min ago", read: false },
  { id: 3, type: "enforcement", title: "Enforcement Action", message: "Notice issued to 3 violators in Koramangala", time: "25 min ago", read: false },
  { id: 4, type: "advisory", title: "Advisory Dispatched", message: "SMS advisory sent to 421,000 residents", time: "1 hr ago", read: true },
  { id: 5, type: "report", title: "Weekly Report Ready", message: "AI-generated report available for download", time: "2 hr ago", read: true },
]
