from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from uuid import UUID

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class GeoCoordinate(BaseModel):
    lat: float
    lng: float

class ParcelGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]] # GeoJSON Polygon format

class AnalyzeRiskRequest(BaseModel):
    farm_id: Optional[str] = None
    geometry: ParcelGeometry
    crop_type: Optional[str] = "generic"

class NdviDataPoint(BaseModel):
    month: str
    value: float

class WeatherData(BaseModel):
    temp: float
    humidity: int
    description: str

class RiskAnalysisResponse(BaseModel):
    water_risk_score: float = Field(..., description="0 to 100 score indicating water stress risk")
    ndvi_trend: List[NdviDataPoint] = Field(..., description="List of monthly NDVI values")
    climate_alert: RiskLevel
    recommendation: str
    moisture_content: str = Field(..., description="Soil moisture formatted string")
    temperature: str = Field(..., description="Surface temp formatted string")
    weather: Optional[WeatherData] = Field(None, description="Real-time weather data")
    analyzed_at: datetime
    image_base64: Optional[str] = Field(None, description="Base64 encoded True Color image")
    ndvi_image_base64: Optional[str] = Field(None, description="Base64 encoded NDVI Heatmap image")
    image_bounds: Optional[List[List[float]]] = Field(None, description="Bounds [[lat, lng], [lat, lng]]")
    warning: Optional[str] = Field(None, description="Warning message about data quality or limits")

class FarmCreate(BaseModel):
    name: str
    location: Dict[str, Any]
    user_id: str

class Farm(FarmCreate):
    id: str
    created_at: str

# Field Models
class FieldCreate(BaseModel):
    name: str
    polygon: Dict[str, Any] # GeoJSON
    crop_type: Optional[str] = "generic"
    user_id: str
    risk_data: Optional[Dict[str, Any]] = None

class FieldResponse(FieldCreate):
    id: str
    user_id: str
    created_at: datetime


class RecommendationRequest(BaseModel):
    crop_type: str = "Wheat"
    growth_stage: str = "Flowering"
    ndvi_value: float = 0.5
    ndmi_value: float = 0.0
    temp: float = 25.0
    rain_prob: float = 20.0
    soil_moisture: Optional[str] = "50"

# AI Chat Models
class ChatRequest(BaseModel):
    message: str
    context: Dict[str, Any]

# IoT Hydric Sensor Models
class SensorTelemetryPayload(BaseModel):
    device_id: str
    farm_id: Optional[str] = "farm-demo-001"
    soil_moisture_15cm: float # Moisture percentage or centibars
    soil_moisture_30cm: Optional[float] = None
    soil_temperature: Optional[float] = None
    battery_level: Optional[float] = 100.0
    raw_reading: Optional[Dict[str, Any]] = None

class SensorTelemetryResponse(BaseModel):
    status: str
    message: str
    device_id: str
    received_at: datetime
    irrigation_needed: bool
    recommended_water_minutes: int

