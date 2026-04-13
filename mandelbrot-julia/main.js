import { gl, prog, quad, PALS, MAX_ITERATIONS, fillViewport } from './gl-utils.js';

// ═══════════════════════════════════════════════════════════════
// MANDELBROT
// ═══════════════════════════════════════════════════════════════
let mbG, mbP, mbZ = 1, mbX = -0.5, mbY = 0, mbPI = 0;
let mbDrag = false, mbDX = 0, mbDY = 0;
let mbMode = 0, mbTime = 0, mbLastFrame = 0, mbAnimReq = null;

const MB_MODES = ['Basic Fractal', 'Smooth Coloring', 'Iterations (Anim)', 'Party (Anim)'];

function mbFS(mode, pi) {
    const [r, gv, b, f] = PALS[pi];
    const hsl2rgb = `vec3 hsl2rgb(float h,float s,float l){float hp=6.0*fract(h);float c=s*(1.0-abs(2.0*l-1.0));float x=c*(1.0-abs(mod(hp,2.0)-1.0));float m=l-c/2.0;if(hp<=1.0)return vec3(c,x,0.0)+m;if(hp<=2.0)return vec3(x,c,0.0)+m;if(hp<=3.0)return vec3(0.0,c,x)+m;if(hp<=4.0)return vec3(0.0,x,c)+m;if(hp<=5.0)return vec3(x,0.0,c)+m;return vec3(c,0.0,x)+m;}`;

    if (mode === 0) {
        return `precision highp float;uniform vec2 u_r;uniform float u_z;uniform vec2 u_o;void main(){vec2 uv=gl_FragCoord.xy/u_r-0.5;uv.x*=u_r.x/u_r.y;vec2 c=uv*(3.0/u_z)+u_o;vec2 z=c;int it=0;for(int i=0;i<${MAX_ITERATIONS};i++){if(dot(z,z)>4.0)break;z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c;it++;}float t=float(it)/float(${MAX_ITERATIONS});gl_FragColor=vec4(.5+.5*cos(${r.toFixed(1)}+t*${f.toFixed(1)}),.5+.5*cos(${gv.toFixed(1)}+t*${f.toFixed(1)}),.5+.5*cos(${b.toFixed(1)}+t*${f.toFixed(1)}),1.);}`;
    } else if (mode === 1) {
        return `precision highp float;uniform vec2 u_r;uniform float u_z;uniform vec2 u_o;${hsl2rgb}void main(){vec2 uv=gl_FragCoord.xy/u_r-0.5;uv.x*=u_r.x/u_r.y;vec2 c=uv*(3.0/u_z)+u_o;vec2 z=vec2(0.0);float i=0.0;const float MAX_IT=100.0;for(int j=0;j<100;j++){z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c;if(length(z)>4.0)break;i++;}if(i>=MAX_IT){gl_FragColor=vec4(0.0,0.0,0.0,1.0);}else{float hue=(i-log2(log(length(z))))/MAX_IT;gl_FragColor=vec4(hsl2rgb(hue,0.5,0.5),1.0);}}`;
    } else if (mode === 2) {
        return `precision highp float;uniform vec2 u_r;uniform float u_time;${hsl2rgb}void main(){const vec2 offset=vec2(-0.545,0.498);const float zoom=200.0;float iterations=140.0-100.0*cos(u_time/3.0);vec2 uv=(gl_FragCoord.xy/u_r-0.5)*2.0;uv.x*=u_r.x/u_r.y;vec2 c=uv/(zoom/2.5)+offset;vec2 z=vec2(0.0);float i=0.0;for(int j=0;j<250;j++){if(float(j)>=iterations)break;z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c;if(dot(z,z)>16.0)break;i++;}if(i>=iterations){gl_FragColor=vec4(0.0,0.0,0.0,1.0);}else{float hue=(log2(log(dot(z,z)))-i)/iterations;gl_FragColor=vec4(hsl2rgb(fract(hue+u_time/15.0),0.9,0.3),1.0);}}`;
    } else {
        return `precision highp float;uniform vec2 u_r;uniform float u_time;${hsl2rgb}vec2 rotate(vec2 p,float angle){return vec2(p.x*cos(angle)-p.y*sin(angle),p.x*sin(angle)+p.y*cos(angle));}void main(){float t=0.1*u_time;float zoom=150.0*pow(1.4-cos(t),5.0);float angle=10.0*sin(t/11.07);float hueShift=t/23.0;float iterations=180.0+100.0*sin(2.03*t);vec2 offset=vec2(-0.4822-sin(t/3.11)/4000.0,0.6141+cos(t/1.43)/5500.0);vec2 uv=(gl_FragCoord.xy/u_r-0.5)*2.0;uv.x*=u_r.x/u_r.y;vec2 c=rotate(uv/(zoom/2.5),angle)+offset;vec2 z=vec2(0.0);float i=0.0;for(int j=0;j<300;j++){if(float(j)>=iterations)break;z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c;if(dot(z,z)>16.0)break;i++;}if(i>=iterations){gl_FragColor=vec4(0.0,0.0,0.0,1.0);}else{float hue=(i-log2(log(dot(z,z))))/iterations;gl_FragColor=vec4(hsl2rgb(fract(hue+hueShift),0.7,0.45),1.0);}}`;
    }
}

