import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Shield, Mail, Edit2, Save, X, Phone, Building } from 'lucide-react';
import { toast } from 'sonner';
import AlertsPanel from '../components/Profile/AlertsPanel';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Profile form state
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        company_name: ''
    });

    useEffect(() => {
        const getProfile = async () => {
            try {
                // 1. Get Auth User
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) throw authError || new Error('No user');
                setUser(user);

                // 2. Get Profile Data
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') {
                    console.error('Error fetching profile:', profileError);
                }

                // 3. Set Form Data (Merge profile data or default to empty)
                if (profile) {
                    setFormData({
                        full_name: profile.full_name || '',
                        phone: profile.phone || '',
                        company_name: profile.company_name || ''
                    });
                } else {
                    // Fallback to metadata if no profile row exists yet
                    setFormData({
                        full_name: user.user_metadata?.full_name || '',
                        phone: '',
                        company_name: ''
                    });
                }

            } catch (error) {
                console.error('Error loading profile:', error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        getProfile();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/login');
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Error logging out');
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const updates = {
                id: user.id,
                full_name: formData.full_name,
                phone: formData.phone,
                company_name: formData.company_name,
                // created_at is automatic on insert, updated_at could be added
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;

            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="h-full w-full flex items-center justify-center bg-slate-950 text-white">Loading...</div>;
    }

    // Determine role
    const role = user?.app_metadata?.role || 'USER';
    const isAdmin = role.toUpperCase() === 'ADMIN';

    return (
        <div className="flex h-full w-full">
            <Sidebar />
            <div className="flex-1 h-full w-full bg-slate-950 flex flex-col md:flex-row items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto">
                <div className="w-full max-w-lg bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden shrink-0 mt-20 md:mt-0">

                    {/* Background Decor */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

                    <div className="relative flex flex-col items-center text-center">

                        {/* Header & Avatar */}
                        <div
                            className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-950 flex items-center justify-center mb-6 shadow-xl relative group cursor-pointer"
                            onClick={() => setIsEditing(true)}
                        >
                            <span className="text-3xl font-bold text-emerald-500">
                                {formData.full_name ? formData.full_name[0].toUpperCase() : (user?.email?.[0].toUpperCase() || 'U')}
                            </span>
                            {/* Edit Overlay Hint */}
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 className="text-white w-6 h-6" />
                            </div>
                        </div>

                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest border mb-2 flex items-center gap-2 ${isAdmin ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                            <Shield className="w-3 h-3" />
                            {role.toUpperCase()}
                        </div>

                        <h2 className="text-xl font-bold text-white mb-6">
                            {formData.full_name || 'AgriSaaS User'}
                        </h2>


                        {/* Action Header */}
                        <div className="w-full flex items-center justify-between mb-4 mt-2">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Profile Details</h3>
                            <button
                                onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                                className="text-xs text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1 transition-colors"
                            >
                                {isEditing ? (
                                    <>
                                        <X className="w-3 h-3" /> Cancel
                                    </>
                                ) : (
                                    <>
                                        <Edit2 className="w-3 h-3" /> Edit
                                    </>
                                )}
                            </button>
                        </div>

                        {/* FORM/DISPLAY AREA */}
                        <div className="w-full space-y-4 mb-8 text-left">

                            {/* Email (Read Only) */}
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                <label className="text-xs text-slate-500 font-bold mb-1 block">EMAIL ACCOUNT</label>
                                <div className="flex items-center gap-3 text-slate-300">
                                    <Mail className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm font-mono">{user?.email}</span>
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                <label className="text-xs text-slate-500 font-bold mb-1 block">FULL NAME</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.full_name || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none transition-all"
                                        placeholder="Enter full name"
                                        autoFocus
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 text-slate-200">
                                        <User className="w-4 h-4 text-emerald-500" />
                                        <span className={`text-sm ${!formData.full_name && 'text-slate-600 italic'}`}>
                                            {formData.full_name || 'Not set'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                <label className="text-xs text-slate-500 font-bold mb-1 block">PHONE NUMBER</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none transition-all"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 text-slate-200">
                                        <Phone className="w-4 h-4 text-emerald-500" />
                                        <span className={`text-sm ${!formData.phone && 'text-slate-600 italic'}`}>
                                            {formData.phone || 'Not set'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Company */}
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                <label className="text-xs text-slate-500 font-bold mb-1 block">COMPANY / FARM NAME</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.company_name || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none transition-all"
                                        placeholder="e.g. Green Valley Farms"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 text-slate-200">
                                        <Building className="w-4 h-4 text-emerald-500" />
                                        <span className={`text-sm ${!formData.company_name && 'text-slate-600 italic'}`}>
                                            {formData.company_name || 'Not set'}
                                        </span>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Actions */}
                        {isEditing ? (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-emerald-900/20"
                            >
                                {saving ? (
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
                            >
                                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                Sign Out
                            </button>
                        )}

                        <p className="text-[10px] text-slate-600 mt-6">
                            Member since {new Date(user?.created_at).getFullYear()}
                        </p>
                    </div>
                </div>
                
                {/* Right Side: Alerts Panel */}
                <div className="w-full max-w-lg md:ml-4 mt-6 md:mt-0 flex flex-col items-start justify-start">
                    <AlertsPanel user={user} />
                </div>
            </div>
        </div>
    );
};

export default Profile;
