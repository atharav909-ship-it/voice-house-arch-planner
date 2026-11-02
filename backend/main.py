import os
from pathlib import Path
from typing import Optional, Dict, Any, List
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.layout_engine import generate_architectural_layout

# Load .env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

app = FastAPI(
    title="Voice-Driven Architectural House Layout Planner",
    description="Bioclimatic layout planner powered by Sarvam AI (Saaras STT & Sarvam 105B LLM)",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LayoutRequest(BaseModel):
    transcript: Optional[str] = ""
    city: Optional[str] = None
    plot_dimensions: Optional[str] = None
    plot_facing: Optional[str] = None
    floors: Optional[str] = None
    budget_tier: Optional[str] = None
    custom_fixtures: Optional[List[str]] = None

@app.get("/api/health")
def health_check():
    api_key = os.getenv("SARVAM_API_KEY")
    return {
        "status": "healthy",
        "sarvam_api_key_configured": bool(api_key and len(api_key.strip()) > 5),
        "service": "Voice-Driven Architectural House Layout Planner"
    }

@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Accepts an uploaded audio file (audio/webm, audio/wav, audio/mp3)
    and forwards it to Sarvam AI speech-to-text endpoint (saaras:v4).
    """
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SARVAM_API_KEY is not configured in backend environment."
        )

    try:
        audio_bytes = await file.read()
        if not audio_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded audio file is empty."
            )

        # Clean and sanitize MIME type and filename (strip codec parameters like ;codecs=opus)
        raw_content_type = (file.content_type or "audio/webm").split(";")[0].strip().lower()
        if "webm" in raw_content_type:
            clean_content_type = "audio/webm"
            filename = "recording.webm"
        elif "wav" in raw_content_type:
            clean_content_type = "audio/wav"
            filename = "recording.wav"
        elif "mp3" in raw_content_type or "mpeg" in raw_content_type:
            clean_content_type = "audio/mp3"
            filename = "recording.mp3"
        elif "mp4" in raw_content_type or "m4a" in raw_content_type:
            clean_content_type = "audio/mp4"
            filename = "recording.mp4"
        else:
            clean_content_type = "audio/webm"
            filename = "recording.webm"

        # Sarvam STT REST endpoint
        url = "https://api.sarvam.ai/speech-to-text"
        headers = {
            "api-subscription-key": api_key.strip()
        }
        data = {
            "model": "saaras:v4",
            "mode": "translate",
            "language_code": "unknown"
        }
        files = {
            "file": (filename, audio_bytes, clean_content_type)
        }

        response = requests.post(url, headers=headers, data=data, files=files, timeout=60)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Sarvam AI STT error: {response.text}"
            )

        resp_json = response.json()
        transcript = resp_json.get("transcript", "")

        return {
            "transcript": transcript,
            "language_code": resp_json.get("language_code"),
            "language_probability": resp_json.get("language_probability")
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to transcribe audio: {str(e)}"
        )

@app.post("/api/generate-layout")
async def generate_layout(payload: LayoutRequest):
    """
    Generates a complete architectural layout and bioclimatic passive strategy
    using Sarvam AI's sarvam-105b-conversations model.
    """
    try:
        overrides = {
            k: v for k, v in payload.dict().items()
            if v is not None and k != "transcript"
        }
        layout = generate_architectural_layout(
            transcript=payload.transcript or "",
            overrides=overrides
        )
        return layout
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Architectural engine error: {str(e)}"
        )

# Mount frontend directory for static serving
FRONTEND_DIR = BASE_DIR / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
