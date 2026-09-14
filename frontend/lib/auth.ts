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
  schemes: { name: string; eligibility_match: string }[];
  updatedAt: number;
}

const SESSION_KEY = 'amrit_chidiya_user_session';
const USERS_DB_KEY = 'amrit_chidiya_registered_users';
const CHATS_PREFIX = 'amrit_chidiya_chats_';

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Error reading session:", e);
    return null;
  }
}

export function signUp(email: string, name: string, pass: string): User {
  const users = getRegisteredUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const newUser: User = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    email: email.trim(),
    name: name.trim() || email.split('@')[0],
  };

  users.push({ ...newUser, pass });
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  return newUser;
}

export function login(email: string, pass: string): User {
  const users = getRegisteredUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.pass === pass);
  if (!found) {
    throw new Error('Invalid email or password.');
  }

  const user: User = { id: found.id, email: found.email, name: found.name };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

function getRegisteredUsers(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getUserChats(userId: string): SavedChat[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CHATS_PREFIX + userId);
    if (!raw) return [];
    const chats: SavedChat[] = JSON.parse(raw);

    // Filter out chats with no user messages or invalid/undefined titles
    const validChats = chats.filter(c => {
      const hasUserMsg = c.messages && c.messages.some(m => m.role === 'user');
      const hasValidTitle = c.title && !c.title.includes('undefined');
      return hasUserMsg && hasValidTitle;
    });

    if (validChats.length !== chats.length) {
      localStorage.setItem(CHATS_PREFIX + userId, JSON.stringify(validChats));
    }
    return validChats;
  } catch (e) {
    console.error("Error reading user chats:", e);
    return [];
  }
}

export function saveUserChat(userId: string, chat: SavedChat): SavedChat[] {
  if (typeof window === 'undefined') return [];
  
  // Do not save chats that have no user messages!
  const hasUserMsg = chat.messages && chat.messages.some(m => m.role === 'user');
  if (!hasUserMsg) {
    return getUserChats(userId);
  }

  const chats = getUserChats(userId);
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

export function deleteUserChat(userId: string, chatId: string): SavedChat[] {
  if (typeof window === 'undefined') return [];
  const chats = getUserChats(userId).filter(c => c.id !== chatId);
  localStorage.setItem(CHATS_PREFIX + userId, JSON.stringify(chats));
  return chats;
}
