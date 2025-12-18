# 🚀 RxJS Learning Projects

Đây là tập hợp các dự án học RxJS từ cơ bản đến nâng cao, mỗi dự án tập trung vào một nhóm operators và concepts cụ thể.

## 📋 Danh sách Projects

### 1. **Search Component** - `/search`

**Mô tả:** Tìm kiếm sản phẩm realtime với debounce và API calls

**RxJS Operators:**

- `debounceTime` - Đợi user ngừng gõ trước khi search
- `distinctUntilChanged` - Chỉ search khi query thay đổi
- `switchMap` - Cancel request cũ khi có request mới
- `catchError` - Xử lý lỗi API

**Concepts:**

- Debouncing user input
- Canceling previous requests
- Error handling
- Loading states

---

### 2. **Timer / Stopwatch** - `/timer`

**Mô tả:** Đồng hồ đếm giờ với Start/Pause/Reset

**RxJS Operators:**

- `interval` - Tạo Observable emit mỗi giây
- `takeUntil` - Dừng Observable khi pause
- `scan` - Tích lũy giá trị theo thời gian
- `map` - Transform giá trị
- `startWith` - Emit ngay lập tức (fix delay)

**Concepts:**

- Cold vs Hot Observables
- Observable lifecycle control
- Subject để control flow
- Change Detection trong Angular

**Key Learning:**

- `interval()` là **Cold Observable** - chỉ bắt đầu khi có subscriber
- `Subject` là **Hot Observable** - có thể emit trước khi có subscriber
- `takeUntil()` + `ngOnDestroy()` để cleanup subscriptions

---

### 3. **Shopping Cart** - `/cart`

**Mô tả:** Giỏ hàng realtime với Add/Remove/Update quantity

**RxJS Operators:**

- `merge` - Kết hợp nhiều action streams thành một
- `scan` - Accumulate state như Redux reducer
- `withLatestFrom` - Lấy state hiện tại khi action xảy ra
- `map` - Transform data và tính derived state

**Concepts:**

- **State Management** với RxJS
- **Redux Pattern**: Actions → Reducer → New State
- **Derived State**: totalPrice$ và totalItems$ tự động tính từ cart state
- **Immutability**: Luôn tạo object/array mới thay vì mutate
- **Service Architecture**: Tách business logic ra CartService

**Architecture:**

```
Component (Presentation)
    ↓
CartService (Business Logic)
    ↓
RxJS State Management
    ↓
Observables (cartItems$, totalPrice$, totalItems$)
```

---

### 4. **Form Validation** - `/form`

**Mô tả:** Form validation realtime với email, password, confirm password

**RxJS Operators:**

- `combineLatest` - Combine nhiều validation observables
- `map` - Transform validation state thành error messages
- `startWith` - Emit giá trị ban đầu ngay lập tức
- `debounceTime` - Đợi 300ms sau khi user ngừng gõ mới validate

**Concepts:**

- **Reactive Forms** đúng nghĩa
- **Real-time Validation** với debounce
- **Combining Observables** để check form validity
- **Derived State**: isFormValid$ từ các validation observables
- **Service Architecture**: Tách validation logic ra FormValidationService

**Validation Flow:**

```
User Input
    ↓
debounceTime(300ms)
    ↓
Validation Logic
    ↓
Error Message Observable
    ↓
combineLatest → isFormValid$
    ↓
Enable/Disable Submit Button
```

---

## 🎯 Key RxJS Concepts Learned

### 1. **Cold vs Hot Observables**

- **Cold**: `interval()`, `of()`, `from()` - chỉ bắt đầu khi có subscriber
- **Hot**: `Subject`, `BehaviorSubject` - có thể emit trước khi có subscriber

### 2. **State Management Pattern**

```typescript
Actions (Subject)
    → merge()
    → withLatestFrom(currentState)
    → scan(reducer)
    → New State
```

### 3. **Combining Observables**

- `merge` - Emit khi bất kỳ observable nào emit
- `combineLatest` - Emit khi tất cả đều có giá trị và bất kỳ cái nào emit
- `withLatestFrom` - Lấy latest value từ observable khác

### 4. **Transformation Operators**

- `map` - Transform từng giá trị
- `scan` - Accumulate giá trị (như reduce nhưng emit mỗi lần)
- `switchMap` - Switch sang observable mới, cancel cái cũ

### 5. **Filtering & Timing**

- `debounceTime` - Đợi một khoảng thời gian
- `distinctUntilChanged` - Chỉ emit khi giá trị thay đổi
- `filter` - Lọc giá trị theo điều kiện
- `takeUntil` - Dừng khi observable khác emit

### 6. **Error Handling**

- `catchError` - Xử lý lỗi và return fallback observable
- `retry` - Thử lại khi có lỗi

### 7. **Lifecycle Management**

- `takeUntil(destroy$)` - Auto unsubscribe khi component destroy
- `ngOnDestroy()` - Cleanup subscriptions

---

## 🏗️ Architecture Best Practices

### ✅ **Nên làm:**

1. **Tách logic ra Service** - Component chỉ nên có presentation logic
2. **Sử dụng async pipe** - Tự động subscribe/unsubscribe
3. **takeUntil pattern** - Cleanup subscriptions trong ngOnDestroy
4. **Immutability** - Luôn tạo object/array mới
5. **Typed Observables** - Sử dụng TypeScript interfaces

### ❌ **Không nên:**

1. Subscribe trong component nếu có thể dùng async pipe
2. Mutate state trực tiếp
3. Quên unsubscribe (memory leak)
4. Nested subscriptions (callback hell)

---

## 📚 Tài liệu tham khảo

- [RxJS Official Docs](https://rxjs.dev/)
- [Learn RxJS](https://www.learnrxjs.io/)
- [RxJS Marbles](https://rxmarbles.com/) - Visualize operators

---

## 🚀 Chạy project

```bash
# Install dependencies
npm install

# Start dev server
ng serve

# Navigate to
http://localhost:4200
```

---

**Happy Learning RxJS! 🎉**
