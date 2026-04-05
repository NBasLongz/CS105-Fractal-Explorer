import { gl, prog, vbo } from '../gl-utils.js';

let mkG, mkP, mkLv = 0, mkV = [];

export function init() {
    const r = gl('mkC');
    if (!r) return;
    mkG = r.g;
    mkP = prog(mkG, `precision mediump float;void main(){gl_FragColor=vec4(0.47,0.18,0.96,1.0);}`);
    mkG.clearColor(.98, .98, .97, 1);
    draw(0);
}

function mkSeg(a, b, d) {
    if (!d) {
        mkV.push(...a, ...b);
        return;
    }
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const sx = Math.sign(dx), sy = Math.sign(dy);
    const dt = (Math.abs(dx) || Math.abs(dy)) / 4;
    const C = [a[0] + sx * dt, a[1] + sy * dt];
    const D = [C[0] + sx * dt, C[1] + sy * dt];
    const E = [D[0] + sx * dt, D[1] + sy * dt];
    const F = [C[0] - sy * dt, C[1] + sx * dt];
    const G = [D[0] - sy * dt, D[1] + sx * dt];
    const H = [D[0] + sy * dt, D[1] - sx * dt];
    const II = [E[0] + sy * dt, E[1] - sx * dt];
    [a, C, F, G, D, H, II, E, b].reduce((x, y) => { mkSeg(x, y, d - 1); return y; });
}

function draw(lv) {
    mkV = [];
    const pts = [[-0.55, 0.55], [0.55, 0.55], [0.55, -0.55], [-0.55, -0.55]];
    for (let i = 0; i < 4; i++) mkSeg(pts[i], pts[(i + 1) % 4], lv);
    
    mkG.viewport(0, 0, mkG.canvas.width, mkG.canvas.height);
    mkG.clear(mkG.COLOR_BUFFER_BIT);
    
    vbo(mkG, mkP, mkV);
    mkG.drawArrays(mkG.LINE_STRIP, 0, mkV.length / 2);
    document.getElementById('mkB').textContent = (mkV.length / 4).toLocaleString() + ' segments';
}

export function changeLevel(d) {
    mkLv = Math.max(0, Math.min(7, mkLv + d));
    document.getElementById('mkL').textContent = mkLv;
    draw(mkLv);
}
