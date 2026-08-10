import React, { useState, useEffect } from 'react';
import { X, Calendar, Droplets, Sprout, Shield, ListPlus, Activity } from 'lucide-react';
import { API_URL } from '../../services/api';
import { toast } from 'sonner';

const LogbookModal = ({ farm, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [activityType, setActivityType] = useState('Siembra');
    const [productName, setProductName] = useState('');
    const [dose, setDose] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (farm?.id) {
            fetchLogs();
        }
    }, [farm]);

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${API_URL}/api/v1/farms/${farm.id}/logs`);
            const data = await res.json();
            if (data.status === 'SUCCESS') {
                setLogs(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
            toast.error("Error al cargar la bitácora.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLog = async (e) => {
        e.preventDefault();
        if (!productName.trim()) {
            toast.error("Ingresa el nombre del producto o actividad");
            return;
        }

        setSaving(true);
        try {
            const newLog = {
                activity_type: activityType,
                product_name: productName,
                dose: dose,
                notes: notes,
                date: date
            };

            const res = await fetch(`${API_URL}/api/v1/farms/${farm.id}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLog)
            });
            const data = await res.json();
            
            if (data.status === 'SUCCESS') {
                toast.success('Registro guardado correctamente');
                setProductName('');
                setDose('');
                setNotes('');
                fetchLogs(); // Reload list
            }
        } catch (error) {
            console.error("Error saving log:", error);
            toast.error("Error al guardar el registro.");
        } finally {
            setSaving(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'Riego': return <Droplets className="w-4 h-4 text-sky-400" />;
            case 'Fertilizante': return <Activity className="w-4 h-4 text-amber-400" />;
            case 'Siembra': return <Sprout className="w-4 h-4 text-emerald-400" />;
            case 'Agroquímico': return <Shield className="w-4 h-4 text-rose-400" />;
            default: return <ListPlus className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in pointer-events-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[80vh]">
                
                {/* Left Panel: Form */}
                <div className="w-full md:w-1/3 bg-slate-800/50 p-6 flex flex-col border-r border-slate-700 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-white">Nuevo Registro</h2>
                            <p className="text-xs text-slate-400">Bitácora SENASICA / GlobalGAP</p>
                        </div>
                        {/* Mobile close button */}
                        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSaveLog} className="space-y-4 flex-1">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Actividad</label>
                            <select 
                                value={activityType}
                                onChange={(e) => setActivityType(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                            >
                                <option value="Siembra">Siembra / Trasplante</option>
                                <option value="Fertilizante">Fertilización (Nutrición)</option>
                                <option value="Agroquímico">Agroquímico (Pesticida/Herbicida)</option>
                                <option value="Riego">Riego</option>
                                <option value="Cosecha">Cosecha</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Producto / Detalle</label>
                            <input 
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="Ej: Urea 46%, Semilla Asgrow, Riego Goteo"
                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Dosis / Cantidad</label>
                            <input 
                                type="text"
                                value={dose}
                                onChange={(e) => setDose(e.target.value)}
                                placeholder="Ej: 200 kg/ha, 4 horas"
                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fecha</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                <input 
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Observaciones</label>
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Condiciones del clima, método de aplicación..."
                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors h-24 resize-none custom-scrollbar"
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={saving}
                            className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-sky-900/50 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {saving ? 'Guardando...' : 'Agregar Registro'}
                        </button>
                    </form>
                </div>

                {/* Right Panel: History */}
                <div className="w-full md:w-2/3 p-6 flex flex-col bg-slate-900">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ListPlus className="w-5 h-5 text-sky-400" />
                                Historial de {farm?.name || 'la Parcela'}
                            </h2>
                            <p className="text-sm text-slate-400">Registros guardados en la nube.</p>
                        </div>
                        <button onClick={onClose} className="hidden md:block text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                                <Activity className="w-8 h-8 animate-spin mb-2" />
                                <p>Cargando registros...</p>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl p-8 text-center">
                                <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                <h3 className="text-white font-bold mb-1">Sin registros aún</h3>
                                <p className="text-slate-400 text-sm">Comienza agregando siembras, fertilizantes o riegos usando el panel izquierdo. Los datos serán persistentes.</p>
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 hover:border-slate-500 transition-colors flex gap-4">
                                    <div className="mt-1">
                                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-inner">
                                            {getActivityIcon(log.activity_type)}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-white text-sm">{log.activity_type} - {log.product_name}</h4>
                                            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">{log.date}</span>
                                        </div>
                                        {log.dose && (
                                            <div className="inline-block px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300 font-semibold mb-2 border border-slate-600/50">
                                                Dosis: {log.dose}
                                            </div>
                                        )}
                                        {log.notes && (
                                            <p className="text-xs text-slate-400 italic">"{log.notes}"</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LogbookModal;
