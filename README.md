# IOT INDOOR CLIMATE ANALYSER

A full-stack monitoring system that reads real-time environmental data from an ESP32 microcontroller and displays it on a live web dashboard with ML-powered forecasting and threshold-based alerts.

**Live Demo:** [weather-dashboard.vercel.app](https://weather-monitoring-station.vercel.app/) · **API:** [weather-api.onrender.com](https://weather-monitoring-station.onrender.com)

---

## What it does

- Reads temperature, humidity, pressure, altitude, and light from sensors attached to an ESP32 display them on tht spi real time
- Sends data to a FastAPI backend every 30 seconds via HTTP POST
- Stores all readings in a Supabase (PostgreSQL) database
- Runs polynomial regression ML to forecast the next 6 hours of temperature, humidity, and pressure
- Triggers alerts when any sensor value crosses a configured threshold
- Displays everything on a React dashboard with live charts, a daily heatmap, and alert notifications 

---

## Tech stack

| Layer | Technology | Purpose |
|---|---|---|
| Hardware | ESP32 + DHT11 + BMP280 + LDR+tht display | Sensor data collection |
| Backend | FastAPI (Python) | REST API, ML pipeline, alert logic |
| Database | Supabase (PostgreSQL) | Data storage, 4 tables |
| ML | NumPy polyfit (degree-3) | 6-hour sensor forecasting |
| Frontend | React 18 + Vite | Live dashboard UI |
| Charts | Recharts | Line charts, area charts |
| Notifications | react-hot-toast | Alert toasts |
| Backend hosting | Render.com | Free tier web service |
| Frontend hosting | Vercel | Auto-deploy from GitHub |

---

## Hardware setup

### Sensors
| Sensor | Measures | Connection |
|---|---|---|
| DHT11 | Temperature + Humidity | GPIO pin 4 (digital) |
| BMP280 | Pressure + Altitude | I2C at address 0x76 |
| LDR | Light intensity | GPIO pin 34 (analog ADC) |

### Data payload (sent every 30s)
```json
{
  "temperature": 28.5,
  "humidity": 62.0,
  "pressure": 1012.3,
  "altitude": 216.4,
  "light_percent": 74,
  "ldr_raw": 3032
}
```

---

## Project structure

```
westher/
├── backend/                    # FastAPI application
│   ├── main.py                 # App entry point, CORS, router registration
│   ├── config.py               # Environment variable loading
│   ├── database.py             # Supabase client initialisation
│   ├── models.py               # Pydantic request/response models
│   ├── requirements.txt
│   ├── render.yaml             # Render deployment config
│   ├── routers/
│   │   ├── readings.py         # POST/GET sensor readings
│   │   ├── analytics.py        # Summary stats + predictions
│   │   └── alerts.py           # Alert log + threshold management
│   └── services/
│       ├── ml.py               # Polynomial regression forecasting
│       └── alert_checker.py    # Threshold breach detection
│
└── weather-dashboard/          # React frontend
    ├── src/
    │   ├── api.js              # All API calls in one place
    │   ├── App.jsx             # Root component, polling logic
    │   └── components/
    │       ├── LiveGauges.jsx      # Sensor value cards with gauge rings
    │       ├── HistoryChart.jsx    # Historical line chart (Recharts)
    │       ├── PredictionChart.jsx # ML forecast area chart
    │       ├── HeatmapCalendar.jsx # Daily average heatmap
    │       └── AlertPanel.jsx      # Recent alerts panel
    └── vite.config.js
```

---

## API endpoints

### Readings
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/readings` | Ingest sensor reading (requires X-API-Key header) |
| `GET` | `/api/readings` | Get last N readings (default 100) |
| `GET` | `/api/readings/latest` | Get most recent reading |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/summary?hours=24` | Min/max/avg for all metrics over time window |
| `GET` | `/api/analytics/predictions` | Next 6 hours of ML predictions |

### Alerts
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/alerts` | Recent alert log |
| `GET` | `/api/alerts/thresholds` | Current threshold config |
| `PUT` | `/api/alerts/thresholds/{metric}` | Update min/max for a metric |

Full interactive docs available at `/docs` when the backend is running.

---

## Database schema

```sql
-- All sensor readings from ESP32
create table sensor_readings (
  id           bigserial primary key,
  created_at   timestamptz default now(),
  temperature  float,
  humidity     float,
  pressure     float,
  altitude     float,
  light_percent int,
  ldr_raw      int
);

-- ML forecast output
create table predictions (
  id              bigserial primary key,
  created_at      timestamptz default now(),
  predicted_for   timestamptz,
  metric          text,
  predicted_value float,
  confidence      float
);

-- Threshold configuration
create table alert_thresholds (
  id         bigserial primary key,
  metric     text unique,
  min_value  float,
  max_value  float,
  enabled    bool default true
);

-- Alert history
create table alerts_log (
  id                 bigserial primary key,
  triggered_at       timestamptz default now(),
  metric             text,
  value              float,
  threshold_breached text,
  message            text
);

-- Speed up time-range queries
create index idx_readings_time on sensor_readings(created_at desc);
```

### Default alert thresholds
| Metric | Min | Max |
|---|---|---|
| Temperature | 10°C | 45°C |
| Humidity | 20% | 90% |
| Pressure | 970 hPa | 1050 hPa |
| Light | 0% | 100% |

---

## ML forecasting

**Algorithm:** Degree-3 Polynomial Regression via `numpy.polyfit`

Fits a cubic curve `y = ax³ + bx² + cx + d` through the last 200 readings. The reading index is used as the time variable (X), and the sensor value is Y. NumPy's polyfit solves the least squares problem using QR decomposition.

**Why degree-3 polynomial over linear regression?**
Temperature follows a curve through the day — rising in the morning, peaking in the afternoon, dropping at night. A straight line can't capture that. A cubic polynomial fits the natural shape of daily temperature cycles.

**Predictions:** 12 steps × 30 minutes = 6 hours ahead, for temperature, humidity, and pressure.

**Confidence score:** `1 - (residual_std / abs(mean))` — how closely the fitted curve matches actual readings. Close to 1.0 = highly predictable data. Close to 0 = noisy/erratic readings.

**Value clamping:** Predicted values are hard-clamped to prevent polynomial overshoot at the edges:
- Temperature: −20°C to 80°C
- Humidity: 0% to 100%
- Pressure: 900 hPa to 1100 hPa

**Trigger:** Runs every 10th reading (approximately every 5 minutes). Old predictions are deleted before new ones are inserted.

**Upgrade path:** Once 2+ weeks of data are collected, `services/ml.py` can be swapped for Facebook Prophet which learns daily/weekly seasonality patterns. The rest of the pipeline (database, API, frontend) stays unchanged.

---

## Local development

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- A Supabase project (free tier at supabase.com)

### Backend setup
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
API_KEY=your-secret-key
```

Run the SQL schema in your Supabase SQL editor, then:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```



### Frontend setup
```bash
cd weather-dashboard
npm install
npm run dev
```

## Deployment

### Backend → Render
1. Push backend folder to a GitHub repository
2. Go to render.com → New Web Service → connect repository
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables: `SUPABASE_URL`, `SUPABASE_KEY`, `API_KEY`

### Frontend → Vercel
1. Push weather-dashboard folder to GitHub
2. Go to vercel.com → New Project → import repository
3. Add environment variable: `VITE_API_URL=https://your-app.onrender.com`
4. Deploy — Vercel auto-detects Vite and builds correctly

---

## Environment variables

### Backend (.env)
| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Service role key (from Supabase → Settings → API) |
| `API_KEY` | Secret key for ESP32 authentication |

### Frontend (.env)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (localhost:8000 locally, Render URL in prod) |

---

## Features

- **Live sensor gauges** — real-time cards for all 5 metrics with visual warning state when thresholds are crossed
- **History chart** — last 200 readings as a line chart with dual Y-axes (temp/humidity vs pressure)
- **6-hour forecast** — polynomial regression predictions shown as an area chart with confidence tooltip
- **Daily heatmap** — last 35 days of daily averages with 4-stop colour scale, switchable between all 4 metrics, hover for min/max/count
- **Alert panel** — shows recent threshold breaches, auto-hides alerts older than 10 minutes, dismissible
- **Toast notifications** — new alerts pop up automatically and dismiss after 2 minutes




