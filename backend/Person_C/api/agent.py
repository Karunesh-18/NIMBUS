from fastapi import APIRouter
from pydantic import BaseModel
from Person_C.ai import ask

router = APIRouter()

class AskRequest(BaseModel):
    question: str

@router.post("/agent/ask", tags=["Agent"])
async def ask_agent(req: AskRequest):
    """
    Q&A agent endpoint to query the system with natural language.
    Sends response containing natural language answer, citation refs, and map focus.
    """
    # Call AI agent function directly
    response = ask(req.question)
    return response
