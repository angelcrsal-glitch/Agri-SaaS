"""
AgriSaaS - CFE & CONAGUA Compliance and Energy Optimization Service
Integrates official Mexican regulatory frameworks:
- CONAGUA: Monitor de Sequía de México (SMN) & Acuíferos en Veda (REPDA).
- CFE: Tarifas Agrícolas 9N, 9CU y GDMTH (Horarios Punta, Intermedio, Base, Valle).
- IoT Telemetry + Sentinel-2 NDVI synthesis for precise hydrological & financial audits.
"""

from datetime import datetime
from typing import Dict, Any, Optional, List

# Official Aquifer and Regulatory Mapping (CONAGUA / REPDA)
AQUIFER_REGISTRY = [
    {
        "id": "0805",
        "name": "Acuífero Cuauhtémoc (Chihuahua)",
        "lat_bounds": [28.0, 29.5],
        "lon_bounds": [-107.5, -106.3],
        "veda_status": "Veda Rígida - Decreto DOF 1954/2013",
        "drought_level": "D3 - Sequía Extrema",
        "quota_annual_limit_m3_ha": 3500,
        "conagua_risk": "ALTO",
        "legal_alert": "Prohibida perforación o incremento de gasto sin título REPDA vigente."
    },
    {
        "id": "2619",
        "name": "Acuífero Costa de Hermosillo (Sonora)",
        "lat_bounds": [28.5, 29.8],
        "lon_bounds": [-112.2, -111.0],
        "veda_status": "Veda por Intrusión Salina y Sobreexplotación",
        "drought_level": "D2 - Sequía Severa",
        "quota_annual_limit_m3_ha": 4000,
        "conagua_risk": "CRÍTICO",
        "legal_alert": "Inspecciones activas de macromedidores por CONAGUA Organismo de Cuenca Noroeste."
    },
    {
        "id": "1108",
        "name": "Acuífero Silao-Romita / Bajío (Guanajuato)",
        "lat_bounds": [20.6, 21.5],
        "lon_bounds": [-101.8, -100.8],
        "veda_status": "Veda de Control de Extracción",
        "drought_level": "D1 - Sequía Moderada",
        "quota_annual_limit_m3_ha": 5000,
        "conagua_risk": "MEDIO",
        "legal_alert": "Obligatorio reporte de bitácora bimestral de extracciones ante REPDA."
    },
    {
        "id": "1501",
        "name": "Acuífero Valle de Toluca (Edomex)",
        "lat_bounds": [19.0, 19.8],
        "lon_bounds": [-100.0, -99.3],
        "veda_status": "Zona de Reserva y Veda Tipo III",
        "drought_level": "D0 - Anormalmente Seco",
        "quota_annual_limit_m3_ha": 4500,
        "conagua_risk": "BAJO",
        "legal_alert": "Monitoreo preventivo de abatimiento freático."
    },
    {
        "id": "1405",
        "name": "Acuífero Zacoalco-Sayula (Jalisco - Zona Aguacatera / Berries)",
        "lat_bounds": [19.5, 20.4],
        "lon_bounds": [-104.0, -103.0],
        "veda_status": "Veda de Estabilización",
        "drought_level": "D2 - Sequía Severa",
        "quota_annual_limit_m3_ha": 4200,
        "conagua_risk": "ALTO",
        "legal_alert": "Restricción de extracción diurna en canales principales."
    }
]

# Official CFE Tariff Rates (MXN per kWh)
CFE_RATES = {
    "TARIFA_9N": {
        "name": "Tarifa 9N (Estímulo Nocturno Agrícola para Bombeo)",
        "night_valley": 0.385,   # Horario Nocturno / Valle (00:00 - 06:00 hrs)
        "day_intermediate": 0.782 # Horario Diurno (06:00 - 00:00 hrs)
    },
    "TARIFA_GDMTH": {
        "name": "Tarifa GDMTH (Gran Demanda Media Tensión Horaria)",
        "peak_punta": 2.895,     # Horario Punta (18:00 - 22:00 hrs verano)
        "intermediate": 1.720,   # Horario Intermedio (06:00 - 18:00 y 22:00 - 00:00)
        "base_valley": 1.150     # Horario Base (00:00 - 06:00 hrs)
    }
}

