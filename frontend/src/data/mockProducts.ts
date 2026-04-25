import type { Product } from '../types/product';

export const mockProducts: Product[] = [
  {
    _id: 'prod_1',
    name: 'iPhone 15 Pro Max',
    description: 'El último iPhone con chip A17 Pro, diseño de titanio de calidad aeroespacial y zoom óptico 5x.',
    price: 1199.99,
    stock: 5,
    condition: 'A',
    category: 'celular',
    image_urls: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod_2',
    name: 'MacBook Pro 16"',
    description: 'Computadora portátil superpoderosa con chip M3 Max, 36GB de memoria unificada y 1TB SSD.',
    price: 2499.00,
    stock: 2,
    condition: 'A',
    category: 'laptop',
    image_urls: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod_3',
    name: 'AirPods Pro (2da Generación)',
    description: 'Audio increíble con la mejor Cancelación Activa de Ruido. Incluye estuche MagSafe con USB-C.',
    price: 249.00,
    stock: 12,
    condition: 'A',
    category: 'auriculares',
    image_urls: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&q=80'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod_4',
    name: 'iPad Air 5ta Gen',
    description: 'Potenciados por el chip M1 de Apple con soporte para Apple Pencil 2 y Magic Keyboard.',
    price: 599.50,
    stock: 8,
    condition: 'A',
    category: 'tablet',
    image_urls: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];