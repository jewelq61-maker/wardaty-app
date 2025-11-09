import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar as CalendarIcon, TrendingUp, Sparkles, User, Plus } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const leftTabs = [
    { id: 'home', icon: Home, label: t('homeNav'), path: '/' },
    { id: 'stats', icon: TrendingUp, label: t('stats'), path: '/stats' },
  ];

  const rightTabs = [
    { id: 'beauty', icon: Sparkles, label: t('beauty.nav'), path: '/beauty' },
    { id: 'profile', icon: User, label: t('profile'), path: '/profile' },
  ];

  const centerAction = { id: 'calendar', icon: CalendarIcon, label: t('calendar'), path: '/calendar' };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="relative max-w-lg mx-auto px-4 pb-4">
        {/* Backdrop blur effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none" />
        
        <nav className="relative flex items-end justify-center gap-2">
          {/* Left section */}
          <div className="flex-1 flex items-center justify-around h-14 bg-background/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg px-2">
            {leftTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = location.pathname === tab.path;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`group relative flex flex-col items-center justify-center flex-1 h-full transition-all ${
                    isActive ? 'scale-110' : 'scale-100 active:scale-95'
                  }`}
                >
                  {/* Active background blob */}
                  {isActive && (
                    <div className="absolute inset-x-2 inset-y-1.5 bg-primary/10 rounded-xl animate-fade-in" />
                  )}
                  
                  <IconComponent
                    className={`relative w-5 h-5 transition-all duration-300 ${
                      isActive 
                        ? 'text-primary' 
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  <span
                    className={`relative text-[10px] font-medium mt-0.5 transition-all duration-300 ${
                      isActive 
                        ? 'text-primary opacity-100' 
                        : 'text-muted-foreground opacity-60 group-hover:opacity-100'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Center floating action button */}
          <button
            onClick={() => navigate(centerAction.path)}
            className={`relative flex items-center justify-center w-14 h-14 -mb-2 rounded-2xl shadow-2xl transition-all duration-300 ${
              location.pathname === centerAction.path
                ? 'bg-primary scale-110'
                : 'bg-gradient-to-br from-primary to-primary/80 hover:scale-105 active:scale-95'
            }`}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-lg animate-pulse" />
            
            <CalendarIcon
              className="relative w-6 h-6 text-primary-foreground"
              strokeWidth={2.5}
            />
            
            {/* Pulse ring */}
            {location.pathname === centerAction.path && (
              <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-ping" style={{ animationDuration: '2s' }} />
            )}
          </button>

          {/* Right section */}
          <div className="flex-1 flex items-center justify-around h-14 bg-background/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg px-2">
            {rightTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = location.pathname === tab.path;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`group relative flex flex-col items-center justify-center flex-1 h-full transition-all ${
                    isActive ? 'scale-110' : 'scale-100 active:scale-95'
                  }`}
                >
                  {/* Active background blob */}
                  {isActive && (
                    <div className="absolute inset-x-2 inset-y-1.5 bg-primary/10 rounded-xl animate-fade-in" />
                  )}
                  
                  <IconComponent
                    className={`relative w-5 h-5 transition-all duration-300 ${
                      isActive 
                        ? 'text-primary' 
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  <span
                    className={`relative text-[10px] font-medium mt-0.5 transition-all duration-300 ${
                      isActive 
                        ? 'text-primary opacity-100' 
                        : 'text-muted-foreground opacity-60 group-hover:opacity-100'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
