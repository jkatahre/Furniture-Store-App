import { getToken } from './authService';
import * as localCart from '../utils/cart';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function fetchJson(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const headers: any = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return null;
}

export async function getCart() {
  try {
    const r = await fetchJson('/api/cart', { method: 'GET' });
    // support multiple shapes
    return r?.data || r?.cart || r || [];
  } catch (e) {
    return localCart.getCart();
  }
}

export async function addToCart(product: any) {
  try {
    const r = await fetchJson('/api/cart', { method: 'POST', body: JSON.stringify(product) });
    return r?.data || r;
  } catch (e) {
    localCart.addToCart(product);
    return localCart.getCart();
  }
}

export async function updateCartItem(id: string, qty: number) {
  try {
    const r = await fetchJson(`/api/cart/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ qty }) });
    return r?.data || r;
  } catch (e) {
    // no-op fallback: try to update localStorage cart
    const cart = localCart.getCart();
    const idx = cart.findIndex((c: any) => String(c.id || c._id) === String(id));
    if (idx >= 0) {
      cart[idx].qty = qty;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    return cart;
  }
}

export async function removeCartItem(id: string) {
  try {
    const r = await fetchJson(`/api/cart/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return r?.data || r;
  } catch (e) {
    const cart = localCart.getCart();
    const filtered = cart.filter((c: any) => String(c.id || c._id) !== String(id));
    localStorage.setItem('cart', JSON.stringify(filtered));
    return filtered;
    }
  }

  export default { getCart, addToCart, updateCartItem, removeCartItem };
