import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { getLatest, getReadings, getSummary, getPredictions, getAlerts, getAccuracy } from './api';
import AccuracyPanel from './components/AccuracyPanel';
import LiveGauges from './components/LiveGauges';
import HistoryChart from './components/HistoryChart';
import PredictionChart from './components/PredictionChart';
import AlertPanel from './components/AlertPanel';
import HeatmapCalendar from './components/HeatmapCalendar';

export default function App() {
  const [latest, setLatest] = useState(null);
  const [readings, setReadings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [accuracy, setAccuracy] = useState({});
  const [lastAlertId, setLastAlertId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = async () => {
    try {
      const [l, r, s, p, a, acc] = await Promise.all([
        getLatest(), getReadings(), getSummary(), getPredictions(), getAlerts(), getAccuracy()
      ]);
      setLatest(l);
      setReadings(r);
      setSummary(s);
      setPredictions(p);
      setAccuracy(acc);
      setLastUpdated(new Date());
     if (a.length && a[0].id !== lastAlertId) {
  const alertAge = Date.now() - new Date(a[0].triggered_at).getTime();
  if (alertAge < 10 * 60 * 1000) {
    toast.error(a[0].message, { duration: 6000 });
  }
  setLastAlertId(a[0].id);
}
      setAlerts(a);
    } catch (e) {
      toast.error('Cannot reach backend');
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#e8e8e8', fontFamily: 'system-ui, sans-serif' }}>
      <Toaster position="top-right" />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, color: '#fff' }}>🌤 Weather Station</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>ESP32 · Live sensor dashboard</p>
          </div>
          <div style={{ fontSize: 12, color: '#555', textAlign: 'right' }}>
            {lastUpdated && (
              <>Last updated<br />
              <span style={{ color: '#888' }}>{lastUpdated.toLocaleTimeString()}</span></>
            )}
          </div>
        </div>

        <LiveGauges latest={latest} summary={summary} />
        <AlertPanel alerts={alerts} />
        <AccuracyPanel accuracy={accuracy} />
        <HistoryChart readings={readings} />
        <PredictionChart predictions={predictions} latest={latest} />
        <HeatmapCalendar readings={readings} />

      </div>
    </div>
  );
}