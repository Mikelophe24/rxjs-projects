# 🏗️ Service Architecture Pattern

## Tại sao nên tách logic ra Service?

### ❌ **Trước khi refactor** (Logic trong Component)

```typescript
@Component({...})
export class CartComponent {
  // Component có quá nhiều responsibility:
  // 1. Presentation logic
  // 2. Business logic
  // 3. State management
  // 4. RxJS operators

  private addItem$ = new Subject<Product>();
  private cartState$ = new BehaviorSubject<CartItem[]>([]);

  constructor() {
    // Complex RxJS logic trong component
    merge(this.addItem$, this.removeItem$)
      .pipe(scan(...), withLatestFrom(...))
      .subscribe(...);
  }
}
```

**Vấn đề:**

- Component quá phức tạp, khó test
- Không thể reuse logic ở component khác
- Khó maintain khi project lớn
- Mixing presentation và business logic

---

### ✅ **Sau khi refactor** (Logic trong Service)

#### **Service (Business Logic)**

```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private cartState$ = new BehaviorSubject<CartItem[]>([]);

  // Public API
  public cartItems$ = this.cartState$.asObservable();
  public totalPrice$ = this.cartItems$.pipe(...);

  addToCart(product: Product): void {
    // Business logic here
  }
}
```

#### **Component (Presentation Logic)**

```typescript
@Component({...})
export class CartComponent {
  // Chỉ expose observables cho template
  cartItems$ = this.cartService.cartItems$;
  totalPrice$ = this.cartService.totalPrice$;

  constructor(private cartService: CartService) {}

  // Delegate to service
  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }
}
```

**Lợi ích:**

- ✅ Component đơn giản, chỉ lo presentation
- ✅ Service có thể reuse ở nhiều component
- ✅ Dễ test (mock service)
- ✅ Separation of Concerns
- ✅ Single Responsibility Principle

---

## 📊 So sánh Architecture

### **Component-based Logic** (Không tốt)

```
┌─────────────────────────────┐
│      Component              │
│  ┌─────────────────────┐   │
│  │ Presentation Logic  │   │
│  ├─────────────────────┤   │
│  │ Business Logic      │   │
│  ├─────────────────────┤   │
│  │ State Management    │   │
│  ├─────────────────────┤   │
│  │ RxJS Operators      │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

### **Service-based Logic** (Tốt)

```
┌──────────────────┐         ┌──────────────────┐
│   Component      │────────▶│    Service       │
│                  │         │                  │
│ - Presentation   │         │ - Business Logic │
│ - Template       │         │ - State Mgmt     │
│ - User Events    │         │ - RxJS Operators │
│ - Delegate calls │         │ - API Calls      │
└──────────────────┘         └──────────────────┘
```

---

## 🎯 Khi nào nên tách ra Service?

### ✅ **NÊN tách ra Service khi:**

1. Logic phức tạp (nhiều RxJS operators)
2. Cần reuse logic ở nhiều component
3. State management (BehaviorSubject, scan, etc.)
4. API calls
5. Business rules

### ❌ **KHÔNG cần Service khi:**

1. Logic đơn giản (chỉ 1-2 operators)
2. Chỉ dùng trong 1 component
3. Pure presentation logic (show/hide, formatting)

---

## 📝 Examples trong Project

### 1. **CartService**

```typescript
// ✅ TỐT - Complex state management
@Injectable({ providedIn: 'root' })
export class CartService {
  private cartState$ = new BehaviorSubject<CartItem[]>([]);

  constructor() {
    // Complex RxJS pipeline
    merge(addItem$, removeItem$, updateQuantity$)
      .pipe(
        withLatestFrom(this.cartState$),
        scan((state, [action, _]) => reducer(state, action))
      )
      .subscribe((newState) => this.cartState$.next(newState));
  }
}
```

### 2. **FormValidationService**

```typescript
// ✅ TỐT - Reusable validation logic
@Injectable({ providedIn: 'root' })
export class FormValidationService {
  createEmailValidation(control: FormControl): Observable<string | null> {
    return control.valueChanges.pipe(
      debounceTime(300),
      map(() => this.validateEmail(control))
    );
  }
}
```

### 3. **Timer Component**

```typescript
// ⚠️ OK - Simple logic, không cần service
@Component({...})
export class TimerComponent {
  start(): void {
    interval(1000)
      .pipe(takeUntil(this.pause$))
      .subscribe(tick => this.currentSeconds++);
  }
}
```

---

## 🔄 Refactoring Steps

### Bước 1: Identify logic cần tách

```typescript
// Component hiện tại
private addItem$ = new Subject<Product>();
merge(this.addItem$, this.removeItem$)
  .pipe(scan(...))
  .subscribe(...);
```

### Bước 2: Tạo Service

```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private addItem$ = new Subject<Product>();

  addToCart(product: Product): void {
    this.addItem$.next(product);
  }
}
```

### Bước 3: Inject Service vào Component

```typescript
constructor(private cartService: CartService) {}
```

### Bước 4: Delegate calls

```typescript
addToCart(product: Product): void {
  this.cartService.addToCart(product);
}
```

---

## 🎓 Best Practices

### 1. **Service API Design**

```typescript
// ✅ TỐT - Clear public API
export class CartService {
  // Public observables (read-only)
  public cartItems$: Observable<CartItem[]>;
  public totalPrice$: Observable<number>;

  // Public methods (actions)
  addToCart(product: Product): void {}
  removeFromCart(id: number): void {}

  // Private implementation
  private cartState$ = new BehaviorSubject<CartItem[]>([]);
  private addItem$ = new Subject<Product>();
}
```

### 2. **Component Simplicity**

```typescript
// ✅ TỐT - Component chỉ delegate
export class CartComponent {
  cartItems$ = this.service.cartItems$;

  addToCart(p: Product) {
    this.service.addToCart(p);
  }
}
```

### 3. **Testing**

```typescript
// ✅ TỐT - Dễ test với mock service
describe('CartComponent', () => {
  let mockService = {
    cartItems$: of([]),
    addToCart: jasmine.createSpy(),
  };

  // Test component với mock service
});
```

---

## 📚 Tổng kết

| Aspect             | Component      | Service          |
| ------------------ | -------------- | ---------------- |
| **Responsibility** | Presentation   | Business Logic   |
| **Reusability**    | Không          | Có               |
| **Testability**    | Khó            | Dễ               |
| **Complexity**     | Đơn giản       | Phức tạp OK      |
| **State**          | Local UI state | Shared app state |

**Golden Rule:**

> "Component should be dumb, Service should be smart"

---

**Happy Coding! 🚀**
