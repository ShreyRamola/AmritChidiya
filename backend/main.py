import os
import re
import tempfile
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
load_dotenv(override=True)

import edge_tts
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel, field_validator
from groq import Groq
from jose import jwt, JWTError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from agents.chat_agent import chat_agent
import database as db

# ── JWT Configuration ────────────────────────────────────────────────────────
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", os.urandom(32).hex())
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

def create_access_token(user_data: dict) -> str:
    """Create a signed JWT token with expiry."""
    payload = {
        "sub": user_data["id"],
        "email": user_data["email"],
        "name": user_data["name"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token. Please log in again.")

async def get_current_user(request: Request) -> dict:
    """FastAPI dependency to extract and validate the current user from JWT."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authentication token. Please log in.")
    
    token = auth_header.split("Bearer ")[1].strip()
    payload = verify_token(token)
    
    # Verify user still exists in database
    user = db.get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User account not found. Please sign up again.")
    
    return user

async def get_optional_current_user(request: Request) -> Optional[dict]:
    """Extract and validate user if Authorization header is present, else return None."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split("Bearer ")[1].strip()
    try:
        payload = verify_token(token)
        return db.get_user_by_id(payload.get("sub"))
    except Exception:
        return None


# ── Rate Limiter ─────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)


# ── Security Headers Middleware ──────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(self), geolocation=()"
        return response


# ── App Setup ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AmritChidiya",
    description="Apni Sone Ki Chidiya Ko Phir Se Udaan Do",
    version="1.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SecurityHeadersMiddleware)

# CORS — allow localhost and Vercel domains
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://amrit-chidiya.vercel.app",
]
env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins:
    ALLOWED_ORIGINS.extend([origin.strip() for origin in env_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client for transcription
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ── Request Models ───────────────────────────────────────────────────────────
class SignUpRequest(BaseModel):
    email: str
    name: str = ""
    password: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        v = v.strip().lower()
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError('Invalid email format')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v.strip()) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class LogInRequest(BaseModel):
    email: str
    password: str

class SaveChatPayload(BaseModel):
    id: Optional[str] = None
    title: str = "New Chat"
    date: str = "Today"
    language: str = "English"
    messages: List[Dict[str, Any]] = []
    schemes: List[Dict[str, Any]] = []
    updatedAt: Optional[float] = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    user_context: Dict = {}

class TTSRequest(BaseModel):
    text: str
    language: str = "Hindi"

VOICE_MAPPING = {
    "Hindi": "hi-IN-SwaraNeural",
    "Hinglish": "hi-IN-SwaraNeural",
    "English": "en-IN-NeerjaNeural",
    "Marathi": "mr-IN-AarohiNeural",
    "Tamil": "ta-IN-PallaviNeural",
}

def clean_text_for_speech(text: str) -> str:
    t = text
    t = re.sub(r'###\s*(?:\d+\.\s*)?', '', t)
    t = re.sub(r'\*\*|\*|#', '', t)
    t = re.sub(r'`{1,3}[\s\S]*?`{1,3}', '', t)
    t = re.sub(r'\|[^\n]*\|', '', t)
    t = re.sub(r'https?://\S+', '', t)
    t = re.sub(r'[\U00010000-\U0010ffff\u2600-\u26FF\u2700-\u27BF]', '', t)
    
    # Replace line breaks, colons, and bullet dashes with smooth sentence flow
    t = re.sub(r'\n+', '. ', t)
    t = re.sub(r':\s*', ', ', t)
    t = re.sub(r'[\-—–]\s*', ' ', t)
    t = re.sub(r'\.{2,}', '.', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


# ═══════════════════════════════════════════════════════════════════════════
# PUBLIC ENDPOINTS (no auth required)
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/")
async def root():
    return {
        "message": "Namaste! 🙏 Main AmritChidiya hoon — aapki Sone Ki Chidiya ko phir se udaan dene ka saathi.",
        "status": "ready",
        "security": "JWT authentication enabled"
    }

@app.post("/signup")
@limiter.limit("5/minute")
async def signup(request: Request, req: SignUpRequest):
    try:
        user = db.create_user(req.email, req.name, req.password)
        token = create_access_token(user)
        return {"user": user, "token": token, "message": "Account created successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, req: LogInRequest):
    try:
        user = db.authenticate_user(req.email, req.password)
        token = create_access_token(user)
        return {"user": user, "token": token, "message": "Logged in successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=401, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


# ═══════════════════════════════════════════════════════════════════════════
# PROTECTED ENDPOINTS (JWT required)
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/chats/{user_id}")
async def get_chats(user_id: str, current_user: dict = Depends(get_current_user)):
    # Ensure users can only access their own chats
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only access your own chats.")
    try:
        chats = db.get_user_chats(user_id)
        return {"chats": chats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chats/{user_id}")
async def save_chat(user_id: str, payload: SaveChatPayload, current_user: dict = Depends(get_current_user)):
    # Ensure users can only save to their own account
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only save chats to your own account.")
    try:
        updated_chats = db.save_user_chat(user_id, payload.dict())
        return {"chats": updated_chats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/chats/{user_id}/{chat_id}")
async def delete_chat(user_id: str, chat_id: str, current_user: dict = Depends(get_current_user)):
    # Ensure users can only delete their own chats
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own chats.")
    try:
        updated_chats = db.delete_user_chat(user_id, chat_id)
        return {"chats": updated_chats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
@limiter.limit("30/minute")
async def chat(
    request: Request,
    chat_req: ChatRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    try:
        result = chat_agent.invoke({
            "messages": [{"role": m.role, "content": m.content} for m in chat_req.messages],
            "user_context": chat_req.user_context
        })
        # Extract the last message content from LangGraph state
        last_msg = result["messages"][-1]
        content = last_msg.content if hasattr(last_msg, "content") else last_msg.get("content", "")
        
        schemes = []
        if hasattr(last_msg, "additional_kwargs"):
            schemes = last_msg.additional_kwargs.get("schemes", [])
        elif isinstance(last_msg, dict):
            schemes = last_msg.get("additional_kwargs", {}).get("schemes", [])
            
        return {"response": content, "schemes": schemes}
    except Exception as e:
        print(f"Chat endpoint error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transcribe")
@limiter.limit("20/minute")
async def transcribe(
    request: Request,
    file: UploadFile = File(...),
    language: str = Form("Hindi"),
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    try:
        suffix = os.path.splitext(file.filename)[1] if file.filename else ".webm"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
            content = await file.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name
        
        try:
            lang_map = {
                "Hindi": "hi",
                "Hinglish": None, # Auto-detect to transcribe Hinglish phonetically without auto-translating to English
                "Marathi": "mr",
                "Tamil": "ta",
                "English": "en"
            }
            whisper_lang = lang_map.get(language)

            prompt_text = (
                "Main Uttarakhand ka rehne wala hoon. Student, B.Tech, Class 12, 10th pass, Graduate. "
                "Annual income 2 lakh, 1.5 lakh, 50,000. General, OBC, SC, ST category. "
                "Uttarakhand, Uttar Pradesh, Maharashtra, Delhi, Bihar, Rajasthan, Madhya Pradesh, Punjab. "
                "Phonetic verbatim transcription of Indian speech in Hinglish and Hindi without translating to English."
            )

            with open(temp_audio_path, "rb") as audio_file:
                kwargs = {
                    "file": (os.path.basename(temp_audio_path), audio_file),
                    "model": "whisper-large-v3",
                    "prompt": prompt_text,
                    "temperature": 0.0,
                    "response_format": "json"
                }
                if whisper_lang:
                    kwargs["language"] = whisper_lang

                transcription = groq_client.audio.transcriptions.create(**kwargs)
            text = (transcription.text or "").strip()
            
            # Common Whisper hallucination strings on ambient silence/room noise
            hallucinations = {
                "thank you.", "thank you!", "thank you", "thanks for watching.", 
                "thank you for watching.", "subtitles by", "amara.org", 
                "bye.", "bye", "you", "so", "oh", "like and subscribe", 
                "thank you very much.", "dhanyawad.", "dhanyavaad.",
                "subtitles by the amara.org community", "subscribe"
            }
            
            clean_lower = text.lower().strip()
            if clean_lower in hallucinations or any(clean_lower.startswith(h) for h in ["subtitles by", "thank you for watching", "amara.org"]):
                text = ""
                
            return {"text": text}
        finally:
            if os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
                
    except Exception as e:
        print(f"Transcription error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tts")
@limiter.limit("30/minute")
async def text_to_speech(
    request: Request,
    tts_req: TTSRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    try:
        clean_text = clean_text_for_speech(tts_req.text)
        if not clean_text:
            return Response(content=b"", media_type="audio/mpeg")

        voice = VOICE_MAPPING.get(tts_req.language, "hi-IN-SwaraNeural")
        communicate = edge_tts.Communicate(clean_text, voice, rate="+18%", pitch="+0Hz")
        
        audio_data = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.extend(chunk["data"])
                
        return Response(content=bytes(audio_data), media_type="audio/mpeg")
    except Exception as e:
        print(f"TTS error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ── Token verification endpoint (for frontend to check token validity) ───
@app.get("/verify-token")
async def verify_token_endpoint(current_user: dict = Depends(get_current_user)):
    return {"valid": True, "user": current_user}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)