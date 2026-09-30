import { getToken } from './authService';
import * as localOrders from '../utils/orders';

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

export async function placeOrder(order: any, userId?: string) {
  try {
    const r = await fetchJson('/api/orders', { method: 'POST', body: JSON.stringify(order) });
    return r?.data || r;
  } catch (e) {
    // fallback: save locally
    try {
      localOrders.saveOrder(order, userId);
      return { fallback: true, saved: true };
    } catch (err) {
      return { error: (err as Error).message };
    }
  }
}

export async function getMyOrders() {
  try {
    const r = await fetchJson('/api/orders/myorders', { method: 'GET' });
    return r?.data || r || [];
  } catch (e) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders;
  }
}

export async function getOrderById(id: string) {
  try {
    const r = await fetchJson(`/api/orders/${encodeURIComponent(id)}`, { method: 'GET' });
    return r?.data || r;
  } catch (e) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.find((o: any) => String(o.id || o._id) === String(id)) || null;
    }
  }

  export default { placeOrder, getMyOrders, getOrderById };
