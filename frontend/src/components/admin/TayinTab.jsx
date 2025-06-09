import React from 'react';
import { formatDateTime } from '../../utils/dateUtils';

const TayinTab = ({
  tayinFilters,
  handleTayinFilterChange,
  resetTayinFilters,
  filteredTayinTalepleriList,
  tayinTalepleriList,
  adliyeler,
  tayinDurumlari,
  tayinTurleri,
  translateDurum,
  translateTayinTuru,
  openEditTayinModal,
  handleDeleteTayin,
  handleTayinSearch,
  toggleTayinRealtimeSearch,
  handleRestoreTayin,
  toggleShowDeletedTayin
}) => {
  return (
    <div>
      <div className="filter-container">
        <div className="filter-row">
          <div className="filter-group">
            <label>Durum:</label>
            <select 
              name="durum" 
              value={tayinFilters.durum} 
              onChange={handleTayinFilterChange}
            >
              <option value="">Tümü</option>
              {tayinDurumlari.map(durum => (
                <option key={durum} value={durum}>{translateDurum(durum)}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Talep Türü:</label>
            <select 
              name="talep_turu" 
              value={tayinFilters.talep_turu} 
              onChange={handleTayinFilterChange}
            >
              <option value="">Tümü</option>
              {tayinTurleri.map(tur => (
                <option key={tur} value={tur}>{translateTayinTuru(tur)}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Talep Edilen Adliye:</label>
            <select 
              name="talep_edilen_adliye" 
              value={tayinFilters.talep_edilen_adliye} 
              onChange={handleTayinFilterChange}
            >
              <option value="">Tümü</option>
              {adliyeler.map(adliye => (
                <option key={adliye.id} value={adliye.id}>{adliye.adliye_adi}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group search-group">
            <label>Ara:</label>
            <div className="search-input-container">
              <input 
                type="text" 
                name="searchTerm" 
                value={tayinFilters.searchTerm} 
                onChange={handleTayinFilterChange}
                placeholder="Personel Adı Soyadı, Sicil No ara..." 
              />
            </div>
          </div>
        </div>
        
        <div className="buttons-row">
          <div className="buttons-container">
            <button onClick={handleTayinSearch} className="btn search-btn">ARA</button>
            <button onClick={resetTayinFilters} className="btn btn-secondary">Filtreleri Temizle</button>
          </div>
        </div>
        
        <div className="search-options-row">
          <div className="search-options-container">
            <div className="search-options">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={tayinFilters.isTypingSearch} 
                  onChange={toggleTayinRealtimeSearch} 
                />
                <span>Yazdıkça ara</span>
              </label>
              <label className="checkbox-label" style={{ marginLeft: '20px' }}>
                <input 
                  type="checkbox" 
                  name="showDeleted"
                  checked={tayinFilters.showDeleted} 
                  onChange={toggleShowDeletedTayin} 
                />
                <span>Silinen Kayıtları Göster</span>
              </label>
            </div>
            
            <div className="filter-info">
              {filteredTayinTalepleriList.length} tayin talebi listeleniyor (toplam {tayinTalepleriList.length})
            </div>
          </div>
        </div>
      </div>
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Personel</th>
              <th>Sicil No</th>
              <th>Talep Türü</th>
              <th>Talep Edilen Adliye</th>
              <th>Mevcut Adliye</th>
              <th>Talep Tarihi</th>
              <th>Durum</th>
              <th>Açıklama</th>
              <th>Karar Açıklaması</th>
              <th>Karar Tarihi</th>
              <th>Kayıt Durumu</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredTayinTalepleriList.map((t) => (
              <tr key={t.id} className={t.isdeleted ? 'deleted-row' : ''}>
                <td>{t.id}</td>
                <td>{`${t.personel_ad} ${t.personel_soyad}`}</td>
                <td>{t.sicil_no}</td>
                <td>{translateTayinTuru(t.tayin_turu)}</td>
                <td>{t.talep_edilen_adliye_adi}</td>
                <td>{t.talep_anindaki_mevcut_adliye_adi}</td>
                <td>{formatDateTime(t.talep_tarihi)}</td>
                <td>
                  <span className={`status-badge status-${t.durum}`}>
                    {translateDurum(t.durum)}
                  </span>
                </td>
                <td>{t.aciklama || '-'}</td>
                <td>{t.karar_aciklamasi || '-'}</td>
                <td>{formatDateTime(t.karar_tarihi)}</td>
                <td>{t.isdeleted ? 'Silinmiş' : 'Kayıtlı'}</td>
                <td>
                  <button onClick={() => openEditTayinModal(t)} className="btn btn-secondary btn-small">İncele/Güncelle</button>
                  {t.isdeleted ? (
                    <button onClick={() => handleRestoreTayin(t.id)} className="btn btn-success btn-small">Geri Yükle</button>
                  ) : (
                    <button onClick={() => handleDeleteTayin(t.id)} className="btn btn-danger btn-small">Sil</button>
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

export default TayinTab; 