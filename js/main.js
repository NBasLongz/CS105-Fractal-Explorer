import * as vk from './fractals/von-koch.js';
import * as mk from './fractals/minkowski.js';
import * as st from './fractals/sierpinski-triangle.js';
import * as sc from './fractals/sierpinski-carpet.js';
import * as mb from './fractals/mandelbrot.js';
import * as jl from './fractals/julia.js';

let currentFractal = 'home';
const inited = {};

// Navigation
window.go = (id) => {
    document.getElementById('home').style.display = 'none';
    document.querySelectorAll('.fp').forEach(p => p.classList.remove('on'));
    document.getElementById(id).classList.add('on');
    document.getElementById('backBtn').classList.add('show');
    currentFractal = id;
    window.scrollTo(0, 0);

    if (!inited[id]) {
        inited[id] = true;
        const initFn = {
            vankoch: vk.init,
            minkowski: mk.init,
            sierpT: st.init,
            sierpC: sc.init,
            mandelbrot: mb.init,
            julia: jl.init
        }[id];
        initFn?.();
    }
};

window.goHome = () => {
    document.getElementById('home').style.display = '';
    document.querySelectorAll('.fp').forEach(p => p.classList.remove('on'));
    document.getElementById('backBtn').classList.remove('show');

    // Stop Julia animation if running
    if (currentFractal === 'julia' && jl.isAnimating()) {
        jl.toggleAnimation();
    }

    currentFractal = 'home';
};

// Event handlers for UI buttons (need to be on window for onclick)
window.vkCh = vk.changeLevel;
window.mkCh = mk.changeLevel;
window.stCh = st.changeLevel;
window.scCh = sc.changeLevel;
window.mbPal = mb.setPalette;
window.jlUpd = jl.update;
window.jlAnim = jl.toggleAnimation;
window.jlPal = jl.setPalette;

// Global Keyboard Handle
document.addEventListener('keydown', e => {
    if (currentFractal === 'mandelbrot') {
        mb.handleKey(e);
    }
});
