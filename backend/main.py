import os
import re
import tempfile
import edge_tts
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from dotenv import load_dotenv
from agents.chat_agent import chat_agent
from pydantic import BaseModel
from typing import List, Dict
from groq import Groq

load_dotenv(override=True)

app = FastAPI(
    title="AmritChidiya",
    description="Apni Sone Ki Chidiya Ko Phir Se Udaan Do",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client for transcription
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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

@app.get("/")
async def root():
    return {
        "message": "Namaste! 🙏 Main AmritChidiya hoon — aapki Sone Ki Chidiya ko phir se udaan dene ka saathi.",
        "status": "ready"
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        result = chat_agent.invoke({
            "messages": [{"role": m.role, "content": m.content} for m in request.messages],
            "user_context": request.user_context
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
async def transcribe(file: UploadFile = File(...), language: str = Form("Hindi")):
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
async def text_to_speech(request: TTSRequest):
    try:
        clean_text = clean_text_for_speech(request.text)
        if not clean_text:
            return Response(content=b"", media_type="audio/mpeg")

        voice = VOICE_MAPPING.get(request.language, "hi-IN-SwaraNeural")
        communicate = edge_tts.Communicate(clean_text, voice, rate="+18%", pitch="+0Hz")
        
        audio_data = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.extend(chunk["data"])
                
        return Response(content=bytes(audio_data), media_type="audio/mpeg")
    except Exception as e:
        print(f"TTS error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)