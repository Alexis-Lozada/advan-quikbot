from sqlalchemy import create_engine
from langchain_community.utilities import SQLDatabase
from app.config import settings

db_uri = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

def get_db():
    try:
        engine = create_engine(db_uri)
        db = SQLDatabase(engine)
        print("Conexión a la base de datos establecida con éxito.")
        return db
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")
        raise