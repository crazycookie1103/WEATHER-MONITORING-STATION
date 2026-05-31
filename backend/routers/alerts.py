from fastapi import APIRouter
from database import supabase

router = APIRouter()

@router.get("/alerts")
def get_alerts(limit: int = 50):
    return supabase.table("alerts_log").select("*").order("triggered_at", desc=True).limit(limit).execute().data

@router.get("/alerts/thresholds")
def get_thresholds():
    return supabase.table("alert_thresholds").select("*").execute().data

@router.put("/alerts/thresholds/{metric}")
def update_threshold(metric: str, min_value: float, max_value: float):
    supabase.table("alert_thresholds").update({
        "min_value": min_value,
        "max_value": max_value
    }).eq("metric", metric).execute()
    return {"status": "updated"}