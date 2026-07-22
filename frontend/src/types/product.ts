export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  condition: 'A' | 'B' | 'C';
  category: 'celular' | 'laptop' | 'pc' | 'auriculares' | 'tablet';
  image_urls: string[];
  battery_health?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BestSellerProduct extends Product {
  unitsSold: number;
  totalRevenue?: number;
}
