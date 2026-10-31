import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from rag_pipeline import ask_aayu

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Aayu Hub API",
    description="Backend API for the Aayu Hub medical information chatbot",
    version="1.1.0",
)

# Allow the local Next.js frontend to communicate with FastAPI.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)


class AssessmentRequest(BaseModel):
    answers: dict[str, str] = Field(min_length=1)


@app.get("/")
def home():
    return {"message": "Aayu Hub API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/chat")
def chat(request: ChatRequest):
    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Please enter a question.",
        )

    try:
        result = ask_aayu(question)
        return result

    except Exception:
        logging.exception("Aayu Hub RAG pipeline failed")

        raise HTTPException(
            status_code=500,
            detail="Unable to generate an answer right now.",
        )


@app.post("/api/assess")
def assess(request: AssessmentRequest):
    """
    Analyze the answers collected during a symptom interview.
    """

    # Validate and clean the submitted answers.
    answers = {
        key.strip(): value.strip()
        for key, value in request.answers.items()
        if key.strip() and value.strip()
    }

    if not answers:
        raise HTTPException(
            status_code=400,
            detail="Please provide your symptom assessment answers.",
        )

    # Combine all answers into one assessment request.
    symptom_summary = "\n".join(
        f"{question}: {answer}"
        for question, answer in answers.items()
    )

    assessment_question = f"""
You are the medical information assistant for Aayu Hub.

The user has completed a symptom questionnaire.

USER'S ANSWERS:
{symptom_summary}

TASK:
Use the retrieved medical knowledge to provide a cautious,
evidence-based preliminary assessment.

Include these sections:

1. SYMPTOM SUMMARY
Summarize the symptoms and answers provided by the user.

2. POSSIBLE EXPLANATIONS
Explain plausible causes supported by the available evidence.
Do not claim that a disease has been definitively diagnosed.
Mention uncertainty and other possible causes when appropriate.

3. RECOMMENDED DEPARTMENT
Suggest an appropriate medical department when the evidence
supports a recommendation. If the information is insufficient,
say that an in-person medical assessment is needed to determine
the appropriate department.

4. URGENCY RATING OUT OF 5
Provide a preliminary urgency rating from 1 to 5, with:
- The meaning of the rating.
- The reasons for the rating.
- The recommended timeframe for seeking care.

This is an unvalidated preliminary triage estimate, not a
clinically validated severity score. Do not treat the rating
as a definitive measurement of disease severity.

5. RECOMMENDED NEXT STEPS
Provide appropriate, cautious next steps.

6. WARNING SIGNS
Explain which warning signs would require urgent or emergency
medical attention.

SAFETY RULES:
- Do not present a possible condition as a confirmed diagnosis.
- Do not invent evidence or claim that a source supports
  something it does not support.
- If the retrieved information is insufficient, say so.
- Do not recommend prescription medicines or individualized
  medication doses.
- Never allow a low urgency rating to override emergency
  warning signs.
- If the answers indicate a possible emergency, prioritize
  emergency care instead of routine advice.
- Do not delay emergency guidance to ask more questions.
- Encourage professional medical assessment when appropriate.
"""

    try:
        result = ask_aayu(assessment_question)

        return {
            "status": "assessment_generated",
            "answers": answers,
            "assessment": result.get("answer", ""),
            "sources": result.get("sources", []),
        }

    except Exception:
        logging.exception("Aayu Hub assessment failed")

        raise HTTPException(
            status_code=500,
            detail="Unable to generate the assessment right now.",
        )