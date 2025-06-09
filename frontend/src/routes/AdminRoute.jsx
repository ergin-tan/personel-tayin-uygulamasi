import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isTokenValid, isAdmin } from '../utils/authUtils';

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const tokenValid = isTokenValid();
  const adminUser = isAdmin();

  if (!tokenValid) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!adminUser) {
    return <Navigate to="/personel-bilgileri" replace />;
  }

  return children;
};

export default AdminRoute;