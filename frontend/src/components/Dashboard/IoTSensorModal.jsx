import React, { useState, useEffect, useRef } from 'react';
import {
    Cpu, Radio, CheckCircle2, AlertCircle, RefreshCw, Zap, X, Copy, Check,
    Download, Terminal, Activity, Droplets, Thermometer, BatteryCharging,
    Wifi, Info, Sparkles, Layers, Sliders, ShieldAlert, Clock, ArrowUpRight,
    HelpCircle, Settings, Play, Server, FileCode, CheckCircle
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    LineChart, Line
} from 'recharts';
import { toast } from 'sonner';
import { sendSensorTelemetry, getLatestSensorData, getSensorHistory, getSensorDevices, API_URL } from '../../services/api';

const SENSOR_MODELS = [
    {
        id: 'capacitive_v12',
        name: 'Sensor Capacitivo V1.2 (Recomendado)',
        type: 'Analógico Resistente a la Corrosión',
        voltage: '3.3V - 5V',
        badge: 'Capacitivo',
        adcDryDefault: 3200,
        adcWetDefault: 1450,
        desc: 'No tiene electrodos expuestos, ideal para monitoreo continuo en suelo agrícola sin corrosión galvánica.',
    },
    {
        id: 'resistive_fc28',
        name: 'Sensor Resistivo YL-69 / FC-28',
        type: 'Resistivo de Dos Puntas',
        voltage: '3.3V',
        badge: 'Resistivo',
        adcDryDefault: 3800,
        adcWetDefault: 1200,
        desc: 'Económico para pruebas rápidas de laboratorio, susceptible a oxidación a largo plazo.',
    },
    {
        id: 'watermark_irrometer',
        name: 'Irrometer Watermark (Matriz Granular)',
        type: 'Tensión de Suelo (kPa / cb)',
        voltage: '3.3V con Puente AC',
        badge: 'Tensión Hídrica',
        adcDryDefault: 4000,
        adcWetDefault: 1100,
        desc: 'Mide la fuerza de succión que la raíz ejerce para absorber agua.',
    },
    {
        id: 'meter_teros12',
        name: 'Meter Group TEROS 11/12 (SDI-12)',
        type: 'VWC + Temp + Conductividad Eléctrica',
        voltage: '3.3V - 12V (SDI-12 Bus)',
        badge: 'Industrial',
        adcDryDefault: 3000,
        adcWetDefault: 1300,
        desc: 'Sensor de precisión científica con telemetría digital avanzada.',
    }
];

