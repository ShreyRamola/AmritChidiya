import sqlite3
import hashlib
import json
import os
import time
from typing import Optional, Dict, List, Any
from dotenv import load_dotenv

load_dotenv(override=True)

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None

DB_PATH = os.path.join(os.path.dirname(__file__), "amrit_chidiya.db")

# ── Supabase Setup with SQLite Fallback ──────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")


supabase_client: Optional[Any] = None
if SUPABASE_URL and SUPABASE_KEY and create_client:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected to Supabase Cloud Database successfully!")
    except Exception as sb_err:
        print("Supabase initialization notice (using SQLite fallback):", sb_err)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at REAL NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chats (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                date TEXT NOT NULL,
                language TEXT NOT NULL,
                messages_json TEXT NOT NULL,
                schemes_json TEXT NOT NULL,
                updated_at REAL NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)
        conn.commit()

init_db()

def _hash_password(password: str) -> str:
    return hashlib.sha256(password.strip().encode('utf-8')).hexdigest()

def create_user(email: str, name: str, password: str) -> Dict[str, Any]:
    clean_email = email.strip().lower()
    clean_name = name.strip() or clean_email.split('@')[0]
    pwd_hash = _hash_password(password)
    user_id = f"user_{int(time.time()*1000)}_{os.urandom(3).hex()}"
    
    if supabase_client:
        try:
            res = supabase_client.table("users").select("id").eq("email", clean_email).execute()
            if res.data and len(res.data) > 0:
                raise ValueError("An account with this email already exists.")
            
            user_payload = {
                "id": user_id,
                "email": clean_email,
                "name": clean_name,
                "password_hash": pwd_hash,
                "created_at": time.time()
            }
            supabase_client.table("users").insert(user_payload).execute()
            return {"id": user_id, "email": clean_email, "name": clean_name}
        except ValueError as ve:
            raise ve
        except Exception as sb_err:
            print("Supabase create_user notice, using SQLite fallback:", sb_err)

    # SQLite Fallback
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (clean_email,))
        if cursor.fetchone():
            raise ValueError("An account with this email already exists.")
            
        cursor.execute(
            "INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, clean_email, clean_name, pwd_hash, time.time())
        )
        conn.commit()
        
    return {"id": user_id, "email": clean_email, "name": clean_name}

def authenticate_user(email: str, password: str) -> Dict[str, Any]:
    clean_email = email.strip().lower()
    pwd_hash = _hash_password(password)
    
    if supabase_client:
        try:
            res = supabase_client.table("users").select("id, email, name, password_hash").eq("email", clean_email).execute()
            if not res.data or res.data[0]["password_hash"] != pwd_hash:
                raise ValueError("Invalid email or password.")
            row = res.data[0]
            return {"id": row["id"], "email": row["email"], "name": row["name"]}
        except ValueError as ve:
            raise ve
        except Exception as sb_err:
            print("Supabase auth notice, using SQLite fallback:", sb_err)

    # SQLite Fallback
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, email, name, password_hash FROM users WHERE email = ?",
            (clean_email,)
        )
        row = cursor.fetchone()
        if not row or row["password_hash"] != pwd_hash:
            raise ValueError("Invalid email or password.")
            
        return {"id": row["id"], "email": row["email"], "name": row["name"]}

def get_user_chats(user_id: str) -> List[Dict[str, Any]]:
    if supabase_client:
        try:
            res = supabase_client.table("chats").select("*").eq("user_id", user_id).order("updated_at", desc=True).execute()
            result = []
            for r in res.data or []:
                try:
                    msgs = json.loads(r["messages_json"]) if isinstance(r["messages_json"], str) else r["messages_json"]
                    schemes = json.loads(r["schemes_json"]) if isinstance(r["schemes_json"], str) else r["schemes_json"]
                    result.append({
                        "id": r["id"],
                        "title": r["title"],
                        "date": r["date"],
                        "language": r["language"],
                        "messages": msgs,
                        "schemes": schemes,
                        "updatedAt": r["updated_at"]
                    })
                except Exception as e:
                    print("Error parsing chat json from Supabase:", e)
            return result
        except Exception as sb_err:
            print("Supabase get_user_chats notice, using SQLite fallback:", sb_err)

    # SQLite Fallback
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, title, date, language, messages_json, schemes_json, updated_at FROM chats WHERE user_id = ? ORDER BY updated_at DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        
        result = []
        for r in rows:
            try:
                msgs = json.loads(r["messages_json"])
                schemes = json.loads(r["schemes_json"])
                result.append({
                    "id": r["id"],
                    "title": r["title"],
                    "date": r["date"],
                    "language": r["language"],
                    "messages": msgs,
                    "schemes": schemes,
                    "updatedAt": r["updated_at"]
                })
            except Exception as e:
                print("Error parsing chat json:", e)
        return result

def save_user_chat(user_id: str, chat_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    chat_id = chat_data.get("id") or f"chat_{int(time.time()*1000)}"
    title = chat_data.get("title") or "New Chat"
    date_str = chat_data.get("date") or "Today"
    language = chat_data.get("language") or "English"
    messages_json = json.dumps(chat_data.get("messages", []))
    schemes_json = json.dumps(chat_data.get("schemes", []))
    updated_at = chat_data.get("updatedAt") or time.time()
    
    if supabase_client:
        try:
            payload = {
                "id": chat_id,
                "user_id": user_id,
                "title": title,
                "date": date_str,
                "language": language,
                "messages_json": messages_json,
                "schemes_json": schemes_json,
                "updated_at": updated_at
            }
            supabase_client.table("chats").upsert(payload).execute()
            return get_user_chats(user_id)
        except Exception as sb_err:
            print("Supabase save_user_chat notice, using SQLite fallback:", sb_err)

    # SQLite Fallback
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO chats (id, user_id, title, date, language, messages_json, schemes_json, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                title=excluded.title,
                date=excluded.date,
                language=excluded.language,
                messages_json=excluded.messages_json,
                schemes_json=excluded.schemes_json,
                updated_at=excluded.updated_at
        """, (chat_id, user_id, title, date_str, language, messages_json, schemes_json, updated_at))
        conn.commit()
        
    return get_user_chats(user_id)

def delete_user_chat(user_id: str, chat_id: str) -> List[Dict[str, Any]]:
    if supabase_client:
        try:
            supabase_client.table("chats").delete().eq("id", chat_id).eq("user_id", user_id).execute()
            return get_user_chats(user_id)
        except Exception as sb_err:
            print("Supabase delete_user_chat notice, using SQLite fallback:", sb_err)

    # SQLite Fallback
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chats WHERE id = ? AND user_id = ?", (chat_id, user_id))
        conn.commit()
    return get_user_chats(user_id)
