const METRICS = [
  { key: 'temperature',   label: 'Temperature', unit: '°C',  icon: '🌡', warn: [10, 40] },
  { key: 'humidity',      label: 'Humidity',    unit: '%',   icon: '💧', warn: [20, 85] },
  { key: 'pressure',      label: 'Pressure',    unit: ' hPa', icon: '🔵', warn: [980, 1040] },
  { key: 'altitude',      label: 'Altitude',    unit: ' m',  icon: '⛰', warn: null },
  { key: 'light_percent', label: 'Light',       unit: '%',   icon: '☀️', warn: null },
];

export default function LiveGauges({ latest, summary }) {
  if (!latest) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
      {METRICS.map(m => (
        <div key={m.key} style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 14, padding: '20px', height: 110 }}>
          <div style={{ width: 60, height: 12, background: '#2a2d3a', borderRadius: 4, marginBottom: 12 }} />
          <div style={{ width: 80, height: 28, background: '#2a2d3a', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
      {METRICS.map(m => {
        const val = latest[m.key];
        const warn = m.warn && (val < m.warn[0] || val > m.warn[1]);
        return (
          <div key={m.key} style={{
            background: warn ? '#2a1215' : '#1a1d27',
            border: `1px solid ${warn ? '#5c2127' : '#2a2d3a'}`,
            borderRadius: 14,
            padding: '20px',
            transition: 'border-color 0.3s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: warn ? '#ff6b6b' : '#666', textTransform: 'uppercase', letterSpacing: 1 }}>{m.label}</span>
              <span style={{ fontSize: 18 }}>{m.icon}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: warn ? '#ff6b6b' : '#fff', lineHeight: 1 }}>
              {val?.toFixed(1)}<span style={{ fontSize: 14, fontWeight: 400, color: '#666', marginLeft: 3 }}>{m.unit}</span>
            </div>
            {summary?.[m.key] && (
              <div style={{ marginTop: 10, fontSize: 11, color: '#555' }}>
                ↓ {summary[m.key].min} · avg {summary[m.key].avg} · ↑ {summary[m.key].max}
              </div>
            )}
            {warn && <div style={{ marginTop: 8, fontSize: 11, color: '#ff6b6b' }}>⚠ Out of range</div>}
          </div>
        );
      })}
    </div>
  );
}