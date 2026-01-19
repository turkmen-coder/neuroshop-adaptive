 <img width="2752" height="1536" alt="image" src="https://github.com/user-attachments/assets/2c9c5ccf-49a2-40e7-91a9-9445789ff5bb" />

# NeuroShop - Psiko-Adaptif E-Ticaret Platformu

**NeuroShop**, kullanıcıların kişilik özelliklerine göre gerçek zamanlı olarak arayüzü değiştiren, etik ve kültürel açıdan duyarlı bir e-ticaret platformudur. Big Five kişilik modeline dayalı davranış analizi ile her kullanıcıya özel bir alışveriş deneyimi sunar.

---

## 🎯 Temel Özellikler

### Psiko-Adaptif Arayüz Sistemi

NeuroShop, kullanıcı davranışlarını (tıklama hızı, kaydırma davranışı, gezinme süreleri) gerçek zamanlı analiz ederek kişilik profili oluşturur. Big Five kişilik modeline göre beş farklı tema varyasyonu sunar: **Openness** (yenilikçi, mor tonlar), **Conscientiousness** (düzenli, mavi tonlar), **Extraversion** (sosyal, turuncu tonlar), **Agreeableness** (uyumlu, yeşil tonlar) ve **Neuroticism** (duygusal, kırmızı tonlar). Her tema, renk paleti, düzen ve içerik önceliklendirme açısından farklılaşır.

### Kültürel Zeka Katmanı

Platform, IP bazlı lokalizasyon ile kullanıcının kültürel bağlamını tespit eder. Batı kültürleri için Big Five modeli, Asya kültürleri için **Mianzi** (yüz kavramı) ve **Harmony** (uyum) skorları, Afrika ve Orta Doğu kültürleri için **Ubuntu** (topluluk odaklılık) skorları hesaplanır. Bu sayede kültürel farklılıklara duyarlı bir alışveriş deneyimi sağlanır.

### Etik Koruma Sistemi

NeuroShop, kullanıcı refahını ön planda tutar. Yüksek nevrotiklik skoruna sahip kullanıcılara FOMO (Fear of Missing Out) taktikleri uygulanmaz. Tüm kullanıcılar, profil sayfasından kişilik skorlarını görüntüleyebilir, veri kullanımını kontrol edebilir ve istedikleri zaman davranış izlemeyi devre dışı bırakabilir. Şeffaflık dashboard'u, hangi verilerin toplandığını ve nasıl kullanıldığını açıkça gösterir.

### Gerçek Zamanlı Öneri Sistemi

Kullanıcıların kişilik profiline göre en uyumlu ürünler önerilir. Her ürün için **uyumluluk skoru** (%0-100) hesaplanır ve "Size Özel Öneriler" bölümünde en yüksek skorlu ürünler gösterilir. Öneri açıklamaları, kullanıcıya neden bu ürünün önerildiğini şeffaf bir şekilde bildirir.

### A/B Test Dashboard

Admin panelinde, tema varyasyonlarının performansı detaylı analiz edilir. Hangi kişilik tipinin hangi temada daha fazla dönüşüm yaptığı, tema bazlı dönüşüm oranları ve ortalama sipariş değerleri görselleştirilir. Bu veriler, platformun sürekli optimizasyonunu sağlar.

---

## 🏗️ Teknik Mimari

### Teknoloji Stack'i

NeuroShop, modern ve ölçeklenebilir bir teknoloji stack'i kullanır:

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **Frontend** | React 19 + Tailwind CSS 4 | Modern UI framework ve utility-first CSS |
| **Backend** | Express 4 + tRPC 11 | Type-safe API layer |
| **Database** | MySQL (TiDB Cloud) | İlişkisel veritabanı |
| **ORM** | Drizzle ORM | Type-safe database queries |
| **Auth** | Manus OAuth | Güvenli kimlik doğrulama |
| **AI/ML** | Gemini API | Doğal dil işleme ve kişilik analizi |
| **Routing** | Wouter | Hafif client-side routing |
| **UI Components** | shadcn/ui | Özelleştirilebilir component library |

### Veritabanı Şeması

NeuroShop'un veritabanı şeması, kullanıcı kişilik profilleri, davranış metrikleri, ürün psikolojisi ve A/B test tracking için optimize edilmiştir:

**Temel Tablolar:**
- `users`: Kullanıcı bilgileri ve roller (admin/user)
- `user_personality_profiles`: Big Five skorları, dominant trait, kültürel bağlam
- `behavior_metrics`: Tıklama hızı, kaydırma hızı, oturum süresi, arama terimleri
- `products`: Ürün bilgileri (1162 ürün, 15 kategori)
- `product_psychology`: Ürün-kişilik eşleştirme skorları (Big Five + Mianzi + Ubuntu)
- `cart_items`: Sepet yönetimi
- `orders`: Sipariş geçmişi
- `theme_impressions`: Tema gösterim tracking
- `conversion_events`: Dönüşüm event tracking (add_to_cart, purchase, view_product)

