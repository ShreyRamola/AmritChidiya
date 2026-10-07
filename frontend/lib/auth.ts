export interface User {
  id: string;
  email: string;
  name: string;
}

export interface SavedChat {
  id: string;
  title: string;
  date: string;
  language: string;
  messages: { role: string; content: string }[];
  schemes: { name: string; eligibility_match: string; apply_url?: string }[];
  updatedAt: number;
}

const SESSION_KEY = 'amrit_chidiya_user_session';
const TOKEN_KEY = 'amrit_chidiya_auth_token';
const CHATS_PREFIX = 'amrit_chidiya_chats_';

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Token Management ────────────────────────────────────────────────────────
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Build headers with JWT Authorization for protected API calls.
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Check if the stored token is expired (client-side check).
 * Returns true if token is missing or expired.
 */
export function isTokenExpired(): boolean {
  const token = getAuthToken();
  if (!token) return true;

  try {
    // Decode JWT payload (base64url) without verification — server does real verification
    const payloadB64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiry;
  } catch {
    return true;
  }
}


// ── User Session ────────────────────────────────────────────────────────────
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;

  // If token is expired, clear everything
  if (isTokenExpired()) {
    clearAuthToken();
    localStorage.removeItem(SESSION_KEY);
    return null;
  }

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Error reading session:", e);
    return null;
  }
}

export async function signUpAsync(email: string, name: string, pass: string): Promise<User> {
  const apiUrl = getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), name: name.trim(), password: pass })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Registration failed');
    }
    const user: User = data.user;
    const token: string = data.token;

    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      setAuthToken(token);
    }
    return user;
  } catch (err: any) {
    throw err;
  }
}

export async function loginAsync(email: string, pass: string): Promise<User> {
  const apiUrl = getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: pass })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Invalid email or password.');
    }
    const user: User = data.user;
    const token: string = data.token;

    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      setAuthToken(token);
    }
    return user;
  } catch (err: any) {
    throw err;
  }
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  clearAuthToken();
}

export async function getUserChatsAsync(userId: string): Promise<SavedChat[]> {
  const apiUrl = getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/chats/${userId}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const serverChats: SavedChat[] = data.chats || [];
      if (typeof window !== 'undefined') {
        localStorage.setItem(CHATS_PREFIX + userId, JSON.stringify(serverChats));
      }
      return serverChats;
    }
    // If 401, token expired — auto-logout
    if (res.status === 401) {
      logout();
    }
  } catch (e) {
    console.warn("Backend chats fetch notice:", e);
  }
  return getUserChatsLocal(userId);
}

export function getUserChatsLocal(userId: string): SavedChat[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CHATS_PREFIX + userId);
    if (!raw) return [];
    const chats: SavedChat[] = JSON.parse(raw);
    return chats.filter(c => c.messages && c.messages.some(m => m.role === 'user'));
  } catch (e) {
    return [];
  }
}

export async function saveUserChatAsync(userId: string, chat: SavedChat): Promise<SavedChat[]> {
  const hasUserMsg = chat.messages && chat.messages.some(m => m.role === 'user');
  if (!hasUserMsg) return getUserChatsLocal(userId);

  const localChats = saveUserChatLocal(userId, chat);

  const apiUrl = getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/chats/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(chat)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.chats) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(CHATS_PREFIX + userId, JSON.stringify(data.chats));
        }
        return data.chats;
      }
    }
    if (res.status === 401) {
      logout();
    }
  } catch (e) {
    console.warn("Backend chat save notice:", e);
  }
  return localChats;
}

export function saveUserChatLocal(userId: string, chat: SavedChat): SavedChat[] {
  if (typeof window === 'undefined') return [];
  const chats = getUserChatsLocal(userId);
  const existingIdx = chats.findIndex(c => c.id === chat.id);
  if (existingIdx >= 0) {
    chats[existingIdx] = chat;
  } else {
    chats.unshift(chat);
  }
  chats.sort((a, b) => b.updatedAt - a.updatedAt);
  localStorage.setItem(CHATS_PREFIX + userId, JSON.stringify(chats));
  return chats;
}

export async function deleteUserChatAsync(userId: string, chatId: string): Promise<SavedChat[]> {
  const localChats = deleteUserChatLocal(userId, chatId);

  const apiUrl = getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/chats/${userId}/${chatId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data.chats) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(CHATS_PREFIX + userId, JSON.stringify(data.chats));
        }
        return data.chats;
      }
    }
    if (res.status === 401) {
      logout();
    }
  } catch (e) {
    console.warn("Backend chat delete notice:", e);
  }
  return localChats;
}

export function deleteUserChatLocal(userId: string, chatId: string): SavedChat[] {
  if (typeof window === 'undefined') return [];
  const chats = getUserChatsLocal(userId).filter(c => c.id !== chatId);
  localStorage.setItem(CHATS_PREFIX + userId, JSON.stringify(chats));
  return chats;
}
