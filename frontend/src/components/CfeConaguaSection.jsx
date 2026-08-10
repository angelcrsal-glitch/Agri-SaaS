import React from 'react';
import { Zap, Droplets, ShieldCheck, TrendingDown, Clock, AlertTriangle, ArrowRight, CheckCircle2, DollarSign, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeIn from './FadeIn';

const CfeConaguaSection = () => {
    return (
        <section id="cfe-conagua" className="py-28 bg-slate-950 relative overflow-hidden border-t border-slate-800/80">
            {/* Background Glow Elements */}
            <div className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Header Badge & Title */}
                <div className="text-center mb-20">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 shadow-lg shadow-emerald-950/40">
                            <ShieldCheck className="w-4 h-4" /> Caso Real de Impacto en México
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black mb-6 text-white tracking-tight leading-tight">
                            Ahorro Energético CFE y Cumplimiento CONAGUA <br className="hidden sm:inline" />
                            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                                Inteligencia que Protege tu Dinero y tu Agua
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                            No solo mostramos mapas satelitales. Integramos la realidad regulatoria y tarifaria de México para convertir datos climáticos en ahorros inmediatos de miles de pesos.
                        </p>
                    </FadeIn>
                </div>

                {/* Main 2-Column Grid: CFE & CONAGUA */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch mb-16">
                    
                    {/* CARD 1: CFE Energy Optimization */}
                    <FadeIn direction="right" delay={0.1}>
                        <div className="h-full rounded-3xl p-8 sm:p-10 bg-slate-900/60 border border-emerald-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500/60 transition-all duration-500">
                            {/* Accent Glow */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/10 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-600/20 transition-all"></div>

                            <div>
                                {/* Header with CFE Branding Badge */}
                                <div className="flex items-center justify-between gap-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        {/* CFE Emblem SVG */}
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/60 p-2.5">
                                            <svg viewBox="0 0 24 24" className="w-full h-full text-emerald-400" fill="currentColor">
                                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                                                    CFE Tarifa 9 Agrícola
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-black text-white mt-1">Comisión Federal de Electricidad</h3>
                                        </div>
                                    </div>
                                    <span className="text-2xl hidden sm:block">⚡</span>
                                </div>

                                {/* Problem Description */}
                                <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/20 mb-6">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-red-300">El Problema de Costo:</h4>
                                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                                Encender la bomba de pozo en <strong>Horario Punta (6:00 PM – 10:00 PM)</strong> puede costar hasta <span className="text-red-400 font-bold">3x más por kWh</span> que en Horario Valle/Nocturno. Regar sin estrategia infla tu recibo de luz en decenas de miles de pesos.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* AgroSentinel Solution */}
                                <div className="space-y-4 mb-8">
                                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">Cómo lo resuelve AgroSentinel:</h4>
                                    
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                            <TrendingDown className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Desplazamiento Inteligente de Carga</p>
                                            <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                                                Nuestra IA analiza el NDVI y pronóstico del tiempo. Si el cultivo necesita agua, programa automáticamente el bombeo en los bloques horarios con la tarifa más baja de CFE.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5">
                                        <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                            <BellRing className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Alarmas Automáticas SMS al Personal de Campo</p>
                                            <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                                                El encargado de bomba recibe un SMS exacto a las 10:55 PM: <em>"Encender bomba 2 ahora para aprovechar tarifa nocturna CFE y ahorrar 38% en energía"</em>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Impact Stats Footer */}
                            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Ahorro Promedio Estimado</p>
                                    <p className="text-2xl font-black text-emerald-400 tracking-tight">Hasta -35% en Factura Eléctrica</p>
                                </div>
                                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* CARD 2: CONAGUA Compliance & Drought */}
                    <FadeIn direction="left" delay={0.2}>
                        <div className="h-full rounded-3xl p-8 sm:p-10 bg-slate-900/60 border border-cyan-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-cyan-500/60 transition-all duration-500">
                            {/* Accent Glow */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-600/10 blur-3xl rounded-full pointer-events-none group-hover:bg-cyan-600/20 transition-all"></div>

                            <div>
                                {/* Header with CONAGUA Branding Badge */}
                                <div className="flex items-center justify-between gap-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        {/* CONAGUA Emblem SVG */}
                                        <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-950/60 p-2.5">
                                            <svg viewBox="0 0 24 24" className="w-full h-full text-cyan-400" fill="currentColor">
                                                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black tracking-widest text-cyan-400 uppercase bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
                                                    CONAGUA & Monitor de Sequía
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-black text-white mt-1">Comisión Nacional del Agua</h3>
                                        </div>
                                    </div>
                                    <span className="text-2xl hidden sm:block">💧</span>
                                </div>

                                {/* Problem Description */}
                                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/20 mb-6">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-300">El Riesgo Legal y Operativo:</h4>
                                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                                Más de 100 acuíferos en México se encuentran en <strong>zona de veda o sobreexplotación</strong>. Extraer agua fuera de los límites de concesión acarrea <strong>multas millonarias, clausura de pozos</strong> o pérdidas totales por falta de dotación en canales.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* AgroSentinel Solution */}
                                <div className="space-y-4 mb-8">
                                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">Cómo lo resuelve AgroSentinel:</h4>
                                    
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                            <Droplets className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Georreferenciación de Cuencas y Acuíferos</p>
                                            <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                                                El sistema mapea las coordenadas de tu parcela contra los datos oficiales de CONAGUA y el Monitor de Sequía de México (SMN) para evaluar tu nivel de vulnerabilidad hídrica.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5">
                                        <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                            <ShieldCheck className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Reportes de Eficiencia y Trazabilidad Hídrica</p>
                                            <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                                                Genera evidencia técnica auditables de que cada metro cúbico extraído fue utilizado con máxima eficiencia fotosintética respaldada con datos satelitales.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Impact Stats Footer */}
                            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cumplimiento Normativo</p>
                                    <p className="text-2xl font-black text-cyan-400 tracking-tight">100% Blindaje Legal y Operativo</p>
                                </div>
                                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                </div>

                {/* Interactive Simulated Flow Preview */}
                <FadeIn delay={0.3}>
                    <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                            
                            <div className="space-y-2 md:col-span-2">
                                <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                                    <Clock className="w-3.5 h-3.5" /> Caso de Éxito en Vivo
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black text-white">
                                    ¿Cómo se ve esta alerta en el celular del productor?
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Sin necesidad de hardware costoso inicial. El sistema calcula la condición satelital + tarifa CFE + estatus CONAGUA y entrega instrucciones inmediatas vía SMS a cualquier celular convencional.
                                </p>
                            </div>

                            {/* Mock SMS Card */}
                            <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 shadow-xl relative">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5 text-[11px] font-mono text-emerald-400">
                                    <Zap className="w-3.5 h-3.5" /> AgroSentinel • CFE Alerta Nocturna
                                </div>
                                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                                    <span className="font-bold text-emerald-400">[ALERTA RIEGO CFE]</span> Lote Norte necesita 45mm de agua. Iniciar bombeo a las <strong>11:00 PM (Tarifa Valle CFE)</strong>. Ahorro estimado vs horario diurno: <strong>$1,850 MXN</strong>.
                                </p>
                                <div className="mt-3 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                                    <span>Vía SMS Twilio</span>
                                    <span>Hoy 10:45 PM</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </FadeIn>

                {/* Bottom Section CTA */}
                <div className="mt-14 text-center">
                    <FadeIn delay={0.4}>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-xl shadow-emerald-950/60 hover:scale-105 transition-all"
                        >
                            Ver Simulación en el Dashboard <ArrowRight className="w-5 h-5" />
                        </Link>
                    </FadeIn>
                </div>

            </div>
        </section>
    );
};

export default CfeConaguaSection;
