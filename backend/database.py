import sqlite3
import hashlib
import json
import os
import time
from typing import Optional, Dict, List, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "amrit_chidiya.db")

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
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chats WHERE id = ? AND user_id = ?", (chat_id, user_id))
        conn.commit()
    return get_user_chats(user_id)
