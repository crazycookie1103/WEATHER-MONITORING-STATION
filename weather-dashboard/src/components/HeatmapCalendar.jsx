import { useState } from 'react';

const METRICS = [
  { key: 'temperature',   label: 'Temp',     unit: '°C',  colors: ['#0e3a6e','#1d6fa4','#f0a04b','#ef4444'] },
  { key: 'humidity',      label: 'Humidity', unit: '%',   colors: ['#0e3a1a','#1a7a40','#4ade80','#dcfce7'] },
  { key: 'pressure',      label: 'Pressure', unit: ' hPa', colors: ['#2a0e4a','#5b3fa6','#a78bfa','#ede9fe'] },
  { key: 'light_percent', label: 'Light',    unit: '%',   colors: ['#1a1200','#7a5800','#facc15','#fefce8'] },
];

function getColor(pct, colors) {
  if (pct < 0.25) return colors[0];
  if (pct < 0.50) return colors[1];
  if (pct < 0.75) return colors[2];
  return colors[3];
}

function Tooltip({ day, unit }) {
  return (
    <div style={{
      position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
      background: '#0a0c13', border: '1px solid #2a2d3a', borderRadius: 8,
      padding: '8px 12px', whiteSpace: 'nowrap', zIndex: 99, pointerEvents: 'none',
      fontSize: 11, color: '#ccc', boxShadow: '0 4px 16px #0008'
    }}>
      <div style={{ fontWeight: 700, color: '#fff', marginBottom: 3 }}>{day.date}</div>
      <div>avg <span style={{ color: '#fff', fontWeight: 600 }}>{day.avg.toFixed(1)}{unit}</span></div>
      <div style={{ color: '#555' }}>{day.count} readings</div>
      <div style={{ color: '#555' }}>↓{day.min.toFixed(1)} ↑{day.max.toFixed(1)}{unit}</div>
    </div>
  );
}

export default function HeatmapCalendar({ readings }) {
  const [activeMetric, setActiveMetric] = useState('temperature');
  const [hoveredDay, setHoveredDay] = useState(null);

  if (!readings.length) return null;

  const metric = METRICS.find(m => m.key === activeMetric);

  const byDate = {};
  readings.forEach(r => {
    const d = new Date(r.created_at).toLocaleDateString('en-GB');
    if (!byDate[d]) byDate[d] = [];
    if (r[activeMetric] != null) byDate[d].push(r[activeMetric]);
  });

  const days = Object.entries(byDate).map(([date, vals]) => ({
    date,
    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
    min: Math.min(...vals),
    max: Math.max(...vals),
    count: vals.length,
  })).slice(-35);

  const avgValues = days.map(d => d.avg);
  const minVal = Math.min(...avgValues);
  const maxVal = Math.max(...avgValues);

  return (
    <div style={{ background: '#13151f', border: '1px solid #1f2133', borderRadius: 16, padding: 20, marginBottom: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
            🗓 Daily Heatmap
          </h2>
          <p style={{ fontSize: 11, color: '#444', margin: '3px 0 0' }}>Last {days.length} days · hover for details</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {METRICS.map(m => (
            <button key={m.key} onClick={() => setActiveMetric(m.key)} style={{
              fontSize: 11, padding: '5px 12px', borderRadius: 20, border: 'none',
              cursor: 'pointer', transition: 'all 0.2s',
              background: activeMetric === m.key ? '#378ADD' : '#1f2133',
              color: activeMetric === m.key ? '#fff' : '#555',
              fontWeight: activeMetric === m.key ? 600 : 400
            }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {days.length === 0 ? (
        <p style={{ color: '#444', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
          Not enough data yet — come back tomorrow.
        </p>
      ) : (
        <>
          {/* Grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {days.map(d => {
              const pct = (d.avg - minVal) / (maxVal - minVal || 1);
              const bg = getColor(pct, metric.colors);
              const isHovered = hoveredDay?.date === d.date;
              return (
                <div key={d.date}
                  onMouseEnter={() => setHoveredDay(d)}
                  onMouseLeave={() => setHoveredDay(null)}
                  style={{
                    position: 'relative', width: 52, height: 52, borderRadius: 10,
                    background: bg, border: isHovered ? '2px solid #fff' : '1px solid #ffffff15',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', cursor: 'default',
                    transform: isHovered ? 'scale(1.12)' : 'scale(1)',
                    transition: 'transform 0.15s, border 0.15s',
                    zIndex: isHovered ? 10 : 1,
                    boxShadow: isHovered ? `0 0 16px ${bg}88` : 'none'
                  }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px #0009', lineHeight: 1 }}>
                    {new Date(d.date.split('/').reverse().join('-')).getDate()}
                  </span>
                  <span style={{ fontSize: 10, color: '#ffffffcc', textShadow: '0 1px 4px #0009', marginTop: 2 }}>
                    {d.avg.toFixed(1)}{metric.unit}
                  </span>
                  {isHovered && <Tooltip day={d} unit={metric.unit} />}
                </div>
              );
            })}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 20, marginTop: 18, paddingTop: 14, borderTop: '1px solid #1f2133', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#555' }}>Low</span>
              {metric.colors.map((c, i) => (
                <div key={i} style={{ width: 20, height: 12, borderRadius: 3, background: c, border: '1px solid #ffffff11' }} />
              ))}
              <span style={{ fontSize: 11, color: '#555' }}>High</span>
            </div>
            <div style={{ fontSize: 12, color: '#555' }}>
              Range: <span style={{ color: '#888' }}>{minVal.toFixed(1)} – {maxVal.toFixed(1)}{metric.unit}</span>
            </div>
            <div style={{ fontSize: 12, color: '#555' }}>
              Days tracked: <span style={{ color: '#888' }}>{days.length}</span>
            </div>
            <div style={{ fontSize: 12, color: '#555', marginLeft: 'auto' }}>
              Overall avg: <span style={{ color: '#fff', fontWeight: 600 }}>
                {(avgValues.reduce((a, b) => a + b, 0) / avgValues.length).toFixed(1)}{metric.unit}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}