import React from 'react';
import FadeIn from './FadeIn';

const UseCases = () => {
    return (
        <section id="features" className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Section Header */}
                <div className="text-center mb-24">
                    <FadeIn>
                        <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-white">
                            Más Allá del Monitoreo Agrícola
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Aprovecha la inteligencia satelital para seguros del campo, verificación ambiental y gestión territorial.
                        </p>
                    </FadeIn>
                </div>

                <div className="space-y-24">
                    {/* Case 1: Reforestation */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <FadeIn direction="right">
                            <div>
                                <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-emerald-400 bg-emerald-400/10 mb-6">
                                    Verificación de Biomasa
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4">
                                    Proyectos de Reforestación y Créditos de Carbono
                                </h3>
                                <p className="text-lg text-slate-400 leading-relaxed">
                                    Rastrea el crecimiento de la cobertura vegetal a lo largo del tiempo. Genera reportes satelitales auditables y transparentes para la validación de créditos de carbono y conservación.
                                </p>
                            </div>
                        </FadeIn>
                        <FadeIn direction="left">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                <img
                                    src="/images/reforestacion.png"
                                    alt="Vista satelital de reforestación"
                                    className="relative w-full rounded-2xl shadow-2xl border border-slate-800 transform transition duration-500 group-hover:scale-[1.01]"
                                />
                            </div>
                        </FadeIn>
                    </div>

                    {/* Case 2: Urban */}
                    <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
                        <FadeIn direction="left" className="flex-1">
                            <div className="relative group">
                                <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-blue-400 bg-blue-400/10 mb-6">
                                    Gestión Territorial Urbana
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4">
                                    Ciudades Verdes y Eficiencia Hídrica
                                </h3>
                                <p className="text-lg text-slate-400 leading-relaxed">
                                    Optimiza el uso de agua en parques municipales. Identifica islas de calor urbanas y monitorea el estrés hídrico de áreas verdes públicas con análisis infrarrojo.
                                </p>
                            </div>
                        </FadeIn>

                        <FadeIn direction="right" className="flex-1 w-full">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                <img
                                    src="/images/ciudad.png"
                                    alt="Análisis satelital urbano"
                                    className="relative w-full rounded-2xl shadow-2xl border border-slate-800 transform transition duration-500 group-hover:scale-[1.01]"
                                />
                            </div>
                        </FadeIn>
                    </div>

                    {/* Case 3: Insurance */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <FadeIn direction="right">
                            <div>
                                <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-amber-400 bg-amber-400/10 mb-6">
                                    Seguros Agropecuarios
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4">
                                    Validación de Siniestros por Sequía
                                </h3>
                                <p className="text-lg text-slate-400 leading-relaxed">
                                    Verifica reclamos por sequías o siniestros climáticos de forma remota e instantánea con más de 6 meses de historial de humedad y salud vegetativa por parcela.
                                </p>
                            </div>
                        </FadeIn>
                        <FadeIn direction="left">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-red-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                <img
                                    src="/images/sequia.png"
                                    alt="Análisis de riesgo de sequía"
                                    className="relative w-full rounded-2xl shadow-2xl border border-slate-800 transform transition duration-500 group-hover:scale-[1.01]"
                                />
                            </div>
                        </FadeIn>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default UseCases;
