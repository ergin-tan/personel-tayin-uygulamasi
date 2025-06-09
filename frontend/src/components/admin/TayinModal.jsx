import React from 'react';
import { formatDateTime } from '../../utils/dateUtils';

const TayinModal = ({
  showModal,
  currentTayinTalebi,
  tayinForm,
  handleTayinInputChange,
  handleTayinSubmit,
  closeTayinModal,
  loading,
  tayinDurumlari,
  translateDurum,
  translateTayinTuru
}) => {
  if (!showModal || !currentTayinTalebi) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <h3>Tayin Talebi Durumu Güncelle</h3>
        <div className="talep-detaylari">
          <p><strong>Personel:</strong> {currentTayinTalebi.personel_ad} {currentTayinTalebi.personel_soyad} ({currentTayinTalebi.sicil_no})</p>
          <p><strong>Talep Türü:</strong> {translateTayinTuru(currentTayinTalebi.tayin_turu)}</p>
          <p><strong>Talep Edilen Adliye:</strong> {currentTayinTalebi.talep_edilen_adliye_adi}</p>
          <p><strong>Mevcut Adliye:</strong> {currentTayinTalebi.talep_anindaki_mevcut_adliye_adi || '-'}</p>
          <p><strong>Açıklama:</strong> {currentTayinTalebi.aciklama || '-'}</p>
          <p><strong>Talep Tarihi:</strong> {formatDateTime(currentTayinTalebi.talep_tarihi)}</p>
        </div>
        <form onSubmit={handleTayinSubmit}>
          <label>Durum:
            <select name="durum" value={tayinForm.durum} onChange={handleTayinInputChange} required>
              {tayinDurumlari.map(d => <option key={d} value={d}>{translateDurum(d)}</option>)}
            </select>
          </label>
          {(tayinForm.durum === 'reddedildi' || tayinForm.durum === 'onaylandi') && (
            <label>Karar Açıklaması:
              <textarea
                name="karar_aciklamasi"
                value={tayinForm.karar_aciklamasi}
                onChange={handleTayinInputChange}
                rows="3"
                placeholder={tayinForm.durum === 'onaylandi' 
                  ? "Talebin onaylanma nedenini girin..." 
                  : "Talebin reddedilme nedenini girin..."}
                required
              ></textarea>
            </label>
          )}
          <div className="modal-actions">
            <button type="submit" disabled={loading} className="btn">
              {loading ? 'Kaydediliyor...' : 'Güncelle'}
            </button>
            <button type="button" onClick={closeTayinModal} className="btn btn-secondary">İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TayinModal; 