import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar as CalendarIcon, TrendingUp, Sparkles, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { persona } = useTheme();

  const tabs = [
    { id: 'home', icon: Home, label: t('homeNav'), path: '/' },
    { id: 'calendar', icon: CalendarIcon, label: t('calendar'), path: '/calendar' },
    { id: 'beauty', icon: Sparkles, label: t('beauty.nav'), path: '/beauty' },
    { id: 'stats', icon: TrendingUp, label: t('stats'), path: '/stats' },
    { id: 'profile', icon: User, label: t('profile'), path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 z-50 shadow-lg">
      {/* Active indicator line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center gap-1 min-w-[64px] h-full group"
            >
              {/* Active background glow */}
              {isActive && (
                <div className="absolute inset-0 bg-primary/5 rounded-2xl animate-fade-in" />
              )}
              
              {/* Icon container */}
              <div className="relative">
                {/* Glow effect for active state */}
                {isActive && (
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                )}
                
                <div
                  className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-primary shadow-lg scale-110'
                      : 'bg-transparent group-hover:bg-muted/50 group-hover:scale-105'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive 
                        ? 'text-primary-foreground' 
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                
                {/* Active dot indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-fade-in" />
                )}
              </div>
              
              {/* Label */}
              <span
                className={`text-[10px] font-medium transition-all duration-300 ${
                  isActive 
                    ? 'text-foreground' 
                    : 'text-muted-foreground group-hover:text-foreground'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
