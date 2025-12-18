# 📜 Infinite Scroll với RxJS - Hướng dẫn chi tiết

## 🎯 Mục tiêu

Xây dựng tính năng Infinite Scroll (tải dữ liệu phân trang) với RxJS, tập trung vào:

- Tránh duplicate requests
- Quản lý loading state
- Hiểu rõ sự khác biệt giữa các flatMap operators

---

## 🔧 RxJS Operators được sử dụng

### 1. **exhaustMap** ⭐ (Quan trọng nhất!)

```typescript
this.loadMore$.pipe(exhaustMap(() => this.fetchPosts(nextPage)));
```

**Đặc điểm:**

- **Ignore** requests mới nếu request hiện tại chưa hoàn thành
- Tránh duplicate requests khi user scroll nhanh
- Perfect cho infinite scroll và button clicks

**Ví dụ:**

```
User scroll → Request 1 (đang chạy)
User scroll → Request 2 (BỊ IGNORE vì Request 1 chưa xong)
User scroll → Request 3 (BỊ IGNORE)
Request 1 xong → User scroll → Request 4 (được chạy)
```

---

### 2. **scan** (Accumulate state)

```typescript
scan((state: PaginationState, response) => {
  const allPosts = [...state.posts, ...response.posts];
  return {
    posts: allPosts,
    currentPage: state.currentPage + 1,
    isLoading: false,
    hasMore: response.posts.length === PAGE_SIZE,
  };
}, initialState);
```

**Đặc điểm:**

- Giống `reduce` nhưng emit mỗi lần accumulate
- Dùng để build up state từ nhiều responses
- Perfect cho pagination (append posts)

---

### 3. **tap** (Side effects)

```typescript
tap(() => {
  this.state$.next({
    ...currentState,
    isLoading: true,
  });
});
```

**Đặc điểm:**

- Thực hiện side effects (logging, set state)
- KHÔNG transform giá trị
- Dùng để set loading state trước khi gọi API

---

### 4. **filter** (Conditional execution)

```typescript
// Trong service method
if (currentState.isLoading || !currentState.hasMore) {
  return; // Không emit vào stream
}
```

**Đặc điểm:**

- Chỉ cho phép giá trị thỏa điều kiện đi qua
- Dùng để prevent load khi đang loading hoặc hết data

---

## 🔄 So sánh các FlatMap Operators

### **switchMap** - Cancel cái cũ, giữ cái mới

```typescript
searchInput$.pipe(switchMap((query) => this.search(query)));
```

**Behavior:**

```
Request 1 → Request 2 → Request 1 BỊ CANCEL
Request 2 → Request 3 → Request 2 BỊ CANCEL
Chỉ Request 3 hoàn thành
```

**Use cases:**

- ✅ Search / Autocomplete
- ✅ Typeahead
- ✅ Bất kỳ case nào chỉ cần kết quả mới nhất

---

### **mergeMap** (concatAll) - Chạy tất cả song song

```typescript
userIds$.pipe(mergeMap((id) => this.getUserDetails(id)));
```

**Behavior:**

```
Request 1 ──┐
Request 2 ──┼─→ Tất cả chạy song song
Request 3 ──┘
```

**Use cases:**

- ✅ Multiple independent API calls
- ✅ Parallel processing
- ❌ KHÔNG dùng cho search (sẽ có nhiều results)

---

### **concatMap** - Chạy tuần tự, đợi xong mới tiếp

```typescript
actions$.pipe(concatMap((action) => this.processAction(action)));
```

**Behavior:**

```
Request 1 → Đợi xong → Request 2 → Đợi xong → Request 3
```

**Use cases:**

- ✅ Sequential operations (upload files)
- ✅ Order matters
- ❌ KHÔNG dùng cho infinite scroll (chậm)

---

### **exhaustMap** ⭐ - Ignore cái mới nếu đang xử lý

```typescript
loadMore$.pipe(exhaustMap(() => this.fetchPosts()));
```

**Behavior:**

```
Request 1 (đang chạy)
Request 2 (IGNORE)
Request 3 (IGNORE)
Request 1 xong → Request 4 (chạy)
```

**Use cases:**

