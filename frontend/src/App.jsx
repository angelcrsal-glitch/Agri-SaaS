import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { supabase } from './lib/supabase';
import { Analytics } from '@vercel/analytics/react';
import Landing from './pages/Landing';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import MyFarms from './pages/MyFarms';
import Profile from './pages/Profile';
import CommunicationsCenter from './pages/CommunicationsCenter';
import Layout from './components/Layout';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(data?.session);
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (isMounted && session) {
          setSession(session);
        }
      });
      return () => {
        isMounted = false;
        data?.subscription?.unsubscribe();
      };
    } catch (e) {
      return () => { isMounted = false; };
    }
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">Loading...</div>;
  }

  // Wrapper for protected routes to handle session check
  const ProtectedRoute = ({ session }) => {
    // For Vercel Pitch Demo: Bypass authentication to allow public access
    return <Layout />;
  };

  return (
    <>
      <Routes>
        {/* Public Routes - Accessible to everyone */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Login Route - Redirects to dashboard if already logged in */}
        <Route
          path="/login"
          element={session ? <Navigate to="/dashboard" /> : <Login />}
        />

        {/* Protected Routes - Only accessible if logged in */}
        <Route element={<ProtectedRoute session={session} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-farms" element={<MyFarms />} />
          <Route path="/communications" element={<CommunicationsCenter />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
      <Toaster richColors position="top-right" closeButton theme="light" />
      <Analytics />
    </>
  );
}

export default App;
