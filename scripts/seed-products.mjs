import { drizzle } from "drizzle-orm/mysql2";
import { products, productPsychology } from "../drizzle/schema.js";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

const sampleProducts = [
  {
    name: "Minimalist Akıllı Saat",
    description: "Sade tasarımıyla dikkat çeken, yenilikçi özelliklerle dolu akıllı saat. Sanat ve teknolojinin buluşması.",
    price: "2499.00",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    category: "Teknoloji",
    stock: 15,
    psychology: {
      appealsToOpenness: 85,
      appealsToConscientiousness: 60,
      appealsToExtraversion: 50,
      appealsToAgreeableness: 45,
      appealsToNeuroticism: 30,
      mianziScore: 70,
      ubuntuScore: 40,
    },
  },
  {
    name: "Profesyonel İş Çantası",
    description: "Düzenli bölmeleri ve dayanıklı yapısıyla iş hayatınızı kolaylaştıran çanta. Her detay düşünülmüş.",
    price: "899.00",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
    category: "Aksesuar",
    stock: 25,
    psychology: {
      appealsToOpenness: 40,
      appealsToConscientiousness: 90,
      appealsToExtraversion: 55,
      appealsToAgreeableness: 60,
      appealsToNeuroticism: 35,
      mianziScore: 75,
      ubuntuScore: 50,
    },
  },
  {
    name: "Güvenli Ev Güvenlik Sistemi",
    description: "7/24 izleme, anında bildirim ve kolay kurulum. Evinizin güvenliği için en iyi çözüm.",
    price: "1299.00",
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
    category: "Güvenlik",
    stock: 12,
    psychology: {
      appealsToOpenness: 45,
      appealsToConscientiousness: 70,
      appealsToExtraversion: 30,
      appealsToAgreeableness: 55,
      appealsToNeuroticism: 85,
      mianziScore: 50,
      ubuntuScore: 60,
    },
  },
  {
    name: "Sosyal Bluetooth Hoparlör",
    description: "Parti modlu, renkli LED'li, güçlü ses! Arkadaşlarınızla en sevdiğiniz müzikleri dinleyin.",
    price: "599.00",
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
    category: "Ses Sistemleri",
    stock: 30,
    psychology: {
      appealsToOpenness: 70,
      appealsToConscientiousness: 40,
      appealsToExtraversion: 95,
      appealsToAgreeableness: 75,
      appealsToNeuroticism: 25,
      mianziScore: 65,
      ubuntuScore: 80,
    },
  },
  {
    name: "Aile Piknik Seti",
    description: "4 kişilik, eksiksiz piknik seti. Sevdiklerinizle keyifli anlar için ideal.",
    price: "449.00",
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800",
    category: "Outdoor",
    stock: 20,
    psychology: {
      appealsToOpenness: 55,
      appealsToConscientiousness: 60,
      appealsToExtraversion: 70,
      appealsToAgreeableness: 90,
      appealsToNeuroticism: 30,
      mianziScore: 45,
      ubuntuScore: 95,
    },
  },
  {
    name: "Yenilikçi Robot Süpürge",
    description: "Yapay zeka destekli, otomatik şarj, akıllı haritalama. Temizlik artık çok kolay.",
    price: "3499.00",
    imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800",
    category: "Ev Elektroniği",
    stock: 8,
    psychology: {
      appealsToOpenness: 80,
      appealsToConscientiousness: 75,
      appealsToExtraversion: 45,
      appealsToAgreeableness: 50,
      appealsToNeuroticism: 40,
      mianziScore: 70,
      ubuntuScore: 55,
    },
  },
  {
    name: "Trend Spor Ayakkabı",
    description: "Herkesin konuştuğu model! Şu an 1000+ kişi inceliyor. Sınırlı stok!",
    price: "799.00",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    category: "Ayakkabı",
    stock: 45,
    psychology: {
      appealsToOpenness: 65,
      appealsToConscientiousness: 50,
      appealsToExtraversion: 85,
      appealsToAgreeableness: 60,
      appealsToNeuroticism: 35,
      mianziScore: 80,
      ubuntuScore: 60,
    },
  },
  {
    name: "Kaliteli Kahve Makinesi",
    description: "Barista kalitesinde kahve, basit kullanım. Uzman yorumlarıyla 5 yıldız aldı.",
    price: "1899.00",
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800",
    category: "Mutfak",
    stock: 18,
    psychology: {
      appealsToOpenness: 70,
      appealsToConscientiousness: 80,
      appealsToExtraversion: 55,
      appealsToAgreeableness: 65,
      appealsToNeuroticism: 40,
      mianziScore: 65,
      ubuntuScore: 70,
    },
  },
];

async function seed() {
  console.log("🌱 Seeding products...");

  for (const product of sampleProducts) {
    const { psychology, ...productData } = product;

    try {
      // Insert product
      const result = await db.insert(products).values(productData);
      const productId = Number(result[0].insertId);

      console.log(`✅ Created product: ${product.name} (ID: ${productId})`);

      // Insert psychology data
      await db.insert(productPsychology).values({
        productId,
        ...psychology,
      });

      console.log(`   📊 Added psychology data for ${product.name}`);
    } catch (error) {
      console.error(`❌ Error creating product ${product.name}:`, error);
    }
  }

  console.log("✨ Seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
