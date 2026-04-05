import { gl, prog, quad, PALS, MAX_ITERATIONS } from '../gl-utils.js';

let jlG, jlP, jlRe = -0.7269, jlIm = 0.1889, jlPI = 0;
let jlAn = false, jlAF = null, jlAg = 0.6;

const JL = [
    { n: 'Spiral', r: -0.7269, i: 0.1889 },
    { n: 'Dragon', r: -0.8, i: 0.156 },
    { n: 'Dendrite', r: 0, i: 1 },
    { n: 'San Marco', r: -0.75, i: 0 },
    { n: 'Rabbit', r: -0.123, i: 0.745 },
    { n: 'Airplane', r: -1.755, i: 0 },
    { n: 'Electric', r: -0.4, i: 0.6 },
    { n: 'Siegel', r: -0.391, i: -0.587 },
];

function jlFS(pi) {
    const [r, gv, b, f] = PALS[pi];
    return `precision highp float;
uniform vec2 u_r;uniform vec2 u_c;
void main(){
  vec2 z=(gl_FragCoord.xy/u_r-.5)*3.2;int it=0;
  for(int i=0;i<${MAX_ITERATIONS};i++){if(dot(z,z)>4.0)break;z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+u_c;it++;}
  float t=float(it)/float(${MAX_ITERATIONS});
  gl_FragColor=vec4(.5+.5*cos(${r.toFixed(1)}+t*${f.toFixed(1)}),.5+.5*cos(${gv.toFixed(1)}+t*${f.toFixed(1)}),.5+.5*cos(${b.toFixed(1)}+t*${f.toFixed(1)}),1.);
}`;
}

export function init() {
    const r = gl('jlC');
    if (!r) return;
    jlG = r.g;
    build();
    render();
    
    const row = document.getElementById('jlPre');
    row.innerHTML = ''; // Clear existing
    JL.forEach((p, i) => {
        const b = document.createElement('button');
        b.className = 'pset' + (i === 0 ? ' on' : '');
        b.textContent = p.n;
        b.onclick = () => {
            jlRe = p.r; jlIm = p.i;
            document.getElementById('jlRe').value = p.r.toFixed(4);
            document.getElementById('jlIm').value = p.i.toFixed(4);
            document.querySelectorAll('.pset').forEach(x => x.classList.remove('on'));
            b.classList.add('on');
            render();
        };
        row.appendChild(b);
    });
}

function build() {
    jlP = prog(jlG, jlFS(jlPI));
    quad(jlG, jlP);
}

function render() {
    jlG.useProgram(jlP);
    jlG.viewport(0, 0, jlG.canvas.width, jlG.canvas.height);
    
    jlG.uniform2f(jlG.getUniformLocation(jlP, 'u_r'), jlG.canvas.width, jlG.canvas.height);
    jlG.uniform2f(jlG.getUniformLocation(jlP, 'u_c'), jlRe, jlIm);
    jlG.drawArrays(jlG.TRIANGLES, 0, 6);
}

export function update() {
    jlRe = parseFloat(document.getElementById('jlRe').value) || 0;
    jlIm = parseFloat(document.getElementById('jlIm').value) || 0;
    document.querySelectorAll('.pset').forEach(b => b.classList.remove('on'));
    render();
}

export function toggleAnimation() {
    jlAn = !jlAn;
    const btn = document.getElementById('jlAB');
    if (jlAn) {
        btn.textContent = '⏹ Stop';
        btn.classList.add('on');
        loop();
    } else {
        btn.textContent = '▶ Animate';
        btn.classList.remove('on');
        if (jlAF) cancelAnimationFrame(jlAF);
    }
}

function loop() {
    if (!jlAn) return;
    jlAg += 0.007;
    jlRe = 0.7885 * Math.cos(jlAg);
    jlIm = 0.7885 * Math.sin(jlAg);
    document.getElementById('jlRe').value = jlRe.toFixed(4);
    document.getElementById('jlIm').value = jlIm.toFixed(4);
    document.querySelectorAll('.pset').forEach(b => b.classList.remove('on'));
    render();
    jlAF = requestAnimationFrame(loop);
}

export function setPalette(i, btn) {
    jlPI = i;
    document.querySelectorAll('#julia .pb').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    build();
    render();
}

export function isAnimating() {
    return jlAn;
}
