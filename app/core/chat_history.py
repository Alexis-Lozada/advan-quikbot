from typing import Dict
from langchain_community.chat_message_histories import ChatMessageHistory

chat_histories: Dict[str, ChatMessageHistory] = {}

def get_chat_history(session_id: str) -> ChatMessageHistory:
    if session_id not in chat_histories:
        chat_histories[session_id] = ChatMessageHistory()
    return chat_histories[session_id]