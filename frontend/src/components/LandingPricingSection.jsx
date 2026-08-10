import React, { useState } from 'react';
import { Check, ArrowRight, ShieldCheck, Zap, Droplets, Sparkles, HelpCircle, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeIn from './FadeIn';

const LandingPricingSection = () => {
    const [billingCycle, setBillingCycle] = useState('monthly');

    const plans = [
        {
            id: 'esencial',
            name: 'Esencial Satelital & CFE',
            tag: 'Para Ranchos & Productores Individuales',
            priceMonthly: 2490,
            priceYearly: 1990,
            description: 'Reduce inmediatamente tu recibo de luz de CFE y monitorea la salud de tus cultivos sin inversión en equipo físico.',
            targetWho: 'Productores de 5 a 30 Ha con 1 pozo que buscan recortar costos operativos de luz y agua desde el día 1.',
            painsResolved: [
                'Elimina el sobrecosto de regar en Horario Punta de CFE ($2.89/kWh).',
                'Evita la pérdida de tiempo inspeccionando hectáreas completas a pie.',
                'Termina con el riego a ciegas sin datos climáticos de evapotranspiración.'
            ],
            features: [
                'Monitoreo Satelital Sentinel-2 (NDVI) cada 5 días',
                'Cálculo de Ahorro Eléctrico CFE Tarifa 9N en tiempo real',
                'Alertas SMS Automáticas al Celular del Bombero / Operador',
                'Monitoreo de hasta 3 Parcelas (hasta 30 Ha)',
                'Histórico de Salud y Vigor Vegetativo de 6 Meses',
                'Agrónomo IA (Gemini) con 20 consultas / mes'
            ],
            roiBenefit: 'Ahorro estimado en CFE: $12,000 – $25,000 MXN / mes',
            badge: null,
            buttonText: 'Empezar Plan Esencial',
            buttonClass: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
            borderClass: 'border-slate-800'
        },
        {
            id: 'profesional',
            name: 'Profesional IoT & CONAGUA',
            tag: 'Viñedos, Aguacate & Cultivos de Alto Valor',
            priceMonthly: 5890,
            priceYearly: 4790,
            description: 'Control milimétrico del agua en raíz, optimización de calidad de cosecha y blindaje legal ante CONAGUA y REPDA.',
            targetWho: 'Viñedos, huertas de aguacate, berries, nogal y hortalizas con pozos concesionados y requerimiento estricto de calidad.',
            painsResolved: [
                'Control exacto de estrés hídrico (RDI) en viñedos para elevar grados Brix.',
                'Blindaje ante multas de CONAGUA ($300k - $2M MXN) por extracción en zonas de veda.',
                'Detección instantánea de estrés radicular antes de que afecte el rendimiento del cultivo.'
            ],
            features: [
                'Todo lo del Plan Esencial incluido',
                'Telemetría de Sensores de Suelo IoT (Humedad y Temp a 2 profundidades)',
                'Dictamen Oficial de Cumplimiento CONAGUA/REPDA en PDF descargable',
                'Programación de Riego Inteligente en Tarifa Nocturna (9N)',
                'Monitoreo de hasta 8 Parcelas (hasta 100 Ha)',
                'Diagnóstico Agronómico IA con Fotografías de Hojas y Frutos',
                'Alertas SMS Ilimitadas a múltiples encargados de campo',
                'Soporte Técnico Especializado vía WhatsApp'
            ],
            roiBenefit: 'Ahorro CFE: $35,000+ MXN/mes + Blindaje Legal Total',
            badge: 'MÁS ELEGIDO POR PRODUCTORES',
            buttonText: 'Contratar Plan Profesional',
            buttonClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50',
            borderClass: 'border-emerald-500/50 bg-slate-900/80 ring-2 ring-emerald-500/20'
        },
        {
            id: 'agroexportador',
            name: 'Bodega & Agroexportador',
            tag: 'Grandes Agrícolas, Bodegas & Cooperativas',
            priceMonthly: 13900,
            priceYearly: 11100,
            description: 'Gestión corporativa multi-predio, trazabilidad hídrica internacional y conexión API con tus sistemas de empaque.',
            targetWho: 'Bodegas de vino, agrícolas de exportación, cooperativas y corporativos que gestionan múltiples ranchos y pozos.',
            painsResolved: [
                'Falta de visibilidad centralizada entre 10+ encargados de rancho y pozos.',
                'Exigencia de auditorías de sustentabilidad hídrica para GlobalGAP, FIRA y PrimusGFS.',
                'Pérdidas millonarias por desajuste entre programación de cosecha y capacidad de empaque.'
            ],
            features: [
                'Todo lo del Plan Profesional incluido',
                'Gestión Multi-Rancho ilimitada (hasta 25 predios y 5 pozos)',
                'Reportes Ejecutivos de Sustentabilidad con validez para FIRA / Agroasemex',
                'API REST & Webhooks para integración con ERP y estaciones climáticas',
                'Módulo de Precios Nacionales SNIIM en tiempo real',
                'Múltiples Cuentas de Administrador y Supervisores de Campo',
                'Agrónomo Consultor IA Gemini Pro Dedicado',
                'Capacitación e Instalación Asistida de Telemetría'
            ],
            roiBenefit: 'Control corporativo total + Cumplimiento Exportación',
            badge: 'EMPRESARIAL',
            buttonText: 'Contactar a Ventas',
            buttonClass: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/50',
            borderClass: 'border-cyan-500/30'
        }
    ];

    return (
        <section id="pricing" className="py-28 bg-slate-950 relative overflow-hidden border-t border-slate-800">
            {/* Background Glows */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-4">
                            <Sparkles className="w-4 h-4" /> Inversión con Retorno Inmediato
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
                            Planes Diseñados para que el Ahorro <br className="hidden sm:inline" />
                            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                                Pague la Plataforma en la Primera Quincena
                            </span>
                        </h2>
                        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                            Sin contratos forzosos. Precios transparentes en pesos mexicanos con soporte local y dictámenes técnicos oficiales.
                        </p>
                    </FadeIn>

                    {/* Billing Toggle */}
                    <FadeIn delay={0.2}>
                        <div className="mt-8 inline-flex items-center gap-4 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                Pago Mensual
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <span>Pago Anual</span>
                                <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                    -20% Ahorro
                                </span>
                            </button>
                        </div>
                    </FadeIn>
                </div>

                {/* 3-Column Plans Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
                    {plans.map((plan, index) => {
                        const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
                        return (
                            <FadeIn key={plan.id} delay={0.1 * (index + 1)} className="h-full">
                                <div className={`h-full rounded-3xl p-8 bg-slate-900/60 border ${plan.borderClass} backdrop-blur-xl shadow-2xl flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-1`}>
                                    
                                    {/* Top Badge */}
                                    {plan.badge && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black tracking-widest uppercase px-4 py-1 rounded-full shadow-lg">
                                            {plan.badge}
                                        </div>
                                    )}

                                    <div>
                                        {/* Header */}
                                        <div className="mb-6">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                                                {plan.tag}
                                            </span>
                                            <h3 className="text-2xl font-black text-white mt-1">
                                                {plan.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                                {plan.description}
                                            </p>
                                        </div>

                                        {/* Pricing Figure */}
                                        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-6">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                                                    ${price.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-slate-400 font-medium">
                                                    MXN / mes
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                                                <Zap className="w-3 h-3" /> {plan.roiBenefit}
                                            </p>
                                        </div>

                                        {/* Target Who */}
                                        <div className="mb-6 pb-6 border-b border-slate-800 text-xs">
                                            <p className="font-bold text-slate-300 mb-1">¿Para quién es?</p>
                                            <p className="text-slate-400 leading-relaxed">{plan.targetWho}</p>
                                        </div>

                                        {/* Problems Solved */}
                                        <div className="mb-6 pb-6 border-b border-slate-800 space-y-2 text-xs">
                                            <p className="font-bold text-red-400 mb-1 flex items-center gap-1.5">
                                                <span>⚠️</span> Problemas que resuelve:
                                            </p>
                                            {plan.painsResolved.map((pain, i) => (
                                                <p key={i} className="text-slate-400 flex items-start gap-2">
                                                    <span className="text-red-400 shrink-0 font-bold">•</span>
                                                    <span>{pain}</span>
                                                </p>
                                            ))}
                                        </div>

                                        {/* Included Features List */}
                                        <div className="space-y-3 mb-8">
                                            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                                Qué incluye la plataforma:
                                            </p>
                                            {plan.features.map((feat, i) => (
                                                <div key={i} className="flex items-start gap-2.5 text-xs">
                                                    <div className="p-0.5 bg-emerald-500/20 text-emerald-400 rounded shrink-0 mt-0.5">
                                                        <Check className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-slate-300 leading-relaxed">{feat}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-4">
                                        <Link
                                            to="/dashboard"
                                            className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all hover:scale-102 ${plan.buttonClass}`}
                                        >
                                            {plan.buttonText} <ArrowRight className="w-4 h-4" />
                                        </Link>
                                        <p className="text-[10px] text-center text-slate-500 mt-2">
                                            Activación inmediata • Sin costos ocultos
                                        </p>
                                    </div>

                                </div>
                            </FadeIn>
                        );
                    })}
                </div>

                {/* Bottom Assurance Bar */}
                <FadeIn delay={0.4}>
                    <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-white">Garantía de Dictamen y Acompañamiento Agronómico</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Todos los reportes generados cuentan con metodología avalada para trámites con CONAGUA, FIRA y CFE.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <Link
                                to="/dashboard"
                                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
                            >
                                Probar en Modo Demo
                            </Link>
                        </div>
                    </div>
                </FadeIn>

            </div>
        </section>
    );
};

export default LandingPricingSection;
