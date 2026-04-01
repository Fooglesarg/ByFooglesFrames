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

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Crear el contenedor del modal si no existe
    const modal = document.createElement('div');
    modal.classList.add('lightbox-modal');
    document.body.appendChild(modal);

    const modalImg = document.createElement('img');
    modal.appendChild(modalImg);

    // 2. Seleccionar todas las imágenes de las grillas
    const images = document.querySelectorAll('.stream-item img');

    images.forEach(img => {
        img.style.cursor = 'zoom-in'; // Cambia el cursor para indicar que es clickeable
        
        img.addEventListener('click', () => {
            modalImg.src = img.src; // Copia la ruta de la imagen
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Evita el scroll de fondo
        });
    });

    // 3. Cerrar el modal al hacer clic en cualquier parte
    modal.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Devuelve el scroll
    });
});