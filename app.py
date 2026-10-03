import os
import uuid

from flask import Flask, abort, flash, redirect, render_template, request, url_for
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload, selectinload
from werkzeug.utils import secure_filename

import validators as v
from db import Session
from models import Ave, Avistamiento, Comuna, Region, Registro, Voluntario

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")
POR_PAGINA = 5

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-cc5002-tarea2")
# Tope de la petición completa: 5 archivos de 10 MB + margen para el resto del formulario
app.config["MAX_CONTENT_LENGTH"] = v.MAX_ARCHIVOS * v.MAX_BYTES + 1024 * 1024


@app.teardown_appcontext
def cerrar_sesion(_exc):
    Session.remove()


@app.template_filter("fecha")
def filtro_fecha(dt):
    return dt.strftime("%d-%m-%Y")


@app.template_filter("hora")
def filtro_hora(dt):
    return dt.strftime("%H:%M")


# Portada
@app.route("/")
def index():
    ultimos = Session.scalars(
        select(Avistamiento)
        .options(
            joinedload(Avistamiento.ave),
            joinedload(Avistamiento.voluntario),
            selectinload(Avistamiento.registros),
        )
        .order_by(Avistamiento.id.desc())
        .limit(2)
    ).all()
    return render_template("index.html", ultimos=ultimos)


# Registrar voluntario
def _comunas_por_region():
    comunas = Session.scalars(select(Comuna).order_by(Comuna.nombre)).all()
    resultado = {}
    for c in comunas:
        resultado.setdefault(str(c.region_id), []).append({"id": c.id, "nombre": c.nombre.strip()})
    return resultado


def _render_voluntario(form, errors, status=200):
    regiones = Session.scalars(select(Region).order_by(Region.id)).all()
    por_region = _comunas_por_region()
    comunas_sel = por_region.get(form.get("region_id", ""), [])
    return (
        render_template(
            "registro_voluntario.html",
            form=form, errors=errors, regiones=regiones,
            comunas_por_region=por_region, comunas_sel=comunas_sel,
        ),
        status,
    )


@app.route("/voluntarios/nuevo", methods=["GET", "POST"])
def registrar_voluntario():
    if request.method == "GET":
        return _render_voluntario({}, {})

    form = request.form.to_dict()
    errors, datos = v.validar_voluntario(form, Session)
    if errors:
        return _render_voluntario(form, errors, 400)

    voluntario = Voluntario(**datos, fecha_registro=v.ahora_chile())
    try:
        Session.add(voluntario)
        Session.commit()
    except SQLAlchemyError:
        Session.rollback()
        return _render_voluntario(form, {"general": "No se pudo guardar el registro. Intente nuevamente."}, 500)
    return redirect(url_for("voluntario_registrado", id=voluntario.id))


@app.route("/voluntarios/registrado/<int:id>")
def voluntario_registrado(id):
    voluntario = Session.get(Voluntario, id)
    if voluntario is None:
        abort(404)
    return render_template("voluntario_registrado.html", voluntario=voluntario)


# Registrar avistamiento
def _render_avistamiento(form, errors, status=200):
    aves = Session.scalars(select(Ave).order_by(Ave.nombre)).all()
    return render_template("registro_avistamiento.html", form=form, errors=errors, aves=aves), status


@app.route("/avistamientos/nuevo", methods=["GET", "POST"])
def informar_avistamiento():
    if request.method == "GET":
        return _render_avistamiento({"email": request.args.get("email", "")[:80]}, {})

    form = request.form.to_dict()
    errors, d = v.validar_avistamiento(form, request.files, Session)
    if errors:
        return _render_avistamiento(form, errors, 400)

    guardados = []
    try:
        avistamiento = Avistamiento(
            voluntario_id=d["voluntario"].id,
            ave_id=d["ave"].id,
            fecha_hora=d["fecha_hora"],
            lugar=d["lugar"],
            descripcion=d["descripcion"],
        )
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        for arch in d["archivos"]:
            # Nombre en disco generado por el servidor: nunca se usa el nombre enviado por el cliente
            nombre_disco = f"{uuid.uuid4().hex}.{arch['ext']}"
            ruta_abs = os.path.join(UPLOAD_DIR, nombre_disco)
            with open(ruta_abs, "wb") as fh:
                fh.write(arch["datos"])
            guardados.append(ruta_abs)
            nombre_original = secure_filename(arch["original"]) or f"archivo.{arch['ext']}"
            avistamiento.registros.append(
                Registro(ruta_archivo=f"uploads/{nombre_disco}", nombre_archivo=nombre_original[:300])
            )
        Session.add(avistamiento)
        Session.commit()
    except (SQLAlchemyError, OSError):
        Session.rollback()
        for ruta in guardados:
            try:
                os.remove(ruta)
            except OSError:
                pass
        return _render_avistamiento(form, {"general": "No se pudo guardar el avistamiento. Intente nuevamente."}, 500)

    flash("¡Avistamiento registrado con éxito!", "exito")
    return redirect(url_for("index"))


# Listado y detalle
@app.route("/avistamientos")
def listado_avistamientos():
    total = Session.scalar(select(func.count(Avistamiento.id))) or 0
    total_paginas = max(1, -(-total // POR_PAGINA))
    pagina = v.a_entero(request.args.get("pagina")) or 1
    pagina = min(max(pagina, 1), total_paginas)

    filas = Session.scalars(
        select(Avistamiento)
        .options(joinedload(Avistamiento.ave), joinedload(Avistamiento.voluntario),
                 selectinload(Avistamiento.registros))
        .order_by(Avistamiento.fecha_hora.desc(), Avistamiento.id.desc())
        .limit(POR_PAGINA)
        .offset((pagina - 1) * POR_PAGINA)
    ).all()
    return render_template("listado.html", filas=filas, pagina=pagina,
                           total_paginas=total_paginas, total=total)


@app.route("/avistamientos/<int:id>")
def detalle_avistamiento(id):
    av = Session.scalar(
        select(Avistamiento)
        .options(joinedload(Avistamiento.ave),
                 joinedload(Avistamiento.voluntario).joinedload(Voluntario.comuna).joinedload(Comuna.region),
                 selectinload(Avistamiento.registros))
        .where(Avistamiento.id == id)
    )
    if av is None:
        abort(404)
    return render_template("detalle.html", av=av)


# Estadísticas
@app.route("/estadisticas")
def estadisticas():
    return render_template("estadisticas.html")


# Errores
@app.errorhandler(404)
def no_encontrado(_e):
    return render_template("error.html", titulo="Página no encontrada",
                           mensaje="La página que busca no existe."), 404


@app.errorhandler(413)
def muy_grande(_e):
    return render_template("error.html", titulo="Archivos demasiado grandes",
                           mensaje="Cada archivo debe pesar como máximo 10 MB y puede adjuntar hasta 5."), 413


if __name__ == "__main__":
    app.run(debug=True)
