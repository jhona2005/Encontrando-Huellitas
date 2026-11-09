document.addEventListener('DOMContentLoaded', async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        alert('Debes iniciar sesión para ingresar a tu perfil');
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('nombrePerfil').textContent = usuario.nombre;
    document.getElementById('correoPerfil').textContent = `Correo: ${usuario.correo_electronico}`;
    document.getElementById('telefonoPerfil').textContent = `Teléfono: ${usuario.telefono}`;

    await cargarMisReportes(usuario.id_usuario);
});

async function cargarMisReportes(idUsuario) {
    const contenedor = document.getElementById('contenedorMisReportes');
    try {
        const res = await fetch(`/api/reportes/usuario/${idUsuario}`);
        const misReportes = await res.json();

        contenedor.innerHTML = '';

        if (!Array.isArray(misReportes) || misReportes.length === 0) {
            contenedor.innerHTML = '<p style="grid-column: 1/-1;">No has realizado publicaciones de mascotas aún.</p>';
            return;
        }

        misReportes.forEach(r => {
            const card = document.createElement('div');
            card.className = 'card-mascota';

            const esEliminadoAdmin = (r.estado === 'CERRADO');
            const esEncontrado = (r.estado === 'ENCONTRADO' || r.estado === 'RESUELTO');

            let colorEstado = '#dc3545';
            let textoEstado = 'PERDIDO';

            if (esEliminadoAdmin) {
                colorEstado = '#6c757d';
                textoEstado = 'ELIMINADO';
            } else if (esEncontrado) {
                colorEstado = '#28a745';
                textoEstado = 'ENCONTRADO';
            }

            const paginaEdicion = (r.estado === 'ENCONTRADO') ? 'reporte-hallazgo.html' : 'reporte-perdida.html';

            card.innerHTML = `
                <div style="position: relative;">
                    <img src="${r.url_imagen || '/uploads/default.jpg'}" alt="${r.raza}">
                    <span style="position: absolute; top: 10px; right: 10px; background-color: ${colorEstado}; color: #fff; padding: 0.3rem 0.8rem; border-radius: 12px; font-weight: bold; font-size: 0.75rem;">
                        ${textoEstado}
                    </span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${r.raza}</h3>
                    <p><strong>Especie:</strong> ${r.especie}</p>
                    <p><strong>Zona:</strong> ${r.zona}</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.8rem;">
                        ${esEliminadoAdmin ? `
                            <p style="color: #dc3545; font-weight: bold; margin: 0; text-align: center; padding: 0.5rem 0;">Eliminado por Administrador</p>
                        ` : (esEncontrado ? `
                            <p style="color: #28a745; font-weight: bold; margin: 0; text-align: center; padding: 0.5rem 0;">✓ Caso Resuelto</p>
                        ` : `
                            <button class="btn-buscar" 
                                    style="background-color: #2b7a78; font-size: 0.85rem; padding: 0.5rem; width: 100%; border-radius: 15px;" 
                                    onclick="confirmarEdicion(${r.id_reporte}, '${paginaEdicion}')">
                                Editar reporte
                            </button>
                            
                            <button class="btn-buscar" 
                                    style="background-color: #28a745; font-size: 0.85rem; padding: 0.5rem; width: 100%; border-radius: 15px;" 
                                    onclick="marcarComoEncontrado(${r.id_reporte})">
                                Marcar como ENCONTRADO
                            </button>
                        `)}
                    </div>
                </div>
            `;
            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error('Error al cargar mis reportes:', err);
    }
}

window.confirmarEdicion = function(idReporte, paginaEdicion) {
    const confirmacion = confirm("¿Estás seguro de que deseas modificar los datos de este reporte?");
    if (confirmacion) {
        window.location.href = `${paginaEdicion}?editar=${idReporte}`;
    }
};

async function marcarComoEncontrado(idReporte) {
    if (!confirm('¿Confirmas que la mascota fue encontrada/reunida con su dueño?')) return;

    try {
        const res = await fetch(`/api/reportes/${idReporte}/resuelto`, { method: 'PUT' });
        if (res.ok) {
            alert('Estado actualizado a ENCONTRADO.');
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            cargarMisReportes(usuario.id_usuario);
        } else {
            alert('Error al actualizar el estado.');
        }
    } catch (err) {
        console.error('Error al actualizar estado:', err);
    }
}