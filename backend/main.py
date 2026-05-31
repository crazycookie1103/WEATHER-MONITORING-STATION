from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import readings, analytics, alerts

app = FastAPI(title="Weather Monitor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(readings.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")


@app.get("/")
def home():
    return {"message": "Weather Monitor API Running"}