import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './TayinTaleplerim.css';
import { FaCalendarAlt, FaExchangeAlt, FaMapMarkerAlt, FaInfoCircle, FaTimesCircle, FaPlus, FaClipboardList, FaComment } from 'react-icons/fa';

const translateTayinTuru = (tayinTuru) => {
  const turMap = {
    'ogrenim': 'Öğrenim',
    'esdurumu': 'Eş Durumu',
    'saglik': 'Sağlık',
    'diger': 'Diğer'
  };
  return turMap[tayinTuru] || tayinTuru;
};

const DurumBadge = ({ durum }) => {
  const durumMap = {
    'onaylandi': 'Onaylandı',
    'reddedildi': 'Reddedildi',
    'beklemede': 'Beklemede',
    'incelemede': 'İncelemede',
    'inceleme': 'İncelemede',
    'iptal': 'İptal Edildi'
  };

  return (
    <span className={`durum-badge durum-${durum}`}>
      {durumMap[durum] || durum}
    </span>
  );
};

const TayinTaleplerim = () => {
  const navigate = useNavigate();
  const [talepler, setTalepler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchTalepler = async () => {
    try {
      const taleplerRes = await API.get('/tayin-talepleri');
      setTalepler(taleplerRes.data);
    } catch (err) {
      console.error('Tayin talepleri alınamadı:', err);
      setError('Tayin talepleri alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalepler();
  }, [navigate]);

  const handleCancel = async (talepId) => {
    if (!window.confirm('Tayin talebini iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await API.put(`/tayin-talepleri/${talepId}/iptal`);
      setMessage('Tayin talebi başarıyla iptal edildi.');
      fetchTalepler();
    } catch (err) {
      console.error('Tayin talebi iptal edilemedi:', err);
      setMessage('Tayin talebi iptal edilirken bir hata oluştu.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Talepler yükleniyor...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <FaInfoCircle size={24} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="tayin-taleplerim-container">
      <div className="page-header">
        <h2>Tayin Taleplerim</h2>
        <button 
          onClick={() => navigate('/yeni-talep')}
          className="btn-primary create-btn"
        >
          <FaPlus /> Yeni Talep Oluştur
        </button>
      </div>
      
      {message && (
        <div className="message-container">
          <div className="message">{message}</div>
          <button className="close-message" onClick={() => setMessage(null)}>×</button>
        </div>
      )}
      
      {talepler.length === 0 ? (
        <div className="no-data">
          <div className="no-data-icon">
            <FaClipboardList size={48} />
          </div>
          <h3>Henüz bir tayin talebiniz bulunmamaktadır.</h3>
          <p>Yeni bir tayin talebi oluşturmak için aşağıdaki butona tıklayabilirsiniz.</p>
          <button 
            onClick={() => navigate('/yeni-talep')}
            className="btn-primary"
          >
            <FaPlus /> Yeni Tayin Talebi Oluştur
          </button>
        </div>
      ) : (
        <div className="talep-list">
          {talepler.map((talep) => (
            <div key={talep.id} className="talep-item">
              <div className="talep-header">
                <div className="talep-date">
                  <FaCalendarAlt />
                  <span>{formatDate(talep.talep_tarihi)}</span>
                </div>
                <DurumBadge durum={talep.durum} />
              </div>
              
              <div className="talep-content">
                <div className="talep-type">
                  <span className="talep-type-badge">
                    <FaExchangeAlt /> {translateTayinTuru(talep.tayin_turu)}
                  </span>
                </div>
                
                <div className="talep-info">
                  <div className="location-info">
                    <div className="location-from">
                      <div className="location-label">Mevcut Adliye</div>
                      <div className="location-value">
                        <FaMapMarkerAlt />
                        <span>{`${talep.mevcut_adliye_adi} / ${talep.mevcut_il_adi}`}</span>
                      </div>
                    </div>
                    
                    <div className="location-arrow">
                      <FaExchangeAlt />
                    </div>
                    
                    <div className="location-to">
                      <div className="location-label">Talep Edilen Adliye</div>
                      <div className="location-value">
                        <FaMapMarkerAlt />
                        <span>{`${talep.talep_adliye_adi} / ${talep.talep_il_adi}`}</span>
                      </div>
                    </div>
                  </div>
                  
                  {talep.aciklama && (
                    <div className="talep-description">
                      <div className="description-icon">
                        <FaComment />
                      </div>
                      <div className="description-content">
                        <div className="description-label">Açıklama</div>
                        <div className="description-text">{talep.aciklama}</div>
                      </div>
                    </div>
                  )}
                  
                  {talep.karar_tarihi && (
                    <div className="talep-decision">
                      <div className="decision-header">
                        <FaInfoCircle /> Karar Bilgileri
                      </div>
                      <div className="decision-content">
                        <div className="decision-date">
                          <span className="decision-label">Karar Tarihi:</span>
                          <span className="decision-value">{formatDate(talep.karar_tarihi)}</span>
                        </div>
                        
                        {talep.karar_aciklamasi && (
                          <div className="decision-explanation">
                            <span className="decision-label">Karar Açıklaması:</span>
                            <span className="decision-value">{talep.karar_aciklamasi}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {talep.durum === 'beklemede' && (
                  <div className="talep-actions">
                    <button 
                      onClick={() => handleCancel(talep.id)}
                      className="btn-danger"
                    >
                      <FaTimesCircle /> İptal Et
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TayinTaleplerim;