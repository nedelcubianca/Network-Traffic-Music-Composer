from __future__ import annotations
import asyncio
import os
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from models import CaptureResponse
from parser import parse_pcap_bytes

CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
ALLOWED_EXTENSIONS = {".pcap", ".pcapng"}

# Aplicatia FastAPI
app = FastAPI(title="Network Traffic Music Composer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/api/health") # Verifica daca serverul este pornit
async def health():
    return {"status": "ok"}

@app.post("/api/captures", response_model=CaptureResponse) # Primeste un fisier PCAP/PCAPNG, il parseaza si returneaza toate pachetele cu metadatele necesare pentru sonificare
async def upload_capture(file: UploadFile = File(...)):
    _, ext = os.path.splitext(file.filename or "")  # Verificam extensia fisierului
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Extensie neacceptata: '{ext}'. Permise: {sorted(ALLOWED_EXTENSIONS)}")

    data = await file.read()

    if len(data) == 0:
        raise HTTPException(400, "Fisierul este gol.")

    # Parsarea PCAP ruleaza intr-un thread separat ca sa nu blocheze serverul
    try:
        result = await asyncio.to_thread(
            parse_pcap_bytes, data, file.filename or "capture.pcap"
        )
    except ValueError as exc:
        raise HTTPException(422, f"PCAP invalid: {exc}") from exc

    return result
