import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { HealthKitService } from '@/services/healthkit-service';

interface HealthData {
  steps?: number;
  weight?: number;
  sleepMinutes?: number;
  heartRate?: number;
}

export const useAppleHealth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const available = await HealthKitService.isAvailable();
    setIsAvailable(available);
  };

  const connectToHealth = async (): Promise<boolean> => {
    if (!isAvailable) {
      toast({
        title: 'غير متوفر',
        description: 'Apple Health متوفر فقط على أجهزة iOS',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const authorized = await HealthKitService.requestAuthorization();

      if (authorized) {
        setIsConnected(true);
        toast({
          title: 'تم الربط بنجاح',
          description: 'تم ربط التطبيق مع Apple Health بنجاح',
        });
        return true;
      } else {
        toast({
          title: 'لم يتم السماح',
          description: 'يرجى السماح بالوصول إلى Apple Health من الإعدادات',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Health connection error:', error);
      toast({
        title: 'فشل الربط',
        description: 'حدث خطأ أثناء الربط مع Apple Health',
        variant: 'destructive',
      });
      return false;
    }
  };

  const syncHealthData = async (): Promise<HealthData | null> => {
    if (!isConnected) {
      const connected = await connectToHealth();
      if (!connected) return null;
    }

    setIsSyncing(true);

    try {
      // Fetch real data from HealthKit
      const [stepsData, weightData, sleepData, heartRateData] = await Promise.all([
        HealthKitService.getSteps(),
        HealthKitService.getWeight(),
        HealthKitService.getSleep(),
        HealthKitService.getHeartRate(),
      ]);

      const healthData: HealthData = {
        steps: stepsData.value,
        weight: weightData.hasData ? weightData.value : undefined,
        sleepMinutes: sleepData.hasData ? sleepData.value : undefined,
        heartRate: heartRateData.hasData ? heartRateData.value : undefined,
      };

      // Save data to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const today = new Date().toISOString().split('T')[0];

        const notesParts: string[] = [];
        if (healthData.steps !== undefined) notesParts.push(`الخطوات: ${healthData.steps}`);
        if (healthData.sleepMinutes !== undefined) notesParts.push(`النوم: ${healthData.sleepMinutes} دقيقة`);
        if (healthData.heartRate !== undefined) notesParts.push(`النبض: ${healthData.heartRate}`);
        if (healthData.weight !== undefined) notesParts.push(`الوزن: ${healthData.weight} كجم`);

        await supabase
          .from('cycle_days')
          .upsert({
            user_id: user.id,
            date: today,
            notes: notesParts.join(' | '),
          }, {
            onConflict: 'user_id,date'
          });

        toast({
          title: 'تمت المزامنة',
          description: `تم مزامنة ${healthData.steps ?? 0} خطوة${healthData.sleepMinutes ? ` و ${healthData.sleepMinutes} دقيقة نوم` : ''}`,
        });
      }

      return healthData;
    } catch (error) {
      console.error('Error syncing health data:', error);
      toast({
        title: 'خطأ في المزامنة',
        description: 'حدث خطأ أثناء مزامنة البيانات',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isAvailable,
    isConnected,
    isSyncing,
    connectToHealth,
    syncHealthData,
  };
};
