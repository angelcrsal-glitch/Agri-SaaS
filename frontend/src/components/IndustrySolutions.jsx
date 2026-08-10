import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import FadeIn from './FadeIn';

const industries = [
    {
        id: 'vinedos',
        emoji: '🍇',
        tag: 'Viñedos & Bodegas de Vino',
        hook: '¿Producción vitivinícola en Valle de Guadalupe, Parras o Querétaro? El agua es escasa y el RDI exacto define los grados Brix y la calidad de tu vino.',
        headline: 'Controla el Riego Deficitario (RDI) con precisión milimétrica y maximiza la calidad de tu cosecha.',
        problem: 'El estrés hídrico inducido en la vid antes del envero determina la concentración de polifenoles, taninos y azúcares. Regar de más arruina el vino; regar de menos quema la planta en acuíferos con sobreexplotación.',
        pains: [
            'Dificultad para mantener el estrés hídrico controlado (RDI) ideal sin mediciones de humedad en raíz.',
            'Pozos en acuíferos salinos o vedados con altos costos eléctricos de bombeo de pozo profundo.',
            'Inspección manual de hileras propensas a oídio (cenicilla) y mildiu en periodos húmedos.',
        ],
        solutions: [
            { label: 'Telemetría Radicular IoT', detail: 'Sensores de humedad a 30 y 60 cm para mantener el punto óptimo de estrés hídrico sin poner en riesgo la longevidad de la cepa.' },
            { label: 'Ahorro CFE Tarifa 9N', detail: 'Programación de riego en bloques nocturnos para recortar más del 50% de la factura eléctrica de los sistemas de bombeo de la bodega.' },
            { label: 'Dictamen Oficial CONAGUA', detail: 'Reportes ejecutivos auditables que demuestran el uso racional y eficiente de la concesión hídrica REPDA ante las autoridades.' },
        ],
        cta: 'Ver solución para viñedos',
        accent: 'from-purple-600 to-indigo-800',
        border: 'border-purple-500/30',
        tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
        id: 'aguacate',
        emoji: '🥑',
        tag: 'Aguacatero',
        hook: '¿Produces aguacate? Cada litro de agua desperdiciada y cada plaga sin detectar te cuesta miles de pesos por hectárea.',
        headline: 'Deja de perder cosechas de aguacate por riego a ciegas y plagas invisibles.',
        problem: 'El aguacate es el cultivo de mayor valor en México, pero también el más exigente en agua y el más vulnerable al estrés hídrico durante la floración. Un ciclo mal regado puede colapsar tu producción completa.',
        pains: [
            'El aguacate necesita agua exacta en floración — ni de más ni de menos.',
            'El barrenador del hueso y la asfixia radicular destruyen la producción si no se detectan a tiempo.',
            'Las inspecciones manuales de parcelas grandes (>20 ha) son físicamente imposibles.',
        ],
        solutions: [
            { label: 'Mapa NDVI Satelital', detail: 'Identifica en segundos las zonas de tu huerto bajo estrés hídrico. Ve exactamente dónde están las plantas débiles sin pisar el campo.' },
            { label: 'Agrónomo IA con foto', detail: 'Toma una foto de la hoja o del fruto con tu celular y recibe en 10 segundos un diagnóstico de enfermedad, plaga o deficiencia nutricional.' },
            { label: 'Sensor IoT de Suelo', detail: 'Coloca nuestros nodos en la zona radicular y monitorea la humedad a 15 y 30 cm en tiempo real. El sistema te avisa automáticamente cuándo y cuánto regar.' },
        ],
        cta: 'Ver cómo funciona para aguacate',
        accent: 'from-emerald-600 to-green-700',
        border: 'border-emerald-500/30',
        tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
        id: 'berries',
        emoji: '🍓',
        tag: 'Productor de Berries',
        hook: '¿Exportas fresa, frambuesa o arándano? Un comprador americano puede rechazar tu lote completo si no tienes datos de manejo sustentable.',
        headline: 'Protege tu contrato de exportación con evidencia satelital de tus prácticas de riego.',
        problem: 'Los berries para exportación están bajo escrutinio constante. El cliente de EUA o Europa ya no solo pide calidad del fruto — exige trazabilidad del uso del agua y evidencia de producción sustentable.',
        pains: [
            'Sin datos documentados de riego, pierdes certficaciones y contratos de exportación.',
            'Royas, botritis y trips destruyen lotes enteros antes de que el supervisor los detecte.',
            'El costo del agua potable o de pozo para fresa en Baja California se ha triplicado.',
        ],
        solutions: [
            { label: 'Historial NDVI de 6 Meses', detail: 'Genera reportes objetivos de la evolución de salud de tu plantación mes a mes, respaldados con imágenes satelitales auditables para tus compradores.' },
            { label: 'Telemetría IoT de Suelo', detail: 'Conecta sensores Irrometer o TEROS a nuestro dashboard para mostrar datos históricos de humedad a tus auditores de sustentabilidad.' },
            { label: 'Alertas de Estrés Preventivas', detail: 'Recibe alertas antes de que el estrés se vuelva visible en la planta. Actúa en horas, no en días.' },
        ],
        cta: 'Ver cómo funciona para berries',
        accent: 'from-rose-600 to-pink-700',
        border: 'border-rose-500/30',
        tagColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
        id: 'maiz',
        emoji: '🌽',
        tag: 'Productor de Maíz / Granos',
        hook: '¿Produces maíz, sorgo o trigo? El costo de energía para bombear agua se fue al tope. Cada hora de bomba sin necesidad es dinero que tiras.',
        headline: 'Reduce hasta 35% el gasto en diésel y electricidad de tu sistema de bombeo con riego preciso.',
        problem: 'La producción de granos opera con márgenes muy ajustados. El consumo energético del sistema de riego es el gasto más alto y el más difícil de controlar sin datos objetivos del suelo.',
        pains: [
            'El 60% del agua de riego en maíz se aplica de más o en el momento equivocado.',
            'Las sequías de verano en el Norte y Bajío están colapsando los rendimientos históricos.',
            'No hay forma de saber qué parcela de 100 hectáreas necesita agua sin recorrerla.',
        ],
        solutions: [
            { label: 'Motor de Recomendación de Riego', detail: 'El sistema cruza humedad del suelo, temperatura y probabilidad de lluvia para darte la recomendación exacta: "No riegues — llueve mañana" o "Activa la bomba por 35 minutos".' },
            { label: 'Mapa de Estrés Hídrico por Zona', detail: 'Visualiza en el mapa de tu parcela qué cuadro exacto está sufriendo estrés hídrico, sin recorrer el campo.' },
            { label: 'Sensor IoT con API REST Python', detail: 'Conecta tu propio Arduino o ESP32 a nuestra API y monitorea todas las estaciones de riego desde un solo dashboard en tiempo real.' },
        ],
        cta: 'Ver cómo funciona para granos',
        accent: 'from-amber-500 to-yellow-600',
        border: 'border-amber-500/30',
        tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
        id: 'cooperativas',
        emoji: '🏭',
        tag: 'Cooperativa / Empacadora',
        hook: '¿Gestionas 30, 50 o 200 productores proveedores? No puedes visitar cada parcela cada semana. Pero sí puedes verlas todas desde un solo dashboard.',
        headline: 'Gestiona la salud de todas tus parcelas proveedoras en un solo mapa satelital.',
        problem: 'Las empacadoras y cooperativas dependen de la calidad y volumen de sus productores, pero tienen cero visibilidad sobre lo que está pasando en el campo semana a semana sin costosas visitas físicas.',
        pains: [
            'Un solo proveedor con sequía no detectada puede quebrar tu programación de empaque.',
            'Las visitas agronómicas físicas cuestan $3,000–5,000 MXN por productor al mes.',
            'No tienes datos objetivos para decidir a quién darle insumos primero en caso de escasez.',
        ],
        solutions: [
            { label: 'Dashboard Multi-Parcela', detail: 'Ve en un solo mapa el NDVI y el nivel de riesgo hídrico de todos tus proveedores. Prioriza recursos donde más se necesitan.' },
            { label: 'API REST de Integración', detail: 'Conecta AgriSaaS a tu ERP o sistema de empaque. Automatiza alertas cuando una parcela proveedora entra en zona de riesgo crítico.' },
            { label: 'Reportes Ejecutivos PDF', detail: 'Genera reportes mensuales por productor para tus reuniones de comité, financiadores o compradores internacionales.' },
        ],
        cta: 'Ver plan para cooperativas',
        accent: 'from-blue-600 to-indigo-700',
        border: 'border-blue-500/30',
        tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
        id: 'seguros',
        emoji: '🏦',
        tag: 'Seguro / Financiera Agrícola',
        hook: '¿Validas siniestros por sequía o apruebas créditos al campo? Tus inspectores no pueden visitar 2,000 predios. El satélite sí.',
        headline: 'Valida siniestros y aprueba créditos con evidencia satelital objetiva sin visitar el campo.',
        problem: 'Las aseguradoras y financieras del campo como AgroAsemex, FIRA y Mapfre Agro pierden millones en fraudes y en costos de inspección física. Necesitan evidencia objetiva, continua y auditables de lo que realmente pasó en cada parcela.',
        pains: [
            'El 30% de los siniestros por sequía reportados son difíciles de verificar sin evidencia histórica.',
            'Cada visita de inspector al campo cuesta $2,500–4,000 MXN en viáticos y tiempo.',
            'Los expedientes en papel no se pueden cruzar con datos climáticos históricos.',
        ],
        solutions: [
            { label: 'Historial Satelital por Parcela', detail: 'Accede a 6 meses de datos objetivos de NDVI y estrés hídrico por coordenadas exactas. Compara el estado antes y después del siniestro reportado.' },
            { label: 'API de Riesgo Hídrico', detail: 'Integra el índice de riesgo hídrico de AgriSaaS a tu plataforma de scoring crediticio para reducir la tasa de morosidad en cartera agrícola.' },
            { label: 'Reportes PDF Auditables', detail: 'Genera expedientes con imágenes satelitales, datos NDVI y gráficas de tendencia que tienen peso como evidencia técnica objetiva.' },
        ],
        cta: 'Ver solución para aseguradoras',
        accent: 'from-violet-600 to-purple-700',
        border: 'border-violet-500/30',
        tagColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    },
];