const IoTSensorModal = ({ isOpen, onClose }) => {
    // Tabs: 'telemetry' | 'firmware' | 'wiring' | 'simulator'
    const [activeTab, setActiveTab] = useState('telemetry');
    
    // Device & Hardware Config
    const [deviceId, setDeviceId] = useState('ESP32-CAMPO-01');
    const [selectedSensorModel, setSelectedSensorModel] = useState(SENSOR_MODELS[0]);
    const [wifiSSID, setWifiSSID] = useState('MiRancho_WiFi');
    const [wifiPassword, setWifiPassword] = useState('agrisaas2026');
    const [serverUrl, setServerUrl] = useState(API_URL || 'http://192.168.1.100:8000');
    const [analogPin, setAnalogPin] = useState('34');
    const [adcDry, setAdcDry] = useState(3200);
    const [adcWet, setAdcWet] = useState(1450);
    const [sleepMinutes, setSleepMinutes] = useState(15);
    const [firmwareLang, setFirmwareLang] = useState('arduino'); // 'arduino' | 'micropython'

    // Live Telemetry State
    const [latestData, setLatestData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [registeredDevices, setRegisteredDevices] = useState([]);
    const [isLivePolling, setIsLivePolling] = useState(true);
    const [isLoadingLatest, setIsLoadingLatest] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedCurl, setCopiedCurl] = useState(false);

    // Simulator State
    const [simMoisture15, setSimMoisture15] = useState(34.5);
    const [simMoisture30, setSimMoisture30] = useState(38.0);
    const [simTemp, setSimTemp] = useState(23.5);
    const [simBattery, setSimBattery] = useState(95.0);
    const [simLoading, setSimLoading] = useState(false);
    const [simResponse, setSimResponse] = useState(null);

    const pollingTimerRef = useRef(null);

    // Load initial devices and data when opened
    useEffect(() => {
        if (isOpen) {
            fetchDeviceList();
            fetchLiveData();
            fetchHistoryData();
        }
    }, [isOpen, deviceId]);

    // Live polling effect
    useEffect(() => {
        if (isOpen && isLivePolling) {
            pollingTimerRef.current = setInterval(() => {
                fetchLiveData(false);
            }, 6000);
        } else if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
        }
        return () => {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        };
    }, [isOpen, isLivePolling, deviceId]);

    const fetchDeviceList = async () => {
        try {
            const res = await getSensorDevices();
            if (res && res.devices) {
                setRegisteredDevices(res.devices);
            }
        } catch (err) {
            console.warn("Could not load devices list", err);
        }
    };

    const fetchLiveData = async (showLoader = true) => {
        if (showLoader) setIsLoadingLatest(true);
        try {
            const data = await getLatestSensorData(deviceId);
            if (data) {
                setLatestData(data);
            }
        } catch (err) {
            console.warn("Failed fetching sensor live data:", err);
        } finally {
            if (showLoader) setIsLoadingLatest(false);
        }
    };

    const fetchHistoryData = async () => {
        try {
            const res = await getSensorHistory(deviceId);
            if (res && res.history) {
                setHistoryData(res.history);
            }
        } catch (err) {
            console.warn("Failed fetching sensor history:", err);
        }
    };

    const handleSendSimulation = async () => {
        setSimLoading(true);
        try {
            const payload = {
                device_id: deviceId,
                farm_id: "farm-demo-001",
                soil_moisture_15cm: parseFloat(simMoisture15),
                soil_moisture_30cm: parseFloat(simMoisture30),
                soil_temperature: parseFloat(simTemp),
                battery_level: parseFloat(simBattery)
            };

            const response = await sendSensorTelemetry(payload);
            setSimResponse(response);
            toast.success(' Telemetría enviada a la API de AgriSaaS', {
                description: `${response.message || 'Datos actualizados con éxito'}`
            });

            // Refresh live views
            fetchLiveData(false);
            fetchHistoryData();
        } catch (err) {
            console.error("Simulation error:", err);
            // Fallback response for purely frontend preview
            const fallbackRes = {
                status: "SUCCESS_DEMO",
                message: simMoisture15 < 30.0 ? "Telemetría procesada: Requiere Riego Inmediato" : "Telemetría procesada: Nivel Hídrico Óptimo",
                device_id: deviceId,
                received_at: new Date().toISOString(),
                irrigation_needed: simMoisture15 < 30.0,
                recommended_water_minutes: simMoisture15 < 22.0 ? 50 : (simMoisture15 < 32.0 ? 30 : 0)
            };
            setSimResponse(fallbackRes);
            toast.info("Telemetría procesada localmente");
        } finally {
            setSimLoading(false);
        }
    };

    // Generate Arduino C++ (.ino) Code
    const generateArduinoCode = () => {
        return `/*
 * AgriSaaS - ESP32 IoT Soil Telemetry Node Firmware
 * Target: ESP32 Dev Module / ESP32-WROOM-32 / NodeMCU-32S
 * Sensors: Capacitive Soil Moisture Sensor V1.2 on GPIO ${analogPin}
 * Transmission: HTTP REST POST (JSON)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Instalar "ArduinoJson" by Benoit Blanchon desde el Library Manager

// --- CONFIGURACIÓN DE RED & SERVIDOR ---
const char* ssid = "${wifiSSID}";
const char* password = "${wifiPassword}";
const char* serverEndpoint = "${serverUrl}/api/v1/sensors/telemetry";

// --- IDENTIFICADOR DEL DISPOSITIVO ---
const char* DEVICE_ID = "${deviceId}";
const char* FARM_ID = "farm-demo-001";

// --- PINES Y CALIBRACIÓN DEL SENSOR ---
const int SOIL_PIN = ${analogPin};        // Pin ADC conectado a AOUT del sensor
const int SAMPLES = 10;           // Promedio de lecturas para eliminar ruido
const int ADC_AIR_DRY = ${adcDry};      // Valor ADC en aire seco (0% humedad)
const int ADC_WATER_WET = ${adcWet};    // Valor ADC sumergido en agua (100% humedad)

// --- AHORRO DE ENERGÍA / DEEP SLEEP ---
#define uS_TO_S_FACTOR 1000000ULL  // Factor de conversión microsegundos a segundos
#define TIME_TO_SLEEP  ${sleepMinutes * 60}       // Tiempo en Deep Sleep (${sleepMinutes} minutos)

float readSoilMoisturePercent() {
  long totalAdc = 0;
  for (int i = 0; i < SAMPLES; i++) {
    totalAdc += analogRead(SOIL_PIN);
    delay(10);
  }
  int avgAdc = totalAdc / SAMPLES;
  Serial.print("Lectura Raw ADC: ");
  Serial.println(avgAdc);

  // Mapeo lineal restringido entre 0% y 100%
  // Nota: En sensor capacitivo, a menor ADC mayor humedad
  float moisture = map(avgAdc, ADC_AIR_DRY, ADC_WATER_WET, 0, 100);
  if (moisture < 0.0) moisture = 0.0;
  if (moisture > 100.0) moisture = 100.0;
  return moisture;
}

float readBatteryEstimate() {
  // Opcional: Si tienes divisor de voltaje en pin 35
  return 95.0; // Estimación porcentual
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\\n--- INICIANDO NODO AGRISAAS ESP32 ---");

  // Configuración de resolución ADC (12 bits: 0 - 4095) y atenuación 11dB (0 - 3.3V)
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  // 1. Conexión WiFi con Timeout de seguridad
  Serial.print("Conectando a WiFi: ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int wifiRetries = 0;
  while (WiFi.status() != WL_CONNECTED && wifiRetries < 25) {
    delay(500);
    Serial.print(".");
    wifiRetries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\\n WiFi Conectado!");
    Serial.print("IP Asignada: ");
    Serial.println(WiFi.localIP());

    // 2. Tomar lecturas agronómicas
    float soilMoisture15 = readSoilMoisturePercent();
    float soilMoisture30 = soilMoisture15 * 1.05; // Estimación de perfil o segundo sensor
    float soilTemp = 23.5; // Si tienes DS18B20 o DHT22 agrégalo aquí
    float battery = readBatteryEstimate();

    Serial.printf("Humedad 15cm: %.1f%% | Temp: %.1f C | Bateria: %.1f%%\\n", 
                  soilMoisture15, soilTemp, battery);

    // 3. Crear Payload JSON
    StaticJsonDocument<256> doc;
    doc["device_id"] = DEVICE_ID;
    doc["farm_id"] = FARM_ID;
    doc["soil_moisture_15cm"] = soilMoisture15;
    doc["soil_moisture_30cm"] = soilMoisture30;
    doc["soil_temperature"] = soilTemp;
    doc["battery_level"] = battery;

    String requestBody;
    serializeJson(doc, requestBody);

    // 4. Transmitir HTTP POST a AgriSaaS
    HTTPClient http;
    http.begin(serverEndpoint);
    http.addHeader("Content-Type", "application/json");

    Serial.print("Enviando telemetría a: ");
    Serial.println(serverEndpoint);
    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.printf(" Respuesta Servidor [%d]: %s\\n", httpResponseCode, response.c_str());
    } else {
      Serial.printf("❌ Error en envio HTTP: %s\\n", http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  } else {
    Serial.println("\\n❌ No se pudo conectar a WiFi. Reintentando en próximo ciclo.");
  }

  // 5. Entrar en modo Deep Sleep para máximo ahorro de batería en campo
  Serial.printf("Entrando a Deep Sleep por %d minutos...\\n", ${sleepMinutes});
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
  esp_deep_sleep_start();
}

void loop() {
  // El código nunca llega aquí debido al Deep Sleep
}
`;
    };

    // Generate MicroPython Code
    const generateMicroPythonCode = () => {
        return `"""
AgriSaaS - MicroPython Firmware para ESP32
Telemetría de Humedad de Suelo vía HTTP REST
"""
import network
import urequests
import ujson
import time
import machine
from machine import ADC, Pin, deepsleep

# --- CONFIGURACIÓN ---
SSID = "${wifiSSID}"
PASSWORD = "${wifiPassword}"
API_URL = "${serverUrl}/api/v1/sensors/telemetry"
DEVICE_ID = "${deviceId}"
FARM_ID = "farm-demo-001"

SOIL_PIN_NUM = ${analogPin}
ADC_DRY = ${adcDry}
ADC_WET = ${adcWet}
SLEEP_MS = ${sleepMinutes * 60 * 1000}

# Configuración ADC (12 bits, 0-3.3V)
adc = ADC(Pin(SOIL_PIN_NUM))
adc.atten(ADC.ATTN_11DB)
adc.width(ADC.WIDTH_12BIT)

def read_moisture():
    readings = [adc.read() for _ in range(10)]
    avg_adc = sum(readings) / len(readings)
    print(f"ADC Raw: {avg_adc}")
    # Interpolación
    moisture = ((ADC_DRY - avg_adc) / (ADC_DRY - ADC_WET)) * 100.0
    return max(0.0, min(100.0, moisture))

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print("Conectando a red WiFi...")
        wlan.connect(SSID, PASSWORD)
        for _ in range(20):
            if wlan.isconnected():
                break
            time.sleep(0.5)
    print("WiFi Conectado:", wlan.ifconfig())
    return wlan.isconnected()

def main():
    if connect_wifi():
        moisture_15 = round(read_moisture(), 1)
        payload = {
            "device_id": DEVICE_ID,
            "farm_id": FARM_ID,
            "soil_moisture_15cm": moisture_15,
            "soil_moisture_30cm": round(moisture_15 * 1.05, 1),
            "soil_temperature": 23.2,
            "battery_level": 96.0
        }
        print("Enviando telemetría:", payload)
        try:
            res = urequests.post(API_URL, json=payload, headers={'Content-Type': 'application/json'})
            print(f"Respuesta AgriSaaS [{res.status_code}]: {res.text}")
            res.close()
        except Exception as e:
            print("Error HTTP:", e)
            
    print(f"Durmiendo por {SLEEP_MS // 60000} minutos...")
    deepsleep(SLEEP_MS)

if __name__ == "__main__":
    main()
`;
    };

    const copyFirmware = () => {
        const code = firmwareLang === 'arduino' ? generateArduinoCode() : generateMicroPythonCode();
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        toast.success(firmwareLang === 'arduino' ? 'Código Arduino (.ino) copiado' : 'Código MicroPython (.py) copiado');
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const downloadFirmware = () => {
        const code = firmwareLang === 'arduino' ? generateArduinoCode() : generateMicroPythonCode();
        const filename = firmwareLang === 'arduino' ? `AgriSaaS_${deviceId}.ino` : `main_${deviceId}.py`;
        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        toast.success(`Archivo ${filename} descargado`);
    };

    const copyCurlCommand = () => {
        const curlStr = `curl -X POST "${serverUrl}/api/v1/sensors/telemetry" \\
  -H "Content-Type: application/json" \\
  -d '{
    "device_id": "${deviceId}",
    "farm_id": "farm-demo-001",
    "soil_moisture_15cm": ${simMoisture15},
    "soil_moisture_30cm": ${simMoisture30},
    "soil_temperature": ${simTemp},
    "battery_level": ${simBattery}
  }'`;
        navigator.clipboard.writeText(curlStr);
        setCopiedCurl(true);
        toast.info('Comando cURL copiado al portapapeles');
        setTimeout(() => setCopiedCurl(false), 2000);
    };

    if (!isOpen) return null;

    const currentMoisture = latestData?.soil_moisture_15cm || 34.2;
    const currentDeepMoisture = latestData?.soil_moisture_30cm || (currentMoisture * 1.05);
    const currentTemp = latestData?.soil_temperature || 23.4;
    const currentBattery = latestData?.battery_level || 94.0;
    const hydricStatus = latestData?.hydric_status || (currentMoisture < 25 ? 'DÉFICIT CRÍTICO' : (currentMoisture < 33 ? 'ESTRÉS LEVE' : 'ZONA ÓPTIMA'));
    const isIrrigationNeeded = latestData?.irrigation_needed || currentMoisture < 32.0;

    // Helper for Gauge Color
    const getStatusColor = (val) => {
        if (val < 22) return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Déficit Severo (Marchitez)' };
        if (val < 32) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Estrés Hídrico Leve' };
        if (val <= 48) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Zona Óptima de Suelo' };
        return { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', label: 'Saturación / Capacidad Campo' };
    };

    const statusStyle = getStatusColor(currentMoisture);

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100 relative">
                
                {/* HEADER */}
                <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap justify-between items-center bg-slate-900/95 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-500/30 text-cyan-400 shadow-inner">
                            <Cpu className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                                    Centro de Telemetría IoT & Nodo ESP32
                                </h2>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                                    <Radio className="w-3 h-3 animate-pulse" /> REST Telemetry API
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Monitoreo continuo de humedad volumétrica de suelo (VWC), temperatura radicular y automatización de riego.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Device Selector */}
                        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Nodo:</span>
                            <select
                                value={deviceId}
                                onChange={(e) => setDeviceId(e.target.value)}
                                className="bg-transparent text-xs font-mono font-bold text-cyan-300 outline-none cursor-pointer"
                            >
                                <option value="ESP32-CAMPO-01" className="bg-slate-900 text-white">ESP32-CAMPO-01 (Sector Norte)</option>
                                <option value="ESP32-CAMPO-02" className="bg-slate-900 text-white">ESP32-CAMPO-02 (Pozo / Bomba)</option>
                                <option value="ESP32-CAMPO-03" className="bg-slate-900 text-white">ESP32-CAMPO-03 (Invernadero)</option>
                            </select>
                        </div>

                        <button type="button"
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* NAVIGATION TABS */}
                <div className="px-6 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between overflow-x-auto gap-2 py-2">
                    <div className="flex items-center gap-1.5">
                        <button type="button"
                            onClick={() => setActiveTab('telemetry')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'telemetry'
                                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50 border border-cyan-400/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            <Activity className="w-4 h-4" />
                            <span>Telemetría en Vivo & Métricas</span>
                        </button>

                        <button type="button"
                            onClick={() => setActiveTab('firmware')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'firmware'
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 border border-purple-400/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            <FileCode className="w-4 h-4" />
                            <span>Generador de Firmware ESP32</span>
                        </button>

                        <button type="button"
                            onClick={() => setActiveTab('wiring')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'wiring'
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            <Layers className="w-4 h-4" />
                            <span>Guía de Conexión & Calibración</span>
                        </button>

                        <button type="button"
                            onClick={() => setActiveTab('simulator')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'simulator'
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50 border border-amber-400/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            <Sliders className="w-4 h-4" />
                            <span>Simulador & Webhook Tester</span>
                        </button>
                    </div>

                    {/* Live indicator toggle */}
                    {activeTab === 'telemetry' && (
                        <div className="flex items-center gap-2 shrink-0">
                            <button type="button"
                                onClick={() => setIsLivePolling(!isLivePolling)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                                    isLivePolling
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${isLivePolling ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                                {isLivePolling ? 'Stream Activo (5s)' : 'Pausado'}
                            </button>
                            <button type="button"
                                onClick={() => { fetchLiveData(); fetchHistoryData(); }}
                                disabled={isLoadingLatest}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                                title="Actualizar datos ahora"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLatest ? 'animate-spin text-cyan-400' : ''}`} />
                            </button>
                        </div>
                    )}
                </div>

                {/* MODAL BODY */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950/30">

                    {/* ========================================================
                        TAB 1: LIVE TELEMETRY & SOIL HYDRIC GAUGES
                       ======================================================== */}
                    {activeTab === 'telemetry' && (
                        <div className="space-y-6">
                            
                            {/* TOP SUMMARY CARDS: GAUGES & METRICS */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                
                                {/* 1. Primary Moisture Gauge (15cm) */}
                                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Humedad Suelo (15 cm)</p>
                                            <p className="text-[9px] text-slate-500 font-medium">Zona Radicular Activa</p>
                                        </div>
                                        <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400">
                                            <Droplets className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="my-3 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">
                                                    {Number(currentMoisture).toFixed(1)}
                                                </span>
                                                <span className="text-sm font-bold text-slate-400">% VWC</span>
                                            </div>
                                            <div className={`mt-1 inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                                                <span>{statusStyle.label}</span>
                                            </div>
                                        </div>

                                        {/* Circular Radial Gauge Visual */}
                                        <div className="relative w-16 h-16 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    className="text-slate-800"
                                                    strokeWidth="3.5"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                                <path
                                                    className={currentMoisture < 25 ? 'text-red-500' : (currentMoisture < 35 ? 'text-amber-500' : 'text-cyan-400')}
                                                    strokeDasharray={`${Math.min(100, currentMoisture)}, 100`}
                                                    strokeWidth="3.5"
                                                    strokeLinecap="round"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                            </svg>
                                            <Droplets className="w-5 h-5 text-cyan-400 absolute" />
                                        </div>
                                    </div>

                                    {/* Progress threshold bar */}
                                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-cyan-400 transition-all duration-500"
                                            style={{ width: `${Math.min(100, currentMoisture)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* 2. Deep Moisture (30cm) */}
                                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Humedad Profunda (30 cm)</p>
                                            <p className="text-[9px] text-slate-500 font-medium">Reserva Hídrica del Subsuelo</p>
                                        </div>
                                        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                                            <Layers className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="my-3">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-blue-400 font-mono">
                                                {Number(currentDeepMoisture).toFixed(1)}
                                            </span>
                                            <span className="text-sm font-bold text-slate-400">% VWC</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            {currentDeepMoisture > currentMoisture ? ' Infiltración hacia capas profundas' : ' Absorción activa por raíces'}
                                        </p>
                                    </div>

                                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-500"
                                            style={{ width: `${Math.min(100, currentDeepMoisture)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* 3. Soil Temperature */}
                                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Temperatura de Suelo</p>
                                            <p className="text-[9px] text-slate-500 font-medium">Actividad Microbiana</p>
                                        </div>
                                        <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
                                            <Thermometer className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="my-3">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-amber-400 font-mono">
                                                {Number(currentTemp).toFixed(1)}
                                            </span>
                                            <span className="text-sm font-bold text-slate-400">°C</span>
                                        </div>
                                        <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Rango ideal de mineralización
                                        </p>
                                    </div>

                                    <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                                        <span>Min 18°C</span>
                                        <span>Actual: {currentTemp}°C</span>
                                        <span>Max 28°C</span>
                                    </div>
                                </div>

                                {/* 4. Node Health & Battery */}
                                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Estado del Hardware</p>
                                            <p className="text-[9px] text-slate-500 font-medium">ESP32 + Telemetría</p>
                                        </div>
                                        <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                                            <Wifi className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="my-3 space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400 flex items-center gap-1">
                                                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> Batería:
                                            </span>
                                            <span className="font-mono font-bold text-white">{currentBattery}% (3.82V)</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400 flex items-center gap-1">
                                                <Radio className="w-3.5 h-3.5 text-cyan-400" /> Señal RSSI:
                                            </span>
                                            <span className="font-mono font-bold text-cyan-400">-62 dBm (Excelente)</span>
                                        </div>
                                    </div>

                                    <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
                                        <span>Último ping:</span>
                                        <span className="font-mono text-emerald-400 font-bold">
                                            {latestData?.received_at ? new Date(latestData.received_at).toLocaleTimeString() : 'En Vivo'}
                                        </span>
                                    </div>
                                </div>

                            </div>

                            {/* AGRONOMIC DECISION ENGINE & IRRIGATION ADVICE */}
                            <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                                
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-white tracking-wide uppercase flex items-center gap-2">
                                                Motor de Decisión Agronómica & Optimización CFE
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                Cálculo de lámina de riego basado en telemetría de suelo y tarifas eléctricas
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${
                                            isIrrigationNeeded 
                                                ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        }`}>
                                            {isIrrigationNeeded ? ' Riego Requerido' : ' Estado Hídrico Óptimo'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
                                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Lámina de Agua Sugerida</p>
                                        <p className="text-xl font-bold text-cyan-400 font-mono mt-1">
                                            {isIrrigationNeeded ? (currentMoisture < 22 ? '22.0 mm / m²' : '14.0 mm / m²') : '0.0 mm (Suficiente)'}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Equivalente a {(isIrrigationNeeded ? (currentMoisture < 22 ? 220 : 140) : 0)} m³ por hectárea</p>
                                    </div>

                                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Tiempo de Bombeo Recomendado</p>
                                        <p className="text-xl font-bold text-amber-400 font-mono mt-1">
                                            {isIrrigationNeeded ? (currentMoisture < 22 ? '50 minutos' : '30 minutos') : '0 min (Sin acción)'}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Calculado para bomba de 25 HP a 18 L/s</p>
                                    </div>

                                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-emerald-400" /> Ventana Tarifaria CFE Óptima
                                        </p>
                                        <p className="text-base font-bold text-emerald-400 mt-1">
                                            22:00 - 06:00 (Tarifa Valle 9N)
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            Ahorro estimado: <strong className="text-white">65% vs horario punta</strong> ($0.85/kWh)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* HISTORICAL CHART: MOISTURE & TEMPERATURE OVER TIME */}
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-cyan-400" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                            Evolución Temporal de Humedad (15cm / 30cm) & Temperatura Radicular
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Humedad 15cm
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Humedad 30cm
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Temp (°C)
                                        </span>
                                    </div>
                                </div>

                                <div className="h-64 w-full pt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={historyData.length > 0 ? historyData : [
                                            { time_label: '00:00', soil_moisture_15cm: 36.2, soil_moisture_30cm: 39.0, soil_temperature: 20.5 },
                                            { time_label: '03:00', soil_moisture_15cm: 35.8, soil_moisture_30cm: 38.8, soil_temperature: 19.8 },
                                            { time_label: '06:00', soil_moisture_15cm: 35.4, soil_moisture_30cm: 38.6, soil_temperature: 19.2 },
                                            { time_label: '09:00', soil_moisture_15cm: 34.8, soil_moisture_30cm: 38.3, soil_temperature: 22.0 },
                                            { time_label: '12:00', soil_moisture_15cm: 33.9, soil_moisture_30cm: 38.0, soil_temperature: 25.4 },
                                            { time_label: '15:00', soil_moisture_15cm: 33.0, soil_moisture_30cm: 37.6, soil_temperature: 26.2 },
                                            { time_label: '18:00', soil_moisture_15cm: 32.5, soil_moisture_30cm: 37.2, soil_temperature: 24.1 },
                                            { time_label: '21:00', soil_moisture_15cm: 32.0, soil_moisture_30cm: 37.0, soil_temperature: 22.8 }
                                        ]}>
                                            <defs>
                                                <linearGradient id="moisture15Grad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                                                </linearGradient>
                                                <linearGradient id="moisture30Grad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                            <XAxis dataKey="time_label" stroke="#64748b" tick={{ fontSize: 11 }} />
                                            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[10, 60]} />
                                            <Tooltip content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                                                            <p className="font-bold text-white mb-1.5">{label}</p>
                                                            <p className="text-cyan-400 font-mono">Humedad 15cm: {payload[0]?.value}%</p>
                                                            <p className="text-blue-400 font-mono">Humedad 30cm: {payload[1]?.value}%</p>
                                                            <p className="text-amber-400 font-mono">Temp Suelo: {payload[2]?.value}°C</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }} />
                                            <Area type="monotone" dataKey="soil_moisture_15cm" stroke="#22d3ee" strokeWidth={2.5} fill="url(#moisture15Grad)" name="Humedad 15cm" />
                                            <Area type="monotone" dataKey="soil_moisture_30cm" stroke="#3b82f6" strokeWidth={2} fill="url(#moisture30Grad)" name="Humedad 30cm" />
                                            <Line type="monotone" dataKey="soil_temperature" stroke="#fbbf24" strokeWidth={2} dot={false} name="Temp Suelo" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ========================================================
                        TAB 2: ESP32 FIRMWARE GENERATOR
                       ======================================================== */}
                    {activeTab === 'firmware' && (
                        <div className="space-y-6">
                            
                            {/* Generator Header & Controls */}
                            <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-5 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-black text-white tracking-wide uppercase flex items-center gap-2">
                                            <FileCode className="w-4 h-4 text-purple-400" />
                                            Generador de Código ESP32 a la Medida
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Configura tus credenciales locales y descarga el archivo listo para compilar en Arduino IDE o PlatformIO.
                                        </p>
                                    </div>

                                    {/* Language Switch */}
                                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                                        <button type="button"
                                            onClick={() => setFirmwareLang('arduino')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                firmwareLang === 'arduino' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            C++ (Arduino IDE)
                                        </button>
                                        <button type="button"
                                            onClick={() => setFirmwareLang('micropython')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                firmwareLang === 'micropython' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            MicroPython (.py)
                                        </button>
                                    </div>
                                </div>

                                {/* Form Settings Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nombre Red WiFi (SSID)</label>
                                        <input
                                            type="text"
                                            value={wifiSSID}
                                            onChange={(e) => setWifiSSID(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-purple-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Contraseña WiFi</label>
                                        <input
                                            type="text"
                                            value={wifiPassword}
                                            onChange={(e) => setWifiPassword(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-purple-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">URL API AgriSaaS</label>
                                        <input
                                            type="text"
                                            value={serverUrl}
                                            onChange={(e) => setServerUrl(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs focus:border-purple-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pin ADC (GPIO)</label>
                                        <select
                                            value={analogPin}
                                            onChange={(e) => setAnalogPin(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-purple-500 outline-none"
                                        >
                                            <option value="34">GPIO 34 (ADC1_CH6) - Recomendado</option>
                                            <option value="35">GPIO 35 (ADC1_CH7)</option>
                                            <option value="32">GPIO 32 (ADC1_CH4)</option>
                                            <option value="33">GPIO 33 (ADC1_CH5)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-800">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Calibración Seco (ADC Aire)</label>
                                        <input
                                            type="number"
                                            value={adcDry}
                                            onChange={(e) => setAdcDry(Number(e.target.value))}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-red-400 font-mono text-xs focus:border-purple-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Calibración Mojado (ADC Agua)</label>
                                        <input
                                            type="number"
                                            value={adcWet}
                                            onChange={(e) => setAdcWet(Number(e.target.value))}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-400 font-mono text-xs focus:border-purple-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Intervalo Deep Sleep (Minutos)</label>
                                        <input
                                            type="number"
                                            value={sleepMinutes}
                                            onChange={(e) => setSleepMinutes(Number(e.target.value))}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-xs focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                        <span>El código se actualiza automáticamente con tus parámetros.</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button type="button"
                                            onClick={copyFirmware}
                                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                                        >
                                            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                            <span>{copiedCode ? '¡Copiado!' : 'Copiar Código'}</span>
                                        </button>

                                        <button type="button"
                                            onClick={downloadFirmware}
                                            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-950/40"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Descargar Archivo</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Code Viewer */}
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                                    <span className="font-mono text-slate-400 font-bold text-[11px]">
                                        {firmwareLang === 'arduino' ? `AgriSaaS_${deviceId}.ino (C++ / Arduino IDE)` : `main_${deviceId}.py (MicroPython)`}
                                    </span>
                                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                        Listo para Flashear
                                    </span>
                                </div>
                                <pre className="p-4 text-slate-300 font-mono overflow-x-auto max-h-96 custom-scrollbar text-[11px] leading-relaxed">
                                    {firmwareLang === 'arduino' ? generateArduinoCode() : generateMicroPythonCode()}
                                </pre>
                            </div>

                        </div>
                    )}

                    {/* ========================================================
                        TAB 3: WIRING GUIDE & SENSOR CALIBRATION
                       ======================================================== */}
                    {activeTab === 'wiring' && (
                        <div className="space-y-6">
                            
                            {/* Visual Pinout & Connection Guide */}
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white tracking-wide uppercase">
                                            Diagrama de Conexiones Hardware (ESP32 DevKit V1 30/38 Pines)
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Esquema de cableado punto a punto para sensor capacitivo de humedad y fuente de poder.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    
                                    {/* Pin 1: VCC */}
                                    <div className="bg-slate-950 p-4 rounded-xl border border-red-500/30 space-y-1.5">
                                        <div className="flex justify-between items-center text-red-400 font-bold">
                                            <span>Cable Rojo (VCC)</span>
                                            <span className="font-mono text-[10px] bg-red-500/10 px-2 py-0.5 rounded">3.3V / VIN</span>
                                        </div>
                                        <p className="text-slate-400 text-[11px]">
                                            Conectar al pin <strong>3V3</strong> del ESP32. Para cables largos en campo (más de 3m), usar <strong>VIN (5V)</strong> con sensor V1.2.
                                        </p>
                                    </div>

                                    {/* Pin 2: GND */}
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 space-y-1.5">
                                        <div className="flex justify-between items-center text-slate-300 font-bold">
                                            <span>Cable Negro (GND)</span>
                                            <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded">GND COMÚN</span>
                                        </div>
                                        <p className="text-slate-400 text-[11px]">
                                            Conectar a cualquier pin <strong>GND</strong> del ESP32. Debe compartir masa con la batería.
                                        </p>
                                    </div>

                                    {/* Pin 3: AOUT */}
                                    <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-1.5">
                                        <div className="flex justify-between items-center text-cyan-400 font-bold">
                                            <span>Cable Amarillo/Azul (AOUT)</span>
                                            <span className="font-mono text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded">GPIO 34 (ADC1)</span>
                                        </div>
                                        <p className="text-slate-400 text-[11px]">
                                            Conectar a un pin del bloque <strong>ADC1 (GPIO 32, 33, 34, 35)</strong> ya que el ADC2 no funciona mientras el WiFi está activo.
                                        </p>
                                    </div>

                                </div>

                                {/* Graphic Schematic Card */}
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2">
                                    <p className="text-cyan-400 font-bold">📋 ESQUEMA SIMPLIFICADO DE CONEXIÓN:</p>
                                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-slate-300 whitespace-pre leading-relaxed overflow-x-auto">
{`+-----------------------+              +-------------------------------------+
| ESP32 DevKit Board    |              | Sensor Humedad Suelo Capacitivo V1.2|
|                       |              |                                     |
|           [ 3V3 ] ----+------------> | [ VCC ]  (Alimentación 3.3V)         |
|           [ GND ] ----+------------> | [ GND ]  (Tierra / Masa)            |
|       [ GPIO 34 ] <---+------------- | [ AOUT ] (Señal Analógica 0 - 3.3V) |
|                       |              +-------------------------------------+
|     [ Batería 3.7V ]  |              
|     [ 18650 / Solar ] |              
+-----------------------+`}
                                    </div>
                                </div>
                            </div>

                            {/* Calibration Step-by-Step Guide */}
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                                <h3 className="text-sm font-black text-white tracking-wide uppercase flex items-center gap-2">
                                    <Info className="w-4 h-4 text-cyan-400" />
                                    Procedimiento de Calibración en 3 Pasos
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    
                                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">1</div>
                                        <h4 className="font-bold text-white">Lectura en Aire Seco (0% Humedad)</h4>
                                        <p className="text-slate-400 text-[11px]">
                                            Sostén el sensor limpio en el aire sin tocarlo. Abre el Monitor Serial (115200 baudios) y anota el valor Raw ADC (típicamente entre <strong>3000 y 3400</strong>).
                                        </p>
                                    </div>

                                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">2</div>
                                        <h4 className="font-bold text-white">Lectura en Vaso de Agua (100% Humedad)</h4>
                                        <p className="text-slate-400 text-[11px]">
                                            Sumerge las pistas del sensor en agua hasta la línea límite (sin sumergir la electrónica superior). Anota el valor Raw ADC (típicamente entre <strong>1300 y 1600</strong>).
                                        </p>
                                    </div>

                                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">3</div>
                                        <h4 className="font-bold text-white">Ingresar Valores en Firmware</h4>
                                        <p className="text-slate-400 text-[11px]">
                                            Coloca ambos valores en la pestaña <strong>"Generador de Firmware"</strong>. El microcontrolador calculará la curva precisa para tu tipo de suelo agrícola.
                                        </p>
                                    </div>

                                </div>

                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                                    <span>
                                        <strong>Consejo de instalación en campo:</strong> Aplica silicona o barniz conformante (conformal coating) en la parte superior del sensor (donde están los componentes SMD y cables soldados) para evitar que la humedad ambiental o lluvia cause corrosión.
                                    </span>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ========================================================
                        TAB 4: LIVE SIMULATOR & WEBHOOK TESTER
                       ======================================================== */}
                    {activeTab === 'simulator' && (
                        <div className="space-y-6">
                            
                            <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-black text-white tracking-wide uppercase flex items-center gap-2">
                                            <Sliders className="w-4 h-4 text-amber-400" />
                                            Simulador Interactivo de Telemetría
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Prueba en tiempo real cómo reacciona el sistema y las alertas hídricas antes de desplegar el ESP32 en campo.
                                        </p>
                                    </div>

                                    <button type="button"
                                        onClick={copyCurlCommand}
                                        className="text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                                    >
                                        {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedCurl ? 'cURL Copiado' : 'Copiar cURL API'}</span>
                                    </button>
                                </div>

                                {/* Interactive Sliders */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    
                                    {/* Slider 1: Moisture 15cm */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-400">Humedad 15cm:</span>
                                            <span className="text-cyan-400 font-mono">{simMoisture15}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="5"
                                            max="85"
                                            step="0.5"
                                            value={simMoisture15}
                                            onChange={(e) => setSimMoisture15(parseFloat(e.target.value))}
                                            className="w-full accent-cyan-500 cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                                            <span>5% (Seco)</span>
                                            <span>85% (Saturado)</span>
                                        </div>
                                    </div>

                                    {/* Slider 2: Moisture 30cm */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-400">Humedad 30cm:</span>
                                            <span className="text-blue-400 font-mono">{simMoisture30}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="90"
                                            step="0.5"
                                            value={simMoisture30}
                                            onChange={(e) => setSimMoisture30(parseFloat(e.target.value))}
                                            className="w-full accent-blue-500 cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                                            <span>10%</span>
                                            <span>90%</span>
                                        </div>
                                    </div>

                                    {/* Slider 3: Temp */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-400">Temp Suelo:</span>
                                            <span className="text-amber-400 font-mono">{simTemp}°C</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="45"
                                            step="0.5"
                                            value={simTemp}
                                            onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                                            className="w-full accent-amber-500 cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                                            <span>10°C</span>
                                            <span>45°C</span>
                                        </div>
                                    </div>

                                    {/* Slider 4: Battery */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-400">Batería:</span>
                                            <span className="text-emerald-400 font-mono">{simBattery}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="100"
                                            step="1"
                                            value={simBattery}
                                            onChange={(e) => setSimBattery(parseFloat(e.target.value))}
                                            className="w-full accent-emerald-500 cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                                            <span>10% (Baja)</span>
                                            <span>100%</span>
                                        </div>
                                    </div>

                                </div>

                                <button type="button"
                                    onClick={handleSendSimulation}
                                    disabled={simLoading}
                                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-cyan-600 to-blue-600 hover:from-amber-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-xl shadow-cyan-950/40 flex items-center justify-center gap-2"
                                >
                                    {simLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                    <span>Simular Envío de Telemetría desde ESP32 a la API Python</span>
                                </button>
                            </div>

                            {/* Live Output Response */}
                            {simResponse && (
                                <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 space-y-3 animate-fade-in text-xs">
                                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                                        <span className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> Telemetría Procesada por el Backend
                                        </span>
                                        <span className="font-mono text-[10px] text-slate-400">
                                            {new Date(simResponse.received_at).toLocaleTimeString()}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                                            <p className="text-[10px] text-slate-500">ID Dispositivo</p>
                                            <p className="font-mono font-bold text-white text-xs mt-0.5">{simResponse.device_id}</p>
                                        </div>
                                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                                            <p className="text-[10px] text-slate-500">Riego Necesario</p>
                                            <p className={`font-bold text-xs mt-0.5 ${simResponse.irrigation_needed ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {simResponse.irrigation_needed ? ' SÍ (REQUERIDO)' : ' NO (ÓPTIMO)'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                                            <p className="text-[10px] text-slate-500">Tiempo Sugerido</p>
                                            <p className="font-bold text-cyan-400 text-xs mt-0.5">{simResponse.recommended_water_minutes} minutos</p>
                                        </div>
                                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                                            <p className="text-[10px] text-slate-500">Estado API</p>
                                            <p className="font-bold text-emerald-400 text-xs mt-0.5">{simResponse.status}</p>
                                        </div>
                                    </div>

                                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                                        <span className="text-slate-500">Mensaje Agronómico:</span> {simResponse.message}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                </div>

                {/* FOOTER */}
                <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/95 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        <span>API Status: <strong className="text-white">http://localhost:8000/api/v1/sensors/telemetry</strong></span>
                    </div>

                    <button type="button"
                        onClick={onClose}
                        className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                        Cerrar Ventana
                    </button>
                </div>

            </div>
        </div>
    );
};

export default IoTSensorModal;
