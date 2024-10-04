from sqlalchemy import create_engine
from langchain_community.utilities import SQLDatabase
from app.config import settings

# Modifica la URI para SQL Server
db_uri = f"mssql+pyodbc://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}?driver=ODBC+Driver+17+for+SQL+Server"

def get_db():
    try:
        engine = create_engine(db_uri)

        # Especifica las tablas que deseas incluir
        included_tables = ['OPERADOR_STATUS', 'TIPO_REMOLQUE']  # Reemplaza con los nombres de tus tablas

        # Crear la instancia de SQLDatabase con las tablas incluidas
        db = SQLDatabase(engine, include_tables=included_tables)

        print("Conexión a la base de datos establecida con éxito.")
        return db
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")
        raise
