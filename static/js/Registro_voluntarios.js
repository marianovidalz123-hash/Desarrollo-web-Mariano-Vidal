const form = document.getElementById('form-voluntario');
const selectRegion = document.getElementById('region');
const selectComuna = document.getElementById('comuna');
const comunasPorRegion = JSON.parse(document.getElementById('comunas-data').textContent);

// Al cambiar la región se cargan solo las comunas de esa región
selectRegion.addEventListener('change', function () {
    selectComuna.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '-- Seleccione una comuna --';
    selectComuna.appendChild(placeholder);

    (comunasPorRegion[selectRegion.value] || []).forEach(function (c) {
        const opcion = document.createElement('option');
        opcion.value = c.id;
        opcion.textContent = c.nombre;
        selectComuna.appendChild(opcion);
    });
});

form.addEventListener('submit', function (evento) {
    let esValido = true;

    document.querySelectorAll('.error').forEach(function (span) {
        span.textContent = '';
    });

    const regexSoloLetras = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexCelular = /^(\+?56)?9\d{8}$/;

    const nombre = document.getElementById('nombre').value.trim();
    if (nombre === '') {
        mostrarError('error-nombre', 'El nombre es obligatorio.');
        esValido = false;
    } else if (!regexSoloLetras.test(nombre)) {
        mostrarError('error-nombre', 'El nombre solo puede contener letras.');
        esValido = false;
    }

    const apellido = document.getElementById('apellido').value.trim();
    if (apellido === '') {
        mostrarError('error-apellido', 'El apellido es obligatorio.');
        esValido = false;
    } else if (!regexSoloLetras.test(apellido)) {
        mostrarError('error-apellido', 'El apellido solo puede contener letras.');
        esValido = false;
    }

    const email = document.getElementById('email').value.trim();
    if (email === '') {
        mostrarError('error-email', 'El correo es obligatorio.');
        esValido = false;
    } else if (!regexEmail.test(email)) {
        mostrarError('error-email', 'El formato del correo no es válido.');
        esValido = false;
    }

    const celular = document.getElementById('celular').value.replace(/\s/g, '');
    if (celular === '') {
        mostrarError('error-celular', 'El celular es obligatorio.');
        esValido = false;
    } else if (!regexCelular.test(celular)) {
        mostrarError('error-celular', 'Formato esperado: +56912345678');
        esValido = false;
    }

    if (selectRegion.value === '') {
        mostrarError('error-region', 'Debe seleccionar una región.');
        esValido = false;
    }

    if (selectComuna.value === '') {
        mostrarError('error-comuna', 'Debe seleccionar una comuna.');
        esValido = false;
    }

    // Si hay errores no se envía; si todo está bien el formulario se envía a Flask
    if (!esValido) {
        evento.preventDefault();
    }
});

function mostrarError(idSpan, mensaje) {
    document.getElementById(idSpan).textContent = mensaje;
}
