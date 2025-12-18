import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, Product } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnDestroy {
  // Danh sách sản phẩm có sẵn
  availableProducts: Product[] = [
    { id: 1, name: '📱 iPhone 15', price: 999 },
    { id: 2, name: '💻 MacBook Pro', price: 2499 },
    { id: 3, name: '⌚ Apple Watch', price: 399 },
    { id: 4, name: '🎧 AirPods Pro', price: 249 },
    { id: 5, name: '📷 Canon Camera', price: 1299 },
  ];

  // Expose service observables cho template
  cartItems$;
  totalPrice$;
  totalItems$;

  constructor(private cartService: CartService) {
    console.log('Cart Component initialized with CartService');

    // Initialize observables after cartService is injected
    this.cartItems$ = this.cartService.cartItems$;
    this.totalPrice$ = this.cartService.totalPrice$;
    this.totalItems$ = this.cartService.totalItems$;
  }

  // Delegate methods to service
  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  increaseQuantity(productId: number): void {
    this.cartService.increaseQuantity(productId);
  }

  decreaseQuantity(productId: number): void {
    this.cartService.decreaseQuantity(productId);
  }

  clearCart(): void {
    this.cartService.clear();
  }

  ngOnDestroy(): void {
    // Service là singleton nên không cần destroy ở đây
    // Nhưng nếu muốn cleanup khi component destroy, có thể gọi:
    // this.cartService.destroy();
    console.log('Cart Component destroyed');
  }
}
