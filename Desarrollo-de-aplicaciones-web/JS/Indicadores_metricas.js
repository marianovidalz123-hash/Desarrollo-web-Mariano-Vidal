// --- Datos simulados: en un sistema real vendrían de la base de datos de voluntarios y avistamientos ---
const voluntariosPorRegion = [
    { region: 'Metropolitana', cantidad: 42 },
    { region: 'Valparaíso', cantidad: 18 },
    { region: 'Biobío', cantidad: 12 },
    { region: 'Los Lagos', cantidad: 9 },
    { region: 'Antofagasta', cantidad: 5 },
];

const avistamientosPorTipo = [
    { tipo: 'Rapaz', cantidad: 25 },
    { tipo: 'Acuática', cantidad: 20 },
    { tipo: 'Paseriforme', cantidad: 30 },
    { tipo: 'Zancuda', cantidad: 10 },
    { tipo: 'Marina', cantidad: 15 },
];

function calcularTotal(lista) {
    return lista.reduce(function (suma, item) {
        return suma + item.cantidad;
    }, 0);
}

function dibujarGrafico(contenedorId, datos, etiquetaCampo) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = '';

    const maximo = Math.max.apply(null, datos.map(function (item) {
        return item.cantidad;
    }));

    datos.forEach(function (item) {
        const porcentaje = (item.cantidad / maximo) * 100;

        const fila = document.createElement('div');
        fila.className = 'fila-grafico';

        const etiqueta = document.createElement('span');
        etiqueta.className = 'etiqueta-grafico';
        etiqueta.textContent = item[etiquetaCampo];

        const barraContenedor = document.createElement('div');
        barraContenedor.className = 'barra-contenedor';

        const barra = document.createElement('div');
        barra.className = 'barra';
        barra.style.width = porcentaje + '%';
        barra.textContent = item.cantidad;

        barraContenedor.appendChild(barra);
        fila.appendChild(etiqueta);
        fila.appendChild(barraContenedor);
        contenedor.appendChild(fila);
    });
}

//Voluntarios 
document.getElementById('total-voluntarios').textContent = calcularTotal(voluntariosPorRegion);
dibujarGrafico('grafico-voluntarios', voluntariosPorRegion, 'region');

//Avistamientos
document.getElementById('total-avistamientos').textContent = calcularTotal(avistamientosPorTipo);
dibujarGrafico('grafico-avistamientos', avistamientosPorTipo, 'tipo');