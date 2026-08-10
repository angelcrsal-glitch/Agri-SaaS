import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { 
    Check, 
    X, 
    HelpCircle, 
    ArrowRight, 
    Sparkles, 
    Cpu, 
    ShieldCheck, 
    Zap, 
    Droplets, 
    PhoneCall,
    Wine,
    Sprout,
    Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeIn from '../components/FadeIn';
import BackgroundBlobs from '../components/BackgroundBlobs';
import Footer from '../components/Footer';

const Pricing = () => {
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
                'Agrónomo IA (Gemini) con 20 consultas / mes',
                'Soporte estándar vía correo electrónico'
            ],
            notIncluded: [
                'Telemetría de sensores IoT de suelo en vivo',
                'Dictamen Oficial de Cumplimiento CONAGUA/REPDA en PDF',
                'Diagnóstico de plagas con fotos'
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
            notIncluded: [
                'Gestión corporativa multi-rancho masiva (>100 Ha)',
                'API REST & Webhooks para integración ERP'
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
            notIncluded: [],
            roiBenefit: 'Control corporativo total + Cumplimiento Exportación',
            badge: 'EMPRESARIAL',
            buttonText: 'Contactar a Ventas',
            buttonClass: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/50',
            borderClass: 'border-cyan-500/30'
        }
    ];

    const faqs = [
        {
            q: '¿Cómo logra AgriSaaS ahorrarme hasta un 35% en el recibo de CFE?',
            a: 'La tarifa agrícola de CFE cobra hasta $2.89/kWh en Horario Punta (18:00 a 22:00 hrs) y solo $0.38/kWh en Horario Nocturno (Tarifa 9N). Nuestro algoritmo calcula cuántos milímetros de agua le faltan a tu suelo y programa el encendido de bomba a las 23:30 hrs enviando un SMS automático al celular del bombero. Al bombear en tarifa subsidiada, el ahorro es inmediato en el siguiente recibo de luz.'
        },
        {
            q: '¿Cómo funciona el dictamen oficial de CONAGUA / REPDA?',
            a: 'Georreferenciamos tu predio contra la base de datos de acuíferos oficiales de México y el Monitor de Sequía (SMN). Al contrastar el agua extraída por tu bomba contra la transpiración real del cultivo medida por satélite (Sentinel-2), generamos un dictamen técnico en PDF con validez auditable para demostrar ante inspectores de CONAGUA que tu extracción no sobrepasa la cuota autorizada de tu título de concesión.'
        },
        {
            q: '¿Qué pasa si mi rancho no tiene buena señal de internet?',
            a: 'El sistema está diseñado para la realidad del campo en México: el administrador o dueño puede ver el dashboard desde cualquier computadora o tablet en la ciudad, y las instrucciones de riego para los trabajadores se envían mediante mensajes de texto SMS tradicionales que entran incluso con señal celular básica 2G.'
        },
        {
            q: '¿Cómo funciona en viñedos (Riego Deficitario Controlado)?',
            a: 'Para viñedos en Valle de Guadalupe, Parras o Querétaro, colocamos sensores de humedad a 30 y 60 cm en raíz. El enólogo define el umbral de estrés hídrico deseado para concentrar polifenoles y grados Brix en la uva. La plataforma notifica el momento exacto en que la vid requiere el pulso de agua, protegiendo tanto la calidad del vino como la vida útil del pozo en zonas áridas.'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30 relative">
            <BackgroundBlobs />
            <Navbar />

            {/* Header */}
            <div className="pt-32 pb-16 text-center px-4 relative z-10">
                <FadeIn delay={0.1}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-bold tracking-wide mb-6 shadow-lg shadow-emerald-950/40">
                        <Sparkles className="w-4 h-4" /> Inversión con Retorno Inmediato en tu Recibo de CFE
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                        Planes Claros & Rentabilidad Agrícola
                    </h1>
                </FadeIn>
                <FadeIn delay={0.2}>
                    <p className="text-base sm:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                        Elige el plan ideal para tu cultivo. Diseñado para que el ahorro generado en electricidad y agua pague la suscripción durante la primera quincena de uso.
                    </p>
                </FadeIn>

                {/* Billing Toggle */}
                <FadeIn delay={0.3}>
                    <div className="inline-flex items-center gap-4 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            Pago Mensual
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            <span>Pago Anual</span>
                            <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                -20% Ahorro
                            </span>
                        </button>
                    </div>
                </FadeIn>
            </div>

            {/* Pricing Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-24">
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
                                            Activación inmediata • Sin contratos forzosos
                                        </p>
                                    </div>

                                </div>
                            </FadeIn>
                        );
                    })}
                </div>

                {/* FAQ SECTION */}
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-block text-emerald-400 font-bold text-xs tracking-widest uppercase mb-2">
                            Resolviendo Dudas
                        </div>
                        <h3 className="text-2xl sm:text-4xl font-black text-white">
                            Preguntas Frecuentes sobre el Retorno de Inversión
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {faqs.map((faq, idx) => (
                            <FadeIn key={idx} delay={0.1 * (idx + 1)}>
                                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
                                    <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                                        <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                                        {faq.q}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-7">
                                        {faq.a}
                                    </p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>

                {/* Final CTA in Pricing */}
                <div className="mt-20 text-center">
                    <FadeIn>
                        <div className="p-10 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-950 border border-emerald-500/30 max-w-4xl mx-auto shadow-2xl">
                            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
                                ¿Quieres auditar el pozo de tu rancho antes de contratar?
                            </h3>
                            <p className="text-slate-400 text-sm max-w-2xl mx-auto mb-6">
                                Prueba nuestro simulador interactivo de tarifas CFE y estatus de acuífero CONAGUA en modo demo ahora mismo.
                            </p>
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 hover:scale-105 transition-all"
                            >
                                Probar Auditoría en Vivo <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </FadeIn>
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default Pricing;
