# E-Ticaret Toptan Alım Sistemi

Bu proje, kullanıcıların birlikte alım yaparak toptan fiyatlardan yararlanabileceği bir e-ticaret sistemidir.

## Özellikler

- **Ortak Sepet Sistemi**: Kullanıcılar aynı ürün için ortak sepet oluşturabilir
- **Minimum Sipariş Takibi**: Her ürün için minimum sipariş adedi belirlenir
- **Toptan Fiyat Aktivasyonu**: Minimum adede ulaşıldığında toptan fiyat aktif olur
- **Gerçek Zamanlı Güncellemeler**: WebSocket ile anlık sepet durumu takibi
- **Kullanıcı Yönetimi**: JWT tabanlı kimlik doğrulama
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu

## Teknoloji Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** (Docker container)
- **Socket.IO** (gerçek zamanlı iletişim)
- **JWT** (kimlik doğrulama)
- **Joi** (validasyon)

### Frontend
- **React** + **TypeScript**
- **Material-UI** (UI kütüphanesi)
- **React Router** (sayfa yönlendirme)
- **Axios** (API istekleri)
- **Socket.IO Client** (gerçek zamanlı güncellemeler)

### DevOps
- **Docker** + **Docker Compose**
- **Nginx** (reverse proxy)

## Kurulum

### Gereksinimler
- Docker
- Docker Compose

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repo-url>
cd ecommerce-project
```

2. **Docker konteynerlerini başlatın**
```bash
docker-compose up -d
```

3. **Uygulamaya erişin**
- Frontend: http://localhost (Nginx üzerinden)
- Backend API: http://localhost/api
- Direkt Frontend: http://localhost:3000
- Direkt Backend: http://localhost:3001

## Veritabanı Şeması

### Ana Tablolar
- **users**: Kullanıcı bilgileri
- **categories**: Ürün kategorileri (hierarchical)
- **products**: Ürün bilgileri ve fiyatları
- **shared_carts**: Ortak sepetler
- **cart_participants**: Sepet katılımcıları
- **orders**: Siparişler
- **order_items**: Sipariş kalemleri
- **addresses**: Kullanıcı adresleri

### Önemli İş Kuralları
- Her kullanıcı aynı sepete sadece bir kez katılabilir
- Sepet sadece 'active' durumunda yeni katılımcı kabul eder
- current_quantity >= target_quantity olduğunda sepet 'completed' olur
- Sipariş sadece 'completed' sepetlerden oluşturulabilir

## API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş
- `GET /api/auth/profile` - Profil bilgisi

### Products
- `GET /api/products` - Ürün listesi (filtreleme destekli)
- `GET /api/products/:id` - Ürün detayı
- `GET /api/products/categories` - Kategori listesi
- `GET /api/products/with-active-carts` - Aktif sepeti olan ürünler

### Cart
- `POST /api/cart/add` - Sepete ürün ekleme
- `GET /api/cart/my-carts` - Kullanıcının sepetleri
- `GET /api/cart/:cartId` - Sepet detayları
- `DELETE /api/cart/:cartId` - Sepetten çıkarma

## Çalıştırma

### Development Mode
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start

# PostgreSQL
docker run -d --name postgres -e POSTGRES_DB=ecommerce_db -e POSTGRES_PASSWORD=password123 -p 5432:5432 postgres:15-alpine
```

### Production Mode
```bash
docker-compose up -d
```

## Proje Yapısı

```
├── backend/
│   ├── src/
│   │   ├── config/          # Veritabanı konfigürasyonu
│   │   ├── controllers/     # API controller'ları
│   │   ├── middleware/      # Auth, validation middleware
│   │   ├── models/          # Veri modelleri
│   │   ├── routes/          # API route'ları
│   │   ├── services/        # İş mantığı
│   │   ├── types/           # TypeScript tipleri
│   │   └── server.ts        # Ana server dosyası
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # React bileşenleri
│   │   ├── pages/           # Sayfa bileşenleri
│   │   ├── contexts/        # React context'leri
│   │   ├── services/        # API servisleri
│   │   ├── types/           # TypeScript tipleri
│   │   └── App.tsx          # Ana uygulama
│   └── Dockerfile
├── database/
│   └── init.sql             # Veritabanı şeması
├── nginx/
│   └── nginx.conf           # Nginx konfigürasyonu
└── docker-compose.yml       # Docker Compose konfigürasyonu
```

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.