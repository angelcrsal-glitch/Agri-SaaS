import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { API_URL } from '../../services/api';

const MarketPricesWidget = () => {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const response = await fetch(`${API_URL}/api/v1/market-prices`);
                const result = await response.json();
                if (result.status === 'SUCCESS') {
                    setPrices(result.data);
                }
            } catch (error) {
                console.error("Error fetching market prices:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrices();
    }, []);

    if (loading) return null;

    return (
        <div className="absolute top-[250px] left-4 z-20 pointer-events-auto w-64">
            <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-left">
                <div className="bg-slate-900/60 p-2.5 border-b border-white/5 flex items-center gap-2">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Mercado SNIIM (Hoy)</h4>
                </div>
                <div className="p-3 space-y-2">
                    {prices.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-semibold">{item.crop}</span>
                            <span className={`font-mono font-bold ${
                                item.trend === 'up' ? 'text-emerald-400' : 
                                item.trend === 'down' ? 'text-red-400' : 'text-white'
                            }`}>
                                {item.price} {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '-'}
                            </span>
                        </div>
                    ))}
                    <button className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-[9px] uppercase tracking-widest text-slate-400 rounded-lg font-bold transition-colors">
                        Ver Centrales de Abasto
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketPricesWidget;
