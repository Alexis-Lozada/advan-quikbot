import requests
from langchain.tools import StructuredTool
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger(__name__)

class CreateUserInput(BaseModel):
    usuario: str = Field(..., description="Nombre de usuario")
    password: str = Field(..., description="Contraseña del usuario")
    tipo_usuario: int = Field(..., description="Tipo de usuario (1 o 2)")
    email: str = Field(None, description="Email del usuario (requerido si tipo_usuario es 2)")

def create_user(usuario: str, password: str, tipo_usuario: int, email: str = None):
    url = "http://dtai.uteq.edu.mx/~lozale218/aquabite/webservice/back/crear_usuario"
    data = {
        "usuario": usuario,
        "password": password,
        "tipo_usuario": tipo_usuario,
    }
    if email:
        data["email"] = email

    logger.info(f"Enviando solicitud a {url} con datos: {data}")
    
    try:
        response = requests.post(url, json=data, timeout=10)
        response.raise_for_status()
        logger.info(f"Respuesta recibida: {response.text}")
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error al conectar con la API: {e}")
        return {"error": f"No se pudo conectar con la API: {str(e)}"}
    except ValueError as e:
        logger.error(f"Error al procesar la respuesta JSON: {e}")
        return {"error": f"Error al procesar la respuesta del servidor: {str(e)}"}

create_user_tool = StructuredTool.from_function(
    func=create_user,
    name="create_user",
    description="Crea un nuevo usuario en el sistema. Requiere nombre de usuario, contraseña, tipo de usuario (1 o 2) y email (si el tipo de usuario es 2).",
    args_schema=CreateUserInput
)