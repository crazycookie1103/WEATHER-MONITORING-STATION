import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: '#666', margin: '0 0 6px' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>{p.name}: <b>{p.value}</b></p>
      ))}
    </div>
  );
};

export default function HistoryChart({ readings }) {
  const data = [...readings].reverse().map(r => ({
    t: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    'Temp °C': r.temperature,
    'Humidity %': r.humidity,
    'Pressure hPa': r.pressure,
  }));

  return (
    <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 14, padding: '20px 20px 10px', marginBottom: 20 }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: 1 }}>
        📈 History — last 200 readings
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2133" />
          <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#555' }} interval="preserveStartEnd" />
          <YAxis yAxisId="t" tick={{ fontSize: 11, fill: '#555' }} />
          <YAxis yAxisId="p" orientation="right" tick={{ fontSize: 11, fill: '#555' }} domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#666' }} />
          <Line yAxisId="t" type="monotone" dataKey="Temp °C" stroke="#4f9cf9" dot={false} strokeWidth={2} />
          <Line yAxisId="t" type="monotone" dataKey="Humidity %" stroke="#43c59e" dot={false} strokeWidth={2} />
          <Line yAxisId="p" type="monotone" dataKey="Pressure hPa" stroke="#f0a04b" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}