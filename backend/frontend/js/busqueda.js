/* Listas de razas estandarizadas */
const razasPerrosFiltro = [
    "Criollo / Mestizo", "Labrador Retriever", "Golden Retriever", "Pastor Alemán", 
    "Beagle", "Poodle / Caniche", "Bulldog Francés", "Siberian Husky", 
    "Pug", "Boxer", "Shih Tzu", "Pomerania", "OTRO"
];

const razasGatosFiltro = [
    "Criollo / Mestizo", "Siamés", "Persa", "Maine Coon", 
    "Bengala", "Ragdoll", "Siberiano", "Angora", 
    "Azul Ruso", "Sphynx (Sin pelo)", "British Shorthair", "American Shorthair", "OTRO"
];

let reporteDestinoGlobal = null;

function actualizarRazasFiltro() {
    const especieSelect = document.getElementById('filtroEspecie');
    const razaSelect = document.getElementById('filtroRaza');

    if (!especieSelect || !razaSelect) return;

    const especie = especieSelect.value;
    razaSelect.innerHTML = '<option value="">Todas las razas</option>';

    let lista = [];
    if (especie === 'PERRO') lista = razasPerrosFiltro;
    else if (especie === 'GATO') lista = razasGatosFiltro;
    else if (especie === 'OTRO') lista = ['Criollo / Mestizo', 'OTRO'];

    lista.forEach(raza => {
        const opt = document.createElement('option');
        opt.value = raza;
        opt.textContent = raza;
        razaSelect.appendChild(opt);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarRazasFiltro();
    cargarReportes();

    const formBusqueda = document.getElementById('formBusqueda');
    if (formBusqueda) {
        formBusqueda.addEventListener('submit', (e) => {
            e.preventDefault();

            const especie = document.getElementById('filtroEspecie')?.value || '';
            const raza = document.getElementById('filtroRaza')?.value || '';
            const color_principal = document.getElementById('filtroColorPrincipal')?.value || '';
            const zona = document.getElementById('filtroZona')?.value || '';

            const queryParams = new URLSearchParams();

            if (especie && especie !== 'Todas' && especie !== '') {
                queryParams.append('especie', especie);
            }
            if (raza && raza !== 'Todas las razas' && raza !== '') {
                queryParams.append('raza', raza);
            }
            if (color_principal && color_principal !== 'Todos los colores' && color_principal !== '') {
                queryParams.append('color_principal', color_principal);
            }
            if (zona && zona !== 'Todas las localidades' && zona !== '') {
                queryParams.append('zona', zona);
            }

            cargarReportes(queryParams.toString());
        });
    }
});

async function cargarReportes(queryString = '') {
    const contenedor = document.getElementById('contenedorReportes');
    if (!contenedor) return;

    const usuarioSesion = JSON.parse(localStorage.getItem('usuario'));
    const esAdmin = usuarioSesion && usuarioSesion.tipo_usuario === 'ADMIN';

    try {
        const url = queryString ? `/api/reportes?${queryString}` : '/api/reportes';
        const res = await fetch(url);
        const reportes = await res.json();

        contenedor.innerHTML = '';

        if (!Array.isArray(reportes) || reportes.length === 0) {
            contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No se encontraron reportes con los criterios ingresados.</p>';
            return;
        }

        reportes.forEach(r => {
            const card = document.createElement('div');
            card.className = 'card-mascota';

            let textoColor = r.color_principal || r.color || 'No especificado';
            if (r.color_secundario && r.color_secundario !== 'NO_APLICA') {
                textoColor += ` / ${r.color_secundario}`;
            }

            let colorEstado = '#dc3545';
            let textoEstado = 'PERDIDO';

            if (r.estado === 'HALLADO') {
                colorEstado = '#fd7e14';
                textoEstado = 'HALLADO';
            } else if (r.estado === 'ENCONTRADO' || r.estado === 'RESUELTO') {
                colorEstado = '#28a745';
                textoEstado = 'ENCONTRADO';
            }

            card.innerHTML = `
                <div style="position: relative;">
                    <img src="${r.url_imagen || '/uploads/default.jpg'}" alt="${r.raza || 'Mascota'}">
                    <span style="position: absolute; top: 10px; right: 10px; background-color: ${colorEstado}; color: #fff; padding: 0.3rem 0.8rem; border-radius: 12px; font-weight: bold; font-size: 0.75rem;">
                        ${textoEstado}
                    </span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${r.raza || 'Mascota'}</h3>
                    <p><strong>Especie:</strong> ${r.especie}</p>
                    <p><strong>Color:</strong> ${textoColor}</p>
                    <p><strong>Zona:</strong> ${r.zona}</p>
                    <p><strong>Descripción:</strong> ${r.descripcion || 'Sin descripción'}</p>

                    <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.8rem;">
                        <button class="btn-contactar" onclick="iniciarContacto(${r.id_reporte}, ${r.id_usuario})">
                            Contactar
                        </button>
                        ${esAdmin ? `
                            <button style="background: #dc3545; color: #fff; border: none; padding: 0.6rem; border-radius: 15px; cursor: pointer; font-weight: bold;" onclick="eliminarComoAdmin(${r.id_reporte})">
                                Eliminar Reporte (ADMIN)
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error('Error al cargar reportes:', err);
    }
}

/* Modal de seleccion o contacto directo de Administrador */
async function iniciarContacto(idReporteDestino, idUsuarioReceptor) {
    const usuarioSesion = JSON.parse(localStorage.getItem('usuario'));

    if (!usuarioSesion) {
        alert('Debes iniciar sesión para contactar.');
        window.location.href = 'login.html';
        return;
    }

    if (parseInt(usuarioSesion.id_usuario) === parseInt(idUsuarioReceptor)) {
        alert('Este reporte fue publicado por ti.');
        return;
    }

    // SI ES ADMIN: Genera chat directo sin necesidad de vincular reporte propio
    if (usuarioSesion.tipo_usuario === 'ADMIN') {
        const textoAdmin = prompt('Instancia Administrador: Escribe un mensaje directo para verificar el reporte:');
        if (!textoAdmin || !textoAdmin.trim()) return;

        try {
            const res = await fetch('/api/mensajes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contenido_mensaje: `[REVISIÓN ADMIN]: ${textoAdmin.trim()}`,
                    id_usuario_emisor: usuarioSesion.id_usuario,
                    id_usuario_receptor: idUsuarioReceptor,
                    id_reporte: idReporteDestino
                })
            });

            if (res.ok) {
                alert('Mensaje de Administrador enviado.');
                window.location.href = 'mensajes.html';
            }
        } catch (err) {
            console.error('Error en contacto admin:', err);
        }
        return;
    }

    // USUARIO NORMAL: Cargar reportes activos propios (PERDIDO o HALLADO) para el Modal
    try {
        const res = await fetch('/api/reportes');
        const todos = await res.json();
        const resDestino = await fetch(`/api/reportes/${idReporteDestino}`);
        reporteDestinoGlobal = await resDestino.json();

        const misReportes = todos.filter(r => 
            parseInt(r.id_usuario) === parseInt(usuarioSesion.id_usuario) && 
            ['PERDIDO', 'HALLADO'].includes(r.estado)
        );

        if (misReportes.length === 0) {
            alert('Debes tener al menos una publicación activa (Perdida o Hallada) para generar una coincidencia y contactar.');
            return;
        }

        const modal = document.getElementById('modalContacto');
        const contenedorLista = document.getElementById('listaMisReportesModal');
        contenedorLista.innerHTML = '';

        misReportes.forEach(miRep => {
            const btnItem = document.createElement('div');
            btnItem.style.padding = '0.8rem';
            btnItem.style.border = '1px solid #ccc';
            btnItem.style.borderRadius = '8px';
            btnItem.style.cursor = 'pointer';
            btnItem.style.background = '#f9f9f9';
            btnItem.innerHTML = `<strong>[${miRep.estado}] ${miRep.especie} - ${miRep.raza}</strong> (${miRep.zona})`;

            btnItem.onclick = () => procesarCoincidenciaContacto(miRep, reporteDestinoGlobal, usuarioSesion);
            contenedorLista.appendChild(btnItem);
        });

        modal.style.display = 'flex';
    } catch (err) {
        console.error('Error al abrir panel de coincidencia:', err);
    }
}

