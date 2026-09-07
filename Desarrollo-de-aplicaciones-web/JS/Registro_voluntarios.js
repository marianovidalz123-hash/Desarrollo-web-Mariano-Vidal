document.getElementById('form-voluntario').addEventListener('submit', function (evento) {
    evento.preventDefault(); // Por lo que busque de esta forma no se recarga la pagina al mandar los datos, es como un formulario fake

    let esValido = true;

    // Limpiar errores previos
    document.querySelectorAll('.error').forEach(function (span) {
        span.textContent = '';
    });

    
    const nombre = document.getElementById('nombre').value.trim();
    const regexSoloLetras = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
    // Para que el nombre sea valido solo debe tener letras y en caso deser necesario espacios
    if (nombre === '') {
        mostrarError('error-nombre', 'El nombre es obligatorio.');
        esValido = false;
    } else if (!regexSoloLetras.test(nombre)) {
        mostrarError('error-nombre', 'El nombre solo puede contener letras, elimine el caracter inválido.');
        esValido = false;
    }

    
    const apellido = document.getElementById('apellido').value.trim();
    // Validamos el apellido que tiene las mismas restricciones que el nombre
    if (apellido === '') {
        mostrarError('error-apellido', 'El apellido es obligatorio.');
        esValido = false;
    } else if (!regexSoloLetras.test(apellido)) {
        mostrarError('error-apellido', 'El apellido solo puede contener letras.');
        esValido = false;
    }

    
    const email = document.getElementById('email').value.trim();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //Validacion email
    if (email === '') {
        mostrarError('error-email', 'El correo es obligatorio.');
        esValido = false;
    } else if (!regexEmail.test(email)) {
        mostrarError('error-email', 'El formato del correo no es válido.');
        esValido = false;
    }

    
    const celular = document.getElementById('celular').value.trim();
    const regexCelular = /^\+?56?9\d{8}$/;
    // Para que el numero celular sea valido tiene que tener 8 digitos despues del 569 
    if (celular === '') {
        mostrarError('error-celular', 'El celular es obligatorio.');
        esValido = false;
    } else if (!regexCelular.test(celular.replace(/\s/g, ''))) {
        mostrarError('error-celular', 'Formato esperado: +56912345678');
        esValido = false;
    }

    
    const region = document.getElementById('region').value;
    //Validar la region es simplemente que haya elegido alguna
    if (region === '') {
        mostrarError('error-region', 'Debe seleccionar una región.');
        esValido = false;
    }

    
    const comuna = document.getElementById('comuna').value.trim();
    //Para validar la comuna solo nos fijamos en que haya algo escrito, porque no se como lo haria para verificar las mas de 300 posibles comunas sin escribir una a una 
    if (comuna === '') {
        mostrarError('error-comuna', 'La comuna es obligatoria.');
        esValido = false;
    }

    //Si no hubo error con lo otro, entonces mostrar el mensaje de exito
    const mensajeExito = document.getElementById('mensaje-exito');
    if (esValido) {
        mensajeExito.classList.remove('oculto');
        document.getElementById('form-voluntario').reset();
    } else {
        mensajeExito.classList.add('oculto');
    }
});

function mostrarError(idSpan, mensaje) {
    document.getElementById(idSpan).textContent = mensaje;
}