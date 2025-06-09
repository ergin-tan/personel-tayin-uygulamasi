import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useNavigate } from 'react-router-dom'; 
import { isAdmin } from '../../utils/authUtils';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tc_kimlik_no: '',
    sicil_no: '',
    password: '',
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    unvan: 'zabitkatibi',
    mevcut_adliye_id: 1,
    aktif: true,
    isAdmin: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/personel-bilgileri');
    }
  }, [navigate]);

  const unvanlar = [
    { value: 'zabitkatibi', label: 'Zâbıt Katibi' },
    { value: 'yaziislerimuduru', label: 'Yazı İşleri Müdürü' },
    { value: 'mubasir', label: 'Mübaşir' },
    { value: 'diger', label: 'Diğer' }
  ];

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await API.post('/admin/personel', form);
      setIsLoading(false);
      alert('Personel kaydı başarılı!');
      navigate('/admin');
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu');
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>Personel Kayıt</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="form-group">
        <label htmlFor="tc_kimlik_no">TC Kimlik No</label>
        <input 
          id="tc_kimlik_no"
          name="tc_kimlik_no" 
          onChange={handleChange} 
          value={form.tc_kimlik_no}
          placeholder="TC Kimlik No" 
          required 
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="sicil_no">Sicil No</label>
        <input 
          id="sicil_no"
          name="sicil_no" 
          onChange={handleChange} 
          value={form.sicil_no}
          placeholder="Sicil No" 
          required 
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Şifre</label>
        <input 
          id="password"
          name="password" 
          type="password" 
          onChange={handleChange} 
          value={form.password}
          placeholder="Şifre" 
          required 
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="ad">Ad</label>
        <input 
          id="ad"
          name="ad" 
          onChange={handleChange} 
          value={form.ad}
          placeholder="Ad" 
          required 
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="soyad">Soyad</label>
        <input 
          id="soyad"
          name="soyad" 
          onChange={handleChange} 
          value={form.soyad}
          placeholder="Soyad" 
          required 
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input 
          id="email"
          name="email" 
          type="email"
          onChange={handleChange} 
          value={form.email}
          placeholder="Email" 
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="telefon">Telefon</label>
        <input 
          id="telefon"
          name="telefon" 
          onChange={handleChange} 
          value={form.telefon}
          placeholder="Telefon" 
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="unvan">Unvan</label>
        <select 
          id="unvan"
          name="unvan" 
          onChange={handleChange} 
          value={form.unvan}
          disabled={isLoading}
        >
          {unvanlar.map(unvan => (
            <option key={unvan.value} value={unvan.value}>
              {unvan.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="mevcut_adliye_id">Adliye ID</label>
        <input 
          id="mevcut_adliye_id"
          name="mevcut_adliye_id" 
          type="number"
          onChange={handleChange} 
          value={form.mevcut_adliye_id}
          placeholder="Adliye ID" 
          required 
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group checkbox-group">
        <label>
          <input 
            type="checkbox" 
            name="isAdmin" 
            checked={form.isAdmin} 
            onChange={handleChange} 
            disabled={isLoading}
          />
          Admin Yetkisi Ver
        </label>
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </form>
  );
};

export default RegisterForm;
