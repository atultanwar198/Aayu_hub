import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from rag_pipeline import ask_aayu

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Aayu Hub API",
    description="Backend API for the Aayu Hub medical information chatbot",
    version="1.0.0",
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
        # Retrieve medical documents and generate an answer with Groq.
        result = ask_aayu(question)
        return result

    except Exception:
        logging.exception("Aayu Hub RAG pipeline failed")

        raise HTTPException(
            status_code=500,
            detail="Unable to generate an answer right now.",
        )