### Kişilik Analizi Algoritması

Kişilik analizi, üç farklı veri kaynağından beslenir:

1. **Davranışsal Metrikler**: Tıklama hızı (hızlı → Extraversion ↑), kaydırma davranışı (yavaş → Conscientiousness ↑), gezinme süresi (uzun → Openness ↑)
2. **Arama Terimi Analizi**: Gemini API ile doğal dil işleme - kullanıcının yazdığı metinlerden kişilik çıkarımı
3. **Ürün Etkileşimleri**: Hangi ürünlere tıklandığı, sepete eklendiği, satın alındığı

Bu veriler, **calculatePersonalityFromBehavior** fonksiyonu ile işlenir ve 0-100 arasında Big Five skorları üretilir. Kültürel bağlam tespiti için **detectCulturalContext** fonksiyonu IP bazlı lokalizasyon yapar.

### Ürün-Kişilik Eşleştirme

Her ürün, psikolojik etiketleme ile Big Five skorlarına sahiptir. **calculatePurchaseProbability** fonksiyonu, kullanıcı kişilik profili ile ürün psikolojisi arasındaki uyumu hesaplar:

```typescript
purchaseProbability = baseScore + personalityMatch + culturalBonus - ethicalPenalty
```

- **baseScore**: 50 (nötr başlangıç)
- **personalityMatch**: Her Big Five trait için |userScore - productScore| farkı (düşük fark = yüksek uyum)
- **culturalBonus**: Kültürel skorlar uyumluysa +10
- **ethicalPenalty**: Nevrotik kullanıcılar için manipülatif ürünlerde -20

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

- Node.js 22.x veya üzeri
- pnpm 10.x veya üzeri
- MySQL veya TiDB Cloud hesabı
- Gemini API anahtarı (opsiyonel, arama analizi için)

### Adım 1: Projeyi Klonlama

```bash
git clone <repository-url>
cd neuroshop
```

### Adım 2: Bağımlılıkları Yükleme

```bash
pnpm install
```

### Adım 3: Ortam Değişkenlerini Ayarlama

`.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-jwt-secret
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
GEMINI_API_KEY=your-gemini-api-key
```

### Adım 4: Veritabanı Migration

```bash
pnpm db:push
```

### Adım 5: Örnek Ürünleri Ekleme

```bash
pnpm exec tsx scripts/seed-1000-products.mjs
```

### Adım 6: Development Server'ı Başlatma

```bash
pnpm dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

### Production Build

```bash
pnpm build
pnpm start
```

---

## 📊 API Dokümantasyonu

NeuroShop, tRPC kullanarak type-safe API sunar. Tüm endpoint'ler `server/routers.ts` dosyasında tanımlıdır.

### Kimlik Doğrulama

```typescript
// Kullanıcı bilgilerini alma
trpc.auth.me.useQuery()

// Çıkış yapma
trpc.auth.logout.useMutation()
```

### Ürün İşlemleri

```typescript
// Ürün listesi (sayfalama ile)
trpc.products.list.useQuery({ page: 1, limit: 20, category: 'Elektronik' })

// Kişiselleştirilmiş ürünler
trpc.products.getPersonalized.useQuery()

// Ürün önerileri
trpc.products.getRecommendations.useQuery({ limit: 8 })

// Kategoriler
trpc.products.categories.useQuery()
```

### Kişilik Analizi

```typescript
// Davranış metrikleri kaydetme
trpc.personality.trackBehavior.useMutation({
  clickSpeed: 150,
  scrollSpeed: 300,
  sessionDuration: 120,
  searchTerms: ['laptop', 'gaming']
})

// Arama sorgusu analizi (Gemini API)
trpc.personality.analyzeSearchQuery.useMutation({
  query: 'Yaratıcı ve yenilikçi ürünler arıyorum'
})

// Kişilik profili alma
trpc.personality.getProfile.useQuery()
```

### Sepet İşlemleri

```typescript
// Sepeti görüntüleme
trpc.cart.get.useQuery()

// Ürün ekleme
trpc.cart.add.useMutation({ productId: 1, quantity: 2 })

// Miktar güncelleme
trpc.cart.update.useMutation({ productId: 1, quantity: 3 })

// Ürün silme
trpc.cart.remove.useMutation({ productId: 1 })

// Sepeti temizleme
trpc.cart.clear.useMutation()
```

### Admin İşlemleri

```typescript
// A/B test tema performansı
trpc.admin.getThemePerformance.useQuery({ days: 30 })

// Kişilik-tema dönüşüm matrisi
trpc.admin.getPersonalityThemeBreakdown.useQuery({ days: 30 })

