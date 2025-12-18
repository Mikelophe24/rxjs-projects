# Hướng dẫn Luồng chạy chức năng Smart Search (RxJS)

Tài liệu này giải thích chi tiết cách thức hoạt động của chức năng tìm kiếm thông minh sử dụng Angular và RxJS.

## 1. Sơ đồ luồng hoạt động (Data Flow)

```mermaid
graph TD
    A[Người dùng gõ phím] --> B{fromEvent}
    B --> C[map: Lấy giá trị chuỗi]
    C --> D[debounceTime: Đợi 400ms]
    D --> E[distinctUntilChanged: Kiểm tra khác biệt]
    E --> F{Kiểm tra rỗng?}
    F -- Rỗng --> G[Xóa kết quả cũ & return []]
    F -- Có chữ --> H[switchMap: Gọi API Search]
    H --> I[ProductService: Fetch & Filter]
    I --> J[Cập nhật UI & Gọi detectChanges]
```

## 2. Giải thích chi tiết các RxJS Operators

Chức năng này sử dụng một "Pipe" (đường ống) để xử lý dữ liệu từ lúc người dùng gõ đến khi hiện kết quả:

- **`fromEvent`**: Tạo một luồng dữ liệu (Stream) từ sự kiện `input` của ô tìm kiếm. Mỗi lần bạn gõ 1 chữ, một "viên bi" dữ liệu được bắn vào đường ống.
- **`map`**: Biến đổi sự kiện gốc (event) thành giá trị chuỗi đơn thuần (`event.target.value`).
- **`debounceTime(400)`**: Đây là bộ lọc "chống rung". Nó đợi cho đến khi bạn ngừng gõ trong 400ms mới cho dữ liệu đi tiếp.
  - _Mục đích:_ Tránh việc mỗi phím bấm gọi API một lần gây quá tải server.
- **`distinctUntilChanged`**: Chỉ cho phép dữ liệu đi tiếp nếu nó **khác** với lần gần nhất.
  - _Ví dụ:_ Nếu bạn gõ "Apple", sau đó xóa chữ "e" rồi gõ lại chữ "e" cực nhanh, kết quả vẫn là "Apple" -> Operator này sẽ chặn không cho gọi API lần nữa.
- **`switchMap`**: Đây là operator "quyền lực" nhất.
  - Nếu một Request tìm kiếm cũ đang chạy mà bạn lại gõ từ khóa mới, nó sẽ **Hủy (Aborted)** thẳng tay request cũ và bắt đầu request mới.
  - _Kết quả:_ Luôn luôn chỉ lấy kết quả của từ khóa sau cùng.
- **`catchError`**: "Lưới bảo hiểm". Nếu server sập hoặc mất mạng, nó sẽ bắt lỗi và trả về một mảng rỗng `of([])` để ứng dụng không bị "chết" (crash).

## 3. Tại sao UI cần `ChangeDetectorRef`?

Vì chúng ta đang xử lý dữ liệu trong một luồng RxJS không đồng bộ bên ngoài cơ chế kiểm tra thông thường của Angular (sau khi View đã Init), nên đôi khi Angular không biết là biến `results` đã thay đổi.

- Lệnh `this.cdr.detectChanges()` giống như việc ta nhắc nhở Angular: _"Này, có dữ liệu mới rồi, vẽ lại màn hình đi!"_

## 4. Cách thức hoạt động của Backend (JSON Server)

- Dữ liệu được lưu trong file `db.json`.
- `ProductService` sẽ lấy toàn bộ danh sách và thực hiện lọc bằng JavaScript `.filter()` để đảm bảo tìm kiếm hoạt động chính xác trên mọi môi trường.

---

_Hy vọng tài liệu này giúp bạn hiểu sâu hơn về sức mạnh của RxJS trong việc xử lý các luồng dữ liệu thời gian thực!_
