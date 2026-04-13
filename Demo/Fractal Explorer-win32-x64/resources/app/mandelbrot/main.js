import { gl, prog, quad, PALS, MAX_ITERATIONS, fillViewport } from './gl-utils.js';

let mbG, mbP, mbZ = 1, mbX = -0.5, mbY = 0, mbPI = 0;
let mbDrag = false, mbDX = 0, mbDY = 0;
let mbMode = 0, mbTime = 0, lastFrame = 0, animReq = null;

const MODES = ['Basic Fractal', 'Smooth Coloring', 'Iterations (Anim)', 'Party (Anim)'];

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

function init() {
    const r = gl('mbC');
    if (!r) return;
    mbG = r.g;

    const row = document.getElementById('mbPre');
    if (row) {
        row.innerHTML = '';
        MODES.forEach((name, i) => {
            const b = document.createElement('button');
            b.className = 'pset' + (i === 0 ? ' on' : '');
            b.textContent = name;
            b.onclick = () => {
                mbMode = i;
                document.querySelectorAll('#mbPre .pset').forEach(x => x.classList.remove('on'));
                b.classList.add('on');
                document.getElementById('mbPalRow').style.display = (i === 0) ? 'flex' : 'none';
                build(); render();
            };
            row.appendChild(b);
        });
    }

    build(); render();
    const c = r.c;

    c.addEventListener('wheel', e => {
        if (mbMode >= 2) return;
        e.preventDefault();
        const fv = e.deltaY < 0 ? 1.3 : .77;
        const aspect = c.clientWidth / c.clientHeight;
        mbX += ((e.clientX - c.getBoundingClientRect().left) / c.clientWidth - .5) * aspect * (3/mbZ) * (1-1/fv);
        mbY -= ((e.clientY - c.getBoundingClientRect().top) / c.clientHeight - .5) * (3/mbZ) * (1-1/fv);
        mbZ *= fv;
        render(); updateInfo();
    }, { passive: false });

    c.addEventListener('mousedown', e => { if (mbMode < 2) { mbDrag = true; mbDX = e.clientX; mbDY = e.clientY; c.style.cursor = 'grab'; } });
    window.addEventListener('mouseup', () => { mbDrag = false; if (c) c.style.cursor = 'crosshair'; });
    window.addEventListener('mousemove', e => {
        if (!mbDrag || mbMode >= 2) return;
        mbX -= (e.clientX-mbDX) * (c.clientWidth/c.clientHeight) * (3/mbZ) / c.clientWidth;
        mbY += (e.clientY-mbDY) * (3/mbZ) / c.clientHeight;
        mbDX = e.clientX; mbDY = e.clientY;
        render(); updateInfo();
    });
    c.addEventListener('dblclick', () => { if (mbMode < 2) { mbZ=1; mbX=-0.5; mbY=0; render(); updateInfo(); } });

    window.addEventListener('keydown', e => {
        if (mbMode >= 2) return;
        const s = 0.08/mbZ, aspect = mbG.canvas.clientWidth/mbG.canvas.clientHeight;
        if (e.key==='ArrowUp') mbY += s;
        if (e.key==='ArrowDown') mbY -= s;
        if (e.key==='ArrowLeft') mbX -= s*aspect;
        if (e.key==='ArrowRight') mbX += s*aspect;
        if (e.key==='+'||e.key==='=') mbZ *= 1.3;
        if (e.key==='-') mbZ /= 1.3;
        render(); updateInfo();
    });

    updateInfo();
    lastFrame = performance.now();
    if (!animReq) loop(lastFrame);
}

function loop(now) {
    let dt = (now-lastFrame)/1000.0; lastFrame = now;
    if (mbMode >= 2) { mbTime += dt; render(); }
    animReq = requestAnimationFrame(loop);
}

function build() { mbP = prog(mbG, mbFS(mbMode, mbPI)); quad(mbG, mbP); }
function render() {
    fillViewport(mbG); mbG.useProgram(mbP);
    mbG.uniform2f(mbG.getUniformLocation(mbP,'u_r'), 1024, 1024);
    if (mbMode <= 1) {
        mbG.uniform1f(mbG.getUniformLocation(mbP,'u_z'), mbZ);
        mbG.uniform2f(mbG.getUniformLocation(mbP,'u_o'), mbX, mbY);
    } else {
        mbG.uniform1f(mbG.getUniformLocation(mbP,'u_time'), mbTime);
    }
    mbG.drawArrays(mbG.TRIANGLE_STRIP, 0, 4);
}
function updateInfo() {
    document.getElementById('mbZ').textContent = mbZ.toFixed(2)+'×';
    document.getElementById('mbX').textContent = mbX.toFixed(5);
    document.getElementById('mbY').textContent = mbY.toFixed(5);
}

window.mbPal = function(i, btn) {
    mbPI = i;
    document.querySelectorAll('#mandelbrot .pb').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    if (mbMode === 0) { build(); render(); }
};

window.addEventListener('DOMContentLoaded', init);
