import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
    Globe, 
    Droplet, 
    ArrowRight, 
    CheckCircle2, 
    History, 
    AlertTriangle, 
    Bot, 
    Coins, 
    ShieldAlert, 
    Sparkles, 
    MapPin, 
    Zap, 
    ShieldCheck, 
    TrendingDown, 
    Smartphone, 
    Cpu,
    Wine
} from 'lucide-react';
import FadeIn from '../components/FadeIn';
import BackgroundBlobs from '../components/BackgroundBlobs';
import Footer from '../components/Footer';
import UseCases from '../components/UseCases';
import IndustrySolutions from '../components/IndustrySolutions';
import CfeConaguaSection from '../components/CfeConaguaSection';
import TargetProfilesSection from '../components/TargetProfilesSection';
import LandingPricingSection from '../components/LandingPricingSection';

const Landing = () => {
    return (
        <>
            <BackgroundBlobs />
            <Navbar />

            <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30 relative">
                
                {/* 1. HERO SECTION */}
                <section className="relative pt-32 pb-20 sm:pt-44 sm:pb-28 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        
                        {/* Top Trust Badge */}
                        <FadeIn delay={0.1}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-bold tracking-wide mb-8 shadow-lg shadow-emerald-950/40">
                                <ShieldCheck className="w-4 h-4" /> Inteligencia Satelital, Sensores IoT & Normatividad CFE / CONAGUA
                            </div>
                        </FadeIn>

                        {/* Main Value Proposition Headline */}
                        <FadeIn delay={0.2}>
                            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-8 bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-[1.15]">
                                Reduce hasta 35% tu recibo de CFE y <br className="hidden sm:inline" />
                                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                                    Blinda tus Pozos ante CONAGUA.
                                </span>
                            </h1>
                        </FadeIn>

                        {/* Persuasive Subheadline */}
                        <FadeIn delay={0.3}>
                            <p className="mt-4 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
                                Combinamos imágenes satelitales <strong className="text-white">Sentinel-2</strong>, sensores de suelo IoT y la matriz de <strong className="text-emerald-400">Tarifa 9N de CFE</strong> para decirte el momento exacto de bombeo. Menos costo eléctrico, mayor calidad de cosecha y cero multas legales.
                            </p>
                        </FadeIn>

                        {/* Primary CTAs */}
                        <FadeIn delay={0.4}>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-lg mx-auto">
                                <Link
                                    to="/dashboard"
                                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-base font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-950/60 hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    Probar Auditoría y Demo Gratis <ArrowRight className="w-5 h-5" />
                                </Link>
                                <a
                                    href="#pricing"
                                    className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-base font-bold px-8 py-4 rounded-2xl transition-all border border-slate-800 hover:border-slate-700 flex items-center justify-center"
                                >
                                    Ver Planes & Ahorro
                                </a>
                            </div>
                        </FadeIn>

                        {/* Live Impact Stats Bar */}
                        <FadeIn delay={0.5}>
                            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl">
                                <div className="p-3 text-center border-r border-slate-800/60 last:border-none">
                                    <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">-86.7%</p>
                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Costo kWh en Tarifa 9N vs Punta</p>
                                </div>
                                <div className="p-3 text-center border-r border-slate-800/60 last:border-none">
                                    <p className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">100%</p>
                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Blindaje Legal REPDA / CONAGUA</p>
                                </div>
                                <div className="p-3 text-center border-r border-slate-800/60 last:border-none">
                                    <p className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono">5 Días</p>
                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Actualización Satelital NDVI</p>
                                </div>
                                <div className="p-3 text-center">
                                    <p className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">SMS</p>
                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Alertas Directas al Bombero</p>
                                </div>
                            </div>
                        </FadeIn>

                    </div>
                </section>

                {/* 2. TARGET PROFILES & PROBLEMS RESOLVED */}
                <TargetProfilesSection />

                {/* 3. CFE & CONAGUA CASE STUDY */}
                <CfeConaguaSection />

                {/* 4. INDUSTRY DEEP DIVES (Viñedos, Aguacate, Berries, etc.) */}
                <IndustrySolutions />

                {/* 5. CORE TECHNOLOGY & FEATURES */}
                <section id="features" className="py-24 relative bg-slate-950/70 border-t border-slate-800/80">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <FadeIn direction="up">
                                <div className="inline-block text-emerald-400 font-bold text-xs tracking-widest uppercase mb-2">
                                    Stack Tecnológico de Vanguardia
                                </div>
                                <h2 className="text-3xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                                    Tecnología de Precisión para el Campo Mexicano
                                </h2>
                                <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
                                    Ingeniería aeroespacial, inteligencia artificial y telemetría de suelo unificadas en una plataforma sencilla y rápida.
                                </p>
                                <div className="h-1 w-24 bg-emerald-500 mx-auto rounded-full mt-6" />
                            </FadeIn>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            {/* Feature 1: Satélite NDVI */}
                            <FadeIn delay={0.1} className="h-full">
                                <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-all group h-full flex flex-col justify-between">
                                    <div>
                                        <div className="bg-emerald-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                                            <Globe className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-white">Monitoreo Satelital Sentinel-2</h3>
                                        <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                            Imágenes multiespectrales de la Agencia Espacial Europea (ESA) cada 5 días. Mapas de calor de vigor vegetativo (NDVI) para detectar anomalías antes de que el ojo humano las vea.
                                        </p>
                                    </div>
                                    <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800/80 pt-4">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Resolución espacial de 10m por pixel</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Detección anticipada de estrés foliar</li>
                                    </ul>
                                </div>
                            </FadeIn>

                            {/* Feature 2: Asistente IA Gemini */}
                            <FadeIn delay={0.2} className="h-full">
                                <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition-all group h-full flex flex-col justify-between">
                                    <div>
                                        <div className="bg-blue-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                                            <Bot className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-white">Agrónomo IA Multimodal (Gemini Pro)</h3>
                                        <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                            Asistente agrónomo disponible 24/7. Sube fotos de hojas, plagas o frutos dañados con tu celular y recibe en segundos un diagnóstico con dosis y tratamiento recomendado.
                                        </p>
                                    </div>
                                    <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800/80 pt-4">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Diagnóstico visual de plagas y hongos</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Respuestas en lenguaje coloquial mexicano</li>
                                    </ul>
                                </div>
                            </FadeIn>

                            {/* Feature 3: Optimización CFE & IoT */}
                            <FadeIn delay={0.3} className="h-full">
                                <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-yellow-500/50 transition-all group h-full flex flex-col justify-between">
                                    <div>
                                        <div className="bg-yellow-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/20 group-hover:bg-yellow-500/20 transition-colors">
                                            <Zap className="w-8 h-8 text-yellow-400" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-white">Despacho Tarifario CFE & Alertas SMS</h3>
                                        <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                            Calcula el volumen exacto en $m^3$ y programa el bombeo en los horarios más baratos de la Tarifa 9N. Manda un SMS al bombero para encender la bomba sin necesidad de internet en el campo.
                                        </p>
                                    </div>
                                    <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800/80 pt-4">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-yellow-400" /> Reducción drástica del recibo de luz</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-yellow-400" /> Mensajes SMS compatibles con cualquier celular</li>
                                    </ul>
                                </div>
                            </FadeIn>

                        </div>
                    </div>
                </section>

                {/* 6. TRANSPARENT PRICING & BENEFIT TIERS */}
                <LandingPricingSection />

                {/* 7. USE CASES SUMMARY */}
                <UseCases />

                {/* 8. FINAL HIGH-CONVERTING CTA */}
                <section className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800">
                    <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
                    <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                        <FadeIn>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
                                <Sparkles className="w-4 h-4" /> Comienza en 3 Minutos
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-black mb-6 text-white leading-tight">
                                ¿Listo para dejar de perder dinero en luz y agua en tu rancho?
                            </h2>
                            <p className="text-base sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Dibuja tu predio en el mapa interactivo, simula el ahorro de tu bomba de pozo y descarga tu primer dictamen regulatorio en vivo.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                                <Link
                                    to="/dashboard"
                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-base font-black px-10 py-4.5 rounded-2xl transition-all shadow-xl shadow-emerald-950/80 hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    Probar Plataforma Demo <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

            </div>

            <Footer />
        </>
    );
};

export default Landing;
