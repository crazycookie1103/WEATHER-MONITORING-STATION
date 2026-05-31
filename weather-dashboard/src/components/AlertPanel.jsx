import { useState, useEffect } from 'react';

export default function AlertPanel({ alerts }) {
  const [dismissed, setDismissed] = useState(new Set());
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    if (!alerts.length) return;

    // Only show alerts from last 10 minutes
    const tenMinsAgo = Date.now() - 10 * 60 * 1000;
    const recent = alerts.filter(a => {
      const age = new Date(a.triggered_at).getTime();
      return age > tenMinsAgo && !dismissed.has(a.id);
    });

    setVisible(recent);

    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      setVisible([]);
    }, 8000);

    return () => clearTimeout(timer);
  }, [alerts, dismissed]);

  const dismiss = (id) => {
    setDismissed(prev => new Set([...prev, id]));
    setVisible(prev => prev.filter(a => a.id !== id));
  };

  const dismissAll = () => {
    const ids = visible.map(a => a.id);
    setDismissed(prev => new Set([...prev, ...ids]));
    setVisible([]);
  };

  if (!visible.length) return null;

  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 24,
      border: '1px solid var(--color-border-danger)',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--color-background-danger)',
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--color-border-danger)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-danger)' }}>
          ⚠ {visible.length} alert{visible.length > 1 ? 's' : ''}
        </span>
        <button
          onClick={dismissAll}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            color: 'var(--color-text-danger)',
            padding: '2px 8px',
            borderRadius: 6,
            border: '1px solid var(--color-border-danger)',
          }}
        >
          Dismiss all
        </button>
      </div>

      {/* Alert rows */}
      {visible.map(a => (
        <div key={a.id} style={{
          background: 'var(--color-background-danger)',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--color-border-danger)',
        }}>
          <div>
            <span style={{ fontSize: 12, color: 'var(--color-text-danger)' }}>
              {a.message}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginLeft: 10 }}>
              {new Date(a.triggered_at).toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={() => dismiss(a.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              color: 'var(--color-text-danger)',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ))}

      {/* Auto-dismiss countdown bar */}
      <div style={{
        height: 3,
        background: 'var(--color-border-danger)',
        animation: 'shrink 8s linear forwards',
      }} />

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}