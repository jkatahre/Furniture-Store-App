// src/utils/orders.ts
// Simple order utility to save orders locally and send to backend

export function saveOrder(order: any, userId?: string) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  // Attach user id when available so orders can be queried per-user
  if (userId) order.userId = userId;
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
}

export async function sendOrderToBackend(order: any) {
  // Replace with your backend endpoint
  const endpoint = 'https://your-backend.example.com/api/orders';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error('Failed to send order');
    return await response.json();
  } catch (err: any) {
    return { error: err?.message || String(err) };
  }
}
