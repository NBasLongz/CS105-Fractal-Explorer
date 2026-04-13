import { gl, prog, quad, PALS, MAX_ITERATIONS, fillViewport } from './gl-utils.js';

let jlG, jlP, jlRe = -0.7269, jlIm = 0.1889, jlPI = 0;
let jlAn = false, jlAg = 0.6, jlMode = 0, jlTime = 0, lastFrame = 0, animReq = null;

const MODES = ['Classic Julia', 'Smooth Coloring', 'Animated Trip'];
const JL = [
    {n:'Spiral',r:-0.7269,i:0.1889},{n:'Dragon',r:-0.8,i:0.156},{n:'Dendrite',r:0,i:1},
    {n:'San Marco',r:-0.75,i:0},{n:'Rabbit',r:-0.123,i:0.745},{n:'Airplane',r:-1.755,i:0},
    {n:'Electric',r:-0.4,i:0.6},{n:'Siegel',r:-0.391,i:-0.587}
];

function jlFS(mode, pi) {
    const [r, gv, b, f] = PALS[pi];
    if (mode === 0) {
        return `precision highp float;uniform vec2 u_r;uniform vec2 u_c;void main(){vec2 uv=gl_FragCoord.xy/u_r-0.5;uv.x*=u_r.x/u_r.y;vec2 z=uv*3.2;int it=0;for(int i=0;i<${MAX_ITERATIONS};i++){if(dot(z,z)>4.0)break;z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+u_c;it++;}float t=float(it)/float(${MAX_ITERATIONS});gl_FragColor=vec4(.5+.5*cos(${r.toFixed(1)}+t*${f.toFixed(1)}),.5+.5*cos(${gv.toFixed(1)}+t*${f.toFixed(1)}),.5+.5*cos(${b.toFixed(1)}+t*${f.toFixed(1)}),1.);}`;
    } else if (mode === 1) {
        return `precision highp float;uniform vec2 u_r;uniform vec2 u_c;void main(){vec2 uv=(gl_FragCoord.xy/u_r-0.5)*2.0;uv.x*=u_r.x/u_r.y;vec2 z=uv*1.5;float i=0.0;const float MAX_IT=300.0;for(int j=0;j<300;j++){z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+u_c;if(length(z)>4.0)break;i++;}if(i>=MAX_IT){gl_FragColor=vec4(0.0,0.0,0.0,1.0);}else{float shade=(i-log2(log(length(z))))/MAX_IT;gl_FragColor=vec4(shade,pow(shade,0.75),pow(shade,0.25),1.0);}}`;
    } else {
        return `precision highp float;uniform vec2 u_r;uniform float u_time;vec3 hsl2rgb(float h,float s,float l){float hp=6.0*fract(h);float c=s*(1.0-abs(2.0*l-1.0));float x=c*(1.0-abs(mod(hp,2.0)-1.0));float m=l-c/2.0;if(hp<=1.0)return vec3(c,x,0.0)+m;if(hp<=2.0)return vec3(x,c,0.0)+m;if(hp<=3.0)return vec3(0.0,c,x)+m;if(hp<=4.0)return vec3(0.0,x,c)+m;if(hp<=5.0)return vec3(x,0.0,c)+m;return vec3(c,0.0,x)+m;}void main(){vec3 offset=vec3(-0.1-cos(0.11*u_time)/8.0,-0.15-sin(0.099*u_time)/7.0,pow(0.7+cos(0.093*u_time)/10.0,5.0));vec2 c=vec2(-0.730244+sin(0.13*u_time)/500.0,-0.172286+sin(0.19*u_time)/500.0);vec2 coord=(gl_FragCoord.xy/u_r-0.5)*2.0;coord.x*=u_r.x/u_r.y;vec2 z=coord*offset.z-offset.xy;float i=0.0;float dotZ=0.0;const float MAX_IT=300.0;for(int j=0;j<300;j++){z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c;dotZ=dot(z,z);if(dotZ>16.0)break;i++;}if(i>=MAX_IT){gl_FragColor=vec4(0.0,0.0,0.0,1.0);}else{float hue=(i-log2(log(dotZ)))/MAX_IT;gl_FragColor=vec4(hsl2rgb((hue+0.2)/2.0+sin(0.37*u_time)/10.0,0.6,0.5),1.0);}}`;
    }
}

