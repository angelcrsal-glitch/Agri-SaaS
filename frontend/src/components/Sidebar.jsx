import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Grid, LogOut, Sprout, User, MessageSquare, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const Sidebar = ({ onToggleChat, onOpenProfile }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/login');
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Error logging out');
        }
    };

    return (
        <div className="h-screen w-20 flex flex-col items-center py-6 bg-slate-900/95 backdrop-blur-md border-r border-white/10 z-50">
            {/* Logo Icon */}
            <div className="mb-10 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Sprout className="w-6 h-6 text-emerald-500" />
            </div>

            {/* Nav Items */}
            <div className="flex-1 flex flex-col gap-6 w-full px-3">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `
                        flex justify-center items-center p-3 rounded-xl transition-all duration-200 group
                        ${isActive ? 'bg-emerald-600 shadow-lg shadow-emerald-900/40 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                    `}
                    title="Map Dashboard"
                >
                    <LayoutDashboard className="w-6 h-6" />
                </NavLink>

                <NavLink
                    to="/my-farms"
                    className={({ isActive }) => `
                        flex justify-center items-center p-3 rounded-xl transition-all duration-200 group
                        ${isActive ? 'bg-emerald-600 shadow-lg shadow-emerald-900/40 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                    `}
                    title="My Farms"
                >
                    <Grid className="w-6 h-6" />
                </NavLink>

                <NavLink
                    to="/communications"
                    className={({ isActive }) => `
                        flex justify-center items-center p-3 rounded-xl transition-all duration-200 group
                        ${isActive ? 'bg-emerald-600 shadow-lg shadow-emerald-900/40 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                    `}
                    title="Centro de Comunicaciones SMS"
                >
                    <MessageCircle className="w-6 h-6" />
                </NavLink>

                <button
                    onClick={onToggleChat}
                    className={`
                        flex justify-center items-center p-3 rounded-xl transition-all duration-200 group
                        text-slate-400 hover:bg-white/5 hover:text-white
                    `}
                    title="AI Assistant"
                >
                    <MessageSquare className="w-6 h-6" />
                </button>

                <button
                    onClick={onOpenProfile}
                    className="flex justify-center items-center p-3 rounded-xl transition-all duration-200 group text-slate-400 hover:bg-white/5 hover:text-white"
                    title="Configuración de Perfil (Alertas SMS)"
                >
                    <User className="w-6 h-6" />
                </button>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="mt-auto p-3 text-slate-500 hover:text-red-400 transition-colors"
                title="Log Out"
            >
                <LogOut className="w-6 h-6" />
            </button>
        </div>
    );
};

export default Sidebar;
