document.addEventListener('DOMContentLoaded', async () => {
    const usuarioSesion = JSON.parse(localStorage.getItem('usuario'));
    if (!usuarioSesion) {
        alert('Debes iniciar sesión para ver tus coincidencias.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`/api/coincidencias?id_usuario=${usuarioSesion.id_usuario}`);
        const coincidencias = await res.json();

        const contenedor = document.getElementById('contenedorCoincidencias');
        if (!contenedor) return;
        
        contenedor.innerHTML = '';

        if (!Array.isArray(coincidencias) || coincidencias.length === 0) {
            contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No tienes coincidencias registradas para tus reportes por el momento.</p>';
            return;
        }

        coincidencias.forEach(c => {
            const card = document.createElement('div');
            card.className = 'card-mascota';
            card.style.gridColumn = '1 / -1';
            card.style.display = 'flex';
            card.style.flexDirection = 'row';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'space-between';
            card.style.padding = '1.5rem';
            card.style.maxWidth = '900px';
            card.style.margin = '0 auto 1.5rem auto';

            const porcentaje = Math.round(c.porcentaje_similitud * 100);

            let colorP = c.color_perdido || 'No especificado';
            if (c.color_secundario_perdido && c.color_secundario_perdido !== 'NO_APLICA') {
                colorP += ` / ${c.color_secundario_perdido}`;
            }

            let colorH = c.color_hallado || 'No especificado';
            if (c.color_secundario_hallado && c.color_secundario_hallado !== 'NO_APLICA') {
                colorH += ` / ${c.color_secundario_hallado}`;
            }

            card.innerHTML = `
                <!-- Columna Izquierda: Mascota Perdida -->
                <div style="text-align: center; width: 35%; display: flex; flex-direction: column; align-items: center;">
                    <h4 style="color: var(--color-principal); margin-bottom: 0.5rem;">Mascota Perdida</h4>
                    <img src="${c.foto_perdida || '/uploads/default.jpg'}" 
                         style="width: 220px; height: 220px; object-fit: cover; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.15);">
                    <p style="margin-top: 0.8rem; font-size: 0.9rem;"><strong>Raza:</strong> ${c.raza_perdida || 'Desconocida'}</p>
                    <p style="font-size: 0.9rem;"><strong>Color:</strong> ${colorP}</p>
                    <p style="font-size: 0.85rem; color: #444; margin-top: 0.4rem;">
                        <em>Reportada por <strong>${c.nombre_perdida}</strong></em>
                    </p>
                </div>

                <!-- Columna Central: Similitud y Accion -->
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 26%; text-align: center; padding: 0 0.5rem;">
                    <h3 style="color: var(--color-principal); font-size: 1.4rem; margin-bottom: 0.8rem;">${porcentaje}% Similitud</h3>
                    <button class="btn-buscar" 
                            style="padding: 0.5rem 1rem; width: auto; max-width: 170px; font-size: 0.9rem; border-radius: 15px;" 
                            onclick="iniciarVerificacionCoincidencia(${c.id_coincidencia}, ${c.id_usuario_perdida}, ${c.id_usuario_hallazgo})">
                        <svg class="icon-huella" viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: #fff;">
                            <path d="M12 11.5c-2.5 0-4.5 1.8-4.5 3.5 0 2 2 3.5 4.5 3.5s4.5-1.5 4.5-3.5c0-1.7-2-3.5-4.5-3.5zm-5.5-3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm11 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8.5-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                        Verificar Coincidencia
                    </button>
                </div>

                <!-- Columna Derecha: Mascota Encontrada -->
                <div style="text-align: center; width: 35%; display: flex; flex-direction: column; align-items: center;">
                    <h4 style="color: var(--color-principal); margin-bottom: 0.5rem;">Mascota Encontrada</h4>
                    <img src="${c.foto_hallada || '/uploads/default.jpg'}" 
                         style="width: 220px; height: 220px; object-fit: cover; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.15);">
                    <p style="margin-top: 0.8rem; font-size: 0.9rem;"><strong>Raza:</strong> ${c.raza_hallada || 'Desconocida'}</p>
                    <p style="font-size: 0.9rem;"><strong>Color:</strong> ${colorH}</p>
                    <p style="font-size: 0.85rem; color: #444; margin-top: 0.4rem;">
                        <em>Reportada por <strong>${c.nombre_hallazgo}</strong></em>
                    </p>
                </div>
            `;
            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error('Error al cargar coincidencias:', err);
    }
});

/* Envia el mensaje inicial de coincidencia y redirige al chat de mensajes */
async function iniciarVerificacionCoincidencia(idCoincidencia, idPerdidaUser, idHallazgoUser) {
    const usuarioSesion = JSON.parse(localStorage.getItem('usuario'));
    
    const esMioPerdida = parseInt(usuarioSesion.id_usuario) === parseInt(idPerdidaUser);
    const idReceptor = esMioPerdida ? idHallazgoUser : idPerdidaUser;

    const mensajeInicial = "Hola! Tenemos una coincidencia actualmente, me podrias hablar sobre la mascota que reportaste?";

    try {
        await fetch('/api/mensajes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contenido_mensaje: mensajeInicial,
                id_usuario_emisor: usuarioSesion.id_usuario,
                id_usuario_receptor: idReceptor,
                id_coincidencia: idCoincidencia
            })
        });

        /* Redirigir al chat de la coincidencia */
        window.location.href = `mensajes.html?id_coincidencia=${idCoincidencia}`;
    } catch (err) {
        console.error('Error al iniciar verificacion:', err);
    }
}