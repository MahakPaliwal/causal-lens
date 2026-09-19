import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def explain_result(method_name: str, result_json: dict, conversation_history: list = None, follow_up_question: str = None) -> str:
    base_context = f"""You are a data science assistant helping a non-technical user (e.g. a product manager or marketer) understand a statistical result.

Method used: {method_name}
Result data: {result_json}

Do not use statistical jargon without explaining it. Be direct and practical."""

    if follow_up_question:
        history_text = ""
        if conversation_history:
            for msg in conversation_history:
                speaker = "User" if msg.role == "user" else "Assistant"
                history_text += f"\n{speaker}: {msg.content}"

        prompt = f"""{base_context}

Conversation so far:{history_text}

The user now asks a follow-up question: "{follow_up_question}"

Answer their question directly and specifically, using the result data above. Keep it to 2-4 sentences unless more detail is genuinely needed."""
    else:
        prompt = f"""{base_context}

Explain this result in plain, simple business language (2-4 sentences). If there are any warnings or caveats in the data (like a parallel trends warning, low sample size, or non-significance), mention them clearly. End with one concrete, actionable next step the user could take."""

    response = client.models.generate_content(
    model="gemini-3.5-flash-lite",
    contents=prompt,
)
    return response.text