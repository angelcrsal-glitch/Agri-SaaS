from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random
import time
import asyncio
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi import File, UploadFile, Form
import json
from services.twilio_service import TwilioService
from models import AnalyzeRiskRequest, RiskAnalysisResponse, RiskLevel, NdviDataPoint, FarmCreate, Farm, WeatherData, RecommendationRequest
from db import supabase
from services.weather import get_current_weather
from services.ai_agronomist import get_agronomic_recommendation
from services.ai_agent import get_agri_advice
from models import AnalyzeRiskRequest, RiskAnalysisResponse, RiskLevel, NdviDataPoint, FarmCreate, Farm, WeatherData, RecommendationRequest, ChatRequest, FieldCreate
from services.sms_scheduler import scheduler
from services.compliance_service import ComplianceAuditService
from services.pdf_generator import generate_fira_report, generate_compliance_audit_pdf

class SMSRequest(BaseModel):
    to_phone: str
    message: str

class ScheduledSMSRequest(BaseModel):
    to_phone: str
    message: str
    send_at: datetime
    repeat_days: Optional[List[int]] = None

app = FastAPI(
    title="AgriSaaS API",
    description="Backend for AgriSaaS MVP - Satellite Data Processing",
    version="0.2.0"
)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(scheduler.worker_loop())

