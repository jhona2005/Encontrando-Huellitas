/* Listas con las razas mas populares por especie */
const razasPerros = [
    "Criollo / Mestizo", "Labrador Retriever", "Golden Retriever", "Pastor Alemán", 
    "Beagle", "Poodle / Caniche", "Bulldog Francés", "Siberian Husky", 
    "Pug", "Boxer", "Shih Tzu", "Pomerania", "OTRO"
];

const razasGatos = [
    "Criollo / Mestizo", "Siamés", "Persa", "Maine Coon", 
    "Bengala", "Ragdoll", "Siberiano", "Angora", 
    "Azul Ruso", "Sphynx (Sin pelo)", "British Shorthair", "American Shorthair", "OTRO"
];

/* Actualiza dinamicamente el menu desplegable de razas segun la especie elegida */
function actualizarRazas() {
    const especieSelect = document.getElementById('especie');
    const razaSelect = document.getElementById('raza_select');
    const grupoOtro = document.getElementById('grupo_raza_otro');

    if (!especieSelect || !razaSelect) return;

    const especie = especieSelect.value;
    razaSelect.innerHTML = '<option value="">Seleccione una raza</option>';
    
    if (grupoOtro) grupoOtro.style.display = 'none';

    let lista = [];
    if (especie === 'PERRO') lista = razasPerros;
    else if (especie === 'GATO') lista = razasGatos;
    else if (especie === 'OTRO') lista = ['Criollo / Mestizo', 'OTRO'];

    lista.forEach(raza => {
        const opt = document.createElement('option');
        opt.value = raza;
        opt.textContent = raza;
        razaSelect.appendChild(opt);
    });
}

/* Despliega el campo de texto libre si se selecciona la opcion OTRO */
function evaluarRazaOtro() {
    const razaSelect = document.getElementById('raza_select');
    const grupoOtro = document.getElementById('grupo_raza_otro');
    const inputOtro = document.getElementById('raza_otro_input');

    if (!razaSelect || !grupoOtro || !inputOtro) return;

    if (razaSelect.value === 'OTRO') {
        grupoOtro.style.display = 'flex';
        inputOtro.required = true;
    } else {
        grupoOtro.style.display = 'none';
        inputOtro.required = false;
        inputOtro.value = '';
    }
}

/* Determina el valor final de la raza a enviar al servidor */
function obtenerRazaFinal() {
    const razaSelect = document.getElementById('raza_select');
    if (!razaSelect) return '';

    if (razaSelect.value === 'OTRO') {
        const inputOtro = document.getElementById('raza_otro_input');
        return inputOtro ? inputOtro.value.trim() : 'Otro';
    }
    return razaSelect.value;
}

