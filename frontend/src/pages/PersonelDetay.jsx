import React from 'react';
import { formatDate } from '../utils/dateUtils';
import './PersonelDetay.css';

const PersonelDetay = ({ personel, adliyeler }) => {
  const unvanDisplayName = (unvanKey) => {
    const unvanMap = {
      'yaziislerimuduru': 'Yazı İşleri Müdürü',
      'zabitkatibi': 'Zabıt Katibi',
      'mubasir': 'Mübaşir',
      'diger': 'Diğer'
    };
    return unvanMap[unvanKey] || unvanKey;
  };

  const getAdliyeAdi = (adliyeId) => {
    const adliye = adliyeler.find(a => a.id === adliyeId);
    return adliye ? adliye.adliye_adi : '-';
  };

  return (
    <div className="personel-detay">
      <h4>Personel Bilgileri</h4>
      <div className="bilgi-satiri">
        <strong>Ad Soyad:</strong>
        <span>{personel.ad} {personel.soyad}</span>
      </div>
      <div className="bilgi-satiri">
        <strong>Unvan:</strong>
        <span>{unvanDisplayName(personel.unvan)}</span>
      </div>
      <div className="bilgi-satiri">
        <strong>Email:</strong>
        <span>{personel.email || '-'}</span>
      </div>
      <div className="bilgi-satiri">
        <strong>Telefon:</strong>
        <span>{personel.telefon || '-'}</span>
      </div>
      <div className="bilgi-satiri">
        <strong>Adliye:</strong>
        <span>{getAdliyeAdi(personel.mevcut_adliye_id)}</span>
      </div>
      <div className="bilgi-satiri">
        <strong>İşe Başlama Tarihi:</strong>
        <span>{formatDate(personel.ise_baslama_tarihi)}</span>
      </div>
      <div className="bilgi-satiri">
        <strong>Mevcut Görev Başlangıcı:</strong>
        <span>{formatDate(personel.mevcut_gorevde_baslama_tarihi)}</span>
      </div>
      <div className="bilgi-satiri">
        <strong>Aktiflik:</strong>
        <span>{personel.aktif ? 'Aktif' : 'Pasif'}</span>
      </div>
    </div>
  );
};

export default PersonelDetay; 