export default function AccuracyPanel({ accuracy }) {
  if (!accuracy || Object.keys(accuracy).length === 0) {
    return (
      <div style={{
        background: 'var(--color-background-secondary)',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 24,
        border: '1px solid var(--color-border-tertiary)',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>ML prediction accuracy</h2>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
          Needs 6+ hours of data to calculate accuracy
        </p>
      </div>
    );
  }

  const color = (pct) => {
    if (pct >= 90) return '#1D9E75';
    if (pct >= 75) return '#BA7517';
    return '#E24B4A';
  };

  const label = (pct) => {
    if (pct >= 90) return 'Excellent';
    if (pct >= 75) return 'Good';
    if (pct >= 60) return 'Fair';
    return 'Poor';
  };

  return (
    <div style={{
      background: 'var(--color-background-secondary)',
      borderRadius: 12,
      padding: '16px 20px',
      marginBottom: 24,
      border: '1px solid var(--color-border-tertiary)',
    }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>ML prediction accuracy</h2>
      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
        Comparing past predictions vs actual sensor readings
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {Object.entries(accuracy).map(([metric, data]) => (
          <div key={metric} style={{
            background: 'var(--color-background-primary)',
            borderRadius: 10,
            padding: '14px 16px',
            border: '1px solid var(--color-border-tertiary)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'capitalize' }}>
              {metric}
            </div>

            {/* Accuracy bar */}
            <div style={{ height: 6, background: 'var(--color-border-tertiary)', borderRadius: 3, marginBottom: 8 }}>
              <div style={{
                height: '100%',
                width: `${data.accuracy_percent}%`,
                background: color(data.accuracy_percent),
                borderRadius: 3,
                transition: 'width 0.6s ease',
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 24, fontWeight: 500, color: color(data.accuracy_percent) }}>
                {data.accuracy_percent}%
              </span>
              <span style={{ fontSize: 11, color: color(data.accuracy_percent) }}>
                {label(data.accuracy_percent)}
              </span>
            </div>

            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
              avg error {data.avg_error_percent}% · {data.samples_compared} samples
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}