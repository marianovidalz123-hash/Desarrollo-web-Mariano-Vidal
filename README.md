

##  Para la ejecución hay que seguir esots pasos:

1. Crear la base de datos (usuario `cc5002` / `programacionweb`, base `tarea2`):
   
   mysql -u root -p < sql/tarea2.sql
   mysql -u root -p tarea2 < sql/region-comuna.sql
   mysql -u root -p tarea2 < sql/aves.sql
   
2.Antes de ejecutar hay que insatalar las dependecias:
   
   pip install -r requirements.txt
   python app.py
   
3. Abrir http://127.0.0.1:5000

## Decisiones de implementación

- Validación doble: se mantienen las validaciones JS de la tarea 1; el servidor las repite todas (no se confía en el cliente). Con errores se vuelve a mostrar el formulario con los datos ingresados y los mensajes.
- Seguridad: consultas solo con SQLAlchemy (parámetros enlazados, sin SQL manual); Jinja escapa todo el HTML (XSS); parámetros de URL (`id`, `pagina`) se convierten a entero de forma segura; se rechazan caracteres de control y fuera del BMP (la BD usa `utf8`).
- Voluntario: nombre y apellido se guardan concatenados en `voluntario.nombre`. La dirección postal de la tarea 1 se eliminó porque el modelo no tiene esa columna. Región y comuna son listas dependientes cargadas desde la BD; el servidor valida que la comuna pertenezca a la región. El correo es único (se usa para identificar al voluntario en el avistamiento). `fecha_registro` se asigna en el servidor (hora de Chile).
- Celular: regex corregida respecto a la tarea 1: `^(\+?56)?9\d{8}$` (acepta `+56912345678`, `56912345678` y `912345678`).
- Avistamiento: el voluntario se identifica por correo (se precarga al venir desde el registro). El "tipo de ave" de la tarea 1 se eliminó porque el modelo no lo tiene; ahora se elige el ave desde la tabla `ave`. Se agregó el campo opcional `descripcion` (máx. 500). Fecha/hora: no futura y no mayor a 1 año.
- Archivos: 1 a 5 por avistamiento, hasta 10 MB c/u, solo jpg/png/gif/webp/mp4/webm. Se valida extensión y firma (primeros bytes) del archivo. En disco se guardan con nombre aleatorio (UUID) en `static/uploads/`; en `registro.ruta_archivo` va la ruta relativa y en `registro.nombre_archivo` el nombre original saneado. Si falla la BD se borran los archivos ya escritos.
- Portada: muestra los 2 últimos avistamientos agregados (por `id`). Listado: 5 por página, ordenado por fecha del avistamiento (más reciente primero); la fila completa es clicable y lleva al detalle con fotos y videos.
- Estadísticas: página placeholder (tarea 3).
