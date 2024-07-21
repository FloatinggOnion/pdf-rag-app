# PageSage: PDF RAG Web Application
*PageSage* is a web application that uses **Retrieval Augmented Generation (RAG)** to allow users to communicate with a PDF document.
<br>
It works by vectorizing uploaded pdfs and then using a pre-trained model to generate text.

## How It's Built
- The frontend is built with ReactJS and TypeScript.
- The frontend is built with FastAPI.
- Embeddings are generated using Langchain Sentence Transformers.
- The vector storage is using ChromaDB.
- The prompts are processed in context by Google Gemini API.

## How It Works
- Upload your PDF file using drag and drop.
- The PDF is being uploaded to the backend, split into chunks, and stored in the vector database.
- The text area becomes enabled, and you can send queries to the backend which will be answered in the context of the uploaded document.

## How To Run
- Clone the repo
- `cd` into the `frontend` directory, and run the command `npm i`.
- `cd` into the `backend` directory, and run `pipenv install`, `pipenv shell` and then `fastapi dev`.
- *If you don't have `pipenv` installed, run `pip install pipenv`*
- You should have a `.env` file, with the api key set as shown in the `.env.example` file.