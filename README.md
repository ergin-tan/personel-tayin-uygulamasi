# Personel Tayin Sistemi

Bu proje, adliye personelinin tayin taleplerini yönetmek için geliştirilmiş bir web uygulamasıdır. Personel bilgilerini, tayin taleplerini ve adliye bilgilerini yönetmeyi sağlar.

## Özellikler

- **Kullanıcı Yetkilendirme**: Personel ve admin kullanıcılar için farklı yetkilendirme seviyeleri
- **Personel Yönetimi**: Personel bilgilerinin eklenmesi, düzenlenmesi ve görüntülenmesi
- **Tayin Talepleri**: Personelin tayin taleplerini oluşturması ve takip etmesi
- **Admin Paneli**: Tüm personel ve tayin taleplerinin yönetimi
- **Gelişmiş Filtreleme**: 
  - Personel listesinde adliye, unvan, durum ve metin araması ile filtreleme
  - Tayin taleplerinde durum, talep türü, talep edilen adliye ve personel bilgisi ile filtreleme
- **Kullanıcı Arayüzü**: Modern ve kullanıcı dostu tasarım, kolay kullanım ve akıcı ekran geçişleri
- **Loglama Sistemi**: Sistem aktivitelerinin detaylı loglanması ve görüntülenmesi
- **Responsive Tasarım**: Mobil cihazlar dahil tüm ekran boyutlarına uygun tasarım

## Teknolojiler

### Frontend
- React.js
- CSS
- Axios (API istekleri için)

### Backend
- Node.js
- Express.js
- PostgreSQL (Veritabanı)
- JWT (Kimlik doğrulama)

## Kurulum

### 1. DEVELOPMENT KURULUMU

#### Gereksinimler
- Docker

#### Docker ile Kurulum 

Bu yöntem, tüm gerekli servisleri (PostgreSQL, pgAdmin) otomatik olarak kurar ve development ortamı için yapılandırır.

1. Docker ve Docker Compose'un kurulu olduğundan emin olun:

```bash
docker --version
docker-compose --version # veya docker compose version
```


2. Proje dizinine gidin:

```bash
cd personel-tayin-uygulamasi
```


3. Environment dosyalarını hazırlayın

- `backend` klasöründe bulunan env.example dosyasının ismini .env olarak değiştirin ve aşağıdaki değeri güçlü bir SecretKey ile güncelleyin :

    ```bash
    JWT_SECRET=GucluBirJWTSecret
    ```

- `frontend` klasöründe bulunan env.example dosyasının ismini .env olarak değiştirin ve aşağıdaki değeri ilgili domain ile güncelleyin :

    ```bash
    REACT_APP_API_URL=http://localhost:3001/api
    ```

4. Projeyi build edin

    ```bash
    sudo bash build_docker_images.sh
    ```

5. `dockerforlocal` klasöründeki Docker Compose dosyasını kullanarak servisleri başlatın:

    ```bash
    cd dockerforlocal
    docker-compose up -d # veya docker compose up -d
    ```

6. PostgreSQL, pgAdmin servislerinin ve projenin başlatıldığını kontrol edin:

    ```bash
    docker ps
    docker logs -f personeltayin
    ```

> **Not**: env.example dosyası Docker kurulumuna göre yapılandırılmıştır. Eğer farklı bir kurulum kullanıyorsanız, .env dosyasını ve docker compose dosyasını buna göre düzenlemeniz gerekir.

7. Tarayıcınızda `http://localhost:3000` adresine giderek uygulamayı görüntüleyebilirsiniz.

8. pgAdmin'e erişmek için tarayıcınızda `http://localhost:5050` adresini ziyaret edin ve aşağıdaki bilgilerle giriş yapın:
    - Email: admin@pg.com
    - Şifre: admin123

9. pgAdmin'de yeni bir sunucu bağlantısı ekleyin:
    - Sağ tıklayın: "Servers" > "Create" > "Server..."
    - "General" sekmesinde bir ad girin (örn: "Personel Tayin DB")
    - "Connection" sekmesinde:
      - Host: postgres (Docker Compose servis adı)
      - Port: 5432
      - Database: personeltayindb
      - Username: admin
      - Password: admin123


### 2. PRODUCTION KURULUMU

### Gereksinimler 
Ubuntu Noble 24.04 Sunucu içerisine : 
- Docker
- Nginx
- Certbot

kurulmalıdır.