- ✅ Infinite scroll
- ✅ Button clicks (prevent double-click)
- ✅ Form submissions
- ✅ Bất kỳ case nào cần prevent duplicates

---

## 📊 Comparison Table

| Operator       | Behavior             | Use Case             | Example                          |
| -------------- | -------------------- | -------------------- | -------------------------------- |
| **switchMap**  | Cancel old, keep new | Search, Autocomplete | User gõ "abc" → chỉ search "abc" |
| **mergeMap**   | Run all in parallel  | Independent calls    | Load 10 users cùng lúc           |
| **concatMap**  | Sequential, wait     | Order matters        | Upload files theo thứ tự         |
| **exhaustMap** | Ignore new if busy   | Prevent duplicates   | Infinite scroll, Button clicks   |

---

## 🏗️ Architecture

### **Service (InfiniteScrollService)**

```typescript
@Injectable({ providedIn: 'root' })
export class InfiniteScrollService {
  private loadMore$ = new Subject<void>();
  private state$ = new BehaviorSubject<PaginationState>({
    posts: [],
    currentPage: 0,
    isLoading: false,
    hasMore: true,
  });

  constructor() {
    this.loadMore$
      .pipe(
        tap(() => this.setLoading(true)),
        exhaustMap(() => this.fetchPosts()),
        scan((state, response) => this.accumulate(state, response))
      )
      .subscribe((newState) => this.state$.next(newState));
  }

  loadMorePosts(): void {
    if (!this.state$.value.isLoading && this.state$.value.hasMore) {
      this.loadMore$.next();
    }
  }
}
```

**Responsibilities:**

- ✅ State management (BehaviorSubject)
- ✅ API calls
- ✅ RxJS operators logic
- ✅ Prevent duplicate requests

---

### **Component (InfiniteScrollComponent)**

```typescript
@Component({...})
export class InfiniteScroll {
  posts$ = this.service.posts$;
  isLoading$ = this.service.isLoading$;

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const threshold = 200;

    if (scrollPosition >= documentHeight - threshold) {
      this.service.loadMorePosts();
    }
  }
}
```

**Responsibilities:**

- ✅ Scroll detection
- ✅ Trigger load more
- ✅ Display data (async pipe)

---

## 🔑 Key Concepts

### 1. **Scroll Detection**

```typescript
@HostListener('window:scroll')
onScroll(): void {
  const scrollPosition = window.innerHeight + window.scrollY;
  const documentHeight = document.documentElement.scrollHeight;

  // Load trước 200px để UX mượt hơn
  if (scrollPosition >= documentHeight - 200) {
    this.loadMore();
  }
}
```

**Giải thích:**

- `window.innerHeight` - Chiều cao viewport
- `window.scrollY` - Vị trí scroll hiện tại
- `document.documentElement.scrollHeight` - Tổng chiều cao document
- Threshold 200px - Load trước để tránh user phải đợi

---

### 2. **Prevent Duplicate Requests**

**Cách 1: exhaustMap**

```typescript
this.loadMore$.pipe(exhaustMap(() => this.fetchPosts()));
```

**Cách 2: Check state**

```typescript
loadMorePosts(): void {
  if (this.state$.value.isLoading || !this.state$.value.hasMore) {
    return; // Don't emit
  }
  this.loadMore$.next();
}
```

**Best Practice:** Dùng CẢ HAI để double protection!

---

### 3. **State Management**

```typescript
interface PaginationState {
  posts: Post[];
  currentPage: number;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
}
```

**State transitions:**

```
Initial State
    ↓
User scrolls → isLoading = true
    ↓
API call → exhaustMap
    ↓
Response → scan accumulate
    ↓
New State → posts appended, currentPage++, isLoading = false
```

---

### 4. **Accumulate Posts với scan**

```typescript
scan((state, response) => {
  const newPosts = response.posts;
  const allPosts = [...state.posts, ...newPosts]; // Immutable!

  return {
    posts: allPosts,
    currentPage: state.currentPage + 1,
    isLoading: false,
    hasMore: newPosts.length === PAGE_SIZE,
  };
}, initialState);
```

**Quan trọng:**

