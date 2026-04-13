<p align="center">
  <a href="https://www.uit.edu.vn/" title="University of Information Technology">
    <img src="https://i.imgur.com/WmMnSRt.png" alt="University of Information Technology (UIT)" width="700">
  </a>
</p>

<h1 align="center"><b>CS105 - Computer Graphics — Fractal Explorer</b></h1>

## Thành viên nhóm

| MSSV | Họ và tên | GitHub | Email |
|:----:|-----------|--------|-------|
| 23520880 | Nguyễn Bá Long  | -- | 23520880@gm.uit.edu.vn |
| 23520036 | Cáp Kim Hải Anh | -- | 23520036@gm.uit.edu.vn |
---

## Giới thiệu

Dự án trực quan hóa **6 mô hình fractal kinh điển** bằng WebGL, phục vụ môn học **CS105 - Đồ họa máy tính**. 

---

## Cấu trúc thư mục

```text
Fractal/
├── index.html                  # Trang chủ — menu điều hướng (6 card)
├── README.md                   # File này
├── css/
│   └── style.css               # CSS dùng chung cho toàn bộ dự án
│
├── vankoch/                    # 01 — Von Koch Snowflake
│   ├── index.html
│   ├── main.js
│   └── gl-utils.js
│
├── minkowski/                  # 02 — Minkowski Island
│   ├── index.html
│   ├── main.js
│   └── gl-utils.js
│
├── sierpinski-triangle/        # 03 — Sierpinski Triangle
│   ├── index.html
│   ├── main.js
│   └── gl-utils.js
│
├── sierpinski-carpet/          # 04 — Sierpinski Carpet
│   ├── index.html
│   ├── main.js
│   └── gl-utils.js
│
├── mandelbrot/                 # 05 — Mandelbrot Set
│   ├── index.html
│   ├── main.js
│   └── gl-utils.js
│
└── julia/                      # 06 — Julia Set
    ├── index.html
    ├── main.js
    └── gl-utils.js
```

---

## Nội dung từng mô hình

### 01 Von Koch Snowflake (`vankoch/`)
Bông tuyết đệ quy — mỗi cạnh được chia thành 4 đoạn theo góc 60°. Level 0–12, tạo tới ~3 triệu đoạn thẳng tại level cao nhất. Render bằng CPU geometry + WebGL `LINE_LOOP`.

### 02 Minkowski Island (`minkowski/`)
Đường cong biên giới fractal hình vuông — mỗi đoạn biến thành 8 đoạn nhỏ hơn. Level 0–7, chiều dài đường cong tăng 8× mỗi bước. Render bằng CPU geometry + WebGL `LINE_LOOP`.

### 03 Sierpinski Triangle (`sierpinski-triangle/`)
Tam giác fractal tự tương đồng — chia thành 4 tam giác con, bỏ tam giác giữa, đệ quy trên 3 góc. Level 0–10, tạo 3ⁿ tam giác tại level n. Render bằng CPU geometry + WebGL `TRIANGLES`.

### 04 Sierpinski Carpet (`sierpinski-carpet/`)
Hình vuông fractal — chia lưới 3×3, xóa ô trung tâm, đệ quy trên 8 ô còn lại. Level 0–8, tạo 8ⁿ ô tại level n. Render bằng CPU geometry + WebGL `TRIANGLES`.

### 05 Mandelbrot Set (`mandelbrot/`)
Tập hợp phức nổi tiếng nhất — tính toán toàn bộ trên **GPU** qua GLSL Fragment Shader. Hỗ trợ:
- **4 chế độ hiển thị**: Basic Fractal, Smooth Coloring, Iterations (Anim), Party (Anim)
- **Zoom/Pan**: Scroll chuột, kéo, phím mũi tên, double-click reset
- **5 bảng màu** tùy chọn (ở Basic mode)

### 06 Julia Set (`julia/`)
Tập Julia với hằng số c tùy chỉnh — tính toán toàn bộ trên **GPU**. Hỗ trợ:
- **3 chế độ hiển thị**: Classic Julia, Smooth Coloring, Animated Trip
- **8 preset** hằng số c nổi tiếng (Spiral, Dragon, Dendrite, ...)
- **Animate**: tự động xoay c theo quỹ đạo tròn


---

## Clone + Release ZIP

1. `git clone https://github.com/NBasLongz/CS105-Fractal-Explorer.git`
2. Download `FractalExplorer-portable.zip` từ GitHub Release hoặc Google Drive.
3. Giải nén ZIP.
4. Mở `Demo/Fractal Explorer-win32-x64/Fractal Explorer.exe`.

> Nếu bạn chỉ muốn chạy chương trình mà không cần sửa code, đây là cách nhanh nhất.

---

## Cách chạy

> **Lưu ý:** Dự án dùng ES Modules nên **bắt buộc** chạy qua local server nếu mở source trực tiếp.

**Cách 1 — VS Code Live Server (khuyến nghị):**
1. Cài extension **Live Server** trong VS Code.
2. Chuột phải vào `index.html` ở thư mục gốc → **Open with Live Server**.

**Cách 2 — Python:**
```bash
cd Fractal/
python -m http.server 8000
```
Mở `http://localhost:8000` trong trình duyệt.

---


*© 2026 — CS105 Fractal Explorer — Đại học Công nghệ Thông tin (UIT)*
