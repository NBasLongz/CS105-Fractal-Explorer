<p align="center">
  <a href="https://www.uit.edu.vn/" title="University of Information Technology">
    <img src="https://i.imgur.com/WmMnSRt.png" alt="University of Information Technology (UIT)" width="700">
  </a>
</p>

<h1 align="center"><b>CS105 - Computer Graphics</b></h1>

## Student Information

| Student ID | Full Name | GitHub | Email |
|:--------------:|----------------------|---------------------------------------------|----------------------------|
| 23520880 | Nguyen Ba Long | [NBasLongz](https://github.com/NBasLongz) | 23520880@gm.uit.edu.vn |
| 23520036 | Cap Kim Hai Anh | | 23520036@gm.uit.edu.vn |

---

# Fractal Explorer — CS105 🌀

![WebGL](https://img.shields.io/badge/WebGL-Fractal_Explorer-1d4ed8?style=for-the-badge&logo=webgl&logoColor=white)
![Course](https://img.shields.io/badge/Course-CS105_Computer_Graphics-orange?style=for-the-badge)

This project is part of the **CS105: Computer Graphics** course. It focuses on showing and exploring the world of mathematical Fractals using the power of WebGL.

---

## Main Features

This web app allows you to explore 6 classic Fractal models with an easy-to-use interface:

1.  **Von Koch Snowflake**: A geometric shape made by repeating simple steps on the CPU. It shows a very long border in a small area.
2.  **Minkowski Island**: A square-based fractal curve that becomes more complex at each level.
3.  **Sierpinski Triangle**: A famous triangle made of many smaller triangles that look exactly like the big one.
4.  **Sierpinski Carpet**: A square fractal created by repeating a 3x3 pattern many times.
5.  **Mandelbrot Set**: The most popular fractal. You can zoom in deeply and move around smoothly using the power of your GPU.
6.  **Julia Set**: Explore many different shapes of the Julia set. It includes 8 presets and an "Animate" mode for cool effects.

## Technologies Used

The project is organized into shared modules and made to run fast:

-   **Core**: HTML5 and Vanilla JavaScript (using ES Modules).
-   **Graphics**: WebGL (GLSL Shaders) to calculate many pixels at the same time on the GPU.
-   **Styling**: Vanilla CSS with a responsive design that works well on different screen sizes.
-   **Fonts**: Google Fonts (DM Sans and DM Mono).

## Project Organization

The project files are separated to make them easy to manage and update:

```text
Fractal/
├── index.html          # Main page and app structure
├── README.md           # This document
├── css/
│   └── style.css       # All styles and colors
└── js/
    ├── main.js         # Main script to control the app
    ├── gl-utils.js     # Shared tools for WebGL
    └── fractals/       # Logic for each specific Fractal
        ├── von-koch.js
        ├── minkowski.js
        ├── sierpinski-triangle.js
        ├── sierpinski-carpet.js
        ├── mandelbrot.js
        └── julia.js
```

## How to Install and Run

Because this project uses **ES Modules**, you need to run it through a local web server (not just by double-clicking the file).

1.  **Download the project:**
    ```bash
    git clone https://github.com/PHTLing/CS105.Fractal.git
    cd CS105.Fractal
    ```

2.  **Run the app:**
    -   **Option 1**: If you use **VS Code**, install the **Live Server** extension. Then, right-click `index.html` and choose *Open with Live Server*.
    -   **Option 2**: Use Python if you have it installed: `python -m http.server 8000` and go to `http://localhost:8000` in your browser.

## License

This project was created for education at the University of Information Technology (UIT).

---
© 2024 Fractal Explorer Project — CS105 Computer Graphics
