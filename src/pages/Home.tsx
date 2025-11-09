import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Sparkles, Moon, Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import BottomNav from '@/components/BottomNav';
import UpcomingBeautyWidget from '@/components/UpcomingBeautyWidget';
import CyclePredictionsWidget from '@/components/CyclePredictionsWidget';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-gradient-to-br from-single-primary to-married-primary text-white">
            {user?.email?.[0].toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <button className="p-2 hover:bg-muted rounded-full transition-colors relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-period rounded-full"></span>
        </button>
      </div>

      {/* Greeting Card */}
      <Card className="glass shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t('greeting', { name: user?.email?.split('@')[0] || t('user') })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            {t('welcomeMessage')}
          </div>
        </CardContent>
      </Card>

      {/* Phase Card */}
      <Card className="glass shadow-elegant bg-gradient-to-br from-single-primary/20 to-married-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">{t('currentPhase')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {t('follicular')}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {t('daysToNextPeriod')}: <span className="font-bold">14</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          className="h-24 flex flex-col gap-2 glass shadow-elegant"
          onClick={() => navigate('/calendar')}
        >
          <CalendarDays className="h-6 w-6" />
          <span>{t('logToday')}</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-24 flex flex-col gap-2 glass shadow-elegant"
          onClick={() => navigate('/beauty')}
        >
          <Sparkles className="h-6 w-6" />
          <span>{t('beautyPlanner')}</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-24 flex flex-col gap-2 glass shadow-elegant"
          onClick={() => navigate('/fasting-qada')}
        >
          <Moon className="h-6 w-6" />
          <span>{t('fastingQada')}</span>
        </Button>
      </div>

      {/* Cycle Predictions Widget */}
      <CyclePredictionsWidget />

      {/* Upcoming Beauty Actions Widget */}
      <UpcomingBeautyWidget />

      <BottomNav />
    </div>
  );
}