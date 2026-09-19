from fastapi import APIRouter, HTTPException
from app.models.interpret import InterpretRequest, InterpretResponse
from app.services.interpret_service import explain_result

router = APIRouter(prefix="/api/interpret", tags=["AI Interpretation"])

@router.post("/", response_model=InterpretResponse)
def interpret_result(request: InterpretRequest):
    try:
        explanation = explain_result(
            request.method_name,
            request.result_json,
            request.conversation_history,
            request.follow_up_question,
        )
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI explanation failed: {str(e)}")