document.addEventListener("DOMContentLoaded", () => {
    const title = document.querySelector('.brand-title');
    const tagline = document.querySelector('.brand-tagline');
    const nav = document.querySelector('.navbar');

    // 1. Iniciar animaciones de entrada
    // Un pequeño retraso para asegurar una carga limpia
    setTimeout(() => {
        if (title) title.classList.add('fade-in');
        if (tagline) tagline.classList.add('fade-in');
    }, 300);

    // 2. Controlar la visibilidad de la barra de navegación al hacer scroll
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Si el usuario bajó más de 100px, mostramos la barra
        if (currentScroll > 100) {
            nav.classList.add('visible');
        } else {
            // Si vuelve arriba, la escondemos para dejar el inicio limpio
            nav.classList.remove('visible');
        }
    });

    // 3. Opcional: Log de consola para depuración
    console.log("ByFooglesFrames - Sitio cargado correctamente.");
});