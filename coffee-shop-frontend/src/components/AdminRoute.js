import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children, isAdmin, authLoading }) => {
    // If we are still checking for a token, show a loading screen
    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl text-white">Loading...</div>
            </div>
        );
    }

    // If the check is complete and the user is not an admin, redirect
    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    // If the check is complete and the user is an admin, show the page
    return children;
};

export default AdminRoute;
