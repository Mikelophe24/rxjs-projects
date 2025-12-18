import { Injectable, computed, signal } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class SignalCartStore {
  // 📦 Private writable signal - chỉ store mới có thể update
  private readonly _cartItems = signal<CartItem[]>([]);

  // 📖 Public readonly signal - components chỉ đọc được
  readonly cartItems = this._cartItems.asReadonly();

  // 🧮 Computed signals - tự động tính toán khi cartItems thay đổi
  readonly totalItems = computed(() => {
    return this._cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  readonly totalPrice = computed(() => {
    return this._cartItems().reduce((total, item) => total + item.product.price * item.quantity, 0);
  });

  readonly itemCount = computed(() => this._cartItems().length);

  readonly isEmpty = computed(() => this._cartItems().length === 0);

  constructor() {}

  // ➕ Add product to cart
  addToCart(product: Product): void {
    this._cartItems.update((items) => {
      const existingIndex = items.findIndex((item) => item.product.id === product.id);

      if (existingIndex >= 0) {
        // Tăng quantity nếu đã có
        const updated = [...items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      } else {
        // Thêm mới
        return [...items, { product, quantity: 1 }];
      }
    });
  }

  // ➖ Remove product from cart
  removeFromCart(productId: number): void {
    this._cartItems.update((items) => items.filter((item) => item.product.id !== productId));
  }

  // 🔼 Increase quantity
  increaseQuantity(productId: number): void {
    this._cartItems.update((items) =>
      items.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  // 🔽 Decrease quantity
  decreaseQuantity(productId: number): void {
    this._cartItems.update((items) => {
      return items
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0); // Remove if quantity = 0
    });
  }

  // 🔢 Update quantity directly
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this._cartItems.update((items) =>
      items.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  }

  // 🗑️ Clear entire cart
  clear(): void {
    this._cartItems.set([]);
    console.log('🗑️ Cart cleared');
  }

  // 🔍 Get item by product ID
  getItem(productId: number): CartItem | undefined {
    return this._cartItems().find((item) => item.product.id === productId);
  }

  // ✅ Check if product is in cart
  hasProduct(productId: number): boolean {
    return this._cartItems().some((item) => item.product.id === productId);
  }

  // 📊 Get quantity of a product
  getQuantity(productId: number): number {
    const item = this.getItem(productId);
    return item ? item.quantity : 0;
  }
}
