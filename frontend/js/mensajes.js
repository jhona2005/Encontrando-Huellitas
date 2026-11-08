let chatSeleccionado = null;
let usuarioSesion = null;

document.addEventListener('DOMContentLoaded', () => {
    usuarioSesion = JSON.parse(localStorage.getItem('usuario'));
    if (!usuarioSesion) {
        alert('Debes iniciar sesión para ver tus mensajes.');
        window.location.href = 'login.html';
        return;
    }

    cargarListaChats();

    const formChat = document.getElementById('formEnviarMensajeChat');
    if (formChat) {
        formChat.addEventListener('submit', enviarMensajeChat);
    }
});

async function cargarListaChats() {
    const contenedor = document.getElementById('contenedorListaCoincidencias');
    try {
        const res = await fetch(`/api/mensajes/chats?id_usuario=${usuarioSesion.id_usuario}`);
        const chats = await res.json();

        contenedor.innerHTML = '';

        if (!Array.isArray(chats) || chats.length === 0) {
            contenedor.innerHTML = '<p style="color: #777; font-size: 0.85rem; text-align: center;">No tienes chats ni mensajes activos por el momento.</p>';
            return;
        }

        chats.forEach(c => {
            const item = document.createElement('div');
            item.style.padding = '0.8rem';
            item.style.marginBottom = '0.5rem';
            item.style.borderRadius = '8px';
            item.style.background = '#fff';
            item.style.cursor = 'pointer';
            item.style.border = '1px solid #ddd';

            const etiquetaSub = c.porcentaje_similitud 
                ? `${c.raza || 'Mascota'} - ${Math.round(c.porcentaje_similitud * 100)}% Similitud`
                : `Contacto directo / Reporte #${c.id_reporte || ''}`;

            item.innerHTML = `
                <strong style="color: var(--color-principal); font-size: 0.95rem;">${c.nombre_otro}</strong>
                <p style="font-size: 0.8rem; color: #555; margin: 0.2rem 0 0 0;">
                    ${etiquetaSub}
                </p>
            `;

            item.onclick = () => seleccionarChat(c, item);
            contenedor.appendChild(item);
        });

        // Abrir automaticamente si viene de una redireccion URL
        const urlParams = new URLSearchParams(window.location.search);
        const idCoincidenciaUrl = urlParams.get('id_coincidencia');
        if (idCoincidenciaUrl && chats.length > 0) {
            const enc = chats.find(x => parseInt(x.id_coincidencia) === parseInt(idCoincidenciaUrl));
            if (enc) seleccionarChat(enc, null);
        }
    } catch (err) {
        console.error('Error al cargar lista de chats:', err);
    }
}

async function seleccionarChat(chat, elementoHtml) {
    chatSeleccionado = chat;

    document.querySelectorAll('#contenedorListaCoincidencias > div').forEach(d => d.style.background = '#fff');
    if (elementoHtml) elementoHtml.style.background = '#e2f0f0';

    const cabecera = document.getElementById('cabeceraChat');
    cabecera.innerHTML = `<h3 style="color: var(--color-principal); margin: 0;">Chat con: ${chat.nombre_otro}</h3>`;

    document.getElementById('formEnviarMensajeChat').style.display = 'flex';

    await cargarHistorialMensajes();
}

async function cargarHistorialMensajes() {
    if (!chatSeleccionado) return;

    const areaBurbujas = document.getElementById('areaBurbujas');
    try {
        let url = `/api/mensajes?id_reporte=${chatSeleccionado.id_reporte}&id_emisor=${usuarioSesion.id_usuario}&id_receptor=${chatSeleccionado.id_otro}`;
        if (chatSeleccionado.id_coincidencia) {
            url = `/api/mensajes?id_coincidencia=${chatSeleccionado.id_coincidencia}`;
        }

        const res = await fetch(url);
        const mensajes = await res.json();

        areaBurbujas.innerHTML = '';

        if (!Array.isArray(mensajes) || mensajes.length === 0) {
            areaBurbujas.innerHTML = '<p style="text-align: center; color: #888;">No hay mensajes registrados aún en este chat.</p>';
            return;
        }

        mensajes.forEach(m => {
            const esMio = parseInt(m.id_usuario_emisor) === parseInt(usuarioSesion.id_usuario);
            const burbuja = document.createElement('div');
            burbuja.style.maxWidth = '70%';
            burbuja.style.padding = '0.6rem 1rem';
            burbuja.style.borderRadius = '12px';
            burbuja.style.marginBottom = '0.6rem';
            burbuja.style.fontSize = '0.9rem';

            if (esMio) {
                burbuja.style.marginLeft = 'auto';
                burbuja.style.background = 'var(--color-principal)';
                burbuja.style.color = '#fff';
            } else {
                burbuja.style.marginRight = 'auto';
                burbuja.style.background = '#e8ecec';
                burbuja.style.color = '#333';
            }

            burbuja.innerHTML = `
                <div>${m.contenido_mensaje}</div>
                <div style="font-size: 0.7rem; text-align: right; opacity: 0.8; margin-top: 0.2rem;">
                    ${m.fecha_envio ? new Date(m.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
            `;
            areaBurbujas.appendChild(burbuja);
        });

        areaBurbujas.scrollTop = areaBurbujas.scrollHeight;
    } catch (err) {
        console.error('Error al cargar historial de mensajes:', err);
    }
}

async function enviarMensajeChat(e) {
    e.preventDefault();
    if (!chatSeleccionado) return;

    const inputTexto = document.getElementById('inputTextoChat');
    const contenido = inputTexto.value.trim();
    if (!contenido) return;

    try {
        const res = await fetch('/api/mensajes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contenido_mensaje: contenido,
                id_usuario_emisor: usuarioSesion.id_usuario,
                id_usuario_receptor: chatSeleccionado.id_otro,
                id_coincidencia: chatSeleccionado.id_coincidencia || null,
                id_reporte: chatSeleccionado.id_reporte || null
            })
        });

        if (res.ok) {
            inputTexto.value = '';
            await cargarHistorialMensajes();
        } else {
            alert('No se pudo enviar el mensaje.');
        }
    } catch (err) {
        console.error('Error al enviar mensaje:', err);
    }
}