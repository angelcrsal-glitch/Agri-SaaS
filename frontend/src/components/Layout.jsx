import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="flex h-screen w-screen bg-slate-950 overflow-hidden">
            <div className="flex-1 relative h-full w-full">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
