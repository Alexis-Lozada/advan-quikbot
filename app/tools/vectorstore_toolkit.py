from langchain.vectorstores import Qdrant
from langchain_openai import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.agents.agent_toolkits import VectorStoreInfo, VectorStoreToolkit
from qdrant_client import QdrantClient
from app.config import settings

def get_vectorstore_toolkit():
    client = QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY
    )

    embeddings = OpenAIEmbeddings()

    vectorstore = Qdrant(
        client=client,
        collection_name=settings.QDRANT_COLLECTION_NAME,
        embeddings=embeddings
    )

    vectorstore_info = VectorStoreInfo(
        name="qdrant_vectorstore",
        description="Utiliza esta herramienta para realizar búsquedas semánticas y recuperar documentos relevantes relacionados con reportes de nike.",
        vectorstore=vectorstore
    )

    vectorstore_toolkit = VectorStoreToolkit(
        vectorstore_info=vectorstore_info,
        llm=ChatOpenAI(temperature=0)
    )

    return vectorstore_toolkit.get_tools()