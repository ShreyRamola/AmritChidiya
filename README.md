# 🦅 AmritChidiya (अमृतचिड़िया)

> **"Apni Sone Ki Chidiya Ko Phir Se Udaan Do"** 🇮🇳

AmritChidiya is a full-stack, AI-powered voice and chat assistant that connects Indian citizens with government schemes, scholarships, and welfare benefits in **5 major Indian languages** (Hindi, Hinglish, English, Marathi, and Tamil).

---

## 📚 Complete Project Documentation & Team Division

Detailed project guides have been created in the main directory:

- 📖 **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** — Comprehensive architecture guide, core feature breakdown, step-by-step system execution flow, technology stack, and installation guide.
- 👥 **[TEAM_ROLES_DIVISION.md](TEAM_ROLES_DIVISION.md)** — Structured project breakdown divided across **4 team member roles** (Frontend UI/UX Lead, Backend API & Speech Lead, AI Agent & Scheme Logic Lead, DB/Auth & DevOps Lead).

---

## ⚡ Quick Feature Highlights

- 🌐 **Multilingual Conversational AI**: Native support for Hindi, Hinglish, English, Marathi, and Tamil.
- 🎙️ **Hands-Free Talk Mode**: Groq Whisper Large v3 speech recognition & Edge-TTS neural voice synthesis.
- 🎯 **Scheme Eligibility Matcher**: Matches user profile (age, state, income, caste category, marks) with 100% eligible government schemes.
- 🔗 **Hyperlinked Official Portals**: Scheme matches feature direct hyperlinks to official application sites (`scholarships.gov.in`, `scholarship.up.gov.in`, `pmkisan.gov.in`, `myscheme.gov.in`).
- 🚀 **Step-by-Step Registration Assistance**: Interactive 5-step registration breakdown with required document checklists.
- 🔐 **User Auth & Chat History**: SQLite database backed account creation and cross-device chat sync.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, ReactMarkdown
- **Backend**: FastAPI (Python), LangGraph, LangChain, Groq LLM (Qwen 3.8 27B / GPT-OSS)
- **Speech & Audio**: Groq Whisper Large v3 (STT), Edge-TTS (Neural Voice Synthesis)
- **Database**: SQLite3 (SHA-256 Auth & JSON Chat Turns Storage)

---

## 🚀 Quick Start Guide

### Backend Server
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
