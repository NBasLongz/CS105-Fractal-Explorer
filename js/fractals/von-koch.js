import { gl, prog, vbo, fixViewportAndAspect } from '../gl-utils.js';

let vkG, vkP, vkLv = 0, vkV = [];

export function init() {
    const r = gl('vkC');
    if (!r) return;
    vkG = r.g;
    vkP = prog(vkG, `precision mediump float;void main(){gl_FragColor=vec4(0.17,0.49,0.96,1.0);}`);
    vkG.clearColor(.98, .98, .97, 1);
    draw(0);

    window.addEventListener('resize', () => {
        if(document.getElementById('vankoch').classList.contains('on')) draw(vkLv);
    });
}

function vkSeg(a, b, d) {
    if (!d) {
        vkV.push(...a);
        return;
    }
    const ax = (2 * a[0] + b[0]) / 3, ay = (2 * a[1] + b[1]) / 3;
    const bx = (a[0] + 2 * b[0]) / 3, by = (a[1] + 2 * b[1]) / 3;
    const ang = -Math.PI / 3;
    const cx = (bx - ax) * Math.cos(ang) - (by - ay) * Math.sin(ang) + ax;
    const cy = (bx - ax) * Math.sin(ang) + (by - ay) * Math.cos(ang) + ay;
    
    vkSeg(a, [ax, ay], d - 1);
    vkSeg([ax, ay], [cx, cy], d - 1);
    vkSeg([cx, cy], [bx, by], d - 1);
    vkSeg([bx, by], b, d - 1);
}

function draw(lv) {
    vkV = [];
    vkSeg([-0.6, -0.3464], [0.6, -0.3464], lv); 
    vkSeg([0.6, -0.3464], [0, 0.6928], lv);
    vkSeg([0, 0.6928], [-0.6, -0.3464], lv);
    
    fixViewportAndAspect(vkG);
    vkG.clear(vkG.COLOR_BUFFER_BIT);
    
    vbo(vkG, vkP, vkV);
    vkG.drawArrays(vkG.LINE_LOOP, 0, vkV.length / 2);
    document.getElementById('vkB').textContent = (vkV.length / 2).toLocaleString() + ' segments';
}

export function changeLevel(d) {
    vkLv = Math.max(0, Math.min(12, vkLv + d));
    document.getElementById('vkL').textContent = vkLv;
    draw(vkLv);
}
