import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, 
    Zap, 
    Droplets, 
    FileText, 
    Download, 
    AlertTriangle, 
    CheckCircle2, 
    Clock, 
    TrendingDown, 
    X, 
    RefreshCw, 
    Sliders, 
    Send, 
    Cpu,
    ExternalLink,
    DollarSign,
    Check
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ComplianceAuditModal = ({ isOpen, onClose, selectedFarm, latestTelemetry }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [auditData, setAuditData] = useState(null);

    // Configurable Pump Parameters
    const [pumpHp, setPumpHp] = useState(25);
    const [flowRate, setFlowRate] = useState(18);
    const [hectares, setHectares] = useState(10);
    const [crop, setCrop] = useState('Aguacate Hass / Berries');

    useEffect(() => {
        if (selectedFarm) {
            setHectares(selectedFarm.area_hectares || selectedFarm.hectares || 10);
            setCrop(selectedFarm.crop_type || selectedFarm.crop || 'Aguacate Hass / Berries');
        }
    }, [selectedFarm]);

    // Automatically run audit when modal opens
    useEffect(() => {
        if (isOpen) {
            handleRunAudit();
        }
    }, [isOpen, selectedFarm, latestTelemetry]);

    const handleRunAudit = async () => {
        setLoading(true);
        try {
            const payload = {
                farm_id: selectedFarm?.id || 'demo-farm-01',
                farm_name: selectedFarm?.name || 'Predio Agrícola La Esperanza',
                crop: crop,
                hectares: parseFloat(hectares) || 10.0,
                latitude: parseFloat(selectedFarm?.latitude || selectedFarm?.lat || 20.65),
                longitude: parseFloat(selectedFarm?.longitude || selectedFarm?.lon || -103.35),
                ndvi_avg: parseFloat(selectedFarm?.ndvi_avg || selectedFarm?.ndvi || 0.48),
                pump_hp: parseFloat(pumpHp),
                flow_rate_lps: parseFloat(flowRate),
                device_id: latestTelemetry?.device_id || 'ESP32-CAMPO-01'
            };

            const response = await fetch('http://localhost:8000/api/v1/compliance/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const resData = await response.json();
                setAuditData(resData.audit);
            } else {
                toast.error('Error al ejecutar la auditoría de cumplimiento');
            }
        } catch (err) {
            console.error('Audit error:', err);
            toast.error('No se pudo conectar con el motor regulatorio CFE/CONAGUA');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        setDownloading(true);
        try {
            const payload = {
                farm_id: selectedFarm?.id || 'demo-farm-01',
                farm_name: selectedFarm?.name || 'Predio Agrícola La Esperanza',
                crop: crop,
                hectares: parseFloat(hectares) || 10.0,
                latitude: parseFloat(selectedFarm?.latitude || selectedFarm?.lat || 20.65),
                longitude: parseFloat(selectedFarm?.longitude || selectedFarm?.lon || -103.35),
                ndvi_avg: parseFloat(selectedFarm?.ndvi_avg || selectedFarm?.ndvi || 0.48),
                pump_hp: parseFloat(pumpHp),
                flow_rate_lps: parseFloat(flowRate),
                device_id: latestTelemetry?.device_id || 'ESP32-CAMPO-01'
            };

            const response = await fetch('http://localhost:8000/api/v1/compliance/download-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Dictamen_CFE_CONAGUA_${(selectedFarm?.name || 'Predio').replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                toast.success('Dictamen Oficial descargado exitosamente');
            } else {
                toast.error('Error al generar el PDF del dictamen');
            }
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Error descargando el archivo');
        } finally {
            setDownloading(false);
        }
    };

    const handleScheduleSms = async () => {
        if (!auditData) return;
        try {
            // Schedule the suggested SMS for today at 23:30
            const now = new Date();
            const sendAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 30, 0);

            const payload = {
                to_phone: '+523318283920', // Default registered phone
                message: auditData.action_plan.suggested_sms_alert,
                send_at: sendAt.toISOString(),
                repeat_days: [1, 3, 5] // Mon, Wed, Fri
            };

            const res = await fetch('http://localhost:8000/api/v1/notify/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('Alarma SMS programada en Horario Valle CFE (23:30 hrs)', {
                    description: 'Se enviará notificación automática al encargado de bomba.'
                });
            } else {
                // Redirect to Communications Center
                navigate('/communications');
            }
        } catch (e) {
            navigate('/communications');
        }
    };

    if (!isOpen) return null;

    const conagua = auditData?.conagua_regulatory;
    const cfe = auditData?.cfe_energy_analysis;
    const agronomic = auditData?.agronomic_indicators;
    const actionPlan = auditData?.action_plan;

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100 relative">
                
                {/* Header with CFE and CONAGUA Badges */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/70 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-emerald-400">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                                    Auditoría Oficial
                                </span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20 flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-yellow-400" /> CFE Tarifa 9N
                                </span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-md border border-sky-500/20 flex items-center gap-1">
                                    <Droplets className="w-3 h-3 text-sky-400" /> CONAGUA / REPDA
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                                Dictamen Regulatorio & Optimización Tarifaria
                            </h2>
                        </div>
                    </div>
                    
                    <button
                        onClick={onClose}
                        className="p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Scrollable Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    
                    {/* Top Control Bar: Pump & Field Parameters */}
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-xl text-slate-400">
                                <Sliders className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">Parámetros del Pozo y Parcela:</p>
                                <p className="text-[11px] text-slate-400">
                                    {selectedFarm?.name || 'Predio Principal'} • {hectares} Ha • Cultivo: {crop}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-400 font-semibold">Bomba:</label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        value={pumpHp}
                                        onChange={(e) => setPumpHp(Number(e.target.value))}
                                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-bold"
                                    />
                                    <span className="text-[10px] text-slate-500 font-bold ml-1">HP</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-400 font-semibold">Caudal:</label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        value={flowRate}
                                        onChange={(e) => setFlowRate(Number(e.target.value))}
                                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-bold"
                                    />
                                    <span className="text-[10px] text-slate-500 font-bold ml-1">L/s</span>
                                </div>
                            </div>

                            <button
                                onClick={handleRunAudit}
                                disabled={loading}
                                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                Recalcular Dictamen
                            </button>
                        </div>
                    </div>

                    {/* Main Audit Data View */}
                    {loading && !auditData ? (
                        <div className="py-20 text-center space-y-4">
                            <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
                            <p className="text-sm font-bold text-slate-300">Consultando registros oficiales de CONAGUA y tablas tarifarias CFE...</p>
                        </div>
                    ) : auditData ? (
                        <>
                            {/* 2-Column Core Analysis: CONAGUA & CFE */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                
                                {/* CARD 1: CONAGUA STATUS */}
                                <div className="p-6 rounded-3xl bg-slate-950/70 border border-sky-500/20 relative overflow-hidden flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-black tracking-widest text-sky-400 uppercase flex items-center gap-1.5">
                                                <Droplets className="w-4 h-4 text-sky-400" /> CONAGUA / REPDA
                                            </span>
                                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${conagua?.compliance_badge?.color === 'RED' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                                                {conagua?.compliance_badge?.status || 'NORMAL'}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-1">
                                            {conagua?.aquifer_name || 'Acuífero Georreferenciado'}
                                        </h3>
                                        <p className="text-xs text-slate-400 mb-4">
                                            {conagua?.veda_status || 'Monitoreo Oficial Activo'}
                                        </p>

                                        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 mb-4">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">Monitor de Sequía (SMN):</span>
                                                <span className="font-bold text-amber-400">{conagua?.drought_monitor_level || 'Normal'}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">Cuota Anual Autorizada:</span>
                                                <span className="font-mono text-white">{(conagua?.quota_annual_authorized_m3 || 0).toLocaleString()} m³</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">Extracción Ciclo Estimada:</span>
                                                <span className="font-mono text-cyan-300 font-bold">{(conagua?.estimated_cycle_extraction_m3 || 0).toLocaleString()} m³</span>
                                            </div>
                                        </div>

                                        {/* Quota Progress Bar */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-slate-400">Uso de Cuota REPDA</span>
                                                <span className="font-bold text-white">{conagua?.quota_utilization_pct || 0}%</span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${(conagua?.quota_utilization_pct || 0) > 80 ? 'bg-red-500' : 'bg-cyan-500'}`}
                                                    style={{ width: `${Math.min(100, conagua?.quota_utilization_pct || 0)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                        <span>{conagua?.legal_alert || 'Cumplimiento normativo regular.'}</span>
                                    </div>
                                </div>

                                {/* CARD 2: CFE ENERGY SAVINGS */}
                                <div className="p-6 rounded-3xl bg-slate-950/70 border border-emerald-500/20 relative overflow-hidden flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
                                                <Zap className="w-4 h-4 text-yellow-400" /> Optimización Tarifaria CFE
                                            </span>
                                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                                {cfe?.tariff_applied || 'Tarifa 9N'}
                                            </span>
                                        </div>

                                        {/* Big Savings Highlight */}
                                        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 mb-4">
                                            <p className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider">
                                                Ahorro Estimado vs Horario Punta
                                            </p>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-3xl sm:text-4xl font-black text-white">
                                                    ${(cfe?.net_savings_mxn || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                                                </span>
                                                <span className="text-sm font-bold text-emerald-400">
                                                    (-{cfe?.savings_percentage || 0}%)
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                Por cada ciclo de riego de {cfe?.irrigation_hours_needed || 0} horas ({cfe?.total_kwh_required || 0} kWh).
                                            </p>
                                        </div>

                                        {/* Tariff Rates Comparison Table */}
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                                <p className="text-[10px] text-red-400 font-bold uppercase">Horario Punta (18:00 - 22:00)</p>
                                                <p className="text-base font-black text-white mt-1">${(cfe?.cost_in_peak_hours_mxn || 0).toFixed(2)} MXN</p>
                                                <p className="text-[10px] text-slate-500">$2.89 MXN / kWh</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                                                <p className="text-[10px] text-emerald-400 font-bold uppercase">Horario Nocturno (Tarifa 9N)</p>
                                                <p className="text-base font-black text-emerald-300 mt-1">${(cfe?.cost_in_night_9n_mxn || 0).toFixed(2)} MXN</p>
                                                <p className="text-[10px] text-emerald-500">$0.38 MXN / kWh</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                        <span className="text-slate-400">Fuente Telemetría:</span>
                                        <span className="font-semibold text-white flex items-center gap-1">
                                            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                                            {auditData?.farm_overview?.sensor_source}
                                        </span>
                                    </div>
                                </div>

                            </div>

                            {/* Risk Matrix Table */}
                            <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Matriz de Riesgos Detectada
                                </h4>
                                <div className="space-y-2.5">
                                    {auditData?.risk_matrix?.map((risk, i) => (
                                        <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                                            <div>
                                                <p className="text-xs font-bold text-white">{risk.domain}</p>
                                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{risk.details}</p>
                                            </div>
                                            <span className={`shrink-0 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${risk.level === 'CRÍTICO' || risk.level === 'ALTO' ? 'bg-red-500/10 text-red-400 border-red-500/20' : (risk.level === 'MEDIO' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20')}`}>
                                                {risk.level}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Automated SMS Recommendation Action Box */}
                            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-emerald-400" />
                                        <p className="text-xs font-bold text-white uppercase tracking-wider">Plan Prescriptivo Inmediato</p>
                                    </div>
                                    <p className="text-xs text-slate-300 italic">
                                        "{actionPlan?.suggested_sms_alert}"
                                    </p>
                                </div>
                                <button
                                    onClick={handleScheduleSms}
                                    className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    Programar Alarma SMS
                                </button>
                            </div>
                        </>
                    ) : null}

                </div>

                {/* Footer Action Buttons */}
                <div className="p-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-950/90 shrink-0">
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Dictamen auditable para CONAGUA (REPDA), CFE y Financieras (FIRA/Agroasemex)</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                        >
                            Cerrar
                        </button>
                        
                        <button
                            onClick={handleDownloadPdf}
                            disabled={downloading || !auditData}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition-all disabled:opacity-50"
                        >
                            <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                            {downloading ? 'Generando PDF...' : 'Descargar Dictamen Oficial PDF'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ComplianceAuditModal;
