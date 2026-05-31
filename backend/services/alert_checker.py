from database import supabase
from models import Reading

METRICS = ["temperature", "humidity", "pressure", "light_percent"]

def check_alerts(reading: Reading):
    thresholds = supabase.table("alert_thresholds").select("*").eq("enabled", True).execute().data
    thresh_map = {t["metric"]: t for t in thresholds}

    for metric in METRICS:
        value = getattr(reading, metric)
        t = thresh_map.get(metric)
        if not t:
            continue
        breach = None
        if value < t["min_value"]:
            breach = "min"
            msg = f"{metric} is {value} — below minimum {t['min_value']}"
        elif value > t["max_value"]:
            breach = "max"
            msg = f"{metric} is {value} — above maximum {t['max_value']}"
        if breach:
            supabase.table("alerts_log").insert({
                "metric": metric,
                "value": value,
                "threshold_breached": breach,
                "message": msg
            }).execute()