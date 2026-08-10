import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, Snowflake, Sun, Save, Activity } from 'lucide-react';
import { API_URL } from '../../services/api';
import { toast } from 'sonner';

const AlertsPanel = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [prefs, setPrefs] = useState({
        phone_number: '',
        alert_frost: true,
        alert_drought: true
    });

    useEffect(() => {
        if (user?.id) {
            fetchPreferences();
        }
    }, [user]);

    const fetchPreferences = async () => {
        try {
            const res = await fetch(`${API_URL}/api/v1/alerts/preferences/${user.id}`);
            const data = await res.json();
            if (data.status === 'SUCCESS' && data.data) {
                setPrefs({
                    phone_number: data.data.phone_number || '',
                    alert_frost: data.data.alert_frost,
                    alert_drought: data.data.alert_drought
                });
            }
        } catch (error) {
            console.error("Error fetching alert prefs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                user_id: user.id,
                ...prefs
            };
            const res = await fetch(`${API_URL}/api/v1/alerts/preferences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.status === 'SUCCESS') {
                toast.success('Preferencias de alertas CONAGUA guardadas');
            } else {
                toast.error('Error al guardar alertas');
            }
        } catch (error) {
            console.error("Error saving alert prefs:", error);
            toast.error('Fallo de conexión al guardar alertas');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 flex items-center justify-center">
                <Activity className="w-6 h-6 animate-spin text-sky-500" />
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-sky-500/20 w-full mt-6 shadow-xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/20">
                    <Bell className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                    <h3 className="text-white font-bold">Alertas CONAGUA / SMS</h3>
                    <p className="text-xs text-slate-400">Notificaciones tempranas para tu personal de campo.</p>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-4 relative z-10 text-left">
                {/* Phone */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Teléfono Móvil (SMS)</label>
                    <div className="relative">
                        <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-sky-500" />
                        <input
                            type="tel"
                            value={prefs.phone_number}
                            onChange={(e) => setPrefs(prev => ({ ...prev, phone_number: e.target.value }))}
                            placeholder="Ej: +52 55 1234 5678"
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Heladas */}
                    <div 
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${prefs.alert_frost ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-800/30 border-slate-700'}`}
                        onClick={() => setPrefs(prev => ({ ...prev, alert_frost: !prev.alert_frost }))}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <Snowflake className={`w-5 h-5 ${prefs.alert_frost ? 'text-indigo-400' : 'text-slate-500'}`} />
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${prefs.alert_frost ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${prefs.alert_frost ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </div>
                        <h4 className={`text-sm font-bold ${prefs.alert_frost ? 'text-white' : 'text-slate-400'}`}>Alertas de Helada</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Recibe un SMS si la temperatura pronosticada baja de 4°C.</p>
                    </div>

                    {/* Sequia */}
                    <div 
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${prefs.alert_drought ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/30 border-slate-700'}`}
                        onClick={() => setPrefs(prev => ({ ...prev, alert_drought: !prev.alert_drought }))}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <Sun className={`w-5 h-5 ${prefs.alert_drought ? 'text-amber-400' : 'text-slate-500'}`} />
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${prefs.alert_drought ? 'bg-amber-500' : 'bg-slate-700'}`}>
                                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${prefs.alert_drought ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </div>
                        <h4 className={`text-sm font-bold ${prefs.alert_drought ? 'text-white' : 'text-slate-400'}`}>Alertas de Sequía/Calor</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Avisos de olas de calor extremas (+35°C) en la región.</p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full mt-4 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-sky-900/20 disabled:bg-slate-700 disabled:shadow-none"
                >
                    {saving ? (
                        <Activity className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Guardar Preferencias
                        </>
                    )}
                </button>
            </div>
            
            {/* BG Gradient */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
    );
};

export default AlertsPanel;
