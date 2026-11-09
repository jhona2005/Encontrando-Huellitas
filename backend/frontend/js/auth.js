/* Controlador JS para la gestion de autenticacion y registro */
document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formLogin');
    const formSignup = document.getElementById('formSignup');

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const correoInput = document.getElementById('correo');
            const contrasenaInput = document.getElementById('contrasena');

            if (!correoInput || !contrasenaInput) {
                alert('Error al capturar los campos del formulario');
                return;
            }

            const correo = correoInput.value.trim();
            const contrasena = contrasenaInput.value.trim();

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, contrasena })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('usuario', JSON.stringify(data.usuario));
                    alert('Inicio de sesión exitoso');
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || 'Credenciales inválidas');
                }
            } catch (err) {
                console.error('Error en peticion login:', err);
                alert('No se pudo conectar con el servidor. Verifica que backend esté en ejecución.');
            }
        });
    }

    if (formSignup) {
        formSignup.addEventListener('submit', async (e) => {
            e.preventDefault();

            const datos = {
                nombre: document.getElementById('nombre').value.trim(),
                correo: document.getElementById('correo').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                direccion: document.getElementById('direccion').value.trim(),
                tipo_usuario: document.getElementById('tipo_usuario').value,
                contrasena: document.getElementById('contrasena').value.trim()
            };

            try {
                const res = await fetch('/api/auth/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                const data = await res.json();

                if (res.ok) {
                    alert('Registro exitoso. Ahora puedes iniciar sesión.');
                    window.location.href = 'login.html';
                } else {
                    /* Muestra el mensaje especifico devuelto por la API */
                    alert(data.error || data.detalle || 'Error al registrar usuario');
                }
            } catch (err) {
                console.error('Error en peticion registro:', err);
                alert('No se pudo conectar con la API. Revisa la consola de Node.js.');
            }
        });
    }
});