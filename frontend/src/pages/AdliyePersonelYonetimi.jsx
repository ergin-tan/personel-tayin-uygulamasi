import React, { useState, useEffect } from 'react';
import API from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDate } from '../utils/dateUtils';

const AdliyePersonelYonetimi = () => {
  const [adliyeler, setAdliyeler] = useState([]);
  const [selectedAdliyeId, setSelectedAdliyeId] = useState('');
  const [personelListesi, setPersonelListesi] = useState([]);
  const [filteredPersonelListesi, setFilteredPersonelListesi] = useState([]);
  const [loadingAdliyeler, setLoadingAdliyeler] = useState(true);
  const [loadingPersonel, setLoadingPersonel] = useState(false);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    unvan: '',
    aktif: '',
    searchTerm: '',
    isTypingSearch: true
  });
  
  const [delayedSearchTerm, setDelayedSearchTerm] = useState('');

  const unvanDisplayName = (unvanKey) => {
    const unvanMap = {
      'yaziislerimuduru': 'Yazı İşleri Müdürü',
      'zabitkatibi': 'Zâbıt Katibi',
      'mubasir': 'Mübaşir',
      'diger': 'Diğer'
    };
    return unvanMap[unvanKey] || unvanKey;
  };
  
  const unvanlar = ['yaziislerimuduru', 'zabitkatibi', 'mubasir', 'diger'];

  useEffect(() => {
    const fetchAdliyeler = async () => {
      setLoadingAdliyeler(true);
      try {
        const response = await API.get('/adliyeler');
        setAdliyeler(response.data);
      } catch (err) {
        console.error('Adliyeleri çekerken hata:', err);
        setError('Adliyeler yüklenirken bir hata oluştu.');
        toast.error('Adliyeler yüklenemedi!');
      } finally {
        setLoadingAdliyeler(false);
      }
    };
    fetchAdliyeler();
  }, []);

  useEffect(() => {
    const fetchPersonelByAdliye = async () => {
      if (!selectedAdliyeId) {
        setLoadingPersonel(true);
        setError(null);
        try {
          const response = await API.get('/admin/personel');
          const personelWithAdliye = response.data.map(personel => ({
            ...personel,
            adliye_adi: adliyeler.find(a => a.id === personel.mevcut_adliye_id)?.adliye_adi || '-'
          }));
          setPersonelListesi(personelWithAdliye);
          setFilteredPersonelListesi(personelWithAdliye);
        } catch (err) {
          console.error('Tüm personel listesini çekerken hata:', err);
          setError('Personel listesi yüklenirken bir hata oluştu.');
          toast.error('Personel listesi yüklenemedi!');
          setPersonelListesi([]);
          setFilteredPersonelListesi([]);
        } finally {
          setLoadingPersonel(false);
        }
        return;
      }

      setLoadingPersonel(true);
      setError(null);
      try {
        const response = await API.get(`/admin/adliyeler/${selectedAdliyeId}/personel`);
        const selectedAdliye = adliyeler.find(a => a.id === parseInt(selectedAdliyeId));
        const personelWithAdliye = response.data.map(personel => ({
          ...personel,
          adliye_adi: selectedAdliye?.adliye_adi || '-'
        }));
        setPersonelListesi(personelWithAdliye);
        setFilteredPersonelListesi(personelWithAdliye);
      } catch (err) {
        console.error(`Personel listesini çekerken hata (Adliye ID: ${selectedAdliyeId}):`, err);
        setError('Personel listesi yüklenirken bir hata oluştu.');
        toast.error('Personel listesi yüklenemedi!');
        setPersonelListesi([]);
        setFilteredPersonelListesi([]);
      } finally {
        setLoadingPersonel(false);
      }
    };

    if (!loadingAdliyeler) {
      fetchPersonelByAdliye();
    }
  }, [selectedAdliyeId, adliyeler, loadingAdliyeler]);
  
  useEffect(() => {
    const filterPersonel = () => {
      let filtered = [...personelListesi];
      
      if (filters.unvan) {
        filtered = filtered.filter(p => p.unvan === filters.unvan);
      }
      
      if (filters.aktif !== '') {
        const aktifDurum = filters.aktif === 'true';
        filtered = filtered.filter(p => p.aktif === aktifDurum);
      }

      const searchTerm = filters.isTypingSearch 
        ? filters.searchTerm 
        : delayedSearchTerm;
      
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(p => {
          const fullName = `${p.ad || ''} ${p.soyad || ''}`.toLowerCase();
          
          return p.tc_kimlik_no?.toLowerCase().includes(lowerSearchTerm) ||
            p.sicil_no?.toLowerCase().includes(lowerSearchTerm) ||
            p.ad?.toLowerCase().includes(lowerSearchTerm) ||
            p.soyad?.toLowerCase().includes(lowerSearchTerm) ||
            p.email?.toLowerCase().includes(lowerSearchTerm) ||
            fullName.includes(lowerSearchTerm);
        });
      }
      
      setFilteredPersonelListesi(filtered);
    };
    
    filterPersonel();
  }, [personelListesi, filters, delayedSearchTerm]);

  const handleAdliyeChange = (e) => {
    setSelectedAdliyeId(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'searchTerm') {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
      
      if (filters.isTypingSearch) {
        setDelayedSearchTerm('');
      }
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSearch = () => {
    setDelayedSearchTerm(filters.searchTerm);
  };
  
  const toggleRealtimeSearch = () => {
    setFilters(prev => {
      const newIsTypingSearch = !prev.isTypingSearch;
      
      if (newIsTypingSearch) {
        setDelayedSearchTerm('');
      }
      
      return {
        ...prev,
        isTypingSearch: newIsTypingSearch
      };
    });
  };
  
  const resetFilters = () => {
    setFilters({
      unvan: '',
      aktif: '',
      searchTerm: '',
      isTypingSearch: true
    });
    setDelayedSearchTerm('');
  };

  return (
    <div className="adliye-personel-yonetimi">
      <div className="filters">
        <select
          value={selectedAdliyeId}
          onChange={handleAdliyeChange}
          className="adliye-select"
        >
          <option value="">Tüm Adliyeler</option>
          {adliyeler.map(adliye => (
              <option key={adliye.id} value={adliye.id}>
              {adliye.adliye_adi}
              </option>
          ))}
        </select>
      </div>

      {loadingPersonel ? (
        <div>Yükleniyor...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div>
          <div className="filter-container">
            <div className="filter-row">
              <div className="filter-group">
                <label>Unvan:</label>
                <select 
                  name="unvan" 
                  value={filters.unvan} 
                  onChange={handleFilterChange}
                >
                  <option value="">Tümü</option>
                  {unvanlar.map(unvan => (
                    <option key={unvan} value={unvan}>{unvanDisplayName(unvan)}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Durum:</label>
                <select 
                  name="aktif" 
                  value={filters.aktif} 
                  onChange={handleFilterChange}
                >
                  <option value="">Tümü</option>
                  <option value="true">Aktif</option>
                  <option value="false">Pasif</option>
                </select>
              </div>
              
              <div className="filter-group search-group">
                <label>Ara:</label>
                <div className="search-input-container">
                  <input 
                    type="text" 
                    name="searchTerm" 
                    value={filters.searchTerm} 
                    onChange={handleFilterChange}
                    placeholder="TC, Sicil No, Ad Soyad, Email ara..." 
                  />
                </div>
              </div>
            </div>
            
            <div className="buttons-row">
              <div className="buttons-container">
                <button onClick={handleSearch} className="btn search-btn">ARA</button>
                <button onClick={resetFilters} className="btn btn-secondary">Filtreleri Temizle</button>
              </div>
            </div>
            
            <div className="search-options-row">
              <div className="search-options-container" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <div className="search-options" style={{ marginRight: '15px' }}>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={filters.isTypingSearch} 
                      onChange={toggleRealtimeSearch} 
                    />
                    <span>Yazdıkça ara</span>
                  </label>
                </div>
                
                <div className="filter-info">
                  {filteredPersonelListesi.length} personel listeleniyor (toplam {personelListesi.length})
                </div>
              </div>
            </div>
          </div>
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>TC Kimlik No</th>
                  <th>Sicil No</th>
                  <th>Ad Soyad</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Unvan</th>
                  <th>Adliye</th>
                  <th>İşe Başlama</th>
                  <th>Mevcut Görevde Başlama</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonelListesi.map(p => (
                  <tr key={p.id}>
                    <td>{p.tc_kimlik_no}</td>
                    <td>{p.sicil_no}</td>
                    <td>{`${p.ad} ${p.soyad}`}</td>
                    <td>{p.email || '-'}</td>
                    <td>{p.telefon || '-'}</td>
                    <td>{unvanDisplayName(p.unvan)}</td>
                    <td>{p.adliye_adi}</td>
                    <td>{formatDate(p.ise_baslama_tarihi)}</td>
                    <td>{formatDate(p.mevcut_gorevde_baslama_tarihi)}</td>
                    <td>{p.aktif ? 'Aktif' : 'Pasif'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdliyePersonelYonetimi;