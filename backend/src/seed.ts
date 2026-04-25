import mongoose from 'mongoose';
import { connectDB } from './db/connection';
import { Product } from './models/Product';

const seedProducts = [
  // CELULARES
  { name: "iPhone 14 Pro 128GB", description: "El último iPhone con Dynamic Island. Batería 92%. Como nuevo.", price: 799, stock: 8, condition: "A", category: "celular", image_urls: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800"] },
  { name: "iPhone 13 128GB", description: "Potente y accesible. Batería 88%. Perfecto estado.", price: 549, stock: 12, condition: "A", category: "celular", image_urls: ["https://images.unsplash.com/photo-1605236453806-6ff368525b42?w=800"] },
  { name: "iPhone 12 64GB", description: "5G a buen precio. Batería 85%. Ligeros signos de uso.", price: 349, stock: 15, condition: "B", category: "celular", image_urls: ["https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800"] },
  { name: "Samsung Galaxy S23 Ultra", description: "Elflagship de Samsung. S Pen incluido. Estado impecable.", price: 729, stock: 6, condition: "A", category: "celular", image_urls: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800"] },
  { name: "Samsung Galaxy S22", description: "Android premium. Batería 80%. Sin rayones.", price: 449, stock: 10, condition: "B", category: "celular", image_urls: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800"] },
  { name: "Google Pixel 7 Pro", description: "La mejor cámara Android. Batería 90%. Como nuevo.", price: 529, stock: 7, condition: "A", category: "celular", image_urls: ["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800"] },
  
  // LAPTOPS
  { name: "MacBook Pro 14 M2 2023", description: "Chip M2 Pro. Rendimiento extremo. Pantalla Liquid Retina XDR.", price: 1499, stock: 4, condition: "A", category: "laptop", image_urls: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"] },
  { name: "MacBook Air M1 2020", description: "El clásico de Apple. Silencioso y potente. Batería 90%.", price: 699, stock: 11, condition: "A", category: "laptop", image_urls: ["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"] },
  { name: "MacBook Pro 13 M1 2020", description: "Primera generación M1.Excelente rendimiento. Batería 88%.", price: 799, stock: 6, condition: "B", category: "laptop", image_urls: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"] },
  { name: "Dell XPS 13 Plus", description: "Ultrabook premium Windows. OLED opcional. Diseño elegante.", price: 999, stock: 5, condition: "A", category: "laptop", image_urls: ["https://images.unsplash.com/photo-1593642632823-8f785baa6bba?w=800"] },
  { name: "Dell XPS 15 9520", description: "Potencia para creadores. RTX 3050 Ti. Pantalla 3.5K.", price: 1199, stock: 3, condition: "A", category: "laptop", image_urls: ["https://images.unsplash.com/photo-1593642632559-0c6d3fc62db3?w=800"] },
  { name: "HP Spectre x360", description: "2 en 1 convertible. stylus incluido. Batería 85%.", price: 749, stock: 8, condition: "B", category: "laptop", image_urls: ["https://images.unsplash.com/photo-1588702547923-7093a6c7e842?w=800"] },
  { name: "Lenovo ThinkPad X1 Carbon", description: "El negocio por excelencia. Teclado insuperable. Batería 90%.", price: 899, stock: 7, condition: "A", category: "laptop", image_urls: ["https://images.unsplash.com/photo-1588872657578-7efd1a1559f6?w=800"] },
  { name: "ASUS ROG Zephyrus G14", description: "Gaming portable. Ryzen 9. RTX 4060. Pantalla 165Hz.", price: 1299, stock: 4, condition: "A", category: "laptop", image_urls: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800"] },
  // PCs
  { name: "iMac 24 M1 2021", description: "Todo en uno de Apple. Pantalla 4.5K. Color stunning.", price: 1099, stock: 5, condition: "A", category: "pc", image_urls: ["https://images.unsplash.com/photo-1624726175512-19b9baf00ca9?w=800"] },
  { name: "iMac 27 5K 2020", description: "Potencia de escritorio. i7 de 10ma generación.", price: 1299, stock: 3, condition: "B", category: "pc", image_urls: ["https://images.unsplash.com/photo-1624726175512-19b9baf00ca9?w=800"] },
  { name: "Mac Studio M2 Max", description: "estación de trabajocompacta. M2 Max. Rendimiento brutal.", price: 1999, stock: 2, condition: "A", category: "pc", image_urls: ["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"] },
  { name: "Dell Optiplex 7080", description: "PC de escritorio profesional. i7. 16GB RAM.", price: 649, stock: 8, condition: "B", category: "pc", image_urls: ["https://images.unsplash.com/photo-1593640408182-31c4c66521d4?w=800"] },
  { name: "HP EliteDesk 800", description: "Negocios confiable.SSD rápido.Windows 11.", price: 499, stock: 10, condition: "B", category: "pc", image_urls: ["https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800"] },
  // AURICULARES
  { name: "AirPods Pro 2da Gen", description: "Cancelación activa de ruido. Audio espacial. Como nuevos.", price: 179, stock: 20, condition: "A", category: "auriculares", image_urls: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800"] },
  { name: "AirPods Max", description: "Over-ear premium Apple. Sonido inmersivo. Excelente estado.", price: 399, stock: 6, condition: "A", category: "auriculares", image_urls: ["https://images.unsplash.com/photo-1625245488600-f03fef636a3c?w=800"] },
  { name: "Sony WH-1000XM5", description: "Los mejores noise cancelling. Batería 30hrs.", price: 279, stock: 12, condition: "A", category: "auriculares", image_urls: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800"] },
  { name: "Sony WF-1000XM4", description: "In-ear premium. Excelente cancelación. Batería 8hrs.", price: 159, stock: 15, condition: "A", category: "auriculares", image_urls: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"] },
  { name: "AirPods 3ra Gen", description: "Audio espacial. Diseño nuevo. Batería 6hrs.", price: 129, stock: 25, condition: "A", category: "auriculares", image_urls: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800"] },
  { name: "Bose QC45", description: "Comodidadlegendaria. Cancelación premium.", price: 249, stock: 9, condition: "A", category: "auriculares", image_urls: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"] },
  { name: "Samsung Galaxy Buds2 Pro", description: "Hi-Fi sound. Cancelación activa. Compactos.", price: 119, stock: 18, condition: "A", category: "auriculares", image_urls: ["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800"] },
  // TABLETS
  { name: "iPad Pro 12.9 M2", description: "El iPad más potente. Pantalla Liquid Retina XDR.", price: 899, stock: 5, condition: "A", category: "tablet", image_urls: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800"] },
  { name: "iPad Air M1 2022", description: "Potencia y portabilidad. Ideal para crear.", price: 449, stock: 12, condition: "A", category: "tablet", image_urls: ["https://images.unsplash.com/photo-1561154464-82e9ad32d86b?w=800"] },
  { name: "iPad 10ma Gen", description: "El iPad básico actualizado. Colores vibrantes.", price: 329, stock: 15, condition: "A", category: "tablet", image_urls: ["https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800"] },
  { name: "iPad mini 6ta Gen", description: "Compactoperfecto. A15 Bionic. USB-C.", price: 399, stock: 8, condition: "A", category: "tablet", image_urls: ["https://images.unsplash.com/photo-1632639178926-d083df3d2708?w=800"] },
  { name: "Samsung Galaxy Tab S9 Ultra", description: "Android tablet definitivo. S Pen incluido.", price: 799, stock: 4, condition: "A", category: "tablet", image_urls: ["https://images.unsplash.com/photo-1632639178926-d083df3d2708?w=800"] },
  { name: "Samsung Galaxy Tab S8", description: "Potencia productividad. Pantalla 120Hz.", price: 499, stock: 7, condition: "B", category: "tablet", image_urls: ["https://images.unsplash.com/photo-1561154464-82e9ad32d86b?w=800"] },
];

const runSeed = async () => {
  try {
    await connectDB();
    console.log('Clearing old products...');
    await Product.deleteMany({});
    
    console.log('Inserting new products...');
    await Product.insertMany(seedProducts);
    
    console.log('\n✅ Database seeded successfully!');
    console.log(`Total products: ${seedProducts.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

runSeed();