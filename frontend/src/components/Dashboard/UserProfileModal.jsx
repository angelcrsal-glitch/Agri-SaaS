import React, { useState, useEffect } from 'react';
import { User, Phone, Save, X, Bell, BellOff, Loader2 } from 'lucide-react';
import { API_URL } from '../../services/api';
import { toast } from 'sonner';

const UserProfileModal = ({ isOpen, onClose }) => {
    const [phone, setPhone] = useState('');
    const [alertFrost, setAlertFrost] = useState(true);
    const [alertDrought, setAlertDrought] = useState(true);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Hardcoded for MVP, in production this comes from Auth Context
    const userId = "00000000-0000-0000-0000-000000000000";

    useEffect(() => {
        if (!isOpen) return;

        const loadPreferences = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/v1/alerts/preferences/${userId}`);
                const result = await response.json();
                if (result.status === 'SUCCESS' && result.data) {
                    setPhone(result.data.phone_number || '');
                    setAlertFrost(result.data.alert_frost ?? true);
                    setAlertDrought(result.data.alert_drought ?? true);
                }
            } catch (error) {
                console.error("Error loading preferences:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPreferences();
    }, [isOpen]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${API_URL}/api/v1/alerts/preferences`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    phone_number: phone,
                    alert_frost: alertFrost,
                    alert_drought: alertDrought
                })
            });
            const result = await response.json();
            if (result.status === 'SUCCESS') {
                toast.success("Preferencias guardadas exitosamente.");
                onClose();
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            toast.error("Hubo un error al guardar las preferencias.");
            console.error("Save error:", error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-auto">
            <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scale-up">
                
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Perfil y Alertas</h3>
                            <p className="text-xs text-slate-400">Configura dónde recibir tus notificaciones</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-2" />
                            <span className="text-xs">Cargando preferencias...</span>
                        </div>
                    ) : (
                        <>
                            {/* Phone Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-emerald-400" />
                                    Número Celular (SMS)
                                </label>
                                <p className="text-[10px] text-slate-500 mb-2">Ingresa tu número con código de país (ej. +521234567890)</p>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+52 123 456 7890"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            {/* Alert Preferences */}
                            <div className="space-y-4 pt-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipos de Alerta</h4>
                                
                                <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${alertDrought ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                                            <Bell className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Estrés Hídrico (Sequía)</p>
                                            <p className="text-[10px] text-slate-400">Notificar necesidad urgente de riego</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setAlertDrought(!alertDrought)}
                                        className={`w-11 h-6 rounded-full relative transition-colors ${alertDrought ? 'bg-blue-500' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${alertDrought ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${alertFrost ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>
                                            <Bell className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Heladas Inminentes</p>
                                            <p className="text-[10px] text-slate-400">Notificar caídas extremas de temperatura</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setAlertFrost(!alertFrost)}
                                        className={`w-11 h-6 rounded-full relative transition-colors ${alertFrost ? 'bg-blue-500' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${alertFrost ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-950/80 border-t border-white/10 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-900/50 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Guardando...' : 'Guardar Perfil'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
