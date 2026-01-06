import { drizzle } from "drizzle-orm/mysql2";
import { products, productPsychology } from "../drizzle/schema.js";
import "dotenv/config";
import axios from "axios";
import * as cheerio from "cheerio";

const db = drizzle(process.env.DATABASE_URL);

// Categories to scrape from Cimri
const categories = [
  { url: "/cep-telefonlari", name: "Elektronik" },
  { url: "/laptop", name: "Elektronik" },
  { url: "/televizyon", name: "Elektronik" },
  { url: "/bluetooth-kulaklik", name: "Elektronik" },
  { url: "/akilli-saat", name: "Elektronik" },
  { url: "/tablet", name: "Elektronik" },
  { url: "/kamera", name: "Elektronik" },
  { url: "/oyun-konsollari", name: "Elektronik" },
  { url: "/buzdolaplari", name: "Ev & Yaşam" },
  { url: "/camasir-makineleri", name: "Ev & Yaşam" },
  { url: "/elektrikli-supurge", name: "Ev & Yaşam" },
  { url: "/mikrodalga", name: "Ev & Yaşam" },
  { url: "/kahve-makinesi", name: "Ev & Yaşam" },
  { url: "/blender", name: "Ev & Yaşam" },
  { url: "/erkek-ayakkabi", name: "Giyim" },
  { url: "/kadin-ayakkabi", name: "Giyim" },
  { url: "/erkek-gomlek", name: "Giyim" },
  { url: "/kadin-elbise", name: "Giyim" },
  { url: "/parfum", name: "Kozmetik & Kişisel Bakım" },
  { url: "/sac-bakimi", name: "Kozmetik & Kişisel Bakım" },
  { url: "/cilt-bakimi", name: "Kozmetik & Kişisel Bakım" },
  { url: "/spor-ayakkabi", name: "Spor & Outdoor" },
  { url: "/fitness", name: "Spor & Outdoor" },
  { url: "/kamp-malzemeleri", name: "Spor & Outdoor" },
];

// Generate psychology scores based on product name and category
function generatePsychologyScores(productName, category) {
  const name = productName.toLowerCase();
  
  let scores = {
    appealsToOpenness: 50,
    appealsToConscientiousness: 50,
    appealsToExtraversion: 50,
    appealsToAgreeableness: 50,
    appealsToNeuroticism: 50,
    mianziScore: 50,
    ubuntuScore: 50,
  };
  
  // Brand prestige
  if (name.includes("apple") || name.includes("iphone") || name.includes("macbook") || 
      name.includes("samsung") || name.includes("dyson")) {
    scores.mianziScore += 30;
    scores.appealsToConscientiousness += 20;
  }
  
  // Tech and innovation
  if (name.includes("pro") || name.includes("max") || name.includes("ultra") || 
      name.includes("akıllı") || name.includes("smart")) {
    scores.appealsToOpenness += 25;
    scores.mianziScore += 15;
  }
  
  // Budget/value
  if (name.includes("redmi") || name.includes("xiaomi") || name.includes("realme") ||
      name.includes("ekonomik") || name.includes("uygun")) {
    scores.appealsToConscientiousness += 20;
    scores.appealsToAgreeableness += 15;
  }
  
  // Social/trendy
  if (name.includes("airpods") || name.includes("beats") || name.includes("galaxy")) {
    scores.appealsToExtraversion += 25;
  }
  
  // Safety/reliability
  if (name.includes("güvenli") || name.includes("garanti") || name.includes("dayanıklı")) {
    scores.appealsToNeuroticism += 25;
  }
  
  // Family/practical
  if (category.includes("Ev") || name.includes("aile") || name.includes("pratik")) {
    scores.appealsToAgreeableness += 20;
    scores.ubuntuScore += 20;
  }
  
  // Add randomness
  Object.keys(scores).forEach(key => {
    scores[key] = Math.max(20, Math.min(95, scores[key] + Math.floor(Math.random() * 20 - 10)));
  });
  
  return scores;
}

// Scrape a category page
async function scrapeCategoryPage(categoryUrl, categoryName, limit = 50) {
  try {
    console.log(`\n📦 Scraping ${categoryUrl}...`);
    
    const response = await axios.get(`https://www.cimri.com${categoryUrl}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const productsData = [];
    
    // Find product elements - Cimri uses specific selectors
    $('a[href*="/en-ucuz"]').each((i, element) => {
      if (i >= limit) return false;
      
      const $elem = $(element);
      const href = $elem.attr('href');
      const productName = $elem.attr('hint') || $elem.text().trim();
      
      if (productName && productName.length > 3) {
        productsData.push({
          name: productName,
          url: href,
        });
      }
    });
    
    console.log(`  Found ${productsData.length} products`);
    
    // Insert products into database
    let inserted = 0;
    for (const productData of productsData) {
      try {
        // Generate realistic price
        const price = (Math.random() * 9950 + 50).toFixed(2);
        const stock = Math.floor(Math.random() * 50);
        
        // Simple description
        const description = `${productData.name} - Cimri'den alınan gerçek ürün. Yüksek kalite ve uygun fiyat garantisi.`;
        
        // Random image from Unsplash
        const imageUrl = `https://images.unsplash.com/photo-${Date.now() + inserted}?w=800&q=80`;
        
        // Insert product
        const result = await db.insert(products).values({
          name: productData.name,
          description,
          price,
          category: categoryName,
          stock,
          imageUrl,
          isActive: true,
        });
        
        const productId = Number(result[0].insertId);
        
        // Insert psychology
        const psychology = generatePsychologyScores(productData.name, categoryName);
        await db.insert(productPsychology).values({
          productId,
          ...psychology,
        });
        
        inserted++;
        
      } catch (error) {
        console.error(`  ❌ Failed to insert ${productData.name}:`, error.message);
      }
    }
    
    console.log(`  ✅ Inserted ${inserted} products from ${categoryUrl}`);
    return inserted;
    
  } catch (error) {
    console.error(`  ❌ Failed to scrape ${categoryUrl}:`, error.message);
    return 0;
  }
}

// Main scraping function
async function scrapeAllCategories(targetCount = 1000) {
  console.log(`🌱 Starting to scrape products from Cimri.com...`);
  console.log(`Target: ${targetCount} products\n`);
  
  let totalInserted = 0;
  const productsPerCategory = Math.ceil(targetCount / categories.length);
  
  for (const category of categories) {
    if (totalInserted >= targetCount) break;
    
    const inserted = await scrapeCategoryPage(
      category.url, 
      category.name, 
      productsPerCategory
    );
    
    totalInserted += inserted;
    
    console.log(`📊 Progress: ${totalInserted}/${targetCount} products`);
    
    // Rate limiting - wait 2 seconds between categories
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n✨ Scraping completed! Total: ${totalInserted} products`);
}

// Run
const targetCount = parseInt(process.argv[2]) || 1000;
scrapeAllCategories(targetCount)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
