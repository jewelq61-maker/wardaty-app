import { db } from '@/db/client';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  persona: string;
  locale: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

const SESSION_KEY = 'wardiya_session';

// Get current session from localStorage
export const getSession = (): AuthSession | null => {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;
  
  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
};

// Save session to localStorage
const saveSession = (session: AuthSession) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

// Clear session
export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// Login
export const login = async (email: string, password: string): Promise<AuthSession> => {
  const user = db.select().from(profiles).where(eq(profiles.email, email)).get();
  
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    persona: user.persona,
    locale: user.locale,
  };

  const session: AuthSession = {
    user: authUser,
    token: btoa(`${user.id}:${Date.now()}`), // Simple token for demo
  };

  saveSession(session);
  return session;
};

// Signup
export const signup = async (email: string, password: string): Promise<AuthSession> => {
  // Check if user exists
  const existingUser = db.select().from(profiles).where(eq(profiles.email, email)).get();
  
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Generate UUID for new user
  const userId = crypto.randomUUID();

  // Create user
  db.insert(profiles).values({
    id: userId,
    email,
    password: passwordHash,
    persona: 'single',
    locale: 'ar', // Default to Arabic
  }).run();

  // Get created user
  const user = db.select().from(profiles).where(eq(profiles.id, userId)).get();

  if (!user) {
    throw new Error('Failed to create user');
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    persona: user.persona,
    locale: user.locale,
  };

  const session: AuthSession = {
    user: authUser,
    token: btoa(`${user.id}:${Date.now()}`),
  };

  saveSession(session);
  return session;
};

// Logout
export const logout = () => {
  clearSession();
};

// Update profile
export const updateProfile = (userId: string, data: Partial<typeof profiles.$inferInsert>) => {
  db.update(profiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(profiles.id, userId))
    .run();

  // Update session if exists
  const session = getSession();
  if (session && session.user.id === userId) {
    const updatedUser = db.select().from(profiles).where(eq(profiles.id, userId)).get();
    if (updatedUser) {
      session.user = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        persona: updatedUser.persona,
        locale: updatedUser.locale,
      };
      saveSession(session);
    }
  }
};
