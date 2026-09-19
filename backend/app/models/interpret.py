from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class InterpretRequest(BaseModel):
    method_name: str
    result_json: dict
    conversation_history: list[ChatMessage] = []
    follow_up_question: str | None = None

class InterpretResponse(BaseModel):
    explanation: str