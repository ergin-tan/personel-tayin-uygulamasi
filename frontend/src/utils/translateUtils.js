export const translateTayinTuru = (tayinTuru) => {
  const turMap = {
    'ogrenim': 'Öğrenim',
    'esdurumu': 'Eş Durumu',
    'saglik': 'Sağlık',
    'diger': 'Diğer'
  };
  return turMap[tayinTuru] || tayinTuru;
};

export const translateDurum = (durum) => {
  switch (durum) {
    case 'beklemede': return 'Beklemede';
    case 'incelemede': return 'İncelemede';
    case 'inceleme': return 'İncelemede';
    case 'onaylandi': return 'Onaylandı';
    case 'reddedildi': return 'Reddedildi';
    case 'iptal': return 'İptal Edildi';
    default: return durum;
  }
};

export const unvanDisplayName = (unvanKey) => {
  switch (unvanKey) {
    case 'yaziislerimuduru': return 'Yazı İşleri Müdürü';
    case 'zabitkatibi': return 'Zâbıt Katibi';
    case 'mubasir': return 'Mübaşir';
    case 'diger': return 'Diğer';
    default: return unvanKey;
  }
}; 