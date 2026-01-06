import { drizzle } from "drizzle-orm/mysql2";
import { products, productPsychology } from "../drizzle/schema.js";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

// Product templates by category
const productTemplates = {
  "Elektronik": [
    { prefix: "Akıllı", items: ["Telefon", "Saat", "Kulaklık", "Hoparlör", "TV", "Tablet", "Bileklik", "Gözlük", "Ev Asistanı", "Termostat"] },
    { prefix: "Kablosuz", items: ["Mouse", "Klavye", "Şarj Cihazı", "Kulaklık", "Hoparlör", "Mikrofon", "Gamepad", "Adaptör"] },
    { prefix: "Taşınabilir", items: ["Powerbank", "Hoparlör", "Projektör", "SSD", "HDD", "Şarj Cihazı", "Monitör"] },
    { prefix: "Gaming", items: ["Mouse", "Klavye", "Kulaklık", "Monitör", "Laptop", "Koltuk", "Masası", "Mousepad"] },
    { prefix: "Profesyonel", items: ["Kamera", "Mikrofon", "Monitör", "Yazıcı", "Tarayıcı", "Projeksiyon"] },
  ],
  "Giyim": [
    { prefix: "Slim Fit", items: ["Gömlek", "Pantolon", "Ceket", "Takım Elbise", "Tişört", "Kazak"] },
    { prefix: "Oversize", items: ["Tişört", "Sweatshirt", "Hoodie", "Ceket", "Mont", "Kazak"] },
    { prefix: "Deri", items: ["Ceket", "Mont", "Pantolon", "Yelek", "Kemer", "Eldiven"] },
    { prefix: "Spor", items: ["Tayt", "Şort", "Tişört", "Sweatshirt", "Ceket", "Eşofman"] },
    { prefix: "Klasik", items: ["Gömlek", "Pantolon", "Takım", "Kravat", "Yelek", "Palto"] },
  ],
  "Ev & Yaşam": [
    { prefix: "Akıllı", items: ["Aydınlatma", "Perde", "Kilit", "Kamera", "Termostat", "Priz"] },
    { prefix: "Dekoratif", items: ["Vazo", "Tablo", "Ayna", "Saat", "Mum", "Yastık"] },
    { prefix: "Organizer", items: ["Dolap", "Kutu", "Raf", "Sepet", "Çekmece", "Askı"] },
    { prefix: "Mutfak", items: ["Robot", "Blender", "Mikser", "Tost Makinesi", "Kahve Makinesi", "Fritöz"] },
    { prefix: "Banyo", items: ["Havlu Seti", "Paspas", "Sabunluk", "Ayna", "Raf", "Sepet"] },
  ],
  "Kozmetik & Kişisel Bakım": [
    { prefix: "Nemlendirici", items: ["Krem", "Serum", "Losyon", "Maske", "Jel", "Sprey"] },
    { prefix: "Anti-Aging", items: ["Serum", "Krem", "Göz Kremi", "Maske", "Tonik", "Ampul"] },
    { prefix: "Organik", items: ["Şampuan", "Sabun", "Krem", "Yağ", "Maske", "Tonik"] },
    { prefix: "Profesyonel", items: ["Saç Boyası", "Fön Makinesi", "Düzleştirici", "Makas", "Fırça"] },
    { prefix: "Erkek", items: ["Parfüm", "Tıraş Kremi", "Aftershave", "Deodorant", "Şampuan", "Jel"] },
  ],
  "Spor & Outdoor": [
    { prefix: "Yoga", items: ["Matı", "Blok", "Kayış", "Top", "Kıyafet Seti", "Çanta"] },
    { prefix: "Fitness", items: ["Dambıl Seti", "Direnç Bandı", "Kettlebell", "Matı", "Eldiven", "Kemer"] },
    { prefix: "Koşu", items: ["Ayakkabısı", "Saati", "Kemer Çantası", "Kolluğu", "Taytı", "Tişört"] },
    { prefix: "Kamp", items: ["Çadır", "Uyku Tulumu", "Matı", "Ocak", "Sandalye", "Masa"] },
    { prefix: "Bisiklet", items: ["Kask", "Eldiven", "Işık", "Kilit", "Çanta", "Gözlük"] },
  ],
  "Kitap & Kırtasiye": [
    { prefix: "Defter", items: ["Seti", "A4", "A5", "Spiralli", "Kareli", "Çizgili"] },
    { prefix: "Kalem", items: ["Seti", "Tükenmez", "Dolma", "Kurşun", "Renkli", "İşaretleme"] },
    { prefix: "Planlayıcı", items: ["Günlük", "Haftalık", "Aylık", "Yıllık", "Proje", "Hedef"] },
    { prefix: "Sanat", items: ["Defteri", "Kağıdı", "Seti", "Boya", "Fırça", "Kalem"] },
    { prefix: "Ofis", items: ["Dosya", "Klasör", "Zımba", "Delgeç", "Makas", "Bant"] },
  ],
};

