import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import { Loader2, MapPin, Calendar, Activity, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LogbookModal from '../components/MyFarms/LogbookModal';

const MyFarms = () => {
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLogbookFarm, setSelectedLogbookFarm] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFarms();
    }, []);

    const fetchFarms = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('farms')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFarms(data || []);
        } catch (error) {
            console.error('Error fetching farms:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (score) => {
        if (score > 70) return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (score > 40) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-slate-950 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-full w-full">
            <Sidebar />
            <div className="flex-1 h-full w-full bg-slate-950 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">My Farms</h1>
                            <p className="text-slate-400 mt-2">Manage and monitor your analyzed fields.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => alert('Activando módulo de alertas SMS por heladas/sequías (CONAGUA/SMN)')}
                                className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 transition-all flex items-center gap-2"
                            >
                                <AlertTriangle className="w-4 h-4" />
                                Alertas CONAGUA
                            </button>
                            <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-400 text-sm font-bold">
                                {farms.length} Parcelas
                            </div>
                        </div>
                    </div>

                    {farms.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                            <div className="bg-slate-900 inline-block p-4 rounded-full mb-4">
                                <MapPin className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No farms saved yet</h3>
                            <p className="text-slate-400 mb-6 max-w-md mx-auto">Start by analyzing an area on the map and saving it to your dashboard.</p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                            >
                                Go to Map
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {farms.map((farm) => {
                                // Safely extract risk data
                                const riskData = farm.risk_data || {};
                                const score = riskData.water_risk_score || 0;
                                const riskColor = getRiskColor(score);
                                const imageSrc = riskData.image_base64
                                    ? `data:image/png;base64,${riskData.image_base64}`
                                    : null;

                                return (
                                    <div
                                        key={farm.id}
                                        className="group bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1 cursor-pointer"
                                        onClick={() => navigate('/dashboard', { state: { selectedFarm: farm } })}
                                    >
                                        {/* Thumbnail */}
                                        <div className="h-48 w-full bg-slate-950 relative overflow-hidden">
                                            {imageSrc ? (
                                                <img
                                                    src={imageSrc}
                                                    alt={farm.name}
                                                    className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <MapPin className="w-10 h-10 text-slate-800" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-md border ${riskColor}`}>
                                                    Risk {score}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-slate-200 group-hover:text-white truncate mb-2">
                                                {farm.name || 'Untitled Farm'}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(farm.created_at).toLocaleDateString()}
                                            </div>

                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/50">
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span>{riskData.ndvi_trend ? 'Analysis Ready' : 'Processed'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setSelectedLogbookFarm(farm); }}
                                                        className="px-2 py-1 text-[10px] bg-sky-900/30 text-sky-400 rounded hover:bg-sky-500 hover:text-white transition-colors font-bold uppercase"
                                                    >
                                                        Bitácora
                                                    </button>
                                                    <div className="p-2 bg-slate-800 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {selectedLogbookFarm && (
                <LogbookModal 
                    farm={selectedLogbookFarm} 
                    onClose={() => setSelectedLogbookFarm(null)} 
                />
            )}
        </div>
    );
};

export default MyFarms;
