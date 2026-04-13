import { gl, prog, vbo, fixViewportAndAspect } from './gl-utils.js';

let scG, scP, scLv = 0, scV = [];

function init() {
    const r = gl('scC');
    if (!r) return;
    scG = r.g;
    scP = prog(scG, `precision mediump float;void main(){gl_FragColor=vec4(0.85,0.55,0.05,1.0);}`);
    scG.clearColor(.98, .98, .97, 1);
    draw(0);
}

function scGen(x, y, s, d) {
    if (!d) {
        const x2 = x+s, y2 = y-s;
        scV.push(x,y, x2,y, x,y2, x,y2, x2,y, x2,y2);
        return;
    }
    const ns = s / 3;
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
            if (i===1 && j===1) continue;
            scGen(x+i*ns, y-j*ns, ns, d-1);
        }
}

function draw(lv) {
    scV = [];
    scGen(-0.68, 0.68, 1.36, lv);
    fixViewportAndAspect(scG);
    scG.clear(scG.COLOR_BUFFER_BIT);
    vbo(scG, scP, scV);
    scG.drawArrays(scG.TRIANGLES, 0, scV.length/2);
    document.getElementById('scB').textContent = Math.pow(8,lv).toLocaleString() + ' squares';
}

window.scCh = function(d) {
    scLv = Math.max(0, Math.min(8, scLv + d));
    document.getElementById('scL').textContent = scLv;
    draw(scLv);
};

window.addEventListener('DOMContentLoaded', init);