function cerrarModalContacto() {
    document.getElementById('modalContacto').style.display = 'none';
}

async function procesarCoincidenciaContacto(miReporte, reporteDestino, usuarioSesion) {
    const norm = (txt) => (txt || '').toString().trim().toLowerCase();

    // 1. Validar especie idéntica
    if (norm(miReporte.especie) !== norm(reporteDestino.especie)) {
        alert('No se puede generar la coincidencia: Las especies de los reportes no coinciden.');
        return;
    }

    // 2. Validar coincidencia adicional en Raza, Color o Zona
    const coincideRaza = norm(miReporte.raza) === norm(reporteDestino.raza) || norm(miReporte.raza).includes(norm(reporteDestino.raza));
    const coincideColor = norm(miReporte.color_principal) === norm(reporteDestino.color_principal);
    const coincideZona = norm(miReporte.zona) === norm(reporteDestino.zona);

    if (!coincideRaza && !coincideColor && !coincideZona) {
        alert('No se cumplen los criterios mínimos de coincidencia (debe coincidir en raza, color o zona además de la especie).');
        return;
    }

    const textoMensaje = prompt('Escribe tu mensaje para iniciar el contacto:');
    if (!textoMensaje || !textoMensaje.trim()) return;

    try {
        await fetch('/api/mensajes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contenido_mensaje: textoMensaje.trim(),
                id_usuario_emisor: usuarioSesion.id_usuario,
                id_usuario_receptor: reporteDestino.id_usuario,
                id_reporte: reporteDestino.id_reporte
            })
        });

        alert('Coincidencia registrada y mensaje enviado. Puedes ver el avance en la sección Mensajes.');
        cerrarModalContacto();
        window.location.href = 'mensajes.html';
    } catch (err) {
        console.error('Error al registrar coincidencia:', err);
    }
}

/* Borrado fisico exclusivo para ADMIN con verificación por API */
async function eliminarComoAdmin(idReporte) {
    const usuarioSesion = JSON.parse(localStorage.getItem('usuario'));

    if (!usuarioSesion || usuarioSesion.tipo_usuario !== 'ADMIN') {
        alert('Acción no permitida');
        return;
    }

    if (!confirm('¿Estás seguro de eliminar este reporte de forma permanente?')) return;

    const pass = prompt('Ingresa tu contraseña de Administrador para confirmar el borrado:');
    if (!pass) return;

    try {
        const resVal = await fetch('/api/auth/validar-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario: usuarioSesion.id_usuario, contrasena: pass })
        });

        const valData = await resVal.json();

        if (!resVal.ok || !valData.valido) {
            alert('Verificación fallida: Contraseña de Administrador incorrecta.');
            return;
        }

        const resDel = await fetch(`/api/reportes/${idReporte}`, { method: 'DELETE' });
        if (resDel.ok) {
            alert('El reporte ha sido eliminado permanentemente del sistema.');
            cargarReportes();
        } else {
            alert('Error al procesar la eliminación.');
        }
    } catch (err) {
        console.error('Error en borrado administrador:', err);
    }
}