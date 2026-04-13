<p align="center">
  <a href="https://www.uit.edu.vn/" title="University of Information Technology">
    <img src="https://i.imgur.com/WmMnSRt.png" alt="University of Information Technology (UIT)" width="700">
  </a>
</p>

<h1 align="center"><b>CS105 - Computer Graphics — Fractal Explorer</b></h1>

## Thành viên nhóm

| MSSV | Họ và tên | GitHub | Email |
|:----:|-----------|--------|-------|
| 23520880 | Nguyễn Bá Long | [NBasLongz](https://github.com/NBasLongz) | 23520880@gm.uit.edu.vn |
| 23520036 | Cáp Kim Hải Anh | — | 23520036@gm.uit.edu.vn |

---

## Giới thiệu

Dự án trực quan hóa **6 mô hình fractal kinh điển** bằng WebGL, phục vụ môn học **CS105 - Đồ họa máy tính**. Giao diện được chia thành 4 khu vực thám hiểm riêng biệt, mỗi khu vực có trang độc lập với đầy đủ điều khiển tương tác.

---

## Cấu trúc thư mục

```text
Fractal/
├── index.html                  # Trang chủ — menu điều hướng chính
├── README.md                   # File này
├── css/
│   └── style.css               # CSS dùng chung cho toàn bộ dự án
│
├── vankoch/                    # 01 — Von Koch Snowflake
│   ├── index.html              # Giao diện + điều khiển
│   ├── main.js                 # Logic đệ quy tạo bông tuyết
│   └── gl-utils.js             # Tiện ích WebGL
│
├── minkowski/                  # 02 — Minkowski Island
│   ├── index.html
│   ├── main.js                 # Logic đệ quy tạo đảo Minkowski
│   └── gl-utils.js
│
├── sierpinski/                 # 03 — Sierpinski Systems
│   ├── index.html              # Tab chuyển đổi Triangle ↔ Carpet
│   ├── main.js                 # Logic đệ quy cho cả Triangle và Carpet
│   └── gl-utils.js
│
└── mandelbrot-julia/           # 04 — Complex Sets
    ├── index.html              # Tab chuyển đổi Mandelbrot ↔ Julia
    ├── main.js                 # GPU Shader: 4 mode Mandelbrot + 3 mode Julia
    └── gl-utils.js
```

---

## Nội dung từng khu vực

### 01 · Von Koch Snowflake (`vankoch/`)
- Vẽ bông tuyết đệ quy bằng **CPU geometry** + WebGL LINE_LOOP.
- Level 0–12, Level 12 tạo ~3 triệu đoạn thẳng.
- Công thức: mỗi cạnh được chia thành 4 đoạn mới theo góc 60°.

### 02 · Minkowski Island (`minkowski/`)
- Đường cong fractal hình vuông — mỗi đoạn biến thành 8 đoạn nhỏ hơn.
- Level 0–7, sử dụng **CPU geometry** + WebGL LINE_LOOP.
- Chiều dài đường cong tăng 8× mỗi bước.

### 03 · Sierpinski Systems (`sierpinski/`)
- **Triangle** (Tam giác Sierpinski): Level 0–10, dùng TRIANGLES. Mỗi level có 3ⁿ tam giác.
- **Carpet** (Thảm Sierpinski): Level 0–8, dùng TRIANGLES. Mỗi level có 8ⁿ ô vuông.
- Hai chế độ chuyển đổi bằng **tab** trên cùng trang.

### 04 · Mandelbrot & Julia Set (`mandelbrot-julia/`)
- **Mandelbrot**: 4 chế độ hiển thị — Basic, Smooth Coloring, Iterations (Anim), Party (Anim).
  - Hỗ trợ scroll zoom, kéo pan, phím mũi tên.
  - 5 bảng màu tùy chọn (Basic mode).
- **Julia Set**: 3 chế độ — Classic, Smooth Coloring, Animated Trip.
  - 8 preset hằng số c nổi tiếng.
  - Chế độ Animate tự động xoay c theo quỹ đạo.
- Toàn bộ tính toán chạy trên **GPU** qua GLSL Fragment Shader.

---

## Công nghệ sử dụng

| Công nghệ | Vai trò |
|-----------|---------|
| **WebGL 1.0** | Render đồ họa trực tiếp trên GPU |
| **GLSL (Fragment Shader)** | Tính toán fractal phức theo từng pixel |
| **JavaScript ES Modules** | Tổ chức code theo module |
| **HTML5 / CSS3** | Giao diện và điều khiển |

---

## Cách chạy

> **Lưu ý:** Dự án dùng ES Modules, cần chạy qua **local server** — không thể mở thẳng file HTML bằng trình duyệt.

**Cách 1 — VS Code Live Server (khuyến nghị):**
1. Cài extension **Live Server** trong VS Code.
2. Chuột phải vào `index.html` → **Open with Live Server**.

**Cách 2 — Python HTTP Server:**
```bash
cd Fractal/
python -m http.server 8000
```
Sau đó mở `http://localhost:8000` trong trình duyệt.

---

## Điều hướng

- Từ **trang chủ** (`index.html`): click vào card bất kỳ để vào khu vực đó.
- Trong mỗi trang con: nút **← Trang chủ** ở góc trên bên phải để quay lại.
- Trang **Sierpinski** và **Mandelbrot & Julia**: dùng tab ở đầu trang để chuyển đổi giữa hai fractal.

---

*© 2026 — CS105 Fractal Explorer — Đại học Công nghệ Thông tin (UIT)*