[Docker kurulumu](https://docs.docker.com/engine/install/ubuntu/)

#### Nginx ve Certbot kurulumu için :
```bash
sudo apt update && sudo apt install nginx certbot python3-certbot-nginx -y
```

## Proje kurulumu

### 1. Projeyi klonlayın

```bash
git clone https://github.com/ergin-tan/personel-tayin-uygulamasi.git
cd personel-tayin-uygulamasi
```

### 2. Environment dosyalarını hazırlayın

- `backend` klasöründe bulunan env.example dosyasının ismini .env olarak değiştirin ve aşağıdaki değeri güçlü bir SecretKey ile güncelleyin :

    ```bash
    JWT_SECRET=GucluBirJWTSecret
    ```

- `frontend` klasöründe bulunan env.example dosyasının ismini .env olarak değiştirin ve aşağıdaki değeri ilgili domain ile güncelleyin :

    ```bash
    REACT_APP_API_URL=https://ornekdomain.com/api
    ```

### 3. Projeyi build edin

```bash
sudo bash build_docker_images.sh
```

### 4. Nginx ve Certbot konfigürasyonunu yapın

```bash
# HTTPS için Certbot ile SSL sertifikası alın
sudo certbot --nginx -d ornekdomain.com
# Nginx ile reverse proxy yapmak için konfigürasyonu düzenleyip ilgili dizine kopyalayın ve etkinleştirmek için sembolik link'i oluşturun
sudo cp ornekdomain.com.conf /etc/nginx/sites-available/ornekdomain.com.conf
sudo ln -s /etc/nginx/sites-available/ornekdomain.com.conf /etc/nginx/sites-enabled/
# Default konfigürayonu silin
sudo rm /etc/nginx/sites-enabled/default
# Nginx konfigürasyonunu test edin
sudo nginx -t
# "test is successful" cevabı alınmışsa Nginx'i yeniden başlatın
sudo systemctl reload nginx # veya sudo systemctl restart nginx
```

### 5. Projeyi çalıştırın

Projenin ana dizinine gidin ve aşağıdaki komut ile projeyi çalıştırın :  
```bash
docker compose up -d
```

## Projeyi durdurmak veya yeniden başlatmak

Aşağıdaki komut ile projeyi durdurabilirsiniz : 

```bash
docker compose down
```

Eğer tüm verilerin silinmesini istiyorsanız ve temiz çalıştırma yapmak istiyorsanız aşağıdaki komutu çalıştırabilirsiniz : 


```bash
docker compose down -v #Başlatmak için tekrar `docker compose up -d` komutunu kullanabilirsiniz
```

## Güvenlik için yapılması gerekenler

### İlgili portların erişime açık bırakılması

Eğer sunucunun ağ trafiği güvenlik duvarı ile filtrelenmiyorsa, portların kontrolsüz biçimde açık olması önemli güvenlik risklerine yol açabilir.

Sadece aşağıdaki portların açık olması, projenin çalışabilmesi için yeterlidir : 

```
443 HTTPS
80 HTTP
22 SSH (Eğer sunucuya SSH ile bağlanılıyorsa gereklidir)
```

### JWTSECRET

`.env` içerisindeki JWTSECRET Key'in karmaşık ve tahmin edilemez olması gerekmektedir. Böylelikle JWT Auth sisteminde güvenlik açığı oluşmaz. 

---

## Kullanım

### Personel Girişi

1. Ana sayfada "Giriş Yap" butonuna tıklayın
2. Sicil numaranızı ve şifrenizi girin
3. Giriş yaptıktan sonra kişisel bilgilerinizi görüntüleyebilir ve tayin talebi oluşturabilirsiniz

#### Admin Hesabı Kullanımı

Veritabanı kurulumu tamamlandıktan sonra, database.sql dosyasında otomatik olarak bir admin hesabı oluşturulur:

- **Sicil No**: 123456
- **Şifre**: admin
- **TC Kimlik No**: 12345678901
- **Email**: admin@adalet.gov.tr

Bu bilgilerle giriş yaparak admin paneline erişebilirsiniz.


### Admin Paneli

1. Admin hesabıyla giriş yapın
2. Admin panelinde şu işlemleri yapabilirsiniz:
   - Personel yönetimi (ekleme, düzenleme, silme)
   - Tayin taleplerini yönetme (onaylama, reddetme)
   - Adliye bazlı personel listelerini görüntüleme
   - Sistem loglarını görüntüleme
   - Personel ve tayin taleplerini filtreleme (adliye, unvan, durum, arama vb.)

### Filtreleme Özelliği

Admin panelinde bulunan filtreleme özellikleri ile verileri daha kolay yönetebilirsiniz.

## Veritabanı Yapısı

Sistem aşağıdaki tablolardan oluşmaktadır:

1. **iller**: Türkiye'deki tüm illerin listesi
2. **adliyeler**: Her ildeki adliye bilgileri
3. **personel**: Adliye personelinin bilgileri ve yetkilendirme durumları
4. **tayin_talepleri**: Personelin oluşturduğu tayin talepleri ve durumları

Veritabanı şeması aşağıdaki enum tiplerini içermektedir:
- `unvan_tipi`: yaziislerimuduru, zabitkatibi, mubasir, diger
- `tayin_turu_tipi`: ogrenim, esdurumu, saglik, diger
- `durum_tipi`: beklemede, inceleme, onaylandi, reddedildi, iptal

Veritabanı optimizasyonu için aşağıdaki indeksler kullanılmıştır:
- `idx_personel_sicil_no`: Sicil numarasına göre hızlı arama
- `idx_personel_tc_kimlik`: TC kimlik numarasına göre hızlı arama
- `idx_personel_mevcut_adliye`: Adliyeye göre personel filtreleme
- `idx_tayin_talepleri_personel`: Personele göre tayin talepleri filtreleme
- `idx_tayin_talepleri_tarih`: Tarihe göre tayin talepleri sıralama
- `idx_tayin_talepleri_durum`: Duruma göre tayin talepleri filtreleme
- `idx_adliyeler_il`: İle göre adliye filtreleme

Ayrıca veritabanında, kayıtların güncellenme zamanını otomatik olarak güncelleyen tetikleyiciler (triggers) bulunmaktadır.

## Loglama Sistemi

Sistem, aşağıdaki işlemleri otomatik olarak loglar:
- Kullanıcı giriş takibi
- Profil güncellemeleri
- Tayin talepleri
- Hata ve uyarılar
- HTTP istekleri

Admin panelindeki "Sistem Logları" sekmesinden bu logları görüntüleyebilir ve filtreleyebilirsiniz.

## Güvenlik Özellikleri

### Şifre Güvenliği

Sistem, UCOP (University of California Office of the President) standartlarına uygun şifre politikası uygulamaktadır:

- **Minimum Uzunluk**: Şifreler en az 8 karakter uzunluğunda olmalıdır.
- **Karmaşıklık Gereksinimleri**:
  - En az 1 büyük harf (A-Z)
  - En az 1 küçük harf (a-z)
  - En az 1 rakam (0-9)
  - En az 1 özel karakter (!@#$%^&*()_+-=[]{}|:;<>,.?)

Şifre güvenliğini artırmak için aşağıdaki özellikler eklenmiştir:

- **Şifre Gücü Göstergesi**: Kullanıcılar şifre oluştururken, şifrenin gücü gerçek zamanlı olarak gösterilir.
- **Şifre Gereksinimleri Kontrolü**: Şifre oluşturma ve değiştirme sırasında tüm gereksinimlerin karşılanıp karşılanmadığı kontrol edilir.
- **Güvenli Depolama**: Şifreler bcrypt algoritması kullanılarak hash'lenir ve veritabanında asla açık metin olarak saklanmaz.

Bu güvenlik önlemleri, hem kullanıcı hesaplarının güvenliğini artırır hem de veri ihlallerine karşı koruma sağlar.

## Veri Doğrulama

Sistem, kullanıcı girdilerinin doğruluğunu ve güvenliğini sağlamak için kapsamlı veri doğrulama mekanizmaları içerir:

### Email Doğrulama

- **Format Kontrolü**: Tüm email adresleri standart email formatına uygunluk açısından kontrol edilir.
- **Geçerlilik Kontrolü**: Email adresleri `user@domain.tld` formatında olmalı ve geçerli bir yapıya sahip olmalıdır.
- **Boş Değer Kontrolü**: Boş email değerleri kabul edilmez.

### Telefon Numarası Doğrulama

- **Format Kontrolü**: Telefon numaraları Türkiye formatında 11 haneli olmalıdır (örn. 05551234567).
- **Karakter Kontrolü**: Telefon numaraları sadece rakam içerebilir.
- **Uzunluk Kontrolü**: 11 haneden az veya fazla telefon numaraları kabul edilmez.

## İletişim

Sorularınız veya önerileriniz için lütfen iletişime geçin: ergintan0@gmail.com