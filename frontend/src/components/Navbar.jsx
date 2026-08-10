import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Menu, X, Globe, LogIn } from 'lucide-react';
import SatelliteLogo from './SatelliteLogo';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 shadow-inner">
                            <SatelliteLogo className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            AgroSentinel
                        </span>
                    </Link>

                    {/* Center Navigation - Hidden on mobile */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#para-quien" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            ¿Para Quién Es?
                        </a>
                        <a href="#cfe-conagua" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            CFE & CONAGUA
                        </a>
                        <a href="#industrias" className="hidden">
                            Cultivos
                        </a>
                        <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Tecnología
                        </a>
                        <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Planes
                        </a>
                    </div>

                    {/* Right Buttons */}
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block"
                        >
                            Iniciar Sesión
                        </Link>
                        <Link
                            to="/dashboard"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-lg shadow-emerald-900/20"
                        >
                            Ver Demo
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-slate-300 hover:text-white transition-colors md:hidden"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 overflow-hidden"
                    >
                        <div className="px-4 py-6 space-y-4 flex flex-col">
                            <a
                                href="#pain-points"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                Desafíos del Campo
                            </a>
                            <a
                                href="#cfe-conagua"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                CFE & CONAGUA (Ahorro Real)
                            </a>
                            <a
                                href="#features"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                Funcionalidades
                            </a>
                            <Link
                                to="/about"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                Nosotros
                            </Link>
                            <Link
                                to="/pricing"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                Planes
                            </Link>
                            <div className="h-px bg-slate-800 my-2" />
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                to="/dashboard"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                Probar Demo
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
