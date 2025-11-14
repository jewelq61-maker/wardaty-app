import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'light' | 'dark';
type Persona = 'single' | 'married' | 'mother' | 'partner';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  persona: Persona;
  setPersona: (persona: Persona) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('light');
  const [persona, setPersonaState] = useState<Persona>('single');

  useEffect(() => {
    // Load theme and persona from localStorage on mount
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedPersona = localStorage.getItem('selectedPersona') as Persona;
    
    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setThemeState(defaultTheme);
      applyTheme(defaultTheme);
    }

    if (savedPersona) {
      setPersonaState(savedPersona);
      applyPersona(savedPersona);
    }
  }, []);

  useEffect(() => {
    // Load theme and persona from database when user logs in
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('theme, persona')
      .eq('id', user.id)
      .single();

    if (data?.theme) {
      const dbTheme = data.theme as Theme;
      setThemeState(dbTheme);
      applyTheme(dbTheme);
      localStorage.setItem('theme', dbTheme);
    }

    if (data?.persona) {
      const dbPersona = data.persona as Persona;
      setPersonaState(dbPersona);
      applyPersona(dbPersona);
      localStorage.setItem('selectedPersona', dbPersona);
    }
  };

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
  };

  const applyPersona = (newPersona: Persona) => {
    const root = document.documentElement;
    root.setAttribute('data-persona', newPersona);
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Update database if user is logged in
    if (user) {
      await supabase
        .from('profiles')
        .update({ theme: newTheme })
        .eq('id', user.id);
    }
  };

  const setPersona = async (newPersona: Persona) => {
    setPersonaState(newPersona);
    applyPersona(newPersona);
    localStorage.setItem('selectedPersona', newPersona);

    // Update database if user is logged in
    if (user) {
      await supabase
        .from('profiles')
        .update({ persona: newPersona })
        .eq('id', user.id);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, persona, setPersona }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
