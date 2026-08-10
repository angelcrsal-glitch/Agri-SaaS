import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, AlertOctagon, Droplets, ArrowRight, Smartphone } from 'lucide-react';
import { sendSMSAlert, API_URL } from '../../services/api';
import { toast } from 'sonner';

const SmartActionCard = ({ recommendation }) => {
    const [isSending, setIsSending] = useState(false);

    if (!recommendation) return null;

    const { status, action_title, action_detail, reasoning, confidence } = recommendation;

    // Define styles based on status
    const styles = {
        URGENT: {
            border: 'border-red-500',
            bg: 'bg-red-500/10',
            text: 'text-red-500',
            icon: <AlertOctagon className="w-6 h-6 text-red-500" />,
            button: 'bg-red-600 hover:bg-red-700',
            label: 'ALERTA CRÍTICA'
        },
        WARNING: {
            border: 'border-amber-500',
            bg: 'bg-amber-500/10',
            text: 'text-amber-500',
            icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
            button: 'bg-amber-600 hover:bg-amber-700',
            label: 'ADVERTENCIA'
        },
        OPTIMAL: {
            border: 'border-emerald-500',
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-500',
            icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
            button: 'bg-emerald-600 hover:bg-emerald-700',
            label: 'ÓPTIMO'
        }
    };

    const currentStyle = styles[status] || styles.OPTIMAL;

    const handleExecuteAction = async (e) => {
        e.stopPropagation(); // Prevenir redirección al hacer clic en el botón sobre el mapa
        setIsSending(true);

        try {
            // 1. Obtener número guardado en el perfil
            const userId = "00000000-0000-0000-0000-000000000000"; // Hardcoded MVP
            const prefResponse = await fetch(`${API_URL}/api/v1/alerts/preferences/${userId}`);
            const prefResult = await prefResponse.json();
            
            const userPhone = prefResult?.data?.phone_number;

            if (!userPhone) {
                toast.error("No hay número celular guardado.", {
                    description: "Ve al Menú Lateral > Perfil para configurar tus alertas."
                });
                setIsSending(false);
                return;
            }

            toast.info(`Enviando alerta SMS a ${userPhone}...`);

            // 2. Enviar SMS
            const msg = `AgriSaaS ALERTA: ${action_title}. ${action_detail}`;
            await sendSMSAlert(userPhone, msg);
            toast.success("¡Alerta SMS enviada exitosamente!");
        } catch (error) {
            toast.error("Error al enviar el SMS. Verifica las credenciales de Twilio.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl border ${currentStyle.border} ${currentStyle.bg} backdrop-blur-xl p-6 shadow-2xl transition-all duration-500 animate-fade-in-up`}>

            {/* Header / Status Bar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-black/20 ${currentStyle.text}`}>
                        {currentStyle.icon}
                    </div>
                    <div>
                        <h3 className={`text-sm font-bold tracking-widest ${currentStyle.text}`}>
                            {currentStyle.label}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono">
                            CERTEZA: {confidence}%
                        </p>
                    </div>
                </div>
                {/* Visual Pulse for Urgent/Warning */}
                {status !== 'OPTIMAL' && (
                    <span className={`flex h-3 w-3 relative`}>
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentStyle.text.replace('text', 'bg')}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${currentStyle.text.replace('text', 'bg')}`}></span>
                    </span>
                )}
            </div>

            {/* Main Content */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2 leading-tight">
                    {action_title}
                </h2>
                <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                    {action_detail}
                </p>

                {/* Reasoning Box */}
                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-slate-400 italic">
                        <span className="font-semibold not-italic text-slate-500 mr-2">RAZONAMIENTO:</span>
                        "{reasoning}"
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                {status !== 'OPTIMAL' && (
                    <button 
                        onClick={handleExecuteAction}
                        disabled={isSending}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 group ${currentStyle.button} ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Smartphone className="w-4 h-4" />
                        {isSending ? 'Enviando...' : 'Enviar Alerta SMS'}
                        {!isSending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                )}

                <button className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 transition-colors text-sm">
                    {status === 'OPTIMAL' ? 'View Details' : 'Dismiss'}
                </button>
            </div>
        </div>
    );
};

export default SmartActionCard;
