export const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`;

export function gl(id) {
    const c = document.getElementById(id);
    if (!c) return null;
    // Khóa chết độ phân giải 1024x1024 để chống méo khi resize CSS
    c.width = 1024;
    c.height = 1024;
    // Tắt khử răng cưa để vá rãnh nứt giữa 2 tam giác
    const g = c.getContext('webgl', { antialias: false, depth: false });
    return g ? { g, c } : null;
}

export function fixViewportAndAspect(g) { g.viewport(0, 0, 1024, 1024); }
export function fillViewport(g) { g.viewport(0, 0, 1024, 1024); }

export function prog(g, fs) {
    const v = g.createShader(g.VERTEX_SHADER);
    g.shaderSource(v, VS);
    g.compileShader(v);
    const f = g.createShader(g.FRAGMENT_SHADER);
    g.shaderSource(f, fs);
    g.compileShader(f);
    const pr = g.createProgram();
    g.attachShader(pr, v);
    g.attachShader(pr, f);
    g.linkProgram(pr);
    g.useProgram(pr);
    return pr;
}

// Cache Buffer chống VRAM leak
export function quad(g, pr) {
    if (!g._quadBuffer) g._quadBuffer = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, g._quadBuffer);
    const pts = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]);
    g.bufferData(g.ARRAY_BUFFER, pts, g.STATIC_DRAW);
    const a = g.getAttribLocation(pr, 'p');
    g.vertexAttribPointer(a, 2, g.FLOAT, false, 0, 0);
    g.enableVertexAttribArray(a);
}

// Cache Buffer chống VRAM leak
export function vbo(g, pr, arr) {
    if (!g._vboBuffer) g._vboBuffer = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, g._vboBuffer);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array(arr), g.STATIC_DRAW);
    const a = g.getAttribLocation(pr, 'p');
    if (a !== -1) {
        g.vertexAttribPointer(a, 2, g.FLOAT, false, 0, 0);
        g.enableVertexAttribArray(a);
    }
}

export const PALS = [[3,2,1,12], [3,5,7,10], [1,2.5,4.5,10], [5,3,1,10], [0,0,0,8]];
export const MAX_ITERATIONS = 500;