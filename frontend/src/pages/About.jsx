import React from 'react';
import Navbar from '../components/Navbar';
import { Lightbulb, Target, Search } from 'lucide-react';
import Footer from '../components/Footer';

const About = () => {
    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-green-500/30">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 overflow-hidden px-4">
                    <div className="max-w-7xl mx-auto text-center relative z-10">
                        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Driven by Innovation, <br />
                            <span className="text-green-500">Grounded in Results.</span>
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            AgriSaaS is a product of <span className="text-white font-semibold">Merkalia</span>,
                            a business consultancy dedicated to optimizing processes through custom systems.
                        </p>
                    </div>

                    {/* Background Decor */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[100px] opacity-20" />
                        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] opacity-20" />
                    </div>
                </section>

                {/* The Story Grid */}
                <section className="py-20 bg-slate-900/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
                            {/* Who We Are */}
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-white border-l-4 border-green-500 pl-4">
                                    Who We Are
                                </h2>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    Merkalia specializes in transforming complex data—whether it's stock levels, sales figures, or logistics chains—into simple, actionable dashboards.
                                </p>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    We realized that the same principles of business intelligence could be applied to the most vital industry of all: <strong>Agriculture</strong>. Now, we are applying that expertise to turn satellite feeds into clear decisions for farmers.
                                </p>
                            </div>

                            {/* Our Mission */}
                            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-green-500/30 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Target className="w-24 h-24" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-6 relative z-10">
                                    Our Mission
                                </h2>
                                <p className="text-slate-300 text-lg leading-relaxed relative z-10">
                                    To democratize satellite intelligence. We believe every farmer, big or small, deserves access to space-grade data to make better irrigation decisions, reduce waste, and feed the world sustainably.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-24 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            {/* Value 1 */}
                            <div className="p-6">
                                <div className="bg-slate-900 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-900/20">
                                    <Lightbulb className="w-8 h-8 text-yellow-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Innovation</h3>
                                <p className="text-slate-400">
                                    We constantly explore new technologies to solve old problems in smarter ways.
                                </p>
                            </div>

                            {/* Value 2 */}
                            <div className="p-6">
                                <div className="bg-slate-900 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-900/20">
                                    <Target className="w-8 h-8 text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Precision</h3>
                                <p className="text-slate-400">
                                    In farming, accuracy matters. We deliver data you can trust down to the pixel.
                                </p>
                            </div>

                            {/* Value 3 */}
                            <div className="p-6">
                                <div className="bg-slate-900 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-900/20">
                                    <Search className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Transparency</h3>
                                <p className="text-slate-400">
                                    No hidden fees, no black boxes. We explain exactly how our data works for you.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
};

export default About;
