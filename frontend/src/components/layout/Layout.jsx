import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Navbar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;