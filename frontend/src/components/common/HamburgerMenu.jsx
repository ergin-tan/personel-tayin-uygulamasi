import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaExchangeAlt, FaPlus, FaSignOutAlt, FaUserShield, FaBuilding } from 'react-icons/fa';
import { isAdmin, logout } from '../../utils/authUtils';
import API from '../../api';

const HamburgerMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsAdminUser(isAdmin());
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await API.get('/personel/me');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

    useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      if (isOpen) {
        mainContent.classList.add('dimmed');
      } else {
        mainContent.classList.remove('dimmed');
      }
    }
    
    if (isOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <FaBuilding size={24} />
          <span>Adalet Bakanlığı</span>
        </div>
        
        <div className="sidebar-header">
          <div className="sidebar-avatar">
            <FaUser size={20} />
          </div>
          <div className="sidebar-user-info">
            {loading ? (
              <div className="sidebar-loading">Yükleniyor...</div>
            ) : user ? (
              <h3>{user.ad} {user.soyad}</h3>
            ) : (
              <h3>Kullanıcı</h3>
            )}
          </div>
        </div>
        
        <nav>
          <ul>
            {isAdminUser && (
              <li className={isActive('/admin')}>
                <Link to="/admin" onClick={handleLinkClick}>
                  <FaUserShield className="menu-icon-item" />
                  <span>Admin Paneli</span>
                </Link>
              </li>
            )}
            <li className={isActive('/personel-bilgileri')}>
              <Link to="/personel-bilgileri" onClick={handleLinkClick}>
                <FaUser className="menu-icon-item" />
                <span>Personel Bilgileri</span>
              </Link>
            </li>
            <li className={isActive('/tayin-taleplerim')}>
              <Link to="/tayin-taleplerim" onClick={handleLinkClick}>
                <FaExchangeAlt className="menu-icon-item" />
                <span>Tayin Taleplerim</span>
              </Link>
            </li>
            <li className={isActive('/yeni-talep')}>
              <Link to="/yeni-talep" onClick={handleLinkClick}>
                <FaPlus className="menu-icon-item" />
                <span>Tayin Talebi Oluştur</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="logout-button-container">
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt className="logout-icon" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>
      
      <button 
        className="toggle-sidebar-button" 
        onClick={toggleMenu}
        aria-label={isOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
        aria-expanded={isOpen}
        title={isOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
      >
        <span className="menu-icon">
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </span>
      </button>
      
      <div 
        className={`page-overlay ${isOpen ? 'active' : ''}`} 
        onClick={toggleMenu}
        role="button"
        tabIndex={-1}
        aria-label="Menüyü kapat"
      ></div>
    </>
  );
};

export default HamburgerMenu;