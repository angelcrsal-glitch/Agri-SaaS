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
import CfeConaguaSection from '../components/CfeConaguaSection';
import TargetProfilesSection from '../components/TargetProfilesSection';
import LandingPricingSection from '../components/LandingPricingSection';
import UseCases from '../components/UseCases';

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

                {/* 3. TECHNOLOGY & USE CASES (Satellite Images) */}
                <UseCases />

                {/* 3. CFE & CONAGUA CASE STUDY */}
                <CfeConaguaSection />

                {/* 4. TRANSPARENT PRICING & BENEFIT TIERS */}
                <LandingPricingSection />

                {/* 5. FINAL HIGH-CONVERTING CTA */}
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
