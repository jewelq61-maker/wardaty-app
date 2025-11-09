import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar as CalendarIcon, TrendingUp, Sparkles, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { id: 'home', icon: Home, label: t('homeNav'), path: '/' },
    { id: 'calendar', icon: CalendarIcon, label: t('calendar'), path: '/calendar' },
    { id: 'beauty', icon: Sparkles, label: t('beauty.nav'), path: '/beauty' },
    { id: 'stats', icon: TrendingUp, label: t('stats'), path: '/stats' },
    { id: 'profile', icon: User, label: t('profile'), path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Gradient fade background */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
      
      <nav className="relative max-w-lg mx-auto px-6 pb-6">
        <div className="flex items-center justify-center gap-2 p-2 bg-background/60 backdrop-blur-2xl border border-border/40 rounded-full shadow-2xl">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = location.pathname === tab.path;
            
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-500 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95'
                }`}
              >
                {/* Icon glow effect */}
                {isActive && (
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                )}
                
                <IconComponent
                  className={`relative w-5 h-5 transition-all duration-300 ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {/* Label with smooth expansion */}
                <span
                  className={`relative text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-500 ${
                    isActive 
                      ? 'max-w-24 opacity-100' 
                      : 'max-w-0 opacity-0'
                  }`}
                >
                  {tab.label}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary-foreground rounded-full animate-fade-in" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
