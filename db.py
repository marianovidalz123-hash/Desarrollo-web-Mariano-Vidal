import os

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

# Credenciales del enunciado. DATABASE_URL permite sobreescribirlas .
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "mysql+pymysql://cc5002:programacionweb@localhost:3306/tarea2?charset=utf8mb4",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
Session = scoped_session(sessionmaker(bind=engine))
