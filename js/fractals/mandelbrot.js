import { gl, prog, quad, PALS, MAX_ITERATIONS, fillViewport } from '../gl-utils.js';

let mbG, mbP, mbZ = 1, mbX = -0.5, mbY = 0, mbPI = 0;
let mbDrag = false, mbDX = 0, mbDY = 0;

function mbFS(pi) {
    const [r, gv, b, f] = PALS[pi];
    return `precision highp float;
uniform vec2 u_r;uniform float u_z;uniform vec2 u_o;
void main(){
  vec2 uv = gl_FragCoord.xy / u_r - 0.5;
  uv.x *= u_r.x / u_r.y;
  vec2 c = uv * (3.0 / u_z) + u_o;
  vec2 z=c;int it=0;
  for(int i=0;i<${MAX_ITERATIONS};i++){if(dot(z,z)>4.0)break;z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c;it++;}
  float t=float(it)/float(${MAX_ITERATIONS});
  gl_FragColor=vec4(.5+.5*cos(${r.toFixed(1)}+t*${f.toFixed(1)}),.5+.5*cos(${gv.toFixed(1)}+t*${f.toFixed(1)}),.5+.5*cos(${b.toFixed(1)}+t*${f.toFixed(1)}),1.);
}`;
}

export function init() {
    const r = gl('mbC');
    if (!r) return;
    mbG = r.g;
    build();
    render();
    const c = r.c;
    
    c.addEventListener('wheel', e => {
        e.preventDefault();
        const f = e.deltaY < 0 ? 1.3 : .77;
        const rc = c.getBoundingClientRect();
        const mx = (e.clientX - rc.left) / c.clientWidth - .5;
        const my = (e.clientY - rc.top) / c.clientHeight - .5;
        const aspect = c.clientWidth / c.clientHeight;
        mbX += mx * aspect * (3 / mbZ) * (1 - 1 / f);
        mbY -= my * (3 / mbZ) * (1 - 1 / f);
        mbZ *= f;
        render();
        updateInfo();
    }, { passive: false });
    
    c.addEventListener('mousedown', e => {
        mbDrag = true;
        mbDX = e.clientX;
        mbDY = e.clientY;
        c.style.cursor = 'grab';
    });
    
    window.addEventListener('mouseup', () => {
        mbDrag = false;
        if (c) c.style.cursor = 'crosshair';
    });
    
    window.addEventListener('mousemove', e => {
        if (!mbDrag) return;
        const aspect = c.clientWidth / c.clientHeight;
        mbX -= (e.clientX - mbDX) * aspect * (3 / mbZ) / c.clientWidth;
        mbY += (e.clientY - mbDY) * (3 / mbZ) / c.clientHeight;
        mbDX = e.clientX;
        mbDY = e.clientY;
        render();
        updateInfo();
    });
    
    c.addEventListener('dblclick', () => {
        mbZ = 1; mbX = -0.5; mbY = 0;
        render();
        updateInfo();
    });

    updateInfo();

    window.addEventListener('resize', () => {
        if(document.getElementById('mandelbrot').classList.contains('on')) render();
    });
}

function build() {
    mbP = prog(mbG, mbFS(mbPI));
    quad(mbG, mbP);
}

function render() {
    fillViewport(mbG);
    mbG.useProgram(mbP);
    mbG.uniform2f(mbG.getUniformLocation(mbP, 'u_r'), mbG.canvas.width, mbG.canvas.height);
    mbG.uniform1f(mbG.getUniformLocation(mbP, 'u_z'), mbZ);
    mbG.uniform2f(mbG.getUniformLocation(mbP, 'u_o'), mbX, mbY);
    mbG.drawArrays(mbG.TRIANGLE_STRIP, 0, 4); 
}

function updateInfo() {
    document.getElementById('mbZ').textContent = mbZ.toFixed(2) + '×';
    document.getElementById('mbX').textContent = mbX.toFixed(5);
    document.getElementById('mbY').textContent = mbY.toFixed(5);
}

export function setPalette(i, btn) {
    mbPI = i;
    document.querySelectorAll('#mandelbrot .pb').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    build();
    render();
}

export function handleKey(e) {
    const aspect = mbG.canvas.clientWidth / mbG.canvas.clientHeight;
    const s = 0.08 / mbZ;
    if (e.key === 'ArrowUp') mbY += s;
    if (e.key === 'ArrowDown') mbY -= s;
    if (e.key === 'ArrowLeft') mbX -= s * aspect;
    if (e.key === 'ArrowRight') mbX += s * aspect;
    if (e.key === '+' || e.key === '=') mbZ *= 1.3;
    if (e.key === '-') mbZ /= 1.3;
    render();
    updateInfo();
}