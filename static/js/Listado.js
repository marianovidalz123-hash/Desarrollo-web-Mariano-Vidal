// Hace clicable toda la fila del listado (el enlace de la primera columna sirve sin JavaScript)
document.querySelectorAll('tr[data-href]').forEach(function (fila) {
    fila.addEventListener('click', function () {
        window.location.href = fila.dataset.href;
    });
});