function init() {
    const r = gl('jlC');
    if (!r) return;
    jlG = r.g;

    const rowModes = document.getElementById('jlModes');
    if (rowModes) {
        rowModes.innerHTML = '';
        MODES.forEach((name, i) => {
            const b = document.createElement('button');
            b.className = 'pset' + (i === 0 ? ' on' : '');
            b.textContent = name;
            b.onclick = () => {
                jlMode = i;
                document.querySelectorAll('#jlModes .pset').forEach(x => x.classList.remove('on'));
                b.classList.add('on');
                const isAuto = (i === 2);
                document.getElementById('jlCtrlRow').style.display = isAuto ? 'none' : 'flex';
                document.getElementById('jlPre').style.display = isAuto ? 'none' : 'flex';
                document.getElementById('jlPalRow').style.display = (i === 0) ? 'flex' : 'none';
                build(); render();
            };
            rowModes.appendChild(b);
        });
    }

    const rowPre = document.getElementById('jlPre');
    if (rowPre) {
        rowPre.innerHTML = '';
        JL.forEach((p, i) => {
            const b = document.createElement('button');
            b.className = 'pset' + (i === 0 ? ' on' : '');
            b.textContent = p.n;
            b.onclick = () => {
                jlRe = p.r; jlIm = p.i;
                document.getElementById('jlRe').value = p.r.toFixed(4);
                document.getElementById('jlIm').value = p.i.toFixed(4);
                document.querySelectorAll('#jlPre .pset').forEach(x => x.classList.remove('on'));
                b.classList.add('on');
                if (jlAn) toggleAnim();
                render();
            };
            rowPre.appendChild(b);
        });
    }

    build(); render();
    lastFrame = performance.now();
    if (!animReq) loop(lastFrame);
}

function loop(now) {
    let dt = (now-lastFrame)/1000.0; lastFrame = now;
    let needsRender = false;
    if (jlMode === 2) { jlTime += dt; needsRender = true; }
    if (jlAn && jlMode !== 2) {
        jlAg += 0.007;
        jlRe = 0.7885*Math.cos(jlAg);
        jlIm = 0.7885*Math.sin(jlAg);
        document.getElementById('jlRe').value = jlRe.toFixed(4);
        document.getElementById('jlIm').value = jlIm.toFixed(4);
        document.querySelectorAll('#jlPre .pset').forEach(b => b.classList.remove('on'));
        needsRender = true;
    }
    if (needsRender) render();
    animReq = requestAnimationFrame(loop);
}

function build() { jlP = prog(jlG, jlFS(jlMode, jlPI)); quad(jlG, jlP); }
function render() {
    fillViewport(jlG); jlG.useProgram(jlP);
    jlG.uniform2f(jlG.getUniformLocation(jlP,'u_r'), 1024, 1024);
    if (jlMode <= 1) jlG.uniform2f(jlG.getUniformLocation(jlP,'u_c'), jlRe, jlIm);
    else jlG.uniform1f(jlG.getUniformLocation(jlP,'u_time'), jlTime);
    jlG.drawArrays(jlG.TRIANGLE_STRIP, 0, 4);
}

function toggleAnim() {
    jlAn = !jlAn;
    const btn = document.getElementById('jlAB');
    btn.textContent = jlAn ? '⏹ Stop' : '▶ Animate';
    jlAn ? btn.classList.add('on') : btn.classList.remove('on');
}

window.jlUpd = function() {
    jlRe = parseFloat(document.getElementById('jlRe').value) || 0;
    jlIm = parseFloat(document.getElementById('jlIm').value) || 0;
    document.querySelectorAll('#jlPre .pset').forEach(b => b.classList.remove('on'));
    render();
};
window.jlAnim = toggleAnim;
window.jlPal = function(i, btn) {
    jlPI = i;
    document.querySelectorAll('#julia .pb').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    if (jlMode === 0) { build(); render(); }
};

window.addEventListener('DOMContentLoaded', init);
