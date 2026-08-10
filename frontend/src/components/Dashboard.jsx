import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MapComponent from './MapComponent';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
    AlertTriangle, Sprout, Activity, Droplets, Thermometer, Wind,
    CloudUpload, Cloud, Sun, CloudRain, ChevronRight, Layers,
    Map as MapIcon, Cpu, MessageSquare, Bot, ChevronDown, ChevronUp,
    X, CheckCircle, Sparkles, SlidersHorizontal, ArrowRight, TrendingDown, Store, TrendingUp,
    ShieldCheck
} from 'lucide-react';
import Sidebar from './Sidebar';
import { analyzeRisk, saveFarm, getRecommendation, saveField, getFields, API_URL } from '../services/api';
import SmartActionCard from './Dashboard/SmartActionCard';
import AgriChatPanel from './Dashboard/AgriChatPanel';
import IoTSensorModal from './Dashboard/IoTSensorModal';
import EnergyIrrigationManager from './Dashboard/EnergyIrrigationManager';
import MarketPricesModal from './Dashboard/MarketPricesModal';
import UserProfileModal from './Dashboard/UserProfileModal';
import ComplianceAuditModal from './Dashboard/ComplianceAuditModal';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useField } from '../context/FieldContext';

const Dashboard = () => {
    const location = useLocation();
    const {
        analysisData: selectedFarmData,
        setAnalysisData: setSelectedFarmData,
        selectedField,
        setSelectedField,
        isAnalyzing: loading,
        setIsAnalyzing: setLoading
    } = useField();

    const [user, setUser] = useState(null);
    const [activeLayer, setActiveLayer] = useState('rgb'); // 'rgb' or 'ndvi'
    const [selectedDateIndex, setSelectedDateIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isIoTModalOpen, setIsIoTModalOpen] = useState(false);
    const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
    
    // UI Panel Controls
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
    const [rightPanelTab, setRightPanelTab] = useState('analysis'); // 'analysis' | 'chat'
    const [isBottomChartOpen, setIsBottomChartOpen] = useState(true);

    const [farmName, setFarmName] = useState('');
    const [savedFields, setSavedFields] = useState([]);

    // Fetch user on mount
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    // Load saved fields when user is authenticated
    useEffect(() => {
        if (user) {
            loadFields();
        }
    }, [user]);

    // Handle incoming navigation state (e.g. from My Farms)
    useEffect(() => {
        if (location.state?.selectedFarm) {
            const farm = location.state.selectedFarm;
            const data = farm.risk_data || farm.raw_analysis || {};

            if (data) {
                const transformedData = {
                    id: farm.id,
                    riskScore: data.water_risk_score || data.riskScore || 50,
                    riskLevel: data.climate_alert || data.riskLevel || 'MEDIUM',
                    ndviData: data.ndvi_trend ? data.ndvi_trend.map(d => {
                        const dateObj = new Date(d.month);
                        const formattedName = !isNaN(dateObj.getTime()) && d.month.includes('-')
                            ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : d.month;
                        return { ...d, name: formattedName, rawDate: d.month, ndvi: d.value };
                    }) : (data.ndviData || []),
                    recommendation: data.recommendation,
                    aiRecommendation: farm.aiRecommendation || data.aiRecommendation,
                    moisture: data.moisture_content || data.moisture || '25%',
                    temp: data.temperature || data.temp || '24°C',
                    weather: data.weather,
                    geometry: {
                        type: "Polygon",
                        coordinates: farm.geometry?.coordinates || data.geometry?.coordinates || []
                    },
                    raw_analysis: {
                        ...data,
                        image_base64: data.image_base64 || undefined,
                        ndvi_image_base64: data.ndvi_image_base64 || undefined,
                        image_bounds: data.image_bounds || undefined
                    }
                };
                setSelectedFarmData(transformedData);
                setFarmName(farm.name || '');
                setIsRightPanelOpen(true);
                setRightPanelTab('analysis');
                toast.success(`Loaded farm: ${farm.name}`);
            }
        }
    }, [location.state]);

    const loadFields = async () => {
        if (!user?.id) return;
        try {
            const fields = await getFields(user.id);
            if (fields) setSavedFields(fields);
        } catch (error) {
            console.error("Error loading fields", error);
        }
    };

    const handlePolygonCreated = async (latlngs, existingFarmId = null) => {
        setLoading(true);
        setSelectedFarmData(null);
        setIsRightPanelOpen(true);
        setRightPanelTab('analysis');

        try {
            const data = await analyzeRisk(latlngs);

            let recData = null;
            try {
                // Calculate dynamic proxy values for AI context based on real weather
                const currentHumidity = data.weather?.humidity || 50;
                const dynamicNdmi = currentHumidity < 40 ? -0.2 : (currentHumidity > 70 ? 0.3 : 0.05);
                const dynamicRainProb = currentHumidity > 80 ? 70 : (currentHumidity > 60 ? 40 : 10);

                const aiContext = {
                    crop_type: "Cultivo General",
                    growth_stage: "Desarrollo",
                    ndvi_value: data.ndvi_trend && data.ndvi_trend.length > 0 ? data.ndvi_trend[data.ndvi_trend.length - 1].value : 0.4,
                    ndmi_value: dynamicNdmi,
                    temp: data.weather?.temp || 25,
                    rain_prob: dynamicRainProb,
                    soil_moisture: data.moisture_content ? data.moisture_content.replace('%', '') : "50"
                };
                recData = await getRecommendation(aiContext);
            } catch (err) {
                console.warn("AI Rec failed", err);
            }

            // Transform API response
            const farmPayload = {
                id: existingFarmId,
                riskScore: data.water_risk_score,
                riskLevel: data.climate_alert,
                ndviData: (data.ndvi_trend || []).map(d => {
                    const dateObj = new Date(d.month);
                    const formattedName = !isNaN(dateObj.getTime()) && d.month.includes('-')
                        ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : d.month;
                    return { ...d, name: formattedName, rawDate: d.month, ndvi: d.value };
                }),
                recommendation: data.recommendation,
                aiRecommendation: recData,
                moisture: data.moisture_content || '25%',
                temp: data.temperature || '24°C',
                weather: data.weather,
                geometry: {
                    type: "Polygon",
                    coordinates: [latlngs.map(pt => [pt.lng, pt.lat]).concat([[latlngs[0].lng, latlngs[0].lat]])]
                },
                raw_analysis: {
                    ...data,
                    image_base64: data.image_base64 || undefined,
                    ndvi_image_base64: data.ndvi_image_base64 || undefined,
                    image_bounds: data.image_bounds || undefined
                }
            };

            setSelectedFarmData(farmPayload);
            toast.success("Analysis Complete", { description: "Satellite & risk telemetry processed." });

        } catch (error) {
            console.error("Analysis Failed:", error);
            toast.error("Analysis Failed", { description: "Using fallback simulation model." });

            setSelectedFarmData({
                id: existingFarmId,
                riskScore: 78,
                riskLevel: 'HIGH',
                ndviData: [
                    { name: 'Jan', ndvi: 0.3 }, { name: 'Feb', ndvi: 0.35 }, { name: 'Mar', ndvi: 0.45 },
                    { name: 'Apr', ndvi: 0.6 }, { name: 'May', ndvi: 0.75 }, { name: 'Jun', ndvi: 0.82 }, { name: 'Jul', ndvi: 0.70 }
                ],
                recommendation: "ALTO RIESGO HÍDRICO: Déficit severo de humedad en suelo. Se sugiere riego inmediato.",
                moisture: "15%",
                temp: "34°C",
                weather: { description: "Sunny", temp: 34 },
                geometry: {
                    type: "Polygon",
                    coordinates: [latlngs.map(pt => [pt.lng, pt.lat]).concat([[latlngs[0].lng, latlngs[0].lat]])]
                },
                raw_analysis: {}
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFarm = () => {
        if (!selectedFarmData) {
            toast.info("Draw a polygon on the map first to analyze and save.");
            return;
        }
        setFarmName('');
        setIsModalOpen(true);
    };

    const confirmSave = async () => {
        if (!farmName.trim()) {
            toast.error("Please enter a valid farm name");
            return;
        }

        const userId = user?.id || "00000000-0000-0000-0000-000000000000";

        try {
            const rawCoords = selectedFarmData?.geometry?.coordinates?.[0] || [];
            const cleanCoordinates = rawCoords.map(p => [p[0], p[1]]);

            const payload = {
                name: farmName,
                polygon: {
                    type: "Polygon",
                    coordinates: [cleanCoordinates]
                },
                crop_type: "Wheat",
                user_id: userId,
                risk_data: selectedFarmData.raw_analysis && Object.keys(selectedFarmData.raw_analysis).length > 0 
                    ? selectedFarmData.raw_analysis 
                    : {
                        water_risk_score: selectedFarmData.riskScore,
                        climate_alert: selectedFarmData.riskLevel,
                        recommendation: selectedFarmData.recommendation,
                        temperature: selectedFarmData.temp,
                        moisture_content: selectedFarmData.moisture,
                        ndvi_trend: selectedFarmData.ndviData?.map(d => ({ month: d.rawDate || d.name, value: d.ndvi })),
                        weather: selectedFarmData.weather,
                        analyzed_at: new Date().toISOString()
                    }
            };

            const response = await saveField(payload);
            
            // Extract the generated UUID from Supabase response and update state
            if (response && response.data && response.data.length > 0) {
                 setSelectedFarmData(prev => ({ ...prev, id: response.data[0].id }));
            } else if (response && response.id) {
                 setSelectedFarmData(prev => ({ ...prev, id: response.id }));
            }

            toast.success(`Farm "${farmName}" saved successfully!`);
            setIsModalOpen(false);
            loadFields();
        } catch (error) {
            console.error("Save Field Error:", error);
            toast.error('Failed to save field');
        }
    };

    const loadSavedField = async (field) => {
        if (!field.geometry?.coordinates && !field.polygon?.coordinates) return;

        const coords = field.geometry?.coordinates?.[0] || field.polygon?.coordinates?.[0] || [];
        const latlngs = coords.map(c => ({ lat: c[1], lng: c[0] }));

        toast.info(`Loading ${field.name}...`);
        setSelectedField(field);
        setFarmName(field.name || '');
        handlePolygonCreated(latlngs, field.id);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs p-3 rounded-xl shadow-2xl border border-slate-700">
                    <p className="font-semibold text-slate-300 mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
                        <p className="font-mono text-emerald-400 font-bold text-sm">NDVI: {Number(payload[0].value).toFixed(2)}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const overlayImage = selectedFarmData?.raw_analysis
        ? (activeLayer === 'ndvi' && selectedFarmData.raw_analysis.ndvi_image_base64
            ? `data:image/png;base64,${selectedFarmData.raw_analysis.ndvi_image_base64}`
            : `data:image/png;base64,${selectedFarmData.raw_analysis.image_base64}`)
        : null;

    return (
        <div className="relative w-full h-full overflow-hidden bg-slate-950 text-slate-200 flex">

            {/* 1. Left Navigation Sidebar (Fixed) */}
            <div className="z-40 h-full flex-none shadow-2xl">
                <Sidebar onToggleChat={() => {
                    setIsRightPanelOpen(true);
                    setRightPanelTab(prev => prev === 'chat' ? 'analysis' : 'chat');
                }} onOpenProfile={() => setIsProfileModalOpen(true)} />
            </div>

            {/* 2. Main Workspace */}
            <div className="flex-1 relative h-full flex flex-col overflow-hidden">
                
                {/* 2.1 Fullscreen Map Layer */}
                <div className="absolute inset-0 z-0 bg-slate-900">
                    <MapComponent
                        onPolygonCreated={handlePolygonCreated}
                        overlayImage={overlayImage}
                        overlayBounds={selectedFarmData?.raw_analysis?.image_bounds}
                        activePolygon={selectedField?.geometry?.coordinates || selectedField?.polygon || selectedFarmData?.geometry?.coordinates}
                    />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30 z-[1]" />
                </div>

                {/* 2.2 TOP UNIFIED ACTION BAR (High Visibility & Clean Layout) */}
                <header className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none gap-4">
                    
                    {/* Left: Brand Badge & Layer Toggles */}
                    <div className="flex items-center gap-3 pointer-events-auto bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
                        <div className="flex items-center gap-2.5 px-2">
                            <div className="p-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <Sprout className="text-emerald-400 h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-sm font-black text-white tracking-tight leading-none">AgroSentinel</h1>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <p className="text-[8px] uppercase tracking-widest text-emerald-400 font-bold">Sentinel-2 Live</p>
                                </div>
                            </div>
                        </div>

                        {selectedFarmData && (
                            <>
                                <div className="w-px h-6 bg-white/10 mx-0.5" />
                                <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/5">
                                    <button
                                        onClick={() => setActiveLayer('rgb')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            activeLayer === 'rgb' 
                                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40' 
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                    >
                                        True Color
                                    </button>
                                    <button
                                        onClick={() => setActiveLayer('ndvi')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            activeLayer === 'ndvi' 
                                                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40' 
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                    >
                                        Crop Health
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: Primary Action Controls */}
                    <div className="flex items-center gap-2.5 pointer-events-auto">
                        
                        {/* Prominent Save Farm Button (Always Accessible when analysis exists) */}
                        {selectedFarmData && (
                            <button
                                onClick={handleSaveFarm}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-xl shadow-emerald-950/50 border border-emerald-400/30 flex items-center gap-2 transition-all font-bold text-xs hover:scale-105 active:scale-95 animate-fade-in"
                                title="Save current farm analysis to database"
                            >
                                <CloudUpload className="w-4 h-4" />
                                <span>Guardar Parcela</span>
                            </button>
                        )}

                        {/* CFE & CONAGUA Compliance Audit Button */}
                        <button
                            onClick={() => setIsComplianceModalOpen(true)}
                            className="bg-slate-900/80 backdrop-blur-xl border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 px-3.5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all font-bold text-xs hover:border-emerald-400 hover:scale-105 active:scale-95 animate-pulse-subtle"
                            title="Auditoría Regulatoria CFE & CONAGUA"
                        >
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="hidden sm:inline">Auditoría CFE/CONAGUA</span>
                        </button>

                        {/* Market SNIIM Button */}
                        <button
                            onClick={() => setIsMarketModalOpen(true)}
                            className="bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 px-3.5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all font-bold text-xs hover:border-emerald-400 hover:scale-105 active:scale-95"
                            title="Ver Precios de Mercado Nacional (SNIIM)"
                        >
                            <Store className="w-4 h-4 text-emerald-400" />
                            <span className="hidden sm:inline">Mercado SNIIM</span>
                        </button>

                        {/* IoT Telemetry Button */}
                        <button
                            onClick={() => setIsIoTModalOpen(true)}
                            className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 px-3.5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all font-bold text-xs hover:border-cyan-400"
                            title="Connect Hardware IoT Sensors"
                        >
                            <Cpu className="w-4 h-4 text-cyan-400" />
                            <span className="hidden sm:inline">Conectar IoT</span>
                        </button>

                        {/* Toggle Right Panel / AI Assistant */}
                        <button
                            onClick={() => {
                                if (!isRightPanelOpen) {
                                    setIsRightPanelOpen(true);
                                    setRightPanelTab('analysis');
                                } else {
                                    setRightPanelTab(prev => prev === 'analysis' ? 'chat' : 'analysis');
                                }
                            }}
                            className={`px-3.5 py-2.5 rounded-xl shadow-lg border flex items-center gap-2 transition-all font-bold text-xs ${
                                isRightPanelOpen && (rightPanelTab === 'chat' || rightPanelTab === 'riego')
                                    ? 'bg-purple-600 border-purple-400 text-white shadow-purple-950/50'
                                    : 'bg-slate-900/80 backdrop-blur-xl border-white/10 text-slate-300 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            <Bot className="w-4 h-4 text-purple-400" />
                            <span className="hidden sm:inline">
                                {isRightPanelOpen && (rightPanelTab === 'chat' || rightPanelTab === 'riego') ? 'Ver Análisis' : 'Asistente IA'}
                            </span>
                        </button>
                    </div>
                </header>

                {/* 2.3 RIGHT DOCKED DRAWER: Clean Multi-Tab Panel */}
                <div className={`
                    absolute top-20 right-4 z-30 w-full sm:w-[390px] 
                    max-h-[calc(100vh-180px)] flex flex-col 
                    bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl 
                    transition-all duration-300 ease-in-out
                    ${isRightPanelOpen ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0 pointer-events-none'}
                `}>
                    {/* Drawer Header Tabs */}
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-slate-900/50 rounded-t-2xl">
                        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setRightPanelTab('analysis')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    rightPanelTab === 'analysis'
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                }`}
                            >
                                <Activity className="w-3.5 h-3.5" />
                                <span>Diagnóstico</span>
                            </button>
                            <button
                                onClick={() => setRightPanelTab('chat')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    rightPanelTab === 'chat'
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                }`}
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>IA</span>
                            </button>
                            <button
                                onClick={() => setRightPanelTab('riego')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    rightPanelTab === 'riego'
                                        ? 'bg-sky-600 text-white shadow-md'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                }`}
                            >
                                <Droplets className="w-3.5 h-3.5" />
                                <span>Riego & CFE</span>
                            </button>
                        </div>

                        {/* Close Drawer Button */}
                        <button
                            onClick={() => setIsRightPanelOpen(false)}
                            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            title="Ocultar Panel"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Drawer Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                        
                        {/* TAB 1: Farm Analysis & Diagnostics */}
                        {rightPanelTab === 'analysis' && (
                            <>
                                {loading && (
                                    <div className="bg-slate-900/70 border border-white/10 p-6 rounded-2xl text-center space-y-3">
                                        <Activity className="animate-spin h-8 w-8 text-emerald-500 mx-auto" />
                                        <h3 className="text-sm font-bold text-white">Analizando Parcela...</h3>
                                        <p className="text-xs text-slate-400">Consultando Sentinel-2 y modelo de estrés hídrico</p>
                                    </div>
                                )}

                                {!selectedFarmData && !loading && (
                                    <div className="space-y-4">
                                        {/* Guide Card */}
                                        <div className="bg-slate-900/50 border border-white/10 p-5 rounded-2xl">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                                                    <MapIcon className="w-5 h-5" />
                                                </div>
                                                <h3 className="text-sm font-bold text-white">Selecciona tu Parcela</h3>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed mb-3">
                                                Usa la <strong>Herramienta Polígono</strong> en la parte superior izquierda del mapa para delimitar tu cultivo.
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                                                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                                <span>El sistema calculará automáticamente NDVI y riego óptimo</span>
                                            </div>
                                        </div>

                                        {/* Saved Fields List */}
                                        {savedFields.length > 0 && (
                                            <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
                                                <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Parcelas Guardadas</h4>
                                                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{savedFields.length}</span>
                                                </div>
                                                <div className="max-h-52 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                                                    {savedFields.map((field) => (
                                                        <button
                                                            key={field.id}
                                                            onClick={() => loadSavedField(field)}
                                                            className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors group text-left"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                                                                    <Layers className="w-3.5 h-3.5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{field.name}</p>
                                                                    <p className="text-[9px] text-slate-500 uppercase">{field.crop_type || 'Cultivo'}</p>
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedFarmData && !loading && (
                                    <div className="space-y-4">
                                        
                                        {/* Smart AI Action Card */}
                                        {selectedFarmData.aiRecommendation && (
                                            <SmartActionCard recommendation={selectedFarmData.aiRecommendation} />
                                        )}

                                        {/* Weather & Soil Telemetry Card */}
                                        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 shadow-xl">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                                                    Condiciones en Campo
                                                </h4>
                                                <span className="text-xs font-bold text-slate-300">{selectedFarmData.temp}</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5">
                                                <div className="bg-slate-950/60 border border-white/5 p-2.5 rounded-xl flex items-center gap-2.5">
                                                    <div className="p-1.5 bg-sky-500/10 rounded-lg text-sky-400">
                                                        <Droplets className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-500 uppercase font-semibold">Humedad</p>
                                                        <p className="font-bold text-slate-200 text-xs">{selectedFarmData.moisture}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-950/60 border border-white/5 p-2.5 rounded-xl flex items-center gap-2.5">
                                                    <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400">
                                                        <Wind className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-500 uppercase font-semibold">Viento</p>
                                                        <p className="font-bold text-slate-200 text-xs">
                                                            {selectedFarmData.weather?.wind_speed ? `${selectedFarmData.weather.wind_speed} km/h` : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Water Risk Assessment Card */}
                                        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 shadow-xl relative overflow-hidden">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Índice de Riesgo Hídrico</h4>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                                    selectedFarmData.riskScore > 70 
                                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                }`}>
                                                    {selectedFarmData.riskLevel || (selectedFarmData.riskScore > 70 ? 'CRÍTICO' : 'NORMAL')}
                                                </span>
                                            </div>

                                            <div className="flex items-baseline gap-2 my-2">
                                                <span className={`text-4xl font-black tracking-tight ${
                                                    selectedFarmData.riskScore > 70 ? 'text-red-400' : 'text-emerald-400'
                                                }`}>
                                                    {selectedFarmData.riskScore}
                                                </span>
                                                <span className="text-xs text-slate-500 font-bold">/ 100 Riesgo</span>
                                            </div>

                                            <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-white/5 leading-relaxed">
                                                {selectedFarmData.recommendation}
                                            </p>
                                        </div>

                                        {/* Sticky Save Farm Action inside Drawer */}
                                        <button
                                            onClick={handleSaveFarm}
                                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 group text-xs border border-emerald-400/20"
                                        >
                                            <CloudUpload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                            Guardar esta Parcela
                                        </button>

                                        {/* Official FIRA Report Button */}
                                        <button
                                            onClick={() => {
                                                if (selectedFarmData && selectedFarmData.id) {
                                                    toast.success('Generando reporte PDF...');
                                                    window.open(`${API_URL}/api/v1/farms/${selectedFarmData.id}/report`, '_blank');
                                                } else {
                                                    toast.error('Debes guardar la parcela primero antes de generar el reporte.');
                                                }
                                            }}
                                            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group text-[10px] border border-slate-700 hover:border-slate-500 uppercase tracking-widest"
                                        >
                                            <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                                            Generar Reporte Oficial (FIRA / PDF)
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* TAB 2: AI Agronomist Chat Panel */}
                        {rightPanelTab === 'chat' && (
                            <div className="h-[480px] -m-4">
                                <AgriChatPanel
                                    field={selectedFarmData ? {
                                        name: farmName || "Parcela Actual",
                                        analysis_data: {
                                            risk_score: selectedFarmData.riskScore,
                                            moisture: selectedFarmData.moisture ? String(selectedFarmData.moisture).replace('%', '') : '0',
                                            temp: selectedFarmData.temp
                                        }
                                    } : null}
                                    onClose={() => setRightPanelTab('analysis')}
                                />
                            </div>
                        )}

                        {/* TAB 3: Irrigation & Energy Manager */}
                        {rightPanelTab === 'riego' && (
                            <div className="h-full -m-4">
                                <EnergyIrrigationManager farmData={selectedFarmData} />
                            </div>
                        )}

                    </div>
                </div>

                {/* 2.4 Floating Button to Re-open Drawer if Closed */}
                {!isRightPanelOpen && (
                    <button
                        onClick={() => setIsRightPanelOpen(true)}
                        className="absolute top-20 right-4 z-30 bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white p-3 rounded-2xl shadow-2xl flex items-center gap-2 hover:bg-slate-800 transition-all hover:scale-105"
                        title="Abrir Panel de Análisis"
                    >
                        <Activity className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-bold pr-1">Ver Datos</span>
                    </button>
                )}

                {/* 2.5 BOTTOM COMPACT NDVI TIMELINE (Compact 160px with Collapse Toggle) */}
                <div className={`
                    absolute bottom-4 left-4 z-20 transition-all duration-300
                    ${isRightPanelOpen ? 'right-4 sm:right-[410px]' : 'right-4'}
                    ${selectedFarmData ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
                `}>
                    <div className="bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                        
                        {/* Timeline Header Bar with Collapse Button */}
                        <div className="px-4 py-2 bg-slate-900/60 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                                <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                                    Historial NDVI & Salud Vegetal
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsBottomChartOpen(!isBottomChartOpen)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                {isBottomChartOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Chart Body */}
                        {isBottomChartOpen && selectedFarmData && (
                            <div className="p-3 flex flex-col sm:flex-row items-center gap-3">
                                
                                {/* 1. Area Chart */}
                                <div className="h-28 w-full sm:w-2/3">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={selectedFarmData.ndviData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis dataKey="name" hide />
                                            <YAxis hide domain={[0, 1]} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="ndvi"
                                                stroke="#10b981"
                                                strokeWidth={2.5}
                                                fillOpacity={1}
                                                fill="url(#ndviGradient)"
                                                activeDot={{ r: 5, strokeWidth: 0, fill: '#fff' }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* 2. Month Pills */}
                                <div className="flex sm:flex-col gap-1.5 overflow-x-auto sm:overflow-y-auto max-h-28 w-full sm:w-1/3 custom-scrollbar py-0.5">
                                    {selectedFarmData.ndviData.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedDateIndex(idx)}
                                            className={`px-2.5 py-1.5 rounded-lg border text-left flex items-center justify-between transition-all shrink-0 sm:shrink ${
                                                selectedDateIndex === idx 
                                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
                                                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-800'
                                            }`}
                                        >
                                            <span className="text-[10px] font-semibold">{item.name}</span>
                                            <span className="text-xs font-mono font-bold text-emerald-400 ml-2">{Number(item.ndvi).toFixed(2)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 5. Clean Modal Container for Market Prices (SNIIM) */}
                <MarketPricesModal 
                    isOpen={isMarketModalOpen} 
                    onClose={() => setIsMarketModalOpen(false)} 
                />

                {/* User Profile Modal */}
                <UserProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                />

                {/* 6. SAVE FARM MODAL */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
                        <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-emerald-400">
                                    <CloudUpload className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Guardar Análisis de Parcela</h3>
                                    <p className="text-xs text-slate-400">Almacenar de forma segura en tu cuenta</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nombre de la Parcela</label>
                                    <input
                                        type="text"
                                        value={farmName}
                                        onChange={(e) => setFarmName(e.target.value)}
                                        placeholder="Ej: Rancho Los Olivos - Lote 3"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none text-sm font-medium"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-3">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-400 text-xs font-bold hover:bg-slate-800 hover:text-white transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmSave}
                                        className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xl shadow-emerald-950/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Confirmar y Guardar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. IoT Sensor Modal */}
                <IoTSensorModal
                    isOpen={isIoTModalOpen}
                    onClose={() => setIsIoTModalOpen(false)}
                />

                {/* 5. CFE & CONAGUA Regulatory Audit Modal */}
                <ComplianceAuditModal
                    isOpen={isComplianceModalOpen}
                    onClose={() => setIsComplianceModalOpen(false)}
                    selectedFarm={selectedField || selectedFarmData}
                />

            </div>
        </div>
    );
};

export default Dashboard;
