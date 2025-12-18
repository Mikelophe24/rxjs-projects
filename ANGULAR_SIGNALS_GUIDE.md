# 🎯 Angular Signals - Complete Guide

## 📚 Project Overview

Dự án này demo **Angular Signals** - hệ thống reactive state management mới của Angular (từ v16+).

### 🗂️ Implementations:

1. **RxJS Cart** (`/cart`) - Traditional approach với Observables
2. **Signal Cart** (`/signal-cart`) - Modern approach với Angular Signals ⭐

---

## ✅ Current Setup

### **Angular Version:** 20.3.15

### **Signals:** Built-in (không cần external packages)

```json
{
  "dependencies": {
    "@angular/core": "^20.3.15"
    // Signals built-in, không cần @ngrx/signals!
  }
}
```

---

## 🎯 Why Angular Signals Built-in?

### ✅ **Advantages:**

1. **No Installation Required**

   - Built-in từ Angular 16+
   - Không dependency conflicts
   - Smaller bundle size

2. **Simple & Powerful**

   ```typescript
   import { signal, computed } from '@angular/core';

   const count = signal(0);
   const double = computed(() => count() * 2);
   ```

3. **Full Feature Set**

   - `signal()` - Writable signals
   - `computed()` - Derived values
   - `effect()` - Side effects
   - Type-safe
   - Auto cleanup

4. **Official Angular Solution**
   - Recommended by Angular team
   - Long-term support
   - Future-proof

### ❌ **Why NOT @ngrx/signals?**

1. **Dependency Issues**

   - Version conflicts
   - Peer dependency problems
   - Installation complexity

2. **Not Essential**

   - Adds helper functions only
   - Can be replicated with built-in signals
   - Extra complexity

3. **Learning Curve**
   - More concepts to learn
   - Additional API surface
   - Not necessary for most use cases

---

## 💻 Angular Signals API

### 1. **signal() - Writable Signal**

```typescript
import { signal } from '@angular/core';

// Create signal
const count = signal(0);

// Read value
console.log(count()); // 0

// Set value
count.set(10);

// Update based on current value
count.update((n) => n + 1);
```

### 2. **computed() - Derived Signal**

```typescript
import { computed } from '@angular/core';

const count = signal(0);
const double = computed(() => count() * 2);

console.log(double()); // 0
count.set(5);
console.log(double()); // 10 - auto updates!
```

### 3. **effect() - Side Effects**

```typescript
import { effect } from '@angular/core';

const count = signal(0);

effect(() => {
  console.log('Count changed:', count());
  // Runs automatically when count changes
});

count.set(5); // Logs: "Count changed: 5"
```

### 4. **asReadonly() - Read-only Signal**

```typescript
class Store {
  private _count = signal(0);
  readonly count = this._count.asReadonly();

  increment() {
    this._count.update((n) => n + 1);
  }
}

// Outside code can read but not write
const store = new Store();
console.log(store.count()); // ✅ OK
store.count.set(10); // ❌ Error: readonly
```

---

## 🏗️ Signal Cart Architecture

### **Store Pattern:**

```typescript
@Injectable({ providedIn: 'root' })
export class SignalCartStore {
  // 1. Private writable signal
  private readonly _cartItems = signal<CartItem[]>([]);

  // 2. Public readonly signal
  readonly cartItems = this._cartItems.asReadonly();

  // 3. Computed signals
  readonly totalPrice = computed(() => {
    return this._cartItems().reduce((total, item) => total + item.product.price * item.quantity, 0);
  });

  readonly totalItems = computed(() => {
    return this._cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  // 4. Methods to update state
  addToCart(product: Product): void {
    this._cartItems.update((items) => {
      // Immutable update
      return [...items, { product, quantity: 1 }];
    });
  }
}
```

### **Component Usage:**

```typescript
export class SignalCart {
  constructor(public store: SignalCartStore) {}

  // Computed in component
  readonly summary = computed(() => ({
    items: this.store.cartItems(),
    total: this.store.totalPrice(),
    count: this.store.totalItems(),
  }));
}
```

### **Template:**

```html
<!-- No async pipe needed! -->
@if (summary().count > 0) { @for (item of summary().items; track item.product.id) {
<div>{{ item.product.name }}</div>
}
<p>Total: ${{ summary().total }}</p>
}
```

---

## 🔄 Migration from RxJS

### **Before (RxJS):**

```typescript
// Service
private cartState$ = new BehaviorSubject<CartItem[]>([]);
public cartItems$ = this.cartState$.asObservable();

public totalPrice$ = this.cartItems$.pipe(
  map(items => items.reduce((sum, item) =>
    sum + item.product.price * item.quantity, 0
  ))
);

// Component
cartItems$: Observable<CartItem[]>;

ngOnInit() {
  this.cartItems$ = this.cartService.cartItems$;
}

ngOnDestroy() {
  // Manual cleanup
}

// Template
<div *ngIf="cartItems$ | async as items">
  <div *ngFor="let item of items">
    {{ item.product.name }}
  </div>
  <p>Total: ${{ (totalPrice$ | async) || 0 }}</p>
</div>
```