const IndustryCard = ({ industry }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`rounded-3xl border bg-slate-900/60 backdrop-blur-sm overflow-hidden transition-all duration-500 ${industry.border} ${expanded ? 'shadow-2xl' : 'shadow-lg'}`}>
            {/* Card Header — always visible */}
            <button
                className="w-full text-left p-8 flex items-start justify-between gap-6 group"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start gap-5">
                    <span className="text-5xl mt-1 shrink-0">{industry.emoji}</span>
                    <div>
                        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mb-3 ${industry.tagColor}`}>
                            {industry.tag}
                        </span>
                        <p className="text-sm text-slate-400 leading-relaxed mb-2 italic">
                            "{industry.hook}"
                        </p>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                            {industry.headline}
                        </h3>
                    </div>
                </div>
                <div className={`shrink-0 p-2 rounded-xl border border-slate-700 text-slate-400 group-hover:text-white group-hover:border-slate-600 transition-all mt-1`}>
                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>

            {/* Expanded Detail */}
            {expanded && (
                <div className="border-t border-slate-800/80 px-8 pb-8 pt-6 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Problem + Pains */}
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">El Problema Real</h4>
                            <p className="text-slate-300 text-sm leading-relaxed mb-5">
                                {industry.problem}
                            </p>
                            <ul className="space-y-3">
                                {industry.pains.map((pain, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                                        <span className="shrink-0 mt-0.5 text-red-400 font-black">✗</span>
                                        {pain}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right: Solutions */}
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Cómo lo Resuelve AgriSaaS</h4>
                            <ul className="space-y-4">
                                {industry.solutions.map((sol, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-white">{sol.label}</p>
                                            <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{sol.detail}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/dashboard"
                            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r ${industry.accent} hover:opacity-90 transition-all shadow-lg`}
                        >
                            Probar Plataforma Demo <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/pricing"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-slate-300 font-semibold text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
                        >
                            Ver Planes y Precios
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

