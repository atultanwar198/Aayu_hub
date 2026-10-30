from retriever import retrieve_documents
from generator import generate_answer


def ask_aayu(question: str) -> dict:
    """
    Retrieve relevant medical information and generate an answer.
    """

    question = question.strip()

    if not question:
        raise ValueError("Please enter a question.")

    # Step 1: Retrieve relevant chunks from PostgreSQL
    documents = retrieve_documents(question, top_k=3)

    # Step 2: Generate an answer using Groq
    answer = generate_answer(question, documents)

    # Step 3: Prepare source information for the frontend
    sources = [
        {
            "filename": document.get("filename", "Unknown source"),
            "department": document.get("department", "General"),
            "distance": float(document.get("distance", 0)),
        }
        for document in documents
    ]

    return {
        "question": question,
        "answer": answer,
        "sources": sources,
    }


if __name__ == "__main__":
    question = input("Ask Aayu Hub a medical question: ")

    try:
        result = ask_aayu(question)

        print("\nAayu Hub:")
        print(result["answer"])

        print("\nSources:")
        for source in result["sources"]:
            print(f"- {source['filename']}")

    except Exception as error:
        print(f"Pipeline error: {error}")