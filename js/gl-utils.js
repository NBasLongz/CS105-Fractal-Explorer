/**
 * WebGL Utility Functions
 */

export const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`;

export function gl(id) {
    const c = document.getElementById(id);
    const g = c.getContext('webgl');
    return g ? { g, c } : null;
}

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
    
    // Đảm bảo viewport khớp với kích thước canvas thực tế
    g.viewport(0, 0, g.canvas.width, g.canvas.height);
    
    return pr;
}

export function quad(g, pr) {
    const b = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, b);
    // Tọa độ 2 tam giác tạo thành hình vuông bao phủ toàn màn hình [-1, 1]
    const pts = new Float32Array([
        -1, -1,  1, -1, -1,  1,
        -1,  1,  1, -1,  1,  1
    ]);
    g.bufferData(g.ARRAY_BUFFER, pts, g.STATIC_DRAW);
    const a = g.getAttribLocation(pr, 'p');
    g.vertexAttribPointer(a, 2, g.FLOAT, false, 0, 0);
    g.enableVertexAttribArray(a);
}

export function vbo(g, pr, arr) {
    const b = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, b);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array(arr), g.STATIC_DRAW);
    const a = g.getAttribLocation(pr, 'p');
    if (a !== -1) {
        g.vertexAttribPointer(a, 2, g.FLOAT, false, 0, 0);
        g.enableVertexAttribArray(a);
    }
}

export const PALS = [
    [3, 2, 1, 12],
    [3, 5, 7, 10],
    [1, 2.5, 4.5, 10],
    [5, 3, 1, 10],
    [0, 0, 0, 8]
];

export const MAX_ITERATIONS = 500;