# CORS Configuration - Explicitly allowing localhost:5173
origins = [
    "http://localhost:5173", # Vite
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AgriSaaS Backend is running."}

@app.post("/save-farm", response_model=Farm)
async def save_farm(farm: FarmCreate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    # Convert Pydantic model to JSON-compatible dict (handles datetimes)
    data = jsonable_encoder(farm)
    
    try:
        response = supabase.table("farms").insert(data).execute()
        # response.data is a list of inserted records
        if not response.data:
             raise HTTPException(status_code=500, detail="Failed to save farm to Supabase")
        return response.data[0]
    except Exception as e:
        print(f"Error saving farm: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/farms", response_model=List[Farm])
async def get_farms():
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    try:
        response = supabase.table("farms").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching farms: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-risk", response_model=RiskAnalysisResponse)
async def analyze_risk(request: AnalyzeRiskRequest):
    """
    Receives polygon coordinates, simulates fetching satellite/weather data,
    and returns calculated risk metrics and time-series data.
    """
    
    # Defaults
    ndvi_val = 0.4
    analysis_date = datetime.utcnow()
    
    # 1. Calculate Centroid (Required for Weather, but we can survive without it)
    geo_dict = request.geometry.dict()
    try:
        coords = geo_dict['coordinates'][0]
        lons = [p[0] for p in coords]
        lats = [p[1] for p in coords]
        center_lon = sum(lons) / len(lons)
        center_lat = sum(lats) / len(lats)
    except Exception as e:
        print(f"Error calculating centroid: {e}")
        center_lon, center_lat = None, None

    # Fetch Weather (Independent Block)
    try:
        if center_lon is not None and center_lat is not None:
            weather_data = get_current_weather(center_lat, center_lon)
            if weather_data:
                weather_obj = WeatherData(**weather_data)
                temp_str = f"{weather_obj.temp}°C"
                moisture_str = f"{weather_obj.humidity}%"
            else:
                raise ValueError("Weather service returned None")
        else:
            raise ValueError("Invalid centroid")
            
    except Exception as e:
        print(f"⚠️ Weather failed: {e}, but proceeding to Satellite...")
        # Fallback mocks for UI
        weather_obj = None
        temp_str = "N/A"
        moisture_str = "N/A"

    # 2. Try to get Real Data from Sentinel Hub
    try:
        from services.sentinel import SentinelService
        sentinel = SentinelService()
        
        # Parallel-ish execution (sequential for MVP)
        # Fetch Real Image (Priority: High)
        img_base64, img_bounds, warning_tc = sentinel.get_true_color_image(geo_dict)
        
        # Fetch NDVI Heatmap
        ndvi_img_base64, _, warning_ndvi = sentinel.get_ndvi_visual_image(geo_dict)

        # Collect warnings
        warning = warning_tc or warning_ndvi

        # Fetch History
        history = sentinel.get_ndvi_stats(geo_dict)
        
        if history:
             # Use the most recent value for current risk score
             latest_entry = history[-1]
             ndvi_val = latest_entry['ndvi']
             analysis_date = datetime.utcnow() # Or latest_entry['date']
             
             # Populate trend from history
             ndvi_trend = [NdviDataPoint(month=entry['date'], value=entry['ndvi']) for entry in history]
        else:
             # Fallback if history is empty: Return empty trend but DO NOT FAIL the request
             print("Warning: No valid NDVI history found. Returning empty history.")
             ndvi_trend = []
             # ndvi_val remains default (0.4) or could be mocked slightly
        
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        print(f"Sentinel Hub Error (falling back to mock): {e}")
        # Fallback to Mock Data logic if keys missing or API fails
        time.sleep(1.0)
        ndvi_val = random.uniform(0.3, 0.5)
        warning = None # Clear warning on error fallback
        
        # Generator mock trend
        ndvi_trend = []
        today = datetime.utcnow()
        # Generate last 6 months (approximate)
        for i in range(5, -1, -1):
            target_date = today - timedelta(days=i*30)
            month_name = target_date.strftime("%b")
            
            val = ndvi_val + (random.uniform(-0.1, 0.1))
            val = min(max(val, 0), 1)
            ndvi_trend.append(NdviDataPoint(month=month_name, value=round(val, 2)))

    # Calculate Risk based on Real NDVI
    # Logic: Lower NDVI = Higher Risk (Drought)
    # Scale: NDVI -1 to 1. 
    # Let's say: < 0.3 is High Risk. > 0.6 is Low Risk.
    
    # Normalize NDVI (0 to 1 usually for healthy veg, but can be negative for water/clouds)
    # Clamp for score calculation
    val_clamped = max(0, min(ndvi_val, 1))
    
    # Inverse mapping: 1.0 (Lush) -> 0 Risk. 0.0 (Dead) -> 100 Risk.
    base_risk = int((1.0 - val_clamped) * 100)
    
    # Determine alert level and stats based on risk
    if base_risk < 30:
        alert = RiskLevel.LOW
        rec = "Optimal moisture levels. No action needed."
    elif base_risk < 60:
        alert = RiskLevel.MEDIUM
        rec = "Monitor soil moisture. Plan irrigation if no rain forecast."
    elif base_risk < 85:
        alert = RiskLevel.HIGH
        rec = "High water stress. Irrigation recommended within 24h."
    else:
        alert = RiskLevel.CRITICAL
        rec = "CRITICAL DROUGHT. Immediate intervention required to save crop."

    return RiskAnalysisResponse(
        water_risk_score=base_risk,
        ndvi_trend=ndvi_trend,
        climate_alert=alert,
        recommendation=rec,
        moisture_content=moisture_str,
        temperature=temp_str,
        weather=weather_obj,
        analyzed_at=datetime.utcnow(),
        image_base64=locals().get('img_base64'),
        ndvi_image_base64=locals().get('ndvi_img_base64'),
        image_bounds=locals().get('img_bounds'),
        warning=locals().get('warning')
    )


@app.post("/recommendation")
async def get_recommendation(request: RecommendationRequest):
    """
    Expert AI Agronomist Endpoint.
    """
    context = request.dict()
    recommendation = get_agronomic_recommendation(context)
    return recommendation

@app.post("/api/v1/notify")
async def send_sms_notification(request: SMSRequest):
    """
    Sends an SMS notification via Twilio (Immediate).
    """
    twilio = TwilioService()
    result = twilio.send_sms(to_phone=request.to_phone, message_body=request.message)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
    return {"status": "SUCCESS", "message": "SMS sent successfully", "sid": result.get("message_sid")}

@app.post("/api/v1/notify/schedule")
async def schedule_sms_notification(request: ScheduledSMSRequest):
    """
    Schedules an SMS for the future.
    """
    msg_id = scheduler.schedule_message(
        to_phone=request.to_phone,
        message=request.message,
        send_at=request.send_at,
        repeat_days=request.repeat_days
    )
    return {"status": "SUCCESS", "message": "SMS scheduled successfully", "id": msg_id}

@app.get("/api/v1/notify/pending")
async def get_pending_sms():
    """
    Gets pending scheduled SMS messages.
    """
    return {"status": "SUCCESS", "data": scheduler.get_pending_messages()}

@app.post("/chat")
async def chat_with_ai(
    message: str = Form(...),
    context: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    """
    Real-time chat with Gemini AI (Multimodal).
    """
    context_dict = json.loads(context)
    
    image_bytes = None
    if file:
        image_bytes = await file.read()
        
    response_text = get_agri_advice(message, context_dict, image_bytes)
    return {"response": response_text}

# --- Fields persistence Endpoints ---
from services.fields import FieldsService
# We can init service here or via dependency, let's keep it simple
fields_service = FieldsService(supabase)

@app.post("/fields")
async def create_field(field: FieldCreate):
    field_data = field.model_dump()
    
    # Map 'polygon' to 'geometry' to match the existing Supabase table schema
    if "polygon" in field_data:
        field_data["geometry"] = field_data.pop("polygon")
        
    try:
        # Use direct insertion to match the MVP schema in Supabase
        response = supabase.table("farms").insert(field_data).execute()
        return response.data[0]
    except Exception as e:
        print(f"Error saving farm: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/fields")
async def get_fields(user_id: str):
    try:
        response = supabase.table("farms").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching farms: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- IoT Sensor Telemetry Endpoints (Python REST API for hardware) ---
from models import SensorTelemetryPayload, SensorTelemetryResponse

# In-memory storage for sensor telemetry fallback/demo & historical tracking
sensor_store: Dict[str, Dict[str, Any]] = {}
sensor_history: Dict[str, List[Dict[str, Any]]] = {}

def _generate_default_sensor_history(device_id: str, current_moisture: float = 34.0, current_temp: float = 23.5) -> List[Dict[str, Any]]:
    """Generates a realistic 24-hour sensor history curve if no previous logs exist."""
    history = []
    now = datetime.utcnow()
    # 8 points representing the last 24 hours (every 3 hours)
    for i in range(7, -1, -1):
        point_time = now - timedelta(hours=i * 3)
        # Diurnal temperature fluctuation & gradual moisture dry-down curve
        temp_variation = -3.5 if (i in [4, 5]) else (2.0 if (i in [1, 2]) else 0.0)
        moisture_drift = (7 - i) * -0.6 # slight drying over time
        
        m15 = max(10.0, min(80.0, round(current_moisture + moisture_drift + random.uniform(-0.3, 0.3), 1)))
        m30 = max(15.0, min(85.0, round(m15 * 1.08 + random.uniform(-0.2, 0.2), 1)))
        stemp = round(current_temp + temp_variation + random.uniform(-0.4, 0.4), 1)
        batt = round(max(80.0, 98.0 - (7 - i) * 0.4), 1)
        
        history.append({
            "timestamp": point_time.isoformat(),
            "time_label": point_time.strftime("%H:%M"),
            "soil_moisture_15cm": m15,
            "soil_moisture_30cm": m30,
            "soil_temperature": stemp,
            "battery_level": batt,
            "irrigation_needed": m15 < 30.0
        })
    return history

@app.post("/api/v1/sensors/telemetry", response_model=SensorTelemetryResponse)
async def receive_sensor_telemetry(payload: SensorTelemetryPayload):
    """
    REST API endpoint for IoT Hydric Sensors (ESP32, LoRaWAN, Arduino).
    Receives real-time soil moisture & temperature data.
    """
    device_id = payload.device_id
    moisture = payload.soil_moisture_15cm
    m30 = payload.soil_moisture_30cm if payload.soil_moisture_30cm is not None else round(moisture * 1.05, 1)
    stemp = payload.soil_temperature if payload.soil_temperature is not None else 23.0
    batt = payload.battery_level if payload.battery_level is not None else 96.0
    
    # Evaluate agronomic hydric status & irrigation recommendation
    # Thresholds: < 22% Severely dry, < 32% Irrigation needed, 32-45% Optimal, > 50% Saturated
    if moisture < 22.0:
        hydric_status = "DÉFICIT CRÍTICO / MARCHITEZ"
        irrigation_needed = True
        water_minutes = 50
        recommended_volume_mm = 22.0
    elif moisture < 32.0:
        hydric_status = "ESTRÉS HÍDRICO LEVE"
        irrigation_needed = True
        water_minutes = 30
        recommended_volume_mm = 14.0
    elif moisture <= 48.0:
        hydric_status = "ZONA ÓPTIMA DE CRECIMIENTO"
        irrigation_needed = False
        water_minutes = 0
        recommended_volume_mm = 0.0
    else:
        hydric_status = "SATURACIÓN / CAPACIDAD DE CAMPO MÁXIMA"
        irrigation_needed = False
        water_minutes = 0
        recommended_volume_mm = 0.0
    
    received_time = datetime.utcnow()
    
    sensor_entry = {
        "device_id": device_id,
        "farm_id": payload.farm_id,
        "soil_moisture_15cm": moisture,
        "soil_moisture_30cm": m30,
        "soil_temperature": stemp,
        "battery_level": batt,
        "hydric_status": hydric_status,
        "irrigation_needed": irrigation_needed,
        "recommended_water_minutes": water_minutes,
        "recommended_volume_mm": recommended_volume_mm,
        "received_at": received_time.isoformat(),
        "status": "ONLINE"
    }
    
    sensor_store[device_id] = sensor_entry
    
    # Store in history queue (keep last 50 points)
    if device_id not in sensor_history:
        sensor_history[device_id] = _generate_default_sensor_history(device_id, moisture, stemp)
    
    sensor_history[device_id].append({
        "timestamp": received_time.isoformat(),
        "time_label": received_time.strftime("%H:%M"),
        "soil_moisture_15cm": moisture,
        "soil_moisture_30cm": m30,
        "soil_temperature": stemp,
        "battery_level": batt,
        "irrigation_needed": irrigation_needed
    })
    if len(sensor_history[device_id]) > 50:
        sensor_history[device_id] = sensor_history[device_id][-50:]
    
    # Prepare payload specifically for Supabase matching the SQL schema
    db_entry = {
        "device_id": device_id,
        "moisture_level": moisture,
        "temperature": stemp,
        "battery_level": batt,
    }
    
    if payload.farm_id and payload.farm_id != "00000000-0000-0000-0000-000000000000":
        import uuid
        try:
            uuid.UUID(payload.farm_id)
            db_entry["farm_id"] = payload.farm_id
        except ValueError:
            pass
        
    if supabase:
        try:
            supabase.table("sensor_telemetry").insert(db_entry).execute()
        except Exception as e:
            print(f"Notice: Supabase sensor log skipped ({e})")
            
    return SensorTelemetryResponse(
        status="SUCCESS",
        message=f"Telemetría procesada con éxito. Estado hídrico: {hydric_status}",
        device_id=device_id,
        received_at=received_time,
        irrigation_needed=irrigation_needed,
        recommended_water_minutes=water_minutes
    )

@app.get("/api/v1/sensors/latest/{device_id}")
async def get_latest_sensor_data(device_id: str):
    """
    Get the most recent telemetry data from a registered IoT sensor.
    """
    if device_id in sensor_store:
        return sensor_store[device_id]
        
    # Return initialized realistic state if not yet reported
    default_entry = {
        "device_id": device_id,
        "farm_id": "farm-demo-001",
        "soil_moisture_15cm": 34.2,
        "soil_moisture_30cm": 38.6,
        "soil_temperature": 23.4,
        "battery_level": 94.0,
        "hydric_status": "ZONA ÓPTIMA DE CRECIMIENTO",
        "irrigation_needed": False,
        "recommended_water_minutes": 0,
        "recommended_volume_mm": 0.0,
        "received_at": datetime.utcnow().isoformat(),
        "status": "ONLINE"
    }
    sensor_store[device_id] = default_entry
    return default_entry

@app.get("/api/v1/sensors/history/{device_id}")
async def get_sensor_history(device_id: str):
    """
    Get the historical time series for an IoT sensor.
    """
    if device_id in sensor_history and len(sensor_history[device_id]) > 0:
        return {"device_id": device_id, "history": sensor_history[device_id]}
    
    current_entry = sensor_store.get(device_id, {})
    m15 = current_entry.get("soil_moisture_15cm", 34.2)
    stemp = current_entry.get("soil_temperature", 23.4)
    generated_hist = _generate_default_sensor_history(device_id, m15, stemp)
    sensor_history[device_id] = generated_hist
    return {"device_id": device_id, "history": generated_hist}

@app.get("/api/v1/sensors/devices")
async def get_all_sensor_devices():
    """
    Lists all active or registered IoT sensors.
    """
    default_devices = [
        {"device_id": "ESP32-CAMPO-01", "name": "Nodo ESP32 Sector Norte", "type": "ESP32 + Capacitivo", "status": "ONLINE", "moisture": 34.2, "battery": 94.0, "last_ping": datetime.utcnow().isoformat()},
        {"device_id": "ESP32-CAMPO-02", "name": "Nodo ESP32 Pozo / Bomba", "type": "ESP32 + Presión & Flujo", "status": "STANDBY", "moisture": 28.5, "battery": 88.0, "last_ping": (datetime.utcnow() - timedelta(minutes=14)).isoformat()}
    ]
    
    devices = []
    for d_id, data in sensor_store.items():
        devices.append({
            "device_id": d_id,
            "name": f"Nodo {d_id}",
            "type": "ESP32 IoT Sensor",
            "status": "ONLINE",
            "moisture": data.get("soil_moisture_15cm", 0),
            "battery": data.get("battery_level", 100),
            "last_ping": data.get("received_at", datetime.utcnow().isoformat())
        })
        
    # Merge if not present
    existing_ids = {d["device_id"] for d in devices}
    for def_d in default_devices:
        if def_d["device_id"] not in existing_ids:
            devices.append(def_d)
            
    return {"status": "SUCCESS", "devices": devices}

# --- Phase 3: Market Prices, Logbook, and PDF Reports ---

@app.get("/api/v1/market-prices")
async def get_market_prices():
    """Returns simulated daily prices for major crops in Mexico (SNIIM)"""
    return {
        "status": "SUCCESS",
        "data": [
            {"crop": "Maíz Blanco (Ton)", "price": "$4,850.00", "trend": "stable"},
            {"crop": "Trigo Cristalino (Ton)", "price": "$5,120.00", "trend": "down"},
            {"crop": "Aguacate Hass (Kg)", "price": "$42.50", "trend": "up"}
        ]
    }

@app.get("/api/v1/farms/{farm_id}/report")
async def get_farm_pdf_report(farm_id: str):
    """Generates and returns an official PDF report for a farm."""
    import os
    import tempfile
    from services.pdf_generator import generate_fira_report
    
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase connection required.")
        
    # Fetch farm data
    res = supabase.table("farms").select("*").eq("id", farm_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Farm not found.")
        
    farm_data = res.data[0]
    
    # Generate PDF in temp directory
    temp_dir = tempfile.gettempdir()
    pdf_path = os.path.join(temp_dir, f"reporte_fira_{farm_id}.pdf")
    generate_fira_report(farm_data, pdf_path)
    
    return FileResponse(
        pdf_path, 
        media_type='application/pdf', 
        filename=f"Reporte_AgriSaaS_{farm_data.get('name', 'Parcela')}.pdf"
    )

from pydantic import BaseModel
class LogEntry(BaseModel):
    activity_type: str
    product_name: str
    dose: str
    notes: str
    date: str

@app.post("/api/v1/farms/{farm_id}/logs")
async def add_farm_log(farm_id: str, log: LogEntry):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase connection required.")
    
    db_entry = {
        "farm_id": farm_id,
        "activity_type": log.activity_type,
        "product_name": log.product_name,
        "dose": log.dose,
        "notes": log.notes,
        "date": log.date
    }
    
    res = supabase.table("field_logs").insert(db_entry).execute()
    return {"status": "SUCCESS", "data": res.data}

@app.get("/api/v1/farms/{farm_id}/logs")
async def get_farm_logs(farm_id: str):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase connection required.")
        
    res = supabase.table("field_logs").select("*").eq("farm_id", farm_id).order("date", desc=True).execute()
    return {"status": "SUCCESS", "data": res.data}

class AlertPreferenceBase(BaseModel):
    user_id: str
    phone_number: str = ""
    alert_frost: bool = True
    alert_drought: bool = True

@app.get("/api/v1/alerts/preferences/{user_id}")
async def get_alert_preferences(user_id: str):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase connection required.")
    
    res = supabase.table("alert_preferences").select("*").eq("user_id", user_id).execute()
    if res.data and len(res.data) > 0:
        return {"status": "SUCCESS", "data": res.data[0]}
    
    # Return default empty state if not found
    return {"status": "SUCCESS", "data": {"user_id": user_id, "phone_number": "", "alert_frost": True, "alert_drought": True}}

@app.post("/api/v1/alerts/preferences")
async def save_alert_preferences(prefs: AlertPreferenceBase):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase connection required.")
    
    db_entry = {
        "user_id": prefs.user_id,
        "phone_number": prefs.phone_number,
        "alert_frost": prefs.alert_frost,
        "alert_drought": prefs.alert_drought,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    # Upsert the preferences
    res = supabase.table("alert_preferences").upsert(db_entry).execute()
    return {"status": "SUCCESS", "data": res.data}

# --- CFE & CONAGUA Compliance & Energy Audit Endpoints ---

class ComplianceAuditRequest(BaseModel):
    farm_id: Optional[str] = None
    farm_name: Optional[str] = "Predio Demostración"
    crop: Optional[str] = "Aguacate / Berries"
    hectares: Optional[float] = 10.0
    latitude: Optional[float] = 20.65
    longitude: Optional[float] = -103.35
    ndvi_avg: Optional[float] = 0.48
    pump_hp: Optional[float] = 25.0
    flow_rate_lps: Optional[float] = 18.0
    device_id: Optional[str] = None

@app.post("/api/v1/compliance/audit")
async def run_compliance_audit_endpoint(req: ComplianceAuditRequest):
    """
    Executes a comprehensive CFE & CONAGUA audit using farm polygon, Sentinel-2 NDVI, and IoT sensor telemetry.
    """
    # Check if latest telemetry exists for device_id
    iot_telemetry = None
    if req.device_id and req.device_id in sensor_store:
        iot_telemetry = sensor_store[req.device_id]
    elif len(sensor_store) > 0:
        # Grab most recent sensor reading from store if available
        iot_telemetry = list(sensor_store.values())[-1]

    farm_dict = {
        "id": req.farm_id,
        "name": req.farm_name,
        "crop": req.crop,
        "hectares": req.hectares,
        "lat": req.latitude,
        "lon": req.longitude,
        "ndvi_avg": req.ndvi_avg,
        "pump_hp": req.pump_hp,
        "flow_rate_lps": req.flow_rate_lps
    }

    audit_result = ComplianceAuditService.run_compliance_audit(farm_dict, iot_telemetry)
    return {"status": "SUCCESS", "audit": audit_result}

@app.post("/api/v1/compliance/download-report")
async def download_compliance_report_pdf(req: ComplianceAuditRequest):
    """
    Generates and returns an official PDF compliance report document for CONAGUA and CFE validation.
    """
    import tempfile
    import os

    # Grab telemetry
    iot_telemetry = None
    if req.device_id and req.device_id in sensor_store:
        iot_telemetry = sensor_store[req.device_id]
    elif len(sensor_store) > 0:
        iot_telemetry = list(sensor_store.values())[-1]

    farm_dict = {
        "id": req.farm_id,
        "name": req.farm_name,
        "crop": req.crop,
        "hectares": req.hectares,
        "lat": req.latitude,
        "lon": req.longitude,
        "ndvi_avg": req.ndvi_avg,
        "pump_hp": req.pump_hp,
        "flow_rate_lps": req.flow_rate_lps
    }

    audit_result = ComplianceAuditService.run_compliance_audit(farm_dict, iot_telemetry)

    # Generate PDF in temp file
    temp_dir = tempfile.gettempdir()
    pdf_path = os.path.join(temp_dir, f"Dictamen_CFE_CONAGUA_{audit_result['audit_id']}.pdf")
    
    generate_compliance_audit_pdf(audit_result, pdf_path)

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"Dictamen_Auditoria_CFE_CONAGUA_{req.farm_name.replace(' ', '_')}.pdf"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