- ✅ Immutable - Tạo array mới với spread operator
- ✅ Check hasMore - Nếu response < PAGE_SIZE thì hết data
- ✅ Update currentPage để track pagination

---

## 🎨 UI/UX Best Practices

### 1. **Loading Indicator**

```html
<div class="loading-container" *ngIf="isLoading$ | async">
  <div class="spinner"></div>
  <p>Loading more posts...</p>
</div>
```

### 2. **End of List Message**

```html
<div class="end-message" *ngIf="!(hasMore$ | async) && !(isLoading$ | async)">
  <p>🎉 You've reached the end!</p>
</div>
```

### 3. **Error Handling**

```html
<div class="error-container" *ngIf="error$ | async as error">
  <p>❌ {{ error }}</p>
  <button (click)="retry()">🔄 Retry</button>
</div>
```

### 4. **Fallback Load More Button**

```html
<button *ngIf="hasMore$ | async" (click)="loadMore()">⬇️ Load More</button>
```

---

## 🐛 Common Pitfalls

### ❌ **Pitfall 1: Không dùng exhaustMap**

```typescript
// WRONG - Có thể duplicate requests
this.loadMore$.pipe(
  switchMap(() => this.fetchPosts()) // ❌ Cancel request cũ
);
```

**Vấn đề:** User scroll nhanh → nhiều requests → chỉ lấy kết quả cuối

### ✅ **Fix:**

```typescript
// CORRECT
this.loadMore$.pipe(
  exhaustMap(() => this.fetchPosts()) // ✅ Ignore requests mới
);
```

---

### ❌ **Pitfall 2: Mutate state**

```typescript
// WRONG
scan((state, response) => {
  state.posts.push(...response.posts); // ❌ Mutate
  return state;
});
```

**Vấn đề:** Angular Change Detection có thể không detect

### ✅ **Fix:**

```typescript
// CORRECT
scan((state, response) => {
  return {
    ...state,
    posts: [...state.posts, ...response.posts], // ✅ Immutable
  };
});
```

---

### ❌ **Pitfall 3: Không check isLoading**

```typescript
// WRONG
loadMorePosts(): void {
  this.loadMore$.next(); // ❌ Luôn emit
}
```

**Vấn đề:** Có thể load khi đang loading hoặc hết data

### ✅ **Fix:**

```typescript
// CORRECT
loadMorePosts(): void {
  if (!this.state$.value.isLoading && this.state$.value.hasMore) {
    this.loadMore$.next(); // ✅ Check trước
  }
}
```

---

## 🎓 Learning Path

### Level 1: Hiểu cơ bản

- ✅ Scroll detection với HostListener
- ✅ API pagination
- ✅ Loading state

### Level 2: RxJS Operators

- ✅ exhaustMap vs switchMap vs mergeMap vs concatMap
- ✅ scan để accumulate
- ✅ tap cho side effects

### Level 3: State Management

- ✅ BehaviorSubject cho state
- ✅ Derived observables (isLoading$, hasMore$)
- ✅ Immutability

### Level 4: Advanced

- ✅ Error handling với catchError
- ✅ Retry logic
- ✅ Optimistic updates
- ✅ Virtual scrolling (performance)

---

## 📝 Summary

### **Khi nào dùng exhaustMap?**

- ✅ Infinite scroll
- ✅ Button clicks (prevent double-click)
- ✅ Form submissions
- ✅ Bất kỳ action nào cần prevent duplicates

### **Khi nào dùng switchMap?**

- ✅ Search / Autocomplete
- ✅ Typeahead
- ✅ Chỉ cần kết quả mới nhất

### **Khi nào dùng mergeMap?**

- ✅ Multiple independent API calls
- ✅ Parallel processing

### **Khi nào dùng concatMap?**

- ✅ Sequential operations
- ✅ Order matters

---

## 🚀 Next Steps

1. **Test với real API** - Thử với API thật có nhiều data
2. **Add virtual scrolling** - Optimize performance với CDK Virtual Scroll
3. **Add pull-to-refresh** - Thêm tính năng refresh
4. **Bidirectional scroll** - Load cả 2 hướng (lên và xuống)

---

**Happy Learning RxJS! 🎉**
