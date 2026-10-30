import os
from pathlib import Path

import psycopg
from pgvector import Vector
from dotenv import load_dotenv
from pgvector.psycopg import register_vector
from langchain_huggingface import HuggingFaceEmbeddings


# Project paths
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

CONNECTION_STRING = os.getenv("PG_CONNECTION")

if not CONNECTION_STRING:
    raise ValueError("PG_CONNECTION not found. Check your .env file.")


# Use the SAME embedding model as ingestion
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


def retrieve_documents(question, top_k=3):
    # Convert the question into an embedding
    query_vector = Vector(embeddings.embed_query(question))

    # Connect to PostgreSQL
    with psycopg.connect(CONNECTION_STRING) as conn:
        register_vector(conn)

        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    dc.chunk_text,
                    dc.metadata,
                    d.filename,
                    dc.embedding <=> %s AS distance
                FROM document_chunks AS dc
                JOIN documents AS d
                    ON d.id = dc.document_id
                ORDER BY dc.embedding <=> %s
                LIMIT %s;
                """,
                (query_vector, query_vector, top_k),
            )

            results = cur.fetchall()

    retrieved_documents = []

    for chunk_text, metadata, filename, distance in results:
        retrieved_documents.append(
            {
                "text": chunk_text,
                "filename": filename,
                "department": metadata.get("department", "ALL"),
                "distance": float(distance),
            }
        )

    return retrieved_documents


if __name__ == "__main__":
    question = input("Enter your question: ")

    results = retrieve_documents(question)

    if not results:
        print("No documents found.")
    else:
        print("\nRelevant document chunks:\n")

        for index, result in enumerate(results, start=1):
            print(f"--- Result {index} ---")
            print(f"Source: {result['filename']}")
            print(f"Department: {result['department']}")
            print(f"Distance: {result['distance']:.4f}")
            print(f"Content:\n{result['text']}\n")