// Brands by category
const brands = {
  "Elektronik": ["Samsung", "Apple", "Xiaomi", "Huawei", "LG", "Sony", "Philips", "Asus", "HP", "Dell"],
  "Giyim": ["Mavi", "LC Waikiki", "Koton", "Defacto", "Colin's", "Levi's", "Adidas", "Nike", "Puma", "Zara"],
  "Ev & Yaşam": ["Tefal", "Karaca", "Korkmaz", "Schafer", "Ikea", "Madame Coco", "English Home", "Taç"],
  "Kozmetik & Kişisel Bakım": ["L'Oreal", "Garnier", "Nivea", "Dove", "Avon", "Flormar", "Golden Rose", "Maybelline"],
  "Spor & Outdoor": ["Decathlon", "Nike", "Adidas", "Puma", "Reebok", "Under Armour", "Salomon", "Columbia"],
  "Kitap & Kırtasiye": ["Faber-Castell", "Stabilo", "Pilot", "Uni", "Pentel", "Staedtler", "Moleskine", "Leuchtturm"],
};

// Generate random psychology scores based on product type
function generatePsychologyScores(category, productName) {
  const name = productName.toLowerCase();
  
  // Base scores
  let scores = {
    appealsToOpenness: 50,
    appealsToConscientiousness: 50,
    appealsToExtraversion: 50,
    appealsToAgreeableness: 50,
    appealsToNeuroticism: 50,
    mianziScore: 50,
    ubuntuScore: 50,
  };
  
  // Adjust based on keywords
  if (name.includes("akıllı") || name.includes("yenilikçi") || name.includes("gaming")) {
    scores.appealsToOpenness += 30;
  }
  if (name.includes("profesyonel") || name.includes("kaliteli") || name.includes("premium")) {
    scores.appealsToConscientiousness += 25;
    scores.mianziScore += 20;
  }
  if (name.includes("sosyal") || name.includes("parti") || name.includes("trend")) {
    scores.appealsToExtraversion += 30;
  }
  if (name.includes("aile") || name.includes("hediye") || name.includes("organik")) {
    scores.appealsToAgreeableness += 25;
    scores.ubuntuScore += 20;
  }
  if (name.includes("güvenli") || name.includes("sağlık") || name.includes("koruma")) {
    scores.appealsToNeuroticism += 30;
  }
  
  // Add randomness
  Object.keys(scores).forEach(key => {
    scores[key] = Math.max(20, Math.min(95, scores[key] + Math.floor(Math.random() * 20 - 10)));
  });
  
  return scores;
}

// Generate products
async function generateProducts(count = 1000) {
  console.log(`🌱 Generating ${count} products...`);
  
  const categories = Object.keys(productTemplates);
  let generated = 0;
  
  for (let i = 0; i < count; i++) {
    try {
      const category = categories[i % categories.length];
      const templates = productTemplates[category];
      const template = templates[Math.floor(Math.random() * templates.length)];
      const item = template.items[Math.floor(Math.random() * template.items.length)];
      const brandList = brands[category] || ["Premium", "Quality", "Classic"];
      const brand = brandList[Math.floor(Math.random() * brandList.length)];
      
      const name = `${brand} ${template.prefix} ${item}`;
      const price = (Math.random() * 4950 + 50).toFixed(2);
      const stock = Math.floor(Math.random() * 50);
      
      const descriptions = [
        `Yüksek kaliteli ${template.prefix.toLowerCase()} ${item.toLowerCase()} modeli. Günlük kullanım için ideal.`,
        `${brand} markasının özel tasarım ${item.toLowerCase()} ürünü. Modern ve şık görünüm.`,
        `Dayanıklı ve uzun ömürlü ${template.prefix.toLowerCase()} ${item.toLowerCase()}. Mükemmel performans.`,
        `Ergonomik tasarım ve üstün kalite. ${category} kategorisinde öne çıkan ürün.`,
        `Trend tasarım ve fonksiyonel özellikler. ${item} ihtiyacınız için en iyi seçim.`,
      ];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      // Random Unsplash image
      const imageKeywords = ["product", "shopping", "retail", "commerce", "store"];
      const keyword = imageKeywords[Math.floor(Math.random() * imageKeywords.length)];
      const imageUrl = `https://images.unsplash.com/photo-${Date.now() + i}?w=800&q=80`;
      
      // Insert product
      const result = await db.insert(products).values({
        name,
        description,
        price,
        category,
        stock,
        imageUrl,
        isActive: true,
      });
      
      const productId = Number(result[0].insertId);
      
      // Insert psychology
      const psychology = generatePsychologyScores(category, name);
      await db.insert(productPsychology).values({
        productId,
        ...psychology,
      });
      
      generated++;
      
      if (generated % 50 === 0) {
        console.log(`  ✅ Generated ${generated}/${count} products...`);
      }
      
    } catch (error) {
      console.error(`  ❌ Error at product ${i}:`, error.message);
    }
  }
  
  console.log(`\n✨ Product generation completed! Total: ${generated} products`);
}

// Run
const targetCount = parseInt(process.argv[2]) || 1000;
generateProducts(targetCount)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
