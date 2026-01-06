# NeuroShop - Proje TODO Listesi

## Veritabanı ve Temel Yapı
- [x] Ürünler tablosu ve psikolojik etiketleme şeması
- [x] Kullanıcı profili ve kişilik skorları tablosu
- [x] Davranışsal metrikler tablosu
- [x] Sepet ve sipariş tabloları
- [x] Kültürel profil ve tercihler tablosu

## Davranış İzleme Sistemi
- [x] Tıklama hızı ve pattern analizi hook'u
- [x] Kaydırma davranışı tracker'ı
- [x] Gezinme süresi ve sayfa geçiş analizi
- [x] Arama sorgusu kelime analizi (LLM entegrasyonu)
- [x] Davranışsal veri toplama ve depolama API'si

## Kişilik Analizi Motoru
- [x] Big Five skoru hesaplama algoritması
- [x] Gerçek zamanlı kişilik çıkarım servisi
- [ ] Gemini API entegrasyonu (text analizi için)
- [x] Kişilik profili güncelleme ve caching sistemi

## Adaptif UI Tema Sistemi
- [x] 5 kişilik tipi için tema varyasyonları (CSS variables)
- [x] Openness teması - minimalist, avangart
- [x] Conscientiousness teması - yapılandırılmış, detaylı
- [x] Neuroticism teması - güven verici, sakin
- [x] Extraversion teması - sosyal, enerjik
- [x] Agreeableness teması - topluluk odaklı
- [x] Gerçek zamanlı tema değiştirme hook'u
- [x] İçerik önceliklendirme sistemi

## Ürün-Kişilik Eşleştirme
- [x] Ürün psikolojik özellik skorlama sistemi
- [x] Kullanıcı-ürün uyumluluk hesaplama algoritması
- [x] Kişiselleştirilmiş ürün sıralama
- [x] Öneri motoru API endpoint'leri

## E-Ticaret Temel Özellikler
- [x] Ürün listeleme sayfası (grid/list view)
- [x] Ürün detay sayfası
- [x] Sepet yönetimi (ekleme, çıkarma, güncelleme)
- [ ] Ödeme akışı (checkout)
- [ ] Sipariş geçmişi
- [x] Arama ve filtreleme sistemi

## Admin Paneli
- [x] Ürün CRUD işlemleri
- [x] Ürün psikolojik etiketleme arayüzü (Big Five skorları)
- [ ] Kullanıcı kişilik profilleri görüntüleme
- [ ] Davranışsal analitik dashboard
- [x] Admin yetkilendirme ve koruma

## Kültürel Zeka Katmanı
- [x] IP bazlı lokalizasyon servisi
- [x] Batı pazarı adaptasyonu (Big Five)
- [x] Asya pazarı adaptasyonu (Mianzi/Harmony)
- [x] Afrika/Orta Doğu adaptasyonu (Ubuntu)
- [x] Kültürel bağlam algılama ve UI ayarlama

## Etik Koruma Sistemi
- [x] Kullanıcı onay yönetimi (consent management)
- [x] Şeffaflık dashboard'u (kişilik profili gösterimi)
- [x] Anti-manipülasyon filtreleri (nevrotik kullanıcılar için FOMO yasağı)
- [x] Veri kullanımı açıklama sayfası
- [ ] GDPR/AB AI Act uyumluluk kontrolleri

## Kullanıcı Deneyimi
- [x] Kullanıcı profil sayfası
- [x] Kişilik skoru görüntüleme ("Alışveriş Karakteriniz")
- [x] Veri şeffaflığı paneli
- [x] Tercih yönetimi (opt-out seçenekleri)

## Test ve Optimizasyon
- [ ] Davranış izleme unit testleri
- [ ] Kişilik analizi algoritma testleri
- [ ] Ürün eşleştirme doğruluk testleri
- [ ] Performance optimizasyonu (Redis caching)
- [ ] Cross-browser testing

## Deployment
- [ ] Production build optimizasyonu
- [ ] Environment variables yapılandırması
- [ ] İlk checkpoint oluşturma
- [ ] Dokümantasyon tamamlama

## Gemini API Entegrasyonu (Yeni)
- [x] Gemini API text analizi servisi oluşturma
- [x] Arama sorgusu kişilik analizi endpoint'i
- [x] Frontend'de arama sorgusu analizi entegrasyonu
- [x] Kişilik profili otomatik güncelleme
- [x] Test coverage ekleme

## Google Shopping Ürün Ekleme (Yeni)
- [x] Statik veri ile 1000+ ürün seed script oluşturma
- [x] Otomatik psikolojik etiketleme
- [x] Ürün görselleri (Unsplash URLs)
- [x] Kategori ve filtreleme sistemi
- [x] 1162 ürün başarıyla eklendi

## Cimri.com Scraping (Yeni)
- [ ] Cimri.com scraping script'i oluşturma
- [ ] Ürün listelerini çekme
- [ ] Ürün detaylarını parse etme
- [ ] Görselleri S3'e yükleme
- [ ] Otomatik psikolojik etiketleme

## Gerçek Zamanlı Öneri Sistemi (Yeni)
- [x] Kişilik bazlı ürün öneri algoritması
- [x] "Size Özel Öneriler" bölümü ana sayfada
- [x] Uyumluluk skoru hesaplama ve sıralama
- [x] Öneri açıklamaları (neden önerildi)

## A/B Test Dashboard (Yeni)
- [x] Tema varyasyonları tracking sistemi
- [x] Dönüşüm oranı metrikleri (conversion tracking)
- [x] Kişilik tipi bazlı analitik
- [x] Admin dashboard görselleştirme (charts)
- [x] Tema performans karşılaştırma

## Stripe Ödeme Entegrasyonu (Yeni)
- [ ] Stripe feature ekleme (webdev_add_feature)
- [ ] Checkout sayfası tasarımı
- [ ] Ödeme işleme ve webhook'lar
- [ ] Sipariş takip sistemi
- [ ] Ödeme geçmişi sayfası

## Ürün Kategorilendirme (Yeni)
- [x] Mevcut ürünleri kategorilere ayırma
- [x] Kategori filtreleme UI
- [x] Kategori bazlı sayfalama

## Performans Optimizasyonu (ACİL)
- [x] Ürün listesi sayfalama (pagination)
- [x] Database query optimizasyonu (LIMIT, OFFSET)
- [x] Frontend caching stratejisi
