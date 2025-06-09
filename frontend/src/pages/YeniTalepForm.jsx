import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './YeniTalepForm.css';

const TayinTalebiForm = () => {
  const [tayinTuru, setTayinTuru] = useState('ogrenim');
  const [adliyeId, setAdliyeId] = useState('');
  const [adliyeler, setAdliyeler] = useState([]);
  const [aciklama, setAciklama] = useState('');
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mevcutTalepler, setMevcutTalepler] = useState([]);
  const navigate = useNavigate();

  const [currentUsersAdliyeId, setCurrentUsersAdliyeId] = useState(null); 
  
  const MAX_ACIKLAMA_LENGTH = 300;

  const tayinTurleri = [
    { value: 'ogrenim', label: 'Öğrenim' },
    { value: 'esdurumu', label: 'Eş Durumu' },
    { value: 'saglik', label: 'Sağlık' },
    { value: 'diger', label: 'Diğer' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adliyelerResponse = await API.get('/adliyeler');
        setAdliyeler(adliyelerResponse.data);

        const taleplerResponse = await API.get('/tayin-talepleri');
        setMevcutTalepler(taleplerResponse.data);

        const storedAdliyeId = localStorage.getItem('userCurrentAdliyeId');
        if (storedAdliyeId) {
          setCurrentUsersAdliyeId(parseInt(storedAdliyeId));
        }
      } catch (error) {
        console.error('Veri çekerken hata oluştu:', error);
        setMessage('Veriler yüklenirken bir sorun oluştu.');
        setIsError(true);
      }
    };

    fetchData();
  }, []);

  const handleTayinTuruChange = (e) => {
    const yeniTayinTuru = e.target.value;
    setTayinTuru(yeniTayinTuru);
    setMessage(null);
    setIsError(false);
  };

  const handleAciklamaChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_ACIKLAMA_LENGTH) {
      setAciklama(text);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    if (['ogrenim', 'esdurumu', 'saglik'].includes(tayinTuru)) {
      const aktifTalepler = mevcutTalepler.filter(talep => 
        ['beklemede', 'inceleme', 'incelemede'].includes(talep.durum)
      );

      const ayniTurdeTalep = aktifTalepler.find(talep => 
        talep.tayin_turu === tayinTuru
      );

      //tür kontrol
      if (ayniTurdeTalep) {
        const turAdi = tayinTurleri.find(tur => tur.value === tayinTuru)?.label;
        setMessage(`${turAdi} türünde bekleyen veya incelemede olan bir tayin talebiniz zaten var. Yeni talep oluşturamazsınız.`);
        setIsError(true);
        setLoading(false);
        return;
      }
    }

    //adliye kontrol
    if (currentUsersAdliyeId !== null && parseInt(adliyeId) === currentUsersAdliyeId) {
      setMessage('Bulunduğunuz adliyeye tayin talebinde bulunamazsınız.');
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      await API.post('/tayin-talepleri', {
        tayin_turu: tayinTuru,
        aciklama: aciklama,
        talep_adliye_id: parseInt(adliyeId)
      });

      setMessage('Tayin talebi başarıyla oluşturuldu.');
      setIsError(false);
      setTayinTuru('ogrenim');
      setAciklama('');
      setAdliyeId('');

      setTimeout(() => {
        navigate('/tayin-taleplerim');
      }, 1500);
    } catch (err) {
      console.error('Tayin talebi oluşturulurken hata:', err);
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else if (err.response?.data?.error) {
        setMessage(err.response.data.error);
      } else if (err.message) {
        setMessage(`Bir hata oluştu: ${err.message}`);
      } else {
        setMessage('Tayin talebi oluşturulurken beklenmeyen bir hata oluştu.');
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="yeni-talep-form-container">
        <h2>Yeni Tayin Talebi Oluştur</h2>

        {message && (
          <p className={isError ? 'error-message' : 'success-message'}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="tayinTuru">Tayin Türü:</label>
            <select
              id="tayinTuru"
              value={tayinTuru}
              onChange={handleTayinTuruChange}
              required
              disabled={loading}
            >
              {tayinTurleri.map(tur => (
                <option key={tur.value} value={tur.value}>
                  {tur.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="adliye">Adliye Seçin:</label>
            <select
              id="adliye"
              value={adliyeId}
              onChange={(e) => setAdliyeId(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Bir adliye seçin</option>
              {adliyeler.map((adliye) => (
                <option key={adliye.id} value={adliye.id}>
                  {adliye.adliye_adi}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="aciklama">Açıklama:</label>
            <textarea
              id="aciklama"
              value={aciklama}
              onChange={handleAciklamaChange}
              rows={4}
              placeholder="İsterseniz açıklama ekleyebilirsiniz..."
              disabled={loading}
              maxLength={MAX_ACIKLAMA_LENGTH}
            />
            <div className="character-counter">
              {aciklama.length}/{MAX_ACIKLAMA_LENGTH} karakter
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Gönderiliyor...' : 'Oluştur'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TayinTalebiForm;