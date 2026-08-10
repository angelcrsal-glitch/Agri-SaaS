import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

const Login = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                navigate('/dashboard');
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
                <div className="text-center">
                    {/* You can replace this with an actual Logo Image if available */}
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        AgroSentinel
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to manage your precision agriculture data
                    </p>
                </div>
                <div className="mt-8">
                    <Auth
                        supabaseClient={supabase}
                        appearance={{ theme: ThemeSupa }}
                        theme="light"
                        providers={[]}
                    />
                    <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow transition duration-200"
                        >
                            Entrar en Modo Demo / Offline
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
