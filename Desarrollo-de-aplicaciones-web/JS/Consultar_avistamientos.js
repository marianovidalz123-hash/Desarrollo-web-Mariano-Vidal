// Datos simulados  para ver como qeudaria la tabla
const avistamientos = [
    { nombreAve: 'Cóndor andino', tipo: 'Rapaz', lugar: 'Torres del Paine', fecha: '2026-06-12', hora: '09:15' },
    { nombreAve: 'Flamenco chileno', tipo: 'Acuática', lugar: 'Salar de Atacama', fecha: '2026-05-03', hora: '17:40' },
    { nombreAve: 'Zorzal', tipo: 'Paseriforme', lugar: 'Parque O\'Higgins', fecha: '2026-07-20', hora: '08:05' },
    { nombreAve: 'Garza cuca', tipo: 'Zancuda', lugar: 'Humedal Batuco', fecha: '2026-04-18', hora: '11:30' },
    { nombreAve: 'Pingüino de Humboldt', tipo: 'Marina', lugar: 'Punta de Choros', fecha: '2026-08-01', hora: '10:00' },
    { nombreAve: 'Águila mora', tipo: 'Rapaz', lugar: 'Reserva Nacional Río Clarillo', fecha: '2026-03-22', hora: '15:20' },
    { nombreAve: 'Tiuque', tipo: 'Rapaz', lugar: 'Valparaíso', fecha: '2026-07-05', hora: '13:10' },
    { nombreAve: 'Pato jergón', tipo: 'Acuática', lugar: 'Laguna Aculeo', fecha: '2026-02-14', hora: '07:45' },
    { nombreAve: 'Chincol', tipo: 'Paseriforme', lugar: 'Parque Metropolitano', fecha: '2026-08-15', hora: '09:50' },
    { nombreAve: 'Pilpilén', tipo: 'Zancuda', lugar: 'Costa de Concón', fecha: '2026-06-30', hora: '16:00' },
    { nombreAve: 'Gaviota dominicana', tipo: 'Marina', lugar: 'Valparaíso', fecha: '2026-01-25', hora: '12:15' },
    { nombreAve: 'Cernícalo', tipo: 'Rapaz', lugar: 'Cajón del Maipo', fecha: '2026-05-19', hora: '10:40' },
];

const FILAS_POR_PAGINA = 5;
let paginaActual = 1;

const selectTipo = document.getElementById('filtro-tipo');
const selectCampo = document.getElementById('orden-campo');
const selectDireccion = document.getElementById('orden-direccion');
const cuerpoTabla = document.getElementById('cuerpo-tabla');
const infoPagina = document.getElementById('info-pagina');
const btnAnterior = document.getElementById('btn-anterior');
const btnSiguiente = document.getElementById('btn-siguiente');
const mensajeSinResultados = document.getElementById('sin-resultados');

function obtenerDatosFiltradosYOrdenados() {
    let datos = avistamientos.slice(); // copia del arreglo original

    // Filtrar por tipo de ave
    const tipoSeleccionado = selectTipo.value;
    if (tipoSeleccionado !== '') {
        datos = datos.filter(function (item) {
            return item.tipo === tipoSeleccionado;
        });
    }

    // Ordenar 
    const campo = selectCampo.value;
    const direccion = selectDireccion.value;
    datos.sort(function (a, b) {
        let valorA = a[campo];
        let valorB = b[campo];

        if (campo === 'fecha') {
            valorA = new Date(valorA);
            valorB = new Date(valorB);
        } else {
            valorA = valorA.toLowerCase();
            valorB = valorB.toLowerCase();
        }

        if (valorA < valorB) return direccion === 'asc' ? -1 : 1;
        if (valorA > valorB) return direccion === 'asc' ? 1 : -1;
        return 0;
    });

    return datos;
}

function renderizarTabla() {
    const datos = obtenerDatosFiltradosYOrdenados();
    const totalPaginas = Math.max(1, Math.ceil(datos.length / FILAS_POR_PAGINA));

    // Ajustar página actual si quedó fuera de rango (ej: al filtrar y reducir resultados)
    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas;
    }

    const inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
    const datosPagina = datos.slice(inicio, inicio + FILAS_POR_PAGINA);

    cuerpoTabla.innerHTML = '';

    if (datosPagina.length === 0) {
        mensajeSinResultados.classList.remove('oculto');
    } else {
        mensajeSinResultados.classList.add('oculto');
    }

    datosPagina.forEach(function (item) {
        const fila = document.createElement('tr');
        fila.innerHTML =
            '<td>' + item.nombreAve + '</td>' +
            '<td>' + item.tipo + '</td>' +
            '<td>' + item.lugar + '</td>' +
            '<td>' + item.fecha + '</td>' +
            '<td>' + item.hora + '</td>';
        cuerpoTabla.appendChild(fila);
    });

    infoPagina.textContent = 'Página ' + paginaActual + ' de ' + totalPaginas;
    btnAnterior.disabled = paginaActual === 1;
    btnSiguiente.disabled = paginaActual === totalPaginas;
}

// Listeners: cualquier cambio en filtro/orden reinicia a la página 1 
selectTipo.addEventListener('change', function () {
    paginaActual = 1;
    renderizarTabla();
});

selectCampo.addEventListener('change', function () {
    paginaActual = 1;
    renderizarTabla();
});

selectDireccion.addEventListener('change', function () {
    paginaActual = 1;
    renderizarTabla();
});

btnAnterior.addEventListener('click', function () {
    if (paginaActual > 1) {
        paginaActual--;
        renderizarTabla();
    }
});

btnSiguiente.addEventListener('click', function () {
    paginaActual++;
    renderizarTabla();
});

// Primera carga
renderizarTabla();