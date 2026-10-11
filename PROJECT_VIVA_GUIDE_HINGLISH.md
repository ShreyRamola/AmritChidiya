# 🦅 AmritChidiya (अमृतचिड़िया) — Complete Project Viva & Architecture Guide (Hinglish Edition)

> **Tagline:** *"Apni Sone Ki Chidiya Ko Phir Se Udaan Do"* 🇮🇳  
> **Purpose:** Yeh document pure project ko aasan Hinglish mein explain karta hai taaki Viva, College Project Evaluation, ya External Examiner ke kisi bhi technical aur theoretical question ka aap confidence ke saath 100% accurate jawab de sakein.

---

## 📑 Table of Contents
1. [Project Ka Overview — Asli Problem Aur Hamara Solution](#1-project-ka-overview--asli-problem-aur-hamara-solution)
2. [Pure System Ka Architecture & Tech Stack (Saral Bhasha Mein)](#2-pure-system-ka-architecture--tech-stack-saral-bhasha-mein)
3. [Citizen Journey — User Ka Step-by-Step Experience](#3-citizen-journey--user-ka-step-by-step-experience)
4. [AmritChidiya Kya Data Leta Hai? (Data Privacy & Storage)](#4-amritchidiya-kya-data-leta-hai-data-privacy--storage)
5. [Government Data & Authorization Ka Sach (Teacher Ka Favorite Question)](#5-government-data--authorization-ka-sach-teacher-ka-favorite-question)
6. [4 Team Members Ke Roles & Individual USPs](#6-4-team-members-ke-roles--individual-usps)
7. [7-Layer Enterprise Security Architecture](#7-7-layer-enterprise-security-architecture)
8. [Mega Viva Q&A — Top 25 Questions Jo Teacher Puch Sakte Hain (With Model Answers)](#8-mega-viva-qa--top-25-questions-jo-teacher-puch-sakte-hain-with-model-answers)
9. [Examiner Ke Saamne Live Demo Kaise Dikhayein](#9-examiner-ke-saamne-live-demo-kaise-dikhayein)

---

## 1. Project Ka Overview — Asli Problem Aur Hamara Solution

### ❓ Asli Ground Reality Problem Kya Hai?
Har saal Bharat Sarkar aur State Governments lakho crore rupaye welfare schemes (chhatravritti, kisan samman nidhi, vishwakarma yojana, swasthya bima) ke liye budget mein nikalte hain. Lekin gaon aur chhote shahron ke karodo aam nagrik tak yeh labh nahi pahunch pata. Kyu?
1. **Bhasha Ki Deewar (Language Barrier):** Sarkari portals kathin English ya formal official Hindi mein hote hain. Ek aam kisan ya regional student jo Marathi, Tamil ya everyday Hinglish bolta hai, use samajh hi nahi aata ki apply kaise karein.
2. **Eligibility Ki Jaankari Ka Abhav:** Logo ko pata hi nahi hota ki unke parivar ki aamdani, category ya padhai ke hisaab se wo kaunsi yojana ke liye eligible hain.
3. **CSC Center Par Rejection:** Gaon wale Jan Seva Kendra (CSC) jaate hain, lekin unke paas zaroori documents ki list nahi hoti ya bank account NPCI/DBT se link nahi hota, jisse unka form baar-baar reject ho jata hai.
4. **WhatsApp & Online Fraud:** Fake websites aur WhatsApp messages aam logo ko "Sarkari Yojana Registration Fee ke naam par ₹500 bhejo" bolkar loot lete hain.

### 💡 AmritChidiya Ka Solution Kya Hai?
AmritChidiya ek **Multilingual Voice & Chat Welfare Assistant** hai:
- Nagrik apni bhasha (Hindi, Hinglish, Marathi, Tamil, English) mein **bolkar (voice)** ya **likhkar (chat)** baat kar sakta hai.
- Yeh sirf 4 baatein poochta hai: **State, Family Income, Category (General/OBC/SC/ST), aur Profession/Education**.
- AI turant matching schemes calculate karke annual cash benefit batata hai.
- **Phygital CSC Dossier:** Ek click mein printable slip (`AC-CSC-XXXXXX`) nikal kar deta hai jisme required documents ki checklist hoti hai, jise nagrik CSC kiosk par dikha sakta hai.
- **ScamShield:** WhatsApp par aane wale links ko check karke batata hai ki wo asli `.gov.in` domain hai ya fake phishing scam.

---

## 2. Pure System Ka Architecture & Tech Stack (Saral Bhasha Mein)

AmritChidiya ka pura system 5 main hisso mein bata hua hai:

```
[ Frontend: Next.js 16 + React 19 ]
         │ (HTTP REST / Audio Upload)
         ▼
[ Backend: FastAPI (Python 3.14) ] ── (Security: SlowAPI Rate Limit + SecurityHeaders)
         ├──> [ STT Engine: Groq Whisper Large v3 ] (Sub-500ms Audio to Text)
         ├──> [ AI Brain: LangGraph + Groq Qwen 2.5 ] (Eligibility Reasoning)
         ├──> [ TTS Engine: Microsoft Edge-TTS ] (Human-like Voice Response)
         └──> [ Database: Supabase PostgreSQL (Cloud) + SQLite (Offline Fallback) ]
```

### Tech Stack Details:
| Component | Technology | Kyu Use Kiya? (Reason) |
|---|---|---|
| **Frontend** | **Next.js 16 (App Router) + React 19 + Tailwind CSS** | Server-side rendering, ultra-smooth responsive glassmorphism UI, mobile-first design. |
| **Backend API** | **FastAPI (Python 3.14)** | Asynchronous high performance, automatic OpenAPI documentation, Pydantic data validation. |
| **Speech-to-Text (STT)** | **Groq Whisper Large v3** | Sub-500ms latency, Indian English/Hindi regional accent ko bina translate kiye phonetically pehchanta hai. |
| **Text-to-Speech (TTS)** | **Microsoft Edge-TTS** | 5 Indian languages mein natural human neural voice streaming (`hi-IN-SwaraNeural`, `ta-IN-PallaviNeural`, etc.). |
| **AI Agent Logic** | **LangGraph + ChatGroq (Qwen 2.5)** | StateGraph machine jo fake schemes hallucinate hone se rokti hai aur structured responses enforce karti hai. |
| **Database** | **Supabase PostgreSQL + SQLite Failover** | Cloud sync via PostgREST + internet jane par bina crash hue local SQLite replica par auto-fallback. |
| **Security & Auth** | **Bcrypt (12 Rounds) + Python-JOSE (JWT)** | Bank-grade salted password hashing aur 24-ghante ke signed tokens with IDOR ownership validation. |

---

## 3. Citizen Journey — User Ka Step-by-Step Experience

Ek naya user aane par system kaise execute hota hai:

1. **Step 1 — Bhasha Chuno:** User landing page par aata hai aur Hindi, Hinglish, Marathi, Tamil ya English select karta hai. Pure UI labels aur AI voice turant us bhasha mein switch ho jaate hain.
2. **Step 2 — Talk Mode (Hands-free Voice):** User microphone button click karke bolta hai: *"Main Uttarakhand se hoon, OBC category, B.Tech student hoon, parivar ki aamdani 2 lakh hai, kya mujhe scholarship mil sakti hai?"*
3. **Step 3 — Speech Pipeline:** Browser audio blob record karke FastAPI ke `/transcribe` endpoint par bhejta hai. Groq Whisper sub-500ms mein text convert karta hai aur temporary audio file turant server se delete ho jaati hai.
4. **Step 4 — AI Eligibility Reasoning:** LangGraph agent user ke 4 inputs check karta hai aur match calculate karta hai (e.g. *Post Matric Scholarship for OBC Students*).
5. **Step 5 — Scheme Cards & Official Links:** AI jawab deta hai aur sath mein verified official portal ka link (`https://scholarships.gov.in`) provide karta hai.
6. **Step 6 — Phygital CSC Dossier:** User "Download CSC Dossier" click karta hai. Ek formal printable slip generate hoti hai jisme application tracking ID, eligible scheme details aur physical verification checklist (Aadhaar copy, NPCI bank passbook) aati hai.

---

## 4. AmritChidiya Kya Data Leta Hai? (Data Privacy & Storage)

Jab teacher pooche: *"Tumhara project user se kya data leta hai aur kahan store karta hai?"*

### ✅ Data Jo Hum Lete Hain:
1. **User Account Info (Database mein store hota hai):**
   - **Email:** Account identification ke liye (RFC regex se validate hota hai).
   - **Name:** User ka display name.
   - **Password:** **KABHI BHI PLAIN TEXT MEIN STORE NAHI HOTA!** 12-round salted Bcrypt se encrypt hota hai (`salt:hash`).
2. **Eligibility Criteria (Session Context):**
   - **State / UT** (e.g., Uttarakhand, UP, Maharashtra).
   - **Category** (General, OBC, SC, ST, EWS).
   - **Family Annual Income Bracket** (e.g., < ₹1.5 Lakh, ₹2.5 Lakh).
   - **Profession / Education** (e.g., Student, Farmer, Artisan, Street Vendor).
3. **Voice Audio (Ephemeral — Server par store NAHI hota):**
   - Microphone ka WebM audio chunk temporary RAM/OS file mein banta hai, Whisper transcribe karta hai aur `finally` block mein **`os.unlink()` se turant permanently delete ho jata hai**.

### 🚫 Data Jo Hum BILKUL NAHI Lete (Privacy & Safety):
- **NO Aadhaar Number:** Hum kabhi bhi 12-digit Aadhaar number input nahi lete.
- **NO Biometrics:** Fingerprint ya Iris scan ka koi lena-dena nahi hai.
- **NO Bank Account / PIN / OTP:** Hum koi banking credentials nahi mangte.
- *Kyu?* Kyunki AmritChidiya **Pre-Counseling & Preparation Tool** hai. Sensitive KYC aur Biometric verification government ke official portal par ya CSC center par offline hota hai.

---

## 5. Government Data & Authorization Ka Sach (Teacher Ka Favorite Question)

Yeh do questions har examiner poochta hai:

### Q1: "Kya tumhe government se koi permission ya authorization leni padi?"
**Jawab:**
> *"Nahi Sir/Ma'am! Government authorization tab chahiye hoti hai jab aap direct citizen ke bank account mein paisa bhejo ya unki taraf se official form submit karo.*  
> *AmritChidiya ek **Discovery, Calculator aur Docket Preparation Engine** hai (jaise ClearTax tax calculate karne ke liye hota hai).*  
> *Sarkari yojanaon ke niyam, eligibility criteria aur portal links **Public Information** hain jo Right to Information (RTI) Act aur National Data Sharing Policy ke tehat openly available hain. Final form submission citizen official `.gov.in` portal par ya licensed CSC VLE center par hi karta hai."*

### Q2: "Tumne koi government data feed nahi kiya, toh AI ko kaise pata?"
**Jawab:**
> *"Sir/Ma'am, iske piche 3 mechanisms hain:*  
> 1. * **LLM Pre-Trained Knowledge:** Groq par chalne wala Qwen model public internet par pre-trained hai, jisme Bharat Sarkar ke gazettes, PIB press releases aur scholarship rules already shamil hain.*  
> 2. * **SCHEME_URL_MAP Directory in Code:** Hamare Python backend (`chat_agent.py`) mein 20+ top national schemes ke official `.gov.in` links mapped hain.*  
> 3. * **Dynamic Fallback to MyScheme.gov.in:** Agar koi naya ya state-specific scheme match hota hai, toh hamara code automatically National Portal (`https://www.myscheme.gov.in/search?q=...`) ka live search link create kar deta hai, jisse citizen hamesha real portal par pahunche."*

### Q3: "Agar aaj subah koi nayi scheme launch hui, toh kya AI ko pata chalegi?"
**Jawab:**
> *"Nahi Sir/Ma'am, automatically nahi chalegi kyunki foundation models ka ek **Knowledge Cutoff Date** hota hai. Model ke weights mein aaj subah ki khabar nahi hoti.*  
> *Lekin agar citizen us nayi scheme ka naam batayega, toh hamara dynamic fallback code turant use **MyScheme.gov.in** ke live search page par redirect karega.*  
> *Is problem ko permanently solve karne ke liye hamare Phase 2 roadmap mein **RAG (Retrieval-Augmented Generation)** hai, jisme PIB ka daily RSS feed Supabase ke pgvector database mein ingest hoga."*

---

## 6. 4 Team Members Ke Roles & Individual USPs

| Member | Title | Member Ka USP (Interview Mein Bolne Ke Liye) | Handled Files |
|---|---|---|---|
| **Member 1** | **Frontend UI/UX & Citizen Access Lead** | **"Phygital Last-Mile Bridge & Citizen CSC Dossier Generator"**<br>Gaon ke Jan Seva Kendra ke liye printable A4 format dossier (`AC-CSC-XXXXXX`) design kiya with document verification checklist + 5 bhashaon ka responsive UI. | `frontend/app/page.tsx`<br>`frontend/components/CscDossierModal.tsx`<br>`frontend/components/EligibilityCalculatorModal.tsx`<br>`frontend/app/globals.css` |
| **Member 2** | **Backend API & Speech Processing Lead** | **"Low-Latency Vernacular Audio Pipeline with Indian Accent DSP"**<br>Groq Whisper Large v3 ke sath regional vocabulary prompting, silence hallucination cleaning aur Edge-TTS streaming in 5 Indian languages banaya. | `backend/main.py`<br>`backend/requirements.txt` |
| **Member 3** | **AI Agent, Scheme Logic & Cyber Safety Lead** | **"Anti-Hallucination Welfare Match Engine & Domain Cyber Shield"**<br>LangGraph state machine banayi jo fake schemes block karti hai, plus ScamShield modal banaya jo WhatsApp scam links detect karke 1930 Cyber Helpline se jodta hai. | `backend/agents/chat_agent.py`<br>`backend/prompts/system_prompt.py`<br>`frontend/components/ScamShieldModal.tsx` |
| **Member 4** | **Database, Auth Security & DevOps Lead** | **"Zero-Trust Hybrid Cloud Persistence with 12-Round Bcrypt & IDOR Defense"**<br>Supabase PostgreSQL + SQLite auto-failover architect kiya, 12-round Bcrypt salting with legacy SHA-256 auto-migration, 24-hr JWT tokens, aur cross-cloud CORS deployment manage kiya. | `backend/database.py`<br>`backend/supabase_schema.sql`<br>`frontend/lib/auth.ts`<br>Production Deployment (Render + Vercel) |

---

## 7. 7-Layer Enterprise Security Architecture

| Security Layer | Code Implementation | Threat / Attack Jo Ruka |
|---|---|---|
| **1. Password Hashing** | `bcrypt.hashpw(pwd, bcrypt.gensalt(12))` with auto-migration from legacy SHA-256 | Rainbow tables, GPU brute-force cracking, database leaks. |
| **2. Session & IDOR Access** | 24-hr HS256 JWT tokens + strict user ID checks on `/chats/{user_id}` (`403 Forbidden`) | Insecure Direct Object Reference, cross-user snooping. |
| **3. HTTP Security Headers** | `SecurityHeadersMiddleware` (nosniff, DENY clickjacking, XSS filter, strict referrer) | MIME sniffing, framing attacks, clickjacking, XSS. |
| **4. DoS & Abuse Throttling** | SlowAPI IP rate limiting (`/signup` 5/min, `/login` 10/min, `/chat` 30/min, STT 20/min) | Bot registration spam, brute force attacks, LLM API budget drain. |
| **5. Voice Data Privacy** | `NamedTemporaryFile` + `os.unlink()` cleanup in `finally` block; gitignored SQLite DB | Persistent citizen voice storage on disk, GitHub database leaks. |
| **6. AI Anti-Hallucination** | `SCHEME_URL_MAP` + `myscheme.gov.in` fallback; Whisper silence hallucination blacklist | Fake schemes, phishing links, ghost queries on ambient silence. |
| **7. Anti-Fraud ScamShield** | `ScamShieldModal.tsx` (.gov.in vs .xyz checker + 1930 Cyber Helpline + disclaimers) | WhatsApp advance fee scams, Aadhaar OTP phishing. |

---

## 8. Mega Viva Q&A — Top 25 Questions Jo Teacher Puch Sakte Hain

### 🔹 Basic & Concept Questions
#### Q1: AmritChidiya ka main purpose kya hai?
**Answer:** Bharat ke aam nagriko ko unki apni bhasha mein (voice aur text ke through) sahi sarkari yojanaon ki jaankari dena, document checklist ka printable CSC Dossier banana, aur online fraud se bachana.

#### Q2: Is project ka naam "AmritChidiya" kyu rakha?
**Answer:** Bharat ko pehle "Sone Ki Chidiya" kaha jata tha. "AmritKaal" mein har aam nagrik tak unka kalyankari adhikar pahunchakar unki sapno ki chidiya ko phir se udaan dena hamara mission hai.

#### Q3: Dusre chatbots (ChatGPT) se yeh alag kaise hai?
**Answer:** ChatGPT generic answers deta hai aur aksar fake links ya outdated schemes hallucinate karta hai. AmritChidiya ek focused LangGraph pipeline use karta hai jo strict 4 eligibility criteria check karta hai, verified `.gov.in` links deta hai, aur gaon ke Common Service Center ke liye printable A4 dossier receipt deta hai.

---

### 🔹 AI & Speech Processing Questions
#### Q4: Whisper Speech-to-Text mein Groq kyu choose kiya, OpenAI ka direct API kyu nahi?
**Answer:** Groq specialized LPU (Language Processing Unit) chips par chalta hai, jo sub-500ms latency deta hai. OpenAI ke standard cloud API mein 3 se 5 second lagte the, jisse conversational voice experience kharab hota tha.

#### Q5: Whisper silence hallucination kya hota hai?
**Answer:** Jab microphone on hota hai aur user kuch nahi bolta (room noise/silence), toh Whisper kabhi-kabhi *"Thank you for watching"*, *"Subtitles by"*, ya *"Dhanyawad"* predict kar deta hai. Hamne code mein ek blacklist filter banaya hai jo aise phrases ko automatically discard karta hai.

#### Q6: Regional accents aur Hinglish ko Whisper kaise samajhta hai?
**Answer:** Hamne `/transcribe` endpoint par ek custom `prompt` parameter supply kiya hai jisme Indian states, education levels, aur categories ke keywords hain. Isse Whisper Indian English aur Hinglish ko bina English mein translate kiye verbatim phonetically accurately transcribe karta hai.

#### Q7: TTS (Text-to-Speech) mein markdown text ka kya karte ho?
**Answer:** Hamara custom function `clean_text_for_speech()` regular expressions se asterisks (`**`), hashtags (`###`), URLs aur emojis strip karta hai, taaki Microsoft Edge-TTS natural insani bhasha ki tarah bole.

---

### 🔹 Database, Backend & Security Questions
#### Q8: Bcrypt hashing SHA-256 se better kyu hai?
**Answer:** SHA-256 bahut fast algorithm hai, jisse modern GPU clusters har second arbon guesses test karke brute-force kar sakte hain. Bcrypt deliberately slow hai aur isme 12 rounds ka work-factor aur unique salt hota hai, jisse brute-force aur rainbow table attacks namumkin ho jate hain.

#### Q9: Legacy users ke liye SHA-256 se Bcrypt migration kaise hota hai?
**Answer:** `backend/database.py` mein `_verify_password()` check karta hai ki agar purana hash 64-character ka plain hex hai, toh verify karne ke baad `_needs_rehash()` trigger hota hai aur login ke dauran hi password ko naye 12-round Bcrypt hash mein upgrade kar deta hai bina user ko pareshan kiye.

#### Q10: IDOR (Insecure Direct Object Reference) kya hota hai aur tumne kaise roka?
**Answer:** Agar user URL mein `/chats/user_1` ko badal kar `/chats/user_2` kar de aur dusre ka chat padh le, use IDOR bolte hain. Hamne FastAPI ke dependency injection mein JWT token decode karke check kiya: `if current_user["id"] != user_id: raise HTTPException(403, "Forbidden")`.

#### Q11: Dual-Database architecture kyu banayi?
**Answer:** Primary database **Supabase Cloud PostgreSQL** hai taaki user kisi bhi mobile/laptop se apne chats access kar sake. Lekin agar gaon mein internet band ho jaye ya network timeout ho, toh `database.py` bina server crash kiye automatically local **SQLite3 replica** par fallback kar leta hai.

#### Q12: SQLite database ko GitHub par push kyu nahi kiya?
**Answer:** Kyunki SQLite database file (`amrit_chidiya.db`) mein testing ke dauran bane users ke emails, password hashes aur chat history hoti hai. Ise public GitHub repo par leak hone se bachane ke liye hamne ise git cache se remove karke `.gitignore` mein add kiya hai.

#### Q13: SlowAPI Rate Limiting ka kya faayda hai?
**Answer:** Yeh bot attacks aur credential stuffing ko rokta hai:
- `/signup`: 5 requests per minute
- `/login`: 10 requests per minute
- `/chat`: 30 requests per minute
- `/transcribe`: 20 requests per minute

#### Q14: CORS error kya hoti hai aur tumne production mein kaise solve kiya?
**Answer:** Jab Vercel par hosted frontend (`https://amrit-chidiya.vercel.app`) Render par hosted backend se baat karta hai, toh browser cross-origin policy block kar sakta hai. Hamne FastAPI mein `CORSMiddleware` configure kiya with explicit allowed origins aur regex `^https://.*\.vercel\.app$`.

---

### 🔹 UI & Frontend Questions
#### Q15: 'Phygital' ka kya matlab hai?
**Answer:** Physical + Digital. Bharat ke gaon mein digital divide hai — har kisi ke paas printer ya smartphone nahi hai. Hamara system online calculate karta hai (Digital) aur ek printable physical receipt deta hai (Physical) jise le jaakar citizen local Jan Seva Kendra par submit kar sakta hai.

#### Q16: CSC Dossier receipt mein kya kya details hoti hain?
**Answer:** Unique Docket ID (`AC-CSC-XXXXXX`), Citizen Profile (State, Income, Category), Eligible Scheme Names with annual financial benefits, Mandatory Document Checklist (Aadhaar copy, Income certificate, NPCI-linked Bank passbook), aur CSC VLE operator ke sign & stamp ke verification boxes.

#### Q16.1: Citizen ko nazdeeki CSC / Jan Seva Kendra ka pata kaise chalega?
**Answer:** `CscDossierModal.tsx` mein humne **"📍 Locate Nearest CSC"** ka direct function banaya hai. Yeh browser ke live GPS Geolocation (`navigator.geolocation`) se citizen ke paas ke sabhi Jan Seva Kendras ko Google Maps par ek click mein open karta hai (`Common Service Center near me`), sath hi Bharat Sarkar ke official portal **`locator.csccloud.in`** (5,00,000+ kendra directory) ka direct link deta hai.

#### Q17: Print styling ke liye Next.js mein kya kiya?
**Answer:** `CscDossierModal.tsx` mein CSS `@media print` rules likhe hain jo print dialog khulte hi dark-mode website ke sidebars, chat input aur buttons ko hide kar dete hain aur pure dossier ko clean black-and-white A4 paper format mein convert kar dete hain.

#### Q18: ScamShield Modal kaise fake link pakadta hai?
**Answer:** Bharat sarkar aur state governments ke sabhi official portals strictly `.gov.in` ya `.nic.in` par end hote hain. Agar koi link `.xyz`, `.top`, `.online` ya kisi private domain par ja raha hai aur form fee maang raha hai, toh ScamShield use High-Risk Scam flag karta hai aur National Cyber Crime Helpline (1930) call karne ki salah deta hai.

---

### 🔹 Future Scope & Advanced Questions
#### Q19: Future Scope / Phase 2 roadmap kya hai?
**Answer:**
1. **RAG Pipeline:** Press Information Bureau (PIB) aur MyScheme ke live RSS feed ko daily Supabase pgvector mein sync karna.
2. **API Setu & DigiLocker MoU:** Digital India ke API Setu ke sath integrate karke direct biometric e-KYC aur DigiLocker verified document pull support karna.
3. **WhatsApp / IVR Bot:** Audio call aur WhatsApp business bot integration taaki bina internet wale basic feature phone users bhi call karke scheme jaan sakein.

#### Q20: Agar examiner code structure pooche toh folder structure kaise explain karoge?
**Answer:**
- `frontend/`: Next.js 16 app with `app/page.tsx`, modal components (`CscDossierModal.tsx`, `EligibilityCalculatorModal.tsx`, `ScamShieldModal.tsx`), and auth client (`lib/auth.ts`).
- `backend/`: FastAPI application (`main.py`), database layer (`database.py`), LangGraph AI agent (`agents/chat_agent.py`), and system prompts (`prompts/system_prompt.py`).
- Root: Production documentation, team roles matrix, and quickstart guides.

---

## 9. Examiner Ke Saamne Live Demo Kaise Dikhayein

Agar teacher bole: *"2 minute mein chala kar dikhao"*, yeh sequence follow karein:

1. **Step 1:** Browser mein app kholein (`http://localhost:3000` ya `https://amrit-chidiya.vercel.app`).
2. **Step 2:** Hindi ya Hinglish bhasha select karein.
3. **Step 3 (The Wow Factor):** Header mein **"Yojana Calculator"** button dabayein. Dropdown se select karein:
   - State: *Uttarakhand*
   - Category: *OBC*
   - Annual Income: *₹1.5 - ₹2.5 Lakh*
   - Profession: *Student (10th / 12th / College)*
   - Dikhayein ki screen par turant calculate hota hai: **Matching Schemes + ₹30,000–₹55,000/year benefit!**
4. **Step 4:** *"Get Step-by-Step Guide →"* click karein. Dikhayein ki kaise context chat mein automatic transfer ho gaya bina retype kiye!
5. **Step 5:** **"CSC Dossier"** button dabayein aur dikhayein formal printed receipt with docket number `AC-CSC-XXXXXX` aur A4 print preview.
6. **Step 6:** **"Scam Shield"** button dabayein aur dikhayein ki kaise link verify hoti hai aur 1930 National Helpline direct linked hai.
7. **Step 7:** Microphone on karke ek vernacular voice query poochein aur Edge-TTS ka audio play karke sunayein.

**Verdit:** Is live flow ko dekhkar koi bhi teacher impress ho jayega kyunki isme Frontend, Backend, AI Reasoning, Security, Voice Pipeline aur Social Impact sab ek sath live chalta dikhta hai!
