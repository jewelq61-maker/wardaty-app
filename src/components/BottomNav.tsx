import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar as CalendarIcon, TrendingUp, BookOpen, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { id: 'profile', icon: User, label: t('profile'), path: '/profile' },
    { id: 'stats', icon: TrendingUp, label: t('stats'), path: '/stats' },
    { id: 'articles', icon: BookOpen, label: t('articles'), path: '/articles' },
    { id: 'calendar', icon: CalendarIcon, label: t('calendar'), path: '/calendar' },
    { id: 'home', icon: Home, label: t('home'), path: '/' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50">
      <div className="flex items-center justify-around h-20 px-4 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-1 min-w-[60px] transition-colors"
            >
              <div
                className={`p-2 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-single-primary to-married-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${isActive ? 'text-white' : ''}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={`text-xs ${
                  isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
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
