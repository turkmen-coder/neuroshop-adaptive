import { drizzle } from "drizzle-orm/mysql2";
import { products, productPsychology } from "../drizzle/schema.js";
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const db = drizzle(process.env.DATABASE_URL);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const categories = [
  "Elektronik",
  "Giyim",
  "Ev & Yaşam",
  "Kozmetik & Kişisel Bakım",
  "Spor & Outdoor",
  "Kitap & Kırtasiye",
  "Oyuncak & Hobi",
  "Otomotiv",
  "Anne & Bebek",
  "Süpermarket",
  "Mobilya",
  "Ayakkabı & Çanta",
  "Saat & Aksesuar",
  "Pet Shop",
  "Bahçe & Yapı Market",
];

async function generateProductBatch(category, batchSize = 10) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `${category} kategorisinde ${batchSize} adet gerçekçi e-ticaret ürünü oluştur. 

Her ürün için:
- name: Türkçe ürün adı (gerçekçi marka ve model içerebilir)
- description: 2-3 cümlelik açıklama
- price: TL cinsinden fiyat (50-5000 arası, string olarak)
- category: "${category}"
- stock: 0-50 arası rastgele stok
- imageKeyword: Unsplash için arama kelimesi (İngilizce, tek kelime)
- psychology: {
    appealsToOpenness: 0-100 arası skor
    appealsToConscientiousness: 0-100 arası skor
    appealsToExtraversion: 0-100 arası skor
    appealsToAgreeableness: 0-100 arası skor
    appealsToNeuroticism: 0-100 arası skor
    mianziScore: 0-100 arası skor (sosyal itibar)
    ubuntuScore: 0-100 arası skor (topluluk değeri)
  }

Psikolojik skorları ürünün özelliklerine göre mantıklı belirle.

JSON array olarak döndür: [{ name, description, price, category, stock, imageKeyword, psychology }, ...]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const productsData = JSON.parse(text);
    return productsData;
  } catch (error) {
    console.error(`Error generating products for ${category}:`, error);
    return [];
  }
}

async function seedProducts(targetCount = 1000) {
  console.log(`🌱 Starting to generate ${targetCount} products with Gemini AI...`);
  
  let totalGenerated = 0;
  const batchSize = 10;
  const batches = Math.ceil(targetCount / batchSize);
  
  for (let i = 0; i < batches; i++) {
    const category = categories[i % categories.length];
    const remainingCount = targetCount - totalGenerated;
    const currentBatchSize = Math.min(batchSize, remainingCount);
    
    if (currentBatchSize <= 0) break;
    
    console.log(`\n📦 Batch ${i + 1}/${batches} - Generating ${currentBatchSize} products in ${category}...`);
    
    try {
      const productsData = await generateProductBatch(category, currentBatchSize);
      
      for (const productData of productsData) {
        try {
          const { psychology, imageKeyword, ...productFields } = productData;
          
          // Create Unsplash image URL
          const imageUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=800&q=80`;
          
          // Insert product
          const result = await db.insert(products).values({
            ...productFields,
            imageUrl,
            isActive: true,
          });
          
          const productId = Number(result[0].insertId);
          
          // Insert psychology data
          await db.insert(productPsychology).values({
            productId,
            ...psychology,
          });
          
          totalGenerated++;
          console.log(`  ✅ ${totalGenerated}/${targetCount}: ${productData.name}`);
          
        } catch (error) {
          console.error(`  ❌ Failed to insert product:`, error.message);
        }
      }
      
      // Rate limiting - wait 2 seconds between batches
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`  ❌ Batch failed:`, error.message);
    }
  }
  
  console.log(`\n✨ Product generation completed! Total: ${totalGenerated} products`);
}

// Run the seed
const targetCount = parseInt(process.argv[2]) || 1000;
seedProducts(targetCount)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
