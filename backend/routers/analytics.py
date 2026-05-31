from fastapi import APIRouter
from database import supabase
from datetime import datetime, timedelta, timezone

router = APIRouter()

@router.get("/analytics/summary")
def summary(hours: int = 24):
    since = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    data = supabase.table("sensor_readings").select(
        "temperature,humidity,pressure,altitude,light_percent,created_at"
    ).gte("created_at", since).execute().data

    if not data:
        return {}

    metrics = ["temperature", "humidity", "pressure", "altitude", "light_percent"]
    result = {}
    for m in metrics:
        values = [float(r[m]) for r in data if r[m] is not None]
        if not values:
            continue
        result[m] = {
            "min":    round(min(values), 2),
            "max":    round(max(values), 2),
            "avg":    round(sum(values) / len(values), 2),
            "latest": round(values[0], 2),
        }
    result["reading_count"] = len(data)
    result["hours"] = hours
    return result

@router.get("/analytics/predictions")
def get_predictions():
    return supabase.table("predictions").select("*").order("predicted_for").limit(24).execute().data
@router.get("/analytics/accuracy")
def get_accuracy():
    from services.ml import calculate_accuracy
    result = calculate_accuracy()
    if not result:
        return {"message": "Not enough data yet — needs at least 6 hours of readings"}
    return result