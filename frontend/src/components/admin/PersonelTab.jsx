import React from 'react';
import { formatDate } from '../../utils/dateUtils';

const PersonelTab = ({
  personelFilters,
  handlePersonelFilterChange,
  resetPersonelFilters,
  filteredPersonelList,
  personelList,
  adliyeler,
  unvanlar,
  unvanDisplayName,
  openAddPersonelModal,
  openEditPersonelModal,
  handleDeletePersonel,
  handlePersonelSearch,
  togglePersonelRealtimeSearch,
  handleRestorePersonel,
  toggleShowDeletedPersonel
}) => {
  return (
    <div>
      <button onClick={openAddPersonelModal} className="btn add-personel-btn">Yeni Personel Ekle</button>
      
      <div className="filter-container">
        <div className="filter-row">
          <div className="filter-group">
            <label>Adliye:</label>
            <select 
              name="adliye" 
              value={personelFilters.adliye} 
              onChange={handlePersonelFilterChange}
            >
              <option value="">Tümü</option>
              {adliyeler.map(adliye => (
                <option key={adliye.id} value={adliye.id}>{adliye.adliye_adi}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Unvan:</label>
            <select 
              name="unvan" 
              value={personelFilters.unvan} 
              onChange={handlePersonelFilterChange}
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
              value={personelFilters.aktif} 
              onChange={handlePersonelFilterChange}
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
                value={personelFilters.searchTerm} 
                onChange={handlePersonelFilterChange}
                placeholder="TC, Sicil No, Ad Soyad, Email ara..." 
              />
            </div>
          </div>
        </div>
        
        <div className="buttons-row">
          <div className="buttons-container">
            <button onClick={handlePersonelSearch} className="btn search-btn">ARA</button>
            <button onClick={resetPersonelFilters} className="btn btn-secondary">Filtreleri Temizle</button>
          </div>
        </div>
        
        <div className="search-options-row">
          <div className="search-options-container">
            <div className="search-options">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={personelFilters.isTypingSearch} 
                  onChange={togglePersonelRealtimeSearch} 
                />
                <span>Yazdıkça ara</span>
              </label>
              <label className="checkbox-label" style={{ marginLeft: '20px' }}>
                <input 
                  type="checkbox" 
                  name="showDeleted"
                  checked={personelFilters.showDeleted} 
                  onChange={toggleShowDeletedPersonel} 
                />
                <span>Silinen Kayıtları Göster</span>
              </label>
            </div>
            
            <div className="filter-info">
              {filteredPersonelList.length} personel listeleniyor (toplam {personelList.length})
            </div>
          </div>
        </div>
      </div>
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>TCK No</th>
              <th>Sicil No</th>
              <th>Ad Soyad</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Unvan</th>
              <th>Adliye</th>
              <th>İşe Başlama</th>
              <th>Mevcut Görev Başlangıcı</th>
              <th>Admin</th>
              <th>Aktif</th>
              <th>Kayıt Durumu</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredPersonelList.map((p) => (
              <tr key={p.id} className={p.isdeleted ? 'deleted-row' : ''}>
                <td>{p.tc_kimlik_no}</td>
                <td>{p.sicil_no}</td>
                <td>{`${p.ad} ${p.soyad}`}</td>
                <td>{p.email || '-'}</td>
                <td>{p.telefon || '-'}</td>
                <td>{unvanDisplayName(p.unvan)}</td>
                <td>{adliyeler.find(a => a.id === p.mevcut_adliye_id)?.adliye_adi || '-'}</td>
                <td>{formatDate(p.ise_baslama_tarihi)}</td>
                <td>{formatDate(p.mevcut_gorevde_baslama_tarihi)}</td>
                <td>{p.isadmin ? 'Evet' : 'Hayır'}</td>
                <td>{p.aktif ? 'Evet' : 'Hayır'}</td>
                <td>{p.isdeleted ? 'Silinmiş' : 'Kayıtlı'}</td>
                <td>
                  <button onClick={() => openEditPersonelModal(p)} className="btn btn-secondary btn-small">Düzenle</button>
                  {p.isdeleted ? (
                    <button onClick={() => handleRestorePersonel(p.id)} className="btn btn-success btn-small">Geri Yükle</button>
                  ) : (
                    <button onClick={() => handleDeletePersonel(p.id)} className="btn btn-danger btn-small">Sil</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PersonelTab; 