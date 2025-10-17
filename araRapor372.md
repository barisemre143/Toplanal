# Toplanal Toptan Alım Sistemi Ara Raporu

## 1. Proje Ekibi
- **Ali Hakan Kıncal** 
- **Barış Emre Ahi**  

> Not: Üyelerin rolleri repo commit geçmişindeki katkı alanları göz önüne alınarak belirlenmiştir.

## 2. Proje Konusu ve Domain Tanımı
Toplanal, farklı kullanıcıların aynı ürünü toplu olarak sipariş ederek toptan fiyat avantajından yararlanabilmelerini sağlayan bir **e-ticaret / grup satın alma** platformudur. Sistem; kullanıcıların ortak sepetler oluşturup hedef miktara birlikte ulaşarak indirimli fiyatı aktifleştirmesine, sipariş süreçlerini koordine etmesine ve teslimat adreslerini yönetmesine odaklanır. Böylece küçük ölçekli alıcılar, toptan satış yapan tedarikçilerden uygun maliyetlerle alışveriş yapabilir.

## 3. Veritabanı Tasarımı
Veritabanı PostgreSQL üzerinde kurgulanmıştır ve temel olarak kullanıcı yönetimi, ürün kataloğu, grup sepetleri ve sipariş süreçlerini kapsamaktadır. Tasarım `database/init.sql` dosyasında yer almaktadır.【F:database/init.sql†L1-L156】【F:database/init.sql†L156-L205】

### 3.1. Tablolar ve Anahtarlar
- **users**: Kullanıcı kimlik bilgileri ve rollerini tutar.  
  - *PK*: `user_id`  
  - *Önemli Alanlar*: `email` (benzersiz), `is_admin` (rol), `created_at/updated_at` zaman damgaları.
- **categories**: Ürün kategori hiyerarşisini saklar.  
  - *PK*: `category_id`  
  - *FK*: `parent_category_id → categories.category_id`
- **products**: Ürünlerin fiyatları ve stok bilgilerini içerir.  
  - *PK*: `product_id`  
  - *FK*: `category_id → categories.category_id`  
  - *Kontroller*: `wholesale_price < regular_price`, `minimum_order_quantity > 0`
- **addresses**: Kullanıcıya ait teslimat adresleri.  
  - *PK*: `address_id`  
  - *FK*: `user_id → users.user_id`
- **shared_carts**: Toptan alışveriş için ortak sepetleri tanımlar.  
  - *PK*: `cart_id`  
  - *FK*: `product_id → products.product_id`  
  - *Kontroller*: `target_quantity > 0`, `current_quantity ≥ 0`
- **cart_participants**: Kullanıcıların ortak sepet katkılarını tutar.  
  - *PK*: `participant_id`  
  - *FK*: `cart_id → shared_carts.cart_id`, `user_id → users.user_id`  
  - *Unique*: Aynı kullanıcının aynı sepete ikinci kez katılmasını engelleyen `(cart_id, user_id)` benzersiz kısıtı.
- **orders**: Tamamlanan sepetlerden üretilen siparişleri temsil eder.  
  - *PK*: `order_id`  
  - *FK*: `user_id → users.user_id`, `shipping_address_id → addresses.address_id`  
  - *Kontroller*: `total_amount > 0`
- **order_items**: Siparişteki ürün kırılımlarını listeler.  
  - *PK*: `order_item_id`  
  - *FK*: `order_id → orders.order_id`, `product_id → products.product_id`  
  - *Kontroller*: `quantity > 0`, `unit_price > 0`

### 3.2. Ek Tasarım Unsurları
- **Enum tipleri**: Sepet durumu (`cart_status`) ve sipariş durumu (`order_status`) için özel tipler kullanılarak süreç yönetimi standartlaştırılır.  
- **Tetikleyiciler**: `update_updated_at_column` fonksiyonu ile `users`, `products` ve `orders` tablolarının `updated_at` alanları otomatik güncellenir. `update_shared_cart_quantity` tetikleyicisi ise `cart_participants` üzerinde yapılan her işlemde ilgili sepetin `current_quantity` değerini senkronize eder.  
- **Indexler**: Ürün kategorisi, sepet durumu, kullanıcı siparişleri gibi sık kullanılan sorgu alanlarına performans indeksleri eklenmiştir.

## 4. Uygulama Menülerinin ve Fonksiyonlarının Planı
Frontend tarafında React + TypeScript kullanılarak çoklu sayfa yapısı kurulmuştur. Navigasyon bileşeni ve yönlendirmeler `App.tsx` ve `components/Navbar.tsx` dosyalarında tanımlıdır.【F:frontend/src/App.tsx†L1-L42】【F:frontend/src/components/Navbar.tsx†L1-L132】

### 4.1. Genel Kullanıcı Menüsü
- **Ana Sayfa (`/`)**: Kampanyalar, ortak sepet mantığı ve çağrı-aksiyon bileşenleriyle kullanıcıları yönlendiren tanıtım ekranı.  
- **Ürünler (`/products`)**: Kategori filtreleriyle ürün listesi, ürün detay kartları ve ortak sepete katılma fonksiyonlarına erişim.  
- **Aktif Sepetler (`/active-carts`)**: Hedefe yaklaşan sepetleri öne çıkararak kullanıcıların hızlı katılımını teşvik eden görünüm (Products sayfasının filtreli kullanımı).  
- **Giriş / Kayıt (`/login`, `/register`)**: JWT tabanlı kimlik doğrulama akışını başlatan formlar.  
- **Profil (`/profile`)**: Kullanıcının bilgilerini, adreslerini ve katıldığı sepetleri yönetebildiği alan.【F:frontend/src/pages/Profile.tsx†L1-L200】  
- **Sepetlerim (`/my-carts`)**: Kullanıcının oluşturduğu veya katıldığı grup sepetlerini, ilerleme durumlarıyla birlikte listeler.【F:frontend/src/pages/MyCarts.tsx†L1-L200】

### 4.2. Yönetici Menüsü
- **Yönetim Paneli (`/admin`)**: Yetkili kullanıcılar için kategori/ürün yönetimi, stok ve fiyat güncelleme, ürün görseli yükleme, mevcut ürünleri düzenleme veya silme işlevleri sunar.【F:frontend/src/pages/AdminDashboard.tsx†L1-L200】

### 4.3. Backend Fonksiyonları (API)
Backend Express + TypeScript ile geliştirilmiş olup REST API endpoint seti `README.md` dosyasında belgelenmiştir.【F:README.md†L41-L91】 Temel fonksiyonlar şunları içerir:
- **Kimlik Doğrulama**: Kullanıcı kayıt, giriş ve profil sorguları.  
- **Ürün Yönetimi**: Ürün listesi, detay, kategori bazlı filtreleme ve aktif sepeti olan ürünlerin sorgulanması; yöneticiler için ürün görseli yükleme.  
- **Ortak Sepet İşlemleri**: Sepete katılım, kullanıcı sepetlerinin listelenmesi, sepet detay ve sepetten ayrılma işlemleri.

## 5. Sonraki Adımlar
- Test senaryolarının (hem birim hem uçtan uca) yazılması ve CI/CD sürecine entegrasyonu.  
- Sepet hedefi dolduğunda otomatik sipariş oluşturma servisinin tamamlanması.  
- Gerçek zamanlı sepet güncellemelerinin WebSocket üzerinden frontend bileşenlerine yansıtılması.