### **After (Signals):**

```typescript
// Store
private _cartItems = signal<CartItem[]>([]);
readonly cartItems = this._cartItems.asReadonly();

readonly totalPrice = computed(() =>
  this._cartItems().reduce((sum, item) =>
    sum + item.product.price * item.quantity, 0
  )
);

// Component
constructor(public store: SignalCartStore) {}
// No ngOnInit, no ngOnDestroy needed!

// Template
@if (store.cartItems().length) {
  @for (item of store.cartItems(); track item.product.id) {
    {{ item.product.name }}
  }
  <p>Total: ${{ store.totalPrice() }}</p>
}
```

**Benefits:**

- ✅ Less boilerplate
- ✅ No async pipe
- ✅ Auto cleanup
- ✅ Better performance
- ✅ Easier to read

---

## 📊 Performance Benefits

### **Change Detection:**

**RxJS (Zone.js):**

```
User Action
  → Zone.js detects change
  → Check ENTIRE component tree
  → Update affected components
```

**Signals (Fine-grained):**

```
User Action
  → Signal updated
  → ONLY affected components notified
  → Update ONLY those components
```

**Result:** Signals are **significantly faster** for large apps!

---

## 🎓 Best Practices

### ✅ **DO:**

1. **Use signals for local state**

   ```typescript
   private _count = signal(0);
   ```

2. **Use computed for derived values**

   ```typescript
   readonly double = computed(() => this._count() * 2);
   ```

3. **Make signals readonly when exposing**

   ```typescript
   readonly count = this._count.asReadonly();
   ```

4. **Use update() for immutable updates**

   ```typescript
   this._items.update((items) => [...items, newItem]);
   ```

5. **Combine with RxJS for async operations**
   ```typescript
   loadData() {
     this.http.get('/api/data').subscribe(data => {
       this._data.set(data); // RxJS → Signal
     });
   }
   ```

### ❌ **DON'T:**

1. **Don't mutate signal values**

   ```typescript
   // ❌ BAD
   this._items().push(newItem);

   // ✅ GOOD
   this._items.update((items) => [...items, newItem]);
   ```

2. **Don't use signals for complex async**

   ```typescript
   // ❌ BAD - use RxJS instead
   const data = signal(null);
   setInterval(() => data.set(fetch('/api')), 1000);

   // ✅ GOOD
   interval(1000)
     .pipe(switchMap(() => this.http.get('/api')))
     .subscribe((data) => this._data.set(data));
   ```

3. **Don't create signals in computed**

   ```typescript
   // ❌ BAD
   const bad = computed(() => signal(this.count() * 2));

   // ✅ GOOD
   const good = computed(() => this.count() * 2);
   ```

---

## 🔗 Hybrid Approach (Recommended)

**Use BOTH Signals and RxJS together!**

```typescript
@Injectable()
export class ProductStore {
  private http = inject(HttpClient);

  // Signals for state
  private _products = signal<Product[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // RxJS for async operations
  loadProducts(): void {
    this._loading.set(true);
    this._error.set(null);

    this.http
      .get<Product[]>('/api/products')
      .pipe(
        catchError((err) => {
          this._error.set(err.message);
          return of([]);
        }),
        finalize(() => this._loading.set(false))
      )
      .subscribe((products) => {
        this._products.set(products);
      });
  }

  // Or use toSignal() to convert Observable to Signal
  readonly products$ = toSignal(this.http.get<Product[]>('/api/products'), { initialValue: [] });
}
```

---

## 📖 Resources

- [Angular Signals Official Docs](https://angular.io/guide/signals)
- [Angular v16 Release (Signals intro)](https://blog.angular.io/angular-v16-is-here-4d7a28ec680d)
- [Signals RFC](https://github.com/angular/angular/discussions/49090)
- [Signal Cart Demo](/signal-cart)
- [RxJS Cart Demo](/cart)

---

## 🎯 Summary

### **Angular Signals Built-in:**

- ✅ **Simple** - Easy to learn and use
- ✅ **Powerful** - Covers 95% of use cases
- ✅ **Fast** - Fine-grained reactivity
- ✅ **Official** - Recommended by Angular team
- ✅ **No Dependencies** - Built-in to Angular
- ✅ **Future-proof** - Long-term support

### **When to use:**

- ✅ Local component state
- ✅ Derived/computed values
- ✅ Simple state management
- ✅ New Angular projects (16+)

### **When to use RxJS instead:**

- ✅ HTTP requests
- ✅ WebSockets
- ✅ Time-based operations (debounce, throttle)
- ✅ Complex stream transformations
- ✅ Operators like switchMap, mergeMap, etc.

---

**🎉 Enjoy coding with Angular Signals!**