// Ürün oluşturma
trpc.admin.createProduct.useMutation({
  name: 'Yeni Ürün',
  description: 'Açıklama',
  price: 299.99,
  category: 'Elektronik',
  imageUrl: 'https://...',
  psychology: {
    appealsToOpenness: 80,
    appealsToConscientiousness: 60,
    // ...
  }
})
```

---

## 🧪 Test Coverage

NeuroShop, **15 unit test** ile %100 kritik fonksiyon coverage'ına sahiptir:

```bash
pnpm test
```

**Test Dosyaları:**
- `server/auth.logout.test.ts`: Kimlik doğrulama testleri (1 test)
- `server/personality.test.ts`: Kişilik analizi testleri (10 test)
- `server/gemini-analysis.test.ts`: Gemini API entegrasyonu testleri (4 test)

---

## 🎨 Kullanıcı Arayüzü

### Ana Sayfa

Ana sayfa, hero section, özellik kartları, kategori filtreleme ve ürün grid'i içerir. Giriş yapmış kullanıcılar için "Size Özel Öneriler" bölümü gösterilir.

### Ürün Detay Sayfası

Ürün görseli, açıklama, fiyat, kategori, psikolojik etiketler (Big Five skorları) ve "Sepete Ekle" butonu bulunur.

### Sepet Sayfası

Sepetteki ürünler, miktar güncelleme, silme ve toplam fiyat hesaplama özellikleri sunar.

### Profil Sayfası

Kullanıcının kişilik profili (Big Five skorları, dominant trait, kültürel bağlam), davranış metrikleri, veri kullanım şeffaflığı ve onay yönetimi bulunur.

### Admin Paneli

Ürün yönetimi (oluşturma, güncelleme, silme), psikolojik etiketleme arayüzü ve A/B test analytics dashboard'u içerir.

---

## 🔒 Güvenlik ve Gizlilik

NeuroShop, kullanıcı gizliliğini ve veri güvenliğini önceliklendirir:

- **Manus OAuth**: Güvenli kimlik doğrulama ve oturum yönetimi
- **JWT Token**: HTTP-only cookie ile session management
- **Role-Based Access Control**: Admin ve user rolleri ile yetkilendirme
- **Veri Şeffaflığı**: Kullanıcılar, hangi verilerin toplandığını ve nasıl kullanıldığını görebilir
- **Onay Yönetimi**: Kullanıcılar, davranış izlemeyi ve kişiselleştirmeyi devre dışı bırakabilir
- **Etik Koruma**: Nevrotik kullanıcılara manipülatif taktikler uygulanmaz

---

## 🌍 Kültürel Adaptasyon

NeuroShop, farklı kültürlere özgü kişilik modellerini destekler:

| Kültürel Bağlam | Kişilik Modeli | Açıklama |
|-----------------|----------------|----------|
| **Western** | Big Five | Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism |
| **East Asian** | Mianzi + Harmony | Yüz kavramı (sosyal itibar) ve uyum (grup dinamikleri) |
| **African / Middle Eastern** | Ubuntu | Topluluk odaklılık ve kolektif refah |

IP bazlı lokalizasyon ile kullanıcının kültürel bağlamı otomatik tespit edilir ve ürün önerileri buna göre ayarlanır.

---

## 📈 Performans Optimizasyonu

NeuroShop, yüksek performans için optimize edilmiştir:

- **Sayfalama**: Ürün listesi 20 ürün/sayfa ile yüklenir (LIMIT, OFFSET)
- **Database Indexing**: Sık sorgulanan kolonlar için index'ler (user_id, theme_variant, event_type)
- **Frontend Caching**: tRPC query cache ile gereksiz API çağrıları önlenir
- **Lazy Loading**: Görseller ve bileşenler ihtiyaç anında yüklenir

---

## 🤝 Katkıda Bulunma

NeuroShop açık kaynak bir projedir ve katkılarınızı bekliyoruz! Katkıda bulunmak için:

1. Repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

**Katkı Kuralları:**
- Tüm yeni özellikler için unit test yazın
- Code style'a uyun (Prettier + ESLint)
- Commit mesajlarını anlamlı yazın
- README'yi güncel tutun

---

## 📝 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

---

## 📞 İletişim

Sorularınız veya önerileriniz için:
- **GitHub Issues**: [Proje Issues Sayfası]
- **Email**: support@neuroshop.com

---

## 🙏 Teşekkürler

NeuroShop, aşağıdaki açık kaynak projeleri kullanmaktadır:
- [React](https://react.dev/)
- [tRPC](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Gemini API](https://ai.google.dev/)

---

**Geliştirici:** Manus AI  
**Versiyon:** 3.0  
**Son Güncelleme:** 2026-01-07
