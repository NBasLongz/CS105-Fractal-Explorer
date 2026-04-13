import { gl, prog, vbo, fixViewportAndAspect } from './gl-utils.js';

// ── Sierpinski Triangle ──────────────────────────────────────────
let stG, stP, stLv = 0, stV = [];

function stInit() {
    const r = gl('stC');
    if (!r) return;
    stG = r.g;
    stP = prog(stG, `precision mediump float;void main(){gl_FragColor=vec4(0.93,0.29,0.49,1.0);}`);
    stG.clearColor(.98, .98, .97, 1);
    stDraw(0);
}

function stGen(a, b, c, d) {
    if (!d) { stV.push(...a, ...b, ...c); return; }
    const m1 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m2 = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
    const m3 = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
    stGen(a, m1, m3, d - 1);
    stGen(m1, b, m2, d - 1);
    stGen(m3, m2, c, d - 1);
}

function stDraw(lv) {
    stV = [];
    stGen([-0.7, -0.6], [0.7, -0.6], [0, 0.6124], lv);
    fixViewportAndAspect(stG);
    stG.clear(stG.COLOR_BUFFER_BIT);
    vbo(stG, stP, stV);
    stG.drawArrays(stG.TRIANGLES, 0, stV.length / 2);
    document.getElementById('stB').textContent = Math.pow(3, lv).toLocaleString() + ' triangles';
}

window.stCh = function(d) {
    stLv = Math.max(0, Math.min(10, stLv + d));
    document.getElementById('stL').textContent = stLv;
    stDraw(stLv);
};

// ── Sierpinski Carpet ────────────────────────────────────────────
let scG, scP, scLv = 0, scV = [];

function scInit() {
    const r = gl('scC');
    if (!r) return;
    scG = r.g;
    scP = prog(scG, `precision mediump float;void main(){gl_FragColor=vec4(0.85,0.55,0.05,1.0);}`);
    scG.clearColor(.98, .98, .97, 1);
    scDraw(0);
}

function scGen(x, y, s, d) {
    if (!d) {
        const x2 = x + s, y2 = y - s;
        scV.push(x, y, x2, y, x, y2, x, y2, x2, y, x2, y2);
        return;
    }
    const ns = s / 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (i === 1 && j === 1) continue;
            scGen(x + i * ns, y - j * ns, ns, d - 1);
        }
    }
}

function scDraw(lv) {
    scV = [];
    scGen(-0.68, 0.68, 1.36, lv);
    fixViewportAndAspect(scG);
    scG.clear(scG.COLOR_BUFFER_BIT);
    vbo(scG, scP, scV);
    scG.drawArrays(scG.TRIANGLES, 0, scV.length / 2);
    document.getElementById('scB').textContent = Math.pow(8, lv).toLocaleString() + ' squares';
}

window.scCh = function(d) {
    scLv = Math.max(0, Math.min(8, scLv + d));
    document.getElementById('scL').textContent = scLv;
    scDraw(scLv);
};

// ── Init both on load ────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    stInit();
    scInit();
});
