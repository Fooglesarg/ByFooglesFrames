/* =========================================================
   BYFOOGLESFRAMES — EFECTOS
   Todo liviano: sin librerías externas. Cada bloque revisa
   si su elemento existe, así sirve para todas las páginas.
   ========================================================= */

const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const conMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- 1. Bokeh: luces desenfocadas flotando en el hero ---------- */
(function bokeh() {
    const canvas = document.querySelector('.hero-particulas');
    if (!canvas || menosMovimiento) return;
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    const colores = ['255, 179, 71', '255, 111, 79', '232, 64, 94', '255, 213, 154'];
    let ancho, alto, luces = [], visible = true, animando = false;
    const mouse = { x: -9999, y: -9999 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function preparar() {
        ancho = hero.clientWidth;
        alto = hero.clientHeight;
        canvas.width = ancho * dpr;
        canvas.height = alto * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Menos luces en pantallas chicas para cuidar la batería
        const cantidad = Math.round(Math.min(38, (ancho * alto) / 32000));
        luces = Array.from({ length: cantidad }, () => ({
            x: Math.random() * ancho,
            y: Math.random() * alto,
            vx: (Math.random() - 0.5) * 0.25,
            vy: -Math.random() * 0.3 - 0.05,
            r: Math.random() * 26 + 6,
            a: Math.random() * 0.22 + 0.06,
            c: colores[Math.floor(Math.random() * colores.length)]
        }));
    }

    function dibujar() {
        if (!visible) { animando = false; return; }
        ctx.clearRect(0, 0, ancho, alto);
        for (const l of luces) {
            l.x += l.vx; l.y += l.vy;
            if (l.y < -l.r) { l.y = alto + l.r; l.x = Math.random() * ancho; }
            if (l.x < -l.r) l.x = ancho + l.r;
            if (l.x > ancho + l.r) l.x = -l.r;

            // El mouse aparta suavemente las luces
            const dx = l.x - mouse.x, dy = l.y - mouse.y;
            const d = Math.hypot(dx, dy);
            if (d < 150 && d > 0) { l.x += dx / d * 1.4; l.y += dy / d * 1.4; }

            const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
            g.addColorStop(0, `rgba(${l.c}, ${l.a})`);
            g.addColorStop(0.7, `rgba(${l.c}, ${l.a * 0.6})`);
            g.addColorStop(1, `rgba(${l.c}, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(dibujar);
    }

    function arrancar() {
        if (!animando && visible) { animando = true; requestAnimationFrame(dibujar); }
    }

    // Solo se anima si el hero está en pantalla y la pestaña está activa
    new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; arrancar(); }).observe(hero);
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; arrancar(); });

    hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });

    let espera, anchoPrevio = window.innerWidth;
    window.addEventListener('resize', () => {
        // En el celular la barra del navegador cambia el alto al bajar: solo se recalcula si cambia el ancho
        if (window.innerWidth === anchoPrevio) return;
        anchoPrevio = window.innerWidth;
        clearTimeout(espera); espera = setTimeout(preparar, 200);
    });
    preparar();
    arrancar();
})();

/* ---------- 2. Fotos de fondo del hero que se van alternando ---------- */
(function fondoHero() {
    const capas = [...document.querySelectorAll('.hero-fotos div')];
    if (!capas.length) return;
    // La primera ya viene en el HTML; las demás se piden recién cuando cargó la página
    const cargar = c => { if (c.dataset.foto) { c.style.backgroundImage = `url('${c.dataset.foto}')`; delete c.dataset.foto; } };
    requestAnimationFrame(() => capas[0].classList.add('activa'));
    if (menosMovimiento || capas.length < 2) return;
    let i = 0;
    window.addEventListener('load', () => {
        cargar(capas[1]);
        setInterval(() => {
            if (document.hidden) return;
            capas[i].classList.remove('activa');
            i = (i + 1) % capas.length;
            cargar(capas[i]);
            cargar(capas[(i + 1) % capas.length]);
            capas[i].classList.add('activa');
        }, 6500);
    });
})();

/* ---------- 3. Texto que se escribe solo ---------- */
(function maquinaDeEscribir() {
    const el = document.querySelector('.escribe');
    if (!el || menosMovimiento) return;
    const palabras = el.dataset.palabras.split('|');
    let i = 0, letras = palabras[0].length, borrando = true;

    function paso() {
        if (borrando) {
            if (letras > 0) { el.textContent = palabras[i].slice(0, --letras); return setTimeout(paso, 35); }
            borrando = false;
            i = (i + 1) % palabras.length;
            return setTimeout(paso, 250);
        }
        if (letras < palabras[i].length) { el.textContent = palabras[i].slice(0, ++letras); return setTimeout(paso, 70); }
        borrando = true;
        setTimeout(paso, 2200);
    }
    setTimeout(paso, 2600);
})();

/* ---------- 4. Barra de progreso, navbar y luz del cursor ---------- */
(function scroll() {
    const nav = document.querySelector('.nav');
    const raiz = document.documentElement;
    let pendiente = false;

    function actualizar() {
        pendiente = false;
        const max = raiz.scrollHeight - innerHeight;
        raiz.style.setProperty('--avance', max > 0 ? scrollY / max : 0);
        if (nav) nav.classList.toggle('scrolleado', scrollY > 30);
    }
    window.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } }, { passive: true });
    actualizar();

    const luz = document.querySelector('.luz-cursor');
    if (luz && conMouse && !menosMovimiento) {
        window.addEventListener('pointermove', e => {
            luz.style.setProperty('--cx', e.clientX + 'px');
            luz.style.setProperty('--cy', e.clientY + 'px');
        }, { passive: true });
    }
})();

/* ---------- 5. Aparición al hacer scroll ---------- */
(function apariciones() {
    const elementos = document.querySelectorAll('.aparecer');
    if (!('IntersectionObserver' in window) || menosMovimiento) {
        elementos.forEach(el => el.classList.add('visible'));
        return;
    }
    // Retraso escalonado entre hermanos para efecto "cascada"
    elementos.forEach(el => {
        const hermanos = [...el.parentElement.children].filter(h => h.classList.contains('aparecer'));
        el.style.setProperty('--retraso', Math.min(hermanos.indexOf(el), 6) * 0.07 + 's');
    });
    const obs = new IntersectionObserver(entradas => {
        entradas.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    elementos.forEach(el => obs.observe(el));
})();

/* ---------- 6. Foco de luz en tarjetas y botones magnéticos ---------- */
if (conMouse && !menosMovimiento) {
    document.querySelectorAll('.foco').forEach(card => {
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
    });
    document.querySelectorAll('.magnetico').forEach(btn => {
        btn.addEventListener('pointermove', e => {
            const r = btn.getBoundingClientRect();
            const x = e.clientX - r.left - r.width / 2;
            const y = e.clientY - r.top - r.height / 2;
            btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
}

/* ---------- 7. Menú de celular ---------- */
const navBoton = document.querySelector('.nav-boton');
const navLinks = document.getElementById('menu');
function cerrarMenu() {
    if (!navBoton) return;
    navLinks.classList.remove('abierto');
    navBoton.setAttribute('aria-expanded', 'false');
    navBoton.setAttribute('aria-label', 'Abrir menú');
}
if (navBoton && navLinks) {
    navBoton.addEventListener('click', () => {
        const abierto = navLinks.classList.toggle('abierto');
        navBoton.setAttribute('aria-expanded', String(abierto));
        navBoton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', cerrarMenu));
    document.addEventListener('click', e => { if (!e.target.closest('.nav')) cerrarMenu(); });

    /* Resalta en el menú la sección que se está viendo (solo en la portada) */
    const enlaces = [...navLinks.querySelectorAll('a[href^="#"]')];
    if (enlaces.length && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver(entradas => {
            entradas.forEach(e => {
                if (!e.isIntersecting) return;
                enlaces.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === '#' + e.target.id));
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        enlaces.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) obs.observe(s); });
    }
}

/* ---------- 8. Visor de fotos con flechas, teclado y deslizar ---------- */
(function visor() {
    const visor = document.querySelector('.visor');
    if (!visor) return;
    const img = visor.querySelector('.visor-img');
    const contador = visor.querySelector('.visor-contador');
    const cargando = visor.querySelector('.visor-cargando');
    const fotos = [...document.querySelectorAll('.galeria img')];
    let actual = 0, origen = null;

    function precargar(i) {
        const f = fotos[(i + fotos.length) % fotos.length];
        if (f && f.dataset.grande) { const p = new Image(); p.src = f.dataset.grande; }
    }
    function mostrar(i) {
        actual = (i + fotos.length) % fotos.length;
        const f = fotos[actual];
        // Mientras baja la versión grande se ve la chica (que ya está en caché)
        img.src = f.currentSrc || f.src;
        img.alt = f.alt;
        cargando.hidden = !f.dataset.grande;
        if (f.dataset.grande) {
            const grande = new Image();
            grande.onload = grande.onerror = () => {
                if (fotos[actual] !== f) return;
                if (grande.naturalWidth) img.src = grande.src;
                cargando.hidden = true;
            };
            grande.src = f.dataset.grande;
        }
        contador.textContent = `${actual + 1} / ${fotos.length}`;
        img.style.animation = 'none'; img.offsetHeight; img.style.animation = '';
        precargar(actual + 1);
    }
    function abrir(i) {
        origen = document.activeElement;
        mostrar(i);
        visor.hidden = false;
        document.body.style.overflow = 'hidden';
        visor.querySelector('.visor-cerrar').focus({ preventScroll: true });
    }
    function cerrar() {
        if (visor.hidden) return;
        visor.hidden = true;
        document.body.style.overflow = '';
        if (origen) origen.focus({ preventScroll: true });
    }

    fotos.forEach((f, i) => {
        f.addEventListener('click', () => abrir(i));
        // También se abren con el teclado (Tab + Enter)
        f.tabIndex = 0;
        f.setAttribute('role', 'button');
        f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(i); } });
    });
    visor.querySelector('.visor-cerrar').addEventListener('click', cerrar);
    visor.querySelector('.anterior').addEventListener('click', () => mostrar(actual - 1));
    visor.querySelector('.siguiente').addEventListener('click', () => mostrar(actual + 1));
    visor.addEventListener('click', e => { if (e.target === visor) cerrar(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { cerrar(); cerrarMenu(); }
        if (visor.hidden) return;
        if (e.key === 'ArrowLeft') mostrar(actual - 1);
        if (e.key === 'ArrowRight') mostrar(actual + 1);
    });
    let inicioX = null, inicioY = null;
    visor.addEventListener('touchstart', e => { inicioX = e.touches[0].clientX; inicioY = e.touches[0].clientY; }, { passive: true });
    visor.addEventListener('touchend', e => {
        if (inicioX === null) return;
        const dx = e.changedTouches[0].clientX - inicioX;
        const dy = e.changedTouches[0].clientY - inicioY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) mostrar(actual + (dx < 0 ? 1 : -1));
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) cerrar();   // deslizar hacia abajo cierra
        inicioX = inicioY = null;
    });
})();
