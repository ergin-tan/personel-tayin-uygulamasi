import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isTokenValid } from '../utils/authUtils';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const tokenValid = isTokenValid();

  return tokenValid ? children : <Navigate to="/login" state={{ from: location.pathname }} replace />;
};

export default PrivateRoute;
