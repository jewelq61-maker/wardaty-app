import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, AuthSession, getSession, clearSession } from '@/services/auth';

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  logout: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const existingSession = getSession();
    if (existingSession) {
      setSession(existingSession);
      setUser(existingSession.user);
    }
    setLoading(false);

    // Listen for storage events (for cross-tab logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wardiya_session') {
        if (e.newValue) {
          try {
            const newSession = JSON.parse(e.newValue);
            setSession(newSession);
            setUser(newSession.user);
          } catch {
            setSession(null);
            setUser(null);
          }
        } else {
          setSession(null);
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    clearSession();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};