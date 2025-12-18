import { Component, computed } from '@angular/core';

import { SignalCartStore, Product } from '../services/signal-cart.store';

@Component({
  selector: 'app-signal-cart',
  standalone: true,
  imports: [],
  templateUrl: './signal-cart.html',
  styleUrl: './signal-cart.scss',
})
export class SignalCart {
  // 📦 Available products
  availableProducts: Product[] = [
    { id: 1, name: '📱 iPhone 15 Pro', price: 1199 },
    { id: 2, name: '💻 MacBook Pro M3', price: 2999 },
    { id: 3, name: '⌚ Apple Watch Ultra', price: 799 },
    { id: 4, name: '🎧 AirPods Max', price: 549 },
    { id: 5, name: '📷 Canon EOS R5', price: 3899 },
    { id: 6, name: '🎮 PlayStation 5', price: 499 },
    { id: 7, name: '📺 LG OLED TV', price: 1999 },
    { id: 8, name: '⌨️ Magic Keyboard', price: 299 },
  ];

  // 🎯 Inject SignalCartStore
  constructor(public store: SignalCartStore) {
    console.log('🛒 SignalCart Component initialized');
  }

  // 📊 Computed signal cho UI
  readonly cartSummary = computed(() => ({
    items: this.store.cartItems(),
    total: this.store.totalPrice(),
    count: this.store.totalItems(),
    isEmpty: this.store.isEmpty(),
  }));

  // ➕ Add to cart
  addToCart(product: Product): void {
    this.store.addToCart(product);
  }

  // ➖ Remove from cart
  removeFromCart(productId: number): void {
    this.store.removeFromCart(productId);
  }

  // 🔼 Increase quantity
  increaseQuantity(productId: number): void {
    this.store.increaseQuantity(productId);
  }

  // 🔽 Decrease quantity
  decreaseQuantity(productId: number): void {
    this.store.decreaseQuantity(productId);
  }

  // 🗑️ Clear cart
  clearCart(): void {
    if (confirm('Are you sure you want to clear the cart?')) {
      this.store.clear();
    }
  }

  // 🔍 Check if product is in cart
  isInCart(productId: number): boolean {
    return this.store.hasProduct(productId);
  }

  // 📊 Get quantity
  getQuantity(productId: number): number {
    return this.store.getQuantity(productId);
  }

  // 💰 Format price
  formatPrice(price: number): string {
    return `$${price.toLocaleString()}`;
  }
}
