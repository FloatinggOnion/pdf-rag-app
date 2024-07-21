from fastapi import FastAPI, Response, status, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from langchain_chroma import Chroma
from langchain_community.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage
import google.generativeai as genai

from models import Query
from utils import create_db, delete_db, to_markdown

import shutil
import os

API_KEY = os.getenv('GOOGLE_GEMINI_API_KEY')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

PROMPT_TEMPLATE = '''
    Answer the question based only on the following context:
    {context}

    ---

    Answer this question based on the above context: {question}
'''

genai.configure(api_key=API_KEY)

@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(response: Response, file: UploadFile = File(...)):
    
    # Save the uploaded file to disk
    with open(file.filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    create_db(file.filename)
    return Response(f"Database {file.filename} created", status_code=status.HTTP_201_CREATED)


@app.post("/query", status_code=status.HTTP_200_OK)
async def query_item(query: Query):
    embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    db = Chroma(persist_directory="chroma_db",embedding_function=embedding_function)
    results = db.similarity_search(query.query, k=query.neighbours)
    
    if len(results) == 0:
        return Response('Unable to find matching results', status_code=status.HTTP_200_OK)
    
    # format the prompt with the context and question
    formatted_prompt = PROMPT_TEMPLATE.format(
        context="\n".join(doc.page_content for doc in results),
        question=query.query
    )

    model = genai.GenerativeModel('gemini-1.5-flash')
    response_text = model.generate_content(formatted_prompt)

    print(response_text.text)

    sources = [doc.metadata.get('source') for doc in results]

    formatted_response = {'answer': response_text.text, 'sources': sources}

    return JSONResponse({'response': formatted_response}, status_code=status.HTTP_200_OK)


@app.delete("/delete", status_code=status.HTTP_200_OK)
async def delete_database():
    try:
        delete_db()
        return Response("Database deleted", status_code=status.HTTP_200_OK)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Database not found")