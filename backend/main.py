from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .utils import extract_text_from_pdf, extract_text_from_docx, clean_legal_text, split_into_articles
from .rag_engine import rag_engine

app = FastAPI(title="Law Chatbot API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Law Chatbot API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    try:
        content = await file.read()
        if file.filename.endswith('.pdf'):
            raw_text = extract_text_from_pdf(content)
        else:
            raw_text = extract_text_from_docx(content)
        
        cleaned_text = clean_legal_text(raw_text)
        articles = split_into_articles(cleaned_text)
        
        # Prepare for RAG
        metadatas = [{"source": file.filename, "index": i} for i in range(len(articles))]
        rag_engine.add_documents(articles, metadatas)
        
        return {
            "filename": file.filename,
            "articles_found": len(articles),
            "status": "success",
            "message": f"Processed {len(articles)} articles and added to Vector DB"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