function mbInit() {
    const r = gl('mbC');
    if (!r) return;
    mbG = r.g;

    const row = document.getElementById('mbPre');
    if (row) {
        row.innerHTML = '';
        MB_MODES.forEach((name, i) => {
            const b = document.createElement('button');
            b.className = 'pset' + (i === 0 ? ' on' : '');
            b.textContent = name;
            b.onclick = () => {
                mbMode = i;
                document.querySelectorAll('#mbPre .pset').forEach(x => x.classList.remove('on'));
                b.classList.add('on');
                document.getElementById('mbPalRow').style.display = (i === 0) ? 'flex' : 'none';
                mbBuild(); mbRender();
            };
            row.appendChild(b);
        });
    }

    mbBuild(); mbRender();
    const c = r.c;

    c.addEventListener('wheel', e => {
        if (mbMode >= 2) return;
        e.preventDefault();
        const fv = e.deltaY < 0 ? 1.3 : .77;
        const aspect = c.clientWidth / c.clientHeight;
        mbX += ((e.clientX - c.getBoundingClientRect().left) / c.clientWidth - .5) * aspect * (3 / mbZ) * (1 - 1 / fv);
        mbY -= ((e.clientY - c.getBoundingClientRect().top) / c.clientHeight - .5) * (3 / mbZ) * (1 - 1 / fv);
        mbZ *= fv;
        mbRender(); mbUpdateInfo();
    }, { passive: false });

    c.addEventListener('mousedown', e => { if (mbMode < 2) { mbDrag = true; mbDX = e.clientX; mbDY = e.clientY; c.style.cursor = 'grab'; } });
    window.addEventListener('mouseup', () => { mbDrag = false; if (c) c.style.cursor = 'crosshair'; });
    window.addEventListener('mousemove', e => {
        if (!mbDrag || mbMode >= 2) return;
        mbX -= (e.clientX - mbDX) * (c.clientWidth / c.clientHeight) * (3 / mbZ) / c.clientWidth;
        mbY += (e.clientY - mbDY) * (3 / mbZ) / c.clientHeight;
        mbDX = e.clientX; mbDY = e.clientY;
        mbRender(); mbUpdateInfo();
    });
    c.addEventListener('dblclick', () => { if (mbMode < 2) { mbZ = 1; mbX = -0.5; mbY = 0; mbRender(); mbUpdateInfo(); } });

    window.addEventListener('keydown', e => {
        if (mbMode >= 2) return;
        const s = 0.08 / mbZ, aspect = mbG.canvas.clientWidth / mbG.canvas.clientHeight;
        if (e.key === 'ArrowUp') mbY += s;
        if (e.key === 'ArrowDown') mbY -= s;
        if (e.key === 'ArrowLeft') mbX -= s * aspect;
        if (e.key === 'ArrowRight') mbX += s * aspect;
        if (e.key === '+' || e.key === '=') mbZ *= 1.3;
        if (e.key === '-') mbZ /= 1.3;
        mbRender(); mbUpdateInfo();
    });

    mbUpdateInfo();
    mbLastFrame = performance.now();
    if (!mbAnimReq) mbLoop(mbLastFrame);
}

function mbLoop(now) {
    let dt = (now - mbLastFrame) / 1000.0; mbLastFrame = now;
    if (document.getElementById('panelMandelbrot').classList.contains('on') && mbMode >= 2) {
        mbTime += dt; mbRender();
    }
    mbAnimReq = requestAnimationFrame(mbLoop);
}

function mbBuild() { mbP = prog(mbG, mbFS(mbMode, mbPI)); quad(mbG, mbP); }
function mbRender() {
    fillViewport(mbG); mbG.useProgram(mbP);
    mbG.uniform2f(mbG.getUniformLocation(mbP, 'u_r'), 1024, 1024);
    if (mbMode <= 1) {
        mbG.uniform1f(mbG.getUniformLocation(mbP, 'u_z'), mbZ);
        mbG.uniform2f(mbG.getUniformLocation(mbP, 'u_o'), mbX, mbY);
    } else {
        mbG.uniform1f(mbG.getUniformLocation(mbP, 'u_time'), mbTime);
    }
    mbG.drawArrays(mbG.TRIANGLE_STRIP, 0, 4);
}
function mbUpdateInfo() {
    document.getElementById('mbZ').textContent = mbZ.toFixed(2) + '×';
    document.getElementById('mbX').textContent = mbX.toFixed(5);
    document.getElementById('mbY').textContent = mbY.toFixed(5);
}

