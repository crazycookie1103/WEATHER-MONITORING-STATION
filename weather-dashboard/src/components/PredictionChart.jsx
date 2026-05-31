import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: '#a78bfa', margin: 0 }}>Predicted: <b>{payload[0]?.value}°C</b></p>
      <p style={{ color: '#555', margin: '4px 0 0' }}>Confidence: {payload[0]?.payload?.conf}</p>
    </div>
  );
};

export default function PredictionChart({ predictions, latest }) {
  const data = predictions.filter(p => p.metric === 'temperature').map(p => ({
    t: new Date(p.predicted_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: p.predicted_value,
    conf: (p.confidence * 100).toFixed(0) + '%',
  }));

  if (!data.length) return (
    <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 14, padding: 20, marginBottom: 20, color: '#555', fontSize: 13 }}>
      🔮 Predictions will appear after 20 readings are collected.
    </div>
  );

  return (
    <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 14, padding: '20px 20px 10px', marginBottom: 20 }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>
        🔮 Temperature Forecast — next 6 hours
      </h2>
      <p style={{ fontSize: 12, color: '#555', margin: '0 0 20px' }}>Linear trend model · updates every 10 readings</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2133" />
          <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#555' }} interval={1} />
          <YAxis tick={{ fontSize: 11, fill: '#555' }} domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          {latest && <ReferenceLine y={latest.temperature} stroke="#ff6b6b" strokeDasharray="4 2" label={{ value: 'now', fill: '#ff6b6b', fontSize: 11 }} />}
          <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2.5} dot={{ r: 3, fill: '#a78bfa' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}