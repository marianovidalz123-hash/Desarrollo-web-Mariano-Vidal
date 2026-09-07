document.getElementById('form-avistamiento').addEventListener('submit', function (evento) {
    evento.preventDefault(); // Evita que el formulario recargue

    let esValido = true;

    // Limpiar errores previos
    document.querySelectorAll('.error').forEach(function (span) {
        span.textContent = '';

    });


    const emailVoluntario = document.getElementById('email-voluntario').value.trim();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //Validar correo del voluntario
    if (emailVoluntario === '') {
        mostrarError('error-email-voluntario', 'Debe ingresar el correo con el que se registró.');
        esValido = false;
    } else if (!regexEmail.test(emailVoluntario)) {
        mostrarError('error-email-voluntario', 'El formato del correo no es válido.');
        esValido = false;
    }

    const tipoAve = document.getElementById('tipo-ave').value;
    //Validar tipo de ave 
    if (tipoAve === '') {
        mostrarError('error-tipo-ave', 'Debe seleccionar un tipo de ave.');
        esValido = false;
    }

    const nombreAve = document.getElementById('nombre-ave').value.trim();
    const regexSoloLetras = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
    //Validar tipo de ave 
    if (nombreAve === '') {
        mostrarError('error-nombre-ave', 'El nombre del ave es obligatorio.');
        esValido = false;
    } else if (!regexSoloLetras.test(nombreAve)) {
        mostrarError('error-nombre-ave', 'El nombre solo puede contener letras.');
        esValido = false;
    }

    const lugar = document.getElementById('lugar').value.trim();
    //Validar que el lugar sea no vacio
    if (lugar === '') {
        mostrarError('error-lugar', 'El lugar del avistamiento es obligatorio.');
        esValido = false;
    }

    const fechaInput = document.getElementById('fecha').value;
    //Valdiar fecha le puse que no sea vacia, ni futura como tapoco demasiado antigua, en concreto 1 año atras
    if (fechaInput === '') {
        mostrarError('error-fecha', 'La fecha es obligatoria.');
        esValido = false;
    } else {
        const fechaIngresada = new Date(fechaInput + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const unAnioAtras = new Date();
        unAnioAtras.setFullYear(hoy.getFullYear() - 1);

        if (fechaIngresada > hoy) {
            mostrarError('error-fecha', 'La fecha no puede estar en el futuro.');
            esValido = false;
        } else if (fechaIngresada < unAnioAtras) {
            mostrarError('error-fecha', 'La fecha no puede ser de hace más de un año.');
            esValido = false;
        }
    }

    const hora = document.getElementById('hora').value;
    //Validar hora, solo importa que no sea vacia 
    if (hora === '') {
        mostrarError('error-hora', 'La hora es obligatoria.');
        esValido = false;
    }

    const archivoInput = document.getElementById('archivo');
    //Para validar el archivo tiene que existir y ser  imagen o video
    if (archivoInput.files.length === 0) {
        mostrarError('error-archivo', 'Debe adjuntar una foto o video del avistamiento.');
        esValido = false;
    } else {
        const archivo = archivoInput.files[0];
        const esImagenOVideo = archivo.type.startsWith('image/') || archivo.type.startsWith('video/');
        if (!esImagenOVideo) {
            mostrarError('error-archivo', 'El archivo debe ser una imagen o un video.');
            esValido = false;
        }
    }

    const mensajeExito = document.getElementById('mensaje-exito');
    //Si no hubo error hasta ahora entonces mostrar un mensaje de exito
    if (esValido) {
        mensajeExito.classList.remove('oculto');
        document.getElementById('form-avistamiento').reset();
    } else {
        mensajeExito.classList.add('oculto');
    }
});

function mostrarError(idSpan, mensaje) {
    document.getElementById(idSpan).textContent = mensaje;
}