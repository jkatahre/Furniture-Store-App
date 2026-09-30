// src/utils/cart.ts
// Simple cart utility for localStorage management

export function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

export function addToCart(product: any) {
  const cart = getCart();
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem('cart');
}
