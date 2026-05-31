from fastapi import APIRouter, Header, HTTPException, Depends
from models import Reading
from database import supabase
from services.alert_checker import check_alerts
from services.ml import run_predictions
from config import API_KEY

router = APIRouter()

def verify_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")

@router.post("/readings", dependencies=[Depends(verify_key)])
def ingest_reading(reading: Reading):
    result = supabase.table("sensor_readings").insert(reading.dict()).execute()
    new_id = result.data[0]["id"]
    check_alerts(reading)
    if new_id % 10 == 0:
        run_predictions()
    return {"id": new_id, "status": "stored"}

@router.get("/readings")
def get_readings(limit: int = 100):
    return supabase.table("sensor_readings").select("*").order("created_at", desc=True).limit(limit).execute().data

@router.get("/readings/latest")
def latest_reading():
    result = supabase.table("sensor_readings").select("*").order("created_at", desc=True).limit(1).execute()
    if not result.data:
        raise HTTPException(404, "No readings yet")
    return result.data[0]