const IndustrySolutions = () => {
    return (
        <section id="industrias" className="py-28 bg-slate-950 relative overflow-hidden border-t border-slate-800/60">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/20 to-slate-950 pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <FadeIn>
                        <div className="inline-block text-emerald-400 font-bold text-sm tracking-wider uppercase mb-3">
                            Soluciones por Industria
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 text-white leading-tight">
                            ¿Tu Cultivo o Industria Está Aquí?
                            <br />
                            <span className="text-emerald-400">Tenemos la Solución Específica.</span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            No construimos una herramienta genérica. Cada perfil de cliente tiene un problema distinto y una respuesta exacta dentro de AgriSaaS. Encuentra el tuyo.
                        </p>
                    </FadeIn>
                </div>

                {/* Industry Cards (Accordion) */}
                <FadeIn direction="up" delay={0.1}>
                    <div className="space-y-4">
                        {industries.map((industry) => (
                            <IndustryCard key={industry.id} industry={industry} />
                        ))}
                    </div>
                </FadeIn>

                {/* Bottom CTA banner */}
                <FadeIn delay={0.2}>
                    <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/20 text-center">
                        <p className="text-slate-300 text-lg font-medium mb-2">
                            ¿No encuentras tu industria o tienes un caso especial?
                        </p>
                        <p className="text-slate-400 text-sm mb-6">
                            Nuestro equipo puede diseñar una integración personalizada para tu operación.
                        </p>
                        <a
                            href="mailto:contacto@agrisaas.com?subject=Consulta%20Industria%20Especifica"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/30"
                        >
                            Hablar con un Especialista <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

export default IndustrySolutions;
