import logging
import re

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
evidence-based preliminary symptom summary. The knowledge base
may contain information about cardiology, dermatology,
ophthalmology, orthopaedics, and other care areas.

Return ONLY these three sections, in this order:

1. SYMPTOM SUMMARY
Briefly summarize the symptoms and answers. You may mention a
possible disease or explanation only as an unconfirmed possibility
and only when supported by retrieved information. Never diagnose.

2. RECOMMENDED DEPARTMENT
Recommend Cardiology, Dermatology, Ophthalmology, Orthopaedics,
or another department only when the symptoms and retrieved
information reasonably support it. If the fit is unclear, the
knowledge base has no relevant department, or evidence is
insufficient, recommend starting at a general hospital or General
Medicine for an in-person assessment. Do not invent hospital
availability or claim that a department is present at a specific
hospital.

3. URGENCY RATING OUT OF 5
Start this section with the numeric rating in the exact format
`N/5` (for example, `4/5`). Give a preliminary urgency estimate
from 1 to 5, explain briefly
what the estimate reflects, and state an appropriate timeframe
for professional care. This is not a validated clinical score
and is not a measure or diagnosis of disease severity.
If the estimate is 4 or 5, label it EMERGENCY and advise calling
emergency services now to request an ambulance. Do not suggest
driving oneself or waiting for a routine appointment.

OPTIONAL SECTIONS:
Only add RECOMMENDED NEXT STEPS, WARNING SIGNS, or POSSIBLE
EXPLANATIONS if the user explicitly asks for that information in
their answers. Otherwise omit those sections entirely.

SAFETY RULES:
- Do not present a possible condition as a confirmed diagnosis.
- Do not invent evidence or claim that a source supports
  something it does not support.
- If the retrieved information is insufficient, say so.
- Do not recommend prescription medicines or individualized
  medication doses.
- Never allow a low urgency rating to override emergency
  warning signs.
- If emergency warning signs are present, make immediate
  emergency care the recommendation regardless of rating.
- If the answers indicate a possible emergency, prioritize
  emergency care instead of routine advice.
- Do not delay emergency guidance to ask more questions.
- Encourage professional medical assessment when appropriate.
"""

    try:
        result = ask_aayu(assessment_question)
        assessment = result.get("answer", "")
        rating_match = re.search(
            r"\b([1-5])\s*(?:/|out of)\s*5\b",
            assessment,
            flags=re.IGNORECASE,
        )
        urgency_rating = int(rating_match.group(1)) if rating_match else None

        return {
            "status": "assessment_generated",
            "answers": answers,
            "assessment": assessment,
            "urgency_rating": urgency_rating,
            "emergency_recommended": urgency_rating is not None and urgency_rating >= 4,
            "sources": result.get("sources", []),
        }

    except Exception:
        logging.exception("Aayu Hub assessment failed")

        raise HTTPException(
            status_code=500,
            detail="Unable to generate the assessment right now.",
        )
