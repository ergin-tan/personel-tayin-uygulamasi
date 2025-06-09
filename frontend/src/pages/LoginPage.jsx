import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import './LoginPage.css';
import { FaArrowLeft, FaUser, FaLock } from 'react-icons/fa';

const LoginPage = () => {
  const navigate = useNavigate();

  const [sicilNo, setSicilNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (token) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/personel-bilgileri');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await API.post('/login', { sicil_no: sicilNo, password });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAdmin', response.data.isAdmin);

      setTimeout(() => {
        if (response.data.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/personel-bilgileri');
        }
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Giriş yapılamadı, lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <div className="login-logo">
          <div className="logo-icon">
            <FaUser size={32} />
          </div>
        </div>
        
        <div className="login-header">
          <h2>Adalet Bakanlığı</h2>
          <p className="login-subtitle">Personel Tayin Talebi Uygulaması</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="sicilNo">
            <FaUser className="input-icon" /> Sicil No
          </label>
          <input
            type="text"
            id="sicilNo"
            value={sicilNo}
            onChange={(e) => setSicilNo(e.target.value)}
            placeholder="Sicil Numaranızı girin"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            <FaLock className="input-icon" /> Şifre
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifrenizi girin"
            required
            disabled={isLoading}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button 
          type="submit" 
          className="btn" 
          disabled={isLoading}
        >
          {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
        
        <div className="login-footer">
          <Link to="/" className="back-to-home-btn">
            <FaArrowLeft /> Anasayfaya Dön
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;