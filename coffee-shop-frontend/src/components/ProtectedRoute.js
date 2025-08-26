import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, userInfo }) => {
    if (!userInfo) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them back after login.
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;