/* Manejo unificado de inicializacion, autorrellenado de edicion y envios */
document.addEventListener('DOMContentLoaded', async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        alert('Debes iniciar sesión para publicar o editar un reporte');
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const idReporteEditar = urlParams.get('editar');

    /* MODO EDICION: Cargar y autorrellenar datos existentes si viene ?editar=ID */
    if (idReporteEditar) {
        const tituloForm = document.querySelector('h2');
        if (tituloForm) tituloForm.textContent = "Editar Reporte de Mascota";

        const btnSubmit = document.querySelector('button[type="submit"]');
        if (btnSubmit) btnSubmit.textContent = "Guardar Cambios del Reporte";

        // La foto deja de ser obligatoria al editar puesto que ya posee una previamente
        const fileInput = document.getElementById('imagen');
        if (fileInput) fileInput.required = false;

        try {
            const res = await fetch(`/api/reportes/${idReporteEditar}`);
            const reporte = await res.json();

            if (reporte && !reporte.status) {
                // 1. Especie y actualización del desplegable de razas
                if (document.getElementById('especie') && reporte.especie) {
                    document.getElementById('especie').value = reporte.especie;
                    actualizarRazas();
                }

                // 2. Raza
                if (document.getElementById('raza_select') && reporte.raza) {
                    const esRazaLista = razasPerros.includes(reporte.raza) || razasGatos.includes(reporte.raza);
                    if (esRazaLista) {
                        document.getElementById('raza_select').value = reporte.raza;
                    } else {
                        document.getElementById('raza_select').value = 'OTRO';
                        evaluarRazaOtro();
                        if (document.getElementById('raza_otro_input')) {
                            document.getElementById('raza_otro_input').value = reporte.raza;
                        }
                    }
                }

                // 3. Colores, tamaño, zona y descripción
                if (document.getElementById('color_principal') && reporte.color_principal) {
                    document.getElementById('color_principal').value = reporte.color_principal;
                }
                if (document.getElementById('color_secundario')) {
                    document.getElementById('color_secundario').value = reporte.color_secundario || 'NO_APLICA';
                }
                if (document.getElementById('tamano') && reporte.tamano) {
                    document.getElementById('tamano').value = reporte.tamano;
                }
                if (document.getElementById('zona') && reporte.zona) {
                    document.getElementById('zona').value = reporte.zona;
                }
                if (document.getElementById('descripcion')) {
                    document.getElementById('descripcion').value = reporte.descripcion || '';
                }

                // 4. Fechas y Recompensa
                if (document.getElementById('fecha_perdida') && reporte.fecha_perdida) {
                    document.getElementById('fecha_perdida').value = reporte.fecha_perdida.split('T')[0];
                }
                if (document.getElementById('fecha_hallazgo') && reporte.fecha_hallazgo) {
                    document.getElementById('fecha_hallazgo').value = reporte.fecha_hallazgo.split('T')[0];
                }
                if (document.getElementById('recompensa') && reporte.recompensa) {
                    document.getElementById('recompensa').value = reporte.recompensa;
                }
            }
        } catch (err) {
            console.error('Error al autorrellenar el reporte:', err);
        }
    }

    /* FORMULARIO PERDIDA */
    const formPerdida = document.getElementById('formPerdida');
    if (formPerdida) {
        formPerdida.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('especie', document.getElementById('especie').value);
            formData.append('raza', obtenerRazaFinal());
            formData.append('color_principal', document.getElementById('color_principal').value);
            formData.append('color_secundario', document.getElementById('color_secundario').value);
            formData.append('tamano', document.getElementById('tamano').value);
            formData.append('zona', document.getElementById('zona').value);
            formData.append('fecha_evento', document.getElementById('fecha_perdida') ? document.getElementById('fecha_perdida').value : '');
            formData.append('recompensa', document.getElementById('recompensa') ? (document.getElementById('recompensa').value || 0) : 0);
            formData.append('descripcion', document.getElementById('descripcion').value);
            formData.append('id_usuario', usuario.id_usuario);
            
            const fileInput = document.getElementById('imagen');
            if (fileInput && fileInput.files[0]) {
                formData.append('imagen', fileInput.files[0]);
            }

            let url = '/api/reportes/perdida';
            let metodo = 'POST';

            if (idReporteEditar) {
                url = `/api/reportes/${idReporteEditar}`;
                metodo = 'PUT';
            }

            try {
                const res = await fetch(url, { method: metodo, body: formData });
                const data = await res.json();
                if (res.ok) {
                    alert(idReporteEditar ? '¡Reporte actualizado exitosamente!' : 'Reporte de pérdida creado con éxito');
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || data.message || 'Error al guardar reporte');
                }
            } catch (err) {
                console.error('Error en envío de reporte de pérdida:', err);
                alert('No se pudo conectar con el servidor.');
            }
        });
    }

    /* FORMULARIO HALLAZGO */
    const formHallazgo = document.getElementById('formHallazgo');
    if (formHallazgo) {
        formHallazgo.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData();
            formData.append('especie', document.getElementById('especie').value);
            formData.append('raza', obtenerRazaFinal());
            formData.append('color_principal', document.getElementById('color_principal').value);
            formData.append('color_secundario', document.getElementById('color_secundario').value);
            formData.append('tamano', document.getElementById('tamano').value);
            formData.append('zona', document.getElementById('zona').value);
            formData.append('fecha_evento', document.getElementById('fecha_hallazgo') ? document.getElementById('fecha_hallazgo').value : '');
            formData.append('descripcion', document.getElementById('descripcion').value);
            formData.append('id_usuario', usuario.id_usuario);

            const fileInput = document.getElementById('imagen');
            if (fileInput && fileInput.files[0]) {
                formData.append('imagen', fileInput.files[0]);
            }

            let url = '/api/reportes/hallazgo';
            let metodo = 'POST';

            if (idReporteEditar) {
                url = `/api/reportes/${idReporteEditar}`;
                metodo = 'PUT';
            }

            try {
                const res = await fetch(url, { method: metodo, body: formData });
                const data = await res.json();
                if (res.ok) {
                    alert(idReporteEditar ? '¡Reporte actualizado exitosamente!' : 'Reporte de hallazgo creado con éxito');
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || data.message || 'Error al guardar reporte');
                }
            } catch (err) {
                console.error('Error en envío de reporte de hallazgo:', err);
                alert('No se pudo conectar con el servidor.');
            }
        });
    }
});