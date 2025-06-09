import React, { useState, useEffect } from 'react';
import PersonelDetay from '../../pages/PersonelDetay';
import { validatePassword } from '../../utils/passwordUtils';
import { validateEmail } from '../../utils/validationUtils';
import PasswordStrengthMeter from '../PasswordStrengthMeter';
import PasswordRequirements from '../PasswordRequirements';
import { FaInfoCircle } from 'react-icons/fa';
import '../../styles/PasswordStrength.css';

const PersonelModal = ({ 
  showModal, 
  currentPersonel, 
  personelForm, 
  handlePersonelInputChange, 
  handlePersonelSubmit, 
  closePersonelModal, 
  loading, 
  adliyeler,
  unvanlar,
  unvanDisplayName,
  validationErrors
}) => {
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [telefonError, setTelefonError] = useState('');
  const [tcError, setTcError] = useState('');
  const [sicilError, setSicilError] = useState('');
  const [dateErrors, setDateErrors] = useState({
    ise_baslama_tarihi: '',
    mevcut_gorevde_baslama_tarihi: ''
  });
  
  useEffect(() => {
    setPasswordError('');
    setEmailError('');
    setTelefonError('');
    setTcError('');
    setSicilError('');
    setDateErrors({
      ise_baslama_tarihi: '',
      mevcut_gorevde_baslama_tarihi: ''
    });
  }, [showModal]);
  
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    
    if (value) {
      const validation = validatePassword(value);
      setPasswordError(validation.isValid ? '' : validation.message);
    } else {
      setPasswordError('');
    }
    
    handlePersonelInputChange(e);
  };
  
  const handleEmailChange = (e) => {
    const value = e.target.value;
    
    if (value) {
      const validation = validateEmail(value);
      setEmailError(validation.isValid ? '' : validation.message);
    } else {
      setEmailError('');
    }
    
    handlePersonelInputChange(e);
  };
  
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    
    const numericValue = value.replace(/\D/g, '').slice(0, 11);
    
    if (numericValue.length > 0 && numericValue.length !== 11) {
      setTelefonError('Telefon numarası 11 haneli olmalıdır');
    } else {
      setTelefonError('');
    }
    
    const syntheticEvent = {
      target: {
        name: e.target.name,
        value: numericValue
      }
    };
    
    handlePersonelInputChange(syntheticEvent);
  };
  
  const handleTcChange = (e) => {
    const value = e.target.value;
    
    const numericValue = value.replace(/\D/g, '').slice(0, 11);
    
    if (numericValue.length > 0 && numericValue.length !== 11) {
      setTcError('TC Kimlik No 11 haneli olmalıdır');
    } else {
      setTcError('');
    }
    
    const syntheticEvent = {
      target: {
        name: e.target.name,
        value: numericValue
      }
    };
    
    handlePersonelInputChange(syntheticEvent);
  };
  
  const handleSicilChange = (e) => {
    const value = e.target.value;
    
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    
    if (numericValue.length > 0 && numericValue.length !== 6) {
      setSicilError('Sicil No 6 haneli olmalıdır');
    } else {
      setSicilError('');
    }
    
    const syntheticEvent = {
      target: {
        name: e.target.name,
        value: numericValue
      }
    };
    
    handlePersonelInputChange(syntheticEvent);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    const today = new Date();
    const turkeyTime = new Date(today.getTime() + (3 * 60 * 60 * 1000));
    const todayStr = turkeyTime.toISOString().split('T')[0];
    
    if (value > todayStr) {
      setDateErrors(prev => ({
        ...prev,
        [name]: 'Gelecek tarih seçilemez'
      }));
    } else {
      setDateErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    handlePersonelInputChange(e);
  };
  
  if (!showModal) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <h3>{currentPersonel ? 'Personel Düzenle' : 'Yeni Personel Ekle'}</h3>
        {currentPersonel && (
          <PersonelDetay personel={currentPersonel} adliyeler={adliyeler} />
        )}
        <form onSubmit={handlePersonelSubmit}>
          <label>TC Kimlik No:
            <input 
              type="text" 
              name="tc_kimlik_no" 
              value={personelForm.tc_kimlik_no} 
              onChange={handleTcChange} 
              required 
              disabled={!!currentPersonel}
              maxLength="11"
              inputMode="numeric"
              placeholder="11 haneli TC Kimlik No" 
            />
            {tcError ? <span className="input-error">{tcError}</span> : 
             validationErrors?.tc_kimlik_no && <span className="input-error">{validationErrors.tc_kimlik_no}</span>}
          </label>
          <label>Sicil No:
            <input 
              type="text" 
              name="sicil_no" 
              value={personelForm.sicil_no} 
              onChange={handleSicilChange} 
              required 
              disabled={!!currentPersonel}
              maxLength="6"
              inputMode="numeric"
              placeholder="6 haneli Sicil No" 
            />
            {sicilError ? <span className="input-error">{sicilError}</span> : 
             validationErrors?.sicil_no && <span className="input-error">{validationErrors.sicil_no}</span>}
          </label>
          <label>
            Şifre {currentPersonel ? '(Değiştirmek için doldurun)' : '(Zorunlu)'}:
            <div className="password-tooltip">
              <FaInfoCircle className="tooltip-icon" />
              <span className="tooltip-text">
                Şifre en az 8 karakter uzunluğunda olmalı ve en az 1 büyük harf, 1 küçük harf, 
                1 rakam ve 1 özel karakter içermelidir.
              </span>
            </div>
            <input 
              type="password" 
              name="password" 
              value={personelForm.password} 
              onChange={handlePasswordChange}
              required={!currentPersonel}
            />
            {personelForm.password && (
              <>
                <PasswordStrengthMeter password={personelForm.password} />
                <PasswordRequirements password={personelForm.password} />
              </>
            )}
            {passwordError && <span className="input-error">{passwordError}</span>}
          </label>
          <label>Ad:
            <input type="text" name="ad" value={personelForm.ad} onChange={handlePersonelInputChange} required />
          </label>
          <label>Soyad:
            <input type="text" name="soyad" value={personelForm.soyad} onChange={handlePersonelInputChange} required />
          </label>
          <label>Email:
            <input 
              type="email" 
              name="email" 
              value={personelForm.email} 
              onChange={handleEmailChange}
              placeholder="ornek@adalet.gov.tr"
            />
            {emailError && <span className="input-error">{emailError}</span>}
          </label>
          <label>Telefon:
            <input 
              type="text" 
              name="telefon" 
              value={personelForm.telefon} 
              onChange={handlePhoneChange}
              maxLength="11"
              inputMode="numeric"
              placeholder="11 haneli Telefon No" 
            />
            {telefonError ? <span className="input-error">{telefonError}</span> : 
             validationErrors?.telefon && <span className="input-error">{validationErrors.telefon}</span>}
          </label>
          <label>Unvan:
            <select name="unvan" value={personelForm.unvan} onChange={handlePersonelInputChange} required>
              {unvanlar.map(u => (
                <option key={u} value={u}>
                  {unvanDisplayName(u)}
                </option>
              ))}
            </select>
          </label>
          <label>Mevcut Adliye:
            <select name="mevcut_adliye_id" value={personelForm.mevcut_adliye_id} onChange={handlePersonelInputChange} required>
              <option value="">Adliye Seçin</option>
              {adliyeler.map(ad => <option key={ad.id} value={ad.id}>{ad.adliye_adi}</option>)}
            </select>
          </label>
          <label>İşe Başlama Tarihi:
            <input 
              type="date" 
              name="ise_baslama_tarihi" 
              value={personelForm.ise_baslama_tarihi} 
              onChange={handleDateChange} 
              max={new Date().toISOString().split('T')[0]}
            />
            {dateErrors.ise_baslama_tarihi && <span className="input-error">{dateErrors.ise_baslama_tarihi}</span>}
          </label>
          <label>Mevcut Görevde Başlama Tarihi:
            <input 
              type="date" 
              name="mevcut_gorevde_baslama_tarihi" 
              value={personelForm.mevcut_gorevde_baslama_tarihi} 
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
            />
            {dateErrors.mevcut_gorevde_baslama_tarihi && <span className="input-error">{dateErrors.mevcut_gorevde_baslama_tarihi}</span>}
          </label>
          <label className="checkbox-label">
            <input type="checkbox" name="isAdmin" checked={personelForm.isAdmin} onChange={handlePersonelInputChange} />
            Admin Yetkisi Ver
          </label>
          <label className="checkbox-label">
            <input type="checkbox" name="aktif" checked={personelForm.aktif} onChange={handlePersonelInputChange} />
            Aktif
          </label>
          <div className="modal-actions">
            <button 
              type="submit" 
              disabled={loading || 
                (personelForm.password && !!passwordError) || 
                (!currentPersonel && !!passwordError) || 
                (personelForm.email && !!emailError) || 
                (personelForm.telefon && !!telefonError) ||
                (personelForm.tc_kimlik_no && !!tcError) ||
                (personelForm.sicil_no && !!sicilError) ||
                !!dateErrors.ise_baslama_tarihi ||
                !!dateErrors.mevcut_gorevde_baslama_tarihi} 
              className="btn"
            >
              {loading ? 'Kaydediliyor...' : (currentPersonel ? 'Güncelle' : 'Ekle')}
            </button>
            <button type="button" onClick={closePersonelModal} className="btn btn-secondary">İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonelModal; 