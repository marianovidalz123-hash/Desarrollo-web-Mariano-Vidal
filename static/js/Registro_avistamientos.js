const MAX_ARCHIVOS = 5;
const MAX_BYTES = 10 * 1024 * 1024;

document.getElementById('form-avistamiento').addEventListener('submit', function (evento) {
    let esValido = true;

    document.querySelectorAll('.error').forEach(function (span) {
        span.textContent = '';
    });

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const email = document.getElementById('email-voluntario').value.trim();
    if (email === '') {
        mostrarError('error-email', 'Debe ingresar el correo con el que se registró.');
        esValido = false;
    } else if (!regexEmail.test(email)) {
        mostrarError('error-email', 'El formato del correo no es válido.');
        esValido = false;
    }

    if (document.getElementById('ave').value === '') {
        mostrarError('error-ave', 'Debe seleccionar un ave.');
        esValido = false;
    }

    const lugar = document.getElementById('lugar').value.trim();
    if (lugar === '') {
        mostrarError('error-lugar', 'El lugar del avistamiento es obligatorio.');
        esValido = false;
    }

    // Fecha: obligatoria, no futura y no de hace más de un año
    const fechaInput = document.getElementById('fecha').value;
    if (fechaInput === '') {
        mostrarError('error-fecha', 'La fecha es obligatoria.');
        esValido = false;
    } else {
        const fechaIngresada = new Date(fechaInput + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const unAnioAtras = new Date(hoy);
        unAnioAtras.setFullYear(hoy.getFullYear() - 1);

        if (fechaIngresada > hoy) {
            mostrarError('error-fecha', 'La fecha no puede estar en el futuro.');
            esValido = false;
        } else if (fechaIngresada < unAnioAtras) {
            mostrarError('error-fecha', 'La fecha no puede ser de hace más de un año.');
            esValido = false;
        }
    }

    if (document.getElementById('hora').value === '') {
        mostrarError('error-hora', 'La hora es obligatoria.');
        esValido = false;
    }

    if (document.getElementById('descripcion').value.length > 500) {
        mostrarError('error-descripcion', 'La descripción no puede superar los 500 caracteres.');
        esValido = false;
    }

    // Archivos: al menos 1, máximo 5, solo imagen o video, hasta 10 MB cada uno
    const archivos = document.getElementById('archivos').files;
    if (archivos.length === 0) {
        mostrarError('error-archivos', 'Debe adjuntar al menos una foto o video.');
        esValido = false;
    } else if (archivos.length > MAX_ARCHIVOS) {
        mostrarError('error-archivos', 'Puede adjuntar como máximo ' + MAX_ARCHIVOS + ' archivos.');
        esValido = false;
    } else {
        for (let i = 0; i < archivos.length; i++) {
            const tipo = archivos[i].type;
            if (!tipo.startsWith('image/') && !tipo.startsWith('video/')) {
                mostrarError('error-archivos', 'Todos los archivos deben ser imágenes o videos.');
                esValido = false;
                break;
            }
            if (archivos[i].size > MAX_BYTES) {
                mostrarError('error-archivos', 'Cada archivo debe pesar como máximo 10 MB.');
                esValido = false;
                break;
            }
        }
    }

    if (!esValido) {
        evento.preventDefault();
    }
});

function mostrarError(idSpan, mensaje) {
    document.getElementById(idSpan).textContent = mensaje;
}
