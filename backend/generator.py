import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b"
)

if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is missing from the backend .env file."
    )

client = Groq(api_key=GROQ_API_KEY)

SYSTEM_PROMPT = """
You are Aayu Hub, a medical information assistant.

Rules:
1. Provide general medical information, not a diagnosis.
2. Use the supplied medical context when answering.
3. Never invent medical facts.
4. If the context is insufficient, clearly say so.
5. Do not prescribe medicines or change medication doses.
6. Encourage users to consult qualified healthcare professionals.
7. For potentially life-threatening symptoms, advise immediate
   emergency care.
8. Use simple, clear language.
9. Never claim to replace a doctor.
"""


def generate_answer(question, retrieved_documents):
    if not retrieved_documents:
        context = "No relevant medical documents were retrieved."
    else:
        context_parts = []

        for index, document in enumerate(retrieved_documents, start=1):
            filename = document.get("filename", "Unknown source")
            department = document.get("department", "General")
            content = document.get("text", "")

            context_parts.append(
                f"Source {index}: {filename}\n"
                f"Department: {department}\n"
                f"Content:\n{content}"
            )

        context = "\n\n".join(context_parts)

    user_prompt = f"""
Medical knowledge base context:
{context}

User's question:
{question}

Answer clearly using the available context.
If the context is insufficient, say so.
"""

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            temperature=0.2,
            max_tokens=600,
        )

        answer = response.choices[0].message.content

        if not answer:
            raise RuntimeError("The model returned an empty answer.")

        return answer.strip()

    except Exception as exc:
        print(f"Error type: {type(exc).__name__}")

        if hasattr(exc, "status_code"):
            print(f"HTTP status code: {exc.status_code}")

        print(f"Error details: {exc}")
        raise


if __name__ == "__main__":
    sample_documents = [
        {
            "filename": "medical_knowledge.txt",
            "department": "General Medicine",
            "text": (
                "Drinking fluids and resting may help during "
                "many mild illnesses. Persistent or worsening "
                "fever should be assessed by a healthcare professional."
            ),
        }
    ]

    print("Testing Groq answer generation...\n")

    try:
        result = generate_answer(
            "What should I do if my fever persists?",
            sample_documents,
        )

        print("\nGenerated answer:\n")
        print(result)
        print("\nGroq test completed successfully.")

    except Exception as exc:
        print(f"\nTest failed: {type(exc).__name__}: {exc}")
