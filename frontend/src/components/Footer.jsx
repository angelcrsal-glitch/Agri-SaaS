import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8 relative z-10 font-sans text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    {/* Column 1: Brand */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                                <Sprout className="w-5 h-5 text-emerald-400" />
                            </div>
                            <span className="text-xl font-bold text-white">
                                AgroSentinel
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs sm:text-sm max-w-xs leading-relaxed">
                            Plataforma de inteligencia satelital e IA aplicada a la agricultura de precisión en México y Latinoamérica.
                        </p>
                    </div>

                    {/* Column 2: Product */}
                    <div>
                        <h3 className="font-bold text-white mb-4">Producto</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li>
                                <a href="#features" className="hover:text-emerald-400 transition-colors">Funcionalidades</a>
                            </li>
                            <li>
                                <Link to="/pricing" className="hover:text-emerald-400 transition-colors">Planes y Precios</Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Plataforma / Demo</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div>
                        <h3 className="font-bold text-white mb-4">Empresa</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li>
                                <Link to="/about" className="hover:text-emerald-400 transition-colors">Sobre Nosotros</Link>
                            </li>
                            <li>
                                <span className="hover:text-emerald-400 transition-colors cursor-pointer">Contacto</span>
                            </li>
                            <li>
                                <span className="hover:text-emerald-400 transition-colors cursor-pointer">Casos de Éxito</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Legal */}
                    <div>
                        <h3 className="font-bold text-white mb-4">Legales</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li>
                                <span className="hover:text-emerald-400 transition-colors cursor-pointer">Aviso de Privacidad</span>
                            </li>
                            <li>
                                <span className="hover:text-emerald-400 transition-colors cursor-pointer">Términos de Servicio</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-xs">
                        &copy; 2026 AgroSentinel. Todos los derechos reservados. Desarrollado para el sector agrícola.
                    </p>
                    <div className="flex space-x-6">
                        <a href="#" className="text-slate-500 hover:text-white transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-slate-500 hover:text-white transition-colors">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-slate-500 hover:text-white transition-colors">
                            <Instagram className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
