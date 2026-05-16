import os
from utils import extract_text_from_pdf, extract_text_from_docx, clean_legal_text, split_into_articles
from rag_engine import rag_engine

RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "raw_data")

def process_files():
    if not os.path.exists(RAW_DATA_DIR):
        print(f"Directory {RAW_DATA_DIR} does not exist.")
        return

    files = [f for f in os.listdir(RAW_DATA_DIR) if f.endswith(('.pdf', '.docx'))]
    
    if not files:
        print(f"No PDF or DOCX files found in {RAW_DATA_DIR}")
        return

    for filename in files:
        file_path = os.path.join(RAW_DATA_DIR, filename)
        print(f"Processing: {filename}...")
        
        try:
            with open(file_path, "rb") as f:
                content = f.read()
                
            if filename.endswith('.pdf'):
                raw_text = extract_text_from_pdf(content)
            else:
                raw_text = extract_text_from_docx(content)
            
            cleaned_text = clean_legal_text(raw_text)
            articles = split_into_articles(cleaned_text)
            
            # Prepare for RAG
            metadatas = [{"source": filename, "index": i} for i in range(len(articles))]
            rag_engine.add_documents(articles, metadatas)
            
            print(f"Successfully processed {len(articles)} articles from {filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    process_files()
