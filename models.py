from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Region(Base):
    __tablename__ = "region"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(200))
    comunas: Mapped[list["Comuna"]] = relationship(back_populates="region")


class Comuna(Base):
    __tablename__ = "comuna"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(200))
    region_id: Mapped[int] = mapped_column(ForeignKey("region.id"))
    region: Mapped[Region] = relationship(back_populates="comunas")


class Voluntario(Base):
    __tablename__ = "voluntario"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(80))
    telefono: Mapped[str] = mapped_column(String(15))
    fecha_registro: Mapped[datetime] = mapped_column(DateTime)
    comuna_id: Mapped[int] = mapped_column(ForeignKey("comuna.id"))
    comuna: Mapped[Comuna] = relationship()


class Ave(Base):
    __tablename__ = "ave"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(80))


class Avistamiento(Base):
    __tablename__ = "avistamiento"
    id: Mapped[int] = mapped_column(primary_key=True)
    voluntario_id: Mapped[int] = mapped_column(ForeignKey("voluntario.id"))
    ave_id: Mapped[int] = mapped_column(ForeignKey("ave.id"))
    fecha_hora: Mapped[datetime] = mapped_column(DateTime)
    lugar: Mapped[str] = mapped_column(String(200))
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    voluntario: Mapped[Voluntario] = relationship()
    ave: Mapped[Ave] = relationship()
    registros: Mapped[list["Registro"]] = relationship(
        back_populates="avistamiento", order_by="Registro.id"
    )


class Registro(Base):
    __tablename__ = "registro"
    id: Mapped[int] = mapped_column(primary_key=True)
    ruta_archivo: Mapped[str] = mapped_column(String(300))
    nombre_archivo: Mapped[str] = mapped_column(String(300))
    avistamiento_id: Mapped[int] = mapped_column(ForeignKey("avistamiento.id"))
    avistamiento: Mapped[Avistamiento] = relationship(back_populates="registros")

    @property
    def es_video(self) -> bool:
        return self.ruta_archivo.lower().endswith((".mp4", ".webm"))

    @property
    def mimetype(self) -> str:
        ext = self.ruta_archivo.rsplit(".", 1)[-1].lower()
        return {
            "mp4": "video/mp4", "webm": "video/webm",
            "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
            "gif": "image/gif", "webp": "image/webp",
        }.get(ext, "application/octet-stream")
