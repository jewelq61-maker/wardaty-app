import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BottomNav from '@/components/BottomNav';

export default function Stats() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg z-10 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-to-br from-single-primary to-married-primary text-white">
              {user?.email?.[0].toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <button className="p-2 hover:bg-muted rounded-full transition-colors relative">
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold">{t('stats')}</h1>
        
        <Card className="glass shadow-elegant">
          <CardHeader>
            <CardTitle>{t('stats')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
