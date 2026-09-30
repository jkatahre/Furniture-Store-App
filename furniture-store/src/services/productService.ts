import { Product } from '../utils/types';
import { furnitureData } from '../utils/data/products';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ensureFullImageUrl = (img: any) => {
  if (!img && img !== 0) return null;

  // If it's an array, pick the first value
  if (Array.isArray(img)) img = img[0];

  // If it's an object like { url: '...' } or {image: '...'}
  if (typeof img === 'object' && img !== null) {
    img = (img.url || img.image || null);
  }

  // If it's a JSON stringified array like '["/uploads/x.jpg"]'
  if (typeof img === 'string' && img.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(img);
      if (Array.isArray(parsed)) img = parsed[0];
    } catch (e) {
      // leave img as-is
    }
  }

  if (!img || typeof img !== 'string') return null;
  const trimmed = img.trim();
  // If already an absolute URL, return as-is
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // If starts with // (protocol-relative), prepend http:
  if (/^\/\//.test(trimmed)) return `http:${trimmed}`;
  // Otherwise treat as relative path and prepend BASE_URL
  const sep = trimmed.startsWith('/') ? '' : '/';
  return `${BASE_URL}${sep}${trimmed}`;
};

const normalizeProduct = (product: any): Product => {
  const img = ensureFullImageUrl(product.image_url || product.image);
  return {
    ...product,
    price: Number(product.price),
    colors: typeof product.colors === 'string' ? (() => {
      try { return JSON.parse(product.colors); } catch { return []; }
    })() : (product.colors || []),
    image: img || null,
  } as Product;
};

export const getProducts = async (): Promise<Product[]> => {


  try {
    const response = await fetch(`${BASE_URL}/getProducts`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    if (result.success && result.data) {
      return (result.data as any[]).map(normalizeProduct) as Product[];
    }
    // If API returned an unexpected shape, fall back to local data
    return furnitureData.map(normalizeProduct);
  } catch (error) {
    // If backend is not running or network fails, fall back to local sample data
    console.warn('Failed to fetch products from API, using local data fallback.', error);
    return furnitureData.map(normalizeProduct);
  }
};
