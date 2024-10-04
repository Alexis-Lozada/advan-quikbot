from langchain_openai import ChatOpenAI
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from app.database.db_config import get_db

def get_sql_toolkit():
    db = get_db()
    sql_toolkit = SQLDatabaseToolkit(
        db=db,
        llm=ChatOpenAI(temperature=0),
        database_name="Base de Datos SQL Server",
        description="Utiliza esta herramienta cuando necesites consultar datos estructurados almacenados en la base de datos SQL Server."
    )
    return sql_toolkit.get_tools()