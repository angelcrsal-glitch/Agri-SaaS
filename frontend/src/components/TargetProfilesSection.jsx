import React from 'react';
import { 
    Zap, 
    Droplets, 
    ShieldCheck, 
    Sparkles, 
    TrendingDown, 
    AlertTriangle, 
    CheckCircle2, 
    ArrowRight,
    Wine,
    Sprout,
    Building2,
    Clock,
    FileText,
    Cpu,
    Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeIn from './FadeIn';

const TargetProfilesSection = () => {
    const profiles = [
        {
            icon: <Wine className="w-8 h-8 text-purple-400" />,
            title: '1. Viñedos & Bodegas de Vino',
            regions: 'Valle de Guadalupe, Parras, Querétaro, Aguascalientes',
            highlight: 'Riego Deficitario Controlado (RDI) & Calidad Grados Brix',
            pain: 'El agua de pozo es escasa y altamente salina. Regar de más arruina la concentración de polifenoles y taninos del vino; regar de menos deshidrata la cepa.',
            howWeSolve: 'Monitoreamos la humedad volumétrica del suelo a 30 y 60 cm en sincronía con el satélite Sentinel-2 para mantener la vid en el estrés hídrico exacto que exige el enólogo, programando el bombeo en tarifa nocturna CFE.',
            results: 'Vino con máxima calidad organoléptica + Ahorro de más del 50% en bombeo eléctrico de la bodega.',
            accentBorder: 'border-purple-500/30 hover:border-purple-500/60',
            accentBg: 'bg-purple-950/20'
        },
        {
            icon: <Sprout className="w-8 h-8 text-emerald-400" />,
            title: '2. Huertas de Alto Valor (Aguacate, Berries, Nogal, Agave)',
            regions: 'Jalisco, Michoacán, Sinaloa, Sonora, Chihuahua, Guanajuato',
            highlight: 'Ahorro Eléctrico en Bombas de 30-150 HP & Prevención Radicular',
            pain: 'Los sobrecostos eléctricos merman la utilidad. El encendido manual de bombas de pozo en Horario Punta infla el recibo en más de $60,000 MXN.',
            howWeSolve: 'AgroSentinel calcula el déficit hídrico en milímetros y envía automáticamente un mensaje SMS a las 23:30 al celular del bombero: "Activar Bomba 1 ahora en Tarifa 9N Nocturna ($0.38/kWh)".',
            results: 'Ahorro de $25,000 a $65,000 MXN mensuales por pozo.',
            accentBorder: 'border-emerald-500/30 hover:border-emerald-500/60',
            accentBg: 'bg-emerald-950/20'
        },
        {
            icon: <Building2 className="w-8 h-8 text-cyan-400" />,
            title: '3. Agroexportadores, Cooperativas & Administradores',
            regions: 'Nacional / Frontera Norte / Bajío',
            highlight: 'Blindaje Regulatorio CONAGUA & Trazabilidad GlobalGAP',
            pain: 'Más de 100 acuíferos en México están en veda. Exceder la cuota REPDA acarrea multas de hasta $2.5 millones de pesos, inspecciones o pérdida de certificaciones internacionales.',
            howWeSolve: 'Generamos Dictámenes Técnicos Oficiales en PDF con trazabilidad de volumen extraído vs fotosíntesis real, listos para auditorías de CONAGUA, FIRA o compradores de EUA y Europa.',
            results: '100% Blindaje legal de títulos de concesión de pozos y control centralizado multi-rancho.',
            accentBorder: 'border-cyan-500/30 hover:border-cyan-500/60',
            accentBg: 'bg-cyan-950/20'
        }
    ];

    const problemsAndSolutions = [
        {
            icon: <Zap className="w-6 h-6 text-yellow-400" />,
            badge: 'PROBLEMA 1',
            title: 'Facturas de Luz Infladas por CFE',
            problemText: 'Las tarifas agrícolas en Horario Punta (6:00 PM – 10:00 PM) cobran hasta $2.89/kWh. Regar en horarios incorrectos triplica el costo de operación del pozo.',
            solutionTitle: 'Nuestra Solución Inteligente:',
            solutionText: 'Desplazamiento automatizado de carga a la Tarifa 9N Nocturna ($0.38/kWh) con alertas SMS directas al bombero. Ahorras hasta un 86% en el costo por metro cúbico bombeado.'
        },
        {
            icon: <Droplets className="w-6 h-6 text-sky-400" />,
            badge: 'PROBLEMA 2',
            title: 'Riesgo Legal y Clausuras de CONAGUA',
            problemText: 'Las inspecciones del REPDA sancionan la sobreexplotación de acuíferos con multas de $300,000 a $2,500,000 MXN o corte del suministro de pozo.',
            solutionTitle: 'Nuestra Solución Inteligente:',
            solutionText: 'Cruce georreferenciado de coordenadas contra el Monitor de Sequía (SMN) y cuotas de acuífero oficial, emitiendo un Dictamen de Cumplimiento en PDF con validez técnica.'
        },
        {
            icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
            badge: 'PROBLEMA 3',
            title: 'Riego a Ciegas y Asfixia Radicular',
            problemText: 'El 60% del agua se aplica en el momento o volumen equivocado, provocando pudrición de raíz, lavado de fertilizantes y pérdida de hasta 40% en rendimiento.',
            solutionTitle: 'Nuestra Solución Inteligente:',
            solutionText: 'Fusión de imágenes satelitales Sentinel-2 (NDVI cada 5 días) + Telemetría de sensores IoT en raíz para regar únicamente los milímetros exactos que el suelo necesita.'
        }
    ];

    return (
        <section id="para-quien" className="py-24 bg-slate-950 relative overflow-hidden border-t border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-4">
                            <Sparkles className="w-4 h-4" /> Claridad de Negocio
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-6">
                            ¿Para Quién es AgroSentinel y <br className="hidden sm:inline" />
                            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                                Qué Problemas Concretos Resolvemos?
                            </span>
                        </h2>
                        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                            Diseñado específicamente para el productor agrícola mexicano que no quiere teoría, sino ahorros medibles en pesos y blindaje operativo en el campo.
                        </p>
                    </FadeIn>
                </div>

                {/* 1. THREE TARGET PROFILES */}
                <div className="mb-24">
                    <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Perfiles de Productores que Multiplican su Rentabilidad
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {profiles.map((p, idx) => (
                            <FadeIn key={idx} delay={0.1 * (idx + 1)} className="h-full">
                                <div className={`h-full rounded-3xl p-8 bg-slate-900/50 border ${p.accentBorder} backdrop-blur-xl flex flex-col justify-between transition-all duration-300 group`}>
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={`p-4 rounded-2xl ${p.accentBg} border border-white/5`}>
                                                {p.icon}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full uppercase tracking-wider">
                                                {p.regions.split(',')[0]}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-black text-white mb-2">
                                            {p.title}
                                        </h3>
                                        <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide mb-4">
                                            {p.highlight}
                                        </p>

                                        <div className="space-y-4 text-xs">
                                            <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-500/20">
                                                <p className="font-bold text-red-400 mb-1 flex items-center gap-1">
                                                    <span>⚠️</span> El Problema Real:
                                                </p>
                                                <p className="text-slate-300 leading-relaxed">{p.pain}</p>
                                            </div>

                                            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                                                <p className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                                                    <span>💡</span> Cómo lo resolvemos:
                                                </p>
                                                <p className="text-slate-400 leading-relaxed">{p.howWeSolve}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                                        <span className="font-black text-white">{p.results}</span>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>

                {/* 2. THE 3 CORE PROBLEMS AND HOW WE SOLVE THEM */}
                <div>
                    <div className="text-center mb-12">
                        <h3 className="text-2xl sm:text-4xl font-black text-white">
                            Los 3 Dolores que Eliminamos desde la Primera Semana
                        </h3>
                        <p className="text-slate-400 text-sm mt-2">
                            Transformamos la incertidumbre en ahorro financiero y seguridad técnica.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {problemsAndSolutions.map((item, idx) => (
                            <FadeIn key={idx} delay={0.1 * (idx + 1)}>
                                <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all h-full flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="p-3 rounded-xl bg-slate-800 text-white">
                                                {item.icon}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md">
                                                {item.badge}
                                            </span>
                                        </div>

                                        <h4 className="text-xl font-bold text-white mb-3">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-red-300/90 leading-relaxed mb-6 bg-red-950/20 p-3 rounded-xl border border-red-500/20">
                                            {item.problemText}
                                        </p>

                                        <div className="space-y-1.5">
                                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                                {item.solutionTitle}
                                            </p>
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                {item.solutionText}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-bold text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4" /> Solución 100% Implementada
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>

                {/* Bottom Interactive CTA */}
                <div className="mt-16 text-center">
                    <FadeIn delay={0.3}>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-950/60 hover:scale-105 transition-all"
                        >
                            Ver Simulación con tu Parcela en Vivo <ArrowRight className="w-5 h-5" />
                        </Link>
                    </FadeIn>
                </div>

            </div>
        </section>
    );
};

export default TargetProfilesSection;
