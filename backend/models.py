from pydantic import BaseModel
from datetime import datetime

class Reading(BaseModel):
    temperature: float
    humidity: float
    pressure: float
    altitude: float
    light_percent: int
    ldr_raw: int

class ReadingOut(Reading):
    id: int
    created_at: datetime