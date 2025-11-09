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

  const activeIndex = tabs.findIndex(tab => tab.path === location.pathname);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-lg mx-auto px-6 pb-6">
        <nav className="relative pointer-events-auto bg-background/95 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-single-primary/5 via-married-primary/5 to-mother-primary/5 animate-pulse" />
          
          {/* Sliding active indicator */}
          <div 
            className="absolute top-2 bottom-2 w-[calc(20%-8px)] bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg transition-all duration-500 ease-out"
            style={{ 
              left: `calc(${activeIndex * 20}% + 4px)`,
              transform: 'translateZ(0)',
            }}
          />
          
          <div className="relative flex items-center justify-around h-16 px-2">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = index === activeIndex;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className="relative flex flex-col items-center justify-center w-full h-full group transition-transform active:scale-95"
                >
                  <Icon
                    className={`w-6 h-6 transition-all duration-300 ${
                      isActive 
                        ? 'text-primary-foreground scale-110' 
                        : 'text-muted-foreground group-hover:text-foreground group-hover:scale-105'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Label - only show for active */}
                  <span
                    className={`absolute -bottom-5 text-[10px] font-medium whitespace-nowrap transition-all duration-300 ${
                      isActive 
                        ? 'opacity-100 translate-y-0 text-primary' 
                        : 'opacity-0 translate-y-2 text-muted-foreground'
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
