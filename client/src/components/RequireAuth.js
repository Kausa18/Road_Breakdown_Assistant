import React from 'react';
import { Navigate } from 'react-router-dom';

// This component protects routes based on login status and role
const RequireAuth = ({ role, children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but role does not match
  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  // Authorized
  return children;
};

export default RequireAuth;
