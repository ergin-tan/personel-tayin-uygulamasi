import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import { isTokenValid } from '../../utils/authUtils';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isTokenValid()) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <>
      <HamburgerMenu />
      <div className="main-content">
        {children}
      </div>
    </>
  );
};

export default Layout;