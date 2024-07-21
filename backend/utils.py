from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain_chroma import Chroma
from IPython.display import display
from IPython.display import Markdown

import warnings
import shutil
import textwrap
import os

warnings.filterwarnings("ignore")

# loading the pdf and creating db
def create_db(path_to_file: str):

    # load the pdf
    loader = PyPDFLoader(path_to_file)
    pages = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100, length_function=len, is_separator_regex=False)
    chunks = text_splitter.split_documents(pages)
    print(len(chunks))

    ids = [str(i) for i in range(1, len(chunks) + 1)]

    # creating open-source embedding function
    embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

    # create chroma database with IDs
    Chroma.from_documents(pages, embedding_function, persist_directory="chroma_db", ids=ids)


# deleting the db
def delete_db():
    try:
        shutil.rmtree("chroma_db")
    except FileNotFoundError:
        raise FileNotFoundError("Database not found")
    

def to_markdown(text):
  text = text.replace('•', '  *')
  return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))