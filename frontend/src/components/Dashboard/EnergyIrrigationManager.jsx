import React, { useState } from 'react';
import { Zap, Droplets, Calculator, ChevronDown, CheckCircle, AlertTriangle, Battery, Clock, TrendingDown } from 'lucide-react';

const EnergyIrrigationManager = ({ farmData }) => {
    // Tarifa 9N CFE (Tarifa de Estímulo Nocturna)
    // Night rate is significantly cheaper in Mexico for agricultural pumping.
    // Example Rates (MXN/kWh): Day: $0.70, Night: $0.35 (simulated)
    const [pumpPowerHp, setPumpPowerHp] = useState(20); // 20 HP pump default
    const [flowRateLps, setFlowRateLps] = useState(15); // 15 Liters per second

    // Calculate energy metrics based on moisture deficit
    // Example: if moisture is 15%, we need to reach 30%.
    const currentMoisture = parseFloat(farmData?.moisture || 20);
    const targetMoisture = 35.0;
    const deficit = Math.max(0, targetMoisture - currentMoisture);
    
    // Simplistic agronomic water volume calculation (simulation)
    // 1% moisture ~ 10,000 Liters per hectare
    const hectares = 5; // Fixed for now
    const totalLitersNeeded = deficit * 10000 * hectares;
    
    // Time required to pump that volume
    const hoursNeeded = totalLitersNeeded > 0 ? (totalLitersNeeded / flowRateLps / 3600) : 0;
    
    // Energy cost calculation
    const kW = pumpPowerHp * 0.7457; // 1 HP = 0.7457 kW
    const totalKWh = kW * hoursNeeded;
    
    const dayRate = 0.78; // MXN/kWh
    const nightRate = 0.38; // MXN/kWh Tarifa 9N
    
    const costDay = totalKWh * dayRate;
    const costNight = totalKWh * nightRate;
    const savings = costDay - costNight;

    return (
        <div className="h-full w-full bg-slate-900/50 rounded-2xl border border-white/10 overflow-y-auto custom-scrollbar">
            {/* Header Section */}
            <div className="p-4 border-b border-white/10 bg-slate-950/60 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
                        <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Presupuesto Hídrico y CFE</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Optimización Tarifa 9N (Nocturna)</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                
                {/* Deficit Alert */}
                <div className={`p-4 rounded-xl border ${deficit > 10 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {deficit > 10 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {deficit > 10 ? 'Déficit Hídrico Detectado' : 'Humedad Óptima'}
                            </span>
                        </div>
                        <span className="text-lg font-black">{currentMoisture}%</span>
                    </div>
                    <p className="text-xs opacity-80 mt-1 leading-relaxed">
                        Requerimos alcanzar un <strong>{targetMoisture}%</strong> de humedad para la fase fenológica actual. 
                        Faltan {totalLitersNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })} litros.
                    </p>
                </div>

                {/* Configuration Inputs */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Calculator className="w-3.5 h-3.5" /> Equipamiento de Pozo
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Bomba (Caballos de Fuerza)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={pumpPowerHp}
                                    onChange={(e) => setPumpPowerHp(Number(e.target.value))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-3 pr-8 text-white text-xs focus:border-sky-500 outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-bold">HP</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Caudal (Gasto)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={flowRateLps}
                                    onChange={(e) => setFlowRateLps(Number(e.target.value))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-3 pr-8 text-white text-xs focus:border-sky-500 outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-bold">L/s</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendation & Cost Analysis */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 p-5 rounded-2xl shadow-xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute -right-4 -bottom-4 opacity-5">
                        <Zap className="w-32 h-32 text-sky-400" />
                    </div>

                    <h4 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-400" />
                        Plan de Riego Recomendado
                    </h4>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Tiempo Estimado</p>
                            <p className="text-2xl font-black text-white mt-0.5">{hoursNeeded.toFixed(1)} <span className="text-sm font-medium text-slate-500">hrs</span></p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Consumo Eléctrico</p>
                            <p className="text-2xl font-black text-sky-400 mt-0.5">{totalKWh.toFixed(0)} <span className="text-sm font-medium text-sky-500/50">kWh</span></p>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 space-y-2 mb-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Costo Diurno (Tarifa Base)</span>
                            <span className="font-mono text-slate-300">${costDay.toFixed(2)} MXN</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-sky-300">
                            <span>Costo Nocturno (Tarifa 9N)</span>
                            <span className="font-mono text-sky-400">${costNight.toFixed(2)} MXN</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <TrendingDown className="w-5 h-5" />
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider">Ahorro CFE Proyectado</p>
                                <p className="text-lg font-black">${savings.toFixed(2)} MXN</p>
                            </div>
                        </div>
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-lg shadow-emerald-900/30 transition-all">
                            Programar IoT
                        </button>
                    </div>
                </div>

                <p className="text-[9px] text-slate-500 text-center px-4 leading-relaxed mt-2">
                    Cálculo estimado basado en el déficit de humedad satelital. Programa tus relés IoT para encender automáticamente entre las 00:00 y las 06:00 horas para maximizar el subsidio CFE.
                </p>
            </div>
        </div>
    );
};

export default EnergyIrrigationManager;