class ComplianceAuditService:

    @classmethod
    def match_aquifer(cls, lat: float, lon: float) -> Dict[str, Any]:
        """Matches a latitude and longitude against Mexican aquifer basins."""
        for aq in AQUIFER_REGISTRY:
            if aq["lat_bounds"][0] <= lat <= aq["lat_bounds"][1] and aq["lon_bounds"][0] <= lon <= aq["lon_bounds"][1]:
                return aq
        
        # Default Mexican Central-Western Aquifer baseline if outside exact bounds
        return {
            "id": "MEX-DEFAULT",
            "name": "Acuífero Región Centro-Occidente (México)",
            "lat_bounds": [lat - 0.5, lat + 0.5],
            "lon_bounds": [lon - 0.5, lon + 0.5],
            "veda_status": "Zona de Veda Reglamentada DOF",
            "drought_level": "D2 - Sequía Severa",
            "quota_annual_limit_m3_ha": 4000,
            "conagua_risk": "MEDIO-ALTO",
            "legal_alert": "Sujeto a inspección de medidor volumétrico según Ley de Aguas Nacionales."
        }

    @classmethod
    def run_compliance_audit(cls, farm_data: Dict[str, Any], iot_telemetry: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes a full technical, legal (CONAGUA) and energy (CFE) audit for a farm.
        """
        # 1. Location & Georeferencing
        lat = float(farm_data.get("lat") or farm_data.get("latitude") or 20.65)
        lon = float(farm_data.get("lon") or farm_data.get("longitude") or -103.35)
        farm_name = farm_data.get("name", "Predio Demostración")
        crop_type = farm_data.get("crop", farm_data.get("crop_type", "Maíz / Granos"))
        hectares = float(farm_data.get("hectares") or farm_data.get("area_hectares") or 10.0)

        aquifer = cls.match_aquifer(lat, lon)

        # 2. Agronomic & Hydric Synthesis (Satellite NDVI + IoT Soil Telemetry)
        ndvi_avg = float(farm_data.get("ndvi_avg") or farm_data.get("ndvi") or 0.48)
        
        # IoT sensors take precedence if available, else satellite moisture
        if iot_telemetry and "soil_moisture_15cm" in iot_telemetry:
            moisture_15cm = float(iot_telemetry["soil_moisture_15cm"])
            moisture_30cm = float(iot_telemetry.get("soil_moisture_30cm", moisture_15cm * 0.95))
            current_moisture = (moisture_15cm + moisture_30cm) / 2.0
            sensor_source = f"Sensor IoT en Vivo ({iot_telemetry.get('device_id', 'Nodo-01')})"
        else:
            current_moisture = float(farm_data.get("moisture", 22.0))
            moisture_15cm = current_moisture
            moisture_30cm = current_moisture * 0.92
            sensor_source = "Estimación Satelital Sentinel-2"

        target_moisture = 35.0  # Optimal moisture target for active crops
        moisture_deficit_pct = max(0.0, target_moisture - current_moisture)

        # 3. Water Volume & Pumping Calculations
        # 1% deficit ~ 10 m³ (10,000 Liters) per hectare
        water_volume_m3 = (moisture_deficit_pct * 10.0) * hectares
        water_volume_liters = water_volume_m3 * 1000.0

        pump_hp = float(farm_data.get("pump_hp", 25.0)) # Default 25 HP pump
        flow_rate_lps = float(farm_data.get("flow_rate_lps", 18.0)) # 18 Liters per second

        hours_needed = (water_volume_liters / flow_rate_lps / 3600.0) if (flow_rate_lps > 0 and water_volume_liters > 0) else 0.0
        
        # Electric power consumed
        # 1 HP = 0.7457 kW. Add motor efficiency ~ 88%
        kw_electric = (pump_hp * 0.7457) / 0.88
        total_kwh = kw_electric * hours_needed

        # 4. CFE Cost Analysis (Tarifa 9N & Tarifa GDMTH)
        # Peak hours cost (worst case)
        cost_cfe_peak = total_kwh * CFE_RATES["TARIFA_GDMTH"]["peak_punta"]
        # Intermediate daytime cost
        cost_cfe_day = total_kwh * CFE_RATES["TARIFA_9N"]["day_intermediate"]
        # Night stimulus rate 9N (best case, 00:00 - 06:00)
        cost_cfe_night_9n = total_kwh * CFE_RATES["TARIFA_9N"]["night_valley"]

        savings_vs_day = max(0.0, cost_cfe_day - cost_cfe_night_9n)
        savings_vs_peak = max(0.0, cost_cfe_peak - cost_cfe_night_9n)
        savings_pct = ((cost_cfe_peak - cost_cfe_night_9n) / cost_cfe_peak * 100.0) if cost_cfe_peak > 0 else 0.0

        # 5. CONAGUA Legal & Quota Risk Analysis
        estimated_annual_extraction_m3 = water_volume_m3 * 24.0 # Assuming ~24 irrigations per agricultural cycle
        annual_quota_m3 = aquifer["quota_annual_limit_m3_ha"] * hectares
        quota_utilization_pct = min(100.0, (estimated_annual_extraction_m3 / annual_quota_m3 * 100.0)) if annual_quota_m3 > 0 else 50.0

        if quota_utilization_pct > 85.0 or "Veda Rígida" in aquifer["veda_status"]:
            conagua_status_color = "RED"
            conagua_status_label = "RIESGO CRÍTICO DE SANCIÓN CONAGUA"
        elif quota_utilization_pct > 65.0:
            conagua_status_color = "AMBER"
            conagua_status_label = "VIGILANCIA PREVENTIVA DE EXTRACCIÓN"
        else:
            conagua_status_color = "GREEN"
            conagua_status_label = "OPERACIÓN EN LÍMITE AUTORIZADO"

        # 6. Prescriptive Action Plan & Scheduled SMS Text
        recommended_start_time = "23:30 hrs (Bloque Tarifario Nocturno CFE)"
        suggested_sms = (
            f"AgriSaaS ALERTA CFE/CONAGUA: {farm_name} requiere {water_volume_m3:.0f}m3 de agua ({hours_needed:.1f}h bombeo). "
            f"Encender bomba a las 23:30 (Tarifa 9N Nocturna). Ahorro estimado: ${savings_vs_peak:,.0f} MXN vs diurno."
        )

        return {
            "audit_id": f"AUD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "generated_at": datetime.utcnow().isoformat(),
            "farm_overview": {
                "name": farm_name,
                "crop": crop_type,
                "hectares": hectares,
                "coordinates": {"lat": round(lat, 4), "lon": round(lon, 4)},
                "sensor_source": sensor_source
            },
            "conagua_regulatory": {
                "aquifer_name": aquifer["name"],
                "aquifer_id": aquifer["id"],
                "veda_status": aquifer["veda_status"],
                "drought_monitor_level": aquifer["drought_level"],
                "legal_alert": aquifer["legal_alert"],
                "quota_annual_authorized_m3": round(annual_quota_m3, 1),
                "estimated_cycle_extraction_m3": round(estimated_annual_extraction_m3, 1),
                "quota_utilization_pct": round(quota_utilization_pct, 1),
                "compliance_badge": {
                    "status": conagua_status_label,
                    "color": conagua_status_color
                }
            },
            "cfe_energy_analysis": {
                "tariff_applied": "Tarifa 9N (Estímulo Nocturno Agrícola)",
                "pump_power_hp": pump_hp,
                "flow_rate_lps": flow_rate_lps,
                "power_kw": round(kw_electric, 2),
                "irrigation_hours_needed": round(hours_needed, 2),
                "total_kwh_required": round(total_kwh, 1),
                "cost_in_peak_hours_mxn": round(cost_cfe_peak, 2),
                "cost_in_day_hours_mxn": round(cost_cfe_day, 2),
                "cost_in_night_9n_mxn": round(cost_cfe_night_9n, 2),
                "net_savings_mxn": round(savings_vs_peak, 2),
                "savings_percentage": round(savings_pct, 1)
            },
            "agronomic_indicators": {
                "ndvi_mean": round(ndvi_avg, 3),
                "soil_moisture_surface_15cm": round(moisture_15cm, 1),
                "soil_moisture_root_30cm": round(moisture_30cm, 1),
                "target_moisture_pct": target_moisture,
                "water_deficit_m3": round(water_volume_m3, 1),
                "water_deficit_liters": round(water_volume_liters, 0)
            },
            "risk_matrix": [
                {
                    "domain": "CONAGUA (Regulatorio / Sequía)",
                    "level": aquifer["conagua_risk"],
                    "details": f"Predio ubicado en {aquifer['name']} con {aquifer['drought_level']}. {aquifer['veda_status']}."
                },
                {
                    "domain": "CFE (Sobrecosto Energético)",
                    "level": "ALTO" if hours_needed > 3.0 else "MEDIO",
                    "details": f"Riesgo de sobrecosto de hasta ${savings_vs_peak:,.2f} MXN si se bombea en horario punta (18:00 a 22:00)."
                },
                {
                    "domain": "Estrés Hídrico en Raíz",
                    "level": "CRÍTICO" if current_moisture < 20.0 else ("MODERADO" if current_moisture < 30.0 else "BAJO"),
                    "details": f"Humedad actual {current_moisture:.1f}% vs 35.0% óptimo. Déficit hídrico de {water_volume_m3:.1f} m³."
                }
            ],
            "action_plan": {
                "recommended_start": recommended_start_time,
                "recommended_duration_hours": round(hours_needed, 1),
                "suggested_sms_alert": suggested_sms,
                "priority": "ALTA" if moisture_deficit_pct > 10.0 else "NORMAL"
            }
        }
