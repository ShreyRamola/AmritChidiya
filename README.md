# 🦅 AmritChidiya (अमृतचिड़िया)

> **"Apni Sone Ki Chidiya Ko Phir Se Udaan Do"** 🇮🇳  
> *A full-stack, AI-powered multilingual voice and chat welfare assistant connecting Indian citizens with verified government schemes, scholarships, and cyber safety tools.*

---

## 📚 Complete Project Documentation & Team Division

Detailed project guides are available in the repository:

- 📖 **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** — Full technical architecture guide, data flow, component hierarchy, security protocols, and installation guide.
- 👥 **[TEAM_ROLES_DIVISION.md](TEAM_ROLES_DIVISION.md)** — Complete 4-member role ownership matrix with individual technical deliverables and USPs.

---

## 🌟 4 Team Members & Individual USPs (Unique Selling Propositions)

Each team member spearheads a distinct technological pillar that powers AmritChidiya:

| Team Member | Engineering Role & Focus | Member USP (Unique Selling Proposition) |
|---|---|---|
| **Member 1** | **Frontend UI/UX & Citizen Access Lead** | **Phygital Last-Mile Bridge & Citizen CSC Dossier Generator**<br>Bridges the digital divide by generating physical, printable **CSC Scheme Dossiers** (`AC-CSC-XXXXXX`) with NPCI/DBT bank checklists & VLE operator sign-off boxes for village Jan Seva Kendras, coupled with a responsive Next.js 16 glassmorphism UI & live audio Talk Mode. |
| **Member 2** | **Backend API & Speech Processing Lead** | **Low-Latency Vernacular Audio Pipeline with Indian Accent DSP**<br>Engineered an end-to-end voice pipeline using Groq Whisper Large v3 with phonetic domain prompting for Indian vernacular speech, background silence/hallucination suppression, and high-fidelity Microsoft Edge-TTS neural streaming in 5 Indian languages. |
| **Member 3** | **AI Agent, Scheme Logic & Cyber Safety Lead** | **Anti-Hallucination Welfare Match Engine & Domain Cyber Shield**<br>Built the LangGraph dual-phase state machine ensuring 0% hallucinated welfare schemes, combined with the **Official Domain Shield & Scam Checker** that cryptographically verifies `.gov.in` / `.nic.in` URLs and shields citizens from WhatsApp fraud. |
| **Member 4** | **Database, Auth Security & DevOps Lead** | **Zero-Trust Hybrid Cloud Persistence with Bcrypt Salted Auth**<br>Architected an enterprise-grade dual database layer (Supabase Cloud PostgreSQL + auto SQLite failover replica), hardened by salted **Bcrypt (12 rounds)**, signed **24-hour JWT tokens**, SlowAPI rate limiting, and production cross-origin deployment. |

---

## ⚡ Core Feature Highlights

- 🌐 **Multilingual Conversational AI**: Native conversational support across **5 languages** (Hindi, Hinglish, English, Marathi, Tamil).
- 🎙️ **Hands-Free Talk Mode**: Full-duplex conversational voice mode powered by Groq Whisper Large v3 and Edge-TTS neural voices.
- 🧮 **Yojana Eligibility Calculator**: Interactive multi-criteria matrix dynamically evaluating State, Category, Income, and Profession to estimate annual financial benefits.
- 🛡️ **Cyber Shield & Fake Scheme Checker**: Instant link verification tool protecting citizens from fraudulent WhatsApp schemes by verifying `.gov.in` and `.nic.in` domains.
- 📄 **Printable CSC Dossier**: One-click printable PDF/dossier for village Common Service Centers (Jan Seva Kendra) with mandatory document checklists (Aadhaar, DBT/NPCI bank passbook).
- 🔗 **Direct Official Portal Links**: Verified links to official central and state portals (`scholarships.gov.in`, `scholarship.up.gov.in`, `pmkisan.gov.in`, `myscheme.gov.in`).
- 🔐 **Hardened Security & Privacy**: Bcrypt-salted password hashing, HS256 JWT authorization, SlowAPI rate-limiting, and security headers.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, ReactMarkdown
- **Backend**: FastAPI (Python 3.14), LangGraph, LangChain, Groq LLM (`qwen/qwen3.8-27b`)
- **Speech & Audio**: Groq Whisper Large v3 (STT), Microsoft Edge-TTS (Neural Voice Synthesis)
- **Database & Auth**: Supabase Cloud (PostgreSQL) + Local SQLite3 Fallback, Bcrypt, Python-JOSE (JWT)
- **Security & Infrastructure**: SlowAPI (Rate Limiting), Starlette Security Headers, CORS Origin Regex

---

## 🚀 Quick Start Guide

### 1. Backend Server
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*Backend runs on `http://127.0.0.1:8000`.*

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*
