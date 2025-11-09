import { useTranslation } from 'react-i18next';
import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: t('success'),
      description: t('logout'),
    });
    navigate('/auth');
  };

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
        <h1 className="text-2xl font-bold">{t('profile')}</h1>
        
        <Card className="glass shadow-elegant">
          <CardHeader>
            <CardTitle>{user?.email}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
