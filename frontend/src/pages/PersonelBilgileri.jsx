import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './PersonelBilgileri.css';
import '../styles/PasswordStrength.css';
import { formatDate } from '../utils/dateUtils';
import { validatePassword } from '../utils/passwordUtils';
import { validateEmail, validatePhone } from '../utils/validationUtils';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import PasswordRequirements from '../components/PasswordRequirements';
import { FaEdit, FaUser, FaEnvelope, FaPhone, FaBuilding, FaCalendarAlt, FaUserTie, FaInfoCircle } from 'react-icons/fa';

const unvanDisplayName = (unvanKey) => {
  const unvanMap = {
    'yaziislerimuduru': 'Yazı İşleri Müdürü',
    'zabitkatibi': 'Zâbıt Katibi',
    'mubasir': 'Mübaşir',
    'diger': 'Diğer'
  };
  return unvanMap[unvanKey] || unvanKey;
};

const PersonelBilgileri = () => {
  const navigate = useNavigate();
  const [personel, setPersonel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [form, setForm] = useState({ password: '', email: '', telefon: '' });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [telefonError, setTelefonError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const personelRes = await API.get('/personel/me');
        setPersonel(personelRes.data);
      } catch (err) {
        console.error('Personel bilgileri alınamadı:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefon') {
      const onlyNumbers = value.replace(/[^0-9]/g, '');
      const limitedValue = onlyNumbers.slice(0, 11);
      
      if (limitedValue && limitedValue.length > 0 && limitedValue.length !== 11) {
        setTelefonError('Telefon numarası 11 haneli olmalıdır');
      } else {
        setTelefonError('');
      }
      
      setForm(prev => ({ ...prev, [name]: limitedValue }));
    } else if (name === 'password') {
      setForm(prev => ({ ...prev, [name]: value }));
      
      if (value) {
        const validation = validatePassword(value);
        setPasswordError(validation.isValid ? '' : validation.message);
      } else {
        setPasswordError('');
      }
    } else if (name === 'email') {
      setForm(prev => ({ ...prev, [name]: value }));
      
      if (value) {
        const validation = validateEmail(value);
        console.log('Email validation for:', value, 'Result:', validation);
        setEmailError(validation.isValid ? '' : validation.message);
      } else {
        setEmailError('');
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateMessage(null);

    if (!form.password && !form.email && !form.telefon) {
      setUpdateMessage('En az bir alanı doldurmalısınız.');
      setIsError(true);
      setUpdateLoading(false);
      return;
    }
    
    if (form.telefon && form.telefon.trim() !== '') {
      if (form.telefon.length !== 11) {
        setUpdateMessage('Telefon numarası 11 haneli olmalıdır');
        setIsError(true);
        setUpdateLoading(false);
        return;
      }
      
      const phoneValidation = validatePhone(form.telefon);
      if (!phoneValidation.isValid) {
        setUpdateMessage(phoneValidation.message);
        setIsError(true);
        setUpdateLoading(false);
        return;
      }
    }
    
    if (form.email) {
      const emailValidation = validateEmail(form.email);
      console.log('Submit email validation for:', form.email, 'Result:', emailValidation);
      if (!emailValidation.isValid) {
        setUpdateMessage(emailValidation.message);
        setIsError(true);
        setUpdateLoading(false);
        return;
      }
    }
    
    if (form.password) {
      const validation = validatePassword(form.password);
      if (!validation.isValid) {
        setUpdateMessage('Şifre gereksinimleri karşılanmıyor: ' + validation.message);
        setIsError(true);
        setUpdateLoading(false);
        return;
      }
    }

    try {
      await API.put('/personel/me', form);
      setPersonel((prev) => ({
        ...prev,
        ...(form.email && { email: form.email }),
        ...(form.telefon && { telefon: form.telefon })
      }));
      setUpdateMessage('Profil başarıyla güncellendi.');
      setIsError(false);
      setForm({ password: '', email: '', telefon: '' });
      setTelefonError('');
      setPasswordError('');
      setEmailError('');
    } catch (err) {
      console.error('Profil güncelleme hatası:', err);
      setUpdateMessage(err.response?.data?.message || 'Profil güncellenirken hata oluştu.');
      setIsError(true);
    } finally {
      setUpdateLoading(false);
    }
  };

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (!isFormVisible) {
      setUpdateMessage(null);
      setForm({ password: '', email: '', telefon: '' });
      setTelefonError('');
      setPasswordError('');
      setEmailError('');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Bilgiler yükleniyor...</p>
      </div>
    );
  }
  
  if (!personel) return <div className="error-container">Kullanıcı bilgisi bulunamadı</div>;

  return (
    <div className="personel-bilgileri-container">
      <h2>Personel Bilgileri</h2>
      
      <div className="personel-info">
        <div className="personel-header">
          <div className="personel-avatar">
            <FaUser size={32} />
          </div>
          <div className="personel-name">
            <h3>{`${personel.ad} ${personel.soyad}`}</h3>
            <span className="personel-title">{unvanDisplayName(personel.unvan)}</span>
          </div>
        </div>
        
        <div className="personel-details">
          <div className="info-card">
            <div className="info-card-icon">
              <FaEnvelope />
            </div>
            <div className="info-card-content">
              <span className="info-card-label">Email</span>
              <span className="info-card-value">{personel.email || '-'}</span>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-card-icon">
              <FaPhone />
            </div>
            <div className="info-card-content">
              <span className="info-card-label">Telefon</span>
              <span className="info-card-value">{personel.telefon || '-'}</span>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-card-icon">
              <FaBuilding />
            </div>
            <div className="info-card-content">
              <span className="info-card-label">Adliye</span>
              <span className="info-card-value">{`${personel.mevcut_adliye_adi || '-'} / ${personel.mevcut_il_adi || '-'}`}</span>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-card-icon">
              <FaCalendarAlt />
            </div>
            <div className="info-card-content">
              <span className="info-card-label">İşe Başlama Tarihi</span>
              <span className="info-card-value">{formatDate(personel.ise_baslama_tarihi)}</span>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-card-icon">
              <FaCalendarAlt />
            </div>
            <div className="info-card-content">
              <span className="info-card-label">Mevcut Görev Başlangıcı</span>
              <span className="info-card-value">{formatDate(personel.mevcut_gorevde_baslama_tarihi)}</span>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-card-icon">
              <FaUserTie />
            </div>
            <div className="info-card-content">
              <span className="info-card-label">Aktiflik</span>
              <span className="info-card-value status-badge">{personel.aktif ? 'Aktif' : 'Pasif'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="update-section">
        <div className="update-header" onClick={toggleForm}>
          <h3>
            <FaEdit style={{ marginRight: '10px', flexShrink: 0 }} />
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>Profil Güncelle</span>
          </h3>
          <button 
            type="button" 
            className={`toggle-button ${isFormVisible ? 'active' : ''}`}
            aria-label={isFormVisible ? 'Formu gizle' : 'Formu göster'}
          >
            {isFormVisible ? '▲' : '▼'}
          </button>
        </div>
        
        {isFormVisible && (
          <form onSubmit={handleSubmit} className="personel-update-form">
            <div className="form-group">
              <label htmlFor="password">
                Yeni Şifre
                <div className="password-tooltip">
                  <FaInfoCircle className="tooltip-icon" />
                  <span className="tooltip-text">
                    Şifre en az 8 karakter uzunluğunda olmalı ve en az 1 büyük harf, 1 küçük harf, 
                    1 rakam ve 1 özel karakter içermelidir.
                  </span>
                </div>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Yeni şifre girin"
              />
              {form.password && (
                <>
                  <PasswordStrengthMeter password={form.password} />
                  <PasswordRequirements password={form.password} />
                </>
              )}
              {passwordError && <span className="input-error">{passwordError}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email adresinizi girin"
              />
              {emailError && <span className="input-error">{emailError}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="telefon">Telefon</label>
              <input
                id="telefon"
                name="telefon"
                type="text"
                value={form.telefon}
                onChange={handleChange}
                placeholder="Telefon numaranızı girin (11 haneli)"
                inputMode="numeric"
              />
              {telefonError && <span className="input-error">{telefonError}</span>}
            </div>
            
            {updateMessage && (
              <div className={`message ${isError ? 'error' : 'success'}`}>
                {updateMessage}
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="submit" 
                disabled={updateLoading || !!passwordError || !!telefonError || !!emailError}
                className="btn"
              >
                {updateLoading ? 'Güncelleniyor...' : 'Güncelle'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PersonelBilgileri;