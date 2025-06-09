-- Veritabanı şeması

-- Enum tipleri
CREATE TYPE unvan_tipi AS ENUM ('yaziislerimuduru', 'zabitkatibi', 'mubasir', 'diger');
CREATE TYPE tayin_turu_tipi AS ENUM ('ogrenim', 'esdurumu', 'saglik', 'diger');
CREATE TYPE durum_tipi AS ENUM ('beklemede', 'inceleme', 'onaylandi', 'reddedildi', 'iptal');

-- İller tablosu
CREATE TABLE IF NOT EXISTS iller (
    id SERIAL PRIMARY KEY,
    il_adi VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adliyeler tablosu
CREATE TABLE IF NOT EXISTS adliyeler (
    id SERIAL PRIMARY KEY,
    adliye_adi VARCHAR(100) NOT NULL,
    il_id INTEGER NOT NULL REFERENCES iller(id),
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personel tablosu
CREATE TABLE IF NOT EXISTS personel (
    id SERIAL PRIMARY KEY,
    tc_kimlik_no CHAR(11) UNIQUE NOT NULL,
    sicil_no VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    ad VARCHAR(50) NOT NULL,
    soyad VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefon VARCHAR(15),
    unvan unvan_tipi NOT NULL,
    mevcut_adliye_id INTEGER NOT NULL REFERENCES adliyeler(id),
    ise_baslama_tarihi DATE,
    mevcut_gorevde_baslama_tarihi DATE,
    isadmin BOOLEAN DEFAULT FALSE,
    aktif BOOLEAN DEFAULT TRUE,
    isdeleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tayin talepleri tablosu
CREATE TABLE IF NOT EXISTS tayin_talepleri (
    id SERIAL PRIMARY KEY,
    personel_id INTEGER NOT NULL REFERENCES personel(id),
    tayin_turu tayin_turu_tipi NOT NULL,
    aciklama TEXT,
    talep_adliye_id INTEGER NOT NULL REFERENCES adliyeler(id),
    mevcut_adliye_id INTEGER NOT NULL REFERENCES adliyeler(id),
    durum durum_tipi DEFAULT 'beklemede',
    talep_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    karar_tarihi TIMESTAMP,
    karar_aciklamasi TEXT,
    karar_veren_id INTEGER REFERENCES personel(id),
    isdeleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Güncelleme tetikleyicisi için fonksiyon
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tetikleyiciler
CREATE TRIGGER update_personel_updated_at BEFORE UPDATE ON personel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adliyeler_updated_at BEFORE UPDATE ON adliyeler
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tayin_talepleri_updated_at BEFORE UPDATE ON tayin_talepleri
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- İndeksler
CREATE INDEX idx_personel_sicil_no ON personel(sicil_no);
CREATE INDEX idx_personel_tc_kimlik ON personel(tc_kimlik_no);
CREATE INDEX idx_personel_mevcut_adliye ON personel(mevcut_adliye_id);
CREATE INDEX idx_personel_isdeleted ON personel(isdeleted);
CREATE INDEX idx_tayin_talepleri_personel ON tayin_talepleri(personel_id);
CREATE INDEX idx_tayin_talepleri_tarih ON tayin_talepleri(talep_tarihi);
CREATE INDEX idx_tayin_talepleri_durum ON tayin_talepleri(durum);
CREATE INDEX idx_tayin_talepleri_isdeleted ON tayin_talepleri(isdeleted);
CREATE INDEX idx_adliyeler_il ON adliyeler(il_id);

-- Örnek veri: İller
INSERT INTO iller (il_adi, created_at) VALUES
('Adana', CURRENT_TIMESTAMP), 
('Adıyaman', CURRENT_TIMESTAMP), 
('Afyonkarahisar', CURRENT_TIMESTAMP), 
('Ağrı', CURRENT_TIMESTAMP), 
('Amasya', CURRENT_TIMESTAMP), 
('Ankara', CURRENT_TIMESTAMP), 
('Antalya', CURRENT_TIMESTAMP), 
('Artvin', CURRENT_TIMESTAMP), 
('Aydın', CURRENT_TIMESTAMP), 
('Balıkesir', CURRENT_TIMESTAMP),
('Bilecik', CURRENT_TIMESTAMP), 
('Bingöl', CURRENT_TIMESTAMP), 
('Bitlis', CURRENT_TIMESTAMP), 
('Bolu', CURRENT_TIMESTAMP), 
('Burdur', CURRENT_TIMESTAMP),
('Bursa', CURRENT_TIMESTAMP), 
('Çanakkale', CURRENT_TIMESTAMP), 
('Çankırı', CURRENT_TIMESTAMP), 
('Çorum', CURRENT_TIMESTAMP), 
('Denizli', CURRENT_TIMESTAMP),
('Diyarbakır', CURRENT_TIMESTAMP), 
('Edirne', CURRENT_TIMESTAMP), 
('Elazığ', CURRENT_TIMESTAMP), 
('Erzincan', CURRENT_TIMESTAMP), 
('Erzurum', CURRENT_TIMESTAMP),
('Eskişehir', CURRENT_TIMESTAMP), 
('Gaziantep', CURRENT_TIMESTAMP), 
('Giresun', CURRENT_TIMESTAMP), 
('Gümüşhane', CURRENT_TIMESTAMP), 
('Hakkari', CURRENT_TIMESTAMP),
('Hatay', CURRENT_TIMESTAMP), 
('Isparta', CURRENT_TIMESTAMP), 
('Mersin', CURRENT_TIMESTAMP), 
('İstanbul', CURRENT_TIMESTAMP), 
('İzmir', CURRENT_TIMESTAMP),
('Kars', CURRENT_TIMESTAMP), 
('Kastamonu', CURRENT_TIMESTAMP), 
('Kayseri', CURRENT_TIMESTAMP), 
('Kırklareli', CURRENT_TIMESTAMP), 
('Kırşehir', CURRENT_TIMESTAMP),
('Kocaeli', CURRENT_TIMESTAMP), 
('Konya', CURRENT_TIMESTAMP), 
('Kütahya', CURRENT_TIMESTAMP), 
('Malatya', CURRENT_TIMESTAMP), 
('Manisa', CURRENT_TIMESTAMP),
('Kahramanmaraş', CURRENT_TIMESTAMP), 
('Mardin', CURRENT_TIMESTAMP), 
('Muğla', CURRENT_TIMESTAMP), 
('Muş', CURRENT_TIMESTAMP), 
('Nevşehir', CURRENT_TIMESTAMP),
('Niğde', CURRENT_TIMESTAMP), 
('Ordu', CURRENT_TIMESTAMP), 
('Rize', CURRENT_TIMESTAMP), 
('Sakarya', CURRENT_TIMESTAMP), 
('Samsun', CURRENT_TIMESTAMP),
('Siirt', CURRENT_TIMESTAMP), 
('Sinop', CURRENT_TIMESTAMP), 
('Sivas', CURRENT_TIMESTAMP), 
('Tekirdağ', CURRENT_TIMESTAMP), 
('Tokat', CURRENT_TIMESTAMP),
('Trabzon', CURRENT_TIMESTAMP), 
('Tunceli', CURRENT_TIMESTAMP), 
('Şanlıurfa', CURRENT_TIMESTAMP), 
('Uşak', CURRENT_TIMESTAMP), 
('Van', CURRENT_TIMESTAMP),
('Yozgat', CURRENT_TIMESTAMP), 
('Zonguldak', CURRENT_TIMESTAMP), 
('Aksaray', CURRENT_TIMESTAMP), 
('Bayburt', CURRENT_TIMESTAMP), 
('Karaman', CURRENT_TIMESTAMP),
('Kırıkkale', CURRENT_TIMESTAMP), 
('Batman', CURRENT_TIMESTAMP), 
('Şırnak', CURRENT_TIMESTAMP), 
('Bartın', CURRENT_TIMESTAMP), 
('Ardahan', CURRENT_TIMESTAMP),
('Iğdır', CURRENT_TIMESTAMP), 
('Yalova', CURRENT_TIMESTAMP), 
('Karabük', CURRENT_TIMESTAMP), 
('Kilis', CURRENT_TIMESTAMP), 
('Osmaniye', CURRENT_TIMESTAMP), 
('Düzce', CURRENT_TIMESTAMP);

-- Her il için adliye ekle
INSERT INTO adliyeler (il_id, adliye_adi)
SELECT 
    id,
    il_adi || ' Adliyesi'
FROM 
    iller
WHERE 
    id NOT IN (SELECT il_id FROM adliyeler);

-- Örnek Personel Verileri
-- Admin (123456): admin
-- Diğer personel: Yeni_sifre123

INSERT INTO personel (
    tc_kimlik_no,
    sicil_no,
    password_hash,
    ad,
    soyad,
    email,
    telefon,
    unvan,
    mevcut_adliye_id,
    ise_baslama_tarihi,
    mevcut_gorevde_baslama_tarihi,
    isadmin,
    aktif,
    isdeleted
) VALUES 
-- Admin personel
(
    '12345678901',
    '123456',
    '$2b$10$Fp6g2Ht2TSC4yNRdB/Rz1OvLSAU0DAIONYJzYPulXQlpImBepyDwW',
    'Ahmet',
    'Yılmaz',
    'admin@adalet.gov.tr',
    '05551234567',
    'yaziislerimuduru',
    1, -- Adana Adliyesi
    '2020-01-01',
    '2020-01-01',
    true,
    true,
    false
),
-- Normal personeller
(
    '12345678902',
    '234567',
    '$2b$10$./9QkRFsVpl7vzGuxb8EdO8fMipRpGRK9OftZz468NZrzgTXvFktm',
    'Mehmet',
    'Kaya',
    'mehmet.kaya@adalet.gov.tr',
    '05551234568',
    'zabitkatibi',
    6, -- Ankara Adliyesi
    '2020-02-15',
    '2020-02-15',
    false,
    true,
    false
),
(
    '12345678903',
    '345678',
    '$2b$10$./9QkRFsVpl7vzGuxb8EdO8fMipRpGRK9OftZz468NZrzgTXvFktm',
    'Ayşe',
    'Demir',
    'ayse.demir@adalet.gov.tr',
    '05551234569',
    'zabitkatibi',
    34, -- İstanbul Adliyesi
    '2020-03-20',
    '2020-03-20',
    false,
    true,
    false
),
(
    '12345678904',
    '456789',
    '$2b$10$./9QkRFsVpl7vzGuxb8EdO8fMipRpGRK9OftZz468NZrzgTXvFktm',
    'Fatma',
    'Şahin',
    'fatma.sahin@adalet.gov.tr',
    '05551234570',
    'mubasir',
    35, -- İzmir Adliyesi
    '2020-04-10',
    '2020-04-10',
    false,
    true,
    false
),
(
    '12345678905',
    '567890',
    '$2b$10$./9QkRFsVpl7vzGuxb8EdO8fMipRpGRK9OftZz468NZrzgTXvFktm', 
    'Ali',
    'Öztürk',
    'ali.ozturk@adalet.gov.tr',
    '05551234571',
    'zabitkatibi',
    16, -- Bursa Adliyesi
    '2020-05-05',
    '2020-05-05',
    false,
    true,
    false
),
(
    '12345678906',
    '678901',
    '$2b$10$./9QkRFsVpl7vzGuxb8EdO8fMipRpGRK9OftZz468NZrzgTXvFktm', 
    'Zeynep',
    'Çelik',
    'zeynep.celik@adalet.gov.tr',
    '05551234572',
    'yaziislerimuduru',
    42, -- Konya Adliyesi
    '2020-06-15',
    '2020-06-15',
    false,
    true,
    false
),
(
    '12345678907',
    '789012',
    '$2b$10$./9QkRFsVpl7vzGuxb8EdO8fMipRpGRK9OftZz468NZrzgTXvFktm', 
    'Mustafa',
    'Arslan',
    'mustafa.arslan@adalet.gov.tr',
    '05551234573',
    'mubasir',
    27, -- Gaziantep Adliyesi
    '2020-07-20',
    '2020-07-20',
    false,
    true,
    false
),
(
    '12345678908',
    '890123',
    '$2b$10$./9QkRFsVpl7vzGuxb8EdO8fMipRpGRK9OftZz468NZrzgTXvFktm', 
    'Emine',
    'Yıldız',
    'emine.yildiz@adalet.gov.tr',
    '05551234574',
    'zabitkatibi',
    31, -- Hatay Adliyesi
    '2020-08-10',
    '2020-08-10',
    false,
    true,
    false
),
(
    '12345678909',
    '901234',
    '$2b$10$./9QkRFsVpl7vzGuxb8EdO8fMipRpGRK9OftZz468NZrzgTXvFktm', 
    'Hüseyin',
    'Aydın',
    'huseyin.aydin@adalet.gov.tr',
    '05551234575',
    'diger',
    21, -- Diyarbakır Adliyesi
    '2020-09-01',
    '2020-09-01',
    false,
    true,
    false
),
(
    '12345678910',
    '012345',
    '$2b$10$./9QkRFsVpl7vzGuxb8EdO8fMipRpGRK9OftZz468NZrzgTXvFktm', 
    'Hatice',
    'Yılmaz',
    'hatice.yilmaz@adalet.gov.tr',
    '05551234576',
    'zabitkatibi',
    25, -- Erzurum Adliyesi
    '2020-10-15',
    '2020-10-15',
    false,
    true,
    false
);