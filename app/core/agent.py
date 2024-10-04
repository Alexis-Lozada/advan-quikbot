from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.messages import HumanMessage
from langchain_core.runnables.history import RunnableWithMessageHistory
from app.tools.sql_toolkit import get_sql_toolkit
from app.tools.vectorstore_toolkit import get_vectorstore_toolkit
from app.tools.create_user_tool import create_user_tool
from app.core.chat_history import get_chat_history
from app.config import settings

chat = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0)

prompt = ChatPromptTemplate.from_messages([
    ("system", """
    Asistente multifuncional con acceso a:
    1. Base de datos MySQL: Consultas de datos estructurados.
    2. Vectorstore Qdrant: Búsquedas semánticas en documentos.
    3. Herramienta de creación de usuarios: Registro de nuevos usuarios.

    Instrucciones:
    - Analiza la consulta y selecciona la herramienta adecuada.
    - Verifica nombres de tablas y estructura de datos.
    - Para crear usuarios, solicita: nombre, contraseña, tipo (1 o 2), email (si tipo es 2).
    - Explica brevemente cualquier cambio en la estrategia de búsqueda.
    """),
    ("placeholder", "{messages}"),
    ("placeholder", "{agent_scratchpad}"),
])

sql_tools = get_sql_toolkit()
vectorstore_tools = get_vectorstore_toolkit()
tools = sql_tools + vectorstore_tools + [create_user_tool]

agent = create_tool_calling_agent(chat, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, max_iterations=20, verbose=True)

conversational_agent_executor = RunnableWithMessageHistory(
    agent_executor,
    get_chat_history,
    input_messages_key="messages",
    output_messages_key="output",
)

def execute_agent(message: str, session_id: str):
    response = conversational_agent_executor.invoke(
        {"messages": [HumanMessage(content=message)]},
        {"configurable": {"session_id": session_id}}
    )
    return response['output']