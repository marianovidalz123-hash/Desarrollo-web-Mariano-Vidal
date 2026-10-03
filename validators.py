"""Validaciones del lado del servidor."""
import re
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import func, select

from models import Ave, Comuna, Region, Voluntario

MAX_ARCHIVOS = 5
MAX_BYTES = 10 * 1024 * 1024  # 10 MB por archivo
EXT_PERMITIDAS = {"jpg", "jpeg", "png", "gif", "webp", "mp4", "webm"}

RE_NOMBRE = re.compile(r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$")
RE_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
RE_CELULAR = re.compile(r"^(\+?56)?9\d{8}$")


def ahora_chile() -> datetime:
    try:
        return datetime.now(ZoneInfo("America/Santiago")).replace(tzinfo=None)
    except Exception:
        return datetime.now()


def a_entero(valor):
    """Convierte a int de forma segura (rango INT de MySQL). None si no es válido."""
    valor = (valor or "").strip()
    if not valor.isdigit() or len(valor) > 10:
        return None
    n = int(valor)
    return n if n <= 2147483647 else None


def caracteres_invalidos(texto: str, permitir_saltos: bool = False) -> bool:
    """Caracteres de control o fuera del BMP (la BD usa utf8 de 3 bytes)."""
    for c in texto:
        o = ord(c)
        if o > 0xFFFF:
            return True
        if o < 32 and not (permitir_saltos and c in "\n\r\t"):
            return True
        if o == 127:
            return True
    return False


def validar_voluntario(form, session):
    errors = {}
    nombre = form.get("nombre", "").strip()
    apellido = form.get("apellido", "").strip()
    email = form.get("email", "").strip()
    celular = re.sub(r"\s", "", form.get("celular", ""))

    if not nombre:
        errors["nombre"] = "El nombre es obligatorio."
    elif len(nombre) > 100:
        errors["nombre"] = "El nombre no puede superar los 100 caracteres."
    elif not RE_NOMBRE.match(nombre):
        errors["nombre"] = "El nombre solo puede contener letras."

    if not apellido:
        errors["apellido"] = "El apellido es obligatorio."
    elif len(apellido) > 100:
        errors["apellido"] = "El apellido no puede superar los 100 caracteres."
    elif not RE_NOMBRE.match(apellido):
        errors["apellido"] = "El apellido solo puede contener letras."

    if not email:
        errors["email"] = "El correo es obligatorio."
    elif len(email) > 80:
        errors["email"] = "El correo no puede superar los 80 caracteres."
    elif not RE_EMAIL.match(email) or caracteres_invalidos(email):
        errors["email"] = "El formato del correo no es válido."
    else:
        existe = session.scalar(
            select(Voluntario.id).where(func.lower(Voluntario.email) == email.lower()).limit(1)
        )
        if existe:
            errors["email"] = "Ya existe un voluntario registrado con este correo."

    if not celular:
        errors["celular"] = "El celular es obligatorio."
    elif not RE_CELULAR.match(celular):
        errors["celular"] = "Formato esperado: +56912345678"

    region_id = a_entero(form.get("region_id"))
    comuna_id = a_entero(form.get("comuna_id"))
    if region_id is None or session.get(Region, region_id) is None:
        errors["region"] = "Debe seleccionar una región válida."
        region_id = None
    if comuna_id is None:
        errors["comuna"] = "Debe seleccionar una comuna."
    else:
        comuna = session.get(Comuna, comuna_id)
        if comuna is None:
            errors["comuna"] = "Debe seleccionar una comuna válida."
        elif region_id is not None and comuna.region_id != region_id:
            errors["comuna"] = "La comuna no pertenece a la región seleccionada."

    datos = {
        "nombre": f"{nombre} {apellido}",
        "email": email,
        "telefono": celular,
        "comuna_id": comuna_id,
    }
    return errors, datos


def firma_valida(ext: str, d: bytes) -> bool:
    """Comprueba los primeros bytes (no confiar solo en nombre/tipo enviados por el cliente)."""
    if ext in ("jpg", "jpeg"):
        return d[:3] == b"\xff\xd8\xff"
    if ext == "png":
        return d[:8] == b"\x89PNG\r\n\x1a\n"
    if ext == "gif":
        return d[:6] in (b"GIF87a", b"GIF89a")
    if ext == "webp":
        return d[:4] == b"RIFF" and d[8:12] == b"WEBP"
    if ext == "mp4":
        return d[4:8] == b"ftyp"
    if ext == "webm":
        return d[:4] == b"\x1a\x45\xdf\xa3"
    return False


def validar_avistamiento(form, files, session):
    errors = {}
    email = form.get("email", "").strip()
    lugar = form.get("lugar", "").strip()
    fecha = form.get("fecha", "").strip()
    hora = form.get("hora", "").strip()
    descripcion = form.get("descripcion", "").strip()

    voluntario = None
    if not email:
        errors["email"] = "Debe ingresar el correo con el que se registró."
    elif len(email) > 80 or not RE_EMAIL.match(email) or caracteres_invalidos(email):
        errors["email"] = "El formato del correo no es válido."
    else:
        voluntario = session.scalar(
            select(Voluntario)
            .where(func.lower(Voluntario.email) == email.lower())
            .order_by(Voluntario.id.desc())
            .limit(1)
        )
        if voluntario is None:
            errors["email"] = "No hay un voluntario registrado con este correo."

    ave = None
    ave_id = a_entero(form.get("ave_id"))
    if ave_id is None:
        errors["ave"] = "Debe seleccionar un ave."
    else:
        ave = session.get(Ave, ave_id)
        if ave is None:
            errors["ave"] = "El ave seleccionada no es válida."

    if not lugar:
        errors["lugar"] = "El lugar del avistamiento es obligatorio."
    elif len(lugar) > 200:
        errors["lugar"] = "El lugar no puede superar los 200 caracteres."
    elif caracteres_invalidos(lugar):
        errors["lugar"] = "El lugar contiene caracteres no permitidos."

    if len(descripcion) > 500:
        errors["descripcion"] = "La descripción no puede superar los 500 caracteres."
    elif caracteres_invalidos(descripcion, permitir_saltos=True):
        errors["descripcion"] = "La descripción contiene caracteres no permitidos."

    fecha_hora = None
    if not fecha:
        errors["fecha"] = "La fecha es obligatoria."
    if not hora:
        errors["hora"] = "La hora es obligatoria."
    if fecha and hora:
        try:
            fecha_hora = datetime.strptime(f"{fecha} {hora[:5]}", "%Y-%m-%d %H:%M")
        except ValueError:
            errors["fecha"] = "La fecha u hora no tiene un formato válido."
        else:
            ahora = ahora_chile()
            if fecha_hora > ahora:
                errors["fecha"] = "La fecha no puede estar en el futuro."
            elif fecha_hora < ahora - timedelta(days=365):
                errors["fecha"] = "La fecha no puede ser de hace más de un año."

    archivos = []
    subidos = [f for f in files.getlist("archivos") if f and f.filename]
    if not subidos:
        errors["archivos"] = "Debe adjuntar al menos una foto o video."
    elif len(subidos) > MAX_ARCHIVOS:
        errors["archivos"] = f"Puede adjuntar como máximo {MAX_ARCHIVOS} archivos."
    else:
        for f in subidos:
            ext = f.filename.rsplit(".", 1)[-1].lower() if "." in f.filename else ""
            datos = f.read(MAX_BYTES + 1)
            if ext not in EXT_PERMITIDAS:
                errors["archivos"] = "Solo se permiten imágenes (jpg, png, gif, webp) o videos (mp4, webm)."
            elif len(datos) == 0:
                errors["archivos"] = f"El archivo «{f.filename[:60]}» está vacío."
            elif len(datos) > MAX_BYTES:
                errors["archivos"] = "Cada archivo debe pesar como máximo 10 MB."
            elif not firma_valida(ext, datos):
                errors["archivos"] = f"El contenido de «{f.filename[:60]}» no corresponde a una imagen o video válido."
            if "archivos" in errors:
                archivos = []
                break
            archivos.append({"original": f.filename, "ext": ext, "datos": datos})

    datos_ok = {
        "voluntario": voluntario,
        "ave": ave,
        "lugar": lugar,
        "fecha_hora": fecha_hora,
        "descripcion": descripcion or None,
        "archivos": archivos,
    }
    return errors, datos_ok