window.mbPal = function(i, btn) {
    mbPI = i;
    document.querySelectorAll('#panelMandelbrot .pb').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    if (mbMode === 0) { mbBuild(); mbRender(); }
};


// ═══════════════════════════════════════════════════════════════
// JULIA SET
// ═══════════════════════════════════════════════════════════════
let jlG, jlP, jlRe = -0.7269, jlIm = 0.1889, jlPI = 0;
let jlAn = false, jlAg = 0.6, jlMode = 0, jlTime = 0, jlLastFrame = 0, jlAnimReq = null;

const JL_MODES = ['Classic Julia', 'Smooth Coloring', 'Animated Trip'];
const JL_PRESETS = [
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

function jlInit() {
    const r = gl('jlC');
    if (!r) return;
    jlG = r.g;

    const rowModes = document.getElementById('jlModes');
    if (rowModes) {
        rowModes.innerHTML = '';
        JL_MODES.forEach((name, i) => {
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
                jlBuild(); jlRender();
            };
            rowModes.appendChild(b);
        });
    }

    const rowPre = document.getElementById('jlPre');
    if (rowPre) {
        rowPre.innerHTML = '';
        JL_PRESETS.forEach((p, i) => {
            const b = document.createElement('button');
            b.className = 'pset' + (i === 0 ? ' on' : '');
            b.textContent = p.n;
            b.onclick = () => {
                jlRe = p.r; jlIm = p.i;
                document.getElementById('jlRe').value = p.r.toFixed(4);
                document.getElementById('jlIm').value = p.i.toFixed(4);
                document.querySelectorAll('#jlPre .pset').forEach(x => x.classList.remove('on'));
                b.classList.add('on');
                if (jlAn) jlToggleAnim();
                jlRender();
            };
            rowPre.appendChild(b);
        });
    }

    jlBuild(); jlRender();
    jlLastFrame = performance.now();
    if (!jlAnimReq) jlLoop(jlLastFrame);
}

function jlLoop(now) {
    let dt = (now - jlLastFrame) / 1000.0; jlLastFrame = now;
    let needsRender = false;

    if (document.getElementById('panelJulia').classList.contains('on')) {
        if (jlMode === 2) { jlTime += dt; needsRender = true; }
        if (jlAn && jlMode !== 2) {
            jlAg += 0.007;
            jlRe = 0.7885 * Math.cos(jlAg);
            jlIm = 0.7885 * Math.sin(jlAg);
            document.getElementById('jlRe').value = jlRe.toFixed(4);
            document.getElementById('jlIm').value = jlIm.toFixed(4);
            document.querySelectorAll('#jlPre .pset').forEach(b => b.classList.remove('on'));
            needsRender = true;
        }
        if (needsRender) jlRender();
    }
    jlAnimReq = requestAnimationFrame(jlLoop);
}

function jlBuild() { jlP = prog(jlG, jlFS(jlMode, jlPI)); quad(jlG, jlP); }
function jlRender() {
    fillViewport(jlG); jlG.useProgram(jlP);
    jlG.uniform2f(jlG.getUniformLocation(jlP, 'u_r'), 1024, 1024);
    if (jlMode <= 1) jlG.uniform2f(jlG.getUniformLocation(jlP, 'u_c'), jlRe, jlIm);
    else jlG.uniform1f(jlG.getUniformLocation(jlP, 'u_time'), jlTime);
    jlG.drawArrays(jlG.TRIANGLE_STRIP, 0, 4);
}

function jlToggleAnim() {
    jlAn = !jlAn;
    const btn = document.getElementById('jlAB');
    btn.textContent = jlAn ? '⏹ Stop' : '▶ Animate';
    jlAn ? btn.classList.add('on') : btn.classList.remove('on');
}

window.jlUpd = function() {
    jlRe = parseFloat(document.getElementById('jlRe').value) || 0;
    jlIm = parseFloat(document.getElementById('jlIm').value) || 0;
    document.querySelectorAll('#jlPre .pset').forEach(b => b.classList.remove('on'));
    jlRender();
};

window.jlAnim = jlToggleAnim;

window.jlPal = function(i, btn) {
    jlPI = i;
    document.querySelectorAll('#panelJulia .pb').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    if (jlMode === 0) { jlBuild(); jlRender(); }
};


// ═══════════════════════════════════════════════════════════════
// INIT BOTH
// ═══════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
    mbInit();
    jlInit();
});
