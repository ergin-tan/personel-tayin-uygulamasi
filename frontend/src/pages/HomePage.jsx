import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { FaUserLock, FaNewspaper, FaExchangeAlt, FaArrowRight } from 'react-icons/fa';

const HomePage = () => {
  const navigate = useNavigate();

  const haberler = [
    { 
      id: 1, 
      title: 'Personel Tayin Sistemi güncellendi ve yenilendi!', 
      date: '01.06.2025',
      description: 'Yeni arayüz ve geliştirilmiş özelliklerle sistemimiz daha kullanıcı dostu hale getirildi.'
    },
    { 
      id: 2, 
      title: 'Yeni tayin talep dönemi başladı, detayları inceleyin.', 
      date: '25.05.2025',
      description: 'Yeni dönem tayin talepleri için son başvuru tarihi 30 Haziran 2025.'
    },
  ];

  const features = [
    {
      icon: <FaUserLock />,
      title: 'Güvenli Erişim',
      description: 'SSL şifrelemesi ile korunan güvenli personel bilgi sistemi.'
    },
    {
      icon: <FaExchangeAlt />,
      title: 'Tayin İşlemleri',
      description: 'Hızlı ve kolay tayin talep süreci.'
    },
    {
      icon: <FaNewspaper />,
      title: 'Anlık Bilgilendirme',
      description: 'Tayin süreciniz hakkında güncel bilgiler.'
    }
  ];

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

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1>T.C. Adalet Bakanlığı</h1>
          <h2>Personel Tayin Talebi Uygulaması</h2>
          <p className="subtitle">
            Kurum içi tayin ve personel bilgileri yönetimi için resmi platformumuza hoş geldiniz.
          </p>
          <div className="login-button-container">
            <button
              onClick={handleLoginClick}
              className="login-btn"
              type="button"
            >
              Giriş Yap <FaArrowRight style={{ marginLeft: '8px' }} />
            </button>
          </div>
        </div>
      </header>

      <section className="news-section">
        <h2>Güncel Duyurular</h2>
        <div className="news-grid">
          {haberler.map(haber => (
            <div key={haber.id} className="news-card">
              <div className="news-content">
                <h3>{haber.title}</h3>
                <p>{haber.description}</p>
                <span className="news-date">{haber.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="features-section">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </section>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} T.C. Adalet Bakanlığı. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default HomePage;