import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from pgvector.psycopg import register_vector
from psycopg.types.json import Jsonb

from langchain_community.document_loaders import (
    PyMuPDFLoader,
    Docx2txtLoader,
    TextLoader,
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings


# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DOCS_PATH = BASE_DIR / "docs"

load_dotenv(BASE_DIR / ".env")

CONNECTION_STRING = os.getenv("PG_CONNECTION")

if not CONNECTION_STRING:
    raise ValueError(
        "PG_CONNECTION not found. Check your .env file."
    )


# Embedding model
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


# Text splitter
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
)


# File loaders
LOADERS = {
    ".pdf": PyMuPDFLoader,
    ".docx": Docx2txtLoader,
    ".txt": TextLoader,
}


def ingest():
    print("Starting ingestion...")

    if not DOCS_PATH.exists():
        print(f"Documents folder not found: {DOCS_PATH}")
        return

    documents = []
    files = {}

    # Load documents
    print(f"Scanning folder: {DOCS_PATH}")

    for file_path in DOCS_PATH.rglob("*"):

        if not file_path.is_file():
            continue

        extension = file_path.suffix.lower()
        loader_class = LOADERS.get(extension)

        if loader_class is None:
            continue

        try:
            if extension == ".txt":
                loaded_docs = TextLoader(
                    str(file_path),
                    encoding="utf-8",
                ).load()
            else:
                loaded_docs = loader_class(str(file_path)).load()

            if not loaded_docs:
                continue

            relative_path = file_path.relative_to(DOCS_PATH)
            file_key = relative_path.as_posix()

            # Department = parent folder, or ALL for root-level files
            department = (
                relative_path.parts[-2]
                if len(relative_path.parts) >= 2
                else "ALL"
            )

            files[file_key] = file_path

            for doc in loaded_docs:
                doc.metadata["source"] = file_key
                doc.metadata["department"] = department

            documents.extend(loaded_docs)

            print(f"Loaded: {file_key}")

        except Exception as error:
            print(f"Error loading {file_path}: {error}")

    if not documents:
        print("Ingested 0 chunks from 0 files")
        return

    print(f"Loaded {len(documents)} document pages/sections.")

    # Split documents into chunks
    chunks = splitter.split_documents(documents)

    if not chunks:
        print(f"Ingested 0 chunks from {len(files)} files")
        return

    print(f"Created {len(chunks)} chunks.")
    print("Generating embeddings...")

    # Generate embeddings
    vectors = embeddings.embed_documents(
        [chunk.page_content for chunk in chunks]
    )

    print("Embeddings generated.")
    print("Saving documents to PostgreSQL...")

    # Store documents and chunks
    with psycopg.connect(CONNECTION_STRING) as conn:
        register_vector(conn)

        with conn.cursor() as cur:

            document_ids = {}

            # Insert original files
            for file_key, file_path in files.items():
                cur.execute(
                    """
                    INSERT INTO documents (
                        filename,
                        file_type,
                        file_data
                    )
                    VALUES (%s, %s, %s)
                    RETURNING id;
                    """,
                    (
                        file_path.name,
                        file_path.suffix.lower(),
                        file_path.read_bytes(),
                    ),
                )

                document_ids[file_key] = cur.fetchone()[0]

            # Keep chunk numbering separate for each file
            chunk_indexes = {}

            for chunk, vector in zip(chunks, vectors):
                source = chunk.metadata["source"]
                department = chunk.metadata["department"]

                document_id = document_ids[source]

                chunk_index = chunk_indexes.get(source, 0)
                chunk_indexes[source] = chunk_index + 1

                cur.execute(
                    """
                    INSERT INTO document_chunks (
                        document_id,
                        chunk_index,
                        chunk_text,
                        embedding,
                        metadata
                    )
                    VALUES (%s, %s, %s, %s, %s);
                    """,
                    (
                        document_id,
                        chunk_index,
                        chunk.page_content,
                        vector,
                        Jsonb({
                            "source": source,
                            "department": department,
                        }),
                    ),
                )

    print(
        f"Ingested {len(chunks)} chunks from {len(files)} files"
    )


if __name__ == "__main__":
    ingest()