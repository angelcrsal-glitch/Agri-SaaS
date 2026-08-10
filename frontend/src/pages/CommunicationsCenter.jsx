import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, Clock, Phone, Zap, ArrowLeft, Loader2, Plus, Bell, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../services/api';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
    { label: 'L', value: 0 },
    { label: 'M', value: 1 },
    { label: 'M', value: 2 },
    { label: 'J', value: 3 },
    { label: 'V', value: 4 },
    { label: 'S', value: 5 },
    { label: 'D', value: 6 }
];

const CommunicationsCenter = () => {
    const navigate = useNavigate();
    
    // Form State
    const [customMessage, setCustomMessage] = useState('');
    const [phone, setPhone] = useState('');
    const [sendAt, setSendAt] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    
    const [pendingMessages, setPendingMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const userId = "00000000-0000-0000-0000-000000000000"; // Hardcoded MVP

    const fetchPreferences = async () => {
        try {
            const res = await fetch(`${API_URL}/api/v1/alerts/preferences/${userId}`);
            const result = await res.json();
            if (result.data?.phone_number) {
                setPhone(result.data.phone_number);
            }
        } catch (error) {
            console.error("Failed to load profile phone:", error);
        }
    };

    const fetchPending = async () => {
        try {
            const res = await fetch(`${API_URL}/api/v1/notify/pending`);
            const result = await res.json();
            setPendingMessages(result.data || []);
        } catch (error) {
            console.error("Failed to load pending messages", error);
        }
    };

    useEffect(() => {
        fetchPreferences();
        fetchPending();
        // Auto-fill time to current local time
        const now = new Date();
        // format to YYYY-MM-DDThh:mm
        const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
        const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 16);
        setSendAt(localISOTime);

        const interval = setInterval(fetchPending, 10000);
        return () => clearInterval(interval);
    }, []);

    const toggleDay = (dayValue) => {
        setSelectedDays(prev => 
            prev.includes(dayValue) 
                ? prev.filter(d => d !== dayValue) 
                : [...prev, dayValue].sort()
        );
    };

    const handleCreateAlarm = async () => {
        if (!customMessage.trim() || !phone || !sendAt) {
            toast.error("Por favor completa todos los campos (Teléfono, Mensaje y Fecha/Hora).");
            return;
        }
        
        setIsLoading(true);
        try {
            const dateObj = new Date(sendAt);
            const payload = { 
                to_phone: phone, 
                message: customMessage, 
                send_at: dateObj.toISOString(),
                repeat_days: selectedDays.length > 0 ? selectedDays : null
            };

            const res = await fetch(`${API_URL}/api/v1/notify/schedule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Error en programación");
            toast.success("Alarma guardada exitosamente.");
            
            // Reset state
            setCustomMessage('');
            setSelectedDays([]);
            fetchPending();
        } catch (error) {
            toast.error("Hubo un error al guardar la alarma.");
        } finally {
            setIsLoading(false);
        }
    };

    const getDaysText = (days) => {
        if (!days || days.length === 0) return "Solo una vez";
        if (days.length === 7) return "Todos los días";
        const map = {0:'Lun', 1:'Mar', 2:'Mie', 3:'Jue', 4:'Vie', 5:'Sab', 6:'Dom'};
        return days.map(d => map[d]).join(', ');
    };

    return (
        <div className="h-screen w-full bg-slate-950 text-slate-200 p-6 md:p-10 flex flex-col items-center overflow-y-auto">
            <div className="w-full max-w-6xl">
                
                {/* Header */}
                <div className="flex items-center gap-6 mb-10 pb-8 border-b border-white/5">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors shadow-lg shadow-black/20"
                        title="Volver al Dashboard"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-300" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 shadow-xl shadow-emerald-900/20 flex-shrink-0">
                            <Bell className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Alarmas de Comunicación</h1>
                            <p className="text-slate-400 mt-2 text-sm lg:text-base font-medium">Automatiza el envío de instrucciones por SMS a tu personal.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Alarm List (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-2xl min-h-[500px] flex flex-col">
                            <h2 className="text-sm font-bold text-slate-300 mb-6 flex items-center justify-between uppercase tracking-widest border-b border-white/5 pb-4">
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-emerald-400" />
                                    Mis Alarmas
                                </span>
                                <span className="bg-emerald-500/20 text-emerald-400 py-1 px-2.5 rounded-full text-[10px] font-black">
                                    {pendingMessages.length}
                                </span>
                            </h2>
                            
                            {pendingMessages.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-slate-500">
                                    <Bell className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="text-sm font-medium">Sin alarmas activas</p>
                                    <p className="text-xs mt-1">Crea una nueva a la derecha</p>
                                </div>
                            ) : (
                                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                    {pendingMessages.map(msg => (
                                        <div key={msg.id} className="p-4 bg-slate-950/80 rounded-2xl border border-white/5 relative overflow-hidden group shadow-lg">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                                            
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-black text-white">
                                                    {new Date(msg.send_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">"{msg.message}"</p>
                                            
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 inline-flex px-2 py-1 rounded-lg">
                                                {msg.repeat_days && msg.repeat_days.length > 0 ? (
                                                    <RefreshCw className="w-3 h-3" />
                                                ) : (
                                                    <Calendar className="w-3 h-3" />
                                                )}
                                                {getDaysText(msg.repeat_days)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Alarm Creator (8 cols) */}
                    <div className="lg:col-span-8">
                        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden h-full flex flex-col">
                            <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

                            <div className="flex-1 space-y-8 z-10 relative">
                                
                                <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/5 pb-4">Crear Nueva Alarma</h2>

                                {/* Step 1: Configurar Tiempo y Repetición */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">1</div>
                                    <div className="flex-1 bg-black/20 p-6 rounded-3xl border border-white/5">
                                        <h3 className="text-base font-bold text-white mb-5">Horario</h3>
                                        
                                        <div className="mb-6">
                                            <input 
                                                type="datetime-local"
                                                value={sendAt}
                                                onChange={(e) => setSendAt(e.target.value)}
                                                className="w-full sm:w-auto bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-lg font-bold text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none color-scheme-dark shadow-inner"
                                            />
                                        </div>

                                        <h3 className="text-sm font-bold text-slate-300 mb-3">Repetir (Opcional)</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS_OF_WEEK.map(day => (
                                                <button
                                                    key={day.value}
                                                    onClick={() => toggleDay(day.value)}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all transform ${selectedDays.includes(day.value) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-110' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                                >
                                                    {day.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2: Destinatario */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">2</div>
                                    <div className="flex-1 bg-black/20 p-6 rounded-3xl border border-white/5">
                                        <label className="flex items-center gap-2 text-base font-bold text-white mb-3">
                                            <Phone className="w-4 h-4 text-emerald-400" /> 
                                            Destinatario
                                        </label>
                                        <input 
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+52 123 456 7890"
                                            className="w-full md:w-1/2 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-emerald-500 transition-all outline-none font-mono text-sm shadow-inner"
                                        />
                                    </div>
                                </div>

                                {/* Step 3: Mensaje */}
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">3</div>
                                    <div className="flex-1 bg-black/20 p-6 rounded-3xl border border-white/5">
                                        <label className="flex items-center justify-between text-base font-bold text-white mb-3">
                                            <span>Contenido del Mensaje</span>
                                            <span className="text-xs font-normal text-slate-500 bg-slate-900 px-2 py-1 rounded-md">
                                                Plantillas: 
                                                <button onClick={() => setCustomMessage("Encender bomba")} className="text-emerald-400 ml-2 hover:underline">Bomba</button> | 
                                                <button onClick={() => setCustomMessage("Alerta de helada")} className="text-sky-400 ml-2 hover:underline">Helada</button>
                                            </span>
                                        </label>
                                        <textarea 
                                            value={customMessage}
                                            onChange={(e) => setCustomMessage(e.target.value)}
                                            rows="4"
                                            placeholder="Escribe instrucciones detalladas..."
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-emerald-500 transition-all outline-none resize-none text-sm leading-relaxed shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-8 flex justify-end z-10 relative pt-6 border-t border-white/5">
                                <button 
                                    onClick={handleCreateAlarm}
                                    disabled={isLoading || !customMessage.trim() || !phone || !sendAt}
                                    className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg shadow-xl shadow-emerald-900/50 hover:shadow-emerald-900/80 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                                    Guardar Alarma
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CommunicationsCenter;
