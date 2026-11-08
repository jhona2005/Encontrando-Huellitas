/* Manejo global de la barra de navegacion con huella e icono de usuario */
document.addEventListener('DOMContentLoaded', () => {
    actualizarBarraNavegacion();
});

function actualizarBarraNavegacion() {
    const usuarioGuardado = localStorage.getItem('usuario');
    const nav = document.querySelector('header nav');

    if (!nav) return;

    if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        nav.innerHTML = `
            <a href="index.html">Inicio</a>
            <a href="reporte-perdida.html">Reportar Pérdida</a>
            <a href="reporte-hallazgo.html">Reportar Hallazgo</a>
            <a href="coincidencias.html">Coincidencias</a>
            <a href="mensajes.html">Mensajes</a>
            <a href="perfil.html" style="color: var(--color-blanco); font-weight: bold; margin-left: 1.5rem; background: rgba(255,255,255,0.15); padding: 0.4rem 0.8rem; border-radius: 15px; display: inline-flex; align-items: center; gap: 0.4rem; text-decoration: none;">
                <svg class="icon-huella" viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: #fff;">
                    <path d="M12 11.5c-2.5 0-4.5 1.8-4.5 3.5 0 2 2 3.5 4.5 3.5s4.5-1.5 4.5-3.5c0-1.7-2-3.5-4.5-3.5zm-5.5-3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm11 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8.5-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                Hola, ${usuario.nombre || 'Usuario'}
            </a>
            <a href="#" id="btnCerrarSesion" style="margin-left: 1rem; color: #ffcccc;">Cerrar Sesión</a>
        `;

        document.getElementById('btnCerrarSesion').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuario');
            alert('Sesión cerrada correctamente');
            window.location.href = 'index.html';
        });
    }
}