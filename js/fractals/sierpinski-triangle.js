import { gl, prog, vbo } from '../gl-utils.js';

let stG, stP, stLv = 0, stV = [];

export function init() {
    const r = gl('stC');
    if (!r) return;
    stG = r.g;
    stP = prog(stG, `precision mediump float;void main(){gl_FragColor=vec4(0.93,0.29,0.49,1.0);}`);
    stG.clearColor(.98, .98, .97, 1);
    draw(0);
}

function stGen(a, b, c, d) {
    if (!d) {
        stV.push(...a, ...b, ...c);
        return;
    }
    const m1 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m2 = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
    const m3 = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
    stGen(a, m1, m3, d - 1);
    stGen(m1, b, m2, d - 1);
    stGen(m3, m2, c, d - 1);
}

function draw(lv) {
    stV = [];
    stGen([-0.68, -0.56], [0.68, -0.56], [0, 0.68], lv);
    
    stG.viewport(0, 0, stG.canvas.width, stG.canvas.height);
    stG.clear(stG.COLOR_BUFFER_BIT);
    
    vbo(stG, stP, stV);
    stG.drawArrays(stG.TRIANGLES, 0, stV.length / 2);
    document.getElementById('stB').textContent = Math.pow(3, lv).toLocaleString() + ' triangles';
}

export function changeLevel(d) {
    stLv = Math.max(0, Math.min(10, stLv + d));
    document.getElementById('stL').textContent = stLv;
    draw(stLv);
}
