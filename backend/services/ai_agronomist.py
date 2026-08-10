from typing import Dict, Any

def get_agronomic_recommendation(context_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulates an AI Agronomist (AgriMind) recommendation engine.
    
    Expected context_data:
    {
        "crop_type": str,
        "growth_stage": str,
        "ndvi_value": float,
        "ndmi_value": float,
        "temp": float,
        "rain_prob": float,
        "soil_moisture": float | str
    }
    """
    
    crop = context_data.get("crop_type", "Unknown")
    stage = context_data.get("growth_stage", "Unknown")
    ndvi = float(context_data.get("ndvi_value", 0.0))
    ndmi = float(context_data.get("ndmi_value", 0.0))
    temp = float(context_data.get("temp", 0.0))
    rain_prob = float(context_data.get("rain_prob", 0.0))
    soil_moisture_val = context_data.get("soil_moisture", "Unknown")

    # Helper to parse soil moisture if it's a number
    try:
        soil_moisture = float(soil_moisture_val)
    except (ValueError, TypeError):
        soil_moisture = None

    # RULES IMPLEMENTATION
    
    # 1. Conservation First
    if rain_prob > 60:
        return {
            "status": "WARNING",
            "action_title": "No Regar",
            "action_detail": "La probabilidad de lluvia es alta (>60%). Posponga el riego para aprovechar el agua de lluvia y ahorrar energía.",
            "reasoning": f"Probabilidad de lluvia del {rain_prob}%. Se espera precipitación natural.",
            "confidence": 95
        }

    # 2. Stress Management
    # If NDMI is low (< -0.1) and Temp is high (> 25C)
    if ndmi < -0.1 and temp > 25:
        return {
            "status": "URGENT",
            "action_title": "Iniciar Riego de Inmediato",
            "action_detail": "Aplique una lámina de riego profunda (aprox. 15mm) por 40 mins, de preferencia después de las 6 PM para evitar evaporación.",
            "reasoning": f"Alto calor ({temp}C) y bajo índice de humedad ({ndmi}) indican estrés hídrico severo en el cultivo.",
            "confidence": 98
        }

    # 3. Efficiency
    # If NDVI is high (> 0.6) and Soil Moisture is good (assuming > 50% is 'good' for this simulation)
    # If soil_moisture is unknown, we rely on NDVI + NDMI. 
    # Let's assume if Soil Moisture is None, we check NDMI > 0.1 for 'good' moisture proxy if needed, 
    # but the prompt specifically says "Soil Moisture is good".
    
    is_soil_good = (soil_moisture is not None and soil_moisture > 50)
    
    if ndvi > 0.6 and is_soil_good:
        return {
            "status": "OPTIMAL",
            "action_title": "Sin Acción Requerida",
            "action_detail": "Mantenga el programa de riego actual. El cultivo se encuentra en excelentes condiciones.",
            "reasoning": "Se detecta un alto índice de vegetación y humedad de suelo suficiente.",
            "confidence": 92
        }
        
    # Default / Fallback Logic
    # If none of the specific harsh/optimal conditions are met, standard advice.
    return {
        "status": "OPTIMAL",
        "action_title": "Monitorear Condiciones",
        "action_detail": "Continúe con el monitoreo estándar. No se detectan riesgos inmediatos en la parcela.",
        "reasoning": "Las condiciones son estables. Aplique su programa de riego habitual.",
        "confidence": 85
    }
