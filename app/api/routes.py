from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.agent import execute_agent
from app.core.chat_history import get_chat_history

router = APIRouter()

class ChatInput(BaseModel):
    message: str
    session_id: str

@router.post("/chat")
async def chat_endpoint(chat_input: ChatInput):
    try:
        response = execute_agent(
            message=chat_input.message,
            session_id=chat_input.session_id
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")