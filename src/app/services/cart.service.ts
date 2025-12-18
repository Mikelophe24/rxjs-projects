import { Injectable } from '@angular/core';
import { Subject, merge, BehaviorSubject, Observable } from 'rxjs';
import { scan, map, withLatestFrom } from 'rxjs/operators';

// Interfaces
export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartAction {
  type: 'ADD' | 'REMOVE' | 'UPDATE_QUANTITY' | 'CLEAR';
  product?: Product;
  productId?: number;
  quantity?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // Private Subjects cho các actions
  private addItem$ = new Subject<Product>();
  private removeItem$ = new Subject<number>();
  private updateQuantity$ = new Subject<{ productId: number; quantity: number }>();
  private clearCart$ = new Subject<void>();

  // Cart state - BehaviorSubject để có initial state
  private cartState$ = new BehaviorSubject<CartItem[]>([]);

  // Public observables để components subscribe
  public cartItems$: Observable<CartItem[]> = this.cartState$.asObservable();

  // Derived state - tính toán từ cart state
  public totalPrice$: Observable<number> = this.cartItems$.pipe(
    map((items) => items.reduce((total, item) => total + item.product.price * item.quantity, 0))
  );

  public totalItems$: Observable<number> = this.cartItems$.pipe(
    map((items) => items.reduce((total, item) => total + item.quantity, 0))
  );

  constructor() {
    // Setup state management pipeline
    this.initializeCartStream();
  }

  private initializeCartStream(): void {
    // Merge tất cả actions thành một stream
    merge(
      this.addItem$.pipe(map((product) => ({ type: 'ADD' as const, product }))),
      this.removeItem$.pipe(map((productId) => ({ type: 'REMOVE' as const, productId }))),
      this.updateQuantity$.pipe(
        map(({ productId, quantity }) => ({
          type: 'UPDATE_QUANTITY' as const,
          productId,
          quantity,
        }))
      ),
      this.clearCart$.pipe(map(() => ({ type: 'CLEAR' as const })))
    )
      .pipe(
        // withLatestFrom để lấy state hiện tại
        withLatestFrom(this.cartState$),
        // scan để accumulate state (Redux pattern)
        scan((currentItems, [action, _]) => {
          return this.reducer(currentItems, action);
        }, [] as CartItem[])
      )
      .subscribe((newState) => {
        this.cartState$.next(newState);
        console.log('Cart state updated:', newState);
      });
  }

  // Reducer - pure function xử lý state transitions
  private reducer(items: CartItem[], action: CartAction): CartItem[] {
    switch (action.type) {
      case 'ADD':
        if (!action.product) return items;

        const existingIndex = items.findIndex((item) => item.product.id === action.product!.id);

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
          return [...items, { product: action.product, quantity: 1 }];
        }

      case 'REMOVE':
        if (!action.productId) return items;
        return items.filter((item) => item.product.id !== action.productId);

      case 'UPDATE_QUANTITY':
        if (!action.productId || action.quantity === undefined) return items;

        if (action.quantity <= 0) {
          return items.filter((item) => item.product.id !== action.productId);
        }

        return items.map((item) =>
          item.product.id === action.productId ? { ...item, quantity: action.quantity! } : item
        );

      case 'CLEAR':
        return [];

      default:
        return items;
    }
  }

  // Public methods - API cho components
  addToCart(product: Product): void {
    this.addItem$.next(product);
  }

  removeFromCart(productId: number): void {
    this.removeItem$.next(productId);
  }

  updateItemQuantity(productId: number, quantity: number): void {
    this.updateQuantity$.next({ productId, quantity });
  }

  increaseQuantity(productId: number): void {
    const currentItem = this.cartState$.value.find((item) => item.product.id === productId);
    if (currentItem) {
      this.updateQuantity$.next({
        productId,
        quantity: currentItem.quantity + 1,
      });
    }
  }

  decreaseQuantity(productId: number): void {
    const currentItem = this.cartState$.value.find((item) => item.product.id === productId);
    if (currentItem) {
      this.updateQuantity$.next({
        productId,
        quantity: currentItem.quantity - 1,
      });
    }
  }

  clear(): void {
    this.clearCart$.next();
  }

  // Cleanup
  destroy(): void {
    this.addItem$.complete();
    this.removeItem$.complete();
    this.updateQuantity$.complete();
    this.clearCart$.complete();
    this.cartState$.complete();
  }